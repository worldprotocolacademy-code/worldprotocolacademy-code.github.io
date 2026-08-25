/* WPA runtime loader — Institute identity and tool placement */
(function () {
  'use strict';

  var PILOT_URL = '/data/global-institutions/pilot-20/v1.3.1/';
  var SUBLIMATE_URL = '/wpa-sublimate-engine.html';
  var JOURNAL_LIVE_URL = '/journal/live/';
  var PN003_DOI_URL = 'https://doi.org/10.5281/zenodo.21390763';

  function path() {
    return String(window.location.pathname || '').replace(/\/+$/, '') || '/';
  }

  function page() {
    return String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  }

  function isInstitute() {
    return page() === 'institute' || path().toLowerCase() === '/institute.html';
  }

  function isHome() {
    return page() === 'index' || path() === '/' || path() === '/index.html';
  }

  function isPapers() {
    return path().toLowerCase() === '/papers.html';
  }

  function addStylesheet(id, href) {
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function addScript(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  function makeLink(id, className, href, label, title) {
    var link = document.getElementById(id);
    if (!link) {
      link = document.createElement('a');
      link.id = id;
    }
    link.className = className;
    link.href = href;
    link.textContent = label;
    link.title = title || label;
    link.setAttribute('translate', 'no');
    link.setAttribute('data-no-i18n', 'true');
    return link;
  }

  function ensureInstituteStyles() {
    if (document.getElementById('wpa-institute-tools-runtime-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-institute-tools-runtime-style';
    style.textContent = [
      'html[data-wpa-page="institute"] .wpa-institute-brand{cursor:default!important;text-decoration:none!important;display:flex!important;align-items:center!important;min-width:290px!important;}',
      'html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark{display:none!important;}',
      'html[data-wpa-page="institute"] .wpa-institute-brand .brand-text{display:flex!important;flex-direction:column!important;gap:2px!important;line-height:1.15!important;}',
      'html[data-wpa-page="institute"] .wpa-institute-label{display:block!important;color:#e3c878!important;font:800 16px/1.1 Inter,system-ui,sans-serif!important;letter-spacing:.03em!important;white-space:nowrap!important;}',
      'html[data-wpa-page="institute"] .wpa-institute-name-mk{display:block!important;color:#fbf8ee!important;font:700 11px/1.35 Inter,system-ui,sans-serif!important;letter-spacing:.01em!important;}',
      'html[data-wpa-page="institute"] .wpa-institute-name-en{display:block!important;color:rgba(227,200,120,.82)!important;font:600 10px/1.35 Inter,system-ui,sans-serif!important;letter-spacing:.01em!important;}',
      'html[data-wpa-page="institute"] .wpa-pilot20-institute-nav-link,html[data-wpa-page="institute"] .wpa-journal-live-entry,html[data-wpa-page="institute"] .wpa-sublimate-institute-nav-link{font-weight:600!important;border-color:transparent!important;background:transparent!important;}',
      'html[data-wpa-page="institute"] .wpa-sublimate-hero-button,html[data-wpa-page="institute"] #wpaLiveInstituteHeroLink{margin-left:0!important;}',
      '@media(max-width:760px){html[data-wpa-page="institute"] .wpa-institute-brand{min-width:0!important;width:100%!important;}html[data-wpa-page="institute"] .wpa-institute-label{font-size:14px!important;}html[data-wpa-page="institute"] .wpa-institute-name-mk,html[data-wpa-page="institute"] .wpa-institute-name-en{font-size:9.5px!important;}html[data-wpa-page="institute"] .wpa-sublimate-hero-button,html[data-wpa-page="institute"] #wpaLiveInstituteHeroLink{width:100%!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function normalizeInstituteBrand() {
    var brand = document.querySelector('.nav-wrap nav .brand');
    if (!brand) return;

    brand.removeAttribute('href');
    brand.removeAttribute('target');
    brand.classList.add('wpa-institute-brand');
    brand.setAttribute('aria-label', 'WPA Institute');
    brand.setAttribute('translate', 'no');
    brand.setAttribute('data-no-i18n', 'true');

    var mark = brand.querySelector('.brand-mark');
    if (mark) mark.remove();

    var logo = brand.querySelector('.wpa-institute-logo');
    if (!logo) {
      logo = document.createElement('img');
      logo.className = 'wpa-institute-logo';
      logo.src = '/logo.webp';
      logo.alt = 'World Protocol Academy logo';
      logo.width = 48;
      logo.height = 48;
      logo.loading = 'eager';
      logo.decoding = 'sync';
      brand.insertBefore(logo, brand.firstChild);
    }

    var text = brand.querySelector('.brand-text');
    if (text) {
      text.innerHTML = '<span class="wpa-institute-label">WPA Institute</span><span class="wpa-institute-name-mk">Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</span><span class="wpa-institute-name-en" lang="en">Institute for Protocol, Diplomacy, Public Communication and Security Studies</span>';
    }
  }

  function placeInstituteTools() {
    var nav = document.querySelector('.nav-wrap nav .nav-links');
    if (nav) {
      var tools = nav.querySelector('a[href="#wpa-public-tools-hub"]');
      var pilot = makeLink('wpaPilot20InstituteNav', 'wpa-pilot20-inline-link wpa-pilot20-institute-nav-link', PILOT_URL, 'Pilot 20', 'WPA Pilot 20');
      if (tools) tools.insertAdjacentElement('afterend', pilot); else nav.appendChild(pilot);

      var journalAnchor = nav.querySelector('a[href="journal/index.html"]');
      var journal = makeLink('wpaLiveInstituteNavLink', 'wpa-journal-live-entry', JOURNAL_LIVE_URL, 'Journal Live', 'WPA Journal Live');
      if (journalAnchor) nav.insertBefore(journal, journalAnchor); else nav.appendChild(journal);

      var opc = nav.querySelector('a[href="#opc-banner"]');
      var sublimate = makeLink('wpaSublimateInstituteNav', 'wpa-sublimate-institute-nav-link', SUBLIMATE_URL, 'WPA Sublimate', 'WPA Sublimate Engine Preview');
      if (opc) opc.insertAdjacentElement('afterend', sublimate); else nav.appendChild(sublimate);
    }

    var hero = document.querySelector('.hero .hero-cta');
    if (hero) {
      var protocolometry = hero.querySelector('a[href="/protocolometry-center.html"]');
      var pilotHero = makeLink('wpaPilot20InstituteHero', 'btn btn-primary wpa-pilot20-hero-button', PILOT_URL, 'Pilot 20', 'WPA Pilot 20');
      if (protocolometry) protocolometry.insertAdjacentElement('afterend', pilotHero); else hero.appendChild(pilotHero);

      var briefings = hero.querySelector('a[href="wpa-briefings.html"]');
      var subHero = makeLink('wpaSublimateInstituteHero', 'btn btn-primary wpa-sublimate-hero-button', SUBLIMATE_URL, 'Отвори WPA Sublimate', 'WPA Sublimate Engine Preview');
      var journalHero = makeLink('wpaLiveInstituteHeroLink', 'btn btn-primary wpa-journal-live-entry', JOURNAL_LIVE_URL, 'Отвори WPA Journal Live', 'WPA Journal Live');

      if (briefings) {
        briefings.insertAdjacentElement('afterend', subHero);
        subHero.insertAdjacentElement('afterend', journalHero);
      } else {
        hero.appendChild(subHero);
        hero.appendChild(journalHero);
      }
    }
  }

  function placeHomePilot() {
    var list = document.querySelector('header .site-nav ul');
    if (!list || document.getElementById('wpaPilot20HomeNav')) return;
    var item = document.createElement('li');
    item.id = 'wpaPilot20HomeNav';
    item.appendChild(makeLink('wpaPilot20HomeLink', 'wpa-pilot20-nav-link', PILOT_URL, 'Pilot 20', 'WPA Pilot 20'));
    list.appendChild(item);
  }

  function activateHomeFiveRowNav() {
    if (!isHome()) return;
    var root = document.documentElement;
    var list = document.querySelector('header .site-nav ul');
    if (!list) return;

    root.classList.add('wpa-home-five-row-nav');
    list.classList.add('wpa-five-row-nav-grid');

    var count = list.querySelectorAll(':scope > li').length;
    var columns = Math.max(6, Math.ceil(count / 5));
    list.style.setProperty('--wpa-nav-columns', String(columns));
  }

  function updateTextOnce(selector, before, after) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i += 1) {
      if (String(nodes[i].textContent || '').trim() === before) {
        nodes[i].textContent = after;
        return true;
      }
    }
    return false;
  }

  function placePn003OnPapers() {
    var section = document.getElementById('wpa-protocol-notes');
    if (!section) return;

    updateTextOnce('#wpa-protocol-notes h3', 'Two applied protocolometry records — open access via Zenodo.', 'Three applied protocolometry records — open access via Zenodo.');

    var paragraphs = section.querySelectorAll('.section-header p');
    for (var i = 0; i < paragraphs.length; i += 1) {
      if (paragraphs[i].textContent.indexOf('PN-001 and PN-002 are published Zenodo DOI records') !== -1) {
        paragraphs[i].innerHTML = '<strong>Publication status:</strong> PN-001, PN-002 and PN-003 are published Zenodo DOI records. WPA-PN-003 was published on 16 July 2026 and is counted among the 15 published WPA Zenodo records.';
      }
    }

    updateTextOnce('.hero-list li', '2 WPA Protocol Notes with Zenodo DOI records', '3 WPA Protocol Notes with Zenodo DOI records');
    updateTextOnce('.hero-list li', '14 total WPA Zenodo DOI records across the two WPA series, separate from the 25-publication academic corpus', '15 total WPA Zenodo DOI records across the two WPA series, separate from the 25-publication academic corpus');

    var statSpans = document.querySelectorAll('.stat-card span');
    for (var s = 0; s < statSpans.length; s += 1) {
      if (String(statSpans[s].textContent || '').trim() === 'WPA Protocol Notes · Zenodo DOI') {
        var strong = statSpans[s].parentElement && statSpans[s].parentElement.querySelector('strong');
        if (strong) strong.textContent = '3';
      }
    }

    var grid = section.querySelector('.grid-3');
    if (grid && !document.getElementById('wpaPn003PapersCard')) {
      var card = document.createElement('article');
      card.className = 'card';
      card.id = 'wpaPn003PapersCard';
      card.innerHTML = '<span class="small-kicker">WPA-PN-003 · Applied Protocolometry Record</span><h4 class="paper-title">Les Invalides 2026 — The Coalition of the Willing Summit and Bastille Day, Paris, 13–14 July 2026</h4><p class="paper-summary">A bilingual protocol note analysing the integrated two-day ceremonial architecture of the Coalition of the Willing summit and the French state ceremonies through chrono-binding, ceremonial condensation, Evidence Ladder+, visual statecraft and applied protocolometry.</p><div class="paper-tags"><span class="tag">Protocol Note</span><span class="tag">Les Invalides</span><span class="tag">Evidence Ladder+</span></div><div class="paper-actions"><a class="btn btn-secondary" href="' + PN003_DOI_URL + '" target="_blank" rel="noopener">→ Zenodo DOI</a></div>';
      grid.appendChild(card);
    }

    var actions = section.querySelector('div[style*="margin-top:22px"]');
    if (actions && !document.getElementById('wpaPn003DoiButton')) {
      var bibliography = actions.querySelector('a[href*="/bibliography/"]');
      var doi = makeLink('wpaPn003DoiButton', 'btn btn-secondary', PN003_DOI_URL, 'PN-003 DOI →', 'WPA-PN-003 Zenodo DOI');
      doi.target = '_blank';
      doi.rel = 'noopener';
      if (bibliography) actions.insertBefore(doi, bibliography); else actions.appendChild(doi);
    }
  }

  function ensureVirtualSandeBrandingStyles() {
    if (document.getElementById('wpa-virtual-sande-branding-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-virtual-sande-branding-style';
    style.textContent = [
      '.wpa-virtual-sande-brand{display:flex!important;align-items:center!important;gap:10px!important;min-width:0!important;}',
      '.wpa-virtual-sande-mark{width:36px!important;height:36px!important;flex:0 0 36px!important;border-radius:50%!important;overflow:hidden!important;display:grid!important;place-items:center!important;background:#0d1f3c!important;border:1px solid rgba(201,168,76,.72)!important;box-shadow:0 4px 14px rgba(0,0,0,.22)!important;color:#e8d49a!important;font:800 9px/1 system-ui,sans-serif!important;letter-spacing:.04em!important;}',
      '.wpa-virtual-sande-mark img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;}',
      '.wpa-virtual-sande-copy{min-width:0!important;}',
      '@media(max-width:520px){.wpa-virtual-sande-mark{width:32px!important;height:32px!important;flex-basis:32px!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function brandVirtualSandeHeader(header, titleSelector) {
    if (!header || header.querySelector('.wpa-virtual-sande-mark')) return;
    var title = header.querySelector(titleSelector);
    if (!title) return;
    var copy = title.parentElement;
    if (!copy || !copy.parentNode) return;

    ensureVirtualSandeBrandingStyles();
    copy.classList.add('wpa-virtual-sande-copy');

    var brand = document.createElement('div');
    brand.className = 'wpa-virtual-sande-brand';
    brand.setAttribute('translate', 'no');
    brand.setAttribute('data-no-i18n', 'true');

    var mark = document.createElement('span');
    mark.className = 'wpa-virtual-sande-mark';
    mark.setAttribute('aria-label', 'World Protocol Academy');
    mark.textContent = 'WPA';

    var image = document.createElement('img');
    image.src = '/logo.webp';
    image.alt = 'World Protocol Academy logo';
    image.width = 36;
    image.height = 36;
    image.loading = 'eager';
    image.decoding = 'async';
    image.addEventListener('load', function () {
      mark.textContent = '';
      mark.appendChild(image);
    }, { once: true });
    image.addEventListener('error', function () {
      mark.textContent = 'WPA';
    }, { once: true });

    copy.parentNode.insertBefore(brand, copy);
    brand.appendChild(mark);
    brand.appendChild(copy);
  }

  function placeVirtualSandeBranding() {
    brandVirtualSandeHeader(document.querySelector('.bot-hd'), '.bot-title');
    brandVirtualSandeHeader(document.querySelector('.wpa2-bot-header'), '.wpa2-bot-title');
  }

  function boot() {
    if (isInstitute()) {
      ensureInstituteStyles();
      normalizeInstituteBrand();
      placeInstituteTools();
    }
    if (isHome()) {
      placeHomePilot();
      activateHomeFiveRowNav();
    }
    // Legacy PN-003/25-publication patch retired 2026-08-25; public facts are maintained in /data/wpa-canonical-public-facts.json.
    placeVirtualSandeBranding();
  }

  if (isInstitute()) {
    addStylesheet('wpa-institute-compact-brand-css', '/styles/wpa-institute-compact-brand.css?v=20260714-identity2');
    addScript('wpa-institute-virtual-sande-widget', '/scripts/virtual-sande-institute-widget.js?v=20260716-1');
  } else {
    addScript('wpa-public-virtual-sande-widget', '/scripts/virtual-sande-public-widget.js?v=20260716-1');
  }
  if (isHome()) addStylesheet('wpa-home-five-row-nav-css', '/styles/wpa-home-nav-five-rows.css?v=20260810-2');
  addStylesheet('wpa-pilot20-badge-css', '/styles/wpa-pilot20-badge.css?v=20260714-3');
  addScript('wpa-professional-contacts-runtime', '/scripts/wpa-professional-contacts.js?v=20260722');

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  window.setTimeout(boot, 250);
  window.setTimeout(boot, 1000);
  window.addEventListener('resize', boot);

  addScript('wpa-performance-core-runtime', '/scripts/wpa-performance-core.js?v=20260714-3');
})();
