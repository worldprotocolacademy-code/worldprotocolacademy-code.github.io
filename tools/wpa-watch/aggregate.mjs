import fs from 'fs/promises';
import Parser from 'rss-parser';

const parser = new Parser();
const registry = JSON.parse(await fs.readFile('feeds.json','utf8'));
const feeds = Array.isArray(registry.feeds) ? registry.feeds : [];
const config = JSON.parse(await fs.readFile('rss-config.json','utf8'));
const clean = (s='') => String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const HARD_FEED_TIMEOUT_MS = Math.max(5000, Number(process.env.WPA_WATCH_FEED_TIMEOUT_MS || 12000));
const USER_AGENT = 'WorldProtocolAcademy-PublicSourceMonitor/1.3 (+https://worldprotocolacademy.mk/journal/live/)';

async function readPreviousItems(){
  try {
    const data = JSON.parse(await fs.readFile('items.json','utf8'));
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function sourceConfidence(source){
  if(source.source_tier==='PRIMARY_OFFICIAL') return 95;
  if(source.source_tier==='PRIMARY_INFRASTRUCTURE') return 92;
  if(source.source_tier==='SPECIALIST_PUBLIC') return 82;
  return 75;
}

async function fetchText(url){
  const response = await fetch(url, {
    redirect:'follow',
    headers:{
      'user-agent':USER_AGENT,
      accept:'application/rss+xml,application/atom+xml,application/xml,text/xml,text/plain;q=0.8,*/*;q=0.5'
    },
    signal:AbortSignal.timeout(HARD_FEED_TIMEOUT_MS)
  });
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function fetchJson(url){
  const response = await fetch(url, {
    redirect:'follow',
    headers:{'user-agent':USER_AGENT,accept:'application/json'},
    signal:AbortSignal.timeout(HARD_FEED_TIMEOUT_MS)
  });
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function normalizeRssItem(it, source, fetchedAt){
  const link=it.link||it.guid||'';
  return {
    id:it.guid||link||it.title,
    title:clean(it.title||'Untitled'),
    link,
    source:source.name,
    domain:source.domain||'general',
    source_type:'public_feed',
    transport:source.transport||'rss',
    source_tier:source.source_tier||'PUBLIC',
    verification_status:source.verification_status||'public_source_traceable',
    source_confidence:sourceConfidence(source),
    summary:clean(it.contentSnippet||it.content||it.summary||'').slice(0,800),
    isoDate:it.isoDate||it.pubDate||it.published||null,
    fetched_at:fetchedAt
  };
}

async function harvestRss(source){
  const xml=await fetchText(source.url);
  if(!/<(?:rss|feed|rdf:RDF)[\s>]/i.test(xml)) throw new Error('Response is not RSS/Atom XML');
  const parsed=await parser.parseString(xml);
  const fetchedAt=new Date().toISOString();
  const items=(parsed.items||[]).slice(0,config.max_items_per_feed||8).map(it=>normalizeRssItem(it,source,fetchedAt));
  return items;
}

async function harvestReliefWeb(source){
  const data=await fetchJson(source.url);
  const fetchedAt=new Date().toISOString();
  return (data.data||[]).slice(0,config.max_items_per_feed||8).map(entry=>{
    const f=entry.fields||{};
    const link=f.url_alias||f.url||`https://reliefweb.int/node/${entry.id}`;
    return {
      id:`reliefweb:${entry.id}`,
      title:clean(f.title||'Untitled'),
      link,
      source:source.name,
      domain:source.domain||'security',
      source_type:'official_public_api',
      transport:'reliefweb_api',
      source_tier:source.source_tier||'PRIMARY_OFFICIAL',
      verification_status:source.verification_status||'documented_public_api',
      source_confidence:sourceConfidence(source),
      summary:clean(f.body||f.summary||f.headline||'').slice(0,800),
      isoDate:f.date?.created||f.date?.original||f.date?.changed||null,
      fetched_at:fetchedAt
    };
  });
}

async function harvestFeed(source){
  const started=Date.now();
  try{
    const items=source.transport==='reliefweb_api' ? await harvestReliefWeb(source) : await harvestRss(source);
    return {ok:true,name:source.name,url:source.url,transport:source.transport||'rss',optional:Boolean(source.optional),duration_ms:Date.now()-started,items};
  }catch(e){
    return {ok:false,name:source.name,url:source.url,transport:source.transport||'rss',optional:Boolean(source.optional),duration_ms:Date.now()-started,error:String(e.message||e).slice(0,300),items:[]};
  }
}

const previousItems=await readPreviousItems();
const results=await Promise.all(feeds.map(harvestFeed));
const liveResults=results.filter(x=>x.ok);
const deadResults=results.filter(x=>!x.ok);
const allItems=liveResults.flatMap(x=>x.items);

const seen=new Set();
const out=[];
for(const item of allItems){
  const key=String(item.link||item.id||item.title||'').trim().toLowerCase();
  if(!key||seen.has(key)) continue;
  seen.add(key);
  out.push(item);
}
out.sort((a,b)=>new Date(b.isoDate||0)-new Date(a.isoDate||0));
let finalItems=out.slice(0,config.max_total_items||80);
let fallbackPrevious=false;

// Continuity uses only the previously harvested REAL source snapshot. No synthetic news is ever inserted.
if(!finalItems.length && previousItems.length){
  finalItems=previousItems
    .filter(item=>/^https?:\/\//i.test(String(item.link||'')))
    .filter(item=>!/example\.invalid|WPA Demo/i.test(`${item.link||''} ${item.source||''} ${item.title||''}`))
    .slice(0,config.max_total_items||80);
  fallbackPrevious=finalItems.length>0;
}

const generated=new Date().toISOString();
const required=results.filter(x=>!x.optional);
const requiredLive=required.filter(x=>x.ok).length;
const state=fallbackPrevious
  ? 'DEGRADED_LAST_REAL_SNAPSHOT'
  : (liveResults.length>=2 ? 'OPERATIONAL_REAL_SOURCES' : (liveResults.length ? 'DEGRADED_SINGLE_REAL_SOURCE' : 'NO_SOURCE_DATA'));

await fs.writeFile('items.json',JSON.stringify(finalItems,null,2));
await fs.writeFile('status.json',JSON.stringify({
  generated,
  mode:'24x7-production-feed',
  operational_state:state,
  synthetic_fallback:'DISABLED',
  continuity_fallback:'LAST_REAL_SNAPSHOT_ONLY',
  hard_feed_timeout_ms:HARD_FEED_TIMEOUT_MS,
  fallback_previous_items:fallbackPrevious,
  registry_version:registry.version||null,
  sources_enabled:feeds.length,
  sources_total:feeds.length,
  sources_required:required.length,
  required_sources_live:requiredLive,
  sources_live:liveResults.length,
  sources_dead:deadResults.length,
  items_total:finalItems.length,
  live:liveResults.map(x=>x.name),
  dead:deadResults.map(({name,url,transport,optional,error,duration_ms})=>({name,url,transport,optional,error,duration_ms})),
  source_results:results.map(({items,...r})=>({...r,items_count:items.length})),
  integrity:{
    real_public_sources_only:true,
    original_urls_required:true,
    no_social_scraping:true,
    no_private_platform_access:true,
    no_synthetic_production_fallback:true,
    human_review_before_consequential_use:'REQUIRED'
  }
},null,2));
console.log(`Generated ${finalItems.length} real-source items from ${liveResults.length}/${feeds.length} live sources; state=${state}.`);
