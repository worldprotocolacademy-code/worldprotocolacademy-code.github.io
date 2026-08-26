#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

FREEZE_NOTICE_EN = (
    "INACTIVE / FROZEN — informational preview only. "
    "No public pricing, payments, paid delivery, subscriptions, licences, ticket sales "
    "or official credential issuance are currently active."
)
FREEZE_NOTICE_MK = (
    "НЕАКТИВНО / ЗАМРЗНАТО — само информативен приказ. "
    "Во моментов не се активни јавни цени, плаќања, платена испорака, претплати, "
    "лиценци, продажба на билети или официјално издавање сертификати."
)


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def write(rel, text):
    (ROOT / rel).write_text(text, encoding="utf-8")


def patch_money_tokens(text):
    patterns = [
        r"€\s*\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?(?:\s*/\s*(?:year|month|day))?",
        r"\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*€(?:\s*/\s*(?:year|month|day))?",
        r"\$\s*\d+(?:[.,]\d+)?",
        r"\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*USD\b",
        r"\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*EUR\b",
    ]
    for pattern in patterns:
        text = re.sub(pattern, "[financial display inactive]", text, flags=re.I)
    return text


def patch_opc(rel):
    t = read(rel)
    t = t.replace(
        "Прва меѓународна конференција за протокол, дипломатија, јавна комуникација и безбедносни студии. Декември 2026 · Hotel Inex Olgica · Охрид, Северна Македонија.",
        "OPC conference framework. Date and venue to be confirmed; Ohrid, North Macedonia is a proposed location."
    )
    t = t.replace(
        "Прва меѓународна конференција за протокол, дипломатија, јавна комуникација и безбедносни студии. Декември 2026 · Охрид.",
        "OPC conference framework. Date and venue to be confirmed; Ohrid is proposed."
    )
    t = t.replace("Hotel Inex Olgica", "Venue to be confirmed")
    t = t.replace("Декември 2026", "Датумот ќе биде потврден")
    t = t.replace("December 2026", "Date to be confirmed")
    frozen_section = (
        '<section class="section" id="tickets">\n'
        '  <span class="section-label">Commercial status</span>\n'
        '  <h2 class="section-title">Participation framework · INACTIVE / FROZEN</h2>\n'
        f'  <div class="payment-policy"><strong>{FREEZE_NOTICE_EN}</strong><br>{FREEZE_NOTICE_MK}</div>\n'
        '</section>'
    )
    t = re.sub(
        r'<section(?=[^>]*\bid=["\']tickets["\'])[^>]*>.*?</section>',
        frozen_section, t, count=1, flags=re.S | re.I,
    )
    t = re.sub(
        r'<div class="ticket-price">.*?</div>',
        '<div class="ticket-price">Commercial display inactive</div>',
        t, flags=re.S | re.I,
    )
    t = t.replace("Early Bird", "Registration preview")
    t = t.replace("PAYMENT POLICY", "COMMERCIAL STATUS")
    t = t.replace("Payment policy", "Commercial status")
    t = t.replace("Tickets", "Participation status")
    t = t.replace("Билети", "Статус на учество")
    t = patch_money_tokens(t)
    write(rel, t)


def patch_wpa_card_checkout():
    rel = "opc2026/wpa-card-checkout.html"
    t = read(rel)
    replacement = (
        '<section aria-labelledby="model-title">\n'
        '  <h2 id="model-title">Membership architecture · financial layer inactive</h2>\n'
        f'  <div class="boundary"><strong>{FREEZE_NOTICE_EN}</strong><br>{FREEZE_NOTICE_MK}</div>\n'
        '  <p class="muted">The underlying access model is retained for governance and product-design reference; no public financial figures are displayed.</p>\n'
        '</section>'
    )
    t = re.sub(
        r'<section\s+aria-labelledby=["\']model-title["\'][^>]*>.*?</section>',
        replacement, t, count=1, flags=re.S | re.I,
    )
    t = patch_money_tokens(t)
    write(rel, t)


