#!/usr/bin/env python3
"""
WPA Site Quality Check

Checks:
- sitemap.xml is valid XML
- sitemap is public-only and contains no internal/private/work-tool URLs
- each sitemap URL maps to an existing local file or directory index
- robots.txt points to the sitemap
- key noindex pages have noindex protection
- homepage does not publicly link to Student Desk
- local internal links in HTML files resolve to existing files
- basic SEO/accessibility checks: title, viewport, description, canonical, image alt
"""

from __future__ import annotations

import re
import sys
import html
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://worldprotocolacademy-code.github.io"

FORBIDDEN_SITEMAP_SUBSTRINGS = [
    "/ai/student-desk.html",
    "/wpaws/",
    "/test-modals.html",
    "/thanks.html",
    "/analytics-guide.html",
    "/monetization-checklist.html",
    "/promotion-playbook.html",
]

FORBIDDEN_PUBLIC_LINKS_IN_INDEX = [
    "ai/student-desk.html",
]

PUBLIC_SITEMAP_ALLOWLIST = {
    "/",
    "/programmes.html",
    "/certification.html",
    "/wpa-card.html",
    "/passive-revenue.html",
    "/papers.html",
    "/bibliography/",
    "/partnerships/index.html",
    "/book1-protocol.html",
    "/book2-conference.html",
    "/book3-diplomacy.html",
    "/book4-digital-era.html",
    "/protocol-professional-track.html",
    "/communication-presence-track.html",
    "/institutional-diplomatic-track.html",
    "/privacy.html",
    "/rights-takedown.html",
}

SKIP_LINK_SCHEMES = ("mailto:", "tel:", "javascript:", "data:", "#")
SKIP_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico",
    ".pdf", ".zip", ".mp3", ".mp4", ".webm", ".json", ".xml",
    ".css", ".js", ".txt",
}

# Local paths that are intentionally produced dynamically or hosted elsewhere.
LOCAL_LINK_ALLOWLIST = {
    "/wpaws/",
    "/wpaws/index.html",
}


class LinkAndMetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self._in_title = False
        self.metas = []
        self.links = []
        self.images = []
        self.anchors = []

    def handle_starttag(self, tag: str, attrs):
        attrs_dict = {k.lower(): (v or "") for k, v in attrs}
        tag = tag.lower()

        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            self.metas.append(attrs_dict)
        elif tag == "link":
            self.links.append(attrs_dict)
        elif tag == "img":
            self.images.append(attrs_dict)
        elif tag == "a":
            self.anchors.append(attrs_dict)

    def handle_endtag(self, tag: str):
        if tag.lower() == "title":
            self._in_title = False

    def handle_data(self, data: str):
        if self._in_title:
            self.title += data


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def path_for_public_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.netloc and parsed.netloc != "worldprotocolacademy-code.github.io":
        return ""
    path = parsed.path or "/"
    return unquote(path)


def local_path_exists(public_path: str) -> bool:
    if public_path in LOCAL_LINK_ALLOWLIST:
        return True

    clean = public_path.split("?", 1)[0].split("#", 1)[0]
    if clean == "/":
        return (ROOT / "index.html").exists()

    rel = clean.lstrip("/")
    candidate = ROOT / rel

    if clean.endswith("/"):
        return (candidate / "index.html").exists()

    if candidate.exists():
        return True

    # Allow extensionless links to directories with index.html.
    if "." not in Path(rel).name:
        return (candidate / "index.html").exists()

    return False


def check_sitemap(errors: list[str]) -> None:
    sitemap_path = ROOT / "sitemap.xml"
    if not sitemap_path.exists():
        fail("Missing sitemap.xml", errors)
        return

    try:
        tree = ET.parse(sitemap_path)
    except ET.ParseError as exc:
        fail(f"sitemap.xml is not valid XML: {exc}", errors)
        return

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [el.text.strip() for el in tree.findall(".//sm:loc", ns) if el.text and el.text.strip()]
    if not locs:
        fail("sitemap.xml contains no <loc> entries", errors)

    seen = set()
    for loc in locs:
        if loc in seen:
            fail(f"Duplicate sitemap URL: {loc}", errors)
        seen.add(loc)

        if not loc.startswith(BASE_URL):
            fail(f"Sitemap URL is not under {BASE_URL}: {loc}", errors)

        path = path_for_public_url(loc)
        if path not in PUBLIC_SITEMAP_ALLOWLIST:
            fail(f"Sitemap contains non-allowlisted public path: {path}", errors)

        for forbidden in FORBIDDEN_SITEMAP_SUBSTRINGS:
            if forbidden in loc:
                fail(f"Sitemap contains forbidden/internal URL: {loc}", errors)

        if not local_path_exists(path):
            fail(f"Sitemap URL does not map to an existing local file/index: {loc}", errors)


def check_robots(errors: list[str]) -> None:
    robots_path = ROOT / "robots.txt"
    if not robots_path.exists():
        fail("Missing robots.txt", errors)
        return

    text = read_text(robots_path)
    if "Sitemap: https://worldprotocolacademy-code.github.io/sitemap.xml" not in text:
        fail("robots.txt does not point to the canonical sitemap.xml", errors)

    if re.search(r"(?im)^\s*Disallow:\s*/\s*$", text):
        fail("robots.txt blocks the whole site with Disallow: /", errors)

    if re.search(r"(?im)^\s*Disallow:\s*/wpaws/?\s*$", text):
        fail("robots.txt should not Disallow /wpaws/; use noindex headers/meta instead", errors)


