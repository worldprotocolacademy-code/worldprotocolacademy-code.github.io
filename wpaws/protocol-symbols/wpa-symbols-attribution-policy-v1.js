/* WPA Symbols Attribution Policy v1.0 — 2026-08-11
   Removes unnecessary author-name attribution from ordinary, independently
   verifiable reference facts while preserving attribution for genuinely authored
   doctrine, models, interpretations, quotations and WPA-specific scholarship.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_ATTRIBUTION_POLICY_V1__) return;
  window.__WPA_SYMBOLS_ATTRIBUTION_POLICY_V1__ = true;

  function s(v){ return String(v == null ? '' : v); }
  function norm(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[^\p{L}\p{N}]+/gu,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function asksForAuthoredView(question){
    var q = norm(question);
    if(!q) return false;
    return /санде|смиљанов|автор|author|protocolometry|протоколометр|доктрин|doctrine|wpa модел|wpa model|wpa framework|методолог|methodolog|класификац|classification|теори|theory|толкувањ|interpretation|мислењ|opinion|став|position|цитирај|quote|монограф|monograph|книга|book|труд|paper|истражувањ|research/.test(q) ||
      /според\s+(?:доц|д-р|др|санде|смиљанов|автор|wpa)/.test(q) ||
      /according to\s+(?:sande|smiljanov|the author|wpa)/.test(q);
  }

  function isOrdinaryReferenceQuestion(question){
    var q = norm(question);
    if(!q) return false;
    return /држав|земј|country|state|главен град|capital|знаме|flag|грб|coat of arms|амблем|emblem|симбол|symbol|химн|anthem|независност|independence|национален ден|national day|празник|holiday|датум|date|население|population|жители|површина|area|територи|territor|координат|gps|географ|geograph|континент|continent|регион|region|ресурс|resource|минерал|mineral|валут|currency|јазик|language|временска зона|time zone|повикувачки|calling code|iso|членство|membership|организац|organization|un |он |обединетите нации|united nations|призна|recognition|набљудувач|observer/.test(q);
  }

  function stripAuthorPrefix(text){
    var out = s(text);
    if(!out) return out;

    var patterns = [
      /^\s*Според\s+(?:авторот\s+)?(?:(?:Доц\.?|доц\.?)\s*)?(?:(?:д-р|др\.?|Dr\.?)\s*)?Санде\s+Смиљанов\s*,?\s*/i,
      /^\s*Според\s+(?:авторот\s+)?Санде\s+Смиљанов\s*,?\s*/i,
      /^\s*Како\s+што\s+наведува\s+(?:авторот\s+)?(?:(?:Доц\.?|доц\.?)\s*)?(?:(?:д-р|др\.?)\s*)?Санде\s+Смиљанов\s*,?\s*/i,
      /^\s*According\s+to\s+(?:the\s+author\s+)?(?:(?:Assoc\.?\s+Prof\.?|Professor|Prof\.?)\s*)?(?:(?:Dr\.?)\s*)?Sande\s+Smiljanov\s*,?\s*/i,
      /^\s*According\s+to\s+(?:the\s+author\s+)?Sande\s+Smiljanov\s*,?\s*/i
    ];

    for(var i=0;i<patterns.length;i++){
      if(patterns[i].test(out)){
        out = out.replace(patterns[i],'');
        break;
      }
    }

    // Also clean the same attribution when it appears at the beginning of a later sentence/line.
    out = out.replace(/(^|[\n.!?]\s+)Според\s+(?:авторот\s+)?(?:(?:Доц\.?|доц\.?)\s*)?(?:(?:д-р|др\.?)\s*)?Санде\s+Смиљанов\s*,?\s*/gi,'$1');
    out = out.replace(/(^|[\n.!?]\s+)According\s+to\s+(?:the\s+author\s+)?(?:(?:Assoc\.?\s+Prof\.?|Professor|Prof\.?)\s*)?(?:(?:Dr\.?)\s*)?Sande\s+Smiljanov\s*,?\s*/gi,'$1');

    return out.trim();
  }

  function latestUserQuestion(body,beforeNode){
    var nodes = Array.prototype.slice.call(body.querySelectorAll('.wpa-chat-msg'));
    var end = beforeNode ? nodes.indexOf(beforeNode) : nodes.length;
    if(end < 0) end = nodes.length;
    for(var i=end-1;i>=0;i--){
      if(nodes[i].classList.contains('user')) return s(nodes[i].textContent).trim();
    }
    return '';
  }

  function sanitizeBotNode(node){
    if(!node || node.nodeType !== 1 || !node.classList || !node.classList.contains('bot')) return;
    if(node.classList.contains('wpa-symbols-typing')) return;
    var body = node.closest('#chatBody') || document.getElementById('chatBody');
    if(!body) return;
    var q = latestUserQuestion(body,node);
    if(!q || asksForAuthoredView(q) || !isOrdinaryReferenceQuestion(q)) return;
    var oldText = s(node.textContent);
    var newText = stripAuthorPrefix(oldText);
    if(newText && newText !== oldText) node.textContent = newText;
  }

  function sanitizeExisting(){
    var body = document.getElementById('chatBody');
    if(!body) return;
    body.querySelectorAll('.wpa-chat-msg.bot').forEach(sanitizeBotNode);
  }

  function install(){
    var body = document.getElementById('chatBody');
    if(!body){ setTimeout(install,120); return; }
    if(body.__wpaAttributionPolicyV1) return;
    body.__wpaAttributionPolicyV1 = true;

    sanitizeExisting();
    var observer = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        Array.prototype.forEach.call(m.addedNodes,function(node){
          if(node.nodeType !== 1) return;
          if(node.classList && node.classList.contains('wpa-chat-msg')) sanitizeBotNode(node);
          if(node.querySelectorAll) node.querySelectorAll('.wpa-chat-msg.bot').forEach(sanitizeBotNode);
        });
      });
    });
    observer.observe(body,{childList:true,subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,500);
  setTimeout(sanitizeExisting,1600);
})();
