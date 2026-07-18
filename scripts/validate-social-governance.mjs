#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const failures = [];
const requireRule = (condition, message) => { if (!condition) failures.push(message); };

const platforms = readJson('data/social/platform-registry.json');
const regions = readJson('data/social/region-registry.json');
const ai = readJson('data/social/ai-collaboration-registry.json');
const statuses = readJson('data/social/status-registry.json');

requireRule(platforms.mode === 'draft_only', 'Platform registry must remain draft_only.');
requireRule(platforms.primary_professional_channel === 'linkedin', 'LinkedIn must remain the primary professional channel.');
const prohibited = new Set(platforms.prohibited || []);
for (const required of ['purchased-followers','fake-engagement','mass-unsolicited-messaging','credential-exposure','unreviewed-auto-publishing']) {
  requireRule(prohibited.has(required), `Missing prohibited platform practice: ${required}`);
}

requireRule(regions.status === 'draft-only-human-review-required', 'Regional registry must require draft-only human review.');
requireRule(regions.home_region === 'balkans', 'Balkans must remain the WPA home region.');
requireRule(Array.isArray(regions.desks) && regions.desks.length === 8, 'Regional registry must contain exactly eight governed desks.');
const regionalRules = (regions.regional_rules || []).join(' ').toLowerCase();
requireRule(regionalRules.includes('no automatic publication'), 'Regional rules must prohibit automatic publication.');
requireRule(regionalRules.includes('sande gate'), 'Regional rules must require Sande Gate for sensitive content.');

requireRule(ai.council_name === 'WPA AI Editorial Council', 'AI council name mismatch.');
requireRule(ai.director_confirmed_count === 12, 'AI council must contain 12 director-confirmed systems.');
requireRule(Array.isArray(ai.systems) && ai.systems.length === 12, 'AI registry must list exactly 12 systems.');
const aiRules = (ai.rules || []).join(' ').toLowerCase();
requireRule(aiRules.includes('no ai system may publish directly'), 'AI rules must prohibit direct AI publication.');
requireRule(aiRules.includes('sande gate'), 'AI rules must require Sande Gate.');
requireRule(aiRules.includes('confidential') && aiRules.includes('classified'), 'AI rules must prohibit confidential and classified data.');

const statusIds = new Set((statuses.statuses || []).map((s) => s.id));
for (const required of ['detected','researched','drafted','translated','cultural_reviewed','source_checked','governance_checked','sande_approved','scheduled','published','corrected','withdrawn']) {
  requireRule(statusIds.has(required), `Missing governed status: ${required}`);
}
requireRule(statuses.default_status === 'detected', 'Default status must be detected.');
requireRule(statuses.terminal_public_status === 'published', 'Published must be the terminal public status.');

const pricing = fs.readFileSync(path.join(root, 'scripts/pricing-loader.js'), 'utf8').toLowerCase();
requireRule(pricing.includes('not_activated'), 'Pricing loader must remain not_activated.');
requireRule(!pricing.includes("fetch('/data/pricing-config.json"), 'Pricing loader must not fetch public pricing configuration.');

const safety = fs.readFileSync(path.join(root, 'scripts/wpa-public-safety-layer.js'), 'utf8').toLowerCase();
requireRule(safety.includes('no intelligence, surveillance, investigative or operational function'), 'Public safety layer must retain analytical safety boundary.');
requireRule(safety.includes('development') && safety.includes('not activated'), 'Public safety layer must retain development/not-activated boundary.');

if (failures.length) {
  console.error('WPA governance validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('WPA governance validation passed.');
console.log(`Platforms: ${platforms.platforms.length}`);
console.log(`Regional desks: ${regions.desks.length}`);
console.log(`AI systems: ${ai.systems.length}`);
console.log(`Governed statuses: ${statuses.statuses.length}`);
