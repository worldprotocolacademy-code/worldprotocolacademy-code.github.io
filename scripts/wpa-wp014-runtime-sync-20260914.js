/* WPA WP-014 canonical runtime reconciliation · 2026-09-14 */
(function(){
'use strict';
if(window.__WPA_WP014_SYNC_20260914__)return;
window.__WPA_WP014_SYNC_20260914__=true;
var DOI='10.5281/zenodo.22749104';
var WP013={id:'013',mk:'Мостови наместо бариери: Протоколна анализа на официјалната посета на претседателката на Република Индија, Друпади Мурму, на Република Северна Македонија',en:'Bridges, Not Barriers: A Protocol Analysis of the Official Visit of the President of the Republic of India, Droupadi Murmu, to the Republic of North Macedonia',type:'Official Visit / India–North Macedonia Case Study',meta:'Version v14 · Bilingual MK/EN · 29 pages · 2026',desc:'Case-focused protocol analysis of the official visit of President Droupadi Murmu to the Republic of North Macedonia, presented as an author-reviewed WPA Working Paper with emphasis on the protocol architecture and public-facing institutional context of the visit.',doi:'10.5281/zenodo.21514266'};
function path(){return String(location.pathname||'/').toLowerCase().replace(/\/+$/,'')||'/';}
function textFix(root){
  if(!root||!document.createTreeWalker||typeof NodeFilter==='undefined')return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var t=n.parentNode&&n.parentNode.nodeName;return /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/.test(t)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}}),n;
  while((n=w.nextNode())){
    var s=String(n.nodeValue||'');
    s=s.replace(/13 Working Papers \+ 9 Protocol Notes \+ 1 (?:Global )?Strategic Plan/g,'14 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan')
      .replace(/23 public Zenodo records/g,'24 public Zenodo records')
      .replace(/13 WPA Working Papers \(Zenodo DOI\)/g,'14 WPA Working Papers (Zenodo DOI)')
      .replace(/Следните тринаесет working papers/g,'Следните четиринаесет working papers')
      .replace(/Тринаесетте WPA Working Papers/g,'Четиринаесетте WPA Working Papers')
      .replace(/Current Canonical Corpus · 26 August 2026/g,'Current Canonical Corpus · 14 September 2026');
    if(s!==n.nodeValue)n.nodeValue=s;
  }
}
function workingPapers(){
  var p=path();
  if(p!=='/working-papers'&&p!=='/working-papers/index.html')return;
  try{
    if(typeof papers!=='undefined'&&Array.isArray(papers)){
      if(!papers.some(function(x){return String(x.id)==='013';}))papers.push(WP013);
      papers.sort(function(a,b){var A=parseInt(a.id,10),B=parseInt(b.id,10);if(isNaN(A)||isNaN(B))return 0;return A-B;});
      if(typeof render==='function')render();
    }
  }catch(e){}
  var grid=document.getElementById('papersGrid');
  if(grid){
    var duplicates=document.querySelectorAll('#wp013');
    Array.prototype.forEach.call(duplicates,function(node){if(!grid.contains(node))node.remove();});
    var w13=document.getElementById('wp013'),w14=document.getElementById('wp014');
    if(w13&&w14&&w13.nextElementSibling!==w14)grid.insertBefore(w13,w14);
  }
  var current=document.querySelector('[data-wpa-current-corpus]');
  if(current)current.setAttribute('data-wpa-current-corpus','20260914');
}
function bibliography(){
  var p=path();
  if(p!=='/bibliography'&&p!=='/bibliography/index.html')return;
  var line=document.querySelector('.zenodo-doi-line');
  if(line)line.innerHTML='<strong>DOI coverage: 14 Zenodo records</strong> · Сите записи се author-reviewed public releases со трајни Zenodo DOI идентификатори.';
  var bar=document.querySelector('.zenodo-bar-segmented');
  if(bar){
    if(!bar.querySelector('[data-wpa-wp014-segment]')){
      var s=document.createElement('div');s.className='zenodo-seg seg-regional';s.dataset.wpaWp014Segment='1';s.title='BRICS Summit / Prospective Protocol & Protocol Fidelity Case Study: 1';s.textContent='1';bar.appendChild(s);
    }
    var segs=Array.prototype.slice.call(bar.querySelectorAll('.zenodo-seg'));
    var widths=['14.29%','28.57%','7.14%','7.14%','7.14%','7.14%','7.14%','7.14%','7.14%','7.14%'];
    segs.forEach(function(seg,i){if(widths[i])seg.style.width=widths[i];});
  }
  var legend=document.querySelector('.zenodo-legend');
  if(legend){
    var seen=false;
    Array.prototype.slice.call(legend.querySelectorAll('.zenodo-legend-item')).forEach(function(item){
      if(String(item.textContent||'').indexOf('Official Visit / India–North Macedonia Case Study')!==-1){
        if(seen)item.remove();else{seen=true;item.dataset.wpaWp013Category='1';}
      }
    });
    if(!legend.querySelector('[data-wpa-wp014-category]')){
      var i=document.createElement('div');i.className='zenodo-legend-item';i.dataset.wpaWp014Category='1';i.innerHTML='<span class="zenodo-legend-swatch sw-regional"></span><span><strong>BRICS Summit / Prospective Protocol & Protocol Fidelity Case Study · 1</strong><br><span class="leg-papers">WP-014 New Delhi 2026 — PFI · Selective Permeability · Status–Access Decoupling</span></span>';legend.appendChild(i);
    }
  }
}
function metrics(){if(path()!=='/wpa-metrics-status.html')return;var z=document.getElementById('zenodoTotal');if(z)z.textContent='24';}
function boot(){textFix(document.body);workingPapers();bibliography();metrics();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setTimeout(boot,600);setTimeout(boot,1600);
})();
