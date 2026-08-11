/* WPA Symbols Capitals Guard v1.0 — 2026-08-11
   Deterministic capital-city layer for all records in active-runtime-197.json.

   Goals:
   - answer capital questions from the active WPA runtime, not AI guesswork
   - recognize Macedonian Cyrillic, Macedonian Latin transliteration and English
   - recognize common country aliases and a small typo tolerance for country names
   - preserve all other specialist layers by passing non-capital questions through
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_CAPITALS_V1__) return;
  window.__WPA_SYMBOLS_CAPITALS_V1__ = true;

  var active={records:[]};
  var verified={records:[]};
  var verifiedById={};
  var ready=false;

  function s(v){return String(v==null?'':v);}
  function norm(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[’'`]/g,' ')
      .replace(/[^\p{L}\p{N}]+/gu,' ')
      .replace(/\s+/g,' ').trim();
  }
  function uniq(a){return Array.from(new Set((a||[]).filter(Boolean)));}
  function id(v){return s(v).toLowerCase();}

  var LATIN_MAP={
    'а':'a','б':'b','в':'v','г':'g','д':'d','ѓ':'gj','е':'e','ж':'zh','з':'z','ѕ':'dz','и':'i','ј':'j','к':'k','ќ':'kj','л':'l','љ':'lj','м':'m','н':'n','њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','џ':'dz','ш':'sh'
  };
  function latinMk(v){
    return norm(v).split('').map(function(ch){return LATIN_MAP[ch]||ch;}).join('')
      .replace(/\s+/g,' ').trim();
  }

  var EXTRA={
    mk:['north macedonia','republic of north macedonia','macedonia','severna makedonija','makedonija','republika makedonija'],
    us:['united states','united states of america','usa','america','sad'],
    gb:['united kingdom','great britain','britain','uk','obedineto kralstvo','velika britanija'],
    cg:['congo','republic of the congo','congo brazzaville','kongo','republika kongo'],
    cd:['democratic republic of the congo','democratic republic of congo','dr congo','drc','congo kinshasa','dr kongo','demokratska republika kongo'],
    et:['ethiopia','etiopija'],
    er:['eritrea','eritreja','eriteja','еритеја','еритреја'],
    ke:['kenya','kenija'],
    gy:['guyana','gvajana'],
    ci:['cote d ivoire','ivory coast','breg na slonova koska'],
    cv:['cabo verde','cape verde','zelenortski ostrovi'],
    cz:['czechia','czech republic','ceshka','cheshka'],
    va:['vatican','vatican city','vatican city state','holy see','vatikan'],
    ps:['palestine','state of palestine','palestina'],
    xk:['kosovo'],
    kr:['south korea','republic of korea','juzhna koreja','juzna koreja'],
    kp:['north korea','democratic peoples republic of korea','severna koreja'],
    ae:['united arab emirates','uae','obedinетi arapski emirates','obedineti arapski emirati'],
    bn:['brunei','brunei darussalam'],
    bo:['bolivia','plurinational state of bolivia'],
    tz:['tanzania','united republic of tanzania'],
    ve:['venezuela','bolivarian republic of venezuela'],
    md:['moldova','republic of moldova'],
    la:['laos','lao peoples democratic republic'],
    sy:['syria','syrian arab republic'],
    ir:['iran','islamic republic of iran'],
    ru:['russia','russian federation'],
    vn:['vietnam','viet nam'],
    tw:['taiwan'],
    sz:['eswatini','swaziland']
  };

  function fetchJson(url){
    return fetch(url,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});
  }

  var loadPromise=Promise.all([
    fetchJson('./data/active-runtime-197.json?v=20260811-capitals1').catch(function(){return null;}),
    fetchJson('./data/countries.json?v=20260811-capitals1').catch(function(){return null;})
  ]).then(function(parts){
    if(parts[0]&&Array.isArray(parts[0].records))active=parts[0];
    if(parts[1]&&Array.isArray(parts[1].records))verified=parts[1];
    verifiedById={};
    verified.records.forEach(function(r){verifiedById[id(r.id)]=r;});
    ready=active.records.length>=190;
    return ready;
  });

  function vr(r){return r?(verifiedById[id(r.id)]||null):null;}

  function intlEnglishName(r){
    try{
      if(typeof Intl==='undefined'||typeof Intl.DisplayNames!=='function')return'';
      var code=s(r.id).toUpperCase();
      if(!/^[A-Z]{2}$/.test(code))return'';
      var value=new Intl.DisplayNames(['en'],{type:'region'}).of(code);
      if(!value||value===code)return'';
      return value;
    }catch(e){return'';}
  }

  function aliases(r){
    var v=vr(r),a=[r.name_mk,latinMk(r.name_mk),intlEnglishName(r)];
    if(v){
      a.push(v.name_mk,v.name_en,latinMk(v.name_mk));
      if(Array.isArray(v.aliases))a=a.concat(v.aliases);
    }
    var ex=EXTRA[id(r.id)];
    if(Array.isArray(ex))a=a.concat(ex);
    return uniq(a.map(norm).filter(function(x){return x.length>=2;})).sort(function(x,y){return y.length-x.length;});
  }

  function capitalIntent(q){
    var z=norm(q);
    return /(главен град|главниот град|главни градови|престолнин|glaven grad|glavni grad|glavniot grad|glavni gradovi|prestonin|prestolnin|capital|capitals|capital city)/.test(z);
  }

  function allCapitalsIntent(q){
    var z=norm(q);
    return capitalIntent(q)&&/(сите|197|all|every)/.test(z)&&/(држав|земј|country|countries|world|свет)/.test(z);
  }

  function levenshtein(a,b){
    a=norm(a);b=norm(b);
    var m=a.length,n=b.length;
    if(!m)return n;if(!n)return m;
    var prev=new Array(n+1),cur=new Array(n+1),i,j;
    for(j=0;j<=n;j++)prev[j]=j;
    for(i=1;i<=m;i++){
      cur[0]=i;
      for(j=1;j<=n;j++){
        var cost=a.charAt(i-1)===b.charAt(j-1)?0:1;
        cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+cost);
      }
      var tmp=prev;prev=cur;cur=tmp;
    }
    return prev[n];
  }

  function candidateFromQuestion(q){
    var z=norm(q),m;
    var patterns=[
      /(?:главен град|главниот град|престолнината|престолнина)\s+(?:на|е на)?\s*(.+)$/,
      /(?:glaven grad|glavniot grad|glavni grad|prestoninata|prestonina|prestolninata|prestolnina)\s+(?:na|e na)?\s*(.+)$/,
      /(?:capital city|capital)\s+(?:of|is of|for)?\s*(.+)$/
    ];
    for(var i=0;i<patterns.length;i++){
      m=z.match(patterns[i]);
      if(m&&m[1]){
        return m[1].replace(/^(of|na|e|is|the)\s+/,'').trim();
      }
    }
    return'';
  }

  function findEntity(q){
    if(!ready)return null;
    var z=norm(q),best=null,bestLen=0;

    active.records.forEach(function(r){
      aliases(r).forEach(function(a){
        if(a.length<2)return;
        var padded=' '+z+' ';
        if(padded.indexOf(' '+a+' ')>=0||z.indexOf(a)>=0){
          if(a.length>bestLen){best=r;bestLen=a.length;}
        }
      });
    });
    if(best)return best;

    var candidate=candidateFromQuestion(q);
    if(!candidate||candidate.length<4)return null;
    var fuzzy=[];
    active.records.forEach(function(r){
      aliases(r).forEach(function(a){
        if(a.length<4)return;
        var d=levenshtein(candidate,a);
        var limit=a.length>=10?2:1;
        if(d<=limit)fuzzy.push({r:r,d:d,len:a.length});
      });
    });
    fuzzy.sort(function(x,y){return x.d-y.d||y.len-x.len;});
    if(!fuzzy.length)return null;
    if(fuzzy.length>1&&fuzzy[0].d===fuzzy[1].d&&id(fuzzy[0].r.id)!==id(fuzzy[1].r.id))return null;
    return fuzzy[0].r;
  }

  function displayName(r){
    var v=vr(r);
    if(window.WPA_CHAT_LANG==='en')return (v&&v.name_en)||intlEnglishName(r)||r.name_mk||s(r.id).toUpperCase();
    return r.name_mk||(v&&(v.name_mk||v.name_en))||s(r.id).toUpperCase();
  }

  function displayCapital(r){
    var v=vr(r),cap=s(r.capital_mk||(v&&v.capital)||'—').trim()||'—';
    if(window.WPA_CHAT_LANG==='en'&&v&&v.capital)return s(v.capital);
    return cap;
  }

  function answer(q){
    if(!capitalIntent(q)||!ready)return null;
    if(allCapitalsIntent(q)){
      var rows=active.records.filter(function(r){return s(r.capital_mk).trim();}).map(function(r){
        return '• '+displayName(r)+' — '+displayCapital(r);
      });
      return (window.WPA_CHAT_LANG==='en'
        ? '🏙️ Capitals in the active WPA 197-record dataset:\n'
        : '🏙️ Главни градови во активниот WPA dataset со 197 записи:\n')+rows.join('\n');
    }
    var r=findEntity(q);
    if(!r)return null;
    return '🏙️ '+displayName(r)+' — '+displayCapital(r);
  }

  function add(role,text){
    var body=document.getElementById('chatBody');
    if(!body)return;
    var d=document.createElement('div');
    d.className='wpa-chat-msg '+role;
    d.textContent=text;
    body.appendChild(d);
    body.scrollTop=body.scrollHeight;
  }

  function install(){
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaCapitalsV1){
      var prevSend=window.sendChat;
      var send=async function(){
        var input=document.getElementById('chatInput');
        if(!input)return prevSend();
        var q=input.value.trim();
        if(!q||!capitalIntent(q))return prevSend();
        try{await loadPromise;}catch(e){}
        var a=answer(q);
        if(!a)return prevSend();
        add('user',q);
        input.value='';
        add('bot',a);
        input.focus();
      };
      send.__wpaCapitalsV1=true;
      window.sendChat=send;
    }

    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaCapitalsV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return answer(q)||prevAnswer(q);};
      wrapped.__wpaCapitalsV1=true;
      window.wpaBotAnswer=wrapped;
    }
  }

  install();
  loadPromise.then(install).catch(function(){});
  setTimeout(install,900);
  setTimeout(install,1800);
  setTimeout(install,2800);
  setTimeout(install,4200);
})();
