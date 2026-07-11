#!/usr/bin/env python3
"""Conservative, idempotent finalizer for the WPA homepage."""
from pathlib import Path
import re

INDEX = Path(__file__).resolve().parents[1] / "index.html"


def sub_once(text, pattern, replacement, label):
    out, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"Unsafe homepage finalization: {label} matches={count}")
    return out


def main():
    text = INDEX.read_text(encoding="utf-8")
    original = text

    logo = ('<picture class="wpa-picture"><source srcset="https://worldprotocolacademy-code.github.io/logo.webp" '
            'type="image/webp"><img src="https://worldprotocolacademy-code.github.io/logo.png" alt="WPA" '
            'onerror="this.style.display=\'none\';this.parentElement.textContent=\'WPA\'" decoding="async" '
            'loading="eager" fetchpriority="high" width="512" height="512"></picture>')
    if "this.parentElement.innerHTML='<spa" in text:
        text = sub_once(text, r'<picture class="wpa-picture"><source srcset="https://worldprotocolacademy-code\.github\.io/logo\.webp".*?</picture>WPA</span>\'">', logo, "damaged logo")

    select = '''<select id="pageLang" aria-label="Select WPA language" title="WPA Languages" onchange="if(this.value){ window.location.href=this.value; }">
          <option value="">Languages</option>
          <option value="https://worldprotocolacademy-code.github.io/">🇲🇰 Македонски</option>
          <option value="https://worldprotocolacademy-code.github.io/en/">🇬🇧 English</option>
        </select>'''
    text = sub_once(text, r'<select id="pageLang".*?</select>', select, "MK/EN selector")
    text = text.replace('>All languages</a>', '>Languages hub</a>', 1)

    marker = "const status = document.getElementById('botStatus');\n  let busy = false, conv = [];"
    guarded = "const status = document.getElementById('botStatus');\n  if(!panel || !toggle || !closeBtn || !clearBtn || !msgs || !inp || !send || !langSel || !note || !status) return;\n  let busy = false, conv = [];"
    if marker in text:
        text = text.replace(marker, guarded, 1)

    text = text.replace("inp.addEventListener('keydown', function(e){ if(e.key==='Enter') ask(); });",
                        "inp.addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); ask(); } });", 1)

    old_hist = "try{ var h = sessionStorage.getItem('wpa-bot-hist'); if(h) conv = JSON.parse(h)||[]; }catch(e){}"
    new_hist = "try{ var h = sessionStorage.getItem('wpa-bot-hist'); if(h){ var parsed=JSON.parse(h); conv=Array.isArray(parsed)?parsed.slice(-MAX_H):[]; } }catch(e){ conv=[]; }"
    text = text.replace(old_hist, new_hist, 1)

    text = text.replace('<script id="wpa-responsive-mobile-script">',
                        '<script id="wpa-responsive-mobile-script" type="application/x-wpa-disabled">', 1)
    text = text.replace('/scripts/wpa-performance.js?v=1.0', '/scripts/wpa-performance.js?v=20260712', 1)

    # Post-conditions: fail instead of committing a partially corrected homepage.
    if "this.parentElement.innerHTML='<spa" in text:
        raise SystemExit("Damaged logo markup remains")
    selector = re.search(r'<select id="pageLang".*?</select>', text, re.S)
    if not selector or selector.group(0).count('<option') != 3:
        raise SystemExit("Homepage language selector is not MK/EN Phase 1")
    if text.count('id="wpa-mobile-drawer-script-v14"') != 1:
        raise SystemExit("Expected exactly one active final mobile drawer")
    if '/scripts/wpa-performance.js?v=20260712' not in text:
        raise SystemExit("Current performance module version is missing")

    if text != original:
        INDEX.write_text(text, encoding="utf-8", newline="\n")
        print("Homepage finalization applied.")
    else:
        print("Homepage already finalized.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
