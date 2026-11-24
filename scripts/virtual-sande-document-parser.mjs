/* Local-only parsers: supported PDF, DOCX, HTML, TXT, MD, CSV.
 * Pinned third-party PDF.js/fflate imports require browser supply-chain QA.
 * Never uploads raw bytes. No OCR, macros, external documents or hidden metadata.
 */
import {DOCUMENT_LIMITS,SUPPORTED_DOCUMENT_EXTENSIONS} from './virtual-sande-document-intelligence.mjs';
const PDF_ROOT='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/build/';
const ZIP_MODULE='https://cdn.jsdelivr.net/npm/fflate@0.8.2/esm/browser.js';
const WORD_NS='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
let pdfImport=null,zipImport=null;
function ext(file){return String(file?.name||'').split('.').pop().toLowerCase();}
export function groupParagraphs(paragraphs){
 const result=[];let buffer='';
 function flush(){if(buffer.trim()){result.push({locator:'S'+(result.length+1),text:buffer.trim()});buffer='';}}
 for(const raw of paragraphs){
   const p=String(raw||'').trim();
   if(!p)continue;
   if(buffer.length+p.length>950)flush();
   if(p.length>3200){
     for(let i=0;i<p.length;i+=950){if(buffer)flush();result.push({locator:'S'+(result.length+1),text:p.slice(i,i+950)});}
   }else buffer+=(buffer?'\n':'')+p;
   if(result.length>DOCUMENT_LIMITS.maxSegmentsPerFile)throw new Error('DOCUMENT_SEGMENT_LIMIT');
 }
 flush();return result;
}
export function validateZipDirectory(bytes){
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 let eocd=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){
   if(v.getUint32(i,true)===0x06054b50){eocd=i;break;}
 }
 if(eocd<0)throw new Error('DOCX_ZIP_CORRUPT');
 const count=v.getUint16(eocd+10,true),size=v.getUint32(eocd+12,true),
   at=v.getUint32(eocd+16,true);
 if(count<1||count>600||size===0xffffffff||at===0xffffffff||at+size>eocd)
   throw new Error('DOCX_ZIP_UNSAFE');
 let sum=0,pos=at,found=false;
 for(let i=0;i<count;i++){
   if(pos+46>bytes.length||v.getUint32(pos,true)!==0x02014b50)
     throw new Error('DOCX_ZIP_UNSAFE');
   const flags=v.getUint16(pos+8,true),method=v.getUint16(pos+10,true),
     packed=v.getUint32(pos+20,true),raw=v.getUint32(pos+24,true),
     nameLen=v.getUint16(pos+28,true),extra=v.getUint16(pos+30,true),
     comment=v.getUint16(pos+32,true);
   if(flags&1||![0,8].includes(method)||raw===0xffffffff||packed===0xffffffff)
     throw new Error('DOCX_ZIP_UNSAFE');
   if(pos+46+nameLen+extra+comment>bytes.length)throw new Error('DOCX_ZIP_UNSAFE');
   const name=new TextDecoder().decode(bytes.slice(pos+46,pos+46+nameLen));
   if(name==='word/document.xml')found=true;
   sum+=raw;
   if(raw>12000000||sum>85000000)throw new Error('DOCX_ZIP_BOMB');
   pos+=46+nameLen+extra+comment;
 }
 if(!found)throw new Error('DOCX_BODY_MISSING');
 return true;
}
export function extractDocxParagraphs(xml,parser){
 if(typeof xml!=='string'||/<!DOCTYPE|<!ENTITY/i.test(xml))throw new Error('DOCX_UNSAFE_XML');
 const dom=parser.parseFromString(xml,'application/xml');
 if(dom.querySelector('parsererror'))throw new Error('DOCX_XML_CORRUPT');
 const paragraphs=[...dom.getElementsByTagNameNS(WORD_NS,'p')].map(p=>
   [...p.getElementsByTagNameNS(WORD_NS,'t')].map(t=>t.textContent||'').join(''));
 return groupParagraphs(paragraphs);
}
async function parseDocx(file){
 if(!zipImport)zipImport=import(ZIP_MODULE).catch(e=>{zipImport=null;throw e;});
 const {unzipSync}=await zipImport;
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(bytes[0]!==0x50||bytes[1]!==0x4b)throw new Error('DOCX_NOT_ZIP');
 validateZipDirectory(bytes);
 const xmlFile=unzipSync(bytes)['word/document.xml'];
 if(!xmlFile || xmlFile.length>12000000)throw new Error('DOCX_BODY_MISSING');
 const xml=new TextDecoder('utf-8',{fatal:true}).decode(xmlFile);
 return extractDocxParagraphs(xml,new DOMParser());
}
async function parsePdf(file,onProgress){
 if(!pdfImport)pdfImport=import(PDF_ROOT+'pdf.mjs').then(m=>{
   m.GlobalWorkerOptions.workerSrc=PDF_ROOT+'pdf.worker.mjs';return m;
 }).catch(e=>{pdfImport=null;throw e;});
 const m=await pdfImport;
 const head=new Uint8Array(await file.slice(0,5).arrayBuffer());
 if(String.fromCharCode(...head)!=='%PDF-')throw new Error('PDF_SIGNATURE');
 let task;
 try{
   task=m.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});
   const pdf=await task.promise;
   if(pdf.numPages>DOCUMENT_LIMITS.maxPdfPages)throw new Error('PDF_PAGE_LIMIT');
   const sections=[];let total=0;
   for(let n=1;n<=pdf.numPages;n++){
     const page=await pdf.getPage(n);
     const content=await page.getTextContent();
     const text=content.items.map(x=>typeof x.str==='string'?x.str:'').join(' ');
     total+=text.length;
     if(total>DOCUMENT_LIMITS.maxCharsPerFile)throw new Error('DOCUMENT_TEXT_LIMIT');
     if(text.trim())sections.push({locator:'P'+n,text});
     if(typeof page.cleanup==='function')page.cleanup();
     if(n%10===0||n===pdf.numPages)onProgress(n,pdf.numPages);
   }
   return sections;
 }finally{if(task)try{await task.destroy();}catch{}}
}
async function parseText(file,format){
 const value=await file.text();
 if(value.length>DOCUMENT_LIMITS.maxCharsPerFile)throw new Error('DOCUMENT_TEXT_LIMIT');
 if(format==='html'){
   const dom=new DOMParser().parseFromString(value,'text/html');
   for(const el of dom.querySelectorAll('script,style,iframe,noscript,template,svg,nav'))el.remove();
   return groupParagraphs((dom.body?.textContent||'').split(/\n{2,}/));
 }
 return groupParagraphs(value.split(/\n{2,}/));
}
export async function readLocalDocument(file,onProgress=()=>{}){
 const format=ext(file);
 if(!file||file.size<1||file.size>DOCUMENT_LIMITS.maxFileBytes)
   throw new Error('DOCUMENT_FILE_LIMIT');
 if(!SUPPORTED_DOCUMENT_EXTENSIONS.includes(format))throw new Error('DOCUMENT_UNSUPPORTED_FORMAT');
 let segments;
 if(format==='pdf')segments=await parsePdf(file,onProgress);
 else if(format==='docx')segments=await parseDocx(file);
 else segments=await parseText(file,format);
 if(!segments.length)throw new Error('DOCUMENT_NO_EXTRACTABLE_TEXT');
 return {name:file.name,format,segments};
}
