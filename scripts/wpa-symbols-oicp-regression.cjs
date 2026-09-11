const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const active = { records: [
  {id:'bn',name_mk:'Брунеј',capital_mk:'Бандар Сери Бегаван',population_display:'452,524',area_display:'5,765 km²',coordinates_display:'4.5353° N, 114.7277° E',resources_mk:'Нафта, природен гас',flag_summary_mk:'Размер 1:2. Жолто со дијагонали.',anthem_code:'bn',eagle_on_flag_note:null,instrumental_anthem:null,national_days:[]},
  {id:'at',name_mk:'Австрија',capital_mk:'Виена',population_display:'9,104,772',area_display:'83,879 km²',resources_mk:'Железна руда, нафта',flag_summary_mk:'Црвено-бело-црвено.',eagle_on_flag_note:'legacy descriptive eagle note',instrumental_anthem:null,national_days:[]},
  {id:'al',name_mk:'Албанија',capital_mk:'Тирана',population_display:'2,832,439',area_display:'28,748 km²',resources_mk:'Нафта, природен гас, хром, бакар',flag_summary_mk:'Црвено со црн двоглав орел.',eagle_on_flag_note:'Двоглав црн орел',instrumental_anthem:null,national_days:[]},
  {id:'es',name_mk:'Шпанија',capital_mk:'Мадрид',population_display:'48,000,000',area_display:'505,990 km²',resources_mk:'Јаглен',flag_summary_mk:'Црвено-жолто-црвено.',eagle_on_flag_note:null,instrumental_anthem:{name:'La Marcha Real'},national_days:[]}
]};
while (active.records.length < 197) active.records.push({id:'z'+active.records.length,name_mk:'Dummy'+active.records.length});

const verified = { records: [
  {id:'AT',name_en:'Austria',aliases:['Austria'],capital_en:'Vienna',has_eagle_on_flag:false,anthem_officially_instrumental:false},
  {id:'AL',name_en:'Albania',aliases:['Albania'],capital_en:'Tirana',has_eagle_on_flag:true,anthem_officially_instrumental:false},
  {id:'ES',name_en:'Spain',aliases:['Spain'],capital_en:'Madrid',has_eagle_on_flag:false,anthem_officially_instrumental:true,anthem_title:'La Marcha Real'}
]};

const window = {
  WPA_CHAT_LANG: 'en',
  wpaBotAnswer: q => 'BASE:' + q,
  sendChat: function(){ return 'BASESEND'; }
};
const document = { getElementById: () => null, querySelector: () => null };
const context = {
  window, document, Intl, console,
  setTimeout: fn => { if (typeof fn === 'function') fn(); return 0; },
  clearTimeout: () => {},
  fetch: async url => ({ ok:true, json:async () => url.includes('active-runtime') ? active : verified })
};

vm.createContext(context);
vm.runInContext(fs.readFileSync('wpaws/protocol-symbols/wpa-symbols-oicp-hardening-v1.js','utf8'), context);

async function run(){
  await Promise.resolve();
  await Promise.resolve();

  const ask = q => window.wpaBotAnswer(q);

  assert.match(ask('What is the capital of Brunei?'), /Brunei/);
  assert.doesNotMatch(ask('What is the capital of Brunei?'), /^BASE:/);
  assert.match(ask('What is the population of Brunei?'), /452,524/);
  assert.match(ask('Give me the full country profile of Brunei.'), /Country \/ entity: Brunei/);

  const eagleList = ask('Which countries have an eagle on the flag?');
  assert.match(eagleList, /Albania/);
  assert.doesNotMatch(eagleList, /Austria/);

  const austria = ask('Does Austria have an eagle on the flag?');
  assert.match(austria, /Eagle on the national flag: no/);
  assert.match(austria, /Verified boolean has precedence/);

  const oil = ask('Which countries list oil as a natural resource?');
  assert.match(oil, /Brunei/);
  assert.match(oil, /Albania/);

  const anthem = ask('Which anthems are officially instrumental or textless?');
  assert.match(anthem, /Spain/);

  console.log('WPA Symbols OICP regression: PASS');
}

run().catch(err => { console.error(err); process.exit(1); });
