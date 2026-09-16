/* WPA Five Engines canonical master-list sync · P1 */
(function(){
  'use strict';
  const STATUS_URL='/data/master-list-verification-status.json';
  const FALLBACK={version:'v1.0-CORRECTED-4F-REV7',total:250,distinct:241};

  function lang(){return (document.documentElement.lang||'mk').toLowerCase().startsWith('en')?'en':'mk';}
  function text(meta){
    const en=lang()==='en';
    return {
      hero:en
        ?`For diplomats, students, and event organizers. Start with a quick 2-minute quiz, then explore a risk calculator, simulations, and the current canonical WPA Master List.`
        :`За дипломати, студенти и организатори на настани. Почни со брз тест од 2 минути, потоа истражи ризик-калкулатор, симулации и тековната канонска WPA Master List.`,
      map:en
        ?`An educational atlas of ${meta.total} records (${meta.distinct} distinct external institutions) from the current WPA Master List ${meta.version} — academies, think tanks, UN bodies, courts, and financial institutions, grouped by continent and category.`
        :`Едукативен атлас на ${meta.total} записи (${meta.distinct} одделни надворешни институции) од тековната WPA Master List ${meta.version} — академии, think tank-ови, УН тела, судови и финансиски институции, групирани по континент и категорија.`
    };
  }

  function apply(meta){
    const copy=text(meta);
    const hero=document.querySelector('[data-i18n="hero.lead"]');
    const map=document.querySelector('[data-i18n="map.desc"]');
    if(hero)hero.textContent=copy.hero;
    if(map)map.textContent=copy.map;
    document.querySelectorAll('.next-step-link').forEach((a)=>{
      if(!/Global Protocol Reference Map/i.test(a.textContent||''))return;
      a.textContent=lang()==='en'
        ?`Global Protocol Reference Map — current canonical master list →`
        :`Global Protocol Reference Map — тековна канонска мастер-листа →`;
    });
  }

  async function boot(){
    let meta={...FALLBACK};
    try{
      const r=await fetch(STATUS_URL,{cache:'no-store',headers:{accept:'application/json'}});
      if(r.ok){
        const j=await r.json();
        meta={
          version:j.canonical_dataset||FALLBACK.version,
          total:Number(j.dataset?.total_records)||FALLBACK.total,
          distinct:Number(j.dataset?.distinct_external_institutions)||FALLBACK.distinct
        };
      }
    }catch(_){/* fail-safe keeps REV7 values */}
    apply(meta);
    document.querySelectorAll('button.lang').forEach((b)=>b.addEventListener('click',()=>setTimeout(()=>apply(meta),0)));
    const mount=document.getElementById('quizMount');
    if(mount&&'MutationObserver'in window)new MutationObserver(()=>apply(meta)).observe(mount,{subtree:true,childList:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
