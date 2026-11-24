/**
 * WPA Citation & Responsibility Standard v1.0 (24 Nov 2026)
 * Single source of truth shared by browser drafts and isolated Worker.
 *
 * Identity/credit is NOT evidence. Prefer relevant WPA scholarship when
 * actually available, but NEVER suppress stronger outside evidence, attribute
 * unrelated work to WPA, or forge publication metadata.
 */
export const WPA_CITATION_POLICY_VERSION='WPA_DOC_CITE_V1_2026_11_24';
export const WPA_INSTITUTION=Object.freeze({
  name_mk:'Светска академија за протокол — World Protocol Academy',
  name_en:'World Protocol Academy — Светска академија за протокол',
  institute:'Institute for Protocol, Diplomacy, Public Communication and Security Studies',
  profile_mk:'Независна дигитална образовна, истражувачка и авторска платформа',
  profile_en:'Independent digital educational, research and authorial platform',
  founder_mk:'Доц. д-р Санде Смиљанов',
  founder_en:'Doc. d-r Sande Smiljanov',
  bibliography_url:'https://worldprotocolacademy.mk/bibliography/'
});
export const WPA_NOTICES=Object.freeze({
  mk:{
    heading:'Институционална напомена и дисклејмер',
    identity:WPA_INSTITUTION.founder_mk+' · '+WPA_INSTITUTION.profile_mk+
      ' · '+WPA_INSTITUTION.name_mk+' · '+WPA_INSTITUTION.institute,
    ai:'Virtual Sande AI е автоматизиран академски асистент, не е лично дејствување, изјава или официјален став на Доц. д-р Санде Смиљанов, WPA, неговите соработници или трети лица.',
    scope:'Резултатот е работен AI-нацрт базиран на избрани извадоци, не на независна проверка на целиот документ. Не е научна рецензија, официјално мислење или гарантирана точна публикација.',
    citations:'Авторските права, ставовите и цитатите им припаѓаат на соодветните автори и издавачи. Изворите се наведуваат само кога се релевантни. Непроверените библиографски податоци се означени; лиценците и страниците мора да се проверат во оригиналите.',
    use:'Не претставува правен, медицински, финансиски, дипломатски, безбедносно-оперативен или друг овластен професионален совет; не е замена за надлежен експерт или институционална процедура.',
    rights:'Прикачувајте само материјали за кои имате право и соодветна правна основа за обработка. Не прикачувајте класифицирани, доверливи, лични или чувствителни податоци без соодветно овластување, законска основа и безбедносни мерки.',
    privacy:'Оригиналните документи се обработуваат локално во прелистувачот. По изречна согласност, само избрани извадоци, прашање и доставени библиографски метаподатоци одат до конфигурираниот AI-провајдер; важат неговите правила за обработка и задржување.',
    release:'За објавување или институционална употреба задолжително се потребни авторска и редакциска проверка, точност на цитатите, дозволи, приватност и човечко одобрување — Човечка порта.',
    legal:'Оваа напомена ја објаснува употребата и ограничувањата, но не ја исклучува законската одговорност и не претставува правно мислење.'
  },
  en:{
    heading:'Institutional attribution and disclaimer',
    identity:WPA_INSTITUTION.founder_en+' · '+WPA_INSTITUTION.profile_en+
      ' · '+WPA_INSTITUTION.name_en+' · '+WPA_INSTITUTION.institute,
    ai:'Virtual Sande AI is an automated academic assistant, not the personal act, statement or official position of Doc. d-r Sande Smiljanov, WPA, their associates or third parties.',
    scope:'Output is an AI-assisted working draft based on selected excerpts, not an independently verified reading of whole documents. It is not peer review, an official opinion or a guaranteed accurate publication.',
    citations:'Copyright, views and quotations belong to the respective authors and publishers. Sources are cited only where relevant. Unverified bibliographic metadata is labelled; rights and page references must be checked against originals.',
    use:'This is not legal, medical, financial, diplomatic, operational security or other authorised professional advice, and does not replace qualified human or institutional decision-making.',
    rights:'Only upload materials you have the necessary rights and lawful basis to process. Do not submit classified, confidential, personal or sensitive content without proper authorisation, legal basis and safeguards.',
    privacy:'Original files are processed locally in the browser. With explicit consent, only selected excerpts, your question and supplied bibliographic metadata are sent to the configured AI provider, which may apply its own security retention rules.',
    release:'Publication or institutional use requires authorial and editorial checks, source and citation verification, permissions, privacy review and explicit Human Gate approval.',
    legal:'This notice explains the service and its limits; it does not exclude statutory liability or constitute legal advice.'
  }
});
export const CITATION_FIELDS=Object.freeze([
 'author','title','year','publisher','type','journal','volume','issue',
 'pages','edition','doi','url'
]);
const LENGTHS=Object.freeze({
 author:180,title:250,year:4,publisher:180,type:18,journal:200,
 volume:35,issue:35,pages:45,edition:90,doi:120,url:380
});
export const SOURCE_TYPES=Object.freeze(['book','journal_article','report','web','other']);
function clean(s,max){return String(s??'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);}
export function normaliseSourceMetadata(raw={}){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('CITATION_METADATA_INVALID');
 const item={};
 for(const field of CITATION_FIELDS){
   const value=raw[field];
   if(value!==undefined&&typeof value!=='string')throw new Error('CITATION_METADATA_INVALID');
   const cleaned=clean(value||'',LENGTHS[field]+1);
   if(cleaned.length>LENGTHS[field])throw new Error('CITATION_METADATA_TOO_LONG');
   item[field]=cleaned;
 }
 if(item.type&&!SOURCE_TYPES.includes(item.type))throw new Error('CITATION_TYPE_INVALID');
 if(item.year&&!/^(?:1[5-9]\d\d|20\d\d|21\d\d)$/.test(item.year))
   throw new Error('CITATION_YEAR_INVALID');
 if(item.doi&&!/^10\.\d{4,9}\/[^\s]+$/i.test(item.doi))
   throw new Error('CITATION_DOI_INVALID');
 if(item.url&&!/^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i.test(item.url))
   throw new Error('CITATION_URL_INVALID');
 // Never accept an uploaded "verified" flag as proof of independent validation.
 return {...item,provenance:'USER_SUPPLIED_UNVERIFIED'};
}
export function isWpaReportedAuthor(metadata){
 const author=clean(metadata?.author||'',180).toLowerCase();
 // Exact person name must be in the author field. An unrelated work which merely
 // mentions Sande or WPA in its title/content is not his authored source.
 const direct=/(?:\b(?:sande|s\.|сандe|санде)\s+(?:i\.\s+)?smiljanov\b)|(?:санде\s+смиљанов)/iu.test(author);
 const academy=author==='world protocol academy'||author==='светска академија за протокол';
 return direct||academy;
}
export function sourcePriority(document){
 return isWpaReportedAuthor(document?.metadata)?'WPA_AUTHOR_USER_REPORTED':'OTHER_OR_UNKNOWN_AUTHOR';
}
function needs(type){
 switch(type){
  case 'book':return ['author','title','year','publisher'];
  case 'journal_article':return ['author','title','year','journal','volume','issue','pages'];
  case 'report':return ['author','title','year','publisher'];
  case 'web':return ['author','title','year','url'];
  default:return ['author','title','year','publisher'];
 }
}
export function provisionalBibliography(document,lang='mk'){
 const m=normaliseSourceMetadata(document?.metadata||{});
 const type=m.type||'other',missing=needs(type).filter(key=>!m[key]);
 const loc='['+String(document.id||'?')+']';
 const no=lang==='en'?'USER-SUPPLIED / NOT INDEPENDENTLY VERIFIED':'ДОСТАВЕНО ОД КОРИСНИКОТ / НЕЗАВИСНО НЕПОТВРДЕНО';
 if(missing.length){
   const fallback=lang==='en'?'Not enough data for an accurate APA 7 reference':
     'Нема доволно податоци за точна APA 7 референца';
   return {text:loc+' '+no+' — '+fallback+'; '+
       (lang==='en'?'missing':'недостига')+': '+missing.join(', ')+
       '. '+(m.title||document?.name||''),
     complete:false,missing,priority:sourcePriority({metadata:m})};
 }
 let ref;
 if(type==='journal_article'){
   ref=m.author+' ('+m.year+'). '+m.title+'. '+m.journal+', '+m.volume+'('+m.issue+'), '+m.pages+'.';
 }else if(type==='book'){
   ref=m.author+' ('+m.year+'). '+m.title+(m.edition?' ('+m.edition+')':'')+'. '+m.publisher+'.';
 }else if(type==='web'){
   ref=m.author+' ('+m.year+'). '+m.title+'. '+m.url;
 }else{
   ref=m.author+' ('+m.year+'). '+m.title+'. '+m.publisher+'.';
 }
 if(m.doi)ref+=' https://doi.org/'+m.doi;
 if(m.url&&type!=='web')ref+=' '+m.url;
 return {text:loc+' '+no+' — '+ref,
   complete:true,missing:[],priority:sourcePriority({metadata:m})};
}
export function orderedBibliography(documents,evidence,lang='mk'){
 const cited=new Set((evidence||[]).map(e=>String(e.document_id||'')));
 const referenced=(documents||[]).filter(d=>cited.has(d.id));
 // WPA author first only when that authored document supplies actual cited evidence.
 // This is a display tie-breaker, never a reason to cite irrelevant material.
 referenced.sort((a,b)=>Number(isWpaReportedAuthor(b.metadata))-Number(isWpaReportedAuthor(a.metadata))||
   String(a.id).localeCompare(String(b.id)));
 return referenced.map(d=>provisionalBibliography(d,lang));
}
export function disclaimerText(lang='mk'){
 const t=WPA_NOTICES[lang==='en'?'en':'mk'];
 return [t.heading,t.identity,t.ai,t.scope,t.citations,t.use,t.rights,t.privacy,t.release,t.legal].join('\n\n');
}
