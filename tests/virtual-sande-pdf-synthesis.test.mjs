import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOK_LIMITS,makeBookIndex,selectBookEvidence,scoreChunks,tokens} from '../scripts/virtual-sande-book-synthesis.mjs';

const pages=[
 'Вовед во церемонијалните правила и протокол. Редот на предимство на амбасадори се одредува според официјалните правила.',
 'Протоколарно седење и знамиња при дипломатска средба. Државните симболи треба точно да бидат распоредени.',
 'Дипломатија и амбасадорски акредитивни писма. Меѓународните односи се темелат на претставување и преговарање.',
 'Односи со јавност и кризна комуникација. Репутацијата на институцијата е значајна при јавна изјава.',
 'Безбедноста на официјални настани бара систематска проценка на ризик и контрола на пристапот.',
 'Комуникологијата ги проучува комуникациските пораки, невербалното однесување и медиумските канали.',
 'Вештачка интелигенција, AI алгоритам и човекова одговорност. Одлуките се потврдуваат од човек.',
 'Завршен преглед за институционална одговорност, дипломатска форма и граници на технологијата.'
];
test('all PDF pages become indexed chunks with real physical page provenance',()=>{
  const idx=makeBookIndex(pages,{name:'Тест книга.pdf'});
  assert.equal(idx.totalPages,8);
  assert.equal(idx.readablePages,8);
  assert.equal(idx.unreadablePages.length,0);
  assert.ok(idx.chunks.length>=8);
  assert.equal(idx.chunks[0].page,1);
  assert.equal(idx.chunks.at(-1).page,8);
});
test('Cyrillic and English search terms are tokenised and normalised',()=>{
  assert.deepEqual(tokens('Протокол, дипломатски и ВЕШТАЧКА AI!'),['протокол','дипломатски','вештачка','ai']);
});
test('focused retrieval targets the requested page and exposes chosen pages',()=>{
  const idx=makeBookIndex(pages);
  const result=selectBookEvidence(idx,'Каде книгата зборува за безбедност и проценка на ризик?');
  assert.equal(result.canAskModel,true);
  assert.ok(result.evidence.some(e=>e.page===5));
  assert.ok(result.coverage.selectedPages.includes(5));
  assert.equal(result.coverage.totalPdfPages,8);
  assert.ok(result.coverage.selectedPageFraction<1.01);
});
test('Macedonian inflections and English plurals map to book evidence',()=>{
  const idx=makeBookIndex(pages);
  const selected=selectBookEvidence(idx,'Како протоколот и безбедноста ги уредуваат настаните?');
  assert.equal(selected.canAskModel,true);
  assert.ok(selected.coverage.selectedPages.includes(1));
  assert.ok(selected.coverage.selectedPages.includes(5));
});
test('cross-domain analysis can target public relations and diplomacy',()=>{
  const idx=makeBookIndex(pages);
  const result=selectBookEvidence(idx,'Поврзи јавна комуникација, дипломатија и институционален протокол.',{mode:'cross_domain'});
  assert.equal(result.mode,'cross_domain');
  assert.ok(result.evidence.length>0);
  assert.equal(result.coverage.status,'MATCHED_EXCERPTS_NOT_VERIFIED');
});
test('book overview is stratified sample, never claims whole-book AI analysis',()=>{
  const many=Array.from({length:120},(_,i)=>
    'Страница '+(i+1)+' за историски извори на дипломатски протокол и институционална одговорност. '.repeat(4));
  const idx=makeBookIndex(many);
  const selected=selectBookEvidence(idx,'Направи преглед на оваа книга',{mode:'overview'});
  assert.equal(selected.canAskModel,true);
  assert.equal(selected.coverage.status,'STRATIFIED_SAMPLE_NOT_EXHAUSTIVE');
  assert.ok(selected.coverage.selectedPages.length<=BOOK_LIMITS.maxEvidence);
  assert.ok(selected.coverage.selectedPageFraction<0.15);
  assert.ok(selected.coverage.selectedPages.includes(1));
  assert.ok(selected.coverage.selectedPages.includes(120));
});
test('unmatched focused question does not spend on imagined citations',()=>{
  const idx=makeBookIndex(pages);
  const sel=selectBookEvidence(idx,'Биофармаколошка протеомика на планктон');
  assert.equal(sel.canAskModel,false);
  assert.equal(sel.evidence.length,0);
  assert.equal(sel.coverage.status,'NO_MATCHING_EXCERPTS');
});
test('scanned-only PDF is not misrepresented as analysable without OCR',()=>{
  assert.throws(()=>makeBookIndex(['','   ','***']),/PDF_NO_EXTRACTABLE_TEXT/);
  const idx=makeBookIndex([pages[0],'',pages[3]]);
  assert.deepEqual(idx.unreadablePages,[2]);
});
test('page/file names are treated as data, not commands',()=>{
  const idx=makeBookIndex([pages[0]],{name:'<script>alert(1)</script>.pdf'});
  assert.equal(idx.name,'<script>alert(1)</script>.pdf');
  assert.equal(typeof idx.name,'string');
  assert.equal(idx.chunks.length,1);
});
test('oversized book, domain, mode and request are bounded',()=>{
  assert.throws(()=>makeBookIndex(Array.from({length:BOOK_LIMITS.maxPages+1},()=>pages[0])),/PDF_PAGE_LIMIT/);
  const idx=makeBookIndex(pages);
  assert.throws(()=>selectBookEvidence(idx,'x',{domain:'secret_data'}),/BAD_DOMAIN/);
  assert.throws(()=>selectBookEvidence(idx,'x',{mode:'full_unlimited_ai'}),/BAD_ANALYSIS_MODE/);
  assert.throws(()=>selectBookEvidence(idx,'x'.repeat(1801)),/BAD_QUESTION/);
});
test('large pages mark truncation and keep excerpts under server budget',()=>{
  const idx=makeBookIndex([pages[0].repeat(300)]);
  assert.deepEqual(idx.truncatedPages,[1]);
  const v=selectBookEvidence(idx,'Протокол редот на предимство',{mode:'overview'});
  assert.ok(v.evidence.reduce((n,e)=>n+e.text.length,0)<=BOOK_LIMITS.maxPayloadChars);
  assert.ok(v.evidence.every(e=>e.text.length<=BOOK_LIMITS.maxExcerptChars));
});
console.log('Book evidence retrieval and provenance tests registered');
