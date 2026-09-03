import fs from 'fs/promises';

const queries = [
  'protocol diplomacy ceremonial diplomacy state protocol',
  'diplomatic protocol official visits precedence ceremonial',
  'public diplomacy institutional communication protocol',
  'AI governance human authority institutional responsibility',
  'security diplomacy protocol crisis governance'
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const clean = s => String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const year = v => { const m = String(v ?? '').match(/(19|20)\d{2}/); return m ? Number(m[0]) : null; };
const doiUrl = doi => doi ? `https://doi.org/${String(doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i,'')}` : null;

async function getJson(url, headers={}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const r = await fetch(url, {headers:{'User-Agent':'WorldProtocolAcademy/1.0 (public scholarly metadata research)', ...headers}, signal:controller.signal});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(timer); }
}

function traceabilityScore(rec){
  let s = 0;
  if (rec.doi) s += 25;
  if (rec.url) s += 15;
  if (rec.title) s += 15;
  if (rec.authors?.length) s += 10;
  if (rec.year) s += 10;
  if (rec.abstract) s += 15;
  if (rec.open_access === true) s += 10;
  return Math.min(100,s);
}

const RELEVANCE_RULES = [
  {label:'protocol-core', points:55, rx:/\b(diplomatic protocol|state protocol|official protocol|protocol practice|protocol officer|ceremonial protocol|order of precedence|diplomatic ceremonial|official ceremon(?:y|ies)|state ceremon(?:y|ies)|official visit|state visit|forms? of address|flag protocol|anthem protocol|seating protocol)\b/i},
  {label:'diplomacy-core', points:45, rx:/\b(public diplomacy|diplomatic practice|diplomatic relations|diplomatic signalling|diplomatic signaling|diplomatic representation|bilateral diplomacy|multilateral diplomacy|crisis diplomacy|digital diplomacy|science diplomacy|cultural diplomacy|foreign ministry|diplomatic mission)\b/i},
  {label:'institutional-governance', points:38, rx:/\b(institutional governance|institutional responsibility|institutional legitimacy|institutional communication|institutional representation|public institution|government communication|official communication|public administration|governance framework)\b/i},
  {label:'ai-human-authority', points:50, rx:/\b(ai governance|artificial intelligence governance|human authority|human oversight|human[- ]in[- ]the[- ]loop|algorithmic governance|automated decision[- ]making|institutional ai|responsible ai|ai accountability|ai regulation)\b/i},
  {label:'security-governance', points:34, rx:/\b(crisis governance|security governance|human security|event security|strategic stability|research security|institutional resilience|diplomatic security|public safety governance)\b/i},
  {label:'communication-core', points:32, rx:/\b(public communication|strategic communication|crisis communication|intercultural communication|organizational communication|institutional narrative|media framing|reputation management|public information)\b/i},
  {label:'scholarly-infrastructure', points:30, rx:/\b(scholarly infrastructure|research infrastructure|research integrity|publication ethics|scholarly metadata|research metadata|persistent identifier|persistent identifiers|doi metadata|open access publishing|open scholarly|crossref|openalex|datacite|doaj)\b/i},
  {label:'protocol-supporting', points:20, rx:/\b(precedence|ceremonial|state representation|official representation|diplomatic|diplomacy|protocol)\b/i},
  {label:'governance-supporting', points:18, rx:/\b(governance|accountability|legitimacy|institutional|authority|responsibility)\b/i}
];

const NEGATIVE_RULES = [
  {label:'technical-protocol', points:-45, rx:/\b(network protocol|communication protocol|internet protocol|cryptographic protocol|clinical protocol|study protocol|experimental protocol|treatment protocol|trial protocol|laboratory protocol|protocol for a (?:systematic|scoping) review)\b/i},
  {label:'biomedical-unrelated', points:-35, rx:/\b(biofilm|surgeon|surgical|oncolog|protein|genomic|bacteri|cyclopidae|copepoda|clinical trial|patient cohort)\b/i},
  {label:'physical-sciences-unrelated', points:-30, rx:/\b(dark fluid|lorentz|quantum hydrodynamic|cosmolog|spacetime|particle physics|audio synthesis|musical elements)\b/i},
  {label:'software-release-unrelated', points:-25, rx:/\b(version release|release notes|mlops|container registry|docker compose|software package)\b/i}
];

function relevance(rec){
  const title = clean(rec.title);
  const abstract = clean(rec.abstract);
  const text = `${title}. ${abstract}`;
  let score = 0;
  const reasons = [];
  for (const rule of RELEVANCE_RULES) {
    if (rule.rx.test(text)) { score += rule.points; reasons.push(rule.label); }
  }
  for (const rule of NEGATIVE_RULES) {
    if (rule.rx.test(text)) { score += rule.points; reasons.push(rule.label); }
  }
  // Title evidence is stronger than a passing abstract mention.
  if (/\b(diplomacy|diplomatic|state protocol|diplomatic protocol|public diplomacy|ai governance|institutional communication|crisis governance|research integrity|scholarly metadata)\b/i.test(title)) {
    score += 20; reasons.push('title-domain-match');
  }
  // A generic use of the word "protocol" alone is never enough for WPA relevance.
  if (/\bprotocol\b/i.test(text) && !/\b(diplomatic|state|official|ceremonial|precedence|diplomacy|institutional|governance)\b/i.test(text)) {
    score -= 25; reasons.push('generic-protocol-penalty');
  }
  return {score:Math.max(0,Math.min(100,score)),reasons:[...new Set(reasons)]};
}

