import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const generated = new Date().toISOString();
const cycleHours = 3;
const institutionBatchSize = Math.max(4, Math.min(24, Number(process.env.WPA_OPEN_KNOWLEDGE_INSTITUTION_BATCH || 12)));
const OUT = path.join(ROOT, 'data/open-knowledge');
const VIRTUAL_OUT = path.join(ROOT, 'data/virtual-sande');
const MASTER = path.join(ROOT, 'data/global-institutions/v1.0-corrected-4f-rev3/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV3.json');
const SCHOLARLY_FILE = path.join(OUT, 'scholarly-atoms.json');
const INSTITUTIONAL_FILE = path.join(OUT, 'institutional-practice-atoms.json');
const STATUS_FILE = path.join(OUT, 'status.json');
const INTAKE_FILE = path.join(VIRTUAL_OUT, 'open-knowledge-intake.json');

const USER_AGENT = 'WorldProtocolAcademy-OpenKnowledge/1.0 (+https://worldprotocolacademy.mk/open-knowledge-command/)';
const FETCH_TIMEOUT = Math.max(5000, Number(process.env.WPA_OPEN_KNOWLEDGE_TIMEOUT_MS || 12000));
const MAX_PUBLIC_TEXT_BYTES = 420000;

const DOMAINS = [
  { id: 'PROTOCOL', query: 'diplomatic protocol state protocol ceremonial precedence', rx: /\b(protocol|ceremonial|precedence|etiquette|official visit|state visit|forms? of address|flags?|anthems?)\b/i },
  { id: 'DIPLOMACY_AND_IR', query: 'diplomacy diplomatic practice international relations foreign service', rx: /\b(diplomacy|diplomatic|foreign service|international relations|public diplomacy|multilateral|bilateral)\b/i },
  { id: 'PUBLIC_COMMUNICATION_AND_PR', query: 'public relations strategic communication institutional communication public communication', rx: /\b(public relations|strategic communication|institutional communication|public communication|media relations|reputation|crisis communication)\b/i },
  { id: 'SECURITY_STUDIES', query: 'security studies diplomatic security strategic security crisis governance', rx: /\b(security|defence|defense|crisis|resilience|strategic studies|peace and security)\b/i },
  { id: 'COMMUNICOLOGY', query: 'communicology communication theory intercultural communication organizational communication', rx: /\b(communicology|communication theory|intercultural communication|organizational communication|communication studies)\b/i },
  { id: 'CROSS_DISCIPLINARY', query: 'protocolometry measurement diplomacy protocol governance methodology', rx: /\b(protocolometry|measurement|indicator|methodology|evaluation|governance|protocol)\b/i }
];

const ROUTES = [
  'VIRTUAL_SANDE',
  'VIRAL_SANDE',
  'WPAWS',
  'PROTOCOLometry',
  'INSTITUTIONAL_STRATEGY',
  'RESEARCH_AGENDA',
  'JOURNAL',
  'WORKING_PAPER',
  'PROTOCOL_NOTE',
  'PROGRAMME_DESIGN',
  'CURRICULUM',
  'SIMULATION',
  'CASE_STUDY',
  'BRIEFING',
  'FORESIGHT',
  'GOVERNANCE',
  'QUALITY_ASSURANCE',
  'PUBLIC_COMMUNICATION',
  'SOCIAL_COMMUNICATION',
  'STUDENT_DESK',
  'EVENTS'
];

const readJson = async (file, fallback) => {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
};
const writeJson = async (file, value) => fs.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
const hash = (value) => crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16).toUpperCase();
const clean = (value = '') => String(value)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/\s+/g, ' ')
  .trim();
const uniq = (items) => [...new Set(items.filter(Boolean))];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchResponse(url, options = {}) {
  return fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': USER_AGENT,
      accept: options.accept || 'application/json,text/html;q=0.9,text/plain;q=0.8,*/*;q=0.5',
      ...(options.headers || {})
    },
    signal: AbortSignal.timeout(options.timeout || FETCH_TIMEOUT)
  });
}

