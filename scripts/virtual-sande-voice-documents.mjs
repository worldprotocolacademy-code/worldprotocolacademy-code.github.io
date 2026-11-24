/* Virtual Sande voice and multi-document intake, browser-side candidate.
 * Voice uses native browser APIs. Files are NOT sent to /ask until a verified
 * attachment API exists; this prevents false claims of document analysis.
 */
import {createPrivateWorkspaceClient} from './virtual-sande-private-workspace-client.mjs';
export function mountVoiceDocuments(panel) {
  if (!panel || panel.querySelector('[data-wpa-multidoc]')) return;
  const english = document.documentElement.lang?.startsWith('en');
  const t = english ? {
    mic:'Dictate', stop:'Stop', speak:'Read replies', stopSpeak:'Stop reading',
    attach:'Attach documents', drop:'Drop files here (up to 20)', files:'Documents in this conversation',
    noSpeech:'Speech recognition is not supported in this browser; type instead.',
    noTts:'Speech synthesis is unavailable.', limit:'Maximum 20 documents per conversation.',
    large:'File exceeds 15 MB.', invalid:'Unsupported file type.',
    caveat:'Files are staged locally only; the server document reader is not connected. The assistant cannot analyse these attachments yet.',
    clear:'Remove all', remove:'Remove', ready:'staged', count:'documents staged'
  } : {
    mic:'Диктирај', stop:'Стоп', speak:'Читај ги одговорите', stopSpeak:'Стоп за говор',
    attach:'Прикачи документи', drop:'Повлечи датотеки тука (до 20)', files:'Документи во разговорот',
    noSpeech:'Овој прелистувач не поддржува препознавање говор; користете тастатура.',
    noTts:'Нема достапна говорна синтеза.', limit:'Најмногу 20 документи во разговор.',
    large:'Датотеката е поголема од 15 MB.', invalid:'Неподдржан формат.',
    caveat:'Датотеките се додадени само локално; серверскиот читач не е поврзан. Асистентот сѐ уште не може да ги анализира овие прилози.',
    clear:'Отстрани ги сите', remove:'Отстрани', ready:'подготвена локално', count:'локално додадени документи'
  };
  const acceptable = /\.(pdf|docx|md|markdown|csv|json|jpe?g|png|txt)$/i;
  const staged = [];
  const processed = new Map();
  const client = createPrivateWorkspaceClient({configuredPath:document.querySelector('meta[name="wpa-private-workspace-api"]')?.content||''});
  let consented=false, privateMode=false, processing=false, generation=0, conversionController=null;
  const local=english?{
    process:'Process documents', consent:'Private pilot: I authorize transfer of selected files and submitted conversation context to the configured Cloudflare AI processing service. Do not submit confidential or sensitive documents until institutional approval.',
    processing:'Processing documents', done:'Extracted text ready', failed:'Processing failed', unavailable:'Private document service is not configured. No document has been uploaded.',
    need:'Process all selected documents before asking about them.', mode:'Private pilot: no public /ask fallback. New conversation resets this mode.', empty:'Empty file.',
    ready:'extracted', select:'selected', invalid:'Unable to process documents; inspect the file status.', coverage:'Document evidence coverage (extracted text, not verified page numbers)',
    voice:'Voice recognition may use your browser provider; check browser microphone privacy. Macedonian voice availability varies.'
  }:{
    process:'Обработи документи', consent:'Приватен пилот: дозволувам избраните датотеки и испратениот контекст да се обработат во конфигурираниот Cloudflare AI сервис. Не испраќајте доверливи или чувствителни документи пред институционално одобрување.',
    processing:'Се обработуваат документи', done:'Извлечениот текст е подготвен', failed:'Обработката не успеа', unavailable:'Приватниот документарен сервис не е конфигуриран. Ниту еден документ не е испратен.',
    need:'Обработете ги сите избрани документи пред да поставите прашање за нив.', mode:'Приватен пилот: нема пренасочување кон јавниот /ask. Нов разговор го ресетира режимот.', empty:'Празна датотека.',
    ready:'извлечен текст', select:'избран', invalid:'Документите не може да се обработат; проверете го статусот.', coverage:'Документарна покриеност (извлечен текст, не потврдени страници)',
    voice:'Гласовното препознавање може да го користи сервисот на прелистувачот. Достапноста на македонски глас варира.'
  };
  const input = panel.querySelector('#wpaPublicVsInput');
  const form = panel.querySelector('#wpaPublicVsForm');
  if (!input || !form) return;
  const root=document.createElement('section');
  root.dataset.wpaMultidoc='preview';
  root.style.cssText='padding:8px 12px;background:#f5f0e0;color:#132844;border-top:1px solid #bcae87;font:12px/1.5 system-ui,sans-serif';
  const toolbar=document.createElement('div');
  toolbar.style.cssText='display:flex;gap:5px;flex-wrap:wrap';
  const button=(label)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='border:1px solid #bcae87;border-radius:7px;background:#fff;color:#132844;padding:5px 8px;cursor:pointer';return b;};
  const mic=button('🎙 '+t.mic),speech=button('🔊 '+t.speak),stopSpeak=button('■ '+t.stopSpeak),attach=button('📎 '+t.attach);
  toolbar.append(mic,speech,stopSpeak,attach);
  const choose=document.createElement('input');choose.type='file';choose.multiple=true;choose.hidden=true;choose.accept='.pdf,.docx,.md,.markdown,.csv,.json,.jpg,.jpeg,.png,.txt';
  const zone=document.createElement('div');
  zone.tabIndex=0;zone.setAttribute('role','button');zone.setAttribute('aria-label',t.drop);
  zone.textContent=t.drop;
  zone.style.cssText='border:1px dashed #a9976a;border-radius:8px;margin:7px 0;padding:9px;text-align:center;cursor:pointer';
  const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='margin:5px 0;color:#735523';status.textContent=t.caveat;
  const list=document.createElement('ul');list.style.cssText='list-style:none;margin:5px 0;padding:0;max-height:100px;overflow:auto';
  const removeAll=button(t.clear);
  const processButton=button(local.process);
  const consentWrap=document.createElement('label');
  const consent=document.createElement('input');consent.type='checkbox';
  consentWrap.style.cssText='display:flex;gap:6px;align-items:flex-start;margin:5px 0;font-size:11px';
  consentWrap.append(consent,document.createTextNode(local.consent));
  consentWrap.hidden=!client.configured;
  processButton.hidden=!client.configured;
  const updateState=()=>{processButton.disabled=!consent.checked||processing||!staged.length||staged.every(f=>processed.has(f));};
  consent.onchange=()=>{consented=consent.checked;updateState();};
  mic.title=local.voice;
  const voiceNotice=document.createElement('span');voiceNotice.textContent=local.voice;voiceNotice.style.cssText='display:block;font-size:10px;color:#665b43;margin-top:3px';
  const heading=document.createElement('div');heading.textContent=t.files;heading.style.fontWeight='700';
  const docDrawer=document.createElement('details');
  docDrawer.style.cssText='max-height:170px;overflow:auto;margin-top:4px';
  const summary=document.createElement('summary');
  summary.style.cssText='cursor:pointer;font-weight:700';
  summary.textContent=t.files+' — 0/20';
  docDrawer.append(summary,zone,heading,list,removeAll,consentWrap,processButton,status);
  root.style.flexShrink='0';
  root.append(toolbar,voiceNotice,choose,docDrawer);
  root.dataset.wpaMultidoc=client.configured?'private-pilot-configured':'preview';
  status.textContent=client.configured?local.need:local.unavailable;
  form.parentNode.insertBefore(root,form);
  let reading=false;
  function render(){
    list.replaceChildren();
    staged.forEach((f,i)=>{
      const li=document.createElement('li');li.style.cssText='display:flex;gap:8px;align-items:center;justify-content:space-between';
      const label=document.createElement('span');label.textContent=f.name+' ('+(f.size/1024/1024).toFixed(2)+' MB) · '+(processed.has(f)?local.ready:local.select);
      const del=button('× '+t.remove);del.setAttribute('aria-label',t.remove+' '+f.name);
      del.disabled=processing;
      del.onclick=()=>{processed.delete(f);staged.splice(i,1);render();};
      li.append(label,del);list.append(li);
    });
    heading.textContent=t.files+' — '+staged.length+'/20 · '+processed.size+' '+local.ready;
    summary.textContent=heading.textContent;
    removeAll.disabled=processing;
    attach.disabled=processing;
    updateState();
  }
  function addFiles(files) {
    if(processing)return;
    docDrawer.open=true;
    let issue='';
    for(const file of files) {
      if(staged.length>=20){issue=t.limit;break;}
      if(!acceptable.test(file.name)){issue=t.invalid+' '+file.name;continue;}
      if(!file.size){issue=local.empty+' '+file.name;continue;}
      if(file.size>15*1024*1024){issue=t.large+' '+file.name;continue;}
      if(staged.some(f=>f.name===file.name&&f.size===file.size&&f.lastModified===file.lastModified))continue;
      staged.push(file);
    }
    render();status.textContent=(issue?issue+' ':'')+(client.configured?local.need:local.unavailable);
  }
  attach.onclick=()=>{docDrawer.open=true;choose.click();};choose.onchange=()=>{addFiles(Array.from(choose.files||[]));choose.value='';};
  zone.onclick=()=>choose.click();
  zone.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose.click();}};
  for(const kind of ['dragenter','dragover'])zone.addEventListener(kind,(e)=>{e.preventDefault();zone.style.background='#eee2bf';});
  for(const kind of ['dragleave','drop'])zone.addEventListener(kind,(e)=>{e.preventDefault();zone.style.background='';});
  zone.addEventListener('drop',(e)=>{e.stopPropagation();addFiles(Array.from(e.dataTransfer?.files||[]));});
  panel.addEventListener('dragover',e=>{if(Array.from(e.dataTransfer?.types||[]).includes('Files'))e.preventDefault();});
  panel.addEventListener('drop',e=>{const files=Array.from(e.dataTransfer?.files||[]);if(files.length){e.preventDefault();addFiles(files);}});
  removeAll.onclick=()=>{staged.length=0;processed.clear();render();status.textContent=privateMode?local.mode:(client.configured?local.need:local.unavailable);};
  processButton.onclick=async()=>{
    if(!client.configured||!consent.checked||processing)return;
    processing=true;consented=true;privateMode=true;
    const myGeneration=generation;conversionController=new AbortController();const signal=conversionController.signal;
    render();
    for(const f of staged.slice()){
      if(myGeneration!==generation||signal.aborted)break;
      if(processed.has(f))continue;
      status.textContent=local.processing+' '+(processed.size+1)+'/'+staged.length+' · '+f.name;
      try{
        const d=await client.convert(f,{signal});
        if(myGeneration!==generation||signal.aborted)break;
        processed.set(f,{...d,id:crypto.randomUUID()});
      }catch(e){
        if(myGeneration!==generation||signal.aborted)break;
        status.textContent=local.failed+' · '+f.name+' · '+String(e.message||'ERROR');
        processing=false;conversionController=null;render();return;
      }
    }
    if(myGeneration!==generation)return;
    processing=false;conversionController=null;render();
    status.textContent=local.done+' '+processed.size+'/'+staged.length+' · '+local.mode;
  };
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  let recogniser=null;
  if(Recognition) {
    mic.onclick=()=>{
      if(recogniser){recogniser.stop();return;}
      try{
        const r=new Recognition();recogniser=r;r.lang=english?'en-GB':'mk-MK';r.interimResults=false;r.continuous=false;
        r.onresult=(e)=>{const s=Array.from(e.results).map(x=>x[0]?.transcript||'').join(' ');input.value=(input.value+' '+s).trim().slice(0,input.maxLength>0?input.maxLength:700);input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();};
        r.onerror=(e)=>{status.textContent=e.error||t.noSpeech;};
        r.onend=()=>{recogniser=null;mic.textContent='🎙 '+t.mic;};
        r.start();mic.textContent='■ '+t.stop;
      }catch(e){recogniser=null;status.textContent=t.noSpeech;}
    };
  }else{mic.disabled=true;mic.title=t.noSpeech;}
  const synth=window.speechSynthesis;
  speech.onclick=()=>{
    if(!synth){status.textContent=t.noTts;return;}
    reading=!reading;speech.style.background=reading?'#ead8a5':'#fff';
    if(!reading){synth.cancel();return;}
    const last=panel.querySelector('.wpa-public-vs-row:not(.user):last-child .wpa-public-vs-bubble');
    if(last){synth.cancel();const utter=new SpeechSynthesisUtterance(last.textContent||'');utter.lang=english?'en-GB':'mk-MK';synth.speak(utter);}
  };
  stopSpeak.onclick=()=>{reading=false;speech.style.background='#fff';synth?.cancel();};
  const msgs=panel.querySelector('#wpaPublicVsMsgs');
  if(msgs) {
    const observer=new MutationObserver((records)=>{
      if(!reading||!synth)return;
      for(const record of records)for(const node of record.addedNodes){
        if(!(node instanceof Element)||!node.classList.contains('wpa-public-vs-row')||node.classList.contains('user'))continue;
        const response=node.querySelector('.wpa-public-vs-bubble')?.textContent;
        if(response){synth.cancel();const u=new SpeechSynthesisUtterance(response.slice(0,5000));u.lang=english?'en-GB':'mk-MK';synth.speak(u);}
      }
    });
    observer.observe(msgs,{childList:true});
  }
  const clear=panel.querySelector('#wpaPublicVsClear');
  clear?.addEventListener('click',()=>{
    generation++;conversionController?.abort();conversionController=null;processing=false;
    staged.length=0;processed.clear();consented=false;consent.checked=false;privateMode=false;
    try{recogniser?.abort();}catch{}synth?.cancel();reading=false;speech.style.background='#fff';
    render();docDrawer.open=false;status.textContent=client.configured?local.need:local.unavailable;
  });
  render();
  return {
    getStagedFiles:()=>staged.slice(),isServerConnected:client.configured,
    isPrivate:()=>privateMode||staged.length>0,
    canAnalyze:()=>client.configured&&consented&&consent.checked&&!processing&&processed.size===staged.length,
    blockedMessage:()=>client.configured?local.need:local.unavailable,
    async analyze({question,history,signal}){
      if(!client.configured||!consented||!consent.checked||processing||processed.size!==staged.length)throw Error('PRIVATE_DOCUMENTS_NOT_READY');
      privateMode=true;
      const data=await client.analyze({question,history,documents:[...processed.values()].map(({id,name,text,method})=>({id,name,text,method})),lang:english?'en':'mk',signal});
      const lines=data.coverage.map(x=>x.name+' ['+x.id+']: '+x.selected_chars+'/'+x.chars+' · '+x.method+' · '+x.coverage);
      return {answer:data.answer+(lines.length?'\n\n'+local.coverage+':\n'+lines.join('\n'):''),local:false,private:true,coverage:data.coverage};
    },
    async suggest({question,history,signal}){
      if(!client.configured||!consented||!consent.checked||!privateMode)throw Error('PRIVATE_PILOT_NOT_READY');
      return client.suggest({question,history,lang:english?'en':'mk',signal});
    }
  };
}
