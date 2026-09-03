import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const readJson = async (p, fallback) => { try { return JSON.parse(await fs.readFile(p,'utf8')); } catch { return fallback; } };
const clean = s => String(s ?? '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const esc = s => clean(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const dateOnly = v => { const d=new Date(v); return Number.isNaN(d.getTime())?'—':d.toISOString().slice(0,10); };
const now = new Date();
const generated = now.toISOString();
const runDate = generated.slice(0,10);

const watch = await readJson(path.join(ROOT,'tools/wpa-watch/items.json'),[]);
const watchStatus = await readJson(path.join(ROOT,'tools/wpa-watch/status.json'),{});
const topics = await readJson(path.join(ROOT,'journal/watch/topics.json'),[]);
const academic = await readJson(path.join(ROOT,'tools/wpa-product-factory/data/academic-records.json'),{records:[]});

function freshness(v){ const d=new Date(v||0); if(Number.isNaN(d.getTime()))return 0; const days=Math.max(0,(Date.now()-d.getTime())/86400000); return Math.max(0,30-days); }
function rankWatch(x){
  const domainWeight={protocol:30,diplomacy:26,security:22,pr:20,communicology:18,academic:16,general:5}[x.domain]||5;
  const sourceWeight=/UN News|NATO|OSCE|Crossref|OpenAlex|DOAJ|ReliefWeb/i.test(x.source||'')?20:10;
  return domainWeight+sourceWeight+freshness(x.isoDate);
}
function uniqueBy(items,keyFn){const s=new Set(),o=[];for(const x of items){const k=keyFn(x);if(!k||s.has(k))continue;s.add(k);o.push(x);}return o;}
function pct(n,d){ return d > 0 ? Math.round((Number(n||0)/d)*1000)/10 : 0; }
function completeness(items,fields){
  const total=Array.isArray(items)?items.length:0;
  const complete=(items||[]).filter(x=>fields.every(f=>x?.[f]!==undefined && x?.[f]!==null && String(x[f]).trim()!=='')).length;
  return {complete,total,percent:pct(complete,total)};
}
function countBy(items,key){
  const out={};
  for(const x of items||[]){const v=clean(x?.[key]||'unclassified')||'unclassified';out[v]=(out[v]||0)+1;}
  return Object.fromEntries(Object.entries(out).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])));
}

const rankedWatch=uniqueBy([...watch].sort((a,b)=>rankWatch(b)-rankWatch(a)),x=>x.link||x.title).slice(0,18);
const coreBrief=rankedWatch.slice(0,10);
const diplomacyRadar=rankedWatch.filter(x=>['protocol','diplomacy','pr','security'].includes(x.domain)).slice(0,12);
const academicRadar=uniqueBy((academic.records||[]).filter(r=>r.traceability_score>=50),r=>r.doi||`${r.title}|${r.year}`).slice(0,24);
const dossierTopics=(topics||[]).filter(t=>!t.review_hold && t.status!=='classification_review').slice(0,12);

function domainImplication(domain){
  return {
    protocol:'Potential relevance to ceremonial order, official visits, precedence, state representation or institutional protocol practice.',
    diplomacy:'Potential relevance to diplomatic signalling, multilateral relations, crisis diplomacy or institutional representation.',
    security:'Potential relevance to crisis governance, human security, strategic stability, event security or institutional resilience.',
    pr:'Potential relevance to public information, institutional communication, legitimacy, reputation or crisis messaging.',
    communicology:'Potential relevance to institutional meaning, intercultural communication or human communication processes.',
    academic:'Potential relevance to scholarly infrastructure, metadata quality, publication ethics, traceability or research integrity.'
  }[domain] || 'Potential relevance requires human framing.';
}

const dailyBrief={
  product:'WPA Daily Protocol & Diplomacy Brief',version:'1.0',generated,coverage_date:runDate,
  status:'AUTO-GENERATED · PUBLIC-SOURCE PRODUCT · HUMAN VALIDATION REQUIRED FOR OFFICIAL OR ACADEMIC USE',
  methodology:'Ranks public RSS/Atom candidates by topical relevance, source class and freshness. It does not infer facts beyond supplied source metadata and summaries.',
  items:coreBrief.map((x,i)=>({rank:i+1,title:clean(x.title),source:clean(x.source),date:dateOnly(x.isoDate),domain:x.domain||'general',source_url:x.link||null,summary:clean(x.summary).slice(0,650),wpa_relevance:domainImplication(x.domain)}))
};

