#!/usr/bin/env node
import fs from 'node:fs/promises';

const REGISTRY_PATH = process.argv[2] || 'data/wpa-rss-source-registry-v1.json';
const TIMEOUT_MS = Number(process.env.RSS_AUDIT_TIMEOUT_MS || 8000);
const CONCURRENCY = Math.max(1, Math.min(50, Number(process.env.RSS_AUDIT_CONCURRENCY || 30)));
const MAX_BYTES = Number(process.env.RSS_AUDIT_MAX_BYTES || 1500000);
const USER_AGENT = 'WorldProtocolAcademy-RSSAudit/1.0 (+https://worldprotocolacademy.mk/tools/wpa-watch/)';

const blockedHosts = [
  'linkedin.com','facebook.com','fb.com','instagram.com','tiktok.com',
  'twitter.com','x.com','threads.net'
];

function hostOf(value){
  try { return new URL(value).hostname.toLowerCase(); } catch { return ''; }
}
function blocked(url){
  const host=hostOf(url);
  return !host || blockedHosts.some(x=>host===x || host.endsWith('.'+x));
}
function looksLikeFeed(text){
  return /<rss[\s>]/i.test(text) || /<feed[\s>]/i.test(text) || /<rdf:RDF[\s>]/i.test(text);
}
function xmlItemCount(text){
  const rss=(text.match(/<item[\s>]/gi)||[]).length;
  const atom=(text.match(/<entry[\s>]/gi)||[]).length;
  return Math.max(rss,atom);
}
async function probe(record){
  if(record.candidate_kind!=='feed_candidate') return {...record,audit_status:'not_feed_candidate'};
  if(record.duplicate_of) return {...record,audit_status:'duplicate_skipped'};
  if(record.transport!=='https') return {...record,audit_status:'non_https_candidate'};
  if(blocked(record.url)) return {...record,audit_status:'blocked_host'};
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  try{
    const res=await fetch(record.url,{
      redirect:'follow',
      signal:controller.signal,
      headers:{
        'User-Agent':USER_AGENT,
        'Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.2',
        'Cache-Control':'no-cache'
      }
    });
    const finalUrl=res.url || record.url;
    const contentType=(res.headers.get('content-type')||'').toLowerCase();
    if(!res.ok) return {...record,audit_status:'http_error',http_status:res.status,final_url:finalUrl,content_type:contentType};
    const buf=await res.arrayBuffer();
    const bytes=Math.min(buf.byteLength,MAX_BYTES);
    const text=new TextDecoder('utf-8',{fatal:false}).decode(buf.slice(0,bytes));
    if(!looksLikeFeed(text)){
      return {...record,audit_status:'not_feed_response',http_status:res.status,final_url:finalUrl,content_type:contentType,response_bytes:buf.byteLength};
    }
    return {...record,audit_status:'live_feed',http_status:res.status,final_url:finalUrl,content_type:contentType,response_bytes:buf.byteLength,item_count:xmlItemCount(text)};
  }catch(error){
    const message=error?.name==='AbortError'?'timeout':String(error?.message||error).slice(0,240);
    return {...record,audit_status:'fetch_error',error:message};
  }finally{
    clearTimeout(timer);
  }
}
async function mapConcurrent(items,limit,fn){
  const out=new Array(items.length);
  let next=0;
  async function worker(){
    while(true){
      const i=next++;
      if(i>=items.length) return;
      out[i]=await fn(items[i]);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>worker()));
  return out;
}

const registry=JSON.parse(await fs.readFile(REGISTRY_PATH,'utf8'));
const records=Array.isArray(registry.records)?registry.records:[];
const results=await mapConcurrent(records,CONCURRENCY,probe);
const counts={};
for(const row of results) counts[row.audit_status]=(counts[row.audit_status]||0)+1;
const live=results.filter(x=>x.audit_status==='live_feed');
const officialPattern=/(\.gov\.|\.gov$|\.int$|\.un\.org$|un\.org$|nato\.int$|europa\.eu$|europa\.europa\.eu$|eeas\.europa\.eu$|consilium\.europa\.eu$|europarl\.europa\.eu$|worldbank\.org$|imf\.org$|oecd\.org$|who\.int$|unhcr\.org$|unicef\.org$|unesco\.org$|icc-cpi\.int$|icj-cij\.org$|wto\.org$|adb\.org$|afdb\.org$|ebrd\.com$|eib\.org$)/i;
const promoted=live.filter(x=>x.priority_weight>=5 && officialPattern.test(hostOf(x.final_url||x.url)));
const report={
  schema:'wpa-rss-audit/1.0',
  generated_at:new Date().toISOString(),
  registry_path:REGISTRY_PATH,
  totals:{records:records.length,...counts,live_feed:live.length,priority_official_live:promoted.length},
  live_feeds:live.map(({id,name,url,type,region,priority_weight,final_url,http_status,content_type,item_count,response_bytes})=>({id,name,url,type,region,priority_weight,final_url,http_status,content_type,item_count,response_bytes})),
  priority_official_live:promoted.map(({id,name,url,type,region,priority_weight,final_url,http_status,content_type,item_count})=>({id,name,url,type,region,priority_weight,final_url,http_status,content_type,item_count}))
};
await fs.writeFile('/tmp/wpa-rss-audit.json',JSON.stringify(report,null,2));
console.log('WPA RSS AUDIT SUMMARY '+JSON.stringify(report.totals));
for(const row of report.priority_official_live){
  console.log('PROMOTE_CANDIDATE|'+[row.id,row.name,row.url,row.final_url||'',row.type,row.region,row.priority_weight,row.item_count??''].join('|'));
}
console.log('AUDIT_REPORT=/tmp/wpa-rss-audit.json');
