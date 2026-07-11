#!/usr/bin/env python3
"""WPA public-site image and layout optimizer.

Processes only canonical public pages listed in sitemap.xml.
- creates WebP siblings for local PNG/JPEG images;
- wraps local raster images in <picture> with a WebP source;
- adds intrinsic width/height where the source image can be resolved;
- adds decoding=async and safe lazy/eager loading hints;
- injects the shared GA4/CLS performance module exactly once.

The transformation is idempotent and intentionally leaves SVG, GIF, external,
data and dynamically generated images unchanged.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import xml.etree.ElementTree as ET

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit("Pillow is required: pip install Pillow") from exc

ROOT = Path(__file__).resolve().parents[1]
BASE_HOST = "worldprotocolacademy-code.github.io"
PERFORMANCE_SCRIPT = '<script defer src="/scripts/wpa-performance.js?v=1.0"></script>'
RASTER_SUFFIXES = {".png", ".jpg", ".jpeg"}
SKIP_DIRS = {".git", "node_modules", "vendor"}
IMG_RE = re.compile(r"<img\b[^>]*>", re.I | re.S)
ATTR_RE = re.compile(r"([:\w-]+)(?:\s*=\s*(\"[^\"]*\"|'[^']*'|[^\s>]+))?", re.S)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8", newline="\n")


def parse_attrs(tag: str) -> list[tuple[str, str | None]]:
    inner = re.sub(r"^<img\b|/?>$", "", tag.strip(), flags=re.I | re.S)
    attrs: list[tuple[str, str | None]] = []
    for match in ATTR_RE.finditer(inner):
        key = match.group(1)
        raw = match.group(2)
        if raw is None:
            value = None
        elif raw[:1] in {'"', "'"}:
            value = raw[1:-1]
        else:
            value = raw
        attrs.append((key, value))
    return attrs


def attrs_dict(attrs: list[tuple[str, str | None]]) -> dict[str, str | None]:
    return {key.lower(): value for key, value in attrs}


def render_img(attrs: list[tuple[str, str | None]]) -> str:
    rendered = []
    for key, value in attrs:
        if value is None:
            rendered.append(key)
        else:
            escaped = value.replace("&", "&amp;").replace('"', "&quot;")
            rendered.append(f'{key}="{escaped}"')
    return "<img " + " ".join(rendered) + ">"


def set_attr(attrs: list[tuple[str, str | None]], name: str, value: str) -> None:
    for index, (key, _) in enumerate(attrs):
        if key.lower() == name.lower():
            attrs[index] = (key, value)
            return
    attrs.append((name, value))


def has_attr(attrs: list[tuple[str, str | None]], name: str) -> bool:
    return any(key.lower() == name.lower() for key, _ in attrs)


def public_pages() -> list[Path]:
    tree = ET.parse(ROOT / "sitemap.xml")
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    pages: list[Path] = []
    for loc in tree.findall(".//sm:loc", ns):
        if not loc.text:
            continue
        parsed = urlparse(loc.text.strip())
        if parsed.netloc and parsed.netloc != BASE_HOST:
            continue
        path = unquote(parsed.path or "/")
        candidate = ROOT / ("index.html" if path == "/" else path.lstrip("/"))
        if path.endswith("/"):
            candidate = candidate / "index.html"
        if candidate.is_file() and candidate.suffix.lower() == ".html":
            pages.append(candidate)
    return sorted(set(pages))


def resolve_local_image(page: Path, src: str) -> Path | None:
    if not src or src.startswith(("data:", "blob:", "//")):
        return None
    parsed = urlparse(src)
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc != BASE_HOST:
            return None
        rel = unquote(parsed.path.lstrip("/"))
        candidate = ROOT / rel
    elif src.startswith("/"):
        candidate = ROOT / unquote(parsed.path.lstrip("/"))
    else:
        candidate = page.parent / unquote(parsed.path)
    try:
        candidate = candidate.resolve()
        candidate.relative_to(ROOT.resolve())
    except (ValueError, OSError):
        return None
    return candidate if candidate.is_file() and candidate.suffix.lower() in RASTER_SUFFIXES else None


def src_for_webp(src: str) -> str:
    parsed = urlparse(src)
    path = parsed.path
    webp_path = str(Path(path).with_suffix(".webp")).replace("\\", "/")
    suffix = ("?" + parsed.query if parsed.query else "") + ("#" + parsed.fragment if parsed.fragment else "")
    if parsed.scheme:
        return parsed._replace(path=webp_path, query="", fragment="").geturl() + suffix
    return webp_path + suffix


def image_dimensions(path: Path) -> tuple[int, int] | None:
    try:
        with Image.open(path) as image:
            return image.size
    except Exception:
        return None


def convert_webp(source: Path, quality: int, force: bool) -> bool:
    target = source.with_suffix(".webp")
    if target.exists() and not force and target.stat().st_mtime >= source.stat().st_mtime:
        return False
    with Image.open(source) as image:
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        save_args = {"format": "WEBP", "quality": quality, "method": 6}
        if image.mode == "RGBA":
            save_args["lossless"] = True
        image.save(target, **save_args)
    return True


def is_priority_image(index: int, attr_map: dict[str, str | None]) -> bool:
    hints = " ".join(str(attr_map.get(key) or "") for key in ("id", "class", "data-role", "fetchpriority", "alt")).lower()
    return index == 0 or any(token in hints for token in ("hero", "lcp", "brand", "logo"))


def optimize_img(page: Path, tag: str, index: int, quality: int, force: bool, stats: dict[str, int]) -> str:
    attrs = parse_attrs(tag)
    attr_map = attrs_dict(attrs)
    src = str(attr_map.get("src") or "")
    source = resolve_local_image(page, src)

    if not has_attr(attrs, "decoding"):
        set_attr(attrs, "decoding", "async")
    if not has_attr(attrs, "loading"):
        set_attr(attrs, "loading", "eager" if is_priority_image(index, attr_map) else "lazy")
    if is_priority_image(index, attr_map) and not has_attr(attrs, "fetchpriority"):
        set_attr(attrs, "fetchpriority", "high")

    if source:
        dimensions = image_dimensions(source)
        if dimensions:
            if not has_attr(attrs, "width"):
                set_attr(attrs, "width", str(dimensions[0]))
            if not has_attr(attrs, "height"):
                set_attr(attrs, "height", str(dimensions[1]))
        if convert_webp(source, quality, force):
            stats["webp_created"] += 1
        rendered = render_img(attrs)
        webp_src = src_for_webp(src).replace("&", "&amp;").replace('"', "&quot;")
        stats["images_optimized"] += 1
        return f'<picture class="wpa-picture"><source srcset="{webp_src}" type="image/webp">{rendered}</picture>'

    stats["images_hardened"] += 1
    return render_img(attrs)


def inject_performance_script(text: str) -> tuple[str, bool]:
    if "wpa-performance.js" in text:
        return text, False
    match = re.search(r"</head\s*>", text, flags=re.I)
    if not match:
        return text, False
    return text[:match.start()] + PERFORMANCE_SCRIPT + "\n" + text[match.start():], True


def optimize_page(page: Path, quality: int, force: bool, stats: dict[str, int]) -> bool:
    original = read(page)
    image_index = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal image_index
        prefix = original[max(0, match.start() - 120):match.start()].lower()
        if "<picture" in prefix and prefix.rfind("<picture") > prefix.rfind("</picture"):
            image_index += 1
            return match.group(0)
        value = optimize_img(page, match.group(0), image_index, quality, force, stats)
        image_index += 1
        return value

    updated = IMG_RE.sub(replace, original)
    updated, injected = inject_performance_script(updated)
    if injected:
        stats["scripts_injected"] += 1
    if updated != original:
        write(page, updated)
        stats["pages_changed"] += 1
        return True
    return False


def update_analytics_config(measurement_id: str | None) -> bool:
    if not measurement_id:
        return False
    if not re.fullmatch(r"G-[A-Z0-9]{6,20}", measurement_id.strip(), re.I):
        raise SystemExit("Invalid GA4 Measurement ID. Expected format G-XXXXXXXXXX")
    path = ROOT / "config" / "analytics.json"
    config = json.loads(read(path)) if path.exists() else {}
    config["measurementId"] = measurement_id.strip().upper()
    config.setdefault("consentRequired", True)
    write(path, json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quality", type=int, default=82)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--measurement-id", default="")
    parser.add_argument("--check", action="store_true", help="Fail when running the optimizer would change tracked files")
    args = parser.parse_args()
    if not 1 <= args.quality <= 100:
        parser.error("--quality must be between 1 and 100")

    update_analytics_config(args.measurement_id or None)
    stats = {key: 0 for key in ("pages_changed", "images_optimized", "images_hardened", "webp_created", "scripts_injected")}
    for page in public_pages():
        optimize_page(page, args.quality, args.force, stats)

    print(json.dumps(stats, indent=2))
    if args.check and (stats["pages_changed"] or stats["webp_created"]):
        print("Optimization drift detected. Run scripts/optimize_site_media.py and commit the output.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
