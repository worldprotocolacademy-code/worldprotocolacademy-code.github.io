/* WPA Symbols flag-ratio expert layer v1.0 — 2026-08-11 */
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_RATIO_V1__) return;
  window.__WPA_SYMBOLS_RATIO_V1__=true;

  var records=[];
  function s(v){return String(v==null?'':v);}
  function clean(v){return s(v).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}:.,/ -]+/gu,' ').replace(/\s+/g,' ').trim();}
  function mk(q){return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));}
  function parseRatio(text){
    var m=s(text).match(/(?:Размер|ratio|proportion)\s*([0-9]+(?:\.[0-9]+)?)\s*:\s*([0-9]+(?:\.[0-9]+)?)/i);
    if(!m) return null;
    var a=Number(m[1]),b=Number(m[2]);
    if(!a||!b) return null;
    return {label:m[1]+':'+m[2],value:a/b};
  }
  function name(r){return r.name_mk||r.n||r.name_en||s(r.id).toUpperCase();}
  function flagText(r){return r.flag_summary_mk||r.f||'';}

  fetch('./data/active-runtime-197.json?v=20260811-ratio1',{cache:'no-store'})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(d){if(d&&Array.isArray(d.records)) records=d.records;})
    .catch(function(){});

  function ratioAnswer(question){
    var q=clean(question),isMk=mk(question);
    if(!/(размер|сооднос|пропорц|ratio|proportion|aspect)/.test(q)) return null;
    if(!/(знаме|знамиња|flag)/.test(q)) return null;
    if(!records.length) return null;

    var parsed=records.map(function(r){var p=parseRatio(flagText(r));return p?{r:r,p:p}:null;}).filter(Boolean);
    if(!parsed.length) return null;

    var nonRect=records.filter(function(r){return /неправоагол|non-rectangular|double-pennant|pennant|триагол/.test(clean(flagText(r)));});
    var wantsSmall=/помал|најмал|smallest|lowest|narrowest/.test(q);
    var wantsLarge=/поголем|најголем|largest|widest/.test(q);

    if(wantsSmall){
      var min=Math.min.apply(null,parsed.map(function(x){return x.p.value;}));
      var hits=parsed.filter(function(x){return Math.abs(x.p.value-min)<0.00001;});
      return [
        isMk?'📐 Најмал правоаголен однос ширина:висина во активниот WPA dataset:':'📐 Smallest rectangular width:height ratio in the active WPA dataset:',
        hits.map(function(x){return '• '+name(x.r)+' — '+x.p.label;}).join('\n'),
        nonRect.length?(isMk?'Напомена: неправаголни знамиња (на пр. Непал, ако е така означен во записот) не се споредуваат коректно само со еден правоаголен ratio.':'Note: non-rectangular flags (for example Nepal, if marked that way in the record) are not meaningfully compared by a single rectangular ratio.'):'',
        isMk?'Толкување: 1:1 е поквадратно/помалку широко од 2:3, 3:5 или 1:2.':'Interpretation: 1:1 is squarer/less wide than 2:3, 3:5 or 1:2.'
      ].filter(Boolean).join('\n\n');
    }

    if(wantsLarge){
      var max=Math.max.apply(null,parsed.map(function(x){return x.p.value;}));
      var wide=parsed.filter(function(x){return Math.abs(x.p.value-max)<0.00001;});
      return [
        isMk?'📐 Најголем правоаголен однос ширина:висина во активниот WPA dataset:':'📐 Largest rectangular width:height ratio in the active WPA dataset:',
        wide.map(function(x){return '• '+name(x.r)+' — '+x.p.label;}).join('\n')
      ].join('\n\n');
    }

    var groups={};
    parsed.forEach(function(x){groups[x.p.label]=(groups[x.p.label]||0)+1;});
    var common=Object.keys(groups).sort(function(a,b){return groups[b]-groups[a];}).slice(0,8);
    return [
      isMk?'📐 Најчести размери на знамиња во активниот WPA dataset:':'📐 Most common flag ratios in the active WPA dataset:',
      common.map(function(k){return '• '+k+' — '+groups[k]+' '+(isMk?'записи':'records');}).join('\n'),
      isMk?'Прашај „кое знаме има најмал размер?“ или „кое е најшироко?“ за рангиран одговор.':'Ask “which flag has the smallest ratio?” or “which is the widest?” for a ranked answer.'
    ].join('\n\n');
  }

  function install(){
    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaRatioV1){
      var prev=window.wpaBotAnswer;
      var fn=function(q){return ratioAnswer(q)||prev(q);};
      fn.__wpaRatioV1=true;
      window.wpaBotAnswer=fn;
    }
  }
  install();
  setTimeout(install,400);
  setTimeout(install,1400);
})();
