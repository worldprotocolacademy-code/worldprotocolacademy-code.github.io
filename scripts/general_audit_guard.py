#!/usr/bin/env python3
"""General WPA audit guard for public-site regressions."""
from __future__ import annotations

import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://worldprotocolacademy-code.github.io"


class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.images: list[dict[str, str]] = []
        self.buttons: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.metas: list[dict[str, str]] = []
        self._button_depth = 0
        self._button_text: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        data = {str(k).lower(): str(v or "") for k, v in attrs}
        tag = tag.lower()
        if tag == "img":
            self.images.append(data)
        elif tag == "a":
            self.links.append(data)
        elif tag == "meta":
            self.metas.append(data)
        elif tag == "button":
            self._button_depth += 1
            self._button_text = []
            self.buttons.append(data)

    def handle_data(self, data: str) -> None:
        if self._button_depth:
            self._button_text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "button" and self._button_depth:
            text = " ".join("".join(self._button_text).split())
            self.buttons[-1]["__text"] = text
            self._button_depth -= 1
            self._button_text = []


def parse(path: Path) -> AuditParser:
    parser = AuditParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    return parser


def sitemap_pages() -> list[Path]:
    tree = ET.parse(ROOT / "sitemap.xml")
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    pages: list[Path] = []
    for node in tree.findall(".//sm:loc", ns):
        if not node.text:
            continue
        parsed = urlparse(node.text.strip())
        path = unquote(parsed.path or "/")
        candidate = ROOT / ("index.html" if path == "/" else path.lstrip("/"))
        if path.endswith("/"):
            candidate /= "index.html"
        if candidate.is_file():
            pages.append(candidate)
    return sorted(set(pages))


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def main() -> int:
    errors: list[str] = []

    # Repository hygiene.
    leaked = [p for p in ROOT.rglob("*") if p.is_file() and (p.suffix == ".pyc" or "__pycache__" in p.parts)]
    for path in leaked:
        fail(errors, f"Generated Python cache is tracked: {path.relative_to(ROOT)}")
    ignore = ROOT / ".gitignore"
    if not ignore.exists() or "__pycache__/" not in ignore.read_text(errors="replace"):
        fail(errors, ".gitignore must exclude __pycache__/ and *.pyc")

    # Branded 404 baseline.
    page404 = ROOT / "404.html"
    if not page404.exists():
        fail(errors, "Missing 404.html")
    else:
        text404 = page404.read_text(encoding="utf-8", errors="replace").lower()
        for marker in ('name="robots"', "noindex", "<main", 'href="/"', "world protocol academy"):
            if marker not in text404:
                fail(errors, f"404.html missing required marker: {marker}")

    # Sitemap pages must remain indexable and media/button-safe.
    for page in sitemap_pages():
        parser = parse(page)
        rel = page.relative_to(ROOT)
        robots = " ".join(m.get("content", "") for m in parser.metas if m.get("name", "").lower() == "robots").lower()
        if "noindex" in robots:
            fail(errors, f"Sitemap includes noindex page: {rel}")
        for index, image in enumerate(parser.images):
            src = image.get("src", "")
            if not src:
                fail(errors, f"{rel}: image without src")
            if "alt" not in image:
                fail(errors, f"{rel}: image without alt: {src}")
            if "width" not in image or "height" not in image:
                fail(errors, f"{rel}: image lacks intrinsic dimensions: {src}")
            if index > 0 and image.get("loading", "").lower() not in {"lazy", "eager"}:
                fail(errors, f"{rel}: non-priority image lacks loading hint: {src}")
            if image.get("decoding", "").lower() not in {"async", "sync", "auto"}:
                fail(errors, f"{rel}: image lacks decoding hint: {src}")
        for button in parser.buttons:
            label = button.get("aria-label", "").strip() or button.get("title", "").strip() or button.get("__text", "").strip()
            if not label:
                fail(errors, f"{rel}: unlabeled button")
            if button.get("type", "").lower() not in {"", "button", "submit", "reset"}:
                fail(errors, f"{rel}: invalid button type: {button.get('type')}")
        for link in parser.links:
            href = link.get("href", "").strip()
            if not href or href == "#" or href.lower().startswith("javascript:"):
                fail(errors, f"{rel}: empty, placeholder or javascript link")

    # Governed Student Desk must stay out of public sitemap while noindex.
    sitemap_text = (ROOT / "sitemap.xml").read_text(encoding="utf-8", errors="replace")
    desk = ROOT / "student-desk" / "index.html"
    if desk.exists() and "noindex" in desk.read_text(encoding="utf-8", errors="replace").lower():
        if f"{BASE}/student-desk/" in sitemap_text:
            fail(errors, "noindex Student Desk must not be listed in sitemap.xml")

    if errors:
        print("WPA General Audit Guard failed:\n")
        for number, error in enumerate(errors, 1):
            print(f"{number}. {error}")
        return 1
    print("WPA General Audit Guard passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
