/* Public Phase 1. Browser voice only. No attachment, private API, or provider credentials. */
export function mountPublicVoice(panel){
 if(!panel||panel.querySelector('[data-wpa-public-voice]'))return null;
 const english=document.documentElement.lang?.toLowerCase().startsWith('en');
 const t=english?{mic:'Dictate',stop:'Stop',speak:'Read replies',stopSpeak:'Stop reading',noSpeech:'Speech recognition unavailable; type instead.',noTts:'Speech synthesis unavailable.'}:{mic:'Диктирај',stop:'Стоп',speak:'Читај ги одговорите',stopSpeak:'Стоп за говор',noSpeech:'Препознавањето говор не е достапно; користете тастатура.',noTts:'Говорната синтеза не е достапна.'};
 const input=panel.querySelector('#wpaPublicVsInput'),form=panel.querySelector('#wpaPublicVsForm');
 if(!input||!form)return null;
 const root=document.createElement('section');
 root.dataset.wpaPublicVoice='phase1';
 root.style.cssText='padding:6px 10px;background:#f5f0e0;color:#132844;border-top:1px solid #bcae87;font:12px/1.5 system-ui,sans-serif;flex-shrink:0';
 const toolbar=document.createElement('div');toolbar.style.cssText='display:flex;gap:6px;flex-wrap:wrap';
 const button=(label,action)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.wpaAction=action;b.style.cssText='border:1px solid #bcae87;border-radius:7px;background:#fff;color:#132844;padding:5px 8px;cursor:pointer';return b;};
 const mic=button('🎙 '+t.mic,'dictate'),speech=button('🔊 '+t.speak,'read'),stopSpeak=button('■ '+t.stopSpeak,'stop-voice');
 speech.setAttribute('aria-pressed','false');toolbar.append(mic,speech,stopSpeak);
 const notice=document.createElement('div');notice.style.cssText='font-size:10px;color:#665b43;margin-top:3px';
 notice.textContent=english?'Browser voice may use your browser provider; Macedonian availability varies. Document analysis is not yet available.':'Гласот може да користи сервис на прелистувачот; достапноста на македонски глас варира. Анализа на документи сè уште не е достапна.';
 root.append(toolbar,notice);form.parentNode.insertBefore(root,form);
 let reading=false;
 function announceVoice(message){const s=panel.querySelector('#wpaPublicVsStatus');if(s)s.textContent=message;}
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  let recogniser=null;
  if(Recognition) {
    mic.onclick=()=>{
      if(recogniser){recogniser.stop();return;}
      try{
        const r=new Recognition();recogniser=r;r.lang=english?'en-GB':'mk-MK';r.interimResults=false;r.continuous=false;
        r.onresult=(e)=>{
          if(recogniser!==r)return;
          const s=Array.from(e.results).map(x=>x[0]?.transcript||'').join(' ');
          const next=(input.value+' '+s).trim();
          if(next.length>(input.maxLength>0?input.maxLength:700)){
            announceVoice(english?'Dictation exceeds the message limit. Shorten the draft before continuing.':'Диктатот ја надминува должината на пораката. Скратете го текстот пред да продолжите.');return;
          }
          input.value=next;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();
        };
        r.onerror=(e)=>{if(recogniser===r)announceVoice(e.error||t.noSpeech);};
        r.onend=()=>{if(recogniser===r){recogniser=null;mic.textContent='🎙 '+t.mic;}};
        r.start();mic.textContent='■ '+t.stop;
      }catch(e){recogniser=null;mic.textContent='🎙 '+t.mic;announceVoice(t.noSpeech);}
    };
  }else{mic.disabled=true;mic.title=t.noSpeech;}
  const synth=window.speechSynthesis;
  function stopVoice(){
    const current=recogniser;recogniser=null;mic.textContent='🎙 '+t.mic;
    try{current?.abort();}catch{}
    reading=false;speech.style.background='#fff';speech.setAttribute('aria-pressed','false');synth?.cancel();
  }
  function speakText(value){
    if(!synth||!value)return;
    const language=english?'en-GB':'mk-MK';
    const voice=synth.getVoices().find(v=>v.lang.toLowerCase()===language.toLowerCase())||synth.getVoices().find(v=>v.lang.toLowerCase().startsWith(language.slice(0,2).toLowerCase()));
    // Do not silently use an unrelated voice for Macedonian.
    if(!voice&&!english){announceVoice(english?'No matching voice is installed.':'Нема инсталиран македонски глас во прелистувачот.');return;}
    synth.cancel();
    // Queue all text in bounded utterances, avoiding silent truncation.
    const words=value.match(/.{1,900}(?:\s|$)|.{1,900}/gs)||[];
    for(const part of words){const utter=new SpeechSynthesisUtterance(part);utter.lang=language;if(voice)utter.voice=voice;synth.speak(utter);}
  }
  speech.onclick=()=>{
    if(!synth){announceVoice(t.noTts);return;}
    reading=!reading;speech.style.background=reading?'#ead8a5':'#fff';speech.setAttribute('aria-pressed',String(reading));
    if(!reading){synth.cancel();return;}
    const replies=panel.querySelectorAll('.wpa-public-vs-row:not(.user) .wpa-public-vs-message-text');
    const last=replies[replies.length-1];if(last)speakText(last.textContent);
  };
  stopSpeak.onclick=stopVoice;
  const msgs=panel.querySelector('#wpaPublicVsMsgs');
  if(msgs) {
    const observer=new MutationObserver((records)=>{
      if(!reading||!synth)return;
      for(const record of records)for(const node of record.addedNodes){
        if(!(node instanceof Element)||!node.classList.contains('wpa-public-vs-row')||node.classList.contains('user'))continue;
        const response=node.querySelector('.wpa-public-vs-message-text')?.textContent;
        if(response)speakText(response);
      }
    });
    observer.observe(msgs,{childList:true});
  }

 panel.querySelector('#wpaPublicVsClear')?.addEventListener('click',stopVoice);
 return {stopVoice};
}
