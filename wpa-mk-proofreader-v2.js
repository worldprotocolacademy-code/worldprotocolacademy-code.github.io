/*!
 * WPA Macedonian Proofreader v2
 * Lightweight public-site guard. It does not replace human proofreading.
 * Basis: Macedonian literary language governance aligned with the 2017 orthographic standard.
 */
(function(){
  'use strict';

  const SERBIANISMS = [
    {bad:'уствари', good:'всушност'},
    {bad:'значи дека', good:'значи дека', note:'ok when literal; avoid filler usage'},
    {bad:'ради тоа', good:'поради тоа'},
    {bad:'било кој', good:'кој било'},
    {bad:'секојдневно', good:'секојдневно'},
    {bad:'со оглед да', good:'со оглед на тоа дека'},
    {bad:'наравно', good:'секако'},
    {bad:'пошто', good:'бидејќи'},
    {bad:'тако', good:'така'},
    {bad:'исто така', good:'исто така'},
    {bad:'свакако', good:'секако'},
    {bad:'треба да се направи', good:'треба да се изработи / треба да се направи', note:'choose contextually'}
  ];

  const RISKY_PUBLIC_PHRASES = [
    'другар',
    'царе',
    'не ми текнува',
    'како што зборевме',
    'интерни муабети',
    'ќе видиме после',
    'ако не ти е тешко'
  ];

  const FALSE_CLAIMS = [
    'ISO certified',
    'ISO сертифициран',
    'акредитиран',
    'Scopus indexed',
    'Web of Science indexed',
    'DOI assigned',
    'ISSN:',
    'официјален партнер'
  ];

  function scanText(text){
    const findings = [];
    const lower = String(text || '').toLowerCase();

    SERBIANISMS.forEach(rule => {
      if(lower.includes(rule.bad.toLowerCase())) {
        findings.push({type:'mk-style', level:'warning', found:rule.bad, suggestion:rule.good, note:rule.note || ''});
      }
    });

    RISKY_PUBLIC_PHRASES.forEach(p => {
      if(lower.includes(p.toLowerCase())) findings.push({type:'public-tone', level:'warning', found:p, suggestion:'Отстрани интерен/неформален муабет од јавна страница.'});
    });

    FALSE_CLAIMS.forEach(p => {
      if(lower.includes(p.toLowerCase())) findings.push({type:'claims', level:'critical', found:p, suggestion:'Провери дали тврдењето е формално точно и документирано.'});
    });

    if(/\s+[,.!?;:]/.test(text)) findings.push({type:'punctuation', level:'warning', found:'space before punctuation', suggestion:'Отстрани празно место пред интерпункција.'});
    if(/[A-Za-z]{8,}/.test(text) && /[А-Ша-шЃѓЌќЉљЊњЏџ]/.test(text)) findings.push({type:'mixed-script', level:'info', found:'mixed Latin/Cyrillic', suggestion:'Провери дали англиските термини се намерни.'});

    return findings;
  }

  function scanPage(){
    const text = document.body ? document.body.innerText : '';
    const findings = scanText(text);
    document.dispatchEvent(new CustomEvent('wpa:mk-proofreader-results', {detail:{findings}}));
    return findings;
  }

  window.WPAMKProofreaderV2 = {scanText, scanPage};

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanPage);
  } else {
    setTimeout(scanPage, 0);
  }
})();
