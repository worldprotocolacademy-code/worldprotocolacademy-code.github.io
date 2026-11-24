import test from 'node:test';
import assert from 'node:assert/strict';
import {anticipate} from '../scripts/virtual-sande-proactive-intent.mjs';

test('idle without text and conversation',()=>{
 assert.equal(anticipate().suggestions.length,0);
});
test('Macedonian protocol draft',()=>{
 const result=anticipate({draft:'Како се поставуваат знамињата?',lang:'mk'});
 assert.equal(result.topic,'protocol');
 assert.equal(result.stage,'draft');
 assert.equal(result.intent,'explain');
 assert.equal(result.suggestions.length,3);
 assert.equal(result.inference,'heuristic_not_confirmed');
});
test('Latin Macedonian research and evidence',()=>{
 const result=anticipate({draft:'proveri citati i izvori za trudot'});
 assert.equal(result.topic,'research');
 assert.equal(result.intent,'verify');
});
test('short follow-up inherits recent user topic, not assistant claims',()=>{
 const result=anticipate({draft:'а потоа?',history:[{role:'user',content:'Планирам дипломатска посета'},{role:'assistant',content:'AI research'}]});
 assert.equal(result.topic,'diplomacy');
 assert.equal(result.contextUsed,true);
});
test('explicit new topic overrides older context',()=>{
 const result=anticipate({draft:'Compare CSV documents',history:[{role:'user',content:'flag protocol'}],lang:'en'});
 assert.equal(result.topic,'document');
 assert.equal(result.intent,'compare');
 assert.equal(result.contextUsed,false);
 assert.equal(result.suggestions[0].label,'Comparison criteria');
});
test('document suggestions do not assert attachment access',()=>{
 const result=anticipate({draft:'PDF OCR',lang:'en'});
 assert.equal(result.topic,'document');
 assert.match(result.suggestions[0].prompt,/Do not claim to have read unavailable attachments/);
});
test('after answer, recommendations use latest confirmed user question',()=>{
 const result=anticipate({history:[{role:'user',content:'Explain the protocol for flags'},{role:'assistant',content:'Response'}],lang:'en'});
 assert.equal(result.stage,'followup');
 assert.equal(result.topic,'protocol');
});
test('ambiguous question yields general rather than invented intent',()=>{
 const result=anticipate({draft:'Help me',lang:'en'});
 assert.equal(result.topic,'general');
 assert.equal(result.intent,null);
});
test('clear resets context and does not predict from assistant-only messages',()=>{
 assert.equal(anticipate({history:[{role:'assistant',content:'diplomatic protocol'}]}).suggestions.length,0);
});
