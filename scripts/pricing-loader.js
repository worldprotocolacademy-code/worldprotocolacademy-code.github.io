/*
  WPA Pricing Loader
  Central pricing configuration loader for Student Desk, programmes, certification and future enrollment flow.
  Source of truth: /data/pricing-config.json
*/
(function () {
  'use strict';

  window.WPA_PRICING = window.WPA_PRICING || null;
  window.WPA_PRICING_READY = window.WPA_PRICING_READY || null;

  function normalizeLevelKey(input) {
    if (!input) return null;
    const value = String(input).toLowerCase().trim();
    if (value === '1' || value.includes('level_1') || value.includes('level 1') || value.includes('ниво 1') || value.includes('основ')) return 'level_1';
    if (value === '2' || value.includes('level_2') || value.includes('level 2') || value.includes('ниво 2') || value.includes('професион')) return 'level_2';
    if (value === '3' || value.includes('level_3') || value.includes('level 3') || value.includes('ниво 3') || value.includes('напред')) return 'level_3';
    if (value === '4' || value.includes('level_4') || value.includes('level 4') || value.includes('ниво 4') || value.includes('обуч') || value.includes('совет')) return 'level_4';
    return null;
  }

  function getPrice(level, lang) {
    const key = normalizeLevelKey(level);
    const pricing = window.WPA_PRICING;
    if (!pricing || !key || !pricing.levels || !pricing.levels[key]) return null;
    const item = pricing.levels[key];
    const isMk = String(lang || document.documentElement.lang || 'mk').toLowerCase().startsWith('mk');
    return {
      key: key,
      currency: pricing.currency || 'EUR',
      status: pricing.status || 'indicative',
      contact: pricing.contact || 'worldprotocolacademy@gmail.com',
      name: isMk ? (item.name_mk || item.name_en) : (item.name_en || item.name_mk),
      range: item.individual_range_eur,
      institutional: item.institutional || 'proposal_required',
      disclaimer: isMk
        ? 'Ова се индикативни цени. Точната цена се потврдува официјално од WPA.'
        : 'These are indicative prices. Final pricing is confirmed officially by WPA.'
    };
  }

  async function loadPricing() {
    try {
      const response = await fetch('/data/pricing-config.json?v=20260502', { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      window.WPA_PRICING = data;
      window.WPAGetPrice = getPrice;
      document.dispatchEvent(new CustomEvent('wpa:pricing-ready', { detail: data }));
      return data;
    } catch (error) {
      console.warn('WPA pricing not loaded:', error);
      window.WPAGetPrice = getPrice;
      document.dispatchEvent(new CustomEvent('wpa:pricing-error', { detail: error }));
      return null;
    }
  }

  window.WPA_PRICING_READY = loadPricing();
})();
