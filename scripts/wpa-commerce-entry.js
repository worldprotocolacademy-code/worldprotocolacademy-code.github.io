(function () {
  'use strict';

  function addNavLink() {
    var nav = document.querySelector('.site-nav ul, header nav ul');
    if (!nav || document.getElementById('wpaCommerceNavItem')) return;
    var li = document.createElement('li');
    li.id = 'wpaCommerceNavItem';
    var a = document.createElement('a');
    a.href = '/commerce.html';
    a.textContent = 'WPA Access & Publications';
    li.appendChild(a);
    var card = nav.querySelector('a[href*="wpa-card.html"]');
    if (card && card.closest('li')) card.closest('li').insertAdjacentElement('afterend', li);
    else nav.appendChild(li);
  }

  function addHomeCard() {
    if (!/^(\/|\/index\.html)$/.test(location.pathname)) return;
    if (document.getElementById('wpaCommerceEntry')) return;
    var target = document.querySelector('#core-pages .cards, #core-pages .grid, .core-pages .cards, .core-pages .grid');
    if (!target) return;

    var card = document.createElement('div');
    card.className = 'card';
    card.id = 'wpaCommerceEntry';
    card.innerHTML =
      '<span class="card-kicker">Access · Publications · Membership</span>' +
      '<h4>WPA Access & Publications</h4>' +
      '<p>Два контролирани платни патишта: online checkout преку payment provider и Human Gate → потврда → банкарска уплата. Еднократни дигитални производи и идно WPA членство.</p>' +
      '<ul class="card-list"><li>€19 · State Symbols / Anthems / National Days 2026</li>' +
      '<li>€59 · WPA Working Papers & Protocol Notes Compendium 2026</li>' +
      '<li>WPA Pro / Academic Pro · цените се активираат по Human Gate</li></ul>' +
      '<a class="card-link" href="/commerce.html">Отвори WPA Access & Publications</a>';
    target.appendChild(card);
  }

  function boot() {
    addNavLink();
    addHomeCard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();