/**
 * Virtual Sande PDF Book Lab — deterministic, evidence-first local retrieval (v0.1).
 * Every extracted page is indexed in the browser; only selected, bounded extracts
 * may leave the browser following explicit consent. No remote model calls here.
 * PDF page indices are physical PDF page numbers, NOT printed book pagination.
 */
export const BOOK_LIMITS=Object.freeze({
  maxPdfBytes:40*1024*1024,maxPages:800,maxCharsPerPage:24000,
  chunkChars:1350,overlapChars:190,maxEvidence:9,maxExcerptChars:1100,
  maxPayloadChars:10400
});
export const DOMAIN_OPTIONS=Object.freeze([
  'auto','protocol','diplomacy','public_relations','security','communicology','ai'
]);
export const MODES=Object.freeze(['focused','cross_domain','overview']);
const STOP=new Set(('и во на со за од до однос при како што дека ова она кои кој кога е се си да не '+
  'овој оваа ме ми го ги таа тие тоа тие неговите книги книга целосна анализа анализирај '+
  'те молам направи направете објасни истражи што е кое на страница страниците PDF '+
  'the and for with from this that those about which please can you my book document '+
  'analysis analyse explain all into are has have how why where what who provide').split(/\s+/));
const EXPANSIONS={
  protocol:['протокол','претходство','церемонија','protocol','precedence','ceremony'],
  diplomacy:['дипломатија','дипломат','амбасадор','diplomacy','ambassador'],
  public_relations:['односи','јавност','кризна','репутација','pr','public','relations','reputation'],
  security:['безбедност','ризик','заштита','security','risk','safety'],
  communicology:['комуникација','комуникологија','медиуми','порака','communication','media'],
  ai:['вештачка','интелигенција','алгоритам','ai','artificial','intelligence','machine']
};
const SPACE=/\s+/g;
export const normalize=s=>String(s||'').normalize('NFKC').toLocaleLowerCase('mk')
  .replace(/[\u0000-\u001f\u007f]+/g,' ').replace(SPACE,' ').trim();
export function tokens(text){
  return (normalize(text).match(/[\p{L}\p{N}]{3,}/gu)||[])
    .filter(t=>!STOP.has(t)).slice(0,10000);
}
function uniqueWords(text){return [...new Set(tokens(text))];}
function plain(text){return String(text||'').normalize('NFC')
  .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,' ')
  .replace(/\s+/g,' ').trim();}
