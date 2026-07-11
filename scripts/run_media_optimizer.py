#!/usr/bin/env python3
"""Finalize and safely optimize WPA public media without nested picture wrappers."""
from __future__ import annotations

import json
import re

import finalize_homepage
import normalize_media_markup
import optimize_site_media as optimizer

SAFE_IMG_RE = re.compile(r'<img\b(?:[^>\'\"]+|\'[^\']*\'|\"[^\"]*\")*>', re.I | re.S)
optimizer.PERFORMANCE_SCRIPT = '<script defer src="/scripts/wpa-performance.js?v=20260712"></script>'


def safe_optimize_page(page, quality, force, stats):
    original = optimizer.read(page)
    image_index = 0

    def replace(match):
        nonlocal image_index
        before = original[:match.start()].lower()
        inside_picture = before.rfind('<picture') > before.rfind('</picture')
        if inside_picture:
            image_index += 1
            return match.group(0)
        value = optimizer.optimize_img(page, match.group(0), image_index, quality, force, stats)
        image_index += 1
        return value

    updated = SAFE_IMG_RE.sub(replace, original)
    updated, injected = optimizer.inject_performance_script(updated)
    if injected:
        stats['scripts_injected'] += 1
    if updated != original:
        optimizer.write(page, updated)
        stats['pages_changed'] += 1
        return True
    return False


def main() -> int:
    finalize_homepage.main()
    normalize_media_markup.main()
    stats = {key: 0 for key in (
        'pages_changed', 'images_optimized', 'images_hardened',
        'webp_created', 'scripts_injected',
    )}
    pages = set(optimizer.public_pages())
    homepage = optimizer.ROOT / 'index.html'
    if homepage.is_file():
        pages.add(homepage)
    for page in sorted(pages):
        safe_optimize_page(page, 82, False, stats)
    normalize_media_markup.main()
    for page in pages:
        text = optimizer.read(page)
        if '<picture class="wpa-picture"><source' in text and re.search(
            r'<picture\s+class=["\']wpa-picture["\']>\s*<source\b[^>]*>\s*<picture', text, re.I | re.S
        ):
            raise SystemExit(f'Nested picture markup remains: {page.relative_to(optimizer.ROOT)}')
    print(json.dumps(stats, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
