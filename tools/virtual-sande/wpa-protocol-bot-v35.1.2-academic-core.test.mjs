import test from 'node:test';
import assert from 'node:assert/strict';
import { academicIntent, academicPayload, __academicTest } from './wpa-protocol-bot-v35.1.2-academic-core.mjs';

const definitions = [
  ['Што е протокол?','protocol'],['Што е дипломатија?','diplomacy'],['Што е дипломатски протокол?','diplomatic_protocol'],
  ['Што е државен протокол?','state_protocol'],['Што е церемонијал?','ceremonial'],['Што е пресеанс?','precedence'],
  ['Што е етикеција?','etiquette'],['Што е бон-тон?','bon_ton'],['Што е агреман?','agrement'],
  ['Што е егзекватура?','exequatur'],['Што е персона нон грата?','persona_non_grata'],['Што е дипломатски кор?','diplomatic_corps'],
  ['Што е дипломатска акредитација?','accreditation'],['Што се акредитивни писма?','credentials'],['Што е официјална посета?','official_visit'],
  ['Што е државна посета?','state_visit'],['Што е работна посета?','working_visit'],['Што е одбранбена дипломатија?','defence_diplomacy'],
  ['Што е воена дипломатија?','military_diplomacy'],['Што е Протоколометрија?','protocolometry'],
];
for (const [question,id] of definitions) test(`definition ${id}`,()=>assert.equal(academicIntent(question,'mk')?.id,id));

test('English academic definition',()=>{const x=academicIntent('What is agrément?','en');assert.equal(x.id,'agrement');assert.equal(academicPayload(x).answerLang,'en');});
test('Article 4 legal anchor',()=>{const p=academicPayload(academicIntent('Што е агреман?','mk'));assert.equal(p.sourceDetails[1].article,'Article 4');assert.match(p.sourceDetails[1].url,/legal\.un\.org/);});
test('Article 9 legal anchor',()=>assert.equal(academicPayload(academicIntent('Што е персона нон грата?','mk')).sourceDetails[1].article,'Article 9'));
test('Article 12 legal anchor',()=>assert.equal(academicPayload(academicIntent('Што е егзекватура?','mk')).sourceDetails[1].article,'Article 12'));
test('protocol and diplomacy comparison',()=>assert.equal(academicIntent('Која е разликата меѓу протокол и дипломатија?','mk')?.id,'protocol_diplomacy'));
test('defence and military diplomacy comparison',()=>assert.equal(academicIntent('Спореди одбранбена дипломатија и воена дипломатија','mk')?.id,'defence_military_diplomacy'));
test('visit types comparison',()=>assert.equal(academicIntent('Која е разликата меѓу државна, официјална и работна посета?','mk')?.id,'visit_types'));
test('complex procedure delegates',()=>assert.equal(academicIntent('Како се организира државна посета чекор по чекор?','mk'),null));
test('seating scenario delegates',()=>assert.equal(academicIntent('Дај пример за ред на седење на банкет','mk'),null));
test('unrelated question delegates',()=>assert.equal(academicIntent('Кој е главен град на Франција?','mk'),null));
test('all definitions have three-layer MK and EN structure',()=>{for(const item of Object.values(__academicTest.DEFINITIONS)){assert.equal(item.mk.length,3);assert.equal(item.en.length,3);}});
test('no nonstandard Macedonian phrase',()=>{for(const [q] of definitions)assert.doesNotMatch(academicPayload(academicIntent(q,'mk')).answer,/не\s+видам/i);});
test('no personal authorship claim',()=>{for(const [q] of definitions)assert.doesNotMatch(academicPayload(academicIntent(q,'mk')).answer,/мојата книга|јас напишав|според авторот/i);});
