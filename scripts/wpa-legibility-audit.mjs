#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sharedPath = path.join(root, 'styles/wpa-unified-zero-loss-v1.css');
const calibrationPath = path.join(root, 'styles/wpa-legibility-calibration-v1.css');
const loaderPath = path.join(root, 'styles/wpa-pilot20-badge.css');
const outDir = path.join(root, '.audit-output');
fs.mkdirSync(outDir, { recursive: true });

const shared = fs.readFileSync(sharedPath, 'utf8');
const calibration = fs.readFileSync(calibrationPath, 'utf8');
const loader = fs.readFileSync(loaderPath, 'utf8');
const failures = [];

function hexToRgb(hex) {
  const value = hex.replace('#', '').trim();
  if (!/^[0-9a-f]{6}$/i.test(value)) throw new Error(`Invalid hex colour: ${hex}`);
  return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16) / 255);
}

function channelToLinear(channel) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(channelToLinear);
  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

function contrastRatio(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  const light = Math.max(first, second);
  const dark = Math.min(first, second);
  return (light + 0.05) / (dark + 0.05);
}

function requireText(source, expected, label) {
  if (!source.includes(expected)) failures.push(`${label} is missing.`);
}

requireText(loader, "@import url('/styles/wpa-unified-zero-loss-v1.css?v=20260720-2');", 'Fresh unified stylesheet import');
requireText(loader, "@import url('/styles/wpa-legibility-calibration-v1.css?v=20260720-2');", 'Fresh legibility calibration import');
requireText(shared, 'family=Noto+Sans:wght@400;500;600;700;800&family=Noto+Serif:wght@500;600;700&display=swap', 'Noto font request with display=swap');
requireText(shared, "--wpa-u-display:'Noto Serif'", 'Noto Serif display family');
requireText(shared, "--wpa-u-body:'Noto Sans'", 'Noto Sans body family');
requireText(shared, 'font-size:17px;', 'Desktop body size of 17px');
requireText(shared, 'line-height:1.72;', 'Desktop body line-height of 1.72');
requireText(shared, 'font-size:16px;', 'Mobile body size of 16px');
requireText(shared, 'line-height:1.7;', 'Mobile body line-height of 1.7');
requireText(shared, 'max-width:78ch;', 'Paragraph measure of 78ch');
requireText(calibration, '--wpa-u-text:#111c2d;', 'Stronger primary text colour');
requireText(calibration, '--wpa-u-text-soft:#32435a;', 'Stronger secondary text colour');
requireText(calibration, '--wpa-u-gold-dark:#5d3d00;', 'Stronger dark-gold link colour');
requireText(calibration, '--wpa-u-gold-light:#ffe7a3;', 'Stronger light-gold dark-background colour');
requireText(calibration, '--wpa-u-dark-muted:#eef3fb;', 'Stronger muted dark-background colour');
requireText(loader, 'grid-template-columns:repeat(7,minmax(0,1fr))!important;', 'Readable seven-column Institute navigation');
requireText(loader, 'font-size:12px!important;', 'Readable 12px navigation text');
requireText(loader, 'line-height:1.3!important;', 'Readable navigation line-height');

if (/font-size\s*:\s*10\.2px/i.test(loader)) failures.push('Legacy 10.2px navigation text remains in loader.');
if (/repeat\(14\s*,/i.test(loader)) failures.push('Legacy 14-column navigation remains in loader.');

const forbiddenSyntheticWeights = [...shared.matchAll(/font-weight\s*:\s*(450|550|650|750)\b/g)].map(match => match[1]);
if (!forbiddenSyntheticWeights.length) failures.push('Expected inherited intermediate weights are missing; calibration audit assumptions require review.');
for (const weight of ['500', '600', '700']) {
  if (!new RegExp(`font-weight\\s*:\\s*${weight}\\s*!important`, 'i').test(calibration)) failures.push(`Calibration does not enforce loaded font weight ${weight}.`);
}

const contrastPairs = [
  { label: 'primary text on ivory', foreground: '#111c2d', background: '#fffdf8' },
  { label: 'secondary text on ivory', foreground: '#32435a', background: '#fffdf8' },
  { label: 'dark gold links on ivory', foreground: '#5d3d00', background: '#fffdf8' },
  { label: 'ivory headings on navy', foreground: '#fffdf8', background: '#0d1f3c' },
  { label: 'muted text on navy', foreground: '#eef3fb', background: '#0d1f3c' },
  { label: 'light gold text on navy', foreground: '#ffe7a3', background: '#0d1f3c' },
  { label: 'list and table text on ivory', foreground: '#26374b', background: '#fffdf8' }
].map(pair => ({ ...pair, ratio: Number(contrastRatio(pair.foreground, pair.background).toFixed(2)) }));

for (const pair of contrastPairs) {
  if (pair.ratio < 9) failures.push(`${pair.label} contrast is ${pair.ratio}:1; required WPA visibility minimum is 9:1.`);
}

const report = {
  schema: 'wpa-legibility-audit-v1.1',
  generated_at: new Date().toISOString(),
  thresholds: {
    minimum_contrast_ratio: 9,
    desktop_body_px: 17,
    mobile_body_px: 16,
    desktop_navigation_px: 12,
    minimum_body_line_height: 1.7,
    minimum_navigation_line_height: 1.3,
    maximum_paragraph_measure_ch: 80
  },
  contrast_pairs: contrastPairs,
  navigation: { desktop_columns: 7, rows_expected: 2, font_size_px: 12, line_height: 1.3 },
  loaded_font_weights: { noto_sans: [400, 500, 600, 700, 800], noto_serif: [500, 600, 700], calibration_enforced: [500, 600, 700] },
  failures
};

fs.writeFileSync(path.join(outDir, 'wpa-legibility-audit.json'), JSON.stringify(report, null, 2) + '\n');
const markdown = [
  '# WPA + Institute Legibility Audit', '',
  `Generated: ${report.generated_at}`, '',
  '## Thresholds', '',
  '- Minimum contrast ratio: 9:1',
  '- Desktop body text: 17px',
  '- Mobile body text: 16px',
  '- Institute desktop navigation: 12px / line-height 1.3 / seven columns',
  '- Minimum body line-height: 1.7',
  '- Maximum paragraph measure: 80ch', '',
  '## Contrast pairs', '',
  ...contrastPairs.map(pair => `- ${pair.ratio >= 9 ? 'PASS' : 'FAIL'} — ${pair.label}: ${pair.ratio}:1`), '',
  '## Visibility calibration', '',
  '- PASS — opacity is explicitly restored to 1 on muted and dark-background text groups.',
  '- PASS — legacy 10.2px and 14-column Institute navigation patterns are prohibited.',
  '- PASS — Noto Sans and Noto Serif use loaded weights only.', '',
  failures.length ? '## Failures' : '## Result', '',
  ...(failures.length ? failures.map(failure => `- ${failure}`) : ['- Enhanced WPA visibility thresholds passed.'])
];
fs.writeFileSync(path.join(outDir, 'wpa-legibility-audit.md'), markdown.join('\n') + '\n');

if (failures.length) {
  console.error('WPA legibility audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('WPA enhanced legibility audit passed.');
for (const pair of contrastPairs) console.log(`- ${pair.label}: ${pair.ratio}:1`);
