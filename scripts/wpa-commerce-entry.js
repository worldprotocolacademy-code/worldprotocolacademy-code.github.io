/* WPA Commerce Entry v1.2 — 2026-10-02
   Homepage/navigation entry for the PRELAUNCH commerce hub.
   Loaded from scripts/pricing-loader.js on the homepage.
   No prices are duplicated here; commerce config/hub remain the source of truth.
*/
(function () {
  'use strict';

  function currentLanguage() {
    try {
      return localStorage.getItem('wpa.language') === 'en' ? 'en' : 'mk';
    } catch (_) {
      return document.documentElement.lang === 'en' ? 'en' : 'mk';
    }
  }

  function copy() {
    return currentLanguage() === 'en' ? {
      nav: 'WPA Access & Publications',
      title: 'WPA Access & Publications',
      text: 'Digital editions, membership architecture and Human-Gated commerce in PRELAUNCH review.',
      cta: 'Open Access & Publications →'
    } : {
      nav: 'WPA Пристап и публикации',
      title: 'WPA Пристап и публикации',
      text: 'Дигитални изданија, членска архитектура и Human-Gated commerce во PRELAUNCH review.',
      cta: 'Отвори Пристап и публикации →'
    };
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function syncNavLink() {
    var nav = document.querySelector('.site-nav ul, header nav ul');
    var existing = document.getElementById('wpaCommerceNavItem');

    if (!nav) {
      if (existing) existing.remove();
      return;
    }

    var c = copy();

    if (!existing) {
      var li = el('li');
      li.id = 'wpaCommerceNavItem';
      var a = el('a', '', c.nav);
      a.href = '/commerce.html';
      li.appendChild(a);

      var card = nav.querySelector('a[href*="wpa-card.html"]');
      if (card && card.closest('li')) card.closest('li').insertAdjacentElement('afterend', li);
      else nav.appendChild(li);

      // Fail closed on narrow/no-wrap navigation: remove the extra item if it introduces overflow.
      if (!nav.clientWidth || nav.scrollWidth > nav.clientWidth + 4) {
        li.remove();
        return;
      }
      existing = li;
    }

    var link = existing.querySelector('a');
    if (link) link.textContent = c.nav;
  }

  function syncHomeCard() {
    if (!/^(\/|\/index\.html)$/.test(location.pathname)) return;

    // Canonical homepage structure.
    var target = document.querySelector('#core-pages .wpa-core-docs-grid');
    if (!target) return;

    var c = copy();
    var card = document.getElementById('wpaCommerceEntry');

    if (!card) {
      card = el('a', 'wpa-core-doc-card');
      card.id = 'wpaCommerceEntry';
      card.href = '/commerce.html';

      var icon = el('div', 'wpa-core-doc-icon', '◈');
      icon.setAttribute('aria-hidden', 'true');
      card.appendChild(icon);
      card.appendChild(el('strong', 'wpa-commerce-entry-title'));
      card.appendChild(el('span', 'wpa-commerce-entry-text'));
      card.appendChild(el('em', 'wpa-commerce-entry-cta'));
      target.appendChild(card);
    }

    card.querySelector('.wpa-commerce-entry-title').textContent = c.title;
    card.querySelector('.wpa-commerce-entry-text').textContent = c.text;
    card.querySelector('.wpa-commerce-entry-cta').textContent = c.cta;
  }

  function boot() {
    syncNavLink();
    syncHomeCard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('wpa:lang-changed', boot);
  window.addEventListener('resize', function () {
    window.clearTimeout(window.__wpaCommerceResizeTimer);
    window.__wpaCommerceResizeTimer = window.setTimeout(syncNavLink, 120);
  });
})();
