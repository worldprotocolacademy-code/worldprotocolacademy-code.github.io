(() => {
  "use strict";
  const KEY = "wpa-sande-journal-item-v1";
  function readItem() {
    const params = new URLSearchParams(location.search);
    if (!params.get("journal_item")) return null;
    try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { return null; }
  }
  function makePrompt(item) {
    const signals = Array.isArray(item.signals) ? item.signals.join(", ") : "—";
    return `Анализирај ја следнава WPA Journal Live ставка во режим Journal Analyst.\n\nНаслов: ${item.title || "—"}\nИзвор: ${item.source || "—"}\nКатегорија: ${item.primary_category || "—"}\nСигнали: ${signals}\nРегион/земја: ${item.region || "—"}${item.country ? ` / ${item.country}` : ""}\nОбјавено: ${item.published_at || item.fetched_at || "—"}\nРезиме од feed: ${item.summary || "—"}\nОригинален URL: ${item.original_url || "—"}\nВерификациски статус: ${item.verification_status || "single_public_source"}\n\nПравила:\n1. Користи само доставениот public-source материјал.\n2. Раздели: експлицитен факт, институционална порака, разумна интерпретација и непотврдено.\n3. Анализирај ги релевантните WPA објективи: протокол, дипломатија, јавна комуникација, безбедност и комуникологија.\n4. Не додавај оперативни, класифицирани или измислени детали.\n5. Заврши со: потребна човечка проверка и 3 прашања за понатамошна анализа.`;
  }
  function install() {
    const item = readItem(); if (!item) return;
    const box = document.getElementById("q"); if (!box) return;
    box.value = makePrompt(item);
    box.dispatchEvent(new Event("input", { bubbles: true }));
    const banner = document.createElement("div");
    banner.setAttribute("role", "status");
    banner.style.cssText = "margin:12px auto 0;max-width:880px;padding:10px 13px;border:1px solid rgba(201,168,76,.35);border-radius:12px;background:rgba(201,168,76,.08);color:#ead8a5;font:13px/1.5 system-ui,sans-serif";
    banner.textContent = "Journal Analyst режим: ставката е внесена како нацрт-прашање. Провери го оригиналниот извор и притисни Send само кога си подготвен.";
    box.closest(".input")?.prepend(banner);
    box.focus();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install); else install();
})();