export function makeBookIndex(sourcePages,{name='Uploaded PDF'}={}){
  if(!Array.isArray(sourcePages)||!sourcePages.length||sourcePages.length>BOOK_LIMITS.maxPages){
    throw new Error('PDF_PAGE_LIMIT');
  }
  const chunks=[],unreadable=[],truncated=[];
  for(let i=0;i<sourcePages.length;i++){
    const entry=sourcePages[i],page=i+1;
    const raw=plain(typeof entry==='string'?entry:entry?.text||'');
    if(!raw || raw.length<35){unreadable.push(page);continue;}
    if(raw.length>BOOK_LIMITS.maxCharsPerPage)truncated.push(page);
    const text=raw.slice(0,BOOK_LIMITS.maxCharsPerPage);
    let start=0,n=0;
    while(start<text.length){
      const end=Math.min(text.length,start+BOOK_LIMITS.chunkChars);
      const excerpt=text.slice(start,end);
      chunks.push({id:'P'+page+'-C'+(++n),page,text:excerpt,len:tokens(excerpt).length});
      if(end===text.length)break;
      start=end-BOOK_LIMITS.overlapChars;
    }
  }
  if(!chunks.length)throw new Error('PDF_NO_EXTRACTABLE_TEXT');
  const docFreq=new Map();
  let totalWords=0;
  for(const chunk of chunks){
    chunk.terms=new Set(tokens(chunk.text)); totalWords+=chunk.len;
    for(const term of chunk.terms)docFreq.set(term,(docFreq.get(term)||0)+1);
  }
  return {
    name:plain(name).slice(0,140),totalPages:sourcePages.length,readablePages:sourcePages.length-unreadable.length,
    unreadablePages:unreadable, truncatedPages:truncated,chunks,docFreq,avgWords:totalWords/chunks.length,
    algorithm:'WPA Evidence Retrieval & Synthesis v0.1 (local BM25 + page diversity)'
  };
}
function queryTerms(question,domain){
  const phrase=uniqueWords(question);
  if(domain!=='auto'&&DOMAIN_OPTIONS.includes(domain)){
    const bonus=EXPANSIONS[domain]||[];
    return [...new Set([...phrase,...bonus])].slice(0,35);
  }
  return phrase.slice(0,30);
}
export function scoreChunks(index,question,domain='auto'){
  const terms=queryTerms(question,domain);
  if(!terms.length)return [];
  const total=index.chunks.length;
  const scores=[];
  for(const chunk of index.chunks){
    let score=0,matchCount=0;
    const wordFreq=new Map();
    for(const term of tokens(chunk.text))wordFreq.set(term,(wordFreq.get(term)||0)+1);
    for(const term of terms){
      const tf=wordFreq.get(term)||0;
      if(!tf)continue;
      matchCount++;
      const df=index.docFreq.get(term)||0;
      const idf=Math.log(1+(total-df+0.5)/(df+0.5));
      const weight=1.25*tf/(tf+1.25*(1-0.72+0.72*chunk.len/Math.max(1,index.avgWords)));
      score+=Math.max(0.02,idf)*weight;
    }
    if(matchCount>0)scores.push({chunk,score:score+(matchCount/terms.length)*0.75,matchCount});
  }
  return scores.sort((a,b)=>b.score-a.score||a.chunk.page-b.chunk.page);
}
function selectDiverse(ranked,cap){
  const selected=[],counts=new Map();
  for(const item of ranked){
    if(selected.length>=cap)break;
    if((counts.get(item.chunk.page)||0)>=2)continue;
    selected.push(item);
    counts.set(item.chunk.page,(counts.get(item.chunk.page)||0)+1);
  }
  return selected;
}
function stratifiedChunks(index,cap){
  if(index.chunks.length<=cap)return index.chunks.map(chunk=>({chunk,score:0,matchCount:0}));
  const sorted=index.chunks;
  const positions=new Set([0,sorted.length-1]);
  for(let i=1;i<cap-1;i++)positions.add(Math.floor(i*(sorted.length-1)/(cap-1)));
  return [...positions].slice(0,cap).map(pos=>({chunk:sorted[pos],score:0,matchCount:0}));
}
export function selectBookEvidence(index,question,{domain='auto',mode='focused'}={}){
  if(!DOMAIN_OPTIONS.includes(domain))throw new Error('BAD_DOMAIN');
  if(!MODES.includes(mode))throw new Error('BAD_ANALYSIS_MODE');
  const q=plain(question);
  if(!q||q.length>1800)throw new Error('BAD_QUESTION');
  const ranked=scoreChunks(index,q,domain);
  let candidates;
  if(mode==='overview'){
    // Broad sampling across all readable PDF pages. Honest: NOT a semantic review of
    // every sentence. Numeric coverage and warnings are returned.
    const wide=stratifiedChunks(index,6);
    const focused=selectDiverse(ranked,3);
    const seen=new Set(wide.map(v=>v.chunk.id));
    candidates=[...wide,...focused.filter(v=>!seen.has(v.chunk.id))];
  }else{
    candidates=selectDiverse(ranked,BOOK_LIMITS.maxEvidence);
  }
  const hits=[];
  let charCount=0;
  for(const item of candidates){
    const text=item.chunk.text.slice(0,BOOK_LIMITS.maxExcerptChars);
    if(charCount+text.length>BOOK_LIMITS.maxPayloadChars)break;
    charCount+=text.length;
    hits.push({
      id:item.chunk.id,page:item.chunk.page,text,score:+item.score.toFixed(3)
    });
  }
  const uniquePages=[...new Set(hits.map(x=>x.page))].sort((a,b)=>a-b);
  const hasSpecificEvidence=ranked.length>0;
  const status=mode==='overview'?
    'STRATIFIED_SAMPLE_NOT_EXHAUSTIVE':
    hasSpecificEvidence?'MATCHED_EXCERPTS_NOT_VERIFIED':'NO_MATCHING_EXCERPTS';
  return {
    question:q,domain,mode,evidence:hits,
    coverage:{
      totalPdfPages:index.totalPages,
      readablePages:index.readablePages,
      unreadablePages:index.unreadablePages.slice(0,50),
      truncatedPages:index.truncatedPages.slice(0,50),
      indexedChunks:index.chunks.length,
      selectedExcerpts:hits.length,selectedPages:uniquePages,
      selectedPageFraction:+(uniquePages.length/index.totalPages).toFixed(4),
      status
    },
    algorithm:index.algorithm,
    canAskModel:hits.length>0&&(mode==='overview'||hasSpecificEvidence)
  };
}
export function makeCitationLabel(page){return 'PDF стр. '+String(page);}
