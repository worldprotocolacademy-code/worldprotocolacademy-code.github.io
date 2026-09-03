#!/usr/bin/env python3
"""Canonical Institute-header repair: WPA logo, WPA Journal nav, Journal CTA contrast."""
# Triggered independently from the legacy August reconciliation so unrelated stale checks cannot block this header repair.
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "institute.html"

def main():
    text = PATH.read_text(encoding="utf-8")

    # Real WPA logo: the previous SVG asset is only a WPA-letter monogram.
    text = text.replace(
        '<img class="wpa-institute-logo" src="/assets/img/logo.svg"',
        '<img class="wpa-institute-logo" src="/logo.webp"'
    )

    # Keep the actual WPA Journal visible in the primary Institute navigation.
    nav = re.search(r'(<div class="nav-links">)(.*?)(</div>\s*</nav>)', text, re.S)
    if not nav:
        raise SystemExit("Institute primary nav not found")
    body = nav.group(2)
    if 'href="journal/index.html"' not in body and 'href="/journal/index.html"' not in body:
        link = ('\n<a class="wpa-journal-institute-nav-link" href="journal/index.html" '
                'title="WPA Journal" translate="no" data-no-i18n="true">WPA Journal</a>')
        pub = re.search(r'(<a[^>]+href="#institute-publications"[^>]*>.*?</a>)', body, re.S)
        body = body[:pub.end()] + link + body[pub.end():] if pub else body + link
        text = text[:nav.start(2)] + body + text[nav.end(2):]

    # High-contrast treatment for Journal entry points; protect the real logo from cropping.
    style = '''
<style id="wpa-institute-journal-header-canonical-20260903">
html[data-wpa-page="institute"] .wpa-institute-logo{
  display:block!important;width:46px!important;height:46px!important;flex:0 0 46px!important;
  object-fit:contain!important;border-radius:50%!important;
  box-shadow:0 0 0 1px rgba(201,168,76,.82),0 5px 16px rgba(0,0,0,.24)!important;
}
html[data-wpa-page="institute"] .nav-links .wpa-journal-institute-nav-link,
html[data-wpa-page="institute"] .nav-links .wpa-journal-live-entry{
  color:#e3c878!important;font-weight:800!important;
  border:1px solid rgba(201,168,76,.48)!important;
  background:rgba(201,168,76,.08)!important;border-radius:4px!important;
}
html[data-wpa-page="institute"] .nav-links .wpa-journal-institute-nav-link:hover,
html[data-wpa-page="institute"] .nav-links .wpa-journal-live-entry:hover{
  color:#081328!important;background:#c9a84c!important;border-color:#c9a84c!important;
}
html[data-wpa-page="institute"] a[data-i18n="institute.tools_hub.journal.cta"],
html[data-wpa-page="institute"] .hero-cta a[href="journal/index.html"],
html[data-wpa-page="institute"] .hero-cta a[href="/journal/index.html"]{
  background:#0d1f3c!important;color:#fbf8ee!important;border:1px solid #c9a84c!important;
}
html[data-wpa-page="institute"] a[data-i18n="institute.tools_hub.journal.cta"]:hover,
html[data-wpa-page="institute"] .hero-cta a[href="journal/index.html"]:hover,
html[data-wpa-page="institute"] .hero-cta a[href="/journal/index.html"]:hover{
  background:#1a2c4f!important;color:#e3c878!important;border-color:#e3c878!important;
}
@media(max-width:760px){
  html[data-wpa-page="institute"] .wpa-institute-logo{width:40px!important;height:40px!important;flex-basis:40px!important;}
}
</style>
'''
    if 'id="wpa-institute-journal-header-canonical-20260903"' not in text:
        text = text.replace('</head>', style + '</head>', 1)

    PATH.write_text(text, encoding="utf-8")

    check = PATH.read_text(encoding="utf-8")
    assert '<img class="wpa-institute-logo" src="/logo.webp"' in check
    assert 'class="wpa-journal-institute-nav-link"' in check
    assert 'href="journal/index.html"' in check
    assert 'wpa-institute-journal-header-canonical-20260903' in check
    print("WPA Institute header canonical repair applied.")

if __name__ == "__main__":
    main()
