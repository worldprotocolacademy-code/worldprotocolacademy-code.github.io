#!/usr/bin/env node
/*
 * WPA deterministic static translation builder.
 * Missing keys are fatal. No network access, machine translation or silent
 * source-language fallback is permitted.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function usage(code = 0) {
  const msg = `WPA static translation builder\n\n` +
    `Required:\n` +
    `  --source <html>      canonical source HTML\n` +
    `  --locale <json>      target locale JSON\n` +
    `  --lang <code>        target language code\n` +
    `  --canonical <url>    target self-canonical URL\n` +
    `  --output <html>      generated output path\n\n` +
    `Optional:\n` +
    `  --dir <ltr|rtl>      document direction (default ltr)\n` +
    `  --base <url>         optional <base href> value\n` +
    `  --strip-script <s>   remove script src containing substring; repeatable\n` +
    `  --remove-selector <css> remove elements before output; repeatable\n` +
    `  --single-h1 true     downgrade every h1 after the first to h2\n` +
    `  --help               show this help\n`;
  (code ? console.error : console.log)(msg);
  process.exit(code);
}

function parseArgs(argv) {
  const out = { stripScript: [], removeSelector: [] };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help') usage(0);
    if (!arg.startsWith('--')) usage(2);
    const key = arg.slice(2);
    const value = argv[++i];
    if (value == null) usage(2);
    if (key === 'strip-script') out.stripScript.push(value);
    else if (key === 'remove-selector') out.removeSelector.push(value);
    else out[key] = value;
  }
  for (const key of ['source', 'locale', 'lang', 'canonical', 'output']) {
    if (!out[key]) {
      console.error(`Missing required --${key}`);
      usage(2);
    }
  }
  out.dir = out.dir || 'ltr';
  if (!['ltr', 'rtl'].includes(out.dir)) throw new Error(`Invalid --dir ${out.dir}`);
  out.singleH1 = String(out['single-h1'] || '').toLowerCase() === 'true';
  return out;
}

function get(obj, key) {
  if (!obj || !key) return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
  const parts = String(key).split('.');
  let cur = obj;
  for (const part of parts) {
    if (!cur || typeof cur !== 'object' || !Object.prototype.hasOwnProperty.call(cur, part)) return undefined;
    cur = cur[part];
  }
  return cur;
}

function payload(json) {
  if (json && typeof json === 'object' && json.strings && typeof json.strings === 'object') return json.strings;
  return json;
}

function ensureString(locale, key, missing) {
  const value = get(locale, key);
  if (typeof value !== 'string') {
    missing.add(key);
    return null;
  }
  return value;
}

function applyText(document, locale, missing) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = ensureString(locale, key, missing);
    if (value !== null) el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const value = ensureString(locale, key, missing);
    if (value !== null) el.innerHTML = value;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const spec = el.getAttribute('data-i18n-attr') || '';
    spec.split(/[;,]/).map(x => x.trim()).filter(Boolean).forEach(pair => {
      const idx = pair.indexOf(':');
      if (idx < 1) throw new Error(`Invalid data-i18n-attr expression: ${pair}`);
      const attr = pair.slice(0, idx).trim();
      const key = pair.slice(idx + 1).trim();
      const value = ensureString(locale, key, missing);
      if (value !== null) el.setAttribute(attr, value);
    });
  });
  const simpleAttrs = [
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
    ['data-i18n-aria-label', 'aria-label'],
    ['data-i18n-value', 'value'],
    ['data-i18n-alt', 'alt'],
  ];
  for (const [selector, attr] of simpleAttrs) {
    document.querySelectorAll(`[${selector}]`).forEach(el => {
      const key = el.getAttribute(selector);
      const value = ensureString(locale, key, missing);
      if (value !== null) el.setAttribute(attr, value);
    });
  }
}

function normaliseContractText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function bodyTextNodes(document) {
  const nodes = [];
  const walker = document.createTreeWalker(document.body, 4);
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || parent.closest('script,style,noscript')) continue;
    nodes.push(node);
  }
  return nodes;
}

function applyStaticTextContract(document, locale) {
  const contract = get(locale, '_static_text');
  if (!contract) return;
  if (typeof contract !== 'object' || Array.isArray(contract)) throw new Error('_static_text must be an object');

  const index = new Map();
  for (const [source, replacement] of Object.entries(contract)) {
    if (typeof replacement !== 'string') throw new Error(`_static_text replacement must be string: ${source}`);
    const normalised = normaliseContractText(source);
    if (!normalised) throw new Error('_static_text source must not be empty');
    if (index.has(normalised)) throw new Error(`Duplicate normalised _static_text source: ${source}`);
    index.set(normalised, { source, replacement });
  }

  const used = new Set();

  // Pass 1: exact normalized text-node matches. This is the normal path for
  // labels, navigation items and ordinary unkeyed copy.
  for (const node of bodyTextNodes(document)) {
    const raw = node.nodeValue || '';
    const normalised = normaliseContractText(raw);
    if (!normalised || !index.has(normalised)) continue;
    const entry = index.get(normalised);
    const leading = raw.match(/^\s*/)[0];
    const trailing = raw.match(/\s*$/)[0];
    node.nodeValue = leading + entry.replacement + trailing;
    used.add(entry.source);
  }

  // Pass 2: narrowly allow long exact-normalized source phrases to match as a
  // substring inside one larger text node. This handles formatting-only source
  // line breaks while keeping short labels fail-closed against accidental hits.
  const MIN_LONG_SUBSTRING = 40;
  for (const [source, replacement] of Object.entries(contract)) {
    if (used.has(source)) continue;
    const needle = normaliseContractText(source);
    if (needle.length < MIN_LONG_SUBSTRING) continue;

    let matched = false;
    for (const node of bodyTextNodes(document)) {
      const raw = node.nodeValue || '';
      const haystack = normaliseContractText(raw);
      if (!haystack.includes(needle)) continue;
      const leading = raw.match(/^\s*/)[0];
      const trailing = raw.match(/\s*$/)[0];
      node.nodeValue = leading + haystack.replace(needle, replacement) + trailing;
      used.add(source);
      matched = true;
      break;
    }
    if (matched) continue;
  }

  const unused = Object.keys(contract).filter(key => !used.has(key));
  if (unused.length) throw new Error(`Unused _static_text contract entries: ${unused.join(' | ')}`);
}

