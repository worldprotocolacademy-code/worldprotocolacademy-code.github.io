#!/usr/bin/env python3
"""World Protocol Academy public-site quality checks.

The sitemap allowlist is intentionally explicit. Public canonical pages are allowed,
while internal workspaces, private tools, thank-you pages, and operational guides
remain excluded from search indexing.
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve