import fs from 'fs/promises';

const itemsFile = 'items.json';
const statusFile = 'status.json';
const items = JSON.parse(await fs.readFile(itemsFile,'utf8'));
let status = {};
try { status = JSON.parse(await fs.readFile(statusFile,'utf8')); } catch {}

const clean = v => String(v ?? '').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();

function classify(item){
  const text = clean([item.title,item.summary,item.source].join(' ')).toLowerCase();
  const title = clean(item.title).toLowerCase();
  const reasons=[];
  let domain='general'; let score=0;

  const rules=[
    ['protocol',55,/\b(diplomatic protocol|state protocol|official protocol|ceremonial protocol|order of precedence|official visit|state visit|flag protocol|anthem protocol|seating protocol|forms? of address|ceremonial order)\b/i],
    ['diplomacy',45,/\b(diplomacy|diplomatic|foreign minister|foreign ministry|bilateral|multilateral|peace talks|ceasefire|sanctions|security council|united nations|nato|osce|state relations|international relations)\b/i],
    ['security',44,/\b(security|armed conflict|war\b|terror|attack|crisis|cyber|trafficking|public safety|human security|strategic stability|outbreak|epidemic|earthquake|flood|disaster|chemical weapons|nuclear)\b/i],
    ['pr',40,/\b(public communication|public information|strategic communication|crisis communication|media framing|institutional communication|reputation|messaging|public warning|campaign)\b/i],
    ['academic',42,/\b(crossref|openalex|doaj|datacite|doi\b|metadata|scholarly|open access|research integrity|publication ethics|research infrastructure|persistent identifier|journal metadata)\b/i],
    ['communicology',38,/\b(communicology|intercultural communication|organizational communication|human communication|nonverbal communication|persuasion)\b/i]
  ];

  for(const [d,pts,rx] of rules){ if(rx.test(text) && pts>score){domain=d;score=pts;reasons.push(d);} }
  if(/\b(protocol|diplomatic|diplomacy|security|institutional communication|public diplomacy|ai governance)\b/i.test(title)) score+=15;

  if(/\b(vacancy|job opening|hiring|meet the team|team member|sports result|marathon|lottery|test page|protected:)\b/i.test(text)) { score-=60; reasons.push('noise'); }
  if(/\bcelebrity|obituary|died at the age|entertainment|recipe|fashion|sports league\b/i.test(text) && !/diplomat|minister|head of state|president|government/i.test(text)){ score-=40; reasons.push('general-news'); }

  return {...item,domain, wpa_relevance_score:Math.max(0,Math.min(100,score)), wpa_relevance_reasons:[...new Set(reasons)]};
}

const classified=(Array.isArray(items)?items:[]).map(classify);
const passed=classified.filter(x=>x.wpa_relevance_score>=35 && x.domain!=='general');
passed.sort((a,b)=>Number(b.wpa_relevance_score)-Number(a.wpa_relevance_score) || new Date(b.isoDate||0)-new Date(a.isoDate||0));

// If a source cycle is unusually sparse, retain the prior operational continuity
// but never re-label unrelated general news as a WPA signal.
await fs.writeFile(itemsFile,JSON.stringify(passed,null,2),'utf8');
status.relevance_gate={
  applied:true,
  minimum_score:35,
  input_items:classified.length,
  passed_items:passed.length,
  excluded_items:classified.length-passed.length,
  rule:'Only signals with an observable connection to WPA protocol, diplomacy, public communication, security, communicology or scholarly-infrastructure fields pass into downstream products.'
};
status.items_total=passed.length;
await fs.writeFile(statusFile,JSON.stringify(status,null,2),'utf8');
console.log(`WPA Watch relevance gate: ${passed.length}/${classified.length} signals passed.`);
