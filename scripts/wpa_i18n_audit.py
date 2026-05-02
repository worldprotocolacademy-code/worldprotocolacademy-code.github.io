#!/usr/bin/env python3
"""
WPA i18n Audit Pipeline
World Protocol Academy

Phase 3 foundation:
- Scans HTML files for data-i18n attributes.
- Compares required keys against /locales/<lang>/common.json and /locales/<lang>/<page>.json.
- Writes reports under i18n-audit-report/.
- Does not call external APIs and does not auto-publish machine translations.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple

I18N_ATTRS = [
    "data-i18n",
    "data-i18n-html",
    "data-i18n-placeholder",
    "data-i18n-title",
    "data-i18n-aria-label",
    "data-i18n-value",
    "data-i18n-alt",
    "data-i18n-title-tag",
]

ATTR_RE_TEMPLATE = r'{attr}=["\']([^"\']+)["\']'


@dataclass
class MissingKey:
    page: str
    language: str
    key: str
    attr: str
    source_file: str


@dataclass
class PageAudit:
    page: str
    source_file: str
    total_keys: int
    missing_by_language: Dict[str, List[str]]


def read_json(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            if isinstance(data.get("strings"), dict):
                return data["strings"]
            return data
        return {}
    except Exception:
        return {}


def deep_merge(base: Dict[str, Any], extra: Dict[str, Any]) -> Dict[str, Any]:
    out: Dict[str, Any] = dict(base)
    for key, value in extra.items():
        if isinstance(out.get(key), dict) and isinstance(value, dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = value
    return out


def has_path(obj: Dict[str, Any], dotted: str) -> bool:
    cur: Any = obj
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return False
        cur = cur[part]
    return isinstance(cur, (str, int, float, bool)) or cur is not None


def set_path(obj: Dict[str, Any], dotted: str, value: str = "") -> None:
    cur = obj
    parts = dotted.split(".")
    for part in parts[:-1]:
        if part not in cur or not isinstance(cur[part], dict):
            cur[part] = {}
        cur = cur[part]
    cur[parts[-1]] = value


def page_name_from_html(path: Path, html: str) -> str:
    body_match = re.search(r'<body[^>]*data-page=["\']([^"\']+)["\']', html, flags=re.I)
    if body_match:
        return body_match.group(1).strip()
    if path.name == "index.html":
        return "index"
    return path.stem


def extract_i18n_keys(html: str) -> List[Tuple[str, str]]:
    found: List[Tuple[str, str]] = []
    for attr in I18N_ATTRS:
        pattern = re.compile(ATTR_RE_TEMPLATE.format(attr=re.escape(attr)), flags=re.I)
        for match in pattern.finditer(html):
            key = match.group(1).strip()
            if key:
                found.append((attr, key))
    return found


def scan_html_files(root: Path) -> List[Path]:
    ignore_parts = {".git", "node_modules", "i18n-audit-report"}
    files: List[Path] = []
    for path in root.rglob("*.html"):
        if any(part in ignore_parts for part in path.parts):
            continue
        files.append(path)
    return sorted(files)


def load_manifest(root: Path) -> Dict[str, Any]:
    manifest = read_json(root / "locales" / "manifest.json")
    if not manifest:
        return {
            "default_language": "mk",
            "canonical_language": "mk",
            "supported_languages": [
                {"code": "mk", "label": "Македонски"},
                {"code": "en", "label": "English"},
            ],
        }
    return manifest


def language_codes(manifest: Dict[str, Any]) -> List[str]:
    source = manifest.get("supported_languages") or manifest.get("languages") or []
    codes = []
    for item in source:
        if isinstance(item, dict) and item.get("code"):
            codes.append(str(item["code"]))
    return codes or ["mk", "en"]


def load_locale(root: Path, language: str, page: str) -> Dict[str, Any]:
    common = read_json(root / "locales" / language / "common.json")
    page_json = read_json(root / "locales" / language / f"{page}.json")
    return deep_merge(common, page_json)


def audit(root: Path, core_only: bool = False) -> Tuple[List[PageAudit], List[MissingKey], Dict[str, Any]]:
    manifest = load_manifest(root)
    langs = language_codes(manifest)
    core_pages = set(manifest.get("core_pages") or [])

    page_audits: List[PageAudit] = []
    missing: List[MissingKey] = []

    for html_file in scan_html_files(root):
        html = html_file.read_text(encoding="utf-8", errors="replace")
        keys = extract_i18n_keys(html)
        if not keys:
            continue

        page = page_name_from_html(html_file, html)
        if core_only and page not in core_pages:
            continue

        unique_keys = sorted({key for _, key in keys})
        missing_by_language: Dict[str, List[str]] = {}

        for lang in langs:
            locale = load_locale(root, lang, page)
            lang_missing: List[str] = []
            for attr, key in sorted(set(keys)):
                if not has_path(locale, key):
                    lang_missing.append(key)
                    missing.append(
                        MissingKey(
                            page=page,
                            language=lang,
                            key=key,
                            attr=attr,
                            source_file=str(html_file.relative_to(root)),
                        )
                    )
            if lang_missing:
                missing_by_language[lang] = sorted(set(lang_missing))

        page_audits.append(
            PageAudit(
                page=page,
                source_file=str(html_file.relative_to(root)),
                total_keys=len(unique_keys),
                missing_by_language=missing_by_language,
            )
        )

    return page_audits, missing, manifest


def write_reports(root: Path, page_audits: List[PageAudit], missing: List[MissingKey]) -> None:
    out_dir = root / "i18n-audit-report"
    out_dir.mkdir(parents=True, exist_ok=True)

    summary = {
        "total_pages": len(page_audits),
        "total_missing": len(missing),
        "pages": [asdict(item) for item in page_audits],
        "missing": [asdict(item) for item in missing],
    }

    (out_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = ["# WPA i18n Audit Report", "", f"Total pages audited: {len(page_audits)}", f"Total missing keys: {len(missing)}", ""]
    for page in page_audits:
        lines.append(f"## {page.page} — `{page.source_file}`")
        lines.append(f"Total detected keys: {page.total_keys}")
        if not page.missing_by_language:
            lines.append("Missing keys: none")
        else:
            for lang, keys in page.missing_by_language.items():
                lines.append(f"- {lang}: {len(keys)} missing")
                for key in keys[:50]:
                    lines.append(f"  - `{key}`")
                if len(keys) > 50:
                    lines.append(f"  - ... {len(keys) - 50} more")
        lines.append("")

    (out_dir / "summary.md").write_text("\n".join(lines), encoding="utf-8")

    templates: Dict[str, Dict[str, Dict[str, str]]] = {}
    for item in missing:
        templates.setdefault(item.language, {}).setdefault(item.page, {})
        set_path(templates[item.language][item.page], item.key, "")

    for lang, pages in templates.items():
        lang_dir = out_dir / "templates" / lang
        lang_dir.mkdir(parents=True, exist_ok=True)
        for page, data in pages.items():
            (lang_dir / f"{page}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit WPA i18n keys against locale JSON files.")
    parser.add_argument("--root", default=".", help="Repository root")
    parser.add_argument("--core-only", action="store_true", help="Audit only manifest core_pages")
    parser.add_argument("--fail-on-missing", action="store_true", help="Exit non-zero if missing keys are found")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    page_audits, missing, _manifest = audit(root=root, core_only=args.core_only)
    write_reports(root=root, page_audits=page_audits, missing=missing)

    print(f"WPA i18n audit complete. Pages: {len(page_audits)}. Missing keys: {len(missing)}.")
    print("Report: i18n-audit-report/summary.md")

    if args.fail_on_missing and missing:
      return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