const radar={
  product:'WPA Academic Research Radar',version:'1.0',generated,
  status:'AUTO-GENERATED · SCHOLARLY-METADATA PRODUCT · HUMAN SCHOLARLY VERIFICATION REQUIRED',
  methodology:'Uses official/open scholarly metadata endpoints (currently OpenAlex, Crossref and Zenodo), deduplicates by DOI or title/year and prioritises traceability.',
  items:academicRadar.map((r,i)=>({rank:i+1,title:r.title,authors:r.authors,year:r.year,source_database:r.source_database,doi:r.doi,url:r.url,open_access:r.open_access,cited_by_count:r.cited_by_count,traceability_score:r.traceability_score,abstract:r.abstract}))
};

const dossiers={
  product:'WPA Editorial Dossier Pack',version:'1.0',generated,
  status:'AUTO-GENERATED · EDITORIAL WORK PRODUCT · NOT A JOURNAL ARTICLE OR ACCEPTANCE DECISION',
  methodology:'Transforms Journal Watch candidates that are not on classification hold into structured editorial dossiers. Every dossier remains subject to human editorial screening and, where applicable, peer review.',
  dossiers:dossierTopics.map((t,i)=>({
    dossier_id:`WPA-ED-${runDate.replaceAll('-','')}-${String(i+1).padStart(2,'0')}`,
    title:t.title,discipline:t.discipline,source:t.source,source_url:t.source_url,date:t.date,
    source_summary:t.summary,proposed_format:t.article_type,research_angle:t.research_angle,
    research_questions:[
      `What is the institutionally relevant dimension of “${clean(t.title).slice(0,120)}”?`,
      `Which primary or authoritative sources are required to verify the event, policy or claim?`,
      `How does the development relate to ${t.discipline||'the relevant WPA discipline'} without overstating causality?`,
      'What comparative case, rule, precedent or governance framework would materially improve the analysis?'
    ],
    production_outline:['Verified factual chronology','Primary-source evidence table','Institutional/protocol context','Comparative or doctrinal analysis','Limits and alternative interpretations','Human-reviewed conclusion and references'],
    verification:t.verification
  }))
};

const sourceAudit={
  product:'WPA Source & Pipeline Audit',version:'1.0',generated,
  status:'AUTOMATED QUALITY-CONTROL PRODUCT',
  watch_candidates:watch.length,journal_topics:topics.length,academic_records:(academic.records||[]).length,
  academic_sources:academic.sources||[],academic_errors:academic.errors||[],
  review_holds:(topics||[]).filter(t=>t.review_hold||t.status==='classification_review').map(t=>({title:t.title,reason:t.review_hold||'classification_review',source:t.source})),
  guardrails:['No paywall bypass','No login-restricted scraping','No automatic scientific-article publication','No automatic peer-review decision','Human validation required before official/academic reliance']
};

const diplomacyProduct={
  product:'WPA Protocol, Diplomacy & Institutional Signals Radar',version:'1.0',generated,
  status:'AUTO-GENERATED · PUBLIC-SOURCE ANALYTICAL RADAR',
  items:diplomacyRadar.map((x,i)=>({rank:i+1,title:clean(x.title),domain:x.domain,source:clean(x.source),date:dateOnly(x.isoDate),url:x.link,signal:domainImplication(x.domain),source_summary:clean(x.summary).slice(0,500)}))
};

