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

function score(rec){
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

const records = [];
const errors = [];

for (const q of queries) {
  // OpenAlex
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
      const rec = {
        source_database:'OpenAlex', query:q, id:w.id || null, title:clean(w.title),
        authors:(w.authorships||[]).map(a=>clean(a.author?.display_name)).filter(Boolean),
        year:w.publication_year || year(w.publication_date), doi:w.doi || null,
        url:w.primary_location?.landing_page_url || w.doi || w.id || null,
        abstract:clean(abstract).slice(0,1600) || null,
        open_access:Boolean(w.open_access?.is_oa), cited_by_count:w.cited_by_count ?? null,
        type:w.type || null
      };
      rec.traceability_score = score(rec); records.push(rec);
    }
  } catch(e) { errors.push({source:'OpenAlex',query:q,error:String(e.message||e)}); }
  await sleep(1100);

  // Crossref
  try {
    const u = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(q)}&rows=12&filter=from-pub-date:2023-01-01`;
    const data = await getJson(u);
    for (const w of data.message?.items || []) {
      const doi = w.DOI || null;
      const rec = {
        source_database:'Crossref', query:q, id:doi || w.URL || null,
        title:clean(Array.isArray(w.title)?w.title[0]:w.title),
        authors:(w.author||[]).map(a=>clean([a.given,a.family].filter(Boolean).join(' '))).filter(Boolean),
        year:w.published?.['date-parts']?.[0]?.[0] || w.created?.['date-parts']?.[0]?.[0] || null,
        doi:doi, url:w.URL || doiUrl(doi), abstract:clean(w.abstract).slice(0,1600) || null,
        open_access:null, cited_by_count:w['is-referenced-by-count'] ?? null, type:w.type || null
      };
      rec.traceability_score = score(rec); records.push(rec);
    }
  } catch(e) { errors.push({source:'Crossref',query:q,error:String(e.message||e)}); }
  await sleep(1600);

  // Zenodo
  try {
    const u = `https://zenodo.org/api/records?q=${encodeURIComponent(q)}&size=10&sort=mostrecent`;
    const data = await getJson(u);
    for (const w of data.hits?.hits || []) {
      const m = w.metadata || {};
      const doi = w.doi || m.doi || null;
      const rec = {
        source_database:'Zenodo', query:q, id:w.id || doi || null, title:clean(m.title),
        authors:(m.creators||m.contributors||[]).map(a=>clean(a.name)).filter(Boolean),
        year:year(m.publication_date || m.imprint?.date), doi,
        url:w.links?.html || doiUrl(doi), abstract:clean(m.description).slice(0,1600) || null,
        open_access:true, cited_by_count:null, type:m.resource_type?.type || null
      };
      rec.traceability_score = score(rec); records.push(rec);
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

dedup.sort((a,b)=>(b.traceability_score-a.traceability_score)||((b.year||0)-(a.year||0))||((b.cited_by_count||0)-(a.cited_by_count||0)));
const output = {
  generated:new Date().toISOString(),
  policy:'Official/open scholarly metadata APIs only. No paywall bypass. Records are discovery candidates pending human scholarly verification.',
  query_set:queries,
  total:dedup.length,
  sources:[...new Set(dedup.map(x=>x.source_database))],
  errors,
  records:dedup.slice(0,120)
};
await fs.mkdir('tools/wpa-product-factory/data',{recursive:true});
await fs.writeFile('tools/wpa-product-factory/data/academic-records.json',JSON.stringify(output,null,2));
console.log(`Academic harvest: ${output.records.length} deduplicated records from ${output.sources.join(', ')}`);
