(() => {
  'use strict';

  const VERSION = '1.2.0';
  const API_ROOT = 'https://wpa-live-production-bridge.worldprotocolacademy.workers.dev';
  const DOMAINS = ['protocol','diplomacy','public_relations','security','communicology'];
  const LABELS = {
    protocol: 'Протокол · Protocol',
    diplomacy: 'Дипломатија · Diplomacy',
    public_relations: 'Односи со јавност · Public Relations',
    security: 'Безбедност · Security',
    communicology: 'Комуникологија · Communicology'
  };
  const ANGLES = {
    protocol: 'Испитај официјална репрезентација, акредитиви, пресеанс, церемонијална постапка и видлив институционален ред. Провери го оригиналниот извор пред WPA заклучок.',
    diplomacy: 'Оцени дипломатско сигнализирање, актери, формат, обврски и билатерални/мултилатерални импликации, со јасно раздвојување на изворните факти од WPA интерпретацијата.',
    public_relations: 'Оцени јавна порака, репутација, stakeholder комуникација, медиумско врамување и легитимност; раздвој институционални изјави од независно известување.',
    security: 'Оцени јавно поткрепен ризик, институционален одговор, стратегиски импликации и комуникациски ефекти. Ова не е разузнавачка проценка или оперативен совет.',
    communicology: 'Оцени врамување, создавање значење, убедување, интеркултурен контекст, тек на информации и односот меѓу порака, публика и институција.'
  };
  const ROUTES = {
    protocol: 'Protocol Note / Scenario Analysis candidate',
    diplomacy: 'Research Brief / Journal Analysis candidate',
    public_relations: 'Public Communication Brief candidate',
    security: 'Policy / Research Brief candidate',
    communicology: 'Journal Explainer / Research Note candidate'
  };
  const CONFIG = Object.freeze({
    apiMaxAgeHours: 8,
    itemMaxAgeHours: 48,
    minRelevance: 65,
    minConfidence: 65,
    minItems: 3,
    minDomains: 2,
    minSources: 2,
    maxItems: 10,
    maxPerSource: 3,
    maxPerDomain: 3,
    refreshMs: 5 * 60 * 1000
  });

  const $ = id => document.getElementById(id);
  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();
  const clamp = v => Math.max(0, Math.min(100, Number(v) || 0));
  const parseDate = v => {
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d : null;
  };
  const hoursBetween = (a, b) => (a.getTime() - b.getTime()) / 3600000;
  const safeUrl = value => {
    try {
      const u = new URL(String(value || ''));
      if (!/^https?:$/.test(u.protocol)) return '';
      [...u.searchParams.keys()].forEach(k => {
        if (/^(utm_|fbclid$|gclid$|mc_)/i.test(k)) u.searchParams.delete(k);
      });
      u.hash = '';
      return u.toString();
    } catch {
      return '';
    }
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
  const skopjeDate = d => new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Skopje', year:'numeric', month:'2-digit', day:'2-digit'
  }).format(d);
  const skopjeTime = d => new Intl.DateTimeFormat('mk-MK', {
    timeZone: 'Europe/Skopje', dateStyle:'medium', timeStyle:'short'
  }).format(d);

  function mapDomain(value) {
    const s = clean(value).toLowerCase().replaceAll('_',' ');
    if (/^protocol$|протокол/.test(s)) return 'protocol';
    if (/^diplomacy$|diplomat|диплом/.test(s)) return 'diplomacy';
    if (/public.?relations|^pr$|public.?communication|односи со јавност|јавна комуникација/.test(s)) return 'public_relations';
    if (/^security$|безбед/.test(s)) return 'security';
    if (/communicology|^communication$|комуниколог/.test(s)) return 'communicology';
    return '';
  }

  function classify(item) {
    const primary = mapDomain(item.primary_category);
    if (primary) return primary;
    for (const signal of (Array.isArray(item.signals) ? item.signals : [])) {
      const d = mapDomain(signal);
      if (d) return d;
    }
    return '';
  }

  function sportsNoise(item) {
    const s = (clean(item.title) + ' ' + clean(item.summary)).toLowerCase();
    const sport = /\b(football|soccer|basketball|tennis|rugby|cricket|boxing|ufc|league|tournament|championship|grand prix|f1)\b/.test(s);
    const publicContext = /diplom|protocol|government|minister|president|embassy|sanction|summit|treaty|security|state visit|official visit|public diplomacy/.test(s);
    return sport && !publicContext;
  }

  function buildProduct(packet, now = new Date()) {
    const packetTime = parseDate(packet?.generated_at);
    if (!packetTime) throw new Error('Journal Live packet нема валиден generated_at.');
    const packetAge = hoursBetween(now, packetTime);
    if (packetAge < -0.5 || packetAge > CONFIG.apiMaxAgeHours) {
      throw new Error(`Journal Live packet е стар ${packetAge.toFixed(1)} часа; daily product fail-closed.`);
    }

    const byKey = new Map();
    for (const raw of (Array.isArray(packet.items) ? packet.items : [])) {
      const published = parseDate(raw.published_at);
      const originalUrl = safeUrl(raw.original_url);
      const domain = classify(raw);
      if (!published || !originalUrl || !domain || sportsNoise(raw)) continue;

      const age = hoursBetween(now, published);
      if (age < -0.5 || age > CONFIG.itemMaxAgeHours) continue;

      const health = clean(raw.source_health_status).toLowerCase();
      if (/dead|fail|unhealthy|down/.test(health)) continue;

      const relevance = clamp(raw.relevance_score);
      const confidence = clamp(raw.source_confidence);
      if (relevance < CONFIG.minRelevance || confidence < CONFIG.minConfidence) continue;

      const official = /single_official_source/i.test(clean(raw.verification_status));
      const freshness = Math.max(0, 100 - (age / 48) * 70);
      const score = Math.min(100, Math.round(.45 * relevance + .35 * confidence + .20 * freshness + (official ? 3 : 0)));
      const key = originalUrl || clean(raw.id) || `${clean(raw.source)}|${clean(raw.title)}|${clean(raw.published_at)}`.toLowerCase();

      const item = {
        id: clean(raw.id) || null,
        title: clean(raw.title) || 'Без наслов',
        summary: clean(raw.summary) || 'Нема достапно резиме.',
        source: clean(raw.source) || 'Unknown source',
        original_url: originalUrl,
        published_at: published.toISOString(),
        fetched_at: parseDate(raw.fetched_at)?.toISOString() || null,
        region: clean(raw.region) || 'International',
        country: clean(raw.country) || null,
        source_type: clean(raw.source_type) || null,
        domain,
        relevance_score: relevance,
        source_confidence: confidence,
        score,
        verification_status: clean(raw.verification_status) || 'candidate',
        source_health_status: health || 'unknown',
        official_source: official,
        wpa_working_angle: ANGLES[domain],
        recommended_route: ROUTES[domain],
        _key: key
      };
      const old = byKey.get(key);
      if (!old || item.score > old.score) byKey.set(key, item);
    }

    const eligible = [...byKey.values()].sort((a,b) =>
      b.score - a.score ||
      b.source_confidence - a.source_confidence ||
      Date.parse(b.published_at) - Date.parse(a.published_at)
    );

    const chosen = [];
    const seen = new Set();
    const sourceCounts = new Map();
    const domainCounts = new Map();

    const take = (item, force = false) => {
      if (!item || seen.has(item._key)) return false;
      const sourceKey = item.source.toLowerCase();
      if (!force && ((sourceCounts.get(sourceKey) || 0) >= CONFIG.maxPerSource || (domainCounts.get(item.domain) || 0) >= CONFIG.maxPerDomain)) return false;
      chosen.push(item);
      seen.add(item._key);
      sourceCounts.set(sourceKey, (sourceCounts.get(sourceKey) || 0) + 1);
      domainCounts.set(item.domain, (domainCounts.get(item.domain) || 0) + 1);
      return true;
    };

    for (const d of DOMAINS) {
      const candidate = eligible.find(x => x.domain === d && !seen.has(x._key) && (sourceCounts.get(x.source.toLowerCase()) || 0) < CONFIG.maxPerSource);
      if (candidate) take(candidate, true);
    }
    for (const item of eligible) {
      if (chosen.length >= CONFIG.maxItems) break;
      take(item);
    }

    const selected = chosen.slice(0, CONFIG.maxItems).sort((a,b) =>
      b.score - a.score ||
      b.source_confidence - a.source_confidence ||
      Date.parse(b.published_at) - Date.parse(a.published_at)
    );
    const domains = new Set(selected.map(x => x.domain));
    const sources = new Set(selected.map(x => x.source.toLowerCase()));

    if (selected.length < CONFIG.minItems) throw new Error(`Health Gate: само ${selected.length} eligible ставки.`);
    if (domains.size < CONFIG.minDomains) throw new Error(`Health Gate: само ${domains.size} WPA домени.`);
    if (sources.size < CONFIG.minSources) throw new Error(`Health Gate: само ${sources.size} изворни семејства.`);

    const counts = Object.fromEntries(DOMAINS.map(d => [d, selected.filter(x => x.domain === d).length]));
    const lead = selected[0];
    const items = selected.map(({_key, ...rest}) => rest);

    return {
      schema_version: '1.2',
      engine_version: VERSION,
      product: 'WPA Institute Daily Brief',
      product_date: skopjeDate(now),
      status: 'AUTO_GENERATED_READY_FOR_HUMAN_GATE',
      generated_at: now.toISOString(),
      timezone: 'Europe/Skopje',
      canonical_input: {
        system: 'WPA Journal Live',
        endpoint: API_ROOT + '/api/v1/live',
        packet_generated_at: packetTime.toISOString(),
        original_sources_authoritative: true
      },
      automation: {
        mode: 'A_TO_B_LIVE_DAILY',
        source_window_hours: CONFIG.itemMaxAgeHours,
        min_relevance: CONFIG.minRelevance,
        min_confidence: CONFIG.minConfidence,
        selected_items: items.length,
        eligible_items: eligible.length,
        domains_represented: domains.size,
        unique_sources: sources.size,
        domain_counts: counts
      },
      executive_snapshot: {
        lead_title: lead.title,
        lead_domain: lead.domain,
        lead_source: lead.source,
        summary: `${items.length} избрани развои во ${domains.size} WPA домени од ${sources.size} изворни семејства. Селекцијата е детерминистички рангирана од свеж Journal Live пакет и останува source-attributed до Human Gate.`
      },
      boundaries: {
        peer_reviewed: false,
        official_institutional_position: false,
        automatic_external_publication: false,
        automatic_doi: false,
        human_gate_required_for_consequential_release: true
      },
      human_gate: {
        state: 'PENDING',
        required_for: [
          'journal/working-paper/protocol-note publication',
          'doctrine or canonical institutional claims',
          'external platform posting',
          'third-party visual reuse',
          'presenting a candidate as an independently verified WPA finding'
        ]
      },
      items
    };
  }

  function toMarkdown(product) {
    const out = [
      `# WPA Institute Daily Brief — ${product.product_date}`,
      '',
      `**Status:** ${product.status}`,
      '',
      `Generated: ${skopjeTime(new Date(product.generated_at))} · Europe/Skopje`,
      'Canonical input: WPA Journal Live · Original sources remain authoritative.',
      '',
      '## Executive snapshot',
      '',
      product.executive_snapshot.summary,
      '',
      `**Lead:** ${product.executive_snapshot.lead_title} · ${LABELS[product.executive_snapshot.lead_domain]} · ${product.executive_snapshot.lead_source}`,
      '',
      '## Daily selection',
      ''
    ];
    product.items.forEach((x, i) => {
      out.push(
        `### ${i+1}. ${x.title}`, '',
        `**${LABELS[x.domain]}** · ${x.source} · R ${x.relevance_score} · C ${x.source_confidence} · Product score ${x.score}`, '',
        x.summary, '',
        `**WPA working angle:** ${x.wpa_working_angle}`, '',
        `**Recommended route:** ${x.recommended_route}`, '',
        `Original source: ${x.original_url}`, ''
      );
    });
    out.push(
      '## Human Gate', '',
      'Automatically prepared and ready for human review. Not a peer-reviewed article, official institutional position, legal/security/diplomatic advice, or automatic external publication.', '',
      'Human approval is required before consequential release, doctrine changes, journal/working-paper/protocol-note publication, external platform posting, or third-party visual reuse.', ''
    );
    return out.join('\n');
  }

  function download(name, type, content) {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function render(product) {
    $('status').textContent = 'LIVE DAILY PRODUCT · READY FOR HUMAN GATE';
    $('status').className = 'status ok';
    $('health').innerHTML = [
      `<strong>Product date:</strong> ${esc(product.product_date)}`,
      `<strong>Generated:</strong> ${esc(skopjeTime(new Date(product.generated_at)))}`,
      `<strong>Journal Live packet:</strong> ${esc(skopjeTime(new Date(product.canonical_input.packet_generated_at)))}`,
      `<strong>Selected:</strong> ${product.automation.selected_items}`,
      `<strong>Domains:</strong> ${product.automation.domains_represented}`,
      `<strong>Source families:</strong> ${product.automation.unique_sources}`
    ].map(x => `<span>${x}</span>`).join('');

    $('snapshot').hidden = false;
    $('snapshotText').textContent = product.executive_snapshot.summary;
    $('lead').textContent = `${product.executive_snapshot.lead_title} · ${LABELS[product.executive_snapshot.lead_domain]} · ${product.executive_snapshot.lead_source}`;

    $('items').innerHTML = product.items.map((x,i) => `
      <article class="item-card">
        <div class="domain">${esc(LABELS[x.domain])}</div>
        <h2>${i+1}. ${esc(x.title)}</h2>
        <p class="meta">${esc(x.source)} · ${esc(skopjeTime(new Date(x.published_at)))} · R ${x.relevance_score} · C ${x.source_confidence} · Score ${x.score}</p>
        <p>${esc(x.summary)}</p>
        <div class="analysis"><strong>WPA working angle</strong><p>${esc(x.wpa_working_angle)}</p></div>
        <p class="route"><strong>Recommended route:</strong> ${esc(x.recommended_route)}</p>
        <p><a href="${esc(x.original_url)}" target="_blank" rel="noopener noreferrer">Оригинален извор →</a></p>
      </article>
    `).join('');

    $('downloadJson').disabled = false;
    $('downloadMd').disabled = false;
    $('downloadJson').onclick = () => download(`wpa-institute-daily-${product.product_date}.json`, 'application/json;charset=utf-8', JSON.stringify(product,null,2) + '\n');
    $('downloadMd').onclick = () => download(`wpa-institute-daily-${product.product_date}.md`, 'text/markdown;charset=utf-8', toMarkdown(product));
    $('refresh').disabled = false;
    $('error').hidden = true;
  }

  function fail(message) {
    $('status').textContent = 'FAIL-CLOSED · CURRENT DAILY PRODUCT UNAVAILABLE';
    $('status').className = 'status bad';
    $('error').hidden = false;
    $('error').textContent = message;
    $('snapshot').hidden = true;
    $('items').innerHTML = '';
    $('health').innerHTML = '';
    $('downloadJson').disabled = true;
    $('downloadMd').disabled = true;
    $('refresh').disabled = false;
  }

  async function load() {
    $('refresh').disabled = true;
    $('status').textContent = 'REFRESHING · JOURNAL LIVE';
    $('status').className = 'status';
    try {
      const response = await fetch(API_ROOT + '/api/v1/live?limit=120', {
        headers: {'Accept':'application/json'},
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`Journal Live API HTTP ${response.status}`);
      const packet = await response.json();
      const product = buildProduct(packet, new Date());
      window.WPA_INSTITUTE_DAILY_PRODUCT = product;
      render(product);
    } catch (err) {
      console.error(err);
      fail(err?.message || 'Daily Product generation failed.');
    }
  }

  $('refresh').addEventListener('click', load);
  load();
  window.setInterval(load, CONFIG.refreshMs);
})();