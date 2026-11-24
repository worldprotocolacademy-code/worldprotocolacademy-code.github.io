'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Core=require('../tools/assets/eu-factory-core-v5.js');
const Wizard=require('../tools/assets/eu-factory-easy-wizard-v9.js');
const registry=require('../data/eu-application-factory/opportunities-v1.json');

const farmer=Core.parseProject({
  projectCategory:'farm',
  idea:'Одгледувам зеленчук во Струмица и сакам да поставам систем за наводнување.'
});
assert.equal(farmer.id,'agriculture');
assert.match(farmer.title,/^Одгледувам зеленчук/);
assert.doesNotMatch(farmer.title,/Област:/);
assert.equal(farmer.knownBudgetEUR,null);
assert.deepEqual(farmer.evidence,[]);
assert.equal(farmer.startDate,'');
assert.doesNotMatch(JSON.stringify(farmer),/Inex|Olgica|17604|150-person/);

const genericOhrid=Core.parseProject({
  projectCategory:'conference',
  idea:'Организирам конференција за образование во Охрид за 70 учесници.'
});
assert.equal(genericOhrid.id,'conference');
assert.equal(genericOhrid.knownBudgetEUR,null);
assert.equal(genericOhrid.startDate,'');
assert.deepEqual(genericOhrid.evidence,[]);
assert.doesNotMatch(JSON.stringify(genericOhrid),/Inex|Olgica|17604|150-person|March-May 2027/);
assert.doesNotMatch(Core.objective(genericOhrid),/во Охрид/);

const wpa=Core.parseProject({
  idea:'Ohrid Protocol Conference 2027: конференција за протокол во Охрид',
  portfolioTemplateId:'wpa-ohrid-2027'
});
assert.equal(wpa.knownBudgetEUR,17604.8);
assert.ok(wpa.evidence.every(e=>e.status==='WPA_DEMO_SNAPSHOT_UNVERIFIED'));

const prompt=Core.parseProject({
  idea:'Ohrid Protocol Conference 2027: вистинска потреба. Дај ми соодветни извори и изгради апликациско досие.'
});
assert.doesNotMatch(prompt.idea,/Дај ми соодветни извори/);
assert.doesNotMatch(prompt.title,/Дај ми соодветни извори/);
assert.equal(prompt.knownBudgetEUR,null);
const promptAnalysis=Core.analyze(prompt,registry,'2026-11-24');
const promptDossier=Core.createDossier(promptAnalysis,promptAnalysis.candidates[0].opportunity.id);
assert.doesNotMatch(promptDossier.markdown,/Дај ми соодветни извори/);

assert.equal(Core.localToday(new Date('2026-11-23T23:30:00Z')),'2026-11-24');
assert.equal(Core.localToday(new Date('2026-07-01T22:30:00Z')),'2026-07-02');
const imreg=registry.opportunities.find(x=>x.id==='imreg-2026-infome');
const afterDeadline=Core.checkRoute(farmer,imreg,'2027-01-14');
assert.ok(afterDeadline.blockers.some(x=>/Крајниот рок поминал/.test(x)));
assert.equal(Core.snapshotAgeDays('2026-11-15','2026-11-24'),9);
assert.equal(Core.analyze(farmer,registry,'2026-11-24').sourceSnapshotStale,true);

const packagedIdea=Wizard.makeIdea({
  category:'farm',idea:'Сакам систем за наводнување за мојата фарма.',
  applicant:'farm',currency:'MKD',budget:''
});
const sanitized=Core.parseProject({idea:packagedIdea});
assert.equal(sanitized.title,'Сакам систем за наводнување за мојата фарма.');
assert.match(sanitized.idea,/Сакам систем/);
assert.doesNotMatch(sanitized.idea,/Област:/);
assert.doesNotMatch(sanitized.idea,/Проценет буџет/);

const ui=fs.readFileSync(path.join(__dirname,'../tools/assets/eu-factory-ui-v5.js'),'utf8');
assert.match(ui,/sourceSnapshotStale/);
assert.match(ui,/Core\.localToday\(\)/);
assert.match(ui,/portfolioTemplateId/);
assert.doesNotMatch(ui,/Дај ми соодветни извори и изгради апликациско досие\./);
console.log('EU Factory public truth gates: PASS');