def patch_journal_flipbook():
    rel = "journal/vol-1-issue-1-2026.html"
    t = read(rel)
    fee_notice = (
        '<div class="notice notice--strict" style="margin:16px 0;">'
        '<strong>Financial framework · INACTIVE / FROZEN</strong>'
        '<p>No publication or production fee schedule is currently active or displayed. '
        'Any future framework would require formal activation and a then-current public policy.</p>'
        '<p>Во моментов не е активен ниту јавно прикажан распоред на такси за објавување или продукција.</p>'
        '</div>'
    )
    t = re.sub(r'<table class="fee-table">.*?</table>', fee_notice, t, flags=re.S | re.I)
    t = t.replace("Open Access with Fair Access fee model.", "Open Access; financial framework inactive.")
    t = t.replace("Open Access · Fair Access.", "Open Access · financial framework inactive.")
    t = t.replace("Fair Access fee model", "financial framework currently inactive")

    replacements = {
        "Симболична такса само по прифаќање. Достапни waivers.":
            "Во моментов нема активна такса за објавување или продукција.",
        "Симболична такса само по прифаќање (waivers по барање); производство и архивирање.":
            "Во моментов нема активна такса за објавување или продукција; производството и архивирањето остануваат во развојна рамка.",
        "A symbolic fee only after acceptance. Waivers available.":
            "No publication or production fee is currently active.",
        "Symbolic fee only after acceptance (waivers on request); production and archiving.":
            "No publication or production fee is currently active; production and archiving remain within the development framework.",
        "Symbolic publication fee — only after acceptance":
            "Publication fee — inactive / frozen",
        "symbolic publication fee only after acceptance · waivers available on request.":
            "publication fee inactive / frozen.",
    }
    for old, new in replacements.items():
        t = t.replace(old, new)

    t = t.replace(
        "The WPA Journal commits to the principle of accessibility without compromise of integrity.",
        "The WPA Journal commits to accessibility without compromise of integrity."
    )
    t = t.replace('"honorificPrefix": "Assoc. Prof. Dr."', '"honorificPrefix": "Doc. Dr"')
    t = t.replace("Assoc. Prof. Dr. Sande Smiljanov", "Doc. Dr Sande Smiljanov")
    t = patch_money_tokens(t)
    write(rel, t)


def sanitize_journal_locale_text(t):
    # Preserve editorial/academic copy while neutralising every known fee surface.
    replacements = {
        "Симболична такса само по прифаќање. Достапни waivers.":
            "Во моментов нема активна такса за објавување или продукција.",
        "Симболична такса само по прифаќање.":
            "Во моментов нема активна такса за објавување или продукција.",
        "Симболична такса само по прифаќање (waivers по барање); производство и архивирање.":
            "Во моментов нема активна такса за објавување или продукција; производството и архивирањето остануваат во развојна рамка.",
        "Симболична такса за објавување (само по прифаќање)":
            "Такса за објавување — неактивна / замрзната",
        "Само по прифаќање — symbolic publication fee (со достапни waivers).":
            "Таксата за објавување е неактивна / замрзната.",
        "A symbolic fee only after acceptance. Waivers available.":
            "No publication or production fee is currently active.",
        "A symbolic fee only after acceptance.":
            "No publication or production fee is currently active.",
        "Symbolic fee only after acceptance (waivers on request); production and archiving.":
            "No publication or production fee is currently active; production and archiving remain within the development framework.",
        "Symbolic publication fee — only after acceptance":
            "Publication fee — inactive / frozen",
        "symbolic publication fee only after acceptance · waivers available on request.":
            "publication fee inactive / frozen.",
        '"Fee Model"': '"Financial Framework · Inactive"',
        '"Модел на такси"': '"Финансиска рамка · неактивна"',
        '"Fee"': '"Status"',
        '"Цена"': '"Статус"',
    }
    for old, new in replacements.items():
        t = t.replace(old, new)
    t = patch_money_tokens(t)
    return t


def patch_journal_locale_fallbacks():
    candidates = [
        "journal/locales/journal/en.json",
        "journal/locales/journal/mk.json",
        "journal/locales/journal-issue-1/en.json",
        "journal/locales/journal-issue-1/mk.json",
        "locales/en/core.json",
        "locales/mk/core.json",
    ]
    for rel in candidates:
        p = ROOT / rel
        if p.exists():
            p.write_text(sanitize_journal_locale_text(p.read_text(encoding="utf-8")), encoding="utf-8")


def patch_digital_licence_archive():
    rel = "wpa-digital-licence-terms.html"
    t = read(rel)
    t = t.replace('<meta name="robots" content="index,follow">', '<meta name="robots" content="noindex,nofollow">')
    t = t.replace(
        "WPA Premium Digital Product Licence · Лиценца за премиум дигитални производи | World Protocol Academy",
        "WPA Digital Product Licence · Archived / Inactive | World Protocol Academy",
    )
    t = t.replace(
        "WPA Premium Digital Product Licence<br><span lang=\"mk\">Лиценца за премиум дигитални производи на WPA</span>",
        "WPA Digital Product Licence · ARCHIVED / INACTIVE<br><span lang=\"mk\">Архивирани услови · комерцијалниот слој е неактивен</span>",
    )
    t = t.replace(
        "Важи за сите платени дигитални производи на World Protocol Academy достапни преку Gumroad (вклучувајќи „Протокол на државни симболи, химни и национални денови“ и „WPA Working Papers — Author’s Compendium Edition“).",
        "Ова е архивска референтна верзија на условите. WPA во моментов нема активна јавна продажба преку оваа страница; Gumroad производите остануваат непубликувани додека комерцијалниот слој е замрзнат.",
    )
    t = t.replace(
        "Applies to paid WPA digital products distributed through Gumroad. Premium-only elements are licensed under these terms; separately published Zenodo records retain their record-specific Creative Commons licences.",
        "Archived reference terms only. No WPA product sale is active through this page; Gumroad products remain unpublished while the public commercial layer is frozen. Separately published Zenodo records retain their record-specific licences.",
    )
    t = re.sub(
        r'<div class="box">\s*<p style="margin:0;">Со завршување на купувањето.*?</div>',
        '<div class="box"><p style="margin:0;"><strong>INACTIVE / FROZEN.</strong> These archived terms are retained for reference and are not an active checkout, purchase invitation or current commercial offer.</p><p class="en" lang="en" style="margin:4px 0 0;">No transaction is enabled from this page.</p></div>',
        t, count=1, flags=re.S,
    )
    t = t.replace("Assoc. Prof. Dr. Sande Smiljanov", "Doc. Dr Sande Smiljanov")
    t = patch_money_tokens(t)
    write(rel, t)


