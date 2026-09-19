#!/usr/bin/env python3
"""Finalize and safely optimize WPA public media without nested picture wrappers."""
from __future__ import annotations

import json

import finalize_homepage
import normalize_media_markup
import optimize_site_media as optimizer

def iter_img_tags(text):
    """Yield (start, end, tag) for <img ...> tags using a linear quote-aware scan."""
    lower = text.lower()
    i = 0
    n = len(text)
    while i < n:
        start = lower.find('<img', i)
        if start < 0:
            return
        boundary = start + 4
        if boundary < n and not (text[boundary].isspace() or text[boundary] in '/>'):
            i = boundary
            continue

        quote = None
        j = boundary
        while j < n:
            ch = text[j]
            if quote is not None:
                if ch == quote:
                    quote = None
            elif ch in ("'", '"'):
                quote = ch
            elif ch == '>':
                end = j + 1
                yield start, end, text[start:end]
                i = end
                break
            j += 1
        else:
            return
optimizer.PERFORMANCE_SCRIPT = '<script defer src="/scripts/wpa-performance.js?v=20260909-3"></script>'


def safe_optimize_page(page, quality, force, stats):
    original = optimizer.read(page)
    image_index = 0

    chunks = []
    cursor = 0
    lower_original = original.lower()
    for start, end, tag in iter_img_tags(original):
        chunks.append(original[cursor:start])
        before = lower_original[:start]
        inside_picture = before.rfind('<picture') > before.rfind('</picture')
        if inside_picture:
            image_index += 1
            replacement = tag
        else:
            replacement = optimizer.optimize_img(page, tag, image_index, quality, force, stats)
            image_index += 1
        chunks.append(replacement)
        cursor = end
    chunks.append(original[cursor:])
    updated = ''.join(chunks)
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
