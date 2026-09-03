import fs from "fs/promises";
import Parser from "rss-parser";

const parser = new Parser({timeout:12000});
const feeds = JSON.parse(await fs.readFile("feeds.json","utf8")).feeds;
const config = JSON.parse(await fs.readFile("rss-config.json","utf8"));
const clean = (s="") => String(s).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const HARD_FEED_TIMEOUT_MS = Math.max(5000, Number(process.env.WPA_WATCH_FEED_TIMEOUT_MS || 20000));

async function readPreviousItems(){
  try {
    const data = JSON.parse(await fs.readFile("items.json","utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function deadline(ms, label){
  return new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} exceeded hard ${ms}ms deadline`)), ms);
    timer.unref?.();
  });
}

async function harvestFeed(f){
  const started = Date.now();
  try{
    const feed = await Promise.race([
      parser.parseURL(f.url),
      deadline(HARD_FEED_TIMEOUT_MS, f.name || f.url)
    ]);
    const items = (feed.items||[]).slice(0,config.max_items_per_feed||8).map(it=>({
      id:it.guid||it.link||it.title,
      title:clean(it.title||"Untitled"),
      link:it.link||"#",
      source:f.name,
      domain:f.domain||"general",
      summary:clean(it.contentSnippet||it.content||"").slice(0,500),
      isoDate:it.isoDate||it.pubDate||null
    }));
    return {ok:true,name:f.name,url:f.url,duration_ms:Date.now()-started,items};
  }catch(e){
    return {ok:false,name:f.name,url:f.url,duration_ms:Date.now()-started,error:String(e.message||e).slice(0,300),items:[]};
  }
}

const previousItems = await readPreviousItems();

// 24/7 mode: harvest every feed concurrently. Each source has a hard deadline,
// so a dead endpoint cannot hold the Institute cycle open indefinitely.
const results = await Promise.all(feeds.map(harvestFeed));
const live = results.filter(x=>x.ok).map(x=>x.name);
const dead = results.filter(x=>!x.ok).map(x=>({name:x.name,url:x.url,error:x.error,duration_ms:x.duration_ms}));
const items = results.flatMap(x=>x.items);

const seen=new Set(); const out=[];
for(const item of items){
  const key=item.link||item.title;
  if(!seen.has(key)){seen.add(key);out.push(item);}
}
out.sort((a,b)=>new Date(b.isoDate||0)-new Date(a.isoDate||0));
let finalItems=out.slice(0,config.max_total_items||80);
let fallbackPrevious=false;

// Continuity rule: a transient total-source outage must not erase the research queue.
// Previous items are preserved explicitly as stale fallback and the status file labels the cycle degraded.
if(!finalItems.length && previousItems.length){
  finalItems=previousItems.slice(0,config.max_total_items||80);
  fallbackPrevious=true;
}

const generated=new Date().toISOString();
await fs.writeFile("items.json",JSON.stringify(finalItems,null,2));
await fs.writeFile("status.json",JSON.stringify({
  generated,
  mode:"24x7-production-feed",
  operational_state: fallbackPrevious ? "DEGRADED_STALE_FALLBACK" : (live.length ? "OPERATIONAL" : "NO_SOURCE_DATA"),
  hard_feed_timeout_ms:HARD_FEED_TIMEOUT_MS,
  fallback_previous_items:fallbackPrevious,
  sources_total:feeds.length,
  sources_live:live.length,
  sources_dead:dead.length,
  items_total:finalItems.length,
  live,
  dead,
  source_results:results.map(({items:sourceItems,...r})=>({...r,items_count:sourceItems.length}))
},null,2));
console.log("Generated", finalItems.length, "items from", live.length, "live sources;", dead.length, "source(s) unavailable; state:", fallbackPrevious ? "DEGRADED_STALE_FALLBACK" : (live.length ? "OPERATIONAL" : "NO_SOURCE_DATA"));
