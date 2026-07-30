/* WPA homepage typography and text-contrast system — 2026-07-24 */
(function () {
  'use strict';

  var path = String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  var isHome = page === 'index' || path === '/' || path === '/index.html';
  if (!isHome || document.getElementById('wpa-home-typography-colors-20260724')) return;

  var style = document.createElement('style');
  style.id = 'wpa-home-typography-colors-20260724';
  style.textContent = [
    'html[data-wpa-page="index"]{--wpa-type-navy:#0d1f3c;--wpa-type-copy:#334155;--wpa-type-copy-soft:#455468;--wpa-type-gold:#7b5a16;--wpa-type-gold-strong:#68480c;}',

    /* Main section hierarchy */
    'html[data-wpa-page="index"] .section-title{color:var(--wpa-type-navy)!important;text-shadow:none!important;}',
    'html[data-wpa-page="index"] .section-lead{color:var(--wpa-type-copy)!important;opacity:1!important;font-weight:400!important;}',
    'html[data-wpa-page="index"] .section-label{color:var(--wpa-type-gold)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .section-label::before{background:#b58d2d!important;}',

    /* Headings on light cards and content panels */
    'html[data-wpa-page="index"] .card h4,html[data-wpa-page="index"] .platform-card h4,html[data-wpa-page="index"] .hub h4,html[data-wpa-page="index"] .price-card h4,html[data-wpa-page="index"] .pub-body h4,html[data-wpa-page="index"] .faq-q,html[data-wpa-page="index"] .bib-title,html[data-wpa-page="index"] .ai-command-center-link h3,html[data-wpa-page="index"] #sources-policy h4{color:var(--wpa-type-navy)!important;opacity:1!important;}',

    /* Descriptive text, lists and legal/academic copy */
    'html[data-wpa-page="index"] .card p,html[data-wpa-page="index"] .card-list li,html[data-wpa-page="index"] .platform-card p,html[data-wpa-page="index"] .hub p,html[data-wpa-page="index"] .price-text,html[data-wpa-page="index"] .price-list li,html[data-wpa-page="index"] .pub-body p,html[data-wpa-page="index"] .faq-a,html[data-wpa-page="index"] .bib-meta,html[data-wpa-page="index"] .platform-creator-content>p,html[data-wpa-page="index"] .ai-command-center-link p,html[data-wpa-page="index"] .wpa-core-doc-card span{color:var(--wpa-type-copy)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] p[style*="color:var(--muted)"],html[data-wpa-page="index"] p[style*="color: var(--muted)"],html[data-wpa-page="index"] span[style*="color:var(--muted)"],html[data-wpa-page="index"] span[style*="color: var(--muted)"]{color:var(--wpa-type-copy)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] #sources-policy p[style*="color:var(--muted)"],html[data-wpa-page="index"] #sources-policy p[style*="color: var(--muted)"]{color:#2f3d50!important;}',
    'html[data-wpa-page="index"] .jump-menu-bar-label,html[data-wpa-page="index"] .platform-creator-title,html[data-wpa-page="index"] .doctrine small{color:var(--wpa-type-copy-soft)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .doctrine p{color:var(--wpa-type-navy)!important;}',

    /* Kicker, metadata and action hierarchy */
    'html[data-wpa-page="index"] .card-kicker,html[data-wpa-page="index"] .faq-num,html[data-wpa-page="index"] .bib-num{color:var(--wpa-type-gold)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .card-link,html[data-wpa-page="index"] .hub-link,html[data-wpa-page="index"] .pub-body a,html[data-wpa-page="index"] .wpa-core-doc-card em,html[data-wpa-page="index"] .plink span:last-child,html[data-wpa-page="index"] span[style*="color:var(--goldd)"],html[data-wpa-page="index"] span[style*="color: var(--goldd)"]{color:var(--wpa-type-gold-strong)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .plink span:first-child{color:#1c2d43!important;font-weight:650!important;}',
    'html[data-wpa-page="index"] .plink{color:#1c2d43!important;border-color:#cfc2a4!important;}',
    'html[data-wpa-page="index"] .plink:hover{border-color:#a98228!important;background:#fffaf0!important;}',

    /* Buttons and navigation elements inside light sections */
    'html[data-wpa-page="index"] section:not(.hero):not(.dark-section) .btn-outline{color:var(--wpa-type-navy)!important;border-color:#a98228!important;background:rgba(255,255,255,.62)!important;}',
    'html[data-wpa-page="index"] section:not(.hero):not(.dark-section) .btn-outline:hover,html[data-wpa-page="index"] section:not(.hero):not(.dark-section) .btn-outline:focus-visible{color:#071326!important;background:#e8d49a!important;border-color:#a98228!important;}',
    'html[data-wpa-page="index"] .jmp{color:#26364a!important;border-color:#b9aa89!important;font-weight:700!important;}',
    'html[data-wpa-page="index"] .jmp:hover{color:#071326!important;background:#e8d49a!important;border-color:#a98228!important;}',

    /* Pricing, membership and access */
    'html[data-wpa-page="index"] .price-amount,html[data-wpa-page="index"] .price-card h4{color:var(--wpa-type-navy)!important;}',
    'html[data-wpa-page="index"] .price-amount span{color:var(--wpa-type-copy-soft)!important;opacity:1!important;}',
    'html[data-wpa-page="index"] .pill{color:var(--wpa-type-navy)!important;border-color:#c8b98f!important;font-weight:650!important;}',

    /* Light legal, status and identity boxes */
    'html[data-wpa-page="index"] .wpa-identity-safe-card,html[data-wpa-page="index"] .wpa-identity-safe-card .wpa-safe-status,html[data-wpa-page="index"] .wpa-identity-safe-card .wpa-author-line{color:#26364a!important;}',
    'html[data-wpa-page="index"] .wpa-legal-disclaimer{color:#2f3d50!important;border-left-color:#a98228!important;}',

    /* Preserve the intended light/gold hierarchy on dark surfaces */
    'html[data-wpa-page="index"] .dark-section .section-title,html[data-wpa-page="index"] .wpa-core-docs-hub h3,html[data-wpa-page="index"] .wpa-latest-pn h4,html[data-wpa-page="index"] .wpa-ai-command-card h3{color:#f8f4ee!important;}',
    'html[data-wpa-page="index"] .dark-section .section-lead,html[data-wpa-page="index"] .wpa-core-docs-hub>p,html[data-wpa-page="index"] .wpa-latest-pn p,html[data-wpa-page="index"] .wpa-ai-command-card p{color:rgba(248,244,238,.84)!important;}',
    'html[data-wpa-page="index"] .dark-section .section-label,html[data-wpa-page="index"] .wpa-core-docs-kicker,html[data-wpa-page="index"] .wpa-latest-pn-kicker,html[data-wpa-page="index"] .wpa-latest-pn-en{color:#e8d49a!important;}',
    'html[data-wpa-page="index"] .matrix-item span{color:rgba(248,244,238,.84)!important;}',
    'html[data-wpa-page="index"] .matrix-item strong{color:#e8d49a!important;}',
    'html[data-wpa-page="index"] .policy-box,html[data-wpa-page="index"] .policy-box p,html[data-wpa-page="index"] .policy-box li,html[data-wpa-page="index"] .policy-rule{color:rgba(248,244,238,.88)!important;}',
    'html[data-wpa-page="index"] .policy-box strong{color:#e8d49a!important;}',
    'html[data-wpa-page="index"] .cta-band h3{color:#f8f4ee!important;}',
    'html[data-wpa-page="index"] .cta-band p{color:rgba(248,244,238,.82)!important;}',

    /* Mobile keeps the same hierarchy without reducing legibility */
    '@media(max-width:640px){html[data-wpa-page="index"] .section-lead{font-size:15.5px!important;line-height:1.7!important;}html[data-wpa-page="index"] .card p,html[data-wpa-page="index"] .card-list li,html[data-wpa-page="index"] .faq-a{font-size:13.5px!important;line-height:1.65!important;}}'
  ].join('');

  document.head.appendChild(style);
})();