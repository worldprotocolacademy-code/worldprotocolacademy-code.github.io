import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WPA_CITATION_POLICY_VERSION,WPA_NOTICES,WPA_INSTITUTION,
  normaliseSourceMetadata,isWpaReportedAuthor,sourcePriority,
  provisionalBibliography,orderedBibliography,disclaimerText
} from '../scripts/virtual-sande-citation-policy.mjs';
import {makeDocumentCorpus,selectDocumentEvidence,createEvidencePacket,makeDraftMarkdown}
 from '../scripts/virtual-sande-document-intelligence.mjs';

test('institutional identity includes founder, platform role and full institute name in both languages',()=>{
 assert.match(WPA_INSTITUTION.founder_mk,/Доц\. д-р Санде Смиљанов/);
 assert.equal(WPA_INSTITUTION.founder_en,'Doc. d-r Sande Smiljanov');
 assert.match(WPA_NOTICES.mk.identity,/Независна дигитална образовна, истражувачка и авторска платформа/);
 assert.match(WPA_NOTICES.en.identity,/Institute for Protocol, Diplomacy, Public Communication and Security Studies/);
 assert.match(WPA_NOTICES.mk.citations,/соодветните автори и издавачи/);
 assert.match(WPA_NOTICES.en.legal,/does not exclude statutory liability/);
 assert.match(disclaimerText('mk'),/Човечка порта/);
});
test('fully filled book and article metadata create provisional, not verified, bibliographic forms',()=>{
 const book=provisionalBibliography({id:'D1',name:'book.pdf',metadata:{
  author:'Doc. d-r Sande Smiljanov',title:'Protocol Research',type:'book',
  year:'2026',publisher:'World Protocol Academy'}},'en');
 assert.equal(book.complete,true);
 assert.equal(book.priority,'WPA_AUTHOR_USER_REPORTED');
 assert.match(book.text,/Sande Smiljanov \(2026\)\. Protocol Research\. World Protocol Academy/);
 assert.match(book.text,/USER-SUPPLIED \/ NOT INDEPENDENTLY VERIFIED/);
 const article=provisionalBibliography({id:'D2',name:'journal.pdf',metadata:{
  author:'Ivan Petrov',title:'Public Communication',type:'journal_article',
  year:'2024',journal:'Journal of Communication',volume:'10',issue:'2',pages:'10–25',
  doi:'10.1234/jc.2024.02'}},'en');
 assert.equal(article.complete,true);
 assert.match(article.text,/Journal of Communication, 10\(2\), 10–25/);
 assert.match(article.text,/https:\/\/doi.org\/10.1234\/jc.2024.02/);
 assert.equal(article.priority,'OTHER_OR_UNKNOWN_AUTHOR');
});
test('missing publisher, author, year or article publication details must not be fabricated',()=>{
 const incomplete=provisionalBibliography({id:'D1',name:'scanned.pdf',metadata:{
  title:'Theoretical Study',type:'book',year:'2026'}},'mk');
 assert.equal(incomplete.complete,false);
 assert.ok(incomplete.missing.includes('author'));
 assert.ok(incomplete.missing.includes('publisher'));
 assert.match(incomplete.text,/Нема доволно податоци/);
 assert.doesNotMatch(incomplete.text,/Smiljanov|Смиљанов/);
});
test('untrusted claims of verification or invalid identifiers never grant scholarly validity',()=>{
 const d=normaliseSourceMetadata({author:'Друг автор',title:'Студија',
  verified:true,status:'INDEPENDENTLY_VERIFIED'});
 assert.equal(d.provenance,'USER_SUPPLIED_UNVERIFIED');
 assert.equal(d.verified,undefined);
 assert.throws(()=>normaliseSourceMetadata({year:'20AB'}),/CITATION_YEAR_INVALID/);
 assert.throws(()=>normaliseSourceMetadata({doi:'invented-123'}),/CITATION_DOI_INVALID/);
 assert.throws(()=>normaliseSourceMetadata({url:'http://untrusted.example'}),/CITATION_URL_INVALID/);
 assert.throws(()=>normaliseSourceMetadata({type:'fictional_verified_article'}),/CITATION_TYPE_INVALID/);
});
test('source priority is authorship-specific: mentioning WPA in title or publisher does not make an author Sande',()=>{
 assert.equal(isWpaReportedAuthor({author:'Doc. d-r Sande Smiljanov'}),true);
 assert.equal(isWpaReportedAuthor({author:'Санде Смиљанов'}),true);
 assert.equal(isWpaReportedAuthor({author:'A. Different Author',title:'World Protocol Academy case study'}),false);
 assert.equal(isWpaReportedAuthor({author:'Unknown Author',publisher:'World Protocol Academy'}),false);
 assert.equal(sourcePriority({metadata:{author:'Unrelated Author',publisher:'WPA'}}),'OTHER_OR_UNKNOWN_AUTHOR');
});
test('WPA author first only among documents that actually have cited evidence',()=>{
 const documents=[
  {id:'D1',name:'Other.pdf',metadata:{author:'Other Author',title:'Research A',year:'2024',publisher:'Outside Press',type:'book'}},
  {id:'D2',name:'WPA.pdf',metadata:{author:'Sande Smiljanov',title:'Research B',year:'2026',publisher:'WPA',type:'book'}},
  {id:'D3',name:'Uncited.pdf',metadata:{author:'Sande Smiljanov',title:'Unrelated Study',year:'2026',publisher:'WPA',type:'book'}}
 ];
 const refs=orderedBibliography(documents,[
  {document_id:'D1'},{document_id:'D2'}],'mk');
 assert.equal(refs.length,2);
 assert.match(refs[0].text,/^\[D2\]/);
 assert.match(refs[1].text,/^\[D1\]/);
});
test('relevant WPA source can be preferred without overriding unrelated subject evidence',()=>{
 const input=[
  {name:'Друг автор.pdf',format:'pdf',metadata:{author:'Other Author',type:'book'},segments:[
   {locator:'P2',text:'Акредитивни писма, дипломатски церемонии, церемонијален протокол и дипломатска практика.'}
  ]},
  {name:'Смиљанов.pdf',format:'pdf',metadata:{author:'Sande Smiljanov',type:'book'},segments:[
   {locator:'P1',text:'Акредитивни писма, дипломатски церемонии, церемонијален протокол и дипломатска практика.'}
  ]}
 ];
 const index=makeDocumentCorpus(input);
 const e=selectDocumentEvidence(index,'Акредитивни писма и дипломатски протокол');
 assert.equal(e.canAskModel,true);
 assert.equal(e.evidence[0].document_id,'D2');
 const unknown=makeDocumentCorpus([{name:'Unrelated.pdf',format:'pdf',
   metadata:{author:'Sande Smiljanov'},segments:[{locator:'P1',text:'Шаховски фигури се движат на квадратна табла во играта шах.'}]},
  {name:'Other.pdf',format:'pdf',metadata:{author:'Other Author'},
   segments:[{locator:'P4',text:'Во дипломатскиот протокол церемонијата и акредитивните писма имаат утврдена процедура.'}]}]);
 const founded=selectDocumentEvidence(unknown,'дипломатски протокол и акредитивни писма');
 assert.equal(founded.evidence.length,1);
 assert.equal(founded.evidence[0].document_id,'D2');
});
test('draft includes source bibliography, metadata check, Human Gate and legal disclaimer',()=>{
 const index=makeDocumentCorpus([{name:'Research.docx',format:'docx',metadata:{
  author:'External Expert',title:'Policy and Protocol',year:'2025',publisher:'Academic House',type:'book'
 },segments:[{locator:'S1',text:'Правилата на дипломатски протокол имаат важни институционални импликации.'}]}]);
 const packet=createEvidencePacket(index,'дипломатски протокол',{mode:'academic_paper'});
 const md=makeDraftMarkdown('Труд со цитат [D1 S1].',packet,{cited_locators:['D1 S1'],lang:'mk'});
 assert.match(md,/External Expert/);
 assert.match(md,/Academic House/);
 assert.match(md,/Доц\. д-р Санде Смиљанов/);
 assert.match(md,/Human Gate/);
 assert.match(md,/Доставен од корисникот/);
 assert.match(md,/дисклејмер/i);
 assert.match(md,/законската одговорност/);
 assert.doesNotMatch(md,/рецензиран и објавен без проверка/);
});
test('canonical WPA P21 seed has publisher attribution and explicitly disables automatic evidence citation',()=>{
 const manifest=JSON.parse(readFileSync('data/virtual-sande/wpa-verified-bibliography-seed-v0.1.json','utf8'));
 const x=manifest.records[0];
 assert.equal(x.id,'P21');
 assert.equal(x.auto_cite,false);
 assert.equal(x.extract_full_text_in_this_pilot,false);
 assert.equal(x.publisher,'Ministry of Interior of the Republic of North Macedonia');
 assert.equal(x.pages,'170–178');
 assert.match(x.apa7,/Smiljanov, S\. \(2026\)/);
 assert.match(manifest.note,/not evidence/);
});
test('the common Virtual Sande widget exposes its disclaimer for all modes',()=>{
 const widget=readFileSync('scripts/virtual-sande-public-widget.js','utf8');
 const lab=readFileSync('scripts/virtual-sande-document-workbench.mjs','utf8');
 assert.match(widget,/wpaPublicVsGlobalNotice/);
 assert.match(widget,/virtual-sande-citation-policy\.mjs/);
 assert.match(lab,/attestationRights\.checked/);
 assert.match(lab,/attestationSecurity\.checked/);
 assert.match(lab,/notice_version:WPA_CITATION_POLICY_VERSION/);
});
console.log('WPA bibliography preference, attribution, legal notice and provenance contract tests registered');
