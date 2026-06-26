#!/usr/bin/env python3
"""
WPA Site Quality Check

Checks:
- sitemap.xml is valid XML
- sitemap contains only public/search-intended URLs
- sitemap does not contain Student Desk or WPAWS workspace
- robots.txt points to sitemap.xml
- robots.txt does not block the whole public site via User-agent: * + Disallow: /
- targeted AI-bot Disallow: / groups are allowed for WPA IP/TDM protection
- homepage does not link to ai/student-desk.html
- ai/student-desk.html has noindex if present
- wpaws/index.html has noindex and data-nosnippet if present
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://worldprotocolacademy-code.github.io"

ALLOWED_SITEMAP_PATHS = {
    "/",
    "/programmes.html",
    "/certification.html",
    "/wpa-card.html",
    "/passive-revenue.html",
    "/papers.html",
    "/bibliography/",
    "/partnerships/",
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
    # Core institutional pages
    "/institute.html",
    "/working-papers/",
    "/journal/",
    "/journal/index.html",
    "/journal/vol-1-issue-1-2026.html",
    # Tools and research pages
    "/forms/",
    "/wpa-research-framework.html",
    "/wpa-global-institutions-master-list.html",
    "/wpa-global-protocol-diplomacy-benchmark.html",
    "/protocol-symbols.html",
    "/multi-ai-command-center.html",
    "/audio-media-engine.html",
    # Policy and legal pages
    "/public-disclaimer.html",
    "/correction-request.html",
    # Student Desk Beta -- main public paths only
    # Individual module placeholder pages are excluded from sitemap
    # until real doctrinal content replaces placeholder markers.
    "/student-desk/",
}

FORBIDDEN_IN_SITEMAP = [
    "/ai/student-desk.html",
    "/wpaws/",
    "/wpaws/index.html",
    "/test-modals.html",
    "/thanks.html",
    "/analytics-guide.html",
    "/monetization-checklist.html",
    "/promotion-playbook.html",
    "/forms/thanks.html",
]

PUBLIC_SEARCH_USER_AGENTS = {
    "*",
    "googlebot",
    "bingbot",
    "duckduckbot",
    "applebot",
    "slurp",
    "yandexbot",
    "baiduspider",
}


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def add_error(errors: list[str], message: str) -> None:
    errors.append(message)


def url_to_path(url: str) -> str:
    parsed = urlparse(url)
    return unquote(parsed.path or "/")


def local_target_exists(path: str) -> bool:
    if path == "/":
        return (ROOT / "index.html").exists()

    rel = path.lstrip("/")
    candidate = ROOT / rel

    if path.endswith("/"):
        return (candidate / "index.html").exists()

    return candidate.exists()


def check_sitemap(errors: list[str]) -> None:
    sitemap = ROOT / "sitemap.xml"

    if not sitemap.exists():
        add_error(errors, "Missing sitemap.xml")
        return

    try:
        tree = ET.parse(sitemap)
    except ET.ParseError as exc:
        add_error(errors, f"sitemap.xml is not valid XML: {exc}")
        return

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [
        node.text.strip()
        for node in tree.findall(".//sm:loc", ns)
        if node.text and node.text.strip()
    ]

    if not locs:
        add_error(errors, "sitemap.xml has no <loc> entries")
        return

    seen = set()

    for loc in locs:
        if loc in seen:
            add_error(errors, f"Duplicate sitemap URL: {loc}")
        seen.add(loc)

        if not loc.startswith(BASE_URL):
            add_error(errors, f"Sitemap URL is outside expected domain: {loc}")
            continue

        path = url_to_path(loc)

        if path not in ALLOWED_SITEMAP_PATHS:
            add_error(errors, f"Sitemap contains non-public or non-allowlisted path: {path}")

        for forbidden in FORBIDDEN_IN_SITEMAP:
            if forbidden in path:
                add_error(errors, f"Sitemap contains forbidden internal/private path: {path}")

        if not local_target_exists(path):
            add_error(errors, f"Sitemap URL does not map to an existing local file/index: {loc}")


def parse_robots_groups(text: str) -> list[dict[str, list[str]]]:
    """Parse robots.txt into basic user-agent groups for CI.

    The old CI rejected every Disallow: /, including targeted AI bot rules.
    This parser allows a more accurate check:
    - fail when User-agent: * blocks /
    - fail when a public search bot blocks /
    - allow targeted AI training bot blocks
    """
    groups: list[dict[str, list[str]]] = []
    current: dict[str, list[str]] | None = None

    for raw_line in text.splitlines():
        line = raw_line.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue

        key, value = line.split(":", 1)
        key = key.strip().lower()
        value = value.strip()

        if key == "user-agent":
            if current is None or current.get("rules"):
                current = {"agents": [], "rules": []}
                groups.append(current)
            current["agents"].append(value.lower())
            continue

        if key in {"allow", "disallow"}:
            if current is None:
                current = {"agents": ["*"], "rules": []}
                groups.append(current)
            current["rules"].append(f"{key}:{value}")

    return groups


def group_has_disallow_slash(group: dict[str, list[str]]) -> bool:
    return any(rule.lower().strip() == "disallow:/" for rule in group.get("rules", []))


def group_blocks_path(group: dict[str, list[str]], path: str) -> bool:
    wanted = f"disallow:{path}".lower().rstrip("/")
    for rule in group.get("rules", []):
        normalized = rule.lower().rstrip("/")
        if normalized == wanted:
            return True
    return False


def check_robots(errors: list[str]) -> None:
    robots = ROOT / "robots.txt"

    if not robots.exists():
        add_error(errors, "Missing robots.txt")
        return

    text = read_text(robots)

    expected = "Sitemap: https://worldprotocolacademy-code.github.io/sitemap.xml"
    if expected not in text:
        add_error(errors, "robots.txt does not point to the canonical sitemap.xml")

    groups = parse_robots_groups(text)

    for group in groups:
        agents = set(group.get("agents", []))
        has_disallow_all = group_has_disallow_slash(group)

        if has_disallow_all and "*" in agents:
            add_error(errors, "robots.txt blocks the whole public site with User-agent: * + Disallow: /")

        public_agents = agents & (PUBLIC_SEARCH_USER_AGENTS - {"*"})
        if has_disallow_all and public_agents:
            add_error(errors, f"robots.txt blocks public search agent(s): {', '.join(sorted(public_agents))}")

        if group_blocks_path(group, "/wpaws"):
            if "*" in agents or (agents & PUBLIC_SEARCH_USER_AGENTS):
                add_error(errors, "robots.txt should not block /wpaws/ for public crawlers; use noindex meta/header instead")


def check_privacy_hotfixes(errors: list[str]) -> None:
    homepage = ROOT / "index.html"
    if homepage.exists():
        text = read_text(homepage).lower()
        if "ai/student-desk.html" in text or "student-desk.html" in text:
            add_error(errors, "index.html still contains a public Student Desk link")

    student_desk = ROOT / "ai" / "student-desk.html"
    if student_desk.exists():
        text = read_text(student_desk).lower()
        if "noindex" not in text:
            add_error(errors, "ai/student-desk.html exists but does not contain noindex")

    wpaws_index = ROOT / "wpaws" / "index.html"
    if wpaws_index.exists():
        text = read_text(wpaws_index).lower()
        if "noindex" not in text:
            add_error(errors, "wpaws/index.html exists but does not contain noindex")
        if "data-nosnippet" not in text:
            add_error(errors, "wpaws/index.html does not contain data-nosnippet")


def check_basic_public_html(errors: list[str]) -> None:
    for public_path in sorted(ALLOWED_SITEMAP_PATHS):
        if public_path == "/":
            html_file = ROOT / "index.html"
        elif public_path.endswith("/"):
            html_file = ROOT / public_path.lstrip("/") / "index.html"
        else:
            html_file = ROOT / public_path.lstrip("/")

        if not html_file.exists():
            add_error(errors, f"Public sitemap page is missing locally: {public_path}")
            continue

        text = read_text(html_file).lower()

        if "<title" not in text:
            add_error(errors, f"{public_path}: missing <title>")

        if 'name="viewport"' not in text and "name='viewport'" not in text:
            add_error(errors, f"{public_path}: missing viewport meta tag")

        if 'name="description"' not in text and "name='description'" not in text:
            add_error(errors, f"{public_path}: missing meta description")

        if 'rel="canonical"' not in text and "rel='canonical'" not in text:
            add_error(errors, f"{public_path}: missing canonical link")


def main() -> int:
    errors: list[str] = []

    check_sitemap(errors)
    check_robots(errors)
    check_privacy_hotfixes(errors)
    check_basic_public_html(errors)

    if errors:
        print("\nWPA Site Quality CI failed:\n")
        for index, error in enumerate(errors, start=1):
            print(f"{index}. {error}")
        print("\nFix the items above and run the workflow again.")
        return 1

    print("WPA Site Quality CI passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
