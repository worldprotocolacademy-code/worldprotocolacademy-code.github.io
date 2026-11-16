'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const product=fs.readFileSync(path.join(root,'tools/product-factory.html'),'utf8');
const guide=fs.readFileSync(path.join(root,'tools/product-factory-guide.html'),'utf8');
const youth=fs.readFileSync(path.join(root,'tools/assets/wpa-product-factory-young-innovators-v1.js'),'utf8');
const eu=fs.readFileSync(path.join(root,'tools/eu-application-factory.html'),'utf8');
const engines=fs.readFileSync(path.join(root,'tools/wpa-five-engines.html'),'utf8');
const sections=['guide','young-innovators','vessels','autopilot','magic','protocol','factory','outputs','radar','eu-application-factory','ai-grant-lab','services','toolfactory','eu-form-assistant'];

for(const id of sections)test('Retains product section '+id,()=>assert.match(product,new RegExp('id="'+id+'"')));
for(const id of ['generateBtn','exportMdBtn','exportJsonBtn','rdRss','euafRun','tfGen','ofGen','eufaBuild','gateGrid'])
 test('Preserves existing interactive control '+id,()=>assert.match(product,new RegExp('id="'+id+'"')));
for(const id of ['study','heritage','access','eco','media','campaign'])
 test('Includes source Young Innovators idea '+id,()=>{
   assert.match(product,new RegExp('data-youth-idea="'+id+'"'));
   assert.match(youth,new RegExp('\\b'+id+':\\{'));
 });
for(const id of ['intro','input','modes','autopilot','magic','pp12','systems','examples','truth','youth','done','eu-link'])
 test('Includes official guide chapter '+id,()=>assert.match(guide,new RegExp('id="'+id+'"')));

test('All product HTML IDs are unique outside scripts',()=>{
 const markup=product.split(/<script(?:\s|>)/i)[0];
 const ids=[...markup.matchAll(/\bid="([a-zA-Z][\w:-]*)"/g)].map(x=>x[1]);
 const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
 assert.deepEqual(dup,[]);
});
test('Legacy Product Factory has no mandatory redirect to Virtual Sande for grant intake',()=>{
 assert.match(product,/eu-application-factory\.html\?v=9#easyWizard/);
 assert.match(product,/Овој постар вграден модул е зачуван како локална демонстрација/);
});
test('Guide + Product Factory link to dedicated v9 and each other',()=>{
 assert.match(guide,/product-factory\.html#young-innovators/);
 assert.match(guide,/eu-application-factory\.html\?v=9#easyWizard/);
 assert.match(product,/product-factory-guide\.html/);
});
test('Public boundary stays explicit and commerce is not activated',()=>{
 assert.match(product,/WPA јавна граница/);
 assert.match(product,/Services, memberships, certificates, payments and commercial offers remain in development/);
 assert.match(product,/Само необврзувачки|само необврзувачки/);
});
test('Keeps no unapproved model API, signatures or final grant submission',()=>{
 assert.doesNotMatch(youth,/API_KEY|Authorization:|window\.location\.assign\(/);
 assert.match(product,/Human Gate/);
});
test('Youth script parses in real JS engine',()=>assert.doesNotThrow(()=>new vm.Script(youth)));
test('All inline product scripts parse',()=>{
 const scripts=[...product.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
 assert.ok(scripts.length>=3);
 for(let i=0;i<scripts.length;i++)assert.doesNotThrow(()=>new vm.Script(scripts[i],{filename:'inline-'+i}));
});
test('Young module actually maps ideas to the v3.4 input fields',()=>{
 assert.match(youth,/document\.getElementById\(id\)/);
 assert.match(youth,/new Event\('input'/);
 assert.match(youth,/humanGate/);
});


// EU Commission direct-link invariant (no fake "live" feed, no broken intermediate route).
const officialCalls='https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals?isExactMatch=true';
const officialProjects='https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/projects-results?isExactMatch=true';
for(const [label,html] of [['Product Factory',product],['EU Factory v9',eu],['Official Guide',guide],['Five Engines index',engines]]){
 test(label+' has direct official Calls and EU-funded Projects links',()=>{
  assert.ok(html.includes('href="'+officialCalls+'"'),label+' missing calls link');
  assert.ok(html.includes('href="'+officialProjects+'"'),label+' missing project-results link');
  assert.match(html,/target="_blank" rel="noopener noreferrer"/);
 });
}
test('EU Factory keeps real v9 intake, not redirected to external portal',()=>{
 assert.match(eu,/id="easyWizard"/);
 assert.match(eu,/id="euOfficialSources"/);
 assert.match(eu,/id="expertMode"/);
 assert.match(eu,/id="findGrant"/);
});
test('Product Factory keeps PP-12, Young Innovators and dedicated grant entry',()=>{
 for(const id of ['protocol','young-innovators','eu-application-factory','factory'])
  assert.match(product,new RegExp('id="'+id+'"'));
 assert.match(product,/eu-application-factory\.html\?v=9#easyWizard/);
});
test('Portal link descriptions do not equate completed projects with open grants',()=>{
 assert.match(eu,/Финансирани проекти|ЕУ-финансирани проекти/i);
 assert.match(eu,/Open for submission/);
 assert.match(guide,/веќе финансирани проекти/);
});
