#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const store=path.join(root,'data','wiie-runs','records');
const schema=JSON.parse(fs.readFileSync(path.join(root,'data','wpa-wiie-run-record.schema.json'),'utf8'));
const index=JSON.parse(fs.readFileSync(path.join(root,'data','wiie-runs','index.json'),'utf8'));
const baseline=JSON.parse(fs.readFileSync(path.join(root,'data','wpa-wiie-metrics-baseline.json'),'utf8'));
const errors=[];

function walk(dir){
  if(!fs.existsSync(dir))return[];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
function fail(file,msg){errors.push(`${path.relative(root,file)}: ${msg}`);}
function oneOfType(value,type){
  if(type==='null')return value===null;
  if(type==='array')return Array.isArray(value);
  if(type==='integer')return Number.isInteger(value);
  if(type==='number')return typeof value==='number'&&Number.isFinite(value);
  if(type==='object')return value!==null&&typeof value==='object'&&!Array.isArray(value);
  return typeof value===type;
}
function validateSimple(file,key,value,rule){
  if(rule.enum&&!rule.enum.includes(value))fail(file,`${key} not in enum`);
  if(rule.type){
    const types=Array.isArray(rule.type)?rule.type:[rule.type];
    if(!types.some(t=>oneOfType(value,t)))return fail(file,`${key} has invalid type`);
  }
  if(typeof value==='string'&&rule.minLength&&value.length<rule.minLength)fail(file,`${key} shorter than minimum`);
  if(typeof value==='number'&&rule.minimum!==undefined&&value<rule.minimum)fail(file,`${key} below minimum`);
  if(Array.isArray(value)&&rule.items?.type){
    for(const [i,item] of value.entries())if(!oneOfType(item,rule.items.type))fail(file,`${key}[${i}] has invalid type`);
  }
}
function isIso(x){return typeof x==='string'&&!Number.isNaN(Date.parse(x));}

const files=walk(store).filter(p=>/WIIE-\d{4}-\d{4}\.json$/.test(path.basename(p))).sort();
const records=[];
for(const file of files){
  let r;
  try{r=JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){fail(file,`invalid JSON: ${e.message}`);continue;}
  records.push({file,record:r});
  for(const req of schema.required||[])if(!(req in r))fail(file,`missing required field ${req}`);
  for(const key of Object.keys(r))if(!schema.properties[key])fail(file,`unknown field ${key}`);
  for(const [key,value] of Object.entries(r))if(schema.properties[key])validateSimple(file,key,value,schema.properties[key]);

  if(r.metric_eligibility){
    const keys=['effectiveness','time','activation','tooling','cost'];
    for(const k of keys)if(typeof r.metric_eligibility[k]!=='boolean')fail(file,`metric_eligibility.${k} must be boolean`);
    for(const k of Object.keys(r.metric_eligibility))if(!keys.includes(k))fail(file,`unknown metric_eligibility field ${k}`);
  }
  if(!isIso(r.started_at))fail(file,'started_at must be ISO date/time');
  if(r.finished_at!==null&&r.finished_at!==undefined&&!isIso(r.finished_at))fail(file,'finished_at must be ISO date/time or null');
  if(isIso(r.started_at)&&isIso(r.finished_at)&&Date.parse(r.finished_at)<Date.parse(r.started_at))fail(file,'finished_at precedes started_at');

  if(r.data_classification==='SENSITIVE_AUTHORISED')fail(file,'sensitive raw records are forbidden in the public canonical store');
  if(r.record_origin==='TEST')fail(file,'TEST records are forbidden in the real-run store');
  if(r.release_status==='CLOSED'&&r.verification_state!=='PASSED')fail(file,'CLOSED record must have verification_state PASSED');
  if(r.release_status==='CLOSED'&&!r.finished_at)fail(file,'CLOSED record must have finished_at');
  if(r.outcome_state==='SUCCESS'&&r.verification_state!=='PASSED')fail(file,'SUCCESS requires verification_state PASSED');
  if(r.implementation_state==='IMPLEMENTED'&&r.ai_protocol_gate_state!=='PASSED')fail(file,'IMPLEMENTED requires AI PROTOCOL Gate PASSED');
  if(['HG2','HG3','HG4'].includes(r.consequence_class)&&r.implementation_state==='IMPLEMENTED'&&r.human_gate_state!=='APPROVED')fail(file,'consequential IMPLEMENTED record requires Human Gate APPROVED');
  if(r.correction_required===true&&(!Array.isArray(r.learning_candidates)||r.learning_candidates.length===0))fail(file,'correction_required=true requires at least one learning candidate');
  if(r.metric_eligibility?.time===true&&r.elapsed_ms===null)fail(file,'time metric eligible but elapsed_ms is null');
  if(r.metric_eligibility?.tooling===true&&r.tool_calls===null)fail(file,'tooling metric eligible but tool_calls is null');
  if(r.metric_eligibility?.cost===true&&r.measured_cost===null)fail(file,'cost metric eligible but measured_cost is null');
  if(r.first_pass_verification===true&&r.verification_attempts!==null&&r.verification_attempts!==1)fail(file,'first_pass_verification=true conflicts with verification_attempts');
}

const listed=new Map((index.records||[]).map(x=>[x.run_id,x]));
const seen=new Set();
for(const {file,record:r} of records){
  if(seen.has(r.run_id))fail(file,`duplicate run_id ${r.run_id}`);
  seen.add(r.run_id);
  const item=listed.get(r.run_id);
  if(!item)fail(file,'missing from index');
  else {
    const expected='/'+path.relative(root,file).replaceAll(path.sep,'/');
    if(item.path!==expected)fail(file,`index path mismatch: ${item.path} != ${expected}`);
    for(const key of ['mission_profile','consequence_class','outcome_state','verification_state','correction_required'])if(item[key]!==r[key])fail(file,`index field ${key} does not match record`);
  }
}
for(const item of index.records||[])if(!seen.has(item.run_id))errors.push(`data/wiie-runs/index.json: indexed run ${item.run_id} has no record file`);
if(index.record_count!==records.length)errors.push(`data/wiie-runs/index.json: record_count ${index.record_count} != ${records.length}`);
if(records.length&&index.latest_run_id!==records.map(x=>x.record.run_id).sort().at(-1))errors.push('data/wiie-runs/index.json: latest_run_id mismatch');

const effectivenessCount=records.filter(x=>x.record.metric_eligibility?.effectiveness===true).length;
const timeCount=records.filter(x=>x.record.metric_eligibility?.time===true).length;
const activationCount=records.filter(x=>x.record.metric_eligibility?.activation===true).length;
const toolingCount=records.filter(x=>x.record.metric_eligibility?.tooling===true).length;
const costCount=records.filter(x=>x.record.metric_eligibility?.cost===true).length;
if(baseline.sample_size!==effectivenessCount)errors.push(`data/wpa-wiie-metrics-baseline.json: sample_size ${baseline.sample_size} != effectiveness-eligible records ${effectivenessCount}`);
for(const [k,v] of Object.entries({effectiveness:effectivenessCount,time_to_verified_result:timeCount,activation:activationCount,tooling:toolingCount,cost:costCount})){
  if(baseline.metric_sample_sizes?.[k]!==v)errors.push(`data/wpa-wiie-metrics-baseline.json: metric_sample_sizes.${k} mismatch`);
}

if(errors.length){
  console.error('WIIE real run-record validation: FAIL');
  errors.forEach((e,i)=>console.error(`${i+1}. ${e}`));
  process.exit(1);
}
console.log(`WIIE real run-record validation: PASS (${records.length} real record${records.length===1?'':'s'})`);
console.log(`Baseline eligibility: effectiveness=${effectivenessCount}, time=${timeCount}, activation=${activationCount}, tooling=${toolingCount}, cost=${costCount}`);
