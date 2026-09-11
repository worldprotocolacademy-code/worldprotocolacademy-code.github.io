const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const active = { records: [
  {id:'bn',name_mk:'Брунеј',capital_mk:'Бандар Сери Бегаван',population_display:'452,524',area_display:'5,765 km²',coordinates_display:'4.5353° N, 114.7277° E',resources_mk:'Нафта, природен гас',flag_summary_mk:'Размер 1:2. Жолто со дијагонали.',anthem_code:'bn',eagle_on_flag_note:null,instrumental_anthem:null,national_days:[]},
  {id:'at',name_mk:'Австрија',capital_mk:'Виена',population_display:'9,104,772',area_display:'83,879 km²',resources_mk:'Железна руда, нафта',flag_summary_mk:'Црвено-бело-црвено.',eagle_on_flag_note:'legacy descriptive eagle note',instrumental_anthem:null,national_days:[]},
  {id:'al',name_mk:'Албанија',capital_mk:'Тирана',population_display:'2,832,439',area_display:'28,748 km²',resources_mk:'Нафта, природен гас, хром, бакар',flag_summary_mk:'Црвено со црн двоглав орел.',eagle_on_flag_note:'Двоглав црн орел',instrumental_anthem:null,national_days:[]},
  {id:'es',name_mk:'Шпанија',capital_mk:'Мадрид',population_display:'48,000,000',area_display:'505,990 km²',resources_mk:'Јаглен',flag_summary_mk:'Црвено-жолто-црвено.',eagle_on_flag_note:null,instrumental_anthem:{name:'La Marcha Real'},national_days:[]},
  {id:'ly',name_mk:'Либија',capital_mk:'Триполи',population_display:'7,000,000',area_display:'1,759,540 km²',resources_mk:'Нафта',flag_summary_mk:'Црвено-црно-зелено.',eagle_on_flag_note:'Орел на пред-2011 знаме',instrumental_anthem:null,national_days:[]},
  {id:'fr',name_mk:'Франција',capital_mk:'Париз',population_display:'68,000,000',area_display:'551,695 km²',resources_mk:'Боксит',flag_summary_mk:'Сино-бело-црвено.',eagle_on_flag_note:null,instrumental_anthem:null,national_days:[]},
  {id:'au',name_mk:'Австралија',capital_mk:'Канбера',population_display:'27,000,000',area_display:'7,688,287 km²',resources_mk:'Бауксит',flag_summary_mk:'Сино знаме.',eagle_on_flag_note:null,instrumental_anthem:null,national_days:[]},
  {id:'is',name_mk:'Исланд',capital_mk:'Рејкјавик',population_display:'390,000',area_display:'103,000 km²',resources_mk:'Риба',flag_summary_mk:'Сино со крст.',eagle_on_flag_note:null,instrumental_anthem:null,national_days:[]},
  {id:'in',name_mk:'Индија',capital_mk:'Њу Делхи',population_display:'1,400,000,000',area_display:'3,287,263 km²',resources_mk:'Јаглен',flag_summary_mk:'Триколор.',eagle_on_flag_note:null,instrumental_anthem:null,national_days:[]},
  {id:'by',name_mk:'Белорусија',capital_mk:'Минск',population_display:'9,100,000',area_display:'207,600 km²',resources_mk:'Тресет',flag_summary_mk:'Црвено-зелено.',eagle_on_flag_note:null,instrumental_anthem:null,national_days:[]}
]};
while (active.records.length < 197) active.records.push({id:'z'+active.records.length,name_mk:'Dummy'+active.records.length});

const verified = { records: [
  {id:'AT',name_en:'Austria',aliases:['Austria'],capital_en:'Vienna',has_eagle_on_flag:false,anthem_officially_instrumental:false},
  {id:'AL',name_en:'Albania',aliases:['Albania'],capital_en:'Tirana',has_eagle_on_flag:true,anthem_officially_instrumental:false},
  {id:'ES',name_en:'Spain',aliases:['Spain'],capital_en:'Madrid',has_eagle_on_flag:false,anthem_officially_instrumental:true,anthem_title:'La Marcha Real'}
]};

