import fs from "fs/promises";
import Parser from "rss-parser";
const parser = new Parser({timeout:15000});
const feeds = JSON.parse(await fs.readFile("feeds.json","utf8")).feeds;
const config = JSON.parse(await fs.readFile("rss-config.json","utf8"));
const items=[]; const live=[]; const dead=[];
function clean(s=""){return String(s).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
for(const f of feeds){
 try{
  const feed=await parser.parseURL(f.url);
  live.push(f.name);
  for(const it of (feed.items||[]).slice(0,config.max_items_per_feed||8)){
   items.push({id:it.guid||it.link||it.title,title:clean(it.title||"Untitled"),link:it.link||"#",source:f.name,domain:f.domain||"general",summary:clean(it.contentSnippet||it.content||"").slice(0,500),isoDate:it.isoDate||it.pubDate||null});
  }
 }catch(e){dead.push({name:f.name,error:String(e.message||e)});}
}
const seen=new Set(); const out=[];
for(const item of items){const key=item.link||item.title;if(!seen.has(key)){seen.add(key);out.push(item);}}
out.sort((a,b)=>new Date(b.isoDate||0)-new Date(a.isoDate||0));
const finalItems=out.slice(0,config.max_total_items||80);
await fs.writeFile("items.json",JSON.stringify(finalItems,null,2));
await fs.writeFile("status.json",JSON.stringify({generated:new Date().toISOString(),sources_total:feeds.length,sources_live:live.length,sources_dead:dead.length,items_total:finalItems.length,dead},null,2));
console.log("Generated", finalItems.length, "items");
