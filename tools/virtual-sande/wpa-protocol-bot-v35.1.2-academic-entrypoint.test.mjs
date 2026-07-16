import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { API_VERSION, RESPONSE_CONTRACT, __test } from './wpa-protocol-bot-v35.1.2-academic-entrypoint.mjs';

async function ask(message,lang='mk',init={}){
  const response=await worker.fetch(new Request(`https://worker.example/ask?message=${encodeURIComponent(message)}&lang=${lang}`,init),{ALLOWED_ORIGINS:'https://worldprotocolacademy-code.github.io'});
  return {response,data:await response.json()};
}

test('academic definition intercepts before retrieval',async()=>{const {data}=await ask('Што е агреман?');assert.equal(data.version,API_VERSION);assert.equal(data.mode,'academic_core_definition');assert.equal(data.academicKey,'agrement');assert.equal(data.sourceDetails[1].article,'Article 4');});
test('academic comparison intercepts',async()=>{const {data}=await ask('Која е разликата меѓу протокол и дипломатија?');assert.equal(data.mode,'academic_core_comparison');assert.equal(data.academicKey,'protocol_diplomacy');});
test('greeting remains delegated and normalized',async()=>{const {response,data}=await ask('Здраво');assert.equal(data.mode,'greeting');assert.equal(data.version,'v35.1.2');assert.equal(response.headers.get('x-wpa-response-contract'),RESPONSE_CONTRACT);});
test('no-context metadata and language are normalized',()=>{const data=__test.normalizePayload({mode:'none',servedBy:'no-context',hasContext:true,sources:[],answer:'Не видам доволно контекст.'});assert.equal(data.hasContext,false);assert.match(data.answer,/не гледам/i);assert.doesNotMatch(data.answer,/не видам/i);});
test('health is explicit',async()=>{const response=await worker.fetch(new Request('https://worker.example/academic/health'),{});const data=await response.json();assert.equal(data.version,'v35.1.2');assert.equal(data.contract,'wpa-virtual-sande-response-v1.2');assert.equal(data.academicCore,'wpa-academic-core-v1.0');});
test('rejects unsupported method',async()=>{const {response}=await ask('Што е протокол?','mk',{method:'PUT'});assert.equal(response.status,405);});
test('rejects disallowed origin',async()=>{const {response}=await ask('Што е протокол?','mk',{headers:{Origin:'https://evil.example'}});assert.equal(response.status,403);});
test('rejects overlong message',async()=>{const {response}=await ask('x'.repeat(701));assert.equal(response.status,400);});
