#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];
const passed = [];
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const pass = (m) => passed.push(m);
const fail = (m) => failures.push(m);
const warn = (m) => warnings.push(m);
const assert = (ok, m) => ok ? pass(m) : fail(m);

const required = ['404.html','robots.txt','sitemap.xml','index.html','institute.html','student-desk/index.html','wpaws/index.html','.gitignore'];
for (const file of required) assert(exists(file), `required file exists: ${file}`);

const robots = read('robots.txt');
const sitemap = read('sitemap.xml');
const page404 = read('404.html');
const student = read('student-desk/index.html');
const wpaws = read('wpaws/index.html');

assert(/Sitemap:\s*https:\/\/worldprotocolacademy-code\.github\.io\/sitemap\.xml/i.test(robots), 'robots declares canonical sitemap');
assert(/User-agent:\s*\*/i.test(robots) && /Allow:\s*\//i.test(robots), 'robots keeps public site crawlable');
assert(!/\/student-desk\//i.test(sitemap), 'sitemap excludes Student Desk working tool');
assert(!/\/wpaws\//i.test(sitemap), 'sitemap excludes WPAWS working tool');
assert(!/404\.html/i.test(sitemap), 'sitemap excludes 404 page');
assert(/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(page404), '404 is noindex');
assert(/<main\b/i.test(page404) && /href=["']\/["']/i.test(page404), '404 has semantic main and home recovery link');
assert(/noindex/i.test(student) && /nofollow/i.test(student) && /noarchive/i.test(student), 'Student Desk has strict robots metadata');
assert(/noindex/i.test(wpaws) && /nofollow/i.test(wpaws) && /noarchive/i.test(wpaws), 'WPAWS has strict robots metadata');

const forbiddenSecretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /Bearer\s+[A-Za-z0-9._-]{24,}/g,
  /CLOUDFLARE_API_TOKEN\s*[=:]\s*["'][^"']+["']/g,
  /ANTHROPIC_API_KEY\s*[=:]\s*["'][^"']+["']/g,
  /OPENAI_API_KEY\s*[=:]\s*["'][^"']+["']/g,
];
for (const file of ['student-desk/index.html','student-desk/js/virtual-sande-desk.js','wpaws/index.html']) {
  const text = read(file);
  for (const pattern of forbiddenSecretPatterns) assert(!pattern.test(text), `no exposed secret pattern in ${file}`);
}

function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (['.git','node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out); else out.push(full);
  }
  return out;
}
const files = walk(root);
const pyArtifacts = files.filter(f => /(^|[\\/])__pycache__([\\/]|$)|\.py[co]$/i.test(f));
assert(pyArtifacts.length === 0, 'repository contains no Python bytecode artifacts');

const criticalPages = ['index.html','institute.html','404.html','student-desk/index.html','wpaws/index.html'];
for (const file of criticalPages) {
  const html = read(file);
  const h1 = (html.match(/<h1\b/gi) || []).length;
  if (h1 !== 1) warn(`${file}: expected one h1, found ${h1}`); else pass(`${file}: one h1`);
  const buttons = [...html.matchAll(/<button\b([^>]*)>/gi)];
  const missingType = buttons.filter(m => !/\btype\s*=/.test(m[1])).length;
  if (missingType) warn(`${file}: ${missingType} button(s) without explicit type`); else pass(`${file}: buttons have explicit type or none present`);
  const emptyLinks = (html.match(/<a\b[^>]*href=["'](?:\s*|#|javascript:void\(0\))["']/gi) || []).length;
  if (emptyLinks) warn(`${file}: ${emptyLinks} placeholder/empty link(s)`); else pass(`${file}: no empty placeholder links`);
  const images = [...html.matchAll(/<img\b([^>]*)>/gi)];
  if (images.length > 1) {
    const withoutLazy = images.slice(1).filter(m => !/loading=["']lazy["']/i.test(m[1])).length;
    if (withoutLazy) warn(`${file}: ${withoutLazy} non-primary image(s) without loading=lazy`); else pass(`${file}: non-primary images are lazy-loaded`);
  }
}

const report = {status: failures.length ? 'FAIL' : 'PASS', passed, warnings, failures};
fs.mkdirSync(path.join(root,'.audit-output'), {recursive:true});
fs.writeFileSync(path.join(root,'.audit-output','comprehensive-site-audit.json'), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if (failures.length) process.exit(1);