def patch_canonical_note():
    rel = "docs/WPA_CANONICAL_REFERENCE_STATE_2026-08-26.md"
    t = read(rel)
    marker = "## Public commercial / financial status"
    if marker not in t:
        t += f'''\n\n{marker}\n\n**INACTIVE / FROZEN.** Until WPA explicitly adopts a future governance/legal activation decision, public surfaces must not display or activate pricing, fees, paid services, ticket prices, payment/checkout flows, paid subscriptions, paid licences, Gumroad sales links, or official paid credential issuance.\n\nAllowed during the freeze: informational content, public research, non-commercial previews, enquiries and expressions of interest that do not create a contract, payment obligation, paid delivery promise or credential entitlement.\n\nGumroad products may be retained as **unpublished drafts**; they are not to be deleted merely because the commercial layer is frozen.\n\nJournal, OPC, Certification, Services, Protocol Symbols and related pages are **preserved**; only their transaction/financial layer is frozen.\n'''
    write(rel, t)


def verify():
    for rel in ("opc2026/index.html", "opc2026/opc2026-conference.html"):
        t = read(rel)
        assert "Hotel Inex Olgica" not in t, rel
        assert "Декември 2026" not in t, rel
        assert "December 2026" not in t, rel
        assert "INACTIVE / FROZEN" in t, rel
        assert not re.search(r"€\s*\d|\d\s*€|\$\s*\d", t), rel

    card = read("opc2026/wpa-card-checkout.html")
    assert "financial layer inactive" in card
    assert not re.search(r"€\s*\d|\d\s*€|\$\s*\d", card)

    forbidden_journal = (
        "Симболична такса само по прифаќање",
        "Симболична такса за објавување (само по прифаќање)",
        "Само по прифаќање — symbolic publication fee",
        "A symbolic fee only after acceptance",
        "Symbolic fee only after acceptance",
        "Symbolic publication fee — only after acceptance",
        "symbolic publication fee only after acceptance",
    )
    journal = read("journal/vol-1-issue-1-2026.html")
    assert "Financial framework · INACTIVE / FROZEN" in journal
    for phrase in forbidden_journal:
        assert phrase not in journal, phrase
    assert "Во моментов нема активна такса за објавување или продукција" in journal
    assert "No publication or production fee is currently active" in journal
    assert not re.search(r"€\s*\d|\d\s*€|\$\s*\d|\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*(?:EUR|USD)\b", journal, re.I)

    for rel in (
        "journal/locales/journal/en.json",
        "journal/locales/journal/mk.json",
        "journal/locales/journal-issue-1/en.json",
        "journal/locales/journal-issue-1/mk.json",
        "locales/en/core.json",
        "locales/mk/core.json",
    ):
        p = ROOT / rel
        if p.exists():
            text = p.read_text(encoding="utf-8")
            for phrase in forbidden_journal:
                assert phrase not in text, f"{rel}: {phrase}"
            assert not re.search(r"€\s*\d|\d\s*€|\$\s*\d|\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*(?:EUR|USD)\b", text, re.I), rel

    licence = read("wpa-digital-licence-terms.html")
    assert "ARCHIVED / INACTIVE" in licence
    assert "Gumroad products remain unpublished" in licence
    assert 'content="noindex,nofollow"' in licence

    symbols = read("wpaws/protocol-symbols/index.html")
    assert "€19" not in symbols

    monetization = read("monetization-checklist.html")
    assert "INACTIVE / FROZEN" in monetization

    note = read("docs/WPA_CANONICAL_REFERENCE_STATE_2026-08-26.md")
    assert "## Public commercial / financial status" in note
    assert "unpublished drafts" in note


if __name__ == "__main__":
    patch_opc("opc2026/index.html")
    patch_opc("opc2026/opc2026-conference.html")
    patch_wpa_card_checkout()
    patch_journal_flipbook()
    patch_journal_locale_fallbacks()
    patch_digital_licence_archive()
    patch_canonical_note()
    verify()
    print("WPA preserve-first public financial freeze applied successfully.")