def parse_html_file(path: Path) -> LinkAndMetaParser:
    parser = LinkAndMetaParser()
    parser.feed(read_text(path))
    return parser


def has_meta(parser: LinkAndMetaParser, name: str, value_contains: str | None = None) -> bool:
    for meta in parser.metas:
        if meta.get("name", "").lower() == name.lower():
            if value_contains is None:
                return True
            return value_contains.lower() in meta.get("content", "").lower()
    return False


def has_canonical(parser: LinkAndMetaParser) -> bool:
    return any(link.get("rel", "").lower() == "canonical" and link.get("href") for link in parser.links)


def check_basic_html_quality(errors: list[str]) -> None:
    html_files = sorted(p for p in ROOT.rglob("*.html") if ".git" not in p.parts)
    if not html_files:
        fail("No HTML files found", errors)
        return

    for html_path in html_files:
        rel = html_path.relative_to(ROOT).as_posix()
        text = read_text(html_path)
        parser = parse_html_file(html_path)

        if "<html" not in text.lower():
            fail(f"{rel}: missing <html> tag", errors)

        if "viewport" not in text.lower():
            fail(f"{rel}: missing viewport meta tag", errors)

        if not parser.title.strip():
            fail(f"{rel}: missing <title>", errors)

        # Public indexable pages need SEO description and canonical.
        # noindex tool pages are allowed to be lighter, but should still be explicit.
        is_noindex = 'name="robots"' in text.lower() and "noindex" in text.lower()
        if not is_noindex:
            if not has_meta(parser, "description"):
                fail(f"{rel}: public page missing meta description", errors)
            if not has_canonical(parser):
                fail(f"{rel}: public page missing canonical link", errors)

        for img in parser.images:
            src = img.get("src", "")
            alt = img.get("alt")
            if src and alt is None:
                fail(f"{rel}: image missing alt attribute: {src}", errors)


def normalize_link(base_file: Path, href: str) -> str | None:
    href = html.unescape((href or "").strip())
    if not href:
        return None

    low = href.lower()
    if low.startswith(SKIP_LINK_SCHEMES):
        return None

    parsed = urlparse(href)

    # External link: skip existence check, unless same GitHub Pages origin.
    if parsed.scheme in ("http", "https"):
        if parsed.netloc != "worldprotocolacademy-code.github.io":
            return None
        path = parsed.path or "/"
        return unquote(path)

    # Protocol-relative external links.
    if href.startswith("//"):
        return None

    # Root-relative link.
    if href.startswith("/"):
        return unquote(parsed.path or "/")

    # Relative local link.
    base_dir = base_file.parent.relative_to(ROOT)
    combined = (Path("/") / base_dir / parsed.path).as_posix()
    normalized = "/" + str(Path(combined).as_posix()).lstrip("/")
    # Collapse simple /a/../b patterns.
    parts = []
    for part in normalized.split("/"):
        if part in ("", "."):
            continue
        if part == "..":
            if parts:
                parts.pop()
            continue
        parts.append(part)
    return "/" + "/".join(parts)


def check_internal_links(errors: list[str]) -> None:
    html_files = sorted(p for p in ROOT.rglob("*.html") if ".git" not in p.parts)
    for html_path in html_files:
        rel = html_path.relative_to(ROOT).as_posix()
        parser = parse_html_file(html_path)

        for anchor in parser.anchors:
            href = anchor.get("href", "")
            local = normalize_link(html_path, href)
            if not local:
                continue

            suffix = Path(urlparse(local).path).suffix.lower()
            if suffix in SKIP_EXTENSIONS:
                continue

            if not local_path_exists(local):
                fail(f"{rel}: broken internal link: {href} -> {local}", errors)


def check_privacy_hotfixes(errors: list[str]) -> None:
    index_path = ROOT / "index.html"
    if index_path.exists():
        text = read_text(index_path)
        for forbidden in FORBIDDEN_PUBLIC_LINKS_IN_INDEX:
            if forbidden in text:
                fail(f"index.html still contains public Student Desk link: {forbidden}", errors)

    student_desk = ROOT / "ai" / "student-desk.html"
    if student_desk.exists():
        text = read_text(student_desk).lower()
        if "noindex" not in text:
            fail("ai/student-desk.html exists but does not contain noindex", errors)

    wpaws_index = ROOT / "wpaws" / "index.html"
    if wpaws_index.exists():
        text = read_text(wpaws_index).lower()
        if "noindex" not in text:
            fail("wpaws/index.html exists but does not contain noindex", errors)
        if "data-nosnippet" not in text:
            fail("wpaws/index.html API modal/page does not contain data-nosnippet", errors)


def main() -> int:
    errors: list[str] = []

    check_sitemap(errors)
    check_robots(errors)
    check_basic_html_quality(errors)
    check_internal_links(errors)
    check_privacy_hotfixes(errors)

    if errors:
        print("\nWPA Site Quality CI failed:\n")
        for i, error in enumerate(errors, 1):
            print(f"{i}. {error}")
        print("\nFix the items above and run the workflow again.")
        return 1

    print("WPA Site Quality CI passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
