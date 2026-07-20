#!/usr/bin/env node
import fs from 'node:fs';

const unifiedPath = 'styles/wpa-unified-zero-loss-v1.css';
const loaderPath = 'styles/wpa-pilot20-badge.css';
const institutePath = 'institute.html';

const unified = fs.readFileSync(unifiedPath, 'utf8');
const loader = fs.readFileSync(loaderPath, 'utf8');
const institute = fs.readFileSync(institutePath, 'utf8');
const clean = unified.replace(/\/\*[\s\S]*?\*\//g, '');

const failures = [];
const requiredImport = "@import url('/styles/wpa-unified-zero-loss-v1.css?v=20260719-1');";

if (!loader.includes(requiredImport)) {
  failures.push('Shared zero-loss stylesheet is not imported through the approved loader chain.');
}

const forbiddenDeclarations = [
  [/display\s*:\s*none\b/i, 'display:none'],
  [/visibility\s*:\s*hidden\b/i, 'visibility:hidden'],
  [/opacity\s*:\s*0(?:\D|$)/i, 'opacity:0'],
  [/content-visibility\s*:\s*hidden\b/i, 'content-visibility:hidden'],
  [/clip-path\s*:\s*inset\s*\(\s*100%/i, 'clip-path hiding'],
  [/(?:left|top)\s*:\s*-\d{4,}px/i, 'off-screen positioning']
];

for (const [pattern, label] of forbiddenDeclarations) {
  if (pattern.test(clean)) failures.push(`Forbidden hiding technique detected: ${label}.`);
}

const blocks = clean.match(/[^{}]+\{[^{}]*\}/g) || [];
for (const block of blocks) {
  const selector = block.slice(0, block.indexOf('{')).trim();
  if (!selector || selector.startsWith('@')) continue;
  const parts = selector.split(',').map(value => value.trim()).filter(Boolean);
  for (const part of parts) {
    const scoped = part.includes('html[data-wpa-page="index"]') || part.includes('html[data-wpa-page="institute"]');
    if (!scoped) failures.push(`Unscoped selector detected: ${part}`);
  }
}

const requiredScopes = [
  'html[data-wpa-page="index"]',
  'html[data-wpa-page="institute"]'
];
for (const scope of requiredScopes) {
  if (!clean.includes(scope)) failures.push(`Required scope missing: ${scope}`);
}

const criticalRoutes = [
  'intelligence-center.html',
  'wpa-live-intelligence-feed.html'
];
const criticalSurfaces = [
  '.topbar-quicklinks',
  '.nav-links',
  '.hero-cta'
];

for (const route of criticalRoutes) {
  if (!institute.includes(`href="${route}"`)) {
    failures.push(`Critical Institute route missing from HTML: ${route}`);
  }
  for (const surface of criticalSurfaces) {
    const selector = `html[data-wpa-page="institute"] ${surface} a[href="${route}"]`;
    if (!clean.includes(selector)) {
      failures.push(`Visible scoped override missing for ${route} in ${surface}.`);
    }
  }
}

if (failures.length) {
  console.error('WPA zero-loss CSS safety check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('WPA zero-loss CSS safety check passed.');
console.log('- Approved import present.');
console.log('- No hiding declarations detected in the shared layer.');
console.log('- All selectors are scoped to WPA Home or Institute.');
console.log('- Critical Institute routes exist and have visible scoped overrides.');
