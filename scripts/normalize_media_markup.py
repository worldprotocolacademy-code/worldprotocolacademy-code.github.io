#!/usr/bin/env python3
"""Flatten accidentally nested WPA picture wrappers in public HTML files."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMG = r'<img\b(?:[^>\'\"]+|\'[^\']*\'|\"[^\"]*\")*>'
CHAIN_RE = re.compile(
    r'(?P<opens>(?:<picture\s+class=[\"\']wpa-picture[\"\']>\s*<source\b[^>]*\btype=[\"\']image/webp[\"\'][^>]*>\s*){2,})'
    r'(?P<img>' + IMG + r')'
    r'(?P<closes>(?:\s*</picture>){2,})',
    re.I | re.S,
)
SOURCE_RE = re.compile(r'<source\b[^>]*\btype=[\"\']image/webp[\"\'][^>]*>', re.I | re.S)


def normalize_text(text: str) -> tuple[str, int]:
    total = 0
    while True:
        def repl(match: re.Match[str]) -> str:
            nonlocal total
            sources = SOURCE_RE.findall(match.group('opens'))
            if not sources:
                return match.group(0)
            total += 1
            return '<picture class="wpa-picture">' + sources[-1] + match.group('img') + '</picture>'

        updated, count = CHAIN_RE.subn(repl, text)
        text = updated
        if count == 0:
            break
    return text, total


def main() -> int:
    changed = 0
    flattened = 0
    for path in ROOT.rglob('*.html'):
        if any(part in {'.git', 'node_modules', 'vendor'} for part in path.parts):
            continue
        original = path.read_text(encoding='utf-8', errors='replace')
        updated, count = normalize_text(original)
        if updated != original:
            path.write_text(updated, encoding='utf-8', newline='\n')
            changed += 1
            flattened += count
    print({'files_changed': changed, 'nested_picture_chains_flattened': flattened})
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
