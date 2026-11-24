/* Local-only document preview. No uploads, storage, provider calls or HTML execution. */
export const MAX_FILES=20;
export const MAX_FILE_BYTES=15*1024*1024;
const TEXT_LIMIT=120000, XML_LIMIT=2*1024*1024;
const FORMATS=Object.freeze({pdf:'PDF',docx:'Word',json:'JSON',csv:'CSV',md:'Markdown',markdown:'Markdown',txt:'TXT',png:'PNG',jpg:'JPG',jpeg:'JPEG'});
export function extension(name){return String(name||'').split('.').pop().toLowerCase();}
export function appendFiles(previous,incoming){
 const files=previous.slice(),issues=[];
 for(const f of incoming){
  const ext=extension(f.name);
  if(!Object.hasOwn(FORMATS,ext)){issues.push({name:f.name,reason:'format'});continue;}
  if(!Number.isFinite(f.size)||f.size<=0){issues.push({name:f.name,reason:'empty'});continue;}
  if(f.size>MAX_FILE_BYTES){issues.push({name:f.name,reason:'size'});continue;}
  if(files.some(x=>x.name===f.name&&x.size===f.size&&x.lastModified===f.lastModified)){issues.push({name:f.name,reason:'duplicate'});continue;}
  if(files.length>=MAX_FILES){issues.push({name:f.name,reason:'limit'});continue;}
  files.push(f);
 }
 return {files,issues};
}
export function detectBinary(bytes,ext){
 if(ext==='pdf')return [37,80,68,70,45].every((b,i)=>bytes[i]===b);
 if(ext==='png')return [137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);
 if(ext==='jpg'||ext==='jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(ext==='docx')return bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4;
 return true;
}
const fail=code=>{throw new Error(code);};
const decoder=new TextDecoder('utf-8',{fatal:true});
export async function extractDocxXml(file){
 if(file.size>MAX_FILE_BYTES||file.size<22)fail('archive');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const view=new DataView(bytes.buffer),len=bytes.length;
 const u16=p=>view.getUint16(p,true),u32=p=>view.getUint32(p,true);
 let e=-1;
 for(let p=len-22;p>=Math.max(0,len-65557);p--){
  if(u32(p)===0x06054b50&&p+22+u16(p+20)===len){e=p;break;}
 }
 if(e<0||u16(e+4)!==0||u16(e+6)!==0||u16(e+8)!==u16(e+10))fail('archive');
 const count=u16(e+10),cdSize=u32(e+12),cdStart=u32(e+16),cdEnd=cdStart+cdSize;
 if(!count||count>4096||cdStart>e||cdEnd!==e)fail('archive');
 let p=cdStart,selected=null;
 for(let i=0;i<count;i++){
  if(p+46>cdEnd||u32(p)!==0x02014b50)fail('archive');
  const n=u16(p+28),extra=u16(p+30),comment=u16(p+32),end=p+46+n+extra+comment;
  if(end>cdEnd)fail('archive');
  const name=new TextDecoder().decode(bytes.subarray(p+46,p+46+n));
  if(name==='word/document.xml'){
   if(selected)fail('archive');
   selected={flags:u16(p+8),method:u16(p+10),compressed:u32(p+20),size:u32(p+24),offset:u32(p+42),disk:u16(p+34)};
  }
  p=end;
 }
 if(p!==cdEnd||!selected)fail('archive');
 const z=selected,o=z.offset;
 if(z.disk!==0||(z.flags&1)||![0,8].includes(z.method)||!z.size||z.size>XML_LIMIT||z.compressed>MAX_FILE_BYTES||o+30>cdStart||u32(o)!==0x04034b50)fail('archive');
 const n=u16(o+26),x=u16(o+28),start=o+30+n+x;
 if(start>cdStart||start+z.compressed>cdStart||u16(o+8)!==z.method||(u16(o+6)&1)||new TextDecoder().decode(bytes.subarray(o+30,o+30+n))!=='word/document.xml')fail('archive');
 const source=bytes.subarray(start,start+z.compressed);
 let xmlBytes;
 if(z.method===0){if(source.length!==z.size)fail('archive');xmlBytes=source;}
 else{
  if(typeof DecompressionStream!=='function')fail('unsupported');
  const reader=new Blob([source]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const parts=[];let total=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>XML_LIMIT||total>z.size){await reader.cancel();fail('archive');}parts.push(value);}}
  finally{reader.releaseLock();}
  if(total!==z.size)fail('archive');
  xmlBytes=new Uint8Array(total);let offset=0;for(const part of parts){xmlBytes.set(part,offset);offset+=part.byteLength;}
 }
 const xml=decoder.decode(xmlBytes);
 if(/<!\s*(?:DOCTYPE|ENTITY)/i.test(xml))fail('archive');
 return xml;
}
export async function readPreview(file){
 const ext=extension(file.name);
 if(!Object.hasOwn(FORMATS,ext)||file.size<=0||file.size>MAX_FILE_BYTES)fail('format');
 if(['pdf','png','jpg','jpeg','docx'].includes(ext)){
  const prefix=new Uint8Array(await file.slice(0,8).arrayBuffer());
  if(!detectBinary(prefix,ext))fail('signature');
  if(ext==='docx'){
   const xml=await extractDocxXml(file);
   if(typeof DOMParser==='undefined')fail('unsupported');
   const doc=new DOMParser().parseFromString(xml,'application/xml');
   if(doc.querySelector('parsererror'))fail('archive');
   const ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
   if(doc.documentElement.localName!=='document'||doc.documentElement.namespaceURI!==ns)fail('archive');
   const paragraphs=Array.from(doc.getElementsByTagNameNS(ns,'p'));
   let text='';
   for(const p of paragraphs){
    text+=Array.from(p.getElementsByTagNameNS(ns,'t'),x=>x.textContent).join('')+'\n';
    if(text.length>TEXT_LIMIT)break;
   }
   return {kind:'text',text:text.slice(0,TEXT_LIMIT),partial:text.length>TEXT_LIMIT,word:true};
  }
  return {kind:ext==='pdf'?'pdf':'image',mime:ext==='pdf'?'application/pdf':ext==='png'?'image/png':'image/jpeg'};
 }
 // Bounded plain-text preview; never interpret Markdown, CSV or JSON as HTML.
 const bytes=new Uint8Array(await file.slice(0,TEXT_LIMIT).arrayBuffer());
 let text;
 try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes,{stream:file.size>bytes.length});}
 catch{fail('encoding');}
 if(text.includes('\u0000'))fail('encoding');
 if(ext==='json'&&file.size===bytes.length){try{text=JSON.stringify(JSON.parse(text),null,2);}catch{fail('json');}}
 return {kind:'text',text:text.slice(0,TEXT_LIMIT),partial:file.size>bytes.length||text.length>TEXT_LIMIT};
}
export function mountLocalPreview(panel){
 if(!panel||panel.querySelector('[data-wpa-local-preview]'))return null;
 const form=panel.querySelector('#wpaPublicVsForm');if(!form)return null;
 const en=document.documentElement.lang?.toLowerCase().startsWith('en');
 const t=en?{
  title:'Documents in this session',attach:'Attach / preview files',drop:'Drop up to 20 files here or choose files',local:'Local preview only — files are not uploaded or read by AI. Only text explicitly sent in chat is submitted. Clear ends the session.',
  preview:'Preview',remove:'Remove',clear:'Remove all',close:'Close preview',partial:'Limited preview; the complete file has not been read.',word:'DOCX text only; layout, images and other Word elements are not reproduced.',
  pdf:'Open PDF in your browser',pdfNote:'PDF opens using your browser’s local PDF viewer. The AI has not read it.',empty:'No files selected.',loading:'Opening local preview…',error:'Preview unavailable. The file may be invalid, encrypted or unsupported.',imageError:'Image could not be displayed.',
  format:'Unsupported format',size:'Over 15 MiB',limit:'20-file limit',duplicate:'Already selected',emptyFile:'Empty file',encoding:'Invalid UTF-8 text',json:'Invalid JSON',
  rejected:'Not added',note:'PDF · DOCX · JSON · CSV · MD · PNG · JPG · TXT; 15 MiB per file.'
 }:{
  title:'Документи во оваа сесија',attach:'Прикачи / прегледај датотеки',drop:'Повлечете до 20 датотеки тука или изберете ги',local:'Само локален преглед — датотеките не се испраќаат и ВИ не ги чита. Се испраќа само текстот што изречно го праќате во разговорот. „Исчисти“ ја завршува сесијата.',
  preview:'Преглед',remove:'Отстрани',clear:'Отстрани ги сите',close:'Затвори преглед',partial:'Ограничен преглед; целата датотека не е прочитана.',word:'Само текст од DOCX; распоредот, сликите и другите Word елементи не се прикажуваат.',
  pdf:'Отвори PDF во прелистувачот',pdfNote:'PDF се отвора во локалниот PDF-прегледувач на прелистувачот. ВИ не го прочитала.',empty:'Нема избрани датотеки.',loading:'Се отвора локален преглед…',error:'Прегледот не е достапен. Датотеката може да е невалидна, шифрирана или неподдржана.',imageError:'Сликата не може да се прикаже.',
  format:'Неподдржан формат',size:'Над 15 MiB',limit:'Ограничување од 20 датотеки',duplicate:'Веќе избрана',emptyFile:'Празна датотека',encoding:'Невалиден UTF-8 текст',json:'Невалиден JSON',
  rejected:'Не е додадено',note:'PDF · DOCX · JSON · CSV · MD · PNG · JPG · TXT; 15 MiB по датотека.'
 };
 let files=[],revision=0,selected=null,blobUrl=null;
 const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 const button=(text,action)=>{const e=el('button',text);e.type='button';e.dataset.wpaPreviewAction=action;e.style.cssText='border:1px solid #bcae87;background:#fff;color:#132844;border-radius:6px;padding:5px 8px;cursor:pointer;font:12px system-ui,sans-serif';return e;};
 const root=el('details');root.dataset.wpaLocalPreview='v1';root.style.cssText='padding:6px 10px;background:#fbf8ee;color:#132844;border-top:1px solid #d8d2bc;flex-shrink:0;max-height:min(260px,42vh);overflow:auto;font:12px/1.4 system-ui,sans-serif';
 const summary=el('summary');summary.style.cssText='font-weight:700;cursor:pointer;padding:3px 0';
 const attach=button('📎 '+t.attach,'attach'),drop=button(t.drop,'drop');drop.style.cssText+=';display:block;width:100%;border-style:dashed;padding:9px;margin:6px 0';
 const input=el('input');input.type='file';input.multiple=true;input.accept=Object.keys(FORMATS).map(x=>'.'+x).join(',');input.hidden=true;
 const disclosure=el('p',t.local);disclosure.style.cssText='margin:5px 0;color:#665b43;font-size:11px';
 const note=el('p',t.note);note.style.cssText='margin:3px 0;font-size:11px';
 const status=el('div');status.setAttribute('role','status');status.style.cssText='overflow-wrap:anywhere;color:#665b43';
 const list=el('ul');list.style.cssText='margin:5px 0;padding:0;list-style:none;max-height:120px;overflow:auto';
 const clear=button(t.clear,'clear');
 const preview=el('section');preview.dataset.wpaPreviewContent='';preview.style.cssText='border:1px solid #d8d2bc;background:#fff;border-radius:8px;padding:8px;margin-top:6px;overflow-wrap:anywhere';preview.hidden=true;
 root.append(summary,attach,input,drop,disclosure,note,status,list,clear,preview);
 form.before(root);
 function dispose(){revision++;selected=null;if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null;}preview.replaceChildren();preview.hidden=true;}
 function render(){
  summary.textContent='📎 '+t.title+' — '+files.length+'/20';
  list.replaceChildren();clear.disabled=!files.length;
  if(!files.length){list.append(el('li',t.empty));return;}
  for(const f of files){
   const row=el('li');row.style.cssText='display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #e7e0cd';
   const info=el('div');info.style.cssText='flex:1;min-width:0;overflow-wrap:anywhere';
   const name=el('div',f.name);name.style.fontWeight='600';
   info.append(name,el('small',FORMATS[extension(f.name)]+' · '+(f.size/1048576).toFixed(2)+' MiB'));
   const open=button(t.preview,'open'),del=button('×','remove');
   open.setAttribute('aria-label',t.preview+' '+f.name);del.setAttribute('aria-label',t.remove+' '+f.name);
   open.onclick=()=>show(f);del.onclick=()=>{if(selected===f)dispose();files=files.filter(x=>x!==f);status.textContent='';render();};
   row.append(info,open,del);list.append(row);
  }
 }
 async function show(file){
  dispose();selected=file;const current=revision;preview.hidden=false;
  const heading=el('div',file.name),close=button(t.close,'close');
  heading.style.cssText='font-weight:700;margin-bottom:4px';
  close.onclick=dispose;const body=el('div',t.loading);
  preview.append(heading,close,body);
  try{
   const data=await readPreview(file);
   if(current!==revision||selected!==file)return;
   body.replaceChildren();
   if(data.kind==='text'){
    if(data.word)body.append(el('p',t.word));
    if(data.partial)body.append(el('p',t.partial));
    const pre=el('pre',data.text||'');pre.style.cssText='margin:5px 0;white-space:pre-wrap;overflow-wrap:anywhere;max-height:200px;overflow:auto;font:12px/1.4 ui-monospace,monospace';body.append(pre);
   }else{
    blobUrl=URL.createObjectURL(new Blob([file],{type:data.mime}));
    if(data.kind==='image'){
     const img=el('img');img.alt=file.name;img.style.cssText='display:block;max-width:100%;max-height:200px;object-fit:contain;margin:auto';img.onerror=()=>{if(current===revision)body.replaceChildren(el('p',t.imageError));};img.src=blobUrl;body.append(img);
    }else{
     const link=el('a',t.pdf);link.href=blobUrl;link.target='_blank';link.rel='noopener noreferrer';link.style.cssText='color:#142b4a;text-decoration:underline;font-weight:600';
     body.append(el('p',t.pdfNote),link);
    }
   }
  }catch(e){if(current===revision)body.textContent=e?.message==='json'?t.json:e?.message==='encoding'?t.encoding:t.error;}
 }
 function add(incoming){
  if(!incoming.length)return;
  root.open=true;const result=appendFiles(files,incoming);files=result.files;render();
  status.textContent=result.issues.map(i=>t.rejected+': '+i.name+' — '+(i.reason==='empty'?t.emptyFile:t[i.reason])).join(' · ');
 }
 attach.onclick=drop.onclick=()=>input.click();input.onchange=()=>{add(Array.from(input.files||[]));input.value='';};
 function isFileDrag(e){return Array.from(e.dataTransfer?.types||[]).includes('Files')||Boolean(e.dataTransfer?.files?.length);}
 panel.addEventListener('dragover',e=>{if(isFileDrag(e)){e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='copy';}});
 panel.addEventListener('drop',e=>{if(isFileDrag(e)){e.preventDefault();e.stopPropagation();add(Array.from(e.dataTransfer?.files||[]));}});
 function reset(){dispose();files=[];status.textContent='';render();root.open=false;}
 clear.onclick=reset;
 panel.querySelector('#wpaPublicVsClear')?.addEventListener('click',reset);
 root.addEventListener('toggle',()=>{if(!root.open)dispose();});
 render();return {reset,getCount:()=>files.length};
}
