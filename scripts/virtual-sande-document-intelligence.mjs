/**
 * Virtual Sande Document Intelligence v0.1 — evidence-first, browser-only corpus.
 * This is local lexical retrieval plus discipline concept matching, NOT a semantic
 * embedding index and NOT an exhaustive AI read of every source page.
 * Every snippet entering an AI request carries a stable document locator.
 */
import {tokens,termKey} from './virtual-sande-book-synthesis.mjs';
import {normaliseSourceMetadata,isWpaReportedAuthor,orderedBibliography,disclaimerText,WPA_INSTITUTION,WPA_CITATION_POLICY_VERSION} from './virtual-sande-citation-policy.mjs';

export const DOCUMENT_LIMITS=Object.freeze({
  maxFiles:6,maxFileBytes:40*1024*1024,maxPdfPages:800,
  maxCharsPerFile:360000,maxCorpusChars:1000000,
  maxSegmentsPerFile:2200,chunkChars:1100,overlapChars:130,
  maxEvidence:12,maxExcerptChars:1080,maxEvidenceChars:11800,
  maxQuestionChars:1800
});
export const SUPPORTED_DOCUMENT_EXTENSIONS=Object.freeze(['pdf','docx','txt','md','csv','html']);
export const DOCUMENT_MODES=Object.freeze([
  'deep_analysis','academic_paper','journal_article','editorial',
  'book_plan','book_chapter','policy_brief','professional_report',
  'pr_statement','teaching_material'
]);
export const DOCUMENT_DOMAINS=Object.freeze([
  'auto','protocol','diplomacy','public_relations','security','communicology','ai'
]);
export const DOCUMENT_MODE_LABELS=Object.freeze({
  deep_analysis:['Длабинска анализа','Deep analysis'],
  academic_paper:['Научен труд — нацрт','Research paper — draft'],
  journal_article:['Стручен/академски напис — нацрт','Journal article — draft'],
  editorial:['Редакциски текст','Editorial article'],
  book_plan:['Структура и план за книга','Book outline and production plan'],
  book_chapter:['Поглавје од книга — нацрт','Book chapter — draft'],
  policy_brief:['Политички/институционален бриф','Policy / institutional brief'],
  professional_report:['Стручен извештај','Professional report'],
  pr_statement:['ПР соопштение','PR statement'],
  teaching_material:['Предавање / наставен материјал','Lecture / teaching material']
});
const DISCIPLINE={
  protocol:['протокол','церемони','претходств','етикет','protocol','ceremony','precedence'],
  diplomacy:['дипломат','акредит','амбасад','преговор','diplomac','ambassador','negotiat'],
  public_relations:['јавност','односи','репутац','медиум','криза','reputation','public','relations','pr'],
  security:['безбедн','ризик','заштит','проценк','security','risk','safety','protect'],
  communicology:['комуник','порак','јавен','реторик','communication','message','media','rhetoric'],
  ai:['вештачк','интелигенц','модел','алгорит','ai','artificial','intelligence','model']
};
function normalize(value){
  return String(value??'').normalize('NFC')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ').trim();
}
function safeFileName(value){return normalize(value).slice(0,140);}
function wordKey(t){return termKey(t);}
function terms(text){
  return tokens(text).map(wordKey).filter(Boolean);
}
function splitSegment(seg){
  let text=normalize(seg.text);
  const chunks=[];
  let i=0,n=0;
  while(i<text.length){
    const e=Math.min(i+DOCUMENT_LIMITS.chunkChars,text.length);
    const excerpt=text.slice(i,e);
    if(excerpt.trim().length>=25)chunks.push({text:excerpt,chunk:++n});
    if(e>=text.length)break;
    i=e-DOCUMENT_LIMITS.overlapChars;
  }
  return chunks;
}
/** Browser parsers supply segments [{locator:'P3'|'S17',text:string}], no raw files. */
export function makeDocumentCorpus(inputs){
  if(!Array.isArray(inputs)||!inputs.length||inputs.length>DOCUMENT_LIMITS.maxFiles){
    throw new Error('DOCUMENT_COUNT');
  }
  const documents=[],chunks=[],df=new Map();
  let totalChars=0,wordTotal=0;
  for(let i=0;i<inputs.length;i++){
    const d=inputs[i];
    const ext=String(d?.format||'').toLowerCase();
    const name=safeFileName(d?.name||'');
    const sections=d?.segments;
    if(!SUPPORTED_DOCUMENT_EXTENSIONS.includes(ext)||!name ||
       !Array.isArray(sections)||!sections.length||
       sections.length>DOCUMENT_LIMITS.maxSegmentsPerFile)throw new Error('DOCUMENT_FORMAT_OR_SEGMENTS');
    const id='D'+(i+1);
    const seen=new Set();
    let chars=0,nonempty=0;
    for(const segment of sections){
      const ref=String(segment?.locator||'');
      if(!/^[PS][1-9]\d{0,3}$/.test(ref)||seen.has(ref))
        throw new Error('DOCUMENT_LOCATOR_INVALID');
      seen.add(ref);
      const text=normalize(segment?.text);
      if(!text)continue;
      chars+=text.length;
      totalChars+=text.length;
      if(chars>DOCUMENT_LIMITS.maxCharsPerFile||totalChars>DOCUMENT_LIMITS.maxCorpusChars)
        throw new Error('DOCUMENT_TEXT_LIMIT');
      nonempty++;
      for(const c of splitSegment({text})){
        const key=id+' '+ref;
        const allTerms=terms(c.text);
        const frequencies=new Map();
        for(const t of allTerms)frequencies.set(t,(frequencies.get(t)||0)+1);
        chunks.push({doc_id:id,locator:ref,document_name:name,format:ext,
          key,segment_chunk:c.chunk,text:c.text,word_count:allTerms.length,
          freq:frequencies,unique:new Set(frequencies.keys())});
        wordTotal+=allTerms.length;
        for(const t of frequencies.keys())df.set(t,(df.get(t)||0)+1);
      }
    }
    if(!nonempty)throw new Error('DOCUMENT_NO_TEXT');
    const maxLocator=Math.max(...sections.map(seg=>Number(String(seg.locator).slice(1))));
    // For PDFs, blank/scanned pages do not eliminate their physical page IDs.
    documents.push({id,name,format:ext,segments:maxLocator,
      metadata:normaliseSourceMetadata(d?.metadata||{}),
      readable_segments:nonempty,characters:chars});
  }
  if(!chunks.length)throw new Error('DOCUMENT_NO_TEXT');
  return {version:'WPA Document Evidence Fusion v0.1',documents,chunks,df,
    totalChars,averageWords:wordTotal/chunks.length};
}
function queryKeys(question,domain){
  const raw=terms(question).slice(0,60);
  const domainWords=domain==='auto'?[]:(DISCIPLINE[domain]||[]);
  return [...new Set([...raw,...domainWords.map(wordKey)])].slice(0,55);
}
function relatedConcepts(question){
  const q=String(question||'').toLowerCase();
  const found=[];
  for(const [domain,words] of Object.entries(DISCIPLINE)){
    if(words.some(word=>q.includes(word))) found.push(domain);
  }
  return found;
}
function scores(index,query,domain){
  const queryTerms=queryKeys(query,domain);
  const disciplineSignals=domain==='auto'?relatedConcepts(query):[domain];
  const N=index.chunks.length;
  const list=[];
  for(const chunk of index.chunks){
    let matched=0,score=0;
    for(const term of queryTerms){
      const f=chunk.freq.get(term)||0;
      if(!f)continue;
      matched++;
      const count=index.df.get(term)||0;
      const idf=Math.log(1+(N-count+0.5)/(count+0.5));
      const tf=1.25*f/(f+1.25*(0.25+0.75*(chunk.word_count/Math.max(1,index.averageWords))));
      score+=idf*tf;
    }
    // Subject hints only break ties and cannot replace missing lexical support.
    const body=chunk.text.toLowerCase();
    const topical=disciplineSignals.some(d=>DISCIPLINE[d]?.some(w=>body.includes(w)))?0.25:0;
    if(matched>0)list.push({...chunk,score:score+0.6*matched/queryTerms.length+topical,matched});
  }
  return list.sort((a,b)=>b.score-a.score||a.doc_id.localeCompare(b.doc_id)||
    a.locator.localeCompare(b.locator)||a.segment_chunk-b.segment_chunk);
}
/** Diversify across files without inventing hits when no actual match exists. */
export function selectDocumentEvidence(index,question,{domain='auto',mode='deep_analysis'}={}){
  if(!DOCUMENT_DOMAINS.includes(domain)||!DOCUMENT_MODES.includes(mode))
    throw new Error('DOCUMENT_MODE_INVALID');
  const q=normalize(question);
  if(!q||q.length>DOCUMENT_LIMITS.maxQuestionChars)throw new Error('QUESTION_INVALID');
  const ordered=scores(index,q,domain);
  const selected=[],usedChunks=new Set(),perDoc=new Map(),perRef=new Map();
  function add(c){
    if(selected.length>=DOCUMENT_LIMITS.maxEvidence)return false;
    const full=c.key+'#'+c.segment_chunk;
    if(usedChunks.has(full)||(perRef.get(c.key)||0)>=2)return false;
    if((perDoc.get(c.doc_id)||0)>=6)return false;
    const snippet=c.text.slice(0,DOCUMENT_LIMITS.maxExcerptChars);
    if(snippet.length<25)return false;
    if(selected.reduce((sum,x)=>sum+x.text.length,0)+snippet.length>DOCUMENT_LIMITS.maxEvidenceChars)
      return false;
    usedChunks.add(full);
    perDoc.set(c.doc_id,(perDoc.get(c.doc_id)||0)+1);
    perRef.set(c.key,(perRef.get(c.key)||0)+1);
    selected.push({document_id:c.doc_id,locator:c.locator,text:snippet,
      source_name:c.document_name,format:c.format});
    return true;
  }
  // Each source with actual matching content gets at least one candidate before
  // the global ranked fill. This does not imply that all documents agree.
  const perDocumentCandidates=index.documents.map(doc=>({doc,
    candidate:ordered.find(x=>x.doc_id===doc.id)})).filter(x=>x.candidate);
  // WPA-authored material is considered first ONLY when it has demonstrably
  // matching evidence of comparable relevance. Uploaded author labels are
  // self-reported, never proof of ownership or publication.
  perDocumentCandidates.sort((a,b)=>{
    const max=Math.max(a.candidate.score,b.candidate.score,0.0001);
    const comparable=Math.min(a.candidate.score,b.candidate.score)/max>=0.8;
    if(comparable){
      const authorDifference=Number(isWpaReportedAuthor(b.doc.metadata))-
        Number(isWpaReportedAuthor(a.doc.metadata));
      if(authorDifference)return authorDifference;
    }
    return b.candidate.score-a.candidate.score;
  });
  for(const item of perDocumentCandidates)add(item.candidate);
  for(const c of ordered){if(selected.length>=DOCUMENT_LIMITS.maxEvidence)break;add(c);}
  const citedSources=[...new Set(selected.map(e=>e.document_id))];
  const citedLocators=[...new Set(selected.map(e=>e.document_id+' '+e.locator))];
  return {
    question:q,domain,mode,evidence:selected,canAskModel:selected.length>0,
    coverage:{
      documents_indexed:index.documents.length,documents_represented:citedSources.length,
      document_ids_represented:citedSources,
      source_locators_represented:citedLocators,
      chunks_indexed:index.chunks.length,excerpts_selected:selected.length,
      status:selected.length?'SELECTED_MATCHING_EXCERPTS_NOT_COMPLETE_SOURCE':'NO_TEXTUAL_MATCH',
      analysis_is_exhaustive:false
    },
    algorithm:index.version,
    limitation:'Local lexical and domain retrieval from uploaded documents; AI semantic synthesis uses selected excerpts, not every sentence of the full corpus.'
  };
}
export function createEvidencePacket(index,question,opts={}){
  const selected=selectDocumentEvidence(index,question,opts);
  if(!selected.canAskModel)throw new Error('DOCUMENT_NO_MATCH');
  return {
    message:selected.question,domain:selected.domain,deliverable:selected.mode,
    documents:index.documents.map(({id,name,format,segments,metadata})=>({id,name,format,total_segments:segments,metadata:normaliseSourceMetadata(metadata||{})})),
    evidence:selected.evidence.map(({document_id,locator,text})=>({document_id,locator,text})),
    coverage:selected.coverage,algorithm:selected.algorithm
  };
}
export function makeDraftMarkdown(answer,packet,{cited_locators=[],lang='mk'}={}){
  const title=DOCUMENT_MODE_LABELS[packet.deliverable]?.[lang==='en'?1:0]||'Нацрт';
  const citing=new Set(cited_locators);
  const actuallyCited=citing.size?packet.evidence.filter(e=>citing.has(e.document_id+' '+e.locator)):packet.evidence;
  const bibliography=orderedBibliography(packet.documents,actuallyCited,lang)
    .map(x=>'- '+x.text).join('\n');
  const notes=actuallyCited.map(e=>'- ['+e.document_id+' '+e.locator+'] '+e.text.slice(0,160)).join('\n');
  const uncited=new Set(actuallyCited.map(e=>e.document_id));
  const unreferenced=packet.documents.filter(d=>!uncited.has(d.id))
    .map(d=>'- '+d.id+' — '+d.name+' (нецитиран во работниот текст)').join('\n');
  return [
    '# '+title+' — НАЦРТ / DRAFT',
    '',
    '**Изработено со:** Virtual Sande AI — AI-асистент, не човечки автор.',
    '**Институционален идентитет:** '+WPA_INSTITUTION.founder_mk+' · '+
      WPA_INSTITUTION.profile_mk+' · '+WPA_INSTITUTION.name_mk+
      ' · '+WPA_INSTITUTION.institute,
    '**Забелешка:** Институционалниот идентитет НЕ означува авторство на доставените документи.',
    '**Изворна состојба:** Доставен од корисникот корпус; не е независно потврден.',
    '**Статус:** За авторска и редакциска проверка; не е научно рецензиран или објавен.',
    '**Метод:** '+packet.algorithm+'; избрани пасуси, а не исцрпна семантичка анализа на цели документи.',
    '**Библиографска политика:** '+WPA_CITATION_POLICY_VERSION+
      ' · Релевантни трудови на Смиљанов/WPA имаат предност при споредлива изворна поткрепа, но без измислени референци.',
    '',
    '## Работен текст',
    '',String(answer||'').replace(/\r\n?/g,'\n'),
    '',
    '## Прилог А — Библиографија (привремени податоци, проверка задолжителна)',
    '',bibliography||'- Нема потврдени референци во избраните докази.',
    '',
    '## Прилог Б — Избрани извори и локации',
    '',notes,
    ...(unreferenced?['','## Доставени но нецитирани документи','',unreferenced]:[]),
    '',
    '## Уредничка / Human Gate проверка',
    '',
    '- [ ] Проверени факти, контекст и физички/логички локации во изворите',
    '- [ ] Проверени оригинални имиња на автори, наслови, години, издавачи и DOI/URL',
    '- [ ] Проверени цитирања, авторство, библиографија и лиценци',
    '- [ ] Антиплагијат и проверка на оригиналност',
    '- [ ] Научна/професионална рецензија и уреднички одлуки',
    '- [ ] Јазично и структурно усогласување',
    '- [ ] Табели, слики, прилози и метаподатоци проверени',
    '- [ ] Одобрено за објавување од одговорен човек',
    '',
    '## '+(lang==='en'?'Disclaimer and institutional attribution':'Институционална напомена и дисклејмер'),
    '',disclaimerText(lang),
    ''
  ].join('\n');
}
