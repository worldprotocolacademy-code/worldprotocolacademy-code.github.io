'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const B=require('../tools/assets/eu-factory-monetization-v1.js');
let n=0;
function test(name,fn){fn();n++;console.log('PASS '+name);}
const input={monthlyUnits:12,unitPriceEUR:75,variableCostEUR:10,fixedMonthlyEUR:500,setupCostEUR:1500};
test('module safe UMD exported',()=>assert.equal(typeof B.compute,'function'));
test('explicit assumptions are preserved',()=>assert.equal(B.compute(input).values.monthlyUnits,12));
test('annual gross is calculated correctly',()=>assert.equal(B.compute(input).scenarios[1].annualGrossEUR,10800));
test('annual net is 12x unit contribution less fixed less setup',()=>assert.equal(B.compute(input).scenarios[1].annualNetBeforeTaxEUR,1860));
test('downside scenario uses half units',()=>assert.equal(B.compute(input).scenarios[0].monthlyUnits,6));
test('optimistic scenario is labelled',()=>assert.equal(B.compute(input).scenarios[2].name,'HIGH'));
test('break-even 10 units/month',()=>assert.equal(B.compute(input).breakEvenMonthlyUnits,10));
test('zero revenue is not invented',()=>assert.equal(B.compute({}).scenarios[1].annualGrossEUR,0));
test('non-positive contribution never implies break-even',()=>assert.equal(B.compute({monthlyUnits:3,unitPriceEUR:10,variableCostEUR:11,fixedMonthlyEUR:5}).breakEvenMonthlyUnits,null));
test('negative values rejected',()=>assert.throws(()=>B.compute({unitPriceEUR:-1})));
test('unbounded input rejected',()=>assert.throws(()=>B.compute({monthlyUnits:100000000})));
test('NaN rejected',()=>assert.throws(()=>B.compute({unitPriceEUR:'abc'})));
test('journal separated from sponsorship editorial influence',()=>assert.ok(B.projectRoutes('journal',[]).options.some(x=>/editorial/i.test(x))));
test('media literacy routing',()=>assert.equal(B.projectRoutes('general',['media_literacy']).kind,'media'));
test('conference opportunities distinct',()=>assert.equal(B.projectRoutes('conference',[]).kind,'conference'));
test('grant funding separate from commercial sales',()=>assert.match(B.compute(input).grantSeparation,/NOT_AUTOMATIC_RECURRING_SALES/));
test('payments remain blocked',()=>assert.match(B.compute(input).actionGate,/NO_PAYMENT/));
test('MD report contains explicit legal caveat',()=>assert.match(B.viewReport(B.compute(input),B.projectRoutes('journal',[]),'WPA Journal'),/No price, offer, invoice/));
test('browser never sends credentials to providers',()=>{
 const s=fs.readFileSync(require('node:path').join(__dirname,'../tools/assets/eu-factory-monetization-v1.js'),'utf8');
 assert.ok(!/fetch\(|XMLHttpRequest|openWithPrompt/.test(s));
});
test('specialist frontend contains no direct model API calls',()=>{
 const s=fs.readFileSync(require('node:path').join(__dirname,'../tools/assets/eu-factory-mistral-v1.js'),'utf8');
 assert.ok(!/api\.mistral\.ai|Authorization:|openWithPrompt/.test(s));
});
console.log('MONETIZATION_TEST_PASS '+n+'/20');