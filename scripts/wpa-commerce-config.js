/* WPA Commerce Configuration v1.0 — 2026-10-02
   Public, non-secret configuration only.
   Payment credentials, bank details and provider secrets MUST NOT be stored here.
*/
(function () {
  'use strict';

  window.WPA_COMMERCE = Object.freeze({
    version: '1.0.0',
    updated: '2026-10-02',
    state: 'PRELAUNCH_REVIEW',
    currency: 'EUR',
    contact: 'contact@worldprotocolacademy.mk',
    intakeBackend: {
      mode: 'EMAIL_FALLBACK',
      endpoint: null,
      turnstileRequiredWhenWorkerEnabled: true,
      note: 'The isolated Cloudflare commerce-intake Worker is scaffolded but not deployed. Public requests continue to use the local mailto Human Gate flow until explicit cutover approval.'
    },
    paymentRails: {
      gumroad: {
        enabledForOneTimeProducts: false,
        enabledForMembership: false,
        note: 'Prepared. Public checkout goes live only after the relevant Gumroad product or membership is published.'
      },
      bankTransferHumanGate: {
        enabledForRequests: true,
        note: 'A request is non-binding. After Human Gate review, WPA confirms the exact amount, terms and bank-transfer instructions. No bank details are published in source code.'
      }
    },
    products: [
      {
        id: 'state-symbols-2026',
        titleMk: 'Протокол на државни симболи, химни и национални денови 2026 — MK/EN',
        titleEn: 'Protocol of State Symbols, Anthems and National Days 2026 — MK/EN',
        price: 19,
        gumroadUrl: 'https://worldprotocol.gumroad.com/l/ntpmgc',
        gumroadLive: false,
        bankRequestLive: true,
        licence: 'WPA Premium Single-User Licence'
      },
      {
        id: 'wpa-compendium-2026',
        titleMk: 'WPA Working Papers & Protocol Notes Compendium 2026',
        titleEn: 'WPA Working Papers & Protocol Notes Compendium 2026',
        price: 59,
        gumroadUrl: 'https://worldprotocol.gumroad.com/l/wpa-compendium-2026',
        gumroadLive: false,
        bankRequestLive: true,
        licence: 'WPA Premium Single-User Licence'
      }
    ],
    membership: {
      pricingStatus: 'HUMAN_GATE_PENDING',
      tiers: [
        { id: 'free', name: 'WPA Free', paid: false },
        { id: 'pro', name: 'WPA Pro', paid: true },
        { id: 'academic-pro', name: 'WPA Academic Pro', paid: true },
        { id: 'institutional', name: 'WPA Institutional', paid: true, enquiryOnly: true }
      ],
      billing: ['monthly', 'annual'],
      bankTransferRequests: true,
      automaticCredentials: false
    },
    commercialBoundary:
      'Payment buys only the stated product, access or service. It does not buy academic acceptance, institutional ranking, a favourable analytical conclusion, certification, accreditation or third-party recognition.'
  });
})();