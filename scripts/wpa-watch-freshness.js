/* WPA Watch / Journal Watch freshness diagnostics · P1 */
(function(){
  'use strict';
  if(window.WPA_WATCH_FRESHNESS_LOADED)return;
  window.WPA_WATCH_FRESHNESS_LOADED=true;

  const WATCH_STATUS='/tools/wpa-watch/status.json';
  const JOURNAL_TOPICS='/journal/watch/topics.json';
  const HOUR=3600000;

  const esc=(s)=>String(s??'').replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const ageHours=(value)=>{const t=new Date(value).getTime();return Number.isFinite(t)?Math.max(0,(Date.now()-t)/HOUR):null;};
  const ageLabel=(hours)=>{
    if(hours==null)return 'unknown age';
    if(hours<1)return '< 1 hour old';
    if(hours<48)return `${Math.floor(hours)} hours old`;
    return `${Math.floor(hours/24)} days old`;
  };
  const band=(hours)=>hours==null?'unknown':hours<=36?'fresh':hours<=72?'warning':'stale';
  const bandLabel=(b)=>({fresh:'FRESH',warning:'AGING',stale:'STALE',unknown:'UNKNOWN'})[b]||'UNKNOWN';

  function style(){
    if(document.getElementById('wpa-freshness-style'))return;
    const el=document.createElement('style');
    el.id='wpa-freshness-style';
    el.textContent=`
      .wpa-freshness{margin:14px 0;padding:13px 15px;border-radius:10px;border:1px solid currentColor;font-size:13px;line-height:1.55}
      .wpa-freshness strong{letter-spacing:.04em}.wpa-freshness small{display:block;margin-top:4px;opacity:.86}
      .wpa-freshness.fresh{color:#2f6b3a;background:rgba(47,107,58,.08)}
      .wpa-freshness.warning{color:#8a6518;background:rgba(138,101,24,.08)}
      .wpa-freshness.stale{color:#8b1e2c;background:rgba(139,30,44,.08)}
      .wpa-freshness.unknown{color:#5c6675;background:rgba(92,102,117,.08)}
      body[style*="--navy"] .wpa-freshness.fresh,.console .wpa-freshness.fresh{color:#9fe6b8;background:rgba(159,230,184,.07)}
      body[style*="--navy"] .wpa-freshness.warning,.console .wpa-freshness.warning{color:#f5d78a;background:rgba(245,215,138,.07)}
      body[style*="--navy"] .wpa-freshness.stale,.console .wpa-freshness.stale{color:#ffb8b8;background:rgba(255,184,184,.07)}
    `;
    document.head.appendChild(el);
  }

  function mount(){
    let host=document.getElementById('wpa-freshness-diagnostics');
    if(host)return host;
    host=document.createElement('div');
    host.id='wpa-freshness-diagnostics';
    const status=document.getElementById('status');
    if(status)status.insertAdjacentElement('afterend',host);
    else (document.querySelector('main')||document.body).prepend(host);
    return host;
  }

  async function getJson(url){
    const r=await fetch(url+(url.includes('?')?'&':'?')+'ts='+Date.now(),{cache:'no-store',headers:{accept:'application/json'}});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  async function watchDiagnostics(){
    const host=mount();
    try{
      const s=await getJson(WATCH_STATUS);
      const hours=ageHours(s.generated),b=band(hours);
      const total=Number(s.sources_total)||0,live=Number(s.sources_live)||0,dead=Number(s.sources_dead)||0;
      const failed=Array.isArray(s.dead)?s.dead.map(x=>x?.name).filter(Boolean):[];
      host.className='wpa-freshness '+b;
      host.innerHTML=`<strong>Feed freshness: ${bandLabel(b)}</strong> · generated ${esc(s.generated||'unknown')} · ${esc(ageLabel(hours))}<br>`+
        `Source health: ${live}/${total||'—'} live${dead?` · ${dead} unavailable`:''}.`+
        (failed.length?`<small>Unavailable sources: ${failed.map(esc).join(', ')}.</small>`:'')+
        `<small>Candidate feed only. A stale or partially unavailable feed must not be treated as current evidence.</small>`;
    }catch(e){
      host.className='wpa-freshness unknown';
      host.innerHTML=`<strong>Feed freshness: UNKNOWN</strong><small>Could not read WPA Watch status (${esc(e.message||e)}). Manual verification required.</small>`;
    }
  }

  async function journalDiagnostics(){
    const host=mount();
    try{
      const [status,topics]=await Promise.all([getJson(WATCH_STATUS),getJson(JOURNAL_TOPICS)]);
      const generatedHours=ageHours(status.generated);
      const dates=(Array.isArray(topics)?topics:[]).map(t=>new Date(t?.date).getTime()).filter(Number.isFinite);
      const latest=dates.length?new Date(Math.max(...dates)):null;
      const topicHours=latest?Math.max(0,(Date.now()-latest.getTime())/HOUR):null;
      const worst=Math.max(generatedHours??Infinity,topicHours??Infinity),b=Number.isFinite(worst)?band(worst):'unknown';
      const total=Number(status.sources_total)||0,live=Number(status.sources_live)||0;
      host.className='wpa-freshness '+b;
      host.innerHTML=`<strong>Editorial freshness: ${bandLabel(b)}</strong> · latest topic ${latest?latest.toISOString().slice(0,10):'unknown'} (${esc(ageLabel(topicHours))})<br>`+
        `Underlying Watch feed: ${esc(ageLabel(generatedHours))} · source health ${live}/${total||'—'} live.`+
        `<small>Journal Watch is a staging editorial queue. Stale candidates require a new source sweep before being described as daily/current.</small>`;
    }catch(e){
      host.className='wpa-freshness unknown';
      host.innerHTML=`<strong>Editorial freshness: UNKNOWN</strong><small>Could not calculate current feed/topic age (${esc(e.message||e)}). Manual verification required.</small>`;
    }
  }

  function boot(){
    style();
    const p=location.pathname.replace(/\/+$/,'/');
    if(p==='/tools/wpa-watch/')watchDiagnostics();
    else if(p==='/journal/watch/')journalDiagnostics();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
