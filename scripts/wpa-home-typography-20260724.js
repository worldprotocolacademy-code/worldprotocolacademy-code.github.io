/* WPA homepage typography and text-contrast system — 2026-07-30 */
(function () {
  'use strict';

  var path = String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  var isHome = page === 'index' || path === '/' || path === '/index.html';
  if (!isHome || document.getElementById('wpa-home-typography-colors-20260730')) return;

  var style = document.createElement('style');
  style.id = 'wpa-home-typography-colors-20260730';
  style.textContent = [
    'html[data-wpa-page="index"]{--wpa-type-navy:#0d1f3c;--wpa-type-copy:#26364a;--wpa-type-copy-soft:#3d4c60;--wpa-type-gold:#77540f;--wpa-type-gold-strong:#5e410a;--wpa-dark-title:#fff8ef;--wpa-dark-copy:#f8f1e6;--wpa-dark-gold:#f1d98e;}',

    /* Global section hierarchy */
    'html[data-wpa-page="index"] .section-title{color:var(--wpa-type-navy)!important;text-shadow:none!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .section-lead{color:var(--wpa-type-copy)!important;opacity:1!important;font-weight:450!important;}',
    'html[data-wpa-page="index"] .section-label{color:var(--wpa-type-gold)!important;opacity:1!important;font-weight:800!important;}',
    'html[data-wpa-page="index"] .section-label::before{background:#b58d2d!important;}',

    /* Light cards and content panels */
    'html[data-wpa-page="index"] .card h3,html[data-wpa-page="index"] .card h4,html[data-wpa-page="index"] .platform-card h3,html[data-wpa-page="index"] .platform-card h4,html[data-wpa-page="index"] .hub h3,html[data-wpa-page="index"] .hub h4,html[data-wpa-page="index"] .price-card h3,html[data-wpa-page="index"] .price-card h4,html[data-wpa-page="index"] .pub-body h3,html[data-wpa-page="index"] .pub-body h4,html[data-wpa-page="index"] .faq-q,html[data-wpa-page="index"] .bib-title,html[data-wpa-page="index"] .ai-command-center-link h3,html[data-wpa-page="index"] #sources-policy h4{color:var(--wpa-type-navy)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .card p,html[data-wpa-page="index"] .card li,html[data-wpa-page="index"] .card-list li,html[data-wpa-page="index"] .platform-card p,html[data-wpa-page="index"] .platform-card li,html[data-wpa-page="index"] .hub p,html[data-wpa-page="index"] .hub li,html[data-wpa-page="index"] .price-text,html[data-wpa-page="index"] .price-list li,html[data-wpa-page="index"] .pub-body p,html[data-wpa-page="index"] .faq-a,html[data-wpa-page="index"] .bib-meta,html[data-wpa-page="index"] .platform-creator-content>p,html[data-wpa-page="index"] .ai-command-center-link p,html[data-wpa-page="index"] .wpa-core-doc-card span{color:var(--wpa-type-copy)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] p[style*="color:var(--muted)"],html[data-wpa-page="index"] p[style*="color: var(--muted)"],html[data-wpa-page="index"] span[style*="color:var(--muted)"],html[data-wpa-page="index"] span[style*="color: var(--muted)"]{color:var(--wpa-type-copy)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .jump-menu-bar-label,html[data-wpa-page="index"] .platform-creator-title,html[data-wpa-page="index"] .doctrine small{color:var(--wpa-type-copy-soft)!important;opacity:1!important;}',

    /* Kicker, metadata and links */
    'html[data-wpa-page="index"] .card-kicker,html[data-wpa-page="index"] .small-kicker,html[data-wpa-page="index"] .faq-num,html[data-wpa-page="index"] .bib-num,html[data-wpa-page="index"] .pub-meta{color:var(--wpa-type-gold)!important;opacity:1!important;font-weight:800!important;}',
    'html[data-wpa-page="index"] .card-link,html[data-wpa-page="index"] .hub-link,html[data-wpa-page="index"] .pub-body a,html[data-wpa-page="index"] .wpa-core-doc-card em,html[data-wpa-page="index"] .plink span:last-child,html[data-wpa-page="index"] span[style*="color:var(--goldd)"],html[data-wpa-page="index"] span[style*="color: var(--goldd)"]{color:var(--wpa-type-gold-strong)!important;opacity:1!important;font-weight:750!important;}',
    'html[data-wpa-page="index"] .plink span:first-child{color:#1c2d43!important;font-weight:700!important;}',
    'html[data-wpa-page="index"] .plink{color:#1c2d43!important;border-color:#bfae86!important;}',
    'html[data-wpa-page="index"] .plink:hover{border-color:#9a7420!important;background:#fffaf0!important;}',

    /* Programme, certification, membership, partnerships and services cards */
    'html[data-wpa-page="index"] [id*="programme"] .card,html[data-wpa-page="index"] [id*="program"] .card,html[data-wpa-page="index"] [id*="certif"] .card,html[data-wpa-page="index"] [id*="member"] .card,html[data-wpa-page="index"] [id*="partner"] .card,html[data-wpa-page="index"] [id*="service"] .card,html[data-wpa-page="index"] [id*="brief"] .card,html[data-wpa-page="index"] [id*="profile"] .card{border-color:#c9b886!important;}',
    'html[data-wpa-page="index"] [id*="programme"] .card:hover,html[data-wpa-page="index"] [id*="program"] .card:hover,html[data-wpa-page="index"] [id*="certif"] .card:hover,html[data-wpa-page="index"] [id*="member"] .card:hover,html[data-wpa-page="index"] [id*="partner"] .card:hover,html[data-wpa-page="index"] [id*="service"] .card:hover,html[data-wpa-page="index"] [id*="brief"] .card:hover,html[data-wpa-page="index"] [id*="profile"] .card:hover{border-color:#a98228!important;box-shadow:0 12px 38px rgba(13,31,60,.15)!important;}',

    /* Buttons and navigation elements inside light sections */
    'html[data-wpa-page="index"] section:not(.hero):not(.dark-section) .btn-outline{color:var(--wpa-type-navy)!important;border-color:#a98228!important;background:rgba(255,255,255,.72)!important;}',
    'html[data-wpa-page="index"] section:not(.hero):not(.dark-section) .btn-outline:hover,html[data-wpa-page="index"] section:not(.hero):not(.dark-section) .btn-outline:focus-visible{color:#071326!important;background:#e8d49a!important;border-color:#8f6b18!important;}',
    'html[data-wpa-page="index"] .jmp{color:#26364a!important;border-color:#b9aa89!important;font-weight:750!important;}',
    'html[data-wpa-page="index"] .jmp:hover{color:#071326!important;background:#e8d49a!important;border-color:#a98228!important;}',

    /* Pricing, payments and access */
    'html[data-wpa-page="index"] .price-amount,html[data-wpa-page="index"] .price-card h4{color:var(--wpa-type-navy)!important;}',
    'html[data-wpa-page="index"] .price-amount span{color:var(--wpa-type-copy-soft)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .pill{color:var(--wpa-type-navy)!important;border-color:#bca979!important;font-weight:700!important;}',
    'html[data-wpa-page="index"] [id*="payment"] p,html[data-wpa-page="index"] [id*="pricing"] p,html[data-wpa-page="index"] [id*="access"] p{color:var(--wpa-type-copy)!important;opacity:1!important;}',

    /* Bibliography, channels, academic profiles, Virtual Sande and WPA Labs */
    'html[data-wpa-page="index"] [id*="bibli"] p,html[data-wpa-page="index"] [id*="channel"] p,html[data-wpa-page="index"] [id*="profile"] p,html[data-wpa-page="index"] [id*="virtual"] p,html[data-wpa-page="index"] [id*="labs"] p,html[data-wpa-page="index"] #sources-policy p{color:var(--wpa-type-copy)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] [id*="bibli"] h3,html[data-wpa-page="index"] [id*="channel"] h3,html[data-wpa-page="index"] [id*="profile"] h3,html[data-wpa-page="index"] [id*="virtual"] h3,html[data-wpa-page="index"] [id*="labs"] h3{color:var(--wpa-type-navy)!important;opacity:1!important;}',

    /* Strong, high-contrast hierarchy on every dark navy section */
    'html[data-wpa-page="index"] .dark-section .section-title,html[data-wpa-page="index"] .dark-section h2,html[data-wpa-page="index"] .dark-section h3,html[data-wpa-page="index"] .dark-section h4,html[data-wpa-page="index"] .hero h2,html[data-wpa-page="index"] .wpa-core-docs-hub h3,html[data-wpa-page="index"] .wpa-latest-pn h4,html[data-wpa-page="index"] .wpa-ai-command-card h3,html[data-wpa-page="index"] .cta-band h3{color:var(--wpa-dark-title)!important;opacity:1!important;text-shadow:none!important;}',
    'html[data-wpa-page="index"] .dark-section .section-lead,html[data-wpa-page="index"] .dark-section p,html[data-wpa-page="index"] .dark-section li,html[data-wpa-page="index"] .dark-section span:not(.section-label):not(.card-kicker):not(.small-kicker),html[data-wpa-page="index"] .hero-sub,html[data-wpa-page="index"] .wpa-core-docs-hub>p,html[data-wpa-page="index"] .wpa-latest-pn p,html[data-wpa-page="index"] .wpa-ai-command-card p,html[data-wpa-page="index"] .cta-band p{color:var(--wpa-dark-copy)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .dark-section .section-label,html[data-wpa-page="index"] .dark-section .card-kicker,html[data-wpa-page="index"] .dark-section .small-kicker,html[data-wpa-page="index"] .wpa-core-docs-kicker,html[data-wpa-page="index"] .wpa-latest-pn-kicker,html[data-wpa-page="index"] .wpa-latest-pn-en,html[data-wpa-page="index"] .hero-eyebrow{color:var(--wpa-dark-gold)!important;opacity:1!important;font-weight:800!important;}',
    'html[data-wpa-page="index"] .matrix-item span,html[data-wpa-page="index"] .policy-box,html[data-wpa-page="index"] .policy-box p,html[data-wpa-page="index"] .policy-box li,html[data-wpa-page="index"] .policy-rule{color:var(--wpa-dark-copy)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .matrix-item strong,html[data-wpa-page="index"] .policy-box strong{color:var(--wpa-dark-gold)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .dark-section a:not(.btn),html[data-wpa-page="index"] .cta-band a:not(.btn){color:var(--wpa-dark-gold)!important;opacity:1!important;}',

    /* Status, legal and identity notices */
    'html[data-wpa-page="index"] .wpa-status-ribbon,html[data-wpa-page="index"] .wpa-status-ribbon span{color:#f8f1e6!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .wpa-status-ribbon strong{color:#f1d98e!important;}',
    'html[data-wpa-page="index"] .wpa-identity-safe-card,html[data-wpa-page="index"] .wpa-identity-safe-card .wpa-safe-status,html[data-wpa-page="index"] .wpa-identity-safe-card .wpa-author-line{color:#26364a!important;}',
    'html[data-wpa-page="index"] .wpa-legal-disclaimer{color:#2f3d50!important;border-left-color:#a98228!important;}',

    '@media(max-width:640px){html[data-wpa-page="index"] .section-lead{font-size:15.5px!important;line-height:1.72!important;}html[data-wpa-page="index"] .card p,html[data-wpa-page="index"] .card li,html[data-wpa-page="index"] .faq-a{font-size:13.5px!important;line-height:1.68!important;}}'
  ].join('');

  document.head.appendChild(style);
})();