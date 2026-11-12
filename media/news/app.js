(function(){
  "use strict";
  var root=document.getElementById("latestEdition");
  if(!root) return;
  function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){if(c==="&")return "&amp;";if(c==="<")return "&lt;";if(c===">")return "&gt;";if(c==='"')return "&quot;";return "&#39;";});}
  function fail(msg){root.innerHTML='<div class="live-state pending"><strong>Нема материјализирано дневно издание.</strong><br>'+esc(msg)+'</div>';}
  Promise.all([
    fetch("/media/news/production/status.json",{cache:"no-store"}).then(function(r){if(!r.ok) throw new Error("status "+r.status); return r.json();}),
    fetch("/media/news/production/latest.json",{cache:"no-store"}).then(function(r){if(!r.ok) throw new Error("manifest "+r.status); return r.json();})
  ]).then(function(all){
    var s=all[0], p=all[1];
    var lines=(p.script_lines||[]);
    var lead=lines.find(function(x){return x.kind==="source_report";})||{};
    var sources={}; lines.forEach(function(x){if(x.source_url) sources[x.source_url]=x.source||"Source";});
    var outs=s.outputs||{};
    root.innerHTML=
      '<div class="live-state"><div><span class="live-badge">ACTIVE PACK · HUMAN GATE</span><h2>'+esc(p.title||"WPA NEWS")+' · '+esc(s.product_date||"")+'</h2>'+
      '<p><strong>Статус:</strong> '+esc(s.release_state||"PENDING_HUMAN_GATE")+' · <strong>runtime:</strong> '+esc(s.runtime_estimate_minutes||"—")+' min · <strong>зборови:</strong> '+esc(s.word_count||"—")+' · <strong>извори:</strong> '+Object.keys(sources).length+'</p>'+
      (lead.text?'<p><strong>Lead:</strong> '+esc(lead.text)+'</p>':'')+
      '<p class="muted">Ова е production master за човечка проверка. Не е автоматски објавено видео и не значи дека voice/avatar render е завршен.</p></div>'+
      '<div class="live-links">'+
      '<a href="'+esc(outs.teleprompter||"#")+'">Teleprompter</a>'+
      '<a href="'+esc(outs.transcript||"#")+'">Transcript</a>'+
      '<a href="'+esc(outs.captions||"#")+'">Captions</a>'+
      '<a href="'+esc(outs.shorts||"#")+'">3 Shorts</a>'+
      '<a href="'+esc(outs.video_description||"#")+'">Video description</a>'+
      '<a href="'+esc(outs.social_copy||"#")+'">Social copy</a>'+
      '<a href="'+esc(outs.manifest||"#")+'">Provenance manifest</a>'+
      '</div></div>';
  }).catch(function(e){fail("Production pack сè уште не е одобрен/материјализиран на јавната WPA NEWS страница. "+e.message);});
})();