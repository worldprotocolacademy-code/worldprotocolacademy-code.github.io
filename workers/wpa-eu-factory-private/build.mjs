import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {APP,UI,ASSET_PATHS} from './src/paths.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),out=path.join(here,'dist');
const panel=fs.readFileSync(path.join(here,'src/panel.html'),'utf8');
const inject=(s,a,b)=>{if(s.split(a).length!==2)throw Error('Build anchor changed: '+a);return s.replace(a,b);};
const assets=new Map();
for(const route of ASSET_PATHS){
  const source=route===UI?path.join(here,'src/private-ui.js'):path.join(root,route.slice(1));
  let bytes=fs.readFileSync(source);
  if(route===APP){
    let html=bytes.toString('utf8');
    html=inject(html,'</head>','<script src="'+UI+'" defer></script>\n</head>');
    html=inject(html,'<section class="panel" id="euCouncilPanel"',panel+'<section class="panel" id="euCouncilPanel"');
    for(const target of ['/tools/product-factory.html#factory','/index.html','/public-disclaimer.html','/privacy.html'])html=html.split('href="'+target+'"').join('href="https://worldprotocolacademy.mk'+target+'"');
    html=html.replace('https://worldprotocolacademy.mk/tools/eu-application-factory.html','https://grants.worldprotocolacademy.mk/tools/eu-application-factory.html');
    html=html.replaceAll('v10 RC1','v10 RC2 · private candidate');
    bytes=Buffer.from(html,'utf8');
  }
  assets.set(route,bytes);
}
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const manifest=[];
for(const [route,bytes] of assets){const file=path.join(out,route.slice(1));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);manifest.push({route,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
fs.writeFileSync(path.join(here,'build-manifest.json'),JSON.stringify({status:'PRIVATE_ASSETS_CANDIDATE_NOT_DEPLOYED',files:manifest},null,2)+'\n');
console.log('Built '+manifest.length+' allowlisted private assets; do not publish dist to GitHub Pages.');