const watchTrace=completeness(watch,['title','link','source','isoDate']);
const editorialTrace=completeness(topics,['title','source','source_url','verification']);
const scholarlyRecords=academic.records||[];
const scholarlyTraceable=scholarlyRecords.filter(r=>Number(r.traceability_score||0)>=50).length;
const scholarlyTraceAvg=scholarlyRecords.length?Math.round(scholarlyRecords.reduce((s,r)=>s+Number(r.traceability_score||0),0)/scholarlyRecords.length*10)/10:0;
const sourceLive=Number(watchStatus.sources_live||0);
const sourceTotal=Number(watchStatus.sources_total||0);
const protocolometryDigest={
  product:'WPA Protocolometry Operations Digest',version:'1.0',generated,
  status:'AUTO-GENERATED · METHODOLOGICAL MEASUREMENT PRODUCT · NO ORDINAL RANKING · HUMAN INTERPRETATION REQUIRED',
  methodology:'Operational Protocolometry measures observable evidence and pipeline properties: source availability, record traceability, scholarly metadata traceability and editorial source linkage. It does not rank institutions, people or states and does not convert technical availability into substantive verification.',
  doctrine:{
    role:'Methodological measurement layer connecting public-source discovery, academic search, traceability, editorial preparation and human correction.',
    principles:['Measure before ranking','Evidence before confidence','Publicly inspectable outputs','Correction remains open','Human Authority remains the final institutional gate']
  },
  measurement_profile:[
    {id:'POM-OPS-01',label:'WPA Watch source availability',value:pct(sourceLive,sourceTotal),unit:'percent',numerator:sourceLive,denominator:sourceTotal,formula:'sources_live / sources_total × 100',limit:'Technical feed availability only; it is not a judgment of source quality, credibility or institutional performance.'},
    {id:'POM-OPS-02',label:'Public-signal traceability completeness',value:watchTrace.percent,unit:'percent',numerator:watchTrace.complete,denominator:watchTrace.total,formula:'records with title + public URL + source + publication date / watch records × 100',limit:'Completeness measures metadata presence, not factual truth.'},
    {id:'POM-OPS-03',label:'Scholarly discovery traceability pass rate',value:pct(scholarlyTraceable,scholarlyRecords.length),unit:'percent',numerator:scholarlyTraceable,denominator:scholarlyRecords.length,formula:'records with traceability_score ≥ 50 / scholarly discovery records × 100',limit:'Discovery metadata remains subject to human scholarly verification.'},
    {id:'POM-OPS-04',label:'Mean scholarly traceability score',value:scholarlyTraceAvg,unit:'score/100',numerator:null,denominator:scholarlyRecords.length,formula:'mean of supplied traceability_score values',limit:'This is a metadata traceability measure, not a scientific-quality score.'},
    {id:'POM-OPS-05',label:'Journal Watch source-link completeness',value:editorialTrace.percent,unit:'percent',numerator:editorialTrace.complete,denominator:editorialTrace.total,formula:'topics with title + source + source URL + verification notice / topics × 100',limit:'Editorial linkage does not imply acceptance, peer review or publication.'}
  ],
  distributions:{watch_domains:countBy(watch,'domain'),journal_disciplines:countBy(topics,'discipline'),scholarly_sources:countBy(scholarlyRecords,'source_database')},
  human_gate:'Metrics can trigger review, correction and research prioritisation. They cannot autonomously create canonical rankings, scientific conclusions, peer-review decisions or official institutional judgments.'
};

const OUT=path.join(ROOT,'products');
await fs.mkdir(OUT,{recursive:true});
for(const [name,obj] of Object.entries({dailyBrief,academicRadar:radar,editorialDossiers:dossiers,sourceAudit,diplomacyRadar:diplomacyProduct,protocolometryDigest})){
  await fs.writeFile(path.join(OUT,`${name}.json`),JSON.stringify(obj,null,2),'utf8');
}

