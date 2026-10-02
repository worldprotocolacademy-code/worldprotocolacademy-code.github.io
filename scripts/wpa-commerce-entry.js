(function () {
  'use strict';

  function currentLanguage() {
    try {
      return localStorage.getItem('wpa.language') === 'en' ? 'en' : 'mk';
    } catch (_) {
      return 'mk';
    }
  }

  function copy() {
    var en = currentLanguage() === 'en';
    return en ? {
      nav: 'WPA Access & Publications',
      kicker: 'Access · Publications · Membership',
      title: 'WPA Access & Publications',
      text: 'Two controlled payment routes: secure online provider when the offer is live, or Human Gate review followed by approved bank-transfer instructions. One-time digital products and future WPA membership.',
      p1: 'EUR 19 · State Symbols / Anthems / National Days 2026',
      p2: 'EUR 59 · WPA Working Papers & Protocol Notes Compendium 2026',
      p3: 'WPA Pro / Academic Pro · pricing activates only after Human Gate approval',
      button: 'Open WPA Access & Publications'
    } : {
      nav: 'WPA Пристап и публикации',
      kicker: 'Пристап · Публикации · Членство',
      title: 'WPA Пристап и публикации',
      text: 'Два контролирани платежни патишта: сигурен online provider кога понудата е активна, или Human Gate проверка со одобрени инструкции за банкарска уплата. Еднократни дигитални производи и идно WPA членство.',
      p1: '€19 · Државни симболи / химни / национални денови 2026',
      p2: '€59 · WPA Working Papers & Protocol Notes Compendium 2026',
      p3: 'WPA Pro / Academic Pro · цените се активираат само по Human Gate',
      button: 'Отвори WPA Пристап и публикации'
    };
  }

  function addNavLink() {
    var nav = document.querySelector('.site-nav ul, header nav ul');
    if (!nav) return;

    var c = copy();
    var item = document.getElementById('wpaCommerceNavItem');
    if (!item) {
      item = document.createElement('li');
      item.id = 'wpaCommerceNavItem';
      var a = document.createElement('a');
      a.href = '/commerce.html';
      item.appendChild(a);
      var card = nav.querySelector('a[href*="wpa-card.html"]');
      if (card && card.closest('li')) card.closest('li').insertAdjacentElement('afterend', item);
      else nav.appendChild(item);
    }

    var link = item.querySelector('a');
    if (link) link.textContent = c.nav;
  }

  function addHomeCard() {
    if (!/^(\/|\/index\.html)$/.test(location.pathname)) return;

    var target = document.querySelector('#core-pages .cards, #core-pages .grid, .core-pages .cards, .core-pages .grid');
    if (!target) return;

    var c = copy();
    var card = document.getElementById('wpaCommerceEntry');
    if (!card) {
      card = document.createElement('div');
      card.className = 'card';
      card.id = 'wpaCommerceEntry';
      target.appendChild(card);
    }

    card.innerHTML =
      '<span class="card-kicker">' + c.kicker + '</span>' +
      '<h4>' + c.title + '</h4>' +
      '<p>' + c.text + '</p>' +
      '<ul class="card-list"><li>' + c.p1 + '</li>' +
      '<li>' + c.p2 + '</li>' +
      '<li>' + c.p3 + '</li></ul>' +
      '<a class="card-link" href="/commerce.html">' + c.button + '</a>';
  }

  function boot() {
    addNavLink();
    addHomeCard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('wpa:lang-changed', boot);
})();