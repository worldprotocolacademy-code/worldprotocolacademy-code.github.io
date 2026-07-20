#!/usr/bin/env node
import fs from 'node:fs';

const unifiedPath = 'styles/wpa-unified-zero-loss-v1.css';
const calibrationPath = 'styles/wpa-legibility-calibration-v1.css';
const loaderPath = 'styles/wpa-pilot20-badge.css';
const institutePath = 'institute.html';

const unified = fs.readFileSync(unifiedPath, 'utf8');
const calibration = fs.readFileSync(calibrationPath, 'utf8');
const loader = fs.readFileSync(loaderPath, 'utf8');
const institute = fs.readFileSync(institutePath, 'utf8');
const clean = unified.replace(/\/\*[\s\S]*?\*\//g, '');
const cleanCalibration = calibration.replace(/\/\*[\s\S]*?\*\//g, '');

const failures = [];
const requiredImports = [
  "@import url('/styles/wpa-unified-zero-loss-v1.css?v=20260720-2');",
  "@import url('/styles/wpa-legibility-calibration-v1.css?v=20260720-2');"
];

for (const requiredImport of requiredImports) {
  if (!loader.includes(requiredImport)) failures.push(`Approved stylesheet import missing: ${requiredImport}`);
}

const forbiddenDeclarations = [
  [/display\s*:\s*none\b/i, 'display:none'],
  [/visibility\s*:\s*hidden\b/i, 'visibility:hidden'],
  [/opacity\s*:\s*0(?:\D|$)/i, 'opacity:0'],
  [/content-visibility\s*:\s*hidden\b/i, 'content-visibility:hidden'],
  [/clip-path\s*:\s*inset\s*\(\s*100%/i, 'clip-path hiding'],
  [/(?:left|top)\s*:\s*-\d{4,}px/i, 'off-screen positioning']
];

for (const source of [clean, cleanCalibration]) {
  for (const [pattern, label] of forbiddenDeclarations) {
    if (pattern.test(source)) failures.push(`Forbidden hiding technique detected: ${label}.`);
  }
}

for (const source of [clean, cleanCalibration]) {
  const blocks = source.match(/[^{}]+\{[^{}]*\}/g) || [];
  for (const block of blocks) {
    const selector = block.slice(0, block.indexOf('{')).trim();
    if (!selector || selector.startsWith('@')) continue;
    const parts = selector.split(',').map(value => value.trim()).filter(Boolean);
    for (const part of parts) {
      const scoped = part.includes('html[data-wpa-page="index"]') || part.includes('html[data-wpa-page="institute"]');
      if (!scoped) failures.push(`Unscoped selector detected: ${part}`);
    }
  }
}

for (const scope of ['html[data-wpa-page="index"]', 'html[data-wpa-page="institute"]']) {
  if (!clean.includes(scope)) failures.push(`Required shared scope missing: ${scope}`);
  if (!cleanCalibration.includes(scope)) failures.push(`Required calibration scope missing: ${scope}`);
}

const criticalRoutes = ['intelligence-center.html', 'wpa-live-intelligence-feed.html'];
const criticalSurfaces = ['.topbar-quicklinks', '.nav-links', '.hero-cta'];
for (const route of criticalRoutes) {
  if (!institute.includes(`href="${route}"`)) failures.push(`Critical Institute route missing from HTML: ${route}`);
  for (const surface of criticalSurfaces) {
    const selector = `html[data-wpa-page="institute"] ${surface} a[href="${route}"]`;
    if (!clean.includes(selector)) failures.push(`Visible scoped override missing for ${route} in ${surface}.`);
  }
}

if (/font-size\s*:\s*10\.2px/i.test(loader)) failures.push('Legacy 10.2px Institute navigation size detected.');
if (/repeat\(14\s*,\s*minmax\(0\s*,\s*1fr\)\)/i.test(loader)) failures.push('Legacy 14-column Institute navigation layout detected.');
if (!/repeat\(7\s*,\s*minmax\(0\s*,\s*1fr\)\)/i.test(loader)) failures.push('Readable seven-column Institute navigation layout is missing.');
if (!/\.nav-links>a[\s\S]*?font-size\s*:\s*12px\s*!important/i.test(loader)) failures.push('Institute desktop navigation does not enforce 12px text.');
if (!/\.nav-links>a[\s\S]*?line-height\s*:\s*1\.3\s*!important/i.test(loader)) failures.push('Institute desktop navigation does not enforce 1.3 line-height.');

if (failures.length) {
  console.error('WPA zero-loss CSS safety check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('WPA zero-loss CSS safety check passed.');
console.log('- Approved imports present.');
console.log('- No hiding declarations detected in shared or calibration layers.');
console.log('- All selectors are scoped to WPA Home or Institute.');
console.log('- Critical Institute routes remain visible.');
console.log('- Institute navigation is seven columns, 12px and line-height 1.3.');
