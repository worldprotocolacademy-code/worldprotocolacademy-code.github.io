/* Virtual Sande AI — resilient universal public WPA widget — 2026-07-24 */
(function () {
  'use strict';

  if (window.__WPA_PUBLIC_VIRTUAL_SANDE_RECOVERY__) return;
  window.__WPA_PUBLIC_VIRTUAL_SANDE_RECOVERY__ = true;

  var currentPath = String(window.location.pathname || '/').toLowerCase();
  var excludedPrefixes = ['/wpaws/', '/student-desk/', '/diplomatic-analysis-lab/'];
  var excludedExact = ['/virtual-sande-ai.html'];
  // Canonical production endpoint. The retired legacy Worker is intentionally not
  // presented as failover because it does not accept the canonical production origin.
  var ENDPOINTS = [
    'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask'
  ];
  var busy = false;
  var history = [];

  function isExcluded() {
    if (excludedExact.indexOf(currentPath) !== -1) return true;
    for (var i = 0; i < excludedPrefixes.length; i += 1) {
      if (currentPath.indexOf(excludedPrefixes[i]) === 0) return true;
    }
    return false;
  }

  function isEnglish() {
    return String(document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  }

  function copy() {
    if (isEnglish()) {
      return {
        title: 'Virtual Sande AI',
        subtitle: 'World Protocol Academy academic assistant',
        welcome: 'Welcome. I am Virtual Sande AI, the academic assistant of World Protocol Academy.',
        placeholder: 'Ask about protocol, diplomacy, communication or security...',
        send: 'Send',
        clear: 'Clear',
        connecting: 'Connecting...',
        offline: 'WPA academic core',
        error: 'Virtual Sande is temporarily unable to reach the academic service. Please try again shortly.',
        label: 'Open Virtual Sande AI',
        close: 'Close'
      };
    }
    return {
      title: 'Virtual Sande AI',
      subtitle: 'Академски асистент на World Protocol Academy',
      welcome: 'Добредојдовте. Јас сум Virtual Sande AI, академски асистент на Светската академија за протокол.',
      placeholder: 'Поставете прашање за протокол, дипломатија, комуникација или безбедност...',
      send: 'Испрати',
      clear: 'Исчисти',
      connecting: 'Се поврзувам...',
      offline: 'WPA академско јадро',
      error: 'Virtual Sande привремено не може да се поврзе со академскиот сервис. Обидете се повторно за кратко.',
      label: 'Отвори Virtual Sande AI',
      close: 'Затвори'
    };
  }

  var LOCAL_CORE = {
    security: {
      mk: 'Безбедноста е состојба и организиран систем на мерки, институции и постапки насочени кон заштита на луѓето, вредностите, институциите и општеството од закани, ризици и штетни дејства. Во академска смисла, безбедноста не е само отсуство на опасност, туку и способност за превенција, подготвеност, одговор, отпорност и закрепнување.\n\nКратка WPA формулација: безбедноста е организирана способност за заштита, превенција, отпорност и континуитет пред закани и ризици.\n\nИзворна основа: World Protocol Academy — безбедносни студии, одбранбена дипломатија, кризни процедури и јавни настани.',
      en: 'Security is a condition and organised system of measures, institutions and procedures aimed at protecting people, values, institutions and society from threats, risks and harmful acts. In academic terms, security is not merely the absence of danger; it also includes the capacity for prevention, preparedness, response, resilience and recovery.\n\nConcise WPA formulation: security is the organised capacity for protection, prevention, resilience and continuity in the face of threats and risks.\n\nSource basis: World Protocol Academy — security studies, defence diplomacy, crisis procedures and public events.'
    },
    communicology: {
      mk: 'Комуникологијата е интердисциплинарна научна област што ги проучува процесите на создавање, пренесување, примање и толкување на пораки меѓу поединци, групи, институции и јавности. Таа ги анализира комуникациските модели, медиумите, јазикот, односите меѓу испраќачот и примачот, ефектите на пораките и општествениот контекст на комуникацијата.\n\nКратка WPA формулација: комуникологијата научно ги проучува комуникациските процеси, пораки, медиуми, односи и ефекти.\n\nИзворна основа: World Protocol Academy — комуникологија, јавна комуникација, односи со јавност и институционална репрезентација.',
      en: 'Communicology is an interdisciplinary field of study that examines the creation, transmission, reception and interpretation of messages among individuals, groups, institutions and publics. It analyses communication models, media, language, sender-receiver relationships, message effects and the social context of communication.\n\nConcise WPA formulation: communicology studies communication processes, messages, media, relationships and effects.\n\nSource basis: World Protocol Academy — communicology, public communication, public relations and institutional representation.'
    },
    artificial_intelligence: {
      mk: 'Вештачката интелигенција е област на компјутерската наука и инженерството што развива системи способни да извршуваат задачи кои обично бараат човечки когнитивни способности, како препознавање обрасци, обработка на јазик, учење, заклучување и генерирање содржина. Во рамката на WPA и AI PROTOCOL, способноста на ВИ не е исто што и институционален мандат: ВИ може да подготвува, анализира и препорачува, додека легитимноста, правата и конечната институционална одговорност остануваат човечки.\n\nКратка WPA формулација: ВИ е машинска способност за обработка, учење, генерирање и поддршка на одлуки под јасен човечки мандат и одговорност.\n\nИзворна основа: World Protocol Academy · AI PROTOCOL.',
      en: 'Artificial intelligence is a field of computer science and engineering that develops systems able to perform tasks that ordinarily require human cognitive capabilities, such as pattern recognition, language processing, learning, reasoning and content generation. In the WPA and AI PROTOCOL framework, AI capability is not the same as institutional mandate: AI may prepare, analyse and recommend, while legitimacy, rights and final institutional responsibility remain human.\n\nConcise WPA formulation: AI is machine capability for processing, learning, generation and decision support under a clear human mandate and responsibility.\n\nSource basis: World Protocol Academy · AI PROTOCOL.'
    },
    public_relations: {
      mk: 'Односите со јавност се планска, стратешка и двонасочна комуникациска функција преку која институцијата или организацијата гради и одржува односи на доверба и заемно разбирање со своите јавности. Тие опфаќаат институционална комуникација, медиумски односи, репутација, јавна појава и кризно комуницирање. Во рамката на WPA, односите со јавност се дел од пошироката јавна и стратегиска комуникација и не се сведуваат само на публицитет или промоција.\n\nКратка WPA формулација: односите со јавност ја управуваат врската меѓу институцијата, нејзините пораки и нејзините јавности преку доверба, јасност и одговорна комуникација.\n\nИзворна основа: World Protocol Academy — домен јавна комуникација, односи со јавност и институционална репутација.',
      en: 'Public relations is a planned, strategic and two-way communication function through which an institution or organisation builds and maintains relationships of trust and mutual understanding with its publics. It includes institutional communication, media relations, reputation, public presence and crisis communication. In the WPA framework, public relations belongs to the broader field of public and strategic communication and is not reduced to publicity or promotion.\n\nConcise WPA formulation: public relations manages the relationship between an institution, its messages and its publics through trust, clarity and responsible communication.\n\nSource basis: World Protocol Academy — public communication, public relations and institutional reputation domain.'
    },
    diplomatic_protocol: {
      mk: 'Дипломатскиот протокол е систем на правила, норми и утврдени постапки што го уредуваат официјалното однесување и церемонијалните односи меѓу државите, дипломатските мисии и нивните претставници. Тој ги опфаќа акредитацијата на амбасадорите, предавањето акредитивни писма, редот на предимство, официјалните посети, обраќањето, седењето, знамињата, пречекот и испраќањето, како и формата на дипломатската кореспонденција. Неговата суштина е да обезбеди еднаквост, достоинство, предвидливост и почитување на државниот суверенитет.\n\nВо практична смисла, дипломатијата ја носи политичката содржина и интересот, а дипломатскиот протокол ја уредува формата во која тие односи се остваруваат.\n\nИзворна основа: публикации и наставни материјали на Санде Смиљанов и World Protocol Academy.',
      en: 'Diplomatic protocol is the system of rules, norms and established procedures governing official conduct and ceremonial relations between states, diplomatic missions and their representatives. It covers ambassadorial accreditation, presentation of credentials, order of precedence, official visits, forms of address, seating, flags, reception and departure ceremonies, and diplomatic correspondence. Its purpose is to secure equality, dignity, predictability and respect for state sovereignty.\n\nIn practical terms, diplomacy carries the political substance and interests, while diplomatic protocol regulates the form through which those relations are conducted.\n\nSource basis: publications and teaching materials by Sande Smiljanov and World Protocol Academy.'
    },
    diplomacy: {
      mk: 'Дипломатијата е уметност, професија и институционална практика на управување со односите меѓу државите, меѓународните организации и другите меѓународни субјекти преку претставување, комуникација, преговарање и мирно усогласување на интересите. Таа е еден од главните инструменти за остварување на надворешната политика.\n\nДипломатијата ја определува содржината на односот — целите, интересите и преговорите — додека протоколот го определува редот, формата и официјалниот начин на постапување.\n\nИзворна основа: публикации и наставни материјали на Санде Смиљанов и World Protocol Academy.',
      en: 'Diplomacy is the art, profession and institutional practice of managing relations among states, international organisations and other international actors through representation, communication, negotiation and the peaceful adjustment of interests. It is one of the principal instruments of foreign policy.\n\nDiplomacy defines the substance of the relationship — objectives, interests and negotiations — while protocol defines the order, form and official manner of conduct.\n\nSource basis: publications and teaching materials by Sande Smiljanov and World Protocol Academy.'
    },
    state_protocol: {
      mk: 'Државниот протокол е систем на правила и институционални постапки што го уредуваат официјалното и церемонијалното дејствување на државните органи и носителите на највисоките јавни функции. Тој ги опфаќа редот на предимство, државните и официјалните посети, државните церемонии, употребата на симболите, почестите, седењето, потпишувањето и официјалното претставување на државата.\n\nНеговата цел е државниот авторитет да биде изразен точно, достоинствено и без институционална двосмисленост.\n\nИзворна основа: публикации и наставни материјали на Санде Смиљанов и World Protocol Academy.',
      en: 'State protocol is the system of rules and institutional procedures governing the official and ceremonial activity of state bodies and holders of the highest public offices. It covers order of precedence, state and official visits, state ceremonies, use of symbols, honours, seating, signing arrangements and the official representation of the state.\n\nIts purpose is to express state authority accurately, with dignity and without institutional ambiguity.\n\nSource basis: publications and teaching materials by Sande Smiljanov and World Protocol Academy.'
    },
    protocol: {
      mk: 'Протоколот е систем на правила, норми и стандарди што го уредуваат формалното, официјалното и церемонијалното однесување во јавниот и институционалниот живот. Тој го определува редот, формата и начинот на постапување меѓу личности, институции и држави.\n\nВо официјален контекст протоколот не е декоративен додаток, туку механизам на институционална јасност, достоинство и предвидливост.\n\nИзворна основа: публикации и наставни материјали на Санде Смиљанов и World Protocol Academy.',
      en: 'Protocol is the system of rules, norms and standards governing formal, official and ceremonial conduct in public and institutional life. It determines the order, form and manner of conduct among individuals, institutions and states.\n\nIn an official context, protocol is not a decorative addition but a mechanism of institutional clarity, dignity and predictability.\n\nSource basis: publications and teaching materials by Sande Smiljanov and World Protocol Academy.'
    },
    etiquette: {
      mk: 'Етикецијата, односно бон-тонот, е систем на правила за пристојно, рафинирано и општествено прифатливо однесување. Таа се однесува на личното и социјалното однесување, додека протоколот првенствено го уредува официјалното и институционалното.\n\nИзворна основа: публикации и наставни материјали на Санде Смиљанов и World Protocol Academy.',
      en: 'Etiquette, or bon ton, is the system of rules for courteous, refined and socially acceptable conduct. It concerns personal and social behaviour, while protocol primarily governs official and institutional conduct.\n\nSource basis: publications and teaching materials by Sande Smiljanov and World Protocol Academy.'
    },
    precedence: {
      mk: 'Редот на предимство е официјално утврдена хиерархија според која носителите на функции, дипломатските претставници и другите учесници се распоредуваат при церемонии, седење, поздравување, говори и потпишувања. Тој не претставува лична вредносна оцена, туку институционален ред што спречува конфликт, двосмисленост и протоколарна повреда.\n\nИзворна основа: публикации и наставни материјали на Санде Смиљанов и World Protocol Academy.',
      en: 'Order of precedence is the officially established hierarchy used to arrange office-holders, diplomatic representatives and other participants during ceremonies, seating, greetings, speeches and signings. It is not a personal value judgement, but an institutional order designed to prevent conflict, ambiguity and protocol breaches.\n\nSource basis: publications and teaching materials by Sande Smiljanov and World Protocol Academy.'
    },
    agrement: {
      mk: 'Агреман е претходна согласност што државата примач ја дава за лицето предложено за шеф на дипломатска мисија. Државата испраќач не треба официјално да го именува кандидатот пред да го добие агреманот. Одбивањето не мора да биде образложено.\n\nИзворна основа: дипломатска практика и наставни материјали на World Protocol Academy.',
      en: 'Agrément is the prior consent granted by the receiving state to a person proposed as head of a diplomatic mission. The sending state should not formally appoint the candidate before obtaining agrément, and a refusal need not be explained.\n\nSource basis: diplomatic practice and World Protocol Academy teaching materials.'
    }
  };

  function normalizeQuestion(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zа-шѓќѕџјљњ0-9]+/gi, ' ')
      .trim();
  }

  function localCoreAnswer(question) {
    var q = normalizeQuestion(question);
    var lang = isEnglish() ? 'en' : 'mk';
    var key = '';

    if (/безбедност|безбедносни студии|security|security studies/.test(q)) key = 'security';
    else if (/комуникологија|communicology|communication science/.test(q)) key = 'communicology';
    else if (/вештачк[а-я]* интелигенц[а-я]*|вештачак интелигенц[а-я]*|artificial intelligence/.test(q) || /^(што е|што претставува|која е дефиницијата за|објасни).*(^| )аи( |$)/.test(q)) key = 'artificial_intelligence';
    else if (/односи со јавност|јавни односи|public relations|(^| )pr( |$)/.test(q)) key = 'public_relations';
    else if (/дипломатски протокол|diplomatic protocol/.test(q)) key = 'diplomatic_protocol';
    else if (/државен протокол|state protocol/.test(q)) key = 'state_protocol';
    else if (/ред на предимство|редот на предимство|order of precedence|precedence/.test(q)) key = 'precedence';
    else if (/агреман|agrement|agrément/.test(q)) key = 'agrement';
    else if (/етикеција|бон тон|бон-тон|etiquette|bon ton/.test(q)) key = 'etiquette';
    else if (/дипломатија|diplomacy/.test(q)) key = 'diplomacy';
    else if (/протокол|protocol/.test(q)) key = 'protocol';

    return key && LOCAL_CORE[key] ? LOCAL_CORE[key][lang] : '';
  }

  function installStyles() {
    if (document.getElementById('wpa-public-vs-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-public-vs-style';
    style.textContent = [
      '.bot-wrap[data-wpa-legacy-bot="hidden"],.wpa2-bot-wrap[data-wpa-legacy-bot="hidden"]{display:none!important;visibility:hidden!important;pointer-events:none!important}',
      '.wpa-public-vs-fab{position:fixed!important;right:22px!important;bottom:22px!important;z-index:2147483600!important;width:64px!important;height:64px!important;border-radius:50%!important;border:2px solid #c9a84c!important;background:#0d1f3c!important;padding:0!important;overflow:hidden!important;cursor:pointer!important;box-shadow:0 12px 34px rgba(8,19,40,.36)!important;display:grid!important;place-items:center!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
      '.wpa-public-vs-fab img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}',
      '.wpa-public-vs-panel{position:fixed!important;right:22px!important;bottom:98px!important;z-index:2147483599!important;width:min(390px,calc(100vw - 28px))!important;height:min(570px,calc(100vh - 130px))!important;background:#fbf8ee!important;border:1px solid rgba(201,168,76,.7)!important;border-radius:14px!important;box-shadow:0 22px 60px rgba(8,19,40,.32)!important;display:none!important;overflow:hidden!important;font-family:Inter,system-ui,sans-serif!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
      '.wpa-public-vs-panel.open{display:flex!important;flex-direction:column!important}',
      '.wpa-public-vs-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#0d1f3c;color:#fff;border-bottom:1px solid #c9a84c}',
      '.wpa-public-vs-mark{width:38px;height:38px;border-radius:50%;overflow:hidden;border:1px solid #c9a84c;flex:0 0 38px}',
      '.wpa-public-vs-mark img{width:100%;height:100%;object-fit:cover}',
      '.wpa-public-vs-copy{min-width:0;flex:1}.wpa-public-vs-title{font:700 16px/1.1 Georgia,serif;color:#e8d49a}.wpa-public-vs-sub{font-size:10.5px;color:rgba(255,255,255,.75);margin-top:3px}',
      '.wpa-public-vs-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer;padding:2px 5px}',
      '.wpa-public-vs-status{min-height:18px;padding:4px 12px 0;background:#fbf8ee;color:#6c5830;font-size:10.5px}',
      '.wpa-public-vs-msgs{flex:1;overflow:auto;padding:14px;background:#fbf8ee}',
      '.wpa-public-vs-row{display:flex;margin:0 0 10px}.wpa-public-vs-row.user{justify-content:flex-end}',
      '.wpa-public-vs-bubble{max-width:88%;padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #d8d2bc;color:#1a1a1a;font-size:13.5px;line-height:1.55;white-space:pre-wrap}',
      '.wpa-public-vs-row.user .wpa-public-vs-bubble{background:#0d1f3c;color:#fff;border-color:#0d1f3c}',
      '.wpa-public-vs-form{display:flex;gap:8px;padding:10px;border-top:1px solid #d8d2bc;background:#f5f0e0}',
      '.wpa-public-vs-input,#botInput.bot-inp,.bot-inp,.wpa-inst-vs-input{flex:1;min-height:46px;max-height:110px;resize:vertical;border:1px solid #d7c485!important;border-radius:9px;padding:10px;font:13px/1.4 Inter,system-ui,sans-serif;outline:none!important;background:#fff;color:#1a1a1a;box-shadow:none!important;text-decoration:none!important;text-decoration-color:transparent!important;caret-color:#7b5f1f!important}',
      '.wpa-public-vs-input:focus,.wpa-public-vs-input:focus-visible,#botInput.bot-inp:focus,.bot-inp:focus,.wpa-inst-vs-input:focus,.wpa-inst-vs-input:focus-visible{border-color:#c9a84c!important;outline:2px solid rgba(201,168,76,.22)!important;outline-offset:1px!important;box-shadow:0 0 0 3px rgba(201,168,76,.12)!important;text-decoration:none!important;text-decoration-color:transparent!important}',
      '.wpa-public-vs-input:invalid,.wpa-public-vs-input:user-invalid,#botInput.bot-inp:invalid,.bot-inp:invalid,.wpa-inst-vs-input:invalid,.wpa-inst-vs-input:user-invalid{border-color:#d7c485!important;outline-color:rgba(201,168,76,.22)!important;box-shadow:none!important}',
      '.wpa-public-vs-send{border:0;border-radius:9px;background:#c9a84c;color:#081328;font-weight:800;padding:0 14px;cursor:pointer}',
      '.wpa-public-vs-send:disabled{opacity:.6;cursor:wait}',
      '.wpa-public-vs-tools{display:flex;justify-content:flex-end;padding:0 10px 9px;background:#f5f0e0}',
      '.wpa-public-vs-clear{border:0;background:transparent;color:#5a4220;font-size:11px;cursor:pointer}',
      '@media(max-width:520px){.wpa-public-vs-fab{right:14px!important;bottom:14px!important;width:58px!important;height:58px!important}.wpa-public-vs-panel{right:14px!important;bottom:82px!important;height:calc(100vh - 104px)!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function forceGoldInput(input) {
    if (!input || input.dataset.wpaGoldInputBound === '1') return;
    input.dataset.wpaGoldInputBound = '1';
    input.spellcheck = false;
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocomplete', 'off');
    input.style.setProperty('border-color', '#d7c485', 'important');
    input.style.setProperty('outline', 'none', 'important');
    input.style.setProperty('box-shadow', 'none', 'important');
    input.style.setProperty('text-decoration', 'none', 'important');
    input.style.setProperty('text-decoration-color', 'transparent', 'important');
    input.addEventListener('focus', function () {
      input.style.setProperty('border-color', '#c9a84c', 'important');
      input.style.setProperty('outline', '2px solid rgba(201,168,76,.22)', 'important');
      input.style.setProperty('outline-offset', '1px', 'important');
      input.style.setProperty('box-shadow', '0 0 0 3px rgba(201,168,76,.12)', 'important');
    });
    input.addEventListener('blur', function () {
      input.style.setProperty('border-color', '#d7c485', 'important');
      input.style.setProperty('outline', 'none', 'important');
      input.style.setProperty('box-shadow', 'none', 'important');
    });
  }

  function protectAllInputs() {
    var inputs = document.querySelectorAll('#wpaPublicVsInput,#wpaInstVsInput,#botInput,.bot-inp,.wpa-public-vs-input,.wpa-inst-vs-input');
    Array.prototype.forEach.call(inputs, forceGoldInput);
  }

  function hideLegacyBots() {
    var legacy = document.querySelectorAll('.bot-wrap,.wpa2-bot-wrap');
    Array.prototype.forEach.call(legacy, function (node) {
      if (!node.closest('#wpaPublicVsPanel')) node.setAttribute('data-wpa-legacy-bot', 'hidden');
    });
  }

  function addMessage(text, who) {
    var messages = document.getElementById('wpaPublicVsMsgs');
    if (!messages) return;
    var row = document.createElement('div');
    row.className = 'wpa-public-vs-row' + (who === 'user' ? ' user' : '');
    var bubble = document.createElement('div');
    bubble.className = 'wpa-public-vs-bubble';
    bubble.textContent = String(text || '');
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function answerFrom(data) {
    if (!data) return '';
    return data.answer || data.response || data.reply || data.message || data.output || data.text ||
      (data.result && (data.result.answer || data.result.response || data.result.text)) || '';
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = window.setTimeout(function () { if (controller) controller.abort(); }, timeoutMs);
    var requestOptions = Object.assign({}, options, controller ? { signal: controller.signal } : {});
    return fetch(url, requestOptions).finally(function () { window.clearTimeout(timer); });
  }

  function isNoContextAnswer(answer) {
    var q = normalizeQuestion(answer);
    return !q ||
      q.indexOf('нема доволно информации') !== -1 ||
      q.indexOf('не е доволно опфатено') !== -1 ||
      q.indexOf('нема доволно детали') !== -1 ||
      q.indexOf('консултирајте ја соодветната wpa публикација') !== -1 ||
      q.indexOf('insufficient information') !== -1 ||
      q.indexOf('not sufficiently covered') !== -1 ||
      q.indexOf('does not contain sufficient information') !== -1;
  }

  async function callEndpoint(endpoint, payload) {
    var response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }, 15000);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    var data = await response.json();
    var answer = answerFrom(data);
    if (!answer) throw new Error('Empty answer');
    return { answer: answer, data: data };
  }

  async function requestAnswer(question) {
    var lang = String(document.documentElement.lang || 'mk').toLowerCase().slice(0, 2) || 'mk';
    var payload = {
      message: question,
      question: question,
      query: question,
      lang: lang,
      language: lang,
      history: history.slice(-6),
      quality: '3layer_academic',
      source_priority: 'sande_author_corpus_first',
      proactive_fallback: true,
      context: 'World Protocol Academy public page: ' + currentPath
    };
    var lastError = null;
    for (var i = 0; i < ENDPOINTS.length; i += 1) {
      try {
        var remote = await callEndpoint(ENDPOINTS[i], payload);
        if (!isNoContextAnswer(remote.answer)) {
          return { answer: remote.answer, local: false, data: remote.data };
        }
        lastError = new Error('Academic backend returned no-context after retrieval/proactive path');
      } catch (error) {
        lastError = error;
      }
    }

    // Last-resort fail-safe only. It must never pre-empt the author corpus or proactive agent.
    var local = localCoreAnswer(question);
    if (local) return { answer: local, local: true };
    throw lastError || new Error('All endpoints unavailable');
  }

  async function send() {
    if (busy) return;
    var input = document.getElementById('wpaPublicVsInput');
    var question = input ? input.value.trim() : '';
    if (!question) return;

    busy = true;
    input.value = '';
    addMessage(question, 'user');
    history.push({ role: 'user', content: question });

    var button = document.getElementById('wpaPublicVsSend');
    var status = document.getElementById('wpaPublicVsStatus');
    if (button) button.disabled = true;
    if (status) status.textContent = copy().connecting;

    try {
      var result = await requestAnswer(question);
      addMessage(result.answer, 'bot');
      history.push({ role: 'assistant', content: result.answer });
      if (status) status.textContent = result.local ? copy().offline : '';
      if (result.local) window.setTimeout(function () { if (status && status.textContent === copy().offline) status.textContent = ''; }, 2200);
    } catch (error) {
      addMessage(copy().error, 'bot');
      if (status) status.textContent = '';
    } finally {
      busy = false;
      if (button) button.disabled = false;
      if (input) input.focus();
    }
  }

  function mount() {
    installStyles();
    protectAllInputs();
    if (isExcluded() || document.getElementById('wpaPublicVsFab') || !document.body) return;

    hideLegacyBots();
    var text = copy();
    var panel = document.createElement('section');
    panel.id = 'wpaPublicVsPanel';
    panel.className = 'wpa-public-vs-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', text.title);
    panel.setAttribute('data-virtual-sande-widget', 'public-recovery');
    panel.innerHTML = '<div class="wpa-public-vs-head"><span class="wpa-public-vs-mark"><img src="/logo.webp" alt="World Protocol Academy logo" width="38" height="38"></span><div class="wpa-public-vs-copy"><div class="wpa-public-vs-title">' + text.title + '</div><div class="wpa-public-vs-sub">' + text.subtitle + '</div></div><button class="wpa-public-vs-close" type="button" aria-label="' + text.close + '">×</button></div><div class="wpa-public-vs-status" id="wpaPublicVsStatus" aria-live="polite"></div><div class="wpa-public-vs-msgs" id="wpaPublicVsMsgs"></div><form class="wpa-public-vs-form" id="wpaPublicVsForm" novalidate><textarea class="wpa-public-vs-input" id="wpaPublicVsInput" maxlength="700" spellcheck="false" autocorrect="off" autocomplete="off" placeholder="' + text.placeholder + '"></textarea><button class="wpa-public-vs-send" id="wpaPublicVsSend" type="submit">' + text.send + '</button></form><div class="wpa-public-vs-tools"><button class="wpa-public-vs-clear" id="wpaPublicVsClear" type="button">' + text.clear + '</button></div>';

    var fab = document.createElement('button');
    fab.id = 'wpaPublicVsFab';
    fab.className = 'wpa-public-vs-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', text.label);
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('data-virtual-sande-widget', 'launcher-recovery');
    fab.innerHTML = '<img src="/logo.webp" alt="" width="64" height="64">';

    document.body.appendChild(panel);
    document.body.appendChild(fab);
    protectAllInputs();
    addMessage(text.welcome, 'bot');

    fab.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) document.getElementById('wpaPublicVsInput').focus();
    });

    panel.querySelector('.wpa-public-vs-close').addEventListener('click', function () {
      panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    });

    document.getElementById('wpaPublicVsForm').addEventListener('submit', function (event) {
      event.preventDefault();
      send();
    });

    document.getElementById('wpaPublicVsInput').addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    });

    document.getElementById('wpaPublicVsClear').addEventListener('click', function () {
      history = [];
      document.getElementById('wpaPublicVsMsgs').innerHTML = '';
      addMessage(copy().welcome, 'bot');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
        fab.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
  window.setTimeout(mount, 400);
  window.setTimeout(mount, 1600);
  window.setTimeout(protectAllInputs, 2500);
})();
