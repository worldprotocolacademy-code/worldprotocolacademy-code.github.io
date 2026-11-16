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
