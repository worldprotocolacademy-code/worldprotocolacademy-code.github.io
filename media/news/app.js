(function(){
  "use strict";
  var root=document.getElementById("latestEdition");
  if(!root) return;
  function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){if(c==="&")return "&amp;";if(c==="<")return "&lt;";if(c===">")return "&gt;";if(c==='"')return "&quot;";return "&#39;";});}
  function fail(msg){root.innerHTML='<div class="live-state pending"><strong>Нема потврдено тековно дневно издание.</strong><br>'+esc(msg)+'</div>';}
  function skopjeDate(){
    var parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Skopje",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
    function get(k){return (parts.find(function(p){return p.type===k;})||{}).value||"";}
    return get("year")+"-"+get("month")+"-"+get("day");
  }
  Promise.all([
    fetch("/media/news/production/status.json",{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("status "+r.status);return r.json();}),
    fetch("/media/news/production/latest.json",{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("manifest "+r.status);return r.json();})
  ]).then(function(all){
    var s=all[0],p=all[1],date=String(s.product_date||"");
    if(!date || date!==String(p.product_date||""))throw new Error("Различни датуми на статусот и пакетот");
    var today=skopjeDate();
    var current=date===today;
    var approved=current && s.release_state==="WEB_TEXT_APPROVED";
    var stateLabel=approved?"ПРОВЕРЕНО ВЕБ-ИЗДАНИЕ":
      (current?"РАБОТЕН ПАКЕТ · ЧЕКА HUMAN GATE":"АРХИВСКИ ПАКЕТ · НЕ Е ДЕНЕШНА ВЕСТ");
    var info=approved?
      "Ова текстуално издание има одделно редакциско одобрување. Тоа не значи дека аудио, видео или социјалните објави се одобрени.":
      (current?"Пакетот е работен редакциски материјал. Фактите, преводот и изворите не се финално одобрени за јавно известување.":
        "Последниот зачуван пакет е од "+date+". За "+today+" нема потврдено тековно издание. Не ги користете старите текстови како денешни вести.");
    var sourceLines=(p.script_lines||[]),sources={};
    sourceLines.forEach(function(x){if(x.source_url)sources[x.source_url]=x.source||"Source";});
    var outs=s.outputs||{};
    var html='<div class="live-state '+(approved?'':'pending')+'">'+
      '<span class="live-badge">'+esc(stateLabel)+'</span>'+
      '<h2>'+esc(p.title||"WPA NEWS")+' · '+esc(date)+'</h2>'+
      '<p><strong>Статус:</strong> '+esc(s.release_state||"PENDING_HUMAN_GATE")+
      ' · <strong>траење (проценка):</strong> '+esc(s.runtime_estimate_minutes||"—")+
      ' мин · <strong>извори:</strong> '+Object.keys(sources).length+'</p>'+
      '<p role="status">'+esc(info)+'</p>';
    if(approved){
      var lead=sourceLines.find(function(x){return x.kind==="source_report";})||{};
      if(lead.text) html+='<p><strong>Водечка вест:</strong> '+esc(lead.text)+'</p>';
      html+='<div class="live-links">'+
        '<a href="'+esc(outs.teleprompter||"#")+'">Teleprompter</a>'+
        '<a href="'+esc(outs.transcript||"#")+'">Transcript</a>'+
        '<a href="'+esc(outs.captions||"#")+'">Captions</a>'+
        '<a href="'+esc(outs.manifest||"#")+'">Provenance</a>'+
        '</div>';
    }
    html+='</div>';
    root.innerHTML=html;
  }).catch(function(e){fail("Проверете ја редакциската линија и Human Gate. "+e.message);});
})();