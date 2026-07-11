#!/usr/bin/env python3
"""Run the WPA media optimizer and always include the homepage."""
from __future__ import annotations

import json
import optimize_site_media as optimizer


def main() -> int:
    stats = {key: 0 for key in (
        "pages_changed",
        "images_optimized",
        "images_hardened",
        "webp_created",
        "scripts_injected",
    )}
    pages = set(optimizer.public_pages())
    homepage = optimizer.ROOT / "index.html"
    if homepage.is_file():
        pages.add(homepage)
    for page in sorted(pages):
        optimizer.optimize_page(page, 82, False, stats)
    print(json.dumps(stats, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
