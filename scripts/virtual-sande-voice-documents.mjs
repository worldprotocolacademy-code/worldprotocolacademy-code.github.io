/* Virtual Sande voice and multi-document intake, browser-side candidate.
 * Voice uses native browser APIs. Files are NOT sent to /ask until a verified
 * attachment API exists; this prevents false claims of document analysis.
 */
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
  const heading=document.createElement('div');heading.textContent=t.files;heading.style.fontWeight='700';
  root.append(toolbar,choose,zone,heading,list,removeAll,status);
  form.parentNode.insertBefore(root,form);
  let reading=false;
  function render(){
    list.replaceChildren();
    staged.forEach((f,i)=>{
      const li=document.createElement('li');li.style.cssText='display:flex;gap:8px;align-items:center;justify-content:space-between';
      const label=document.createElement('span');label.textContent=f.name+' ('+(f.size/1024/1024).toFixed(2)+' MB)';
      const del=button('× '+t.remove);del.setAttribute('aria-label',t.remove+' '+f.name);
      del.onclick=()=>{staged.splice(i,1);render();};
      li.append(label,del);list.append(li);
    });
    heading.textContent=t.files+' — '+staged.length+'/20';
  }
  function addFiles(files) {
    let issue='';
    for(const file of files) {
      if(staged.length>=20){issue=t.limit;break;}
      if(!acceptable.test(file.name)){issue=t.invalid+' '+file.name;continue;}
      if(file.size>15*1024*1024){issue=t.large+' '+file.name;continue;}
      if(staged.some(f=>f.name===file.name&&f.size===file.size&&f.lastModified===file.lastModified))continue;
      staged.push(file);
    }
    render();status.textContent=(issue?issue+' ':'')+t.caveat;
  }
  attach.onclick=()=>choose.click();choose.onchange=()=>{addFiles(Array.from(choose.files||[]));choose.value='';};
  zone.onclick=()=>choose.click();
  zone.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose.click();}};
  for(const kind of ['dragenter','dragover'])zone.addEventListener(kind,(e)=>{e.preventDefault();zone.style.background='#eee2bf';});
  for(const kind of ['dragleave','drop'])zone.addEventListener(kind,(e)=>{e.preventDefault();zone.style.background='';});
  zone.addEventListener('drop',(e)=>{addFiles(Array.from(e.dataTransfer?.files||[]));});
  removeAll.onclick=()=>{staged.length=0;render();};
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  let recogniser=null;
  if(Recognition) {
    mic.onclick=()=>{
      if(recogniser){recogniser.stop();return;}
      try{
        const r=new Recognition();recogniser=r;r.lang=english?'en-GB':'mk-MK';r.interimResults=false;r.continuous=false;
        r.onresult=(e)=>{const s=Array.from(e.results).map(x=>x[0]?.transcript||'').join(' ');input.value=(input.value+' '+s).trim().slice(0,700);input.focus();};
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
  clear?.addEventListener('click',()=>{staged.length=0;render();synth?.cancel();reading=false;});
  render();
  return {getStagedFiles:()=>staged.slice(),isServerConnected:false};
}
