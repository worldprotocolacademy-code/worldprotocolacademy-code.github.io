/* WPA Journal Live X11.7 — Fusion Professional Lenses + Protocol Impact Score. */
(() => {
  "use strict";

  if (window.WPA_FUSION_X117_LOADED) return;
  window.WPA_FUSION_X117_LOADED = true;

  const VERSION = "X11.7";
  const PROTOCOL_SCORE_VERSION = "P1.0";
  const LIVE_PATH = /\/api\/v1\/(live|ticker)$/;
  const nativeFetch = window.fetch.bind(window);

  const LENSES = {
    all: {
      icon: "🌐",
      label: "Заеднички",
      short: "F",
      description: "Заеднички WPA преглед: свежина, релевантност и доверба во изворот.",
      question: "Кој е најважниот потврден развој и за кого е оперативно релевантен?"
    },
    protocol: {
      icon: "🏛️",
      label: "Протокол",
      short: "P",
      description: "Официјални имиња, титули, првенство, симболи, церемонијална практика и преседани.",
      question: "Кое правило, симбол, хиерархија или церемонијална практика е засегната?"
    },
    diplomacy: {
      icon: "🌍",
      label: "Дипломатија",
      short: "D",
      description: "Билатерални и мултилатерални односи, официјални позиции, самити и преговори.",
      question: "Кои актери, интереси и дипломатски последици треба да се следат?"
    },
    pr: {
      icon: "📢",
      label: "PR",
      short: "PR",
      description: "Репутациски ризик, медиумски тон, јавна реакција и кризна комуникација.",
      question: "Која е главната порака, публиката и можниот репутациски ризик?"
    },
    security: {
      icon: "🛡️",
      label: "Безбедност",
      short: "S",
      description: "Потврдени инциденти, институционални реакции, прекугранични и кибер ризици.",
      question: "Што е потврден факт, што е тврдење и кој ризик бара човечка проценка?"
    },
    communication: {
      icon: "🎙️",
      label: "Комуникологија",
      short: "K",
      description: "Реторика, рамки, терминологија, наративи и институционален дискурс.",
      question: "Како јазикот и рамката го обликуваат значењето и јавната перцепција?"
    }
  };

  const state = {
    activeLens: readStoredLens(),
    liveItems: [],
    tickerItems: [],
    applying: false,
    scheduled: false,
    payloadRevision: 0
  };

  function readStoredLens() {
    try {
      const value = localStorage.getItem("wpa-journal-fusion-lens-v1");
      return Object.prototype.hasOwnProperty.call(LENSES, value) ? value : "all";
    } catch {
      return "all";
    }
  }

  function storeLens(value) {
    try {
      localStorage.setItem("wpa-journal-fusion-lens-v1", value);
    } catch {
      // Lens persistence is optional.
    }
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLocaleLowerCase("en")
      .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
      .replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff]+/gi, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function clamp(value, min = 0, max = 100) {
    const number = Number(value);
    return Math.max(min, Math.min(max, Number.isFinite(number) ? number : 0));
  }

  function setText(node, value) {
    if (!node) return;
    const next = String(value ?? "");
    if (node.textContent !== next) node.textContent = next;
  }

  function itemText(item) {
    return normalize([
      item?.title,
      item?.summary,
      item?.description,
      item?.body,
      item?.source,
      item?.source_type,
      item?.primary_category,
      ...(Array.isArray(item?.signals) ? item.signals : [])
    ].filter(Boolean).join(" "));
  }

  function countMatches(text, regex) {
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  function factor(key, label, score, evidence) {
    return {
      key,
      label,
      score: clamp(score, 0, 20),
      evidence: Array.from(new Set(evidence.filter(Boolean))).slice(0, 4)
    };
  }

  function scoreProtocolImpact(item) {
    const explicit = Number(item?.protocol_impact_score);
    if (Number.isFinite(explicit) && explicit >= 0 && explicit <= 100 && Array.isArray(item?.protocol_factors)) {
      return {
        score: Math.round(explicit),
        version: item.protocol_score_version || PROTOCOL_SCORE_VERSION,
        factors: item.protocol_factors,
        rationale: item.protocol_rationale || "Backend-доделена протоколарна проценка.",
        method: item.protocol_score_method || "backend"
      };
    }

    const text = itemText(item);
    const category = normalize(item?.primary_category);
    const signals = (Array.isArray(item?.signals) ? item.signals : []).map(normalize);
    const protocolMarked = category === "protocol" || signals.includes("protocol");

    const hierarchyHits = countMatches(text, /\b(president|prime minister|minister|monarch|king|queen|pope|ambassador|envoy|diplomat|diplomatic mission|diplomatic missions|chief of protocol|precedence|credentials|accreditation|appointment|inauguration|state funeral|шеф на протокол|претседател|премиер|министер|крал|кралица|папа|амбасадор|акредитив|првенство|инаугурација|државен погреб)\b/gi);
    const hierarchy = factor(
      "hierarchy_status",
      "Хиерархија и статус",
      hierarchyHits >= 3 ? 20 : hierarchyHits >= 1 ? 12 : protocolMarked ? 6 : 0,
      hierarchyHits ? ["титула/функција", "дипломатски статус"] : protocolMarked ? ["protocol ознака"] : []
    );

    const namingHits = countMatches(text, /\b(official name|official naming|rename|renamed|spelling|transliteration|designation|flag|anthem|emblem|coat of arms|state symbol|kyiv|kiev|kyjiv|odesa|odessa|donbas|официјално име|преимен|правопис|транслитерац|знаме|химна|грб|државен симбол|киев|кијив|одеса)\b/gi);
    const naming = factor(
      "symbols_naming",
      "Симболи и официјално именување",
      namingHits >= 2 ? 20 : namingHits === 1 ? 14 : 0,
      namingHits ? ["официјално именување/симболика"] : []
    );

    const ceremonyStrong = countMatches(text, /\b(state visit|official visit|credentials ceremony|accreditation ceremony|state funeral|inauguration|official reception|diplomatic reception|state banquet|commemoration|ceremonial|protocol ceremony|државна посета|официјална посета|предавање акредитиви|државен погреб|инаугурација|официјален прием|државен банкет|комеморација|церемониј)\b/gi);
    const ceremonyGeneral = countMatches(text, /\b(summit|delegation|bilateral meeting|multilateral meeting|official meeting|procession|reception|самит|делегација|билатерална средба|мултилатерална средба|официјална средба|прием)\b/gi);
    const ceremony = factor(
      "ceremonial_practice",
      "Церемонијална и дипломатска практика",
      ceremonyStrong >= 1 ? 20 : ceremonyGeneral >= 2 ? 14 : ceremonyGeneral === 1 ? 9 : protocolMarked && namingHits ? 8 : protocolMarked ? 5 : 0,
      ceremonyStrong ? ["церемонијална практика"] : ceremonyGeneral ? ["официјален настан/средба"] : []
    );

    const globalHits = countMatches(text, /\b(united nations|security council|nato|european union|eu council|osce|council of europe|g7|g20|multilateral|international|global|regional summit|обединети нации|совет за безбедност|нато|европска унија|обсе|совет на европа|мултилатерал|меѓународ|глобал)\b/gi);
    const bilateralHits = countMatches(text, /\b(bilateral|foreign ministry|ministry of foreign affairs|ministry for foreign affairs|embassy|diplomatic mission|diplomatic missions|government|parliament|билатерал|министерство за надворешни|амбасада|дипломатска мисија|влада|парламент)\b/gi);
    const scope = factor(
      "international_scope",
      "Меѓународен опфат",
      globalHits >= 2 ? 20 : globalHits === 1 ? 16 : bilateralHits >= 2 ? 16 : bilateralHits === 1 ? 10 : protocolMarked ? 5 : 0,
      globalHits ? ["меѓународна/мултилатерална димензија"] : bilateralHits ? ["билатерална/институционална димензија"] : []
    );

    const precedentStrong = countMatches(text, /\b(officially changed|officially renamed|adopted|new standard|new protocol|permanent change|policy change|reform|guideline|directive|regulation|precedent|официјално смен|официјално преимен|усвоен|нов стандард|нов протокол|трајна промена|политика|реформа|насока|директива|регулатива|преседан)\b/gi);
    const precedentGeneral = countMatches(text, /\b(decision|agreement|treaty|memorandum|appointment|sanction|resolution|одлука|договор|спогодба|меморандум|именување|санкција|резолуција)\b/gi);
    const precedent = factor(
      "precedent_persistence",
      "Трајност и преседан",
      precedentStrong >= 1 ? 20 : precedentGeneral >= 2 ? 14 : precedentGeneral === 1 ? 9 : protocolMarked ? 5 : 0,
      precedentStrong ? ["трајна промена/преседан"] : precedentGeneral ? ["формална одлука/акт"] : []
    );

    const factors = [hierarchy, naming, ceremony, scope, precedent];
    const score = Math.round(factors.reduce((sum, entry) => sum + entry.score, 0));
    const active = factors.filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
    const rationale = active.length
      ? `Најсилни сигнали: ${active.slice(0, 3).map((entry) => `${entry.label} ${entry.score}/20`).join("; ")}.`
      : "Нема доволно јавни сигнали за значаен протоколарен ефект.";

    return {
      score,
      version: PROTOCOL_SCORE_VERSION,
      factors,
      rationale,
      method: "rule_based_client"
    };
  }

  function protocolTier(score) {
    if (score >= 90) return { key: "doctrinal", label: "Доктринарен / можен глобален преседан" };
    if (score >= 75) return { key: "strategic", label: "Стратешки" };
    if (score >= 50) return { key: "high", label: "Висок" };
    if (score >= 25) return { key: "notable", label: "Забележлив" };
    return { key: "low", label: "Низок" };
  }

  function topicStrength(item, lens) {
    const text = itemText(item);
    const category = normalize(item?.primary_category);
    const signals = new Set((Array.isArray(item?.signals) ? item.signals : []).map(normalize));
    let score = 0;

    const categoryMap = {
      protocol: ["protocol"],
      diplomacy: ["diplomacy"],
      pr: ["communication", "pr", "public relations"],
      security: ["security"],
      communication: ["communication", "communicology"]
    };
    const keywords = {
      diplomacy: /\b(diplomacy|diplomatic|bilateral|multilateral|summit|minister|embassy|sanction|treaty|ceasefire|negotiation|foreign policy|дипломат|билатерал|мултилатерал|самит|амбасада|санкц|договор|преговор)\b/i,
      pr: /\b(public relations|media|press|reputation|public reaction|crisis communication|spokesperson|campaign|coverage|brand|message discipline|односи со јавност|медиум|печат|репутац|јавна реакција|кризна комуникација|портпарол|кампања)\b/i,
      security: /\b(security|attack|military|defence|defense|cyber|terror|crime|police|threat|risk|border|intelligence|безбедност|напад|воен|одбрана|кибер|терор|криминал|полиција|закана|ризик|граница)\b/i,
      communication: /\b(rhetoric|statement|speech|framing|discourse|narrative|terminology|language|message|communication|реторика|изјава|говор|рамка|дискурс|наратив|терминологија|јазик|порака|комуникација)\b/i
    };

    if (lens === "protocol") return clamp(Number(item?.protocol_impact_score) || 0);
    if ((categoryMap[lens] || []).includes(category)) score += 45;
    if ((categoryMap[lens] || []).some((value) => signals.has(value))) score += 25;
    if (keywords[lens]?.test(text)) score += 22;
    if (/\b(government|ministry|parliament|president|united nations|nato|european union|official|влада|министерство|парламент|претседател|обединети нации|нато|европска унија|официјал)\b/i.test(text)) score += 8;
    return clamp(score);
  }

  function freshnessScore(item) {
    const timestamp = new Date(item?.published_at || "").getTime();
    if (!Number.isFinite(timestamp)) return 0;
    const hours = Math.max(0, (Date.now() - timestamp) / 3600000);
    return clamp(100 - (hours / 168) * 100);
  }

  function lensScore(item, lens) {
    const relevance = clamp(item?.relevance_score);
    const confidence = clamp(item?.source_confidence);
    if (lens === "all") {
      return Math.round(0.45 * relevance + 0.35 * confidence + 0.20 * freshnessScore(item));
    }
    const topic = topicStrength(item, lens);
    return Math.round(0.48 * topic + 0.32 * relevance + 0.20 * confidence);
  }

  function enrichItem(raw) {
    const item = { ...(raw || {}) };
    const protocol = scoreProtocolImpact(item);
    item.protocol_impact_score = protocol.score;
    item.protocol_score_version = protocol.version;
    item.protocol_factors = protocol.factors;
    item.protocol_rationale = protocol.rationale;
    item.protocol_score_method = protocol.method;
    item.protocol_tier = protocolTier(protocol.score).key;
    item.wpa_lens_scores = Object.fromEntries(
      Object.keys(LENSES).map((lens) => [lens, lensScore(item, lens)])
    );
    return item;
  }

  function sortForLens(items, lens = state.activeLens) {
    return items.slice().sort((a, b) => {
      const scoreDifference = lensScore(b, lens) - lensScore(a, lens);
      if (scoreDifference) return scoreDifference;
      const publishedDifference = (new Date(b?.published_at || 0).getTime() || 0) - (new Date(a?.published_at || 0).getTime() || 0);
      if (publishedDifference) return publishedDifference;
      return clamp(b?.source_confidence) - clamp(a?.source_confidence);
    });
  }

  function requestKind(input) {
    try {
      const value = typeof input === "string" ? input : input?.url;
      const path = new URL(String(value || ""), location.href).pathname;
      const match = path.match(LIVE_PATH);
      return match ? match[1] : "";
    } catch {
      return "";
    }
  }

  function responseWithJson(response, payload) {
    const headers = new Headers(response.headers);
    headers.set("content-type", "application/json; charset=utf-8");
    headers.delete("content-length");
    headers.delete("content-encoding");
    return new Response(JSON.stringify(payload), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  window.fetch = async function (input, init) {
    const response = await nativeFetch(input, init);
    if (!response.ok) return response;
    const kind = requestKind(input);
    if (!kind) return response;

    try {
      const payload = await response.clone().json();
      if (!Array.isArray(payload?.items)) return response;
      const enriched = payload.items.map(enrichItem);
      const ranked = sortForLens(enriched);
      if (kind === "live") state.liveItems = ranked;
      else state.tickerItems = ranked;
      state.payloadRevision += 1;
      payload.items = ranked;
      payload.wpa_fusion_lenses = {
        version: VERSION,
        active_lens: state.activeLens,
        protocol_score_version: PROTOCOL_SCORE_VERSION,
        protocol_score_method: "transparent rule-based client layer",
        note: "Lens scores rank records; they do not verify facts, override X11.6 recency controls or imply human approval."
      };
      scheduleEnhance();
      return responseWithJson(response, payload);
    } catch {
      return response;
    }
  };

  function enrichDemoData() {
    const items = window.WPA_LIVE_DEMO_DATA?.items;
    if (!Array.isArray(items)) return;
    window.WPA_LIVE_DEMO_DATA.items = sortForLens(items.map(enrichItem));
    state.liveItems = window.WPA_LIVE_DEMO_DATA.items;
  }

  function ensureStyles() {
    if (document.getElementById("wpaFusionX117Styles")) return;
    const style = document.createElement("style");
    style.id = "wpaFusionX117Styles";
    style.textContent = `
      .fusion-panel{padding:16px 18px!important}
      .fusion-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap}
      .fusion-head h2{font:500 1.35rem/1.2 Georgia,serif;color:#fff;margin:0}
      .fusion-head p{margin:4px 0 0;color:var(--muted);font-size:.83rem;max-width:850px}
      .fusion-version{color:var(--gold);font-size:.72rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
      .fusion-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}
      .fusion-tab{padding:9px 11px;border-radius:999px;background:rgba(255,255,255,.035);font-size:.78rem}
      .fusion-tab[aria-selected="true"]{background:var(--gold);color:#171106;border-color:var(--gold)}
      .fusion-guidance{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid rgba(212,166,74,.2)}
      .fusion-guidance strong{color:var(--gold)}
      .fusion-guidance p{margin:2px 0;color:var(--muted);font-size:.82rem}
      .fusion-rank{color:var(--paper);font-size:.76rem;white-space:nowrap}
      .tag.protocol-impact{color:var(--gold);background:rgba(212,166,74,.12)}
      .tag.protocol-case{color:#171106;background:linear-gradient(135deg,var(--gold),#f0ca64)}
      .tag.fusion-score{color:#d8c7ff;background:rgba(167,139,250,.12)}
      .protocol-impact-details{border:1px solid rgba(212,166,74,.2);border-radius:12px;background:rgba(255,255,255,.025);overflow:hidden}
      .protocol-impact-details summary{cursor:pointer;list-style:none;padding:9px 11px;color:var(--gold);font-size:.78rem;font-weight:900}
      .protocol-impact-details summary::-webkit-details-marker{display:none}
      .protocol-impact-details summary::after{content:'+';float:right;color:var(--muted)}
      .protocol-impact-details[open] summary::after{content:'−'}
      .protocol-impact-body{padding:0 11px 11px;color:var(--muted);font-size:.76rem}
      .protocol-factor-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:8px 0}
      .protocol-factor{display:flex;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.035)}
      .protocol-factor b{color:var(--paper)}
      .protocol-method-note{display:block;margin-top:8px;color:var(--gold)}
      .card.fusion-priority{outline:1px solid rgba(212,166,74,.42);outline-offset:1px}
      @media(max-width:700px){.fusion-guidance{grid-template-columns:1fr}.fusion-rank{white-space:normal}.protocol-factor-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    let panel = document.getElementById("wpaFusionPanel");
    if (panel) return panel;
    const controls = document.querySelector(".controls");
    if (!controls) return null;

    panel = document.createElement("section");
    panel.id = "wpaFusionPanel";
    panel.className = "panel fusion-panel";
    panel.setAttribute("aria-label", "WPA Fusion Professional Lenses");

    const head = document.createElement("div");
    head.className = "fusion-head";
    const titleWrap = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = "WPA Fusion Professional Lenses";
    const subtitle = document.createElement("p");
    subtitle.textContent = "Еден проверен feed, рангиран низ пет професионални перспективи. Lens-от не ја менува фактичката верификација.";
    titleWrap.append(title, subtitle);
    const version = document.createElement("span");
    version.className = "fusion-version";
    version.textContent = `${VERSION} · Protocol Score ${PROTOCOL_SCORE_VERSION}`;
    head.append(titleWrap, version);

    const tabs = document.createElement("div");
    tabs.className = "fusion-tabs";
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Професионален објектив");
    Object.entries(LENSES).forEach(([key, lens]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fusion-tab";
      button.dataset.lens = key;
      button.setAttribute("role", "tab");
      button.textContent = `${lens.icon} ${lens.label}`;
      button.addEventListener("click", () => setActiveLens(key, true));
      tabs.appendChild(button);
    });

    const guidance = document.createElement("div");
    guidance.className = "fusion-guidance";
    guidance.innerHTML = `<div><strong id="fusionLensTitle"></strong><p id="fusionLensDescription"></p><p id="fusionLensQuestion"></p></div><div id="fusionRankSummary" class="fusion-rank"></div>`;
    panel.append(head, tabs, guidance);
    controls.insertAdjacentElement("afterend", panel);
    return panel;
  }

  function setActiveLens(lens, refresh = false) {
    if (!Object.prototype.hasOwnProperty.call(LENSES, lens)) return;
    state.activeLens = lens;
    storeLens(lens);
    state.liveItems = sortForLens(state.liveItems, lens);
    state.tickerItems = sortForLens(state.tickerItems, lens);
    applyFusionUi();
    if (refresh) {
      const refreshButton = document.getElementById("refresh");
      window.setTimeout(() => refreshButton?.click(), 0);
    }
  }

  function itemMapByTitle() {
    const map = new Map();
    for (const item of state.liveItems) {
      const key = normalize(item?.title);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return map;
  }

  function renderProtocolDetails(item) {
    const details = document.createElement("details");
    details.className = "protocol-impact-details";
    const tier = protocolTier(item.protocol_impact_score);
    const summary = document.createElement("summary");
    summary.textContent = `P ${item.protocol_impact_score} · ${tier.label}`;
    const body = document.createElement("div");
    body.className = "protocol-impact-body";
    const factorGrid = document.createElement("div");
    factorGrid.className = "protocol-factor-grid";
    for (const entry of Array.isArray(item.protocol_factors) ? item.protocol_factors : []) {
      const row = document.createElement("div");
      row.className = "protocol-factor";
      const label = document.createElement("span");
      label.textContent = entry.label || entry.key || "Фактор";
      const score = document.createElement("b");
      score.textContent = `${clamp(entry.score, 0, 20)}/20`;
      row.append(label, score);
      factorGrid.appendChild(row);
    }
    const rationale = document.createElement("p");
    rationale.textContent = item.protocol_rationale || "Нема дополнително образложение.";
    const note = document.createElement("small");
    note.className = "protocol-method-note";
    note.textContent = `P е транспарентен rule-based индикатор (${item.protocol_score_version || PROTOCOL_SCORE_VERSION}); не е доказ за точност, не ја надвладува X11.6 свежината и не значи човечко одобрување.`;
    body.append(factorGrid, rationale, note);
    details.append(summary, body);
    return details;
  }

  function decorateCard(card, item, index) {
    const currentLensScore = lensScore(item, state.activeLens);
    const signature = [item?.id || normalize(item?.title), state.activeLens, item?.protocol_impact_score, currentLensScore].join("|");
    card.dataset.fusionKey = String(item?.id || normalize(item?.title));
    card.dataset.fusionScore = String(currentLensScore);
    card.dataset.fusionOriginalIndex = String(index);
    card.classList.toggle("fusion-priority", currentLensScore >= 75);
    if (card.dataset.fusionSignature === signature && card.querySelector(".protocol-impact-details")) return;

    const tags = card.querySelector(".tags");
    if (tags) {
      let pTag = tags.querySelector(".protocol-impact");
      if (!pTag) {
        pTag = document.createElement("span");
        pTag.className = "tag protocol-impact";
        tags.appendChild(pTag);
      }
      const tier = protocolTier(item.protocol_impact_score);
      pTag.textContent = `P ${item.protocol_impact_score}`;
      pTag.title = `WPA Protocol Impact Score · ${tier.label}. Кликнете на P-образложението во картичката.`;

      let lensTag = tags.querySelector(".fusion-score");
      if (!lensTag) {
        lensTag = document.createElement("span");
        lensTag.className = "tag fusion-score";
        tags.appendChild(lensTag);
      }
      const lens = LENSES[state.activeLens];
      lensTag.textContent = `${lens.short} ${currentLensScore}`;
      lensTag.title = `${lens.label} lens ranking; не е фактичка или човечка верификација.`;

      const existingCase = tags.querySelector(".protocol-case");
      if (item.protocol_impact_score >= 75 && !existingCase) {
        const caseTag = document.createElement("span");
        caseTag.className = "tag protocol-case";
        caseTag.textContent = "protocol case study";
        caseTag.title = "Кандидат за WPA протоколарна студија; потребна е човечка проверка на изворите и контекстот.";
        tags.appendChild(caseTag);
      } else if (item.protocol_impact_score < 75 && existingCase) {
        existingCase.remove();
      }
    }

    const body = card.querySelector(".card-body");
    if (body) {
      body.querySelector(".protocol-impact-details")?.remove();
      const details = renderProtocolDetails(item);
      const actions = body.querySelector(".actions");
      if (actions) body.insertBefore(details, actions);
      else body.appendChild(details);
    }
    card.dataset.fusionSignature = signature;
  }

  function rankCards() {
    const grid = document.getElementById("newsGrid");
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll(":scope > .card"));
    if (!cards.length) return;
    cards.sort((a, b) => {
      const scoreDifference = Number(b.dataset.fusionScore || 0) - Number(a.dataset.fusionScore || 0);
      if (scoreDifference) return scoreDifference;
      return Number(a.dataset.fusionOriginalIndex || 0) - Number(b.dataset.fusionOriginalIndex || 0);
    });
    const current = Array.from(grid.querySelectorAll(":scope > .card")).map((card) => card.dataset.fusionKey).join("|");
    const desired = cards.map((card) => card.dataset.fusionKey).join("|");
    if (current !== desired) cards.forEach((card) => grid.appendChild(card));
  }

  function applyFusionUi() {
    if (state.applying) return;
    state.applying = true;
    try {
      ensureStyles();
      const panel = ensurePanel();
      if (!panel) return;

      panel.querySelectorAll("[data-lens]").forEach((button) => {
        const selected = button.dataset.lens === state.activeLens;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });

      const lens = LENSES[state.activeLens];
      const title = document.getElementById("fusionLensTitle");
      const description = document.getElementById("fusionLensDescription");
      const question = document.getElementById("fusionLensQuestion");
      const summary = document.getElementById("fusionRankSummary");
      setText(title, `${lens.icon} ${lens.label} lens`);
      setText(description, lens.description);
      setText(question, `Работно прашање: ${lens.question}`);
      if (summary) {
        const strong = state.liveItems.filter((item) => lensScore(item, state.activeLens) >= 75).length;
        setText(summary, `${state.liveItems.length} свежи · ${strong} висок приоритет`);
      }

      const heading = document.querySelector(".feed-head h2");
      setText(heading, state.activeLens === "all" ? "Најнови релевантни записи" : `Најнови релевантни записи · ${lens.label}`);

      const byTitle = itemMapByTitle();
      const titleUseCount = new Map();
      const cards = Array.from(document.querySelectorAll("#newsGrid > .card"));
      cards.forEach((card, index) => {
        const key = normalize(card.querySelector("h3")?.textContent);
        const used = titleUseCount.get(key) || 0;
        const item = byTitle.get(key)?.[used];
        titleUseCount.set(key, used + 1);
        if (item) decorateCard(card, item, index);
      });
      rankCards();

      window.WPA_FUSION_X117_STATE = {
        version: VERSION,
        activeLens: state.activeLens,
        liveItems: state.liveItems.length,
        protocolScoreVersion: PROTOCOL_SCORE_VERSION,
        payloadRevision: state.payloadRevision
      };
    } finally {
      state.applying = false;
    }
  }

  function scheduleEnhance() {
    if (state.scheduled) return;
    state.scheduled = true;
    window.setTimeout(() => {
      state.scheduled = false;
      applyFusionUi();
    }, 0);
  }

  window.WPA_FUSION_X117 = {
    version: VERSION,
    protocolScoreVersion: PROTOCOL_SCORE_VERSION,
    lenses: LENSES,
    scoreProtocolImpact,
    enrichItem,
    lensScore,
    setActiveLens,
    getActiveLens: () => state.activeLens
  };

  enrichDemoData();
  const observer = new MutationObserver(scheduleEnhance);
  const start = () => {
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    scheduleEnhance();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