function ensureMeta(document, selector, attrs) {
  let node = document.querySelector(selector);
  if (!node) {
    node = document.createElement('meta');
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    document.head.appendChild(node);
  }
  return node;
}

function setMetaContent(document, selector, attrs, value) {
  if (typeof value !== 'string' || !value) return;
  ensureMeta(document, selector, attrs).setAttribute('content', value);
}

function applyMeta(document, locale, canonicalUrl) {
  const title = get(locale, 'meta.title');
  const description = get(locale, 'meta.description');
  const author = get(locale, 'meta.author');
  const ogTitle = get(locale, 'meta.ogtitle') || title;
  const ogDescription = get(locale, 'meta.ogdesc') || description;
  const twitterTitle = get(locale, 'meta.twittertitle') || ogTitle;
  const twitterDescription = get(locale, 'meta.twitterdesc') || ogDescription;
  const schemaDescription = get(locale, 'meta.schemaDescription') || description;
  if (typeof title === 'string' && title) document.title = title;
  setMetaContent(document, 'meta[name="description"]', {name:'description'}, description);
  setMetaContent(document, 'meta[name="author"]', {name:'author'}, author);
  setMetaContent(document, 'meta[property="og:title"]', {property:'og:title'}, ogTitle);
  setMetaContent(document, 'meta[property="og:description"]', {property:'og:description'}, ogDescription);
  setMetaContent(document, 'meta[property="og:url"]', {property:'og:url'}, canonicalUrl);
  setMetaContent(document, 'meta[name="twitter:title"]', {name:'twitter:title'}, twitterTitle);
  setMetaContent(document, 'meta[name="twitter:description"]', {name:'twitter:description'}, twitterDescription);
  document.querySelectorAll('script[type="application/ld+json"]').forEach(node => {
    let value;
    try { value = JSON.parse(node.textContent || ''); } catch (_) { return; }
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    if (typeof value.url === 'string') value.url = canonicalUrl;
    if (typeof schemaDescription === 'string' && schemaDescription && typeof value.description === 'string') value.description = schemaDescription;
    node.textContent = JSON.stringify(value, null, 2);
  });
}

