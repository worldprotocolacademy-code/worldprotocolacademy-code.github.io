import test from 'node:test';
import assert from 'node:assert/strict';
import {deflateRawSync} from 'node:zlib';
import {appendFiles,readPreview,extractDocxXml,MAX_FILE_BYTES,MAX_FILES} from '../scripts/virtual-sande-local-preview.mjs';
const f=(name,body)=>new File([body],name,{lastModified:1});
const xml='<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Здраво</w:t></w:r></w:p></w:body></w:document>';
function zipXml(text,method=8,claimedSize){
 const name=Buffer.from('word/document.xml'),raw=Buffer.from(text);
 const data=method===8?deflateRawSync(raw):raw;
 const local=Buffer.alloc(30),central=Buffer.alloc(46),end=Buffer.alloc(22);
 local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(method,8);
 local.writeUInt32LE(data.length,18);local.writeUInt32LE(claimedSize??raw.length,22);local.writeUInt16LE(name.length,26);
 central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(method,10);
 central.writeUInt32LE(data.length,20);central.writeUInt32LE(claimedSize??raw.length,24);central.writeUInt16LE(name.length,28);
 end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);
 end.writeUInt32LE(central.length+name.length,12);end.writeUInt32LE(local.length+name.length+data.length,16);
 return f('fixture.docx',Buffer.concat([local,name,data,central,name,end]));
}
test('accept 20 files across batches; reject 21st and duplicates',()=>{
 const first=Array.from({length:10},(_,i)=>f(i+'.md','text'));
 const next=Array.from({length:11},(_,i)=>f((i+10)+'.json','{}'));
 const a=appendFiles([],first);const b=appendFiles(a.files,[first[0],...next]);
 assert.equal(b.files.length,MAX_FILES);assert.deepEqual(b.issues.map(i=>i.reason),['duplicate','limit']);
});
test('format, empty and per-file size restrictions',()=>{
 const a=appendFiles([],[f('x.exe','x'),f('empty.txt',''),{name:'large.pdf',size:MAX_FILE_BYTES+1,lastModified:1},f('x.PDF','%PDF-1.7')]);
 assert.equal(a.files.length,1);assert.deepEqual(a.issues.map(i=>i.reason),['format','empty','size']);
});
test('plain text previews preserve literal HTML and Unicode; JSON is formatted',async()=>{
 assert.deepEqual(await readPreview(f('a.md','<script>never run</script> Македонски')),{kind:'text',text:'<script>never run</script> Македонски',partial:false});
 assert.match((await readPreview(f('a.json','{"value":1}'))).text,/"value": 1/);
 assert.equal((await readPreview(f('a.csv','a,b\n1,2'))).text,'a,b\n1,2');
 assert.equal((await readPreview(f('a.txt','hello'))).text,'hello');
});
test('malformed JSON and invalid UTF-8 rejected; text cap labelled',async()=>{
 await assert.rejects(()=>readPreview(f('a.json','{')),/json/);
 await assert.rejects(()=>readPreview(f('a.txt',new Uint8Array([255,255]))),/encoding/);
 const r=await readPreview(f('a.md','x'.repeat(120001)));assert.equal(r.text.length,120000);assert.equal(r.partial,true);
});
test('binary signature verification and local preview types',async()=>{
 assert.equal((await readPreview(f('a.pdf','%PDF-1.7'))).kind,'pdf');
 assert.equal((await readPreview(f('a.png',new Uint8Array([137,80,78,71,13,10,26,10])))).mime,'image/png');
 assert.equal((await readPreview(f('a.jpg',new Uint8Array([255,216,255])))).mime,'image/jpeg');
 await assert.rejects(()=>readPreview(f('fake.pdf','<html>')),/signature/);
 await assert.rejects(()=>readPreview(f('fake.png','<html>')),/signature/);
});
test('stored and deflated DOCX document XML can be read locally',async()=>{
 assert.equal(await extractDocxXml(zipXml(xml,0)),xml);
 assert.equal(await extractDocxXml(zipXml(xml,8)),xml);
});
test('DOCX rejects oversized expansion, forged size, malformed archives and DTD',async()=>{
 await assert.rejects(()=>extractDocxXml(zipXml('x',0,3*1024*1024)),/archive/);
 await assert.rejects(()=>extractDocxXml(zipXml('x'.repeat(10000),8,1)),/archive/);
 await assert.rejects(()=>extractDocxXml(f('bad.docx',new Uint8Array([80,75,3,4]))),/archive/);
 await assert.rejects(()=>extractDocxXml(zipXml('<!DOCTYPE x [<!ENTITY e SYSTEM "file:///test">]><x/>')),/archive/);
});
