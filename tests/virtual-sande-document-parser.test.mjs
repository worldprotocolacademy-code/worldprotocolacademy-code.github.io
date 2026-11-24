import test from 'node:test';
import assert from 'node:assert/strict';
import {groupParagraphs,validateZipDirectory,extractDocxParagraphs,readLocalDocument}
 from '../scripts/virtual-sande-document-parser.mjs';

test('text paragraphs produce contiguous source locators',()=>{
 const sections=groupParagraphs(['Протоколот е нужен.','Дипломатијата и безбедноста се поврзани.','x'.repeat(4100)]);
 assert.ok(sections.length>3);
 assert.equal(sections[0].locator,'S1');
 assert.ok(sections.every((x,i)=>x.locator==='S'+(i+1)));
});
test('plain text and Markdown can be read without vendor CDN imports',async()=>{
 const txt=new Blob(['Протокол\n\nДипломатија\n\nКомуникологија.'],{type:'text/plain'});
 Object.defineProperty(txt,'name',{value:'специјалистичка-анализа.txt'});
 const result=await readLocalDocument(txt);
 assert.equal(result.format,'txt');
 assert.equal(result.name,'специјалистичка-анализа.txt');
 assert.ok(result.segments.length>=1);
});
test('unsupported and empty documents fail clearly',async()=>{
 const bad=new Blob(['Pretend image'],{type:'image/png'});
 Object.defineProperty(bad,'name',{value:'file.png'});
 await assert.rejects(readLocalDocument(bad),/DOCUMENT_UNSUPPORTED_FORMAT/);
 const empty=new Blob([''],{type:'text/plain'});
 Object.defineProperty(empty,'name',{value:'empty.txt'});
 await assert.rejects(readLocalDocument(empty),/DOCUMENT_FILE_LIMIT/);
});
test('ZIP central directory validates size limits before decompression',()=>{
 const bytes=new Uint8Array(128),dv=new DataView(bytes.buffer);
 const fileName=new TextEncoder().encode('word/document.xml');
 dv.setUint32(0,0x02014b50,true);
 dv.setUint16(10,8,true);dv.setUint32(20,100,true);dv.setUint32(24,1200,true);
 dv.setUint16(28,fileName.length,true);bytes.set(fileName,46);
 const eocd=46+fileName.length;
 dv.setUint32(eocd,0x06054b50,true);
 dv.setUint16(eocd+10,1,true);dv.setUint32(eocd+12,eocd,true);
 dv.setUint32(eocd+16,0,true);
 assert.equal(validateZipDirectory(bytes.slice(0,eocd+22)),true);
 dv.setUint32(24,120000000,true);
 assert.throws(()=>validateZipDirectory(bytes.slice(0,eocd+22)),/DOCX_ZIP_BOMB/);
});
test('DOCX XML is treated as data, and unsafe external entities are denied',()=>{
 assert.throws(()=>extractDocxParagraphs('<!DOCTYPE doc [<!ENTITY x SYSTEM "file:///secret">]><document/>',{}),/DOCX_UNSAFE_XML/);
});
console.log('Document Lab parser and ZIP safety tests registered');