async function fetchJson(url) {
  const response = await fetchResponse(url, { accept: 'application/json' });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function readCappedText(response, maxBytes = MAX_PUBLIC_TEXT_BYTES) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let out = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      out += decoder.decode(value, { stream: true });
      if (bytes >= maxBytes) {
        await reader.cancel('WPA bounded public-source read');
        break;
      }
    }
    out += decoder.decode();
  } finally {
    try { reader.releaseLock(); } catch {}
  }
  return out;
}

function abstractFromOpenAlex(index = {}) {
  const words = [];
  for (const [token, positions] of Object.entries(index || {})) {
    for (const position of positions || []) words.push([position, token]);
  }
  words.sort((a, b) => a[0] - b[0]);
  return clean(words.map(([, token]) => token).join(' '));
}

function coreFromText(text, domain, limit = 1500) {
  let body = String(text || '');
  body = body.replace(/[\s\S]*?\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i, ' ')
    .replace(/\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*/i, ' ');
  body = clean(body);
  const sentences = body.split(/(?<=[.!?])\s+/).map((s) => clean(s)).filter((s) => s.length >= 45 && s.length <= 420);
  const ranked = sentences.map((sentence, index) => {
    let score = domain.rx.test(sentence) ? 6 : 0;
    if (/\b(principle|practice|method|role|function|responsibility|institution|state|public|communication|diplom|security|protocol)\b/i.test(sentence)) score += 2;
    if (index < 30) score += 1;
    return { sentence, score, index };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = [];
  let length = 0;
  for (const item of ranked) {
    if (selected.includes(item.sentence)) continue;
    if (length + item.sentence.length > limit) continue;
    selected.push(item.sentence);
    length += item.sentence.length + 1;
    if (selected.length >= 6) break;
  }
  if (!selected.length) selected.push(...sentences.slice(0, 3));
  return selected.join(' ').slice(0, limit).trim();
}

function scholarlyTraceability(atom) {
  let score = 20;
  if (atom.title) score += 15;
  if (atom.authors?.length) score += 10;
  if (atom.year) score += 10;
  if (atom.source_identity?.doi) score += 20;
  if (atom.source_identity?.url) score += 15;
  if (['PUBLIC_DOMAIN', 'OPEN_LICENSE'].includes(atom.access_basis)) score += 10;
  return Math.min(100, score);
}

async function harvestOpenAlexBooks(domain) {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(domain.query)}&filter=type:book,is_oa:true&per-page=8`;
  const data = await fetchJson(url);
  const atoms = [];
  for (const work of data.results || []) {
    const title = clean(work.title);
    if (!title) continue;
    const abstract = abstractFromOpenAlex(work.abstract_inverted_index || {});
    const license = work.best_oa_location?.license || work.primary_location?.license || null;
    const openLicense = /^(cc-|cc0|public-domain)/i.test(String(license || ''));
    const atom = {
      atom_id: `SKA-OABOOK-${hash(work.id || work.doi || title)}`,
      source_type: 'BOOK',
      title,
      authors: (work.authorships || []).map((a) => clean(a.author?.display_name)).filter(Boolean),
      year: work.publication_year || null,
      discipline: [domain.id],
      source_identity: {
        doi: work.doi || null,
        isbn: null,
        issn: null,
        publisher_or_journal: clean(work.primary_location?.source?.display_name || '') || null,
        url: work.best_oa_location?.landing_page_url || work.primary_location?.landing_page_url || work.doi || work.id || null,
        discovery_source: 'OpenAlex open-access book metadata',
        retrieved: generated
      },
      access_basis: openLicense ? 'OPEN_LICENSE' : 'OPEN_METADATA_ONLY',
      license: license || null,
      authority_score: null,
      traceability_score: null,
      evidence_status: 'PARTIALLY_SUPPORTED',
      knowledge_summary: openLicense && abstract
        ? coreFromText(abstract, domain, 900)
        : `Open-access book record relevant to ${domain.id}. Metadata is reusable for discovery; full-text or substantive extraction remains blocked until an explicit reusable licence or public-domain basis is confirmed.`,
      research_question: null,
      method_or_argument: null,
      principal_findings_or_theses: [],
      limitations: openLicense
        ? ['Automated metadata/abstract extraction; human academic interpretation is required.']
        : ['Open-access visibility is not treated as permission to copy or ingest full text without an explicit reusable licence.'],
      contradictions_or_counterevidence: [],
      doctrine_relation: 'NOT_ASSESSED',
      doctrine_note: null,
      strategy_relation: ROUTES,
      reuse_status: openLicense ? 'ELIGIBLE_AFTER_HUMAN_REVIEW' : 'HOLD',
      reuse_constraints: ['Preserve source identity and authorship.', 'No autonomous doctrine mutation or scientific publication.'],
      human_review_status: 'PENDING',
      review_note: null,
      correction_status: 'NONE',
      version: '1.0',
      updated: generated
    };
    atom.traceability_score = scholarlyTraceability(atom);
    atoms.push(atom);
  }
  return atoms;
}

function gutenbergTextUrl(book) {
  const formats = book?.formats || {};
  return Object.entries(formats).find(([key, value]) => key.startsWith('text/plain') && value && !String(value).endsWith('.zip'))?.[1] || null;
}

async function harvestGutenbergBook(domain) {
  const data = await fetchJson(`https://gutendex.com/books/?search=${encodeURIComponent(domain.query)}`);
  const book = (data.results || []).find((item) => item.copyright === false && gutenbergTextUrl(item));
  if (!book) return [];
  const textUrl = gutenbergTextUrl(book);
  const response = await fetchResponse(textUrl, { accept: 'text/plain', headers: { range: `bytes=0-${MAX_PUBLIC_TEXT_BYTES - 1}` } });
  if (!response.ok && response.status !== 206) throw new Error(`HTTP ${response.status} for ${textUrl}`);
  const sourceText = await readCappedText(response);
  const title = clean(book.title);
  const summary = coreFromText(sourceText, domain, 1500);
  if (!title || !summary) return [];
  const atom = {
    atom_id: `SKA-PDBOOK-${hash(`gutenberg:${book.id}`)}`,
    source_type: 'BOOK',
    title,
    authors: (book.authors || []).map((a) => clean(a.name)).filter(Boolean),
    year: null,
    discipline: [domain.id],
    source_identity: {
      doi: null,
      isbn: null,
      issn: null,
      publisher_or_journal: 'Project Gutenberg',
      url: book.formats?.['text/html'] || textUrl || `https://www.gutenberg.org/ebooks/${book.id}`,
      discovery_source: 'Gutendex / Project Gutenberg public-domain book discovery',
      retrieved: generated
    },
    access_basis: 'PUBLIC_DOMAIN',
    license: 'Public-domain status reported by Gutendex/Project Gutenberg metadata; source terms remain authoritative.',
    authority_score: null,
    traceability_score: null,
    evidence_status: 'PARTIALLY_SUPPORTED',
    knowledge_summary: summary,
    research_question: null,
    method_or_argument: null,
    principal_findings_or_theses: [],
    limitations: ['Automated extractive core from a bounded public-domain text sample; human interpretation and contextual verification are required.'],
    contradictions_or_counterevidence: [],
    doctrine_relation: 'NOT_ASSESSED',
    doctrine_note: null,
    strategy_relation: ROUTES,
    reuse_status: 'ELIGIBLE_AFTER_HUMAN_REVIEW',
    reuse_constraints: ['Preserve title, author and source identity.', 'Do not present the source work as WPA authorship.'],
    human_review_status: 'PENDING',
    review_note: null,
    correction_status: 'NONE',
    version: '1.0',
    updated: generated
  };
  atom.traceability_score = scholarlyTraceability(atom);
  return [atom];
}

function institutionRelevant(inst) {
  if (!inst || inst.id === 'R001' || !inst.website) return false;
  if (!['A', 'B'].includes(String(inst.protocol_relevance_level || ''))) return false;
  const text = `${inst.name || ''} ${inst.institution_type || ''} ${inst.notes || ''}`;
  return /\b(protocol|diplom|foreign service|international relations|security|defen[cs]e|strategic|public policy|public communication|communication|communicolog|government|political science|peace|training|academy|school|institute|university)\b/i.test(text);
}

function extractLinks(html, baseUrl) {
  const links = [];
  const rx = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>/gi;
  let match;
  while ((match = rx.exec(html))) {
    try {
      const url = new URL(match[1], baseUrl);
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      links.push(url.toString());
    } catch {}
  }
  return uniq(links);
}

function linkScore(url) {
  const value = String(url).toLowerCase();
  let score = 0;
  if (/research|publication|library|resource|programme|program|course|curriculum|training|education|diplom|protocol|security|communication|insight|policy|news|about/.test(value)) score += 5;
  if (/\.pdf(?:$|\?)/.test(value)) score += 2;
  if (/login|signin|account|cart|checkout|admin|wp-login|register/.test(value)) score -= 20;
  return score;
}

function pageSignals(html, url) {
  const title = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const headings = [];
  const headingRx = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi;
  let match;
  while ((match = headingRx.exec(html)) && headings.length < 14) {
    const heading = clean(match[1]).slice(0, 140);
    if (heading) headings.push(heading);
  }
  const visible = clean(html).slice(0, 120000);
  const topicRules = [
    ['protocol', /\b(protocol|ceremonial|precedence|etiquette|official visit)\b/i],
    ['diplomacy', /\b(diplomacy|diplomatic|foreign service|international relations)\b/i],
    ['public_communication_pr', /\b(public relations|strategic communication|public communication|media relations|crisis communication)\b/i],
    ['security_studies', /\b(security|defen[cs]e|peace and security|strategic studies|crisis|resilience)\b/i],
    ['communicology', /\b(communicology|communication theory|communication studies|intercultural communication|organizational communication)\b/i],
    ['research', /\b(research|publication|journal|paper|study|working paper|policy brief)\b/i],
    ['programme_architecture', /\b(programme|program|course|curriculum|module|master|certificate|training|education)\b/i]
  ];
  const topics = topicRules.filter(([, rx]) => rx.test(`${title} ${headings.join(' ')} ${visible}`)).map(([id]) => id);
  return { url, title: title || new URL(url).hostname, headings: uniq(headings), topics: uniq(topics) };
}

const robotsCache = new Map();
async function robotsPolicy(targetUrl) {
  const url = new URL(targetUrl);
  const origin = url.origin;
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  const policy = { origin, checked: true, allows: true, status: 'UNKNOWN_OR_NOT_PUBLISHED', disallow: [], crawl_delay_seconds: 0 };
  try {
    const response = await fetchResponse(`${origin}/robots.txt`, { accept: 'text/plain', timeout: 8000 });
    if (response.status === 404) {
      policy.status = 'NOT_PUBLISHED';
    } else if (response.ok) {
      const text = await readCappedText(response, 100000);
      let applies = false;
      for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.replace(/#.*/, '').trim();
        if (!line) continue;
        const [rawKey, ...rest] = line.split(':');
        const key = rawKey.trim().toLowerCase();
        const value = rest.join(':').trim();
        if (key === 'user-agent') {
          applies = value === '*';
        } else if (applies && key === 'disallow' && value) {
          policy.disallow.push(value);
        } else if (applies && key === 'crawl-delay') {
          policy.crawl_delay_seconds = Math.max(0, Number(value) || 0);
        }
      }
      policy.status = 'PUBLISHED_PARSED';
      policy.allows = !policy.disallow.some((prefix) => prefix === '/' || (prefix && url.pathname.startsWith(prefix)));
    } else {
      policy.status = `HTTP_${response.status}`;
    }
  } catch (error) {
    policy.status = 'UNAVAILABLE';
    policy.error = String(error?.message || error).slice(0, 180);
  }
  robotsCache.set(origin, policy);
  return policy;
}

async function fetchPublicHtml(url) {
  const response = await fetchResponse(url, { accept: 'text/html,application/xhtml+xml;q=0.9' });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const type = String(response.headers.get('content-type') || '').toLowerCase();
  if (!type.includes('text/html') && !type.includes('application/xhtml+xml')) throw new Error(`Non-HTML content ${type || 'unknown'} at ${url}`);
  const html = await readCappedText(response);
  return { html, finalUrl: response.url || url, status: response.status };
}

async function harvestInstitution(inst) {
  const robots = await robotsPolicy(inst.website);
  if (!robots.allows) {
    return { observation: { id: inst.id, name: inst.name, website: inst.website, status: 'SKIPPED_ROBOTS_DISALLOW', robots, checked_at: generated }, atom: null };
  }
  if (robots.crawl_delay_seconds > 0) await sleep(Math.min(robots.crawl_delay_seconds * 1000, 3000));
  try {
    const first = await fetchPublicHtml(inst.website);
    const origin = new URL(first.finalUrl).origin;
    const candidates = extractLinks(first.html, first.finalUrl)
      .filter((link) => {
        try { return new URL(link).origin === origin; } catch { return false; }
      })
      .map((link) => ({ link, score: linkScore(link) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const pages = [pageSignals(first.html, first.finalUrl)];
    const publicDocumentCandidates = candidates.filter((x) => /\.pdf(?:$|\?)/i.test(x.link)).map((x) => x.link).slice(0, 4);
    for (const candidate of candidates.filter((x) => !/\.pdf(?:$|\?)/i.test(x.link)).slice(0, 2)) {
      const candidateRobots = await robotsPolicy(candidate.link);
      if (!candidateRobots.allows) continue;
      try {
        const page = await fetchPublicHtml(candidate.link);
        pages.push(pageSignals(page.html, page.finalUrl));
      } catch {}
      await sleep(120);
    }

    const topics = uniq(pages.flatMap((p) => p.topics));
    const pageTitles = uniq(pages.map((p) => p.title)).slice(0, 8);
    const practiceTypes = uniq([
      topics.includes('programme_architecture') ? 'programme_architecture' : null,
      topics.includes('research') ? 'research' : null,
      topics.includes('protocol') ? 'protocol_practice' : null,
      topics.includes('diplomacy') ? 'diplomacy_training_or_practice' : null,
      topics.includes('public_communication_pr') ? 'public_communication' : null,
      topics.includes('security_studies') ? 'security_studies' : null,
      topics.includes('communicology') ? 'communication_studies' : null
    ]);
    const summary = `Public pages for ${inst.name} expose source-traceable signals in ${topics.length ? topics.join(', ') : 'institutional education/research activity'}. Observed public page titles include: ${pageTitles.slice(0, 4).join(' | ')}. This is an automated practice candidate for human review; protected body text is not retained.`;
    const atom = {
      atom_id: `IPA-OPENWEB-${hash(`${inst.id}:${pages.map((p) => p.url).join('|')}`)}`,
      institution_id: inst.id,
      institution_name: inst.name,
      country: inst.country || null,
      region: null,
      peer_type: inst.institution_type || null,
      practice_title: `${inst.name} — public institutional knowledge signals`,
      practice_summary: summary,
      practice_type: practiceTypes.length ? practiceTypes : ['research'],
      i01_i20_links: [],
      source_refs: pages.map((p) => ({ url_or_identifier: p.url, source_tier: 'A', retrieved: generated, supports: `Public page signal: ${p.title}` })),
      evidence_status: 'PARTIALLY_SUPPORTED',
      confidence: 'NOT_ASSIGNED',
      distinctive_value: 'NOT_ASSESSED',
      reuse_status: 'ELIGIBLE_AFTER_HUMAN_REVIEW',
      approved_reuse_domains: [],
      reuse_constraints: [
        'Public-web observation does not imply endorsement, partnership, accreditation or ranking.',
        'Reuse means learning, comparison and synthesis; protected body text is not copied into WPA.',
        'Human review is required before consequential institutional reuse.'
      ],
      human_review_status: 'PENDING',
      review_note: null,
      version: '1.0',
      updated: generated,
      portal_signals: {
        topics,
        page_titles: pageTitles,
        public_document_candidates: publicDocumentCandidates,
        source_body_retained: false,
        robots_status: robots.status
      }
    };
    return {
      observation: {
        id: inst.id,
        name: inst.name,
        website: inst.website,
        status: 'PUBLIC_PORTAL_OBSERVED',
        pages_observed: pages.length,
        topics,
        public_document_candidates: publicDocumentCandidates.length,
        robots_status: robots.status,
        checked_at: generated
      },
      atom
    };
  } catch (error) {
    return { observation: { id: inst.id, name: inst.name, website: inst.website, status: 'UNAVAILABLE_THIS_CYCLE', robots_status: robots.status, error: String(error?.message || error).slice(0, 220), checked_at: generated }, atom: null };
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, worker));
  return out;
}

function mergeAtoms(previous, current, cap = 500) {
  const map = new Map();
  for (const atom of [...(previous || []), ...(current || [])]) map.set(atom.atom_id, atom);
  return [...map.values()].sort((a, b) => String(b.updated || '').localeCompare(String(a.updated || ''))).slice(0, cap);
}

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(VIRTUAL_OUT, { recursive: true });

const scholarlyErrors = [];
const scholarlyNew = [];
const scholarlyJobs = DOMAINS.flatMap((domain) => [
  (async () => {
    try { return await harvestOpenAlexBooks(domain); }
    catch (error) { scholarlyErrors.push({ source: 'OpenAlex OA Books', domain: domain.id, error: String(error?.message || error).slice(0, 220) }); return []; }
  })(),
  (async () => {
    try { return await harvestGutenbergBook(domain); }
    catch (error) { scholarlyErrors.push({ source: 'Project Gutenberg', domain: domain.id, error: String(error?.message || error).slice(0, 220) }); return []; }
  })()
]);
for (const result of await Promise.all(scholarlyJobs)) scholarlyNew.push(...result);

const scholarlyPrevious = await readJson(SCHOLARLY_FILE, { atoms: [] });
const scholarlyAtoms = mergeAtoms(scholarlyPrevious.atoms, scholarlyNew);

const master = await readJson(MASTER, { metadata: {}, institutions: [] });
const institutions = Array.isArray(master.institutions) ? master.institutions : [];
const eligibleInstitutions = institutions.filter(institutionRelevant);
const runOrdinal = Math.floor(Date.now() / (cycleHours * 3600 * 1000));
const start = eligibleInstitutions.length ? (runOrdinal * institutionBatchSize) % eligibleInstitutions.length : 0;
const institutionBatch = eligibleInstitutions.length
  ? Array.from({ length: Math.min(institutionBatchSize, eligibleInstitutions.length) }, (_, i) => eligibleInstitutions[(start + i) % eligibleInstitutions.length])
  : [];
const institutionResults = await mapLimit(institutionBatch, 4, harvestInstitution);
const institutionalNew = institutionResults.map((x) => x.atom).filter(Boolean);
const institutionalPrevious = await readJson(INSTITUTIONAL_FILE, { atoms: [] });
const institutionalAtoms = mergeAtoms(institutionalPrevious.atoms, institutionalNew);
const observations = institutionResults.map((x) => x.observation);

const rightsPolicy = {
  open_book_rule: 'Substantive book extraction is allowed only for public-domain or explicitly open-licensed material. Open-access visibility alone is not treated as a full-text reuse licence.',
  institutional_portal_rule: 'Agents may inspect publicly reachable institutional pages and derive short structured practice signals. Protected body text is not retained or republished.',
  restricted_rule: 'No login, CAPTCHA, paywall, access-control, private-group or restricted-database bypass. Restricted sources remain discovery/manual-verification surfaces only.',
  robots_rule: 'Institutional portal observation checks published robots.txt instructions and skips paths blocked for the public crawler.',
  attribution_rule: 'Every knowledge/practice atom preserves title or institution identity, source URL and retrieval time.',
  human_gate: 'All new atoms enter a human-review queue before consequential WPA reuse, doctrine change, scientific publication or external institutional judgment.'
};

await writeJson(SCHOLARLY_FILE, {
  schema: 'wpa-open-knowledge-scholarly-atoms/1.0',
  generated,
  status: 'HUMAN_REVIEW_QUEUE_ONLY',
  source_types: ['OPEN_ACCESS_BOOK_METADATA', 'PUBLIC_DOMAIN_BOOK_TEXT'],
  rights_policy: rightsPolicy,
  new_this_cycle: scholarlyNew.length,
  retained_total: scholarlyAtoms.length,
  errors: scholarlyErrors,
  atoms: scholarlyAtoms
});

await writeJson(INSTITUTIONAL_FILE, {
  schema: 'wpa-open-knowledge-institutional-practice-atoms/1.0',
  generated,
  status: 'HUMAN_REVIEW_QUEUE_ONLY',
  master_dataset_version: master?.metadata?.version || null,
  eligible_public_portal_targets: eligibleInstitutions.length,
  checked_this_cycle: institutionBatch.length,
  new_atoms_this_cycle: institutionalNew.length,
  retained_total: institutionalAtoms.length,
  rights_policy: rightsPolicy,
  observations,
  atoms: institutionalAtoms
});

const status = {
  schema: 'wpa-open-knowledge-status/1.0',
  generated,
  mode: 'PROACTIVE_OPEN_KNOWLEDGE_24X7',
  cadence: `every ${cycleHours} hours when the Institute workflow is active`,
  operational_state: scholarlyNew.length || institutionalNew.length ? 'ACTIVE_CANDIDATE_GENERATION' : (scholarlyAtoms.length || institutionalAtoms.length ? 'DEGRADED_RETAINED_KNOWLEDGE' : 'NO_NEW_SOURCE_DATA'),
  domains: DOMAINS.map((x) => x.id),
  agents: [
    'Open Book Discovery Agent',
    'Rights and Access Agent',
    'Institutional Portal Agent',
    'Core Signal Extraction Agent',
    'Provenance and Traceability Agent',
    'Virtual/Viral Sande Routing Agent',
    'Correction and Withdrawal Agent'
  ],
  book_lane: {
    sources: ['OpenAlex open-access book metadata', 'Project Gutenberg public-domain books via Gutendex'],
    new_this_cycle: scholarlyNew.length,
    retained_total: scholarlyAtoms.length,
    errors: scholarlyErrors
  },
  institutional_lane: {
    master_dataset_version: master?.metadata?.version || null,
    eligible_targets: eligibleInstitutions.length,
    batch_size: institutionBatch.length,
    new_atoms_this_cycle: institutionalNew.length,
    retained_total: institutionalAtoms.length,
    observations
  },
  routing: ROUTES,
  rights_policy: rightsPolicy,
  controls: {
    paywall_or_login_bypass: 'DISABLED',
    protected_full_text_copying: 'DISABLED',
    public_web_body_retention: 'DISABLED',
    autonomous_doctrine_change: 'DISABLED',
    autonomous_scientific_publication: 'DISABLED',
    autonomous_institutional_ranking_or_judgment: 'DISABLED',
    human_review_before_consequential_reuse: 'REQUIRED'
  }
};
await writeJson(STATUS_FILE, status);

await writeJson(INTAKE_FILE, {
  schema: 'wpa-virtual-sande-open-knowledge-intake/1.0',
  generated,
  status: 'SOURCE_TRACEABLE_CANDIDATES_PENDING_HUMAN_REVIEW',
  purpose: 'Shared proactive knowledge intake for Virtual Sande, Viral Sande and all eligible WPA Institute systems.',
  domains: status.domains,
  routing: ROUTES,
  rights_policy: rightsPolicy,
  scholarly_atoms: scholarlyAtoms,
  institutional_practice_atoms: institutionalAtoms,
  human_gate: {
    state: 'REQUIRED',
    rule: 'Agents may discover, extract permitted cores, structure and route. Human Authority decides consequential reuse, doctrine, publication, canonical verification and official institutional judgment.'
  }
});

console.log(`Open Knowledge: ${scholarlyNew.length} new scholarly atoms; ${institutionalNew.length}/${institutionBatch.length} institutional portal atoms; retained ${scholarlyAtoms.length} scholarly + ${institutionalAtoms.length} institutional.`);
