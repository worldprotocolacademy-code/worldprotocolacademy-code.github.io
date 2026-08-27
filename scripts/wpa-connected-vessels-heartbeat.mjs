#!/usr/bin/env node
import { readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const now = new Date().toISOString();

const files = {
  connected_vessels: 'data/wpa-connected-vessels-system.json',
  social_registry: 'data/wpa-social-network.json',
  social_queue: 'data/wpa-social-distribution-queue.json',
  dna_reuse: 'data/institute-index/institutional-dna-reuse-layer.json',
  hgaim: 'data/wpa-human-governed-agentic-institution-model.json',
  operating_architecture: 'data/wpa-institutional-operating-architecture.json'
};

async function load(rel) {
  const path = join(ROOT, rel);
  await access(path);
  return JSON.parse(await readFile(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const loaded = {};
  for (const [key, rel] of Object.entries(files)) loaded[key] = await load(rel);

  assert(loaded.connected_vessels.status === 'ACTIVE_GOVERNED_ARCHITECTURE_24_7_READY', 'Connected Vessels status mismatch');
  assert(loaded.connected_vessels.social_integration?.registry === '/data/wpa-social-network.json', 'Social registry route mismatch');
  assert(loaded.connected_vessels.social_integration?.distribution_queue === '/data/wpa-social-distribution-queue.json', 'Social queue route mismatch');
  assert(loaded.social_registry.connected_vessels_reference === '/data/wpa-connected-vessels-system.json', 'Social registry not linked back to Connected Vessels');
  assert(loaded.social_registry.distribution_queue_reference === '/data/wpa-social-distribution-queue.json', 'Social distribution queue missing from registry');
  assert(loaded.social_registry.governance?.automatic_posting === false, 'Automatic social posting must remain false until authorised adapters are verified');
  assert(loaded.social_registry.governance?.human_review_required === true, 'Human review must remain required');
  assert(loaded.social_queue.human_gate_rule, 'Social queue Human Gate rule missing');
  assert(loaded.dna_reuse.connected_vessels_principle || loaded.dna_reuse.principle, 'Institutional DNA reuse layer missing principle');

  const activeChannels = Object.entries(loaded.social_registry.channels || {})
    .filter(([, c]) => c.status === 'ACTIVE_OFFICIAL_CHANNEL')
    .map(([id]) => id);
  const plannedChannels = Object.entries(loaded.social_registry.channels || {})
    .filter(([, c]) => c.status === 'PLANNED')
    .map(([id]) => id);

  const health = {
    schema: 'wpa-connected-vessels-health/1.0',
    generated_at: now,
    status: 'PASS',
    heartbeat_frequency: 'hourly',
    architecture_status: loaded.connected_vessels.status,
    active_official_social_channels: activeChannels,
    planned_social_channels: plannedChannels,
    social_automatic_posting: false,
    social_platform_api_adapters: loaded.connected_vessels.runtime?.social_platform_api_adapters || 'NOT_CONNECTED_IN_CURRENT_REPOSITORY',
    human_gate_required_for_consequential_release: true,
    checked_files: files,
    invariants: [
      'Connected Vessels manifest is readable and linked to Social Bridge and distribution queue.',
      'Social automatic posting remains disabled without verified official platform adapters.',
      'Human Gate remains required for consequential public communication.',
      'Institutional DNA reuse layer remains present in the connected architecture.',
      '24/7-ready means scheduled monitoring, validation and queueing; it does not claim continuous autonomous execution of every agent or platform.'
    ]
  };

  await writeFile(join(ROOT, 'data/wpa-connected-vessels-health.json'), JSON.stringify(health, null, 2) + '\n', 'utf8');
  console.log(`[WPA] Connected Vessels heartbeat PASS @ ${now}`);
  console.log(`[WPA] Active social channels: ${activeChannels.join(', ')}`);
  console.log(`[WPA] Planned social channels: ${plannedChannels.join(', ')}`);
}

main().catch(err => {
  console.error('[WPA] Connected Vessels heartbeat FAIL:', err.message);
  process.exit(1);
});
