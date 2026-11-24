// Build only the protected staging Worker's allowlisted assets. No deploy.
import {mkdir,copyFile,writeFile,readFile,stat,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=join(root,'workers/virtual-sande-private-pilot/assets');
const assets=[
 'logo.webp',
 'scripts/virtual-sande-public-widget.js',
 'scripts/virtual-sande-voice-documents.mjs',
 'scripts/virtual-sande-private-workspace-client.mjs',
 'scripts/virtual-sande-proactive-intent.mjs',
 'scripts/virtual-sande-protocol-practice-ui.mjs',
 'scripts/virtual-sande-protocol-practice.mjs'
];
const html=(en)=>'<!doctype html>\n<html lang="'+(en?'en':'mk')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="wpa-private-workspace-api" content="/private-api"><meta name="wpa-private-workspace-only" content="true"><title>Virtual Sande AI — Protected pilot</title><style>html{font-family:system-ui,sans-serif;background:#fbf8ee;color:#142b4a}body{margin:0}main{max-width:850px;padding:28px;margin:auto}header{display:flex;align-items:center;gap:15px}header img{width:64px;height:64px;border-radius:50%}a{color:#142b4a}h1{font-size:24px}p{line-height:1.6}.notice{padding:12px;border:1px solid #c9a84c;border-radius:8px;background:#fff}</style><script defer src="/scripts/virtual-sande-public-widget.js"></script></head><body><main><header><img src="/logo.webp" alt="WPA"><div><h1>Virtual Sande AI</h1><p>Unified Academic Workspace — protected pilot RC2</p></div></header><nav><a href="/">Македонски</a> · <a href="/en/">English</a></nav><p class="notice">'+(en?'Protected pilot for authorised testers. Use only synthetic, non-sensitive fixtures. The model prepares provisional results, not official WPA decisions. The pilot does not use the public academic endpoint. Give explicit consent in the document tray before submitting a question. Open the WPA logo at bottom right.':'Заштитен пилот за овластени тестери. Користете само синтетички, нечувствителни примероци. Моделот подготвува работни резултати, не службени одлуки на WPA. Пилотот не го користи јавниот академски сервис. Дајте изречна согласност во делот за документи пред да испратите прашање. Отворете го логото на WPA долу десно.')+'</p><p>'+(en?'Clear the conversation to remove local extracted text and reset consent. Provider retention and verified OCR remain separate acceptance gates.':'Исчистете го разговорот за да го отстраните локално извлечениот текст и да ја ресетирате согласноста. Задржувањето податоци кај давателот и проверениот OCR се посебни услови за прифаќање.')+'</p></main></body></html>\n';
async function exists(path){try{await stat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
if(await exists(out)){
 const entries=await readdir(out);
 if(entries.length)throw Error('Refusing to overwrite existing staging assets. Remove only the generated assets directory after review, then rebuild.');
}
await mkdir(out,{recursive:true});
for(const asset of assets){const dst=join(out,asset);await mkdir(dirname(dst),{recursive:true});await copyFile(join(root,asset),dst);}
await mkdir(join(out,'en'),{recursive:true});
await writeFile(join(out,'index.html'),html(false),'utf8');await writeFile(join(out,'en/index.html'),html(true),'utf8');
const manifest=[];
for(const path of [...assets,'index.html','en/index.html']){
 const data=await readFile(join(out,path));manifest.push({path,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
}
console.log(JSON.stringify({status:'source_assets_built_not_deployed',files:manifest},null,2));