function finalise(rec){
  rec.traceability_score = traceabilityScore(rec);
  const rel = relevance(rec);
  rec.wpa_relevance_score = rel.score;
  rec.wpa_relevance_reasons = rel.reasons;
  rec.wpa_relevance_pass = rel.score >= 45;
  return rec;
}

const records = [];
const errors = [];

for (const q of queries) {
  try {
    const u = `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=12&filter=from_publication_date:2023-01-01`;
    const data = await getJson(u);
    for (const w of data.results || []) {
      const inv = w.abstract_inverted_index || {};
      let abstract = '';
      if (Object.keys(inv).length) {
        const words=[]; for (const [token,poses] of Object.entries(inv)) for (const p of poses) words.push([p,token]);
        words.sort((a,b)=>a[0]-b[0]); abstract = words.map(x=>x[1]).join(' ');
      }
      records.push(finalise({
        source_database:'OpenAlex', query:q, id:w.id || null, title:clean(w.title),
        authors:(w.authorships||[]).map(a=>clean(a.author?.display_name)).filter(Boolean),
        year:w.publication_year || year(w.publication_date), doi:w.doi || null,
        url:w.primary_location?.landing_page_url || w.doi || w.id || null,
        abstract:clean(abstract).slice(0,1600) || null,
        open_access:Boolean(w.open_access?.is_oa), cited_by_count:w.cited_by_count ?? null,
        type:w.type || null
      }));
    }
  } catch(e) { errors.push({source:'OpenAlex',query:q,error:String(e.message||e)}); }
  await sleep(1100);

  try {
    const u = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(q)}&rows=12&filter=from-pub-date:2023-01-01`;
    const data = await getJson(u);
    for (const w of data.message?.items || []) {
      const doi = w.DOI || null;
      records.push(finalise({
        source_database:'Crossref', query:q, id:doi || w.URL || null,
        title:clean(Array.isArray(w.title)?w.title[0]:w.title),
        authors:(w.author||[]).map(a=>clean([a.given,a.family].filter(Boolean).join(' '))).filter(Boolean),
        year:w.published?.['date-parts']?.[0]?.[0] || w.created?.['date-parts']?.[0]?.[0] || null,
        doi:doi, url:w.URL || doiUrl(doi), abstract:clean(w.abstract).slice(0,1600) || null,
        open_access:null, cited_by_count:w['is-referenced-by-count'] ?? null, type:w.type || null
      }));
    }
  } catch(e) { errors.push({source:'Crossref',query:q,error:String(e.message||e)}); }
  await sleep(1600);

  try {
    const u = `https://zenodo.org/api/records?q=${encodeURIComponent(q)}&size=10&sort=mostrecent`;
    const data = await getJson(u);
    for (const w of data.hits?.hits || []) {
      const m = w.metadata || {};
      const doi = w.doi || m.doi || null;
      records.push(finalise({
        source_database:'Zenodo', query:q, id:w.id || doi || null, title:clean(m.title),
        authors:(m.creators||m.contributors||[]).map(a=>clean(a.name)).filter(Boolean),
        year:year(m.publication_date || m.imprint?.date), doi,
        url:w.links?.html || doiUrl(doi), abstract:clean(m.description).slice(0,1600) || null,
        open_access:true, cited_by_count:null, type:m.resource_type?.type || null
      }));
    }
  } catch(e) { errors.push({source:'Zenodo',query:q,error:String(e.message||e)}); }
  await sleep(1600);
}

const seen = new Set();
const dedup = [];
for (const r of records) {
  if (!r.title) continue;
  const key = (r.doi ? `doi:${String(r.doi).toLowerCase()}` : `t:${r.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}|${r.year||''}`);
  if (seen.has(key)) continue; seen.add(key); dedup.push(r);
}

dedup.sort((a,b)=>(b.wpa_relevance_score-a.wpa_relevance_score)||(b.traceability_score-a.traceability_score)||((b.year||0)-(a.year||0))||((b.cited_by_count||0)-(a.cited_by_count||0)));
const relevant = dedup.filter(r=>r.wpa_relevance_pass && r.traceability_score>=50);
const output = {
  generated:new Date().toISOString(),
  policy:'Official/open scholarly metadata APIs only. No paywall bypass. Relevance and traceability are separate measures. Records are discovery candidates pending human scholarly verification.',
  relevance_policy:'WPA Academic Radar requires traceability_score >= 50 and wpa_relevance_score >= 45. Generic technical/clinical uses of “protocol” are penalised and do not qualify by keyword alone.',
  query_set:queries,
  total_harvested_deduplicated:dedup.length,
  total_relevant:relevant.length,
  sources:[...new Set(dedup.map(x=>x.source_database))],
  errors,
  records:dedup.slice(0,160)
};
await fs.mkdir('tools/wpa-product-factory/data',{recursive:true});
await fs.writeFile('tools/wpa-product-factory/data/academic-records.json',JSON.stringify(output,null,2));
console.log(`Academic harvest: ${output.records.length} deduplicated records; ${output.total_relevant} passed WPA relevance + traceability gates from ${output.sources.join(', ')}`);
