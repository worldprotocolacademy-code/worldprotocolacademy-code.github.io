import test from 'node:test';
import assert from 'node:assert/strict';
import { routeStrategicPrompt, buildRefinementSystemPrompt, PROMPTS, COMMON_OUTPUT_CONTRACT, withStrategicPromptRouting, VERSION } from './wpa-strategic-prompt-router.mjs';

test('defines eight governed prompts',()=>{assert.equal(Object.keys(PROMPTS).length,8);assert.equal(COMMON_OUTPUT_CONTRACT.mk.length,8);assert.equal(COMMON_OUTPUT_CONTRACT.en.length,8);});

test('routes strategic leverage work to SP01',()=>{const r=routeStrategicPrompt('Направи стратегија со најголем leverage, opportunity cost и асиметрични можности',{lang:'mk'});assert.equal(r.selected,true);assert.equal(r.id,'SP01');});

test('routes accelerated learning to SP02',()=>{const r=routeStrategicPrompt('Сакам да научам нова тема со active recall, spaced repetition и 90 day learning plan',{lang:'mk'});assert.equal(r.id,'SP02');});

test('routes expert mastery to SP03',()=>{const r=routeStrategicPrompt('Обучи ме од почетник до експерт со менторска mastery патека и вештини',{lang:'mk'});assert.equal(r.id,'SP03');});

test('routes workflow improvement to SP04',()=>{const r=routeStrategicPrompt('Подобри го мојот workflow, focus, decision making и работни навики',{lang:'mk'});assert.equal(r.id,'SP04');});

test('routes sustainable life design to SP05',()=>{const r=routeStrategicPrompt('Направи life design со баланс, wellbeing, relationships и финансиска стабилност',{lang:'mk'});assert.equal(r.id,'SP05');});

test('routes time leverage to SP06',()=>{const r=routeStrategicPrompt('Забрзај го проектот со automation, delegating, parallel work, bottleneck и 80 20',{lang:'mk'});assert.equal(r.id,'SP06');});

test('routes professional self-development to SP07',()=>{const r=routeStrategicPrompt('Сакам најдобра верзија од себе во професионален развој, leadership, discipline и habits',{lang:'mk'});assert.equal(r.id,'SP07');});

test('routes major WPA mission to SP08',()=>{const r=routeStrategicPrompt('Направи сеопфатен WPA institutional architecture audit и OPN evidence package',{lang:'mk'});assert.equal(r.id,'SP08');assert.equal(r.reason,'major_wpa_mission');});

test('accepts explicit SP08 in user text',()=>{const r=routeStrategicPrompt('Користи SP08 за оваа задача',{lang:'mk'});assert.equal(r.selected,true);assert.equal(r.automatic,false);assert.equal(r.id,'SP08');assert.equal(r.reason,'explicit_prompt_selection');});

test('normalizes explicit SP8 alias to SP08',()=>{const r=routeStrategicPrompt('Користи SP8 за оваа задача',{lang:'mk'});assert.equal(r.selected,true);assert.equal(r.id,'SP08');});

test('normalizes promptId override to canonical ID',()=>{const r=routeStrategicPrompt('Тест',{lang:'mk',promptId:'sp8'});assert.equal(r.selected,true);assert.equal(r.id,'SP08');});

test('does not force an ordinary factual query through the strategic prompt library',()=>{const r=routeStrategicPrompt('Што е агреман?',{lang:'mk'});assert.equal(r.selected,false);assert.equal(r.id,null);});

test('refinement prompt preserves evidence and Human Gate boundaries',()=>{const r=routeStrategicPrompt('Забрзај го проектот со automation и bottleneck',{lang:'mk'});const s=buildRefinementSystemPrompt(r);assert.match(s,/Human Gate/);assert.match(s,/Не додавај факти/);assert.match(s,/10×/);});

test('wrapper exposes router health without touching base worker',async()=>{let calls=0;const base={fetch:async()=>{calls++;return new Response(JSON.stringify({ok:true,answer:'base',mode:'none'}),{headers:{'content-type':'application/json'}});}};const wrapped=withStrategicPromptRouting(base);const res=await wrapped.fetch(new Request('https://example.test/prompt-router/health'),{},{});const body=await res.json();assert.equal(body.ok,true);assert.equal(body.version,VERSION);assert.equal(body.prompts,8);assert.equal(calls,0);});

test('wrapper annotates routed responses and fails safe when AI refinement is unavailable',async()=>{const base={fetch:async()=>new Response(JSON.stringify({ok:true,answer:'base answer',mode:'delegate',sources:[]}),{headers:{'content-type':'application/json'}})};const wrapped=withStrategicPromptRouting(base);const res=await wrapped.fetch(new Request('https://example.test/ask?message='+encodeURIComponent('Забрзај го проектот со automation, parallel work и bottleneck')+'&lang=mk'),{WPA_PROMPT_ROUTING_MODE:'enhance'},{});const body=await res.json();assert.equal(body.strategic_prompt.id,'SP06');assert.equal(body.strategic_prompt.refinement_status,'routing_only');assert.equal(body.answer,'base answer');});