function productCard(title,subtitle,file,items){return `<article class="card"><h2>${esc(title)}</h2><p>${esc(subtitle)}</p><div class="meta">${items} items · generated ${esc(generated)}</div><a class="btn" href="${file}.html">Open product</a> <a class="btn secondary" href="${file}.json">JSON</a></article>`;}
const css=`:root{--navy:#081423;--navy2:#102945;--gold:#d4af37;--cream:#fbf8ee;--line:#36536f;--muted:#cbd5e1}*{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;background:var(--navy);color:#fff;line-height:1.6}header{padding:48px 22px;border-bottom:2px solid var(--gold);background:linear-gradient(135deg,#071326,#102945)}main{max-width:1180px;margin:auto;padding:34px 20px 70px}h1,h2,h3{color:#f3d77a}.tag{display:inline-block;border:1px solid var(--gold);padding:5px 10px;border-radius:999px;color:#f3d77a;font-weight:800;font-size:12px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:16px}.card,.item,.note{background:var(--navy2);border:1px solid var(--line);border-radius:14px;padding:20px;margin:14px 0}.item h2,.item h3{margin-top:0}.meta{font-size:13px;color:var(--muted);margin:8px 0 12px}.btn{display:inline-block;padding:9px 13px;background:var(--gold);color:#081423;text-decoration:none;border-radius:8px;font-weight:800;margin:4px}.btn.secondary{background:transparent;color:#f3d77a;border:1px solid var(--gold)}a{color:#f3d77a}.guard{border-left:4px solid var(--gold);background:rgba(212,175,55,.08)}ol,ul{padding-left:22px}footer{padding:24px;text-align:center;color:var(--muted);border-top:1px solid var(--line)}`;
const head=(title)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | World Protocol Academy</title><style>${css}</style></head><body><header><span class="tag">WPA AUTOMATED RESEARCH PRODUCTS · 24/7 PIPELINE</span><h1>${esc(title)}</h1><p>Generated ${esc(generated)} · Public-source and scholarly-metadata automation with explicit human-governance boundaries.</p><a class="btn secondary" href="/products/">Product Factory</a> <a class="btn secondary" href="/protocolometry-center.html">Protocolometry Center</a> <a class="btn secondary" href="/operations/">Institute Operations</a> <a class="btn secondary" href="/institute.html">WPA Institute</a></header><main>`;
const foot=`</main><footer>© 2026 World Protocol Academy · Automated products are traceable work products, not substitutes for human authority, peer review or official institutional judgment.</footer></body></html>`;

let index=head('WPA 24/7 Product Factory')+`<section class="note guard"><strong>Production mode:</strong> the factory continuously converts monitored public sources and open scholarly metadata into finished, versioned WPA work products. Protocolometry is the measurement layer for evidence and pipeline properties. Scientific publication, canonical rankings, official institutional claims and final judgments remain human-gated.</section><section class="grid">`;
index+=productCard(dailyBrief.product,'Ranked public-source daily intelligence brief.','dailyBrief',dailyBrief.items.length);
index+=productCard(diplomacyProduct.product,'Focused protocol/diplomacy/institutional signals product.','diplomacyRadar',diplomacyProduct.items.length);
index+=productCard(radar.product,'Traceability-ranked scholarly discovery product.','academicRadar',radar.items.length);
index+=productCard(dossiers.product,'Structured research/editorial dossiers ready for human development.','editorialDossiers',dossiers.dossiers.length);
index+=productCard(protocolometryDigest.product,'Transparent Protocolometry measurements of evidence and pipeline quality, without autonomous institutional ranking.','protocolometryDigest',protocolometryDigest.measurement_profile.length);
index+=productCard(sourceAudit.product,'Pipeline health, source errors, holds and guardrail audit.','sourceAudit',sourceAudit.review_holds.length);
index+=`</section>`+foot;
await fs.writeFile(path.join(OUT,'index.html'),index,'utf8');

function writeHtml(file,title,status,methodology,body){return fs.writeFile(path.join(OUT,`${file}.html`),head(title)+`<section class="note guard"><strong>Status:</strong> ${esc(status)}<br><strong>Method:</strong> ${esc(methodology)}</section>`+body+foot,'utf8');}

await writeHtml('dailyBrief',dailyBrief.product,dailyBrief.status,dailyBrief.methodology,dailyBrief.items.map(x=>`<article class="item"><h2>${x.rank}. ${esc(x.title)}</h2><div class="meta">${esc(x.domain)} · ${esc(x.source)} · ${esc(x.date)}</div><p>${esc(x.summary)}</p><p><strong>WPA relevance:</strong> ${esc(x.wpa_relevance)}</p>${x.source_url?`<a class="btn" href="${esc(x.source_url)}" target="_blank" rel="noopener">Primary/public source</a>`:''}</article>`).join(''));
await writeHtml('diplomacyRadar',diplomacyProduct.product,diplomacyProduct.status,'Focused ranking of monitored protocol, diplomacy, security and public-communication signals.',diplomacyProduct.items.map(x=>`<article class="item"><h2>${x.rank}. ${esc(x.title)}</h2><div class="meta">${esc(x.domain)} · ${esc(x.source)} · ${esc(x.date)}</div><p>${esc(x.source_summary)}</p><p><strong>Signal:</strong> ${esc(x.signal)}</p>${x.url?`<a class="btn" href="${esc(x.url)}" target="_blank" rel="noopener">Open source</a>`:''}</article>`).join(''));
await writeHtml('academicRadar',radar.product,radar.status,radar.methodology,radar.items.map(x=>`<article class="item"><h2>${x.rank}. ${esc(x.title)}</h2><div class="meta">${esc((x.authors||[]).join(', '))} · ${esc(x.year)} · ${esc(x.source_database)} · traceability ${esc(x.traceability_score)}/100</div>${x.abstract?`<p>${esc(x.abstract)}</p>`:''}${x.url?`<a class="btn" href="${esc(x.url)}" target="_blank" rel="noopener">Open record/source</a>`:''}</article>`).join(''));
await writeHtml('editorialDossiers',dossiers.product,dossiers.status,dossiers.methodology,dossiers.dossiers.map(d=>`<article class="item"><h2>${esc(d.dossier_id)} · ${esc(d.title)}</h2><div class="meta">${esc(d.discipline)} · ${esc(d.source)} · ${esc(d.date)} · proposed format: ${esc(d.proposed_format)}</div><p><strong>Source summary:</strong> ${esc(d.source_summary)}</p><p><strong>Research angle:</strong> ${esc(d.research_angle)}</p><h3>Research questions</h3><ol>${d.research_questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol><h3>Production outline</h3><ol>${d.production_outline.map(q=>`<li>${esc(q)}</li>`).join('')}</ol>${d.source_url?`<a class="btn" href="${esc(d.source_url)}" target="_blank" rel="noopener">Open source</a>`:''}</article>`).join(''));
await writeHtml('protocolometryDigest',protocolometryDigest.product,protocolometryDigest.status,protocolometryDigest.methodology,`<section class="grid">${protocolometryDigest.measurement_profile.map(m=>`<article class="card"><h2>${esc(m.value)} ${esc(m.unit)}</h2><h3>${esc(m.id)} · ${esc(m.label)}</h3><p><strong>Formula:</strong> ${esc(m.formula)}</p><p>${esc(m.limit)}</p></article>`).join('')}</section><section class="item"><h2>Protocolometry doctrine</h2><p>${esc(protocolometryDigest.doctrine.role)}</p><ul>${protocolometryDigest.doctrine.principles.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><strong>Human Gate:</strong> ${esc(protocolometryDigest.human_gate)}</p><a class="btn" href="/protocolometry-center.html">Open WPA Protocolometry Center</a></section>`);
await writeHtml('sourceAudit',sourceAudit.product,sourceAudit.status,'Automated pipeline and governance audit.',`<section class="grid"><div class="card"><h2>${sourceAudit.watch_candidates}</h2><p>WPA Watch candidates</p></div><div class="card"><h2>${sourceAudit.journal_topics}</h2><p>Journal Watch topics</p></div><div class="card"><h2>${sourceAudit.academic_records}</h2><p>Academic records</p></div><div class="card"><h2>${sourceAudit.review_holds.length}</h2><p>Human-review holds</p></div></section><section class="item"><h2>Guardrails</h2><ul>${sourceAudit.guardrails.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section class="item"><h2>Academic API errors</h2>${sourceAudit.academic_errors.length?`<ul>${sourceAudit.academic_errors.map(x=>`<li>${esc(x.source)} · ${esc(x.query)} · ${esc(x.error)}</li>`).join('')}</ul>`:'<p>No academic API errors recorded in this run.</p>'}</section>`);

const manifest={generated,products:[
  {id:'daily-brief',title:dailyBrief.product,html:'/products/dailyBrief.html',json:'/products/dailyBrief.json',items:dailyBrief.items.length},
  {id:'signals-radar',title:diplomacyProduct.product,html:'/products/diplomacyRadar.html',json:'/products/diplomacyRadar.json',items:diplomacyProduct.items.length},
  {id:'academic-radar',title:radar.product,html:'/products/academicRadar.html',json:'/products/academicRadar.json',items:radar.items.length},
  {id:'editorial-dossiers',title:dossiers.product,html:'/products/editorialDossiers.html',json:'/products/editorialDossiers.json',items:dossiers.dossiers.length},
  {id:'protocolometry-digest',title:protocolometryDigest.product,html:'/products/protocolometryDigest.html',json:'/products/protocolometryDigest.json',items:protocolometryDigest.measurement_profile.length},
  {id:'source-audit',title:sourceAudit.product,html:'/products/sourceAudit.html',json:'/products/sourceAudit.json',items:sourceAudit.review_holds.length}
]};
await fs.writeFile(path.join(OUT,'manifest.json'),JSON.stringify(manifest,null,2),'utf8');
console.log(`WPA Product Factory built ${manifest.products.length} finished product families at ${generated}`);