function setCanonical(document, url) {
  document.querySelectorAll('link[rel="canonical"]').forEach(node => node.remove());
  const node = document.createElement('link');
  node.setAttribute('rel', 'canonical');
  node.setAttribute('href', url);
  document.head.appendChild(node);
}

function setBase(document, href) {
  if (!href) return;
  document.querySelectorAll('base').forEach(node => node.remove());
  const node = document.createElement('base');
  node.setAttribute('href', href);
  document.head.prepend(node);
}

function removeRuntime(document, stripScripts, removeSelectors) {
  for (const needle of stripScripts) {
    document.querySelectorAll('script[src]').forEach(node => {
      const src = node.getAttribute('src') || '';
      if (src.includes(needle)) node.remove();
    });
  }
  for (const selector of removeSelectors) document.querySelectorAll(selector).forEach(node => node.remove());
}

function enforceSingleH1(document, enabled) {
  if (!enabled) return;
  const headings = Array.from(document.querySelectorAll('h1'));
  headings.slice(1).forEach(old => {
    const replacement = document.createElement('h2');
    for (const attr of old.attributes) replacement.setAttribute(attr.name, attr.value);
    while (old.firstChild) replacement.appendChild(old.firstChild);
    old.replaceWith(replacement);
  });
}

function addProvenance(document, args, localeJson) {
  document.querySelectorAll('meta[name="wpa-static-translation"]').forEach(node => node.remove());
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'wpa-static-translation');
  meta.setAttribute('content', JSON.stringify({source:args.source,locale:args.locale,lang:args.lang,locale_version:localeJson && localeJson._meta ? (localeJson._meta.version || null) : null,generated_by:'scripts/build_static_translation.js'}));
  document.head.appendChild(meta);
}

function main() {
  const args = parseArgs(process.argv);
  const sourcePath = path.resolve(args.source);
  const localePath = path.resolve(args.locale);
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing source: ${args.source}`);
  if (!fs.existsSync(localePath)) throw new Error(`Missing locale: ${args.locale}`);
  const html = fs.readFileSync(sourcePath, 'utf8');
  const localeJson = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const locale = payload(localeJson);
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const missing = new Set();
  document.documentElement.setAttribute('lang', args.lang);
  document.documentElement.setAttribute('dir', args.dir);
  applyText(document, locale, missing);
  applyStaticTextContract(document, locale);
  applyMeta(document, locale, args.canonical);
  setCanonical(document, args.canonical);
  setBase(document, args.base);
  removeRuntime(document, args.stripScript, args.removeSelector);
  enforceSingleH1(document, args.singleH1);
  if (missing.size) {
    console.error('Static translation build refused: missing locale keys:');
    [...missing].sort().forEach(key => console.error(`- ${key}`));
    process.exit(1);
  }
  addProvenance(document, args, localeJson);
  const out = '<!doctype html>\n' + document.documentElement.outerHTML + '\n';
  const outPath = path.resolve(args.output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out, 'utf8');
  console.log(`Built ${args.output} from ${args.source} + ${args.locale}`);
}

try { main(); }
catch (err) { console.error(`Static translation build failed: ${err.message}`); process.exit(1); }
