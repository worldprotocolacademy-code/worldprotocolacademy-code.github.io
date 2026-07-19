#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = ['index.html', 'institute.html'];
const outDir = path.join(root, '.audit-output');
fs.mkdirSync(outDir, { recursive: true });

function uniq(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function attrValues(source, name) {
  const rx = new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'gi');
  const values = [];
  let match;
  while ((match = rx.exec(source))) values.push(match[1]);
  return uniq(values);
}

function tagCount(source, tag) {
  return (source.match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
}

function textMarkers(source) {
  const checks = {
    development_phase_2026: /development[\s\S]{0,80}(testing|test)[\s\S]{0,80}pilot[\s\S]{0,80}2026|развојна[\s\S]{0,80}тест[\s\S]{0,80}пробна[\s\S]{0,80}2026/i,
    independent_platform: /independent digital educational[\s\S]{0,120}research[\s\S]{0,120}authorial platform|независна дигитална образовна[\s\S]{0,120}истражувачка[\s\S]{0,120}авторска платформа/i,
    non_degree_boundary: /not a university|not a degree-granting|не е универзитет|не доделува академски степени/i,
    virtual_sande: /Virtual Sande|Виртуелен Санде/i,
    contact_email: /worldprotocolacademy@gmail\.com/i,
    founder_identity: /Санде Смиљанов|Sande Smiljanov/i,
    publication_25: />\s*25\s*</i,
    papers_19: />\s*19\s*</i,
    experience_25_plus: /25\+/i
  };
  return Object.fromEntries(Object.entries(checks).map(([key, rx]) => [key, rx.test(source)]));
}

function inventory(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing required page: ${file}`);
  const source = fs.readFileSync(full, 'utf8');
  const ids = attrValues(source, 'id');
  const hrefs = attrValues(source, 'href');
  const scripts = attrValues(source, 'src').filter(v => /\.js(?:[?#]|$)/i.test(v));
  const stylesheets = hrefs.filter(v => /\.css(?:[?#]|$)/i.test(v));
  const anchors = hrefs.filter(v => v.startsWith('#'));
  const routes = hrefs.filter(v => !v.startsWith('#') && !v.startsWith('mailto:') && !v.startsWith('tel:') && !/^javascript:/i.test(v));

  return {
    file,
    bytes: Buffer.byteLength(source),
    lines: source.split(/\r?\n/).length,
    counts: {
      sections: tagCount(source, 'section'),
      navs: tagCount(source, 'nav'),
      links: tagCount(source, 'a'),
      buttons: tagCount(source, 'button'),
      forms: tagCount(source, 'form'),
      inputs: tagCount(source, 'input'),
      selects: tagCount(source, 'select'),
      scripts: tagCount(source, 'script'),
      inline_styles: tagCount(source, 'style'),
      images: tagCount(source, 'img'),
      videos: tagCount(source, 'video'),
      audio: tagCount(source, 'audio'),
      iframes: tagCount(source, 'iframe'),
      ids: ids.length,
      anchors: anchors.length,
      routes: routes.length
    },
    ids,
    anchors: uniq(anchors),
    routes: uniq(routes),
    scripts: uniq(scripts),
    stylesheets: uniq(stylesheets),
    markers: textMarkers(source)
  };
}

const pages = targets.map(inventory);
const findings = [];
for (const page of pages) {
  if (!page.markers.development_phase_2026) findings.push(`${page.file}: development/test/pilot 2026 marker requires verification`);
  if (!page.markers.independent_platform) findings.push(`${page.file}: independent platform marker requires verification`);
  if (!page.markers.virtual_sande) findings.push(`${page.file}: Virtual Sande marker requires verification`);
  if (!page.markers.contact_email) findings.push(`${page.file}: contact email requires verification`);
}

const report = {
  schema: 'wpa-zero-loss-inventory-v1',
  generated_at: new Date().toISOString(),
  mode: 'baseline_non_blocking',
  pages,
  findings
};

fs.writeFileSync(path.join(outDir, 'wpa-zero-loss-inventory.json'), JSON.stringify(report, null, 2) + '\n');

const lines = ['# WPA + Institute Zero-Loss Inventory', '', `Generated: ${report.generated_at}`, '', 'Mode: baseline, non-blocking', ''];
for (const page of pages) {
  lines.push(`## ${page.file}`, '');
  lines.push(`- Lines: ${page.lines}`);
  lines.push(`- Sections: ${page.counts.sections}`);
  lines.push(`- Links: ${page.counts.links}`);
  lines.push(`- Buttons: ${page.counts.buttons}`);
  lines.push(`- Forms: ${page.counts.forms}`);
  lines.push(`- Scripts: ${page.counts.scripts}`);
  lines.push(`- Inline style blocks: ${page.counts.inline_styles}`);
  lines.push(`- IDs: ${page.counts.ids}`);
  lines.push(`- Routes: ${page.counts.routes}`);
  lines.push(`- Anchors: ${page.counts.anchors}`);
  lines.push('');
  lines.push('### Required markers');
  for (const [key, value] of Object.entries(page.markers)) lines.push(`- ${value ? 'PASS' : 'VERIFY'} — ${key}`);
  lines.push('');
  lines.push('### Scripts');
  for (const item of page.scripts) lines.push(`- KEEP — \`${item}\``);
  lines.push('');
  lines.push('### Stylesheets');
  for (const item of page.stylesheets) lines.push(`- KEEP — \`${item}\``);
  lines.push('');
  lines.push('### Routes');
  for (const item of page.routes) lines.push(`- VERIFY — \`${item}\``);
  lines.push('');
}
if (findings.length) {
  lines.push('## Findings requiring review', '');
  for (const finding of findings) lines.push(`- ${finding}`);
} else {
  lines.push('## Result', '', '- Baseline captured with no marker findings.');
}
fs.writeFileSync(path.join(outDir, 'wpa-zero-loss-inventory.md'), lines.join('\n') + '\n');

console.log(JSON.stringify({ pages: pages.map(p => ({ file: p.file, counts: p.counts })), findings }, null, 2));
