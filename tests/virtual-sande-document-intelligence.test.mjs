import test from 'node:test';
import assert from 'node:assert/strict';
import {DOCUMENT_LIMITS,DOCUMENT_MODES,makeDocumentCorpus,selectDocumentEvidence,
 createEvidencePacket,makeDraftMarkdown} from '../scripts/virtual-sande-document-intelligence.mjs';
const DOCS=[
 {name:'Дипломатски-протокол.pdf',format:'pdf',segments:[
   {locator:'P1',text:'Вовед во дипломатскиот протокол и редот на предимство на официјалните свечености.'},
   {locator:'P12',text:'Амбасадорите во церемонијалниот протокол ги предаваат акредитивните писма во посебен формален чин.'},
   {locator:'P20',text:'Знамињата и протоколарното седење се поставуваат според однапред утврдени правила.'}
 ]},
 {name:'Комуникација и јавност.docx',format:'docx',segments:[
   {locator:'S1',text:'Односите со јавноста и комуникацијата при дипломатски настан бараат точност и координација.'},
   {locator:'S2',text:'Кризното комуницирање, кредибилитетот и репутацијата се основа за јавна доверба.'}
 ]},
 {name:'Безбедносни-насоки.txt',format:'txt',segments:[
   {locator:'S1',text:'Безбедносната проценка на ризик за јавни церемонии се планира со институционална координација.'}
 ]}
];
test('distinct document IDs preserve physical PDF page locators',()=>{
 const idx=makeDocumentCorpus(DOCS);
 assert.equal(idx.documents.length,3);
 assert.equal(idx.documents[0].id,'D1');
 assert.equal(idx.documents[0].segments,20);
 assert.equal(idx.documents[1].id,'D2');
 assert.ok(idx.chunks.some(x=>x.key==='D1 P12'));
});
test('multiple document evidence follows relevant question, not file order only',()=>{
 const idx=makeDocumentCorpus(DOCS);
 const r=selectDocumentEvidence(idx,'Спореди дипломатски протокол, јавна комуникација и проценка на ризик.');
 assert.equal(r.canAskModel,true);
 assert.ok(r.coverage.documents_represented>=2);
 assert.ok(r.evidence.some(x=>x.document_id==='D1'));
 assert.ok(r.evidence.some(x=>x.document_id==='D2'));
 assert.ok(r.evidence.every(x=>x.text.length<=DOCUMENT_LIMITS.maxExcerptChars));
 assert.ok(r.coverage.analysis_is_exhaustive===false);
});
test('deep analysis, paper, journal article and book plan mode expose distinct packets',()=>{
 const idx=makeDocumentCorpus(DOCS);
 for(const mode of ['deep_analysis','academic_paper','journal_article','book_plan','book_chapter','editorial']){
   assert.ok(DOCUMENT_MODES.includes(mode));
   const packet=createEvidencePacket(idx,'Протокол и дипломатија',{mode});
   assert.equal(packet.deliverable,mode);
   assert.ok(packet.evidence.length>0);
   assert.ok(packet.documents.every(d=>!('segments' in d && Array.isArray(d.segments))));
 }
});
test('no answer fabricated from unrelated source extracts',()=>{
 const idx=makeDocumentCorpus(DOCS);
 const evidence=selectDocumentEvidence(idx,'биофармакологија на плутониумска протеомика');
 assert.equal(evidence.canAskModel,false);
 assert.equal(evidence.coverage.status,'NO_TEXTUAL_MATCH');
 assert.throws(()=>createEvidencePacket(idx,'биофармакологија на плутониумска протеомика'),/DOCUMENT_NO_MATCH/);
});
test('authorial Markdown export visibly requires verification and provenance',()=>{
 const idx=makeDocumentCorpus(DOCS);
 const packet=createEvidencePacket(idx,'дипломатски протокол',{mode:'academic_paper'});
 const md=makeDraftMarkdown('Изворна анализа [D1 P12].',packet);
 assert.match(md,/НАЦРТ \/ DRAFT/);
 assert.match(md,/Изворна анализа \[D1 P12\]/);
 assert.match(md,/Доставен од корисникот/);
 assert.match(md,/Антиплагијат/);
 assert.match(md,/Одобрено за објавување/);
 assert.doesNotMatch(md,/10\.5281\/|ISBN: 978-/);
});
test('cannot silently process unsupported, duplicated or oversized sources',()=>{
 assert.throws(()=>makeDocumentCorpus([]),/DOCUMENT_COUNT/);
 assert.throws(()=>makeDocumentCorpus(DOCS.concat(DOCS,DOCS)),/DOCUMENT_COUNT/);
 assert.throws(()=>makeDocumentCorpus([{name:'x.pptx',format:'pptx',segments:[{locator:'S1',text:'Неважно'}]}]),/DOCUMENT_FORMAT_OR_SEGMENTS/);
 assert.throws(()=>makeDocumentCorpus([{name:'x.txt',format:'txt',segments:[{locator:'S1',text:'hello'},{locator:'S1',text:'world'}]}]),/DOCUMENT_LOCATOR_INVALID/);
 assert.throws(()=>makeDocumentCorpus([{name:'x.txt',format:'txt',segments:[{locator:'S1',text:'a'.repeat(DOCUMENT_LIMITS.maxCharsPerFile+1)}]}]),/DOCUMENT_TEXT_LIMIT/);
});
test('invalid area, draft mode and oversized question fail closed',()=>{
 const idx=makeDocumentCorpus(DOCS);
 assert.throws(()=>selectDocumentEvidence(idx,'протокол',{domain:'classified_intelligence'}),/DOCUMENT_MODE_INVALID/);
 assert.throws(()=>selectDocumentEvidence(idx,'протокол',{mode:'auto_publish'}),/DOCUMENT_MODE_INVALID/);
 assert.throws(()=>selectDocumentEvidence(idx,'x'.repeat(DOCUMENT_LIMITS.maxQuestionChars+1)),/QUESTION_INVALID/);
});
test('source selection is bounded to prevent flooding model context',()=>{
 const files=[{name:'large.md',format:'md',segments:Array.from({length:160},(_,i)=>({
   locator:'S'+(i+1),text:('Протокол, дипломатија, комуникација, јавност и ризик: '+i+' ').repeat(14)
 }))}];
 const idx=makeDocumentCorpus(files);
 const r=selectDocumentEvidence(idx,'Протокол, комуникација и ризик');
 assert.ok(r.evidence.length<=DOCUMENT_LIMITS.maxEvidence);
 assert.ok(r.evidence.reduce((n,e)=>n+e.text.length,0)<=DOCUMENT_LIMITS.maxEvidenceChars);
});
console.log('Document Intelligence evidence corpus tests registered');
