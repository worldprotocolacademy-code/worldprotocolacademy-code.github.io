from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Missing expected marker for {label}")
    return text.replace(old, new, 1)


def patch_institute() -> None:
    path = ROOT / "institute.html"
    text = path.read_text(encoding="utf-8")

    old_title = '<title data-i18n="institute.meta.title">WPA Institute · Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</title>'
    new_title = '<title data-i18n="institute.meta.title">WPA Institute | Протокол и дипломатија</title>'
    text = replace_once(text, old_title, new_title, "institute title")

    desc = '<meta content="World Protocol Academy / Светска академија за протокол — Institute for Protocol, Diplomacy, Public Communication and Security Studies / Институт за протокол, дипломатија, јавна комуникација и безбедносни студии — независна дигитална платформа за протокол, дипломатија, јавна комуникација и безбедносни студии. Истражување, аналитика, benchmark, предавања од практичари." data-i18n-attr="content:institute.meta.description" name="description"/>'
    head_additions = desc + '''\n<meta name="author" content="Доц. д-р Санде Смиљанов"/>\n<meta property="og:title" content="WPA Institute | Протокол и дипломатија"/>\n<meta property="og:description" content="Независна дигитална образовна, истражувачка и авторска платформа за протокол, дипломатија, јавна комуникација и безбедносни студии."/>\n<meta property="og:type" content="website"/>\n<meta property="og:url" content="https://worldprotocolacademy-code.github.io/institute.html"/>\n<meta property="og:image" content="https://worldprotocolacademy-code.github.io/logo.png"/>\n<meta property="og:image:alt" content="World Protocol Academy logo"/>\n<meta name="twitter:card" content="summary_large_image"/>\n<meta name="twitter:title" content="WPA Institute | Protocol and Diplomacy"/>\n<meta name="twitter:description" content="Independent digital educational, research and authorial platform for protocol, diplomacy, public communication and security studies."/>\n<meta name="twitter:image" content="https://worldprotocolacademy-code.github.io/logo.png"/>\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "EducationalOrganization",\n  "name": "World Protocol Academy — WPA Institute",\n  "alternateName": "Светска академија за протокол",\n  "url": "https://worldprotocolacademy-code.github.io/institute.html",\n  "logo": "https://worldprotocolacademy-code.github.io/logo.png",\n  "email": "worldprotocolacademy@gmail.com",\n  "address": {\n    "@type": "PostalAddress",\n    "addressLocality": "Skopje",\n    "addressCountry": "MK"\n  },\n  "description": "Independent digital educational, research and authorial platform for protocol, diplomacy, public communication and security studies."\n}\n</script>'''
    text = replace_once(text, desc, head_additions, "institute metadata")

    style_marker = "  * { box-sizing: border-box; margin: 0; padding: 0; }"
    style_patch = style_marker + '''\n  .skip-link { position: fixed; left: 12px; top: -80px; z-index: 1000000; padding: 10px 14px; background: #f8f4ee; color: #071326; border: 2px solid #c9a84c; font-weight: 800; text-decoration: none; }\n  .skip-link:focus { top: 12px; }\n  :focus-visible { outline: 3px solid #c9a84c; outline-offset: 3px; }\n  @media print {\n    .topbar, .nav-wrap, .wpa-test-phase-header, .wpa-mobile-menu-button, .wpa-mobile-floating-home, .wpa-mobile-floating-bot { display: none !important; }\n    body { background: #fff !important; color: #000 !important; }\n    a { color: #000 !important; text-decoration: underline !important; }\n    section { break-inside: avoid; padding: 24px 0 !important; }\n  }'''
    text = replace_once(text, style_marker, style_patch, "institute accessibility CSS")

    text = replace_once(text, '<body>', '<body>\n<a class="skip-link" href="#main-content">Прескокни до главната содржина / Skip to main content</a>', "institute skip link")
    text = replace_once(text, '<header class="hero" id="top">', '<main id="main-content" tabindex="-1">\n<header class="hero" id="top">', "institute main start")
    text = replace_once(text, '\n<section id="cta">', '\n</main>\n<section id="cta">', "institute main end")

    text = text.replace('http://seeaparis.com', 'https://seeaparis.com')
    text = re.sub(r'<img(?![^>]*\bloading=)([^>]*?)>', r'<img loading="lazy" decoding="async"\1>', text)

    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    old_title = '<title data-i18n="meta.title">World Protocol Academy | Протокол · Дипломатија · Сертификација · WPA Card · Partnerships &amp; Member Benefits</title>'
    new_title = '<title data-i18n="meta.title">World Protocol Academy | Протокол и дипломатија</title>'
    text = replace_once(text, old_title, new_title, "homepage title")
    text = text.replace('http://seeaparis.com', 'https://seeaparis.com')
    path.write_text(text, encoding="utf-8")


def create_404() -> None:
    path = ROOT / "404.html"
    path.write_text('''<!DOCTYPE html>\n<html lang="mk">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="robots" content="noindex,follow">\n<title>404 | World Protocol Academy</title>\n<meta name="description" content="Страницата не е пронајдена. Вратете се на World Protocol Academy.">\n<style>\n:root{--navy:#0d1f3c;--gold:#c9a84c;--cream:#f8f4ee}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--navy);color:var(--cream);font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;padding:24px}.card{max-width:760px;text-align:center;border:1px solid rgba(201,168,76,.55);padding:48px 30px;background:rgba(255,255,255,.04);box-shadow:0 20px 70px rgba(0,0,0,.3)}h1{font:700 clamp(58px,12vw,120px)/1 Georgia,serif;color:var(--gold);margin:0}h2{font:600 clamp(24px,5vw,38px)/1.2 Georgia,serif;margin:18px 0}p{line-height:1.7;color:rgba(248,244,238,.82)}a{display:inline-block;margin-top:18px;padding:13px 22px;background:var(--gold);color:var(--navy);font-weight:800;text-decoration:none;border-radius:3px}a:focus-visible{outline:3px solid #fff;outline-offset:4px}\n</style>\n</head>\n<body>\n<main class="card">\n<h1>404</h1>\n<h2>Страницата не е пронајдена</h2>\n<p>Бараната адреса не постои или е преместена.<br>The requested page does not exist or has been moved.</p>\n<a href="/">Врати се на почетната страница / Return home</a>\n</main>\n</body>\n</html>\n''', encoding="utf-8")


if __name__ == "__main__":
    patch_index()
    patch_institute()
    create_404()
    print("WPA Institute audit remediation applied successfully.")
