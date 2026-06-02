/* =====================================================================
   WPA Multi-AI Command Center — Simulation-mode safety overlay · v1.0
   ---------------------------------------------------------------------
   Drop-in. Се однесува САМО на ai/ страницата.
   Прави три работи:
     1) Додава видливо предупредување за приватност + симулациски режим.
     2) Го заменува footer идентитетот со безбедна формулација.
     3) Ја освежува симулациската линија (MK + EN).

   ⛔ НЕ прави API повици · НЕ содржи клучеви · НЕ повикува Cloudflare Worker
   ⛔ Нема „автономни агенти" ниту „продукциски систем" — само предупредувања.
   ===================================================================== */
(function () {
  "use strict";
  if (window.__wpaSimOverlay) return;        // idempotent — нема двојно извршување
  window.__wpaSimOverlay = true;

  // ── Безбедни текстови ──────────────────────────────────────────────
  var SAFE_FOOTER = "World Protocol Academy · Multi-AI Command Center · Macedonia";
  var SIM_MK   = "Симулациски режим — подготвено за идно API поврзување по безбедносна проверка.";
  var SIM_EN   = "Simulation mode — prepared for future API connection after security review.";
  var PRIV_MK  = "Овој интерфејс моментално работи во симулациски режим. Не внесувајте лични, службени, доверливи или класифицирани податоци.";
  var PRIV_EN  = "This interface currently runs in simulation mode. Do not enter personal, official, confidential or classified information.";

  // ── CSS (само за оверлејот; не ја менува темата на страницата) ──────
  function injectCSS() {
    if (document.getElementById("wpa-sim-overlay-css")) return;
    var css = [
      "#wpa-sim-banner{box-sizing:border-box;width:100%;margin:0;padding:12px 16px;",
      "background:#2a1d05;border-bottom:2px solid #f0a500;color:#ffe9b8;",
      "font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;",
      "text-align:center;line-height:1.45;}",
      "#wpa-sim-banner .wpa-sim-badge{font-weight:700;letter-spacing:.3px;color:#ffcf4d;margin-bottom:5px;font-size:14px;}",
      "#wpa-sim-banner p{margin:2px 0;font-size:13px;}",
      "#wpa-sim-banner .wpa-sim-en{opacity:.85;font-style:italic;}",
      ".wpa-sim-en-line{font-style:italic;opacity:.85;}"
    ].join("");
    var s = document.createElement("style");
    s.id = "wpa-sim-overlay-css";
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  // ── Предупредување на врвот (MK + EN) ───────────────────────────────
  function addBanner() {
    if (document.getElementById("wpa-sim-banner")) return;
    var b = document.createElement("div");
    b.id = "wpa-sim-banner";
    b.setAttribute("role", "alert");

    var badge = document.createElement("div");
    badge.className = "wpa-sim-badge";
    badge.textContent = "⚠ Симулациски режим · Simulation mode";

    var mk = document.createElement("p");
    mk.className = "wpa-sim-mk";
    mk.textContent = PRIV_MK;

    var en = document.createElement("p");
    en.className = "wpa-sim-en";
    en.textContent = PRIV_EN;

    b.appendChild(badge);
    b.appendChild(mk);
    b.appendChild(en);
    document.body.insertBefore(b, document.body.firstChild);
  }

  // ── Поправка на footer текстот (по содржина, не по селектор) ────────
  function collectTextNodes() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function fixFooter() {
    var nodes = collectTextNodes();
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var t = node.nodeValue || "";

      // 1) Идентитет: „…Doc. dr Sande Smiljanov…" → безбедна формулација
      if (t.indexOf("Sande Smiljanov") !== -1) {
        node.nodeValue = SAFE_FOOTER;
      }

      // 2) Симулациска линија: „подготвено за вистински API" → ново MK + EN
      if (t.indexOf("подготвено за вистински API") !== -1) {
        node.nodeValue = SIM_MK;
        var parent = node.parentNode;
        if (parent && !parent.querySelector(".wpa-sim-en-line")) {
          var enLine = document.createElement("div");
          enLine.className = "wpa-sim-en-line";
          enLine.textContent = SIM_EN;
          parent.insertBefore(enLine, node.nextSibling);
        }
      }
    }
  }

  function run() { injectCSS(); addBanner(); fixFooter(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