const timeoutQueue = [];
const window = {
  WPA_CHAT_LANG: 'en',
  wpaBotAnswer: q => 'BASE:' + q,
  sendChat: function(){ return 'BASESEND'; }
};
const document = { getElementById: () => null, querySelector: () => null };
const context = {
  window, document, Intl, console,
  setTimeout: fn => { if (typeof fn === 'function') timeoutQueue.push(fn); return timeoutQueue.length; },
  clearTimeout: () => {},
  fetch: async url => ({ ok:true, json:async () => url.includes('active-runtime') ? active : verified })
};

vm.createContext(context);
vm.runInContext(fs.readFileSync('wpaws/protocol-symbols/wpa-symbols-oicp-hardening-v1.js','utf8'), context);

async function settleAsyncDatasetLoad(){
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
}

async function run(){
  await settleAsyncDatasetLoad();

  let ask = q => window.wpaBotAnswer(q);

  const bruneiCapital = ask('What is the capital of Brunei?');
  assert.match(bruneiCapital, /Brunei/);
  assert.doesNotMatch(bruneiCapital, /^BASE:/);
  assert.match(ask('What is the population of Brunei?'), /452,524/);
  assert.match(ask('Give me the full country profile of Brunei.'), /Country \/ entity: Brunei/);

  const bruneiDay = ask('What is the national day of Brunei?');
  assert.doesNotMatch(bruneiDay, /^BASE:/);
  assert.match(bruneiDay, /No active national-day record/i);

  const eagleList = ask('Which countries have an eagle on the flag?');
  assert.match(eagleList, /Albania/);
  assert.doesNotMatch(eagleList, /Austria/);
  assert.doesNotMatch(eagleList, /Libya/);

  const austria = ask('Does Austria have an eagle on the flag?');
  assert.match(austria, /Eagle on the national flag: no/);
  assert.match(austria, /Verified boolean has precedence/);

  const libya = ask('Does Libya have an eagle on the flag?');
  assert.match(libya, /not verified in the controlled overlay/i);
  assert.doesNotMatch(libya, /Eagle on the national flag: yes/i);

  const oil = ask('Which countries list oil as a natural resource?');
  assert.match(oil, /Brunei/);
  assert.match(oil, /Albania/);

  const naturalGas = ask('Which countries have natural gas in their resources?');
  assert.match(naturalGas, /Brunei/);
  assert.match(naturalGas, /Albania/);

  const bauxite = ask('Which countries list bauxite as a resource?');
  assert.match(bauxite, /France/);
  assert.match(bauxite, /Australia/);

  const anthem = ask('Which anthems are officially instrumental or textless?');
  assert.match(anthem, /Spain/);

  // Raw two-letter ISO-like words must not hijack ordinary English questions.
  assert.equal(ask('What is the capital?'), 'BASE:What is the capital?');
  const largest = ask('What is the largest country in the world by area?');
  assert.match(largest, /^📐 Largest countries\/entities by area/);
  assert.match(largest, /Australia — 7,688,287/);
  assert.doesNotMatch(largest, /^📐 Belarus/);

  // Explicit ISO/code syntax remains supported.
  assert.match(ask('ISO BN capital'), /Brunei/);

  // Simulate a specialist layer wrapping after the first hardening install and
  // then let the hardening retry run. Unsupported questions must reach base once,
  // not recurse between wrappers.
  const firstHardening = window.wpaBotAnswer;
  window.wpaBotAnswer = function(q){ return 'FOCUS:' + firstHardening(q); };
  while (timeoutQueue.length) timeoutQueue.shift()();
  ask = q => window.wpaBotAnswer(q);
  assert.equal(ask('Tell me a joke'), 'FOCUS:BASE:Tell me a joke');

  console.log('WPA Symbols OICP regression: PASS');
}

run().catch(err => { console.error(err); process.exit(1); });
