/* WPA corpus publication sync — PN-005 and PN-006 — 2026-07-29 */
(function () {
  'use strict';
  if (window.WPA_CORPUS_20260729_LOADED) return;
  window.WPA_CORPUS_20260729_LOADED = true;

  var PN005 = {
    no: '005',
    titleMk: 'Протокол на вештачката интелигенција и државниот суверенитет',
    titleEn: 'Protocol of Artificial Intelligence and State Sovereignty',
    version: '1.6',
    date: '28 July 2026',
    doi: '10.5281/zenodo.21651611',
    doiUrl: 'https://doi.org/10.5281/zenodo.21651611',
    summaryMk: 'Двојазична протоколарна белешка за управувањето со најнапредна ВИ во национално-безбедносни средини, со протоколометриската рамка на WPA, Индексот на ефективен ВИ-суверенитет (ИЕВИС/EASI), когнитивниот суверенитет и поделената, но не и растворена одговорност.',
    summaryEn: 'A bilingual Protocol Note on frontier-AI governance in national-security environments, introducing the WPA protocolometric framework, the Effective AI Sovereignty Index (EASI), cognitive sovereignty and shared but undissolved responsibility.'
  };

  var PN006 = {
    no: '006',
    titleMk: 'Невропротокол 2030: Од мисла до дејство',
    titleEn: 'Neuroprotocol 2030: From Thought to Action',
    version: '1.6',
    date: '29 July 2026',
    doi: '10.5281/zenodo.21669195',
    doiUrl: 'https://doi.org/10.5281/zenodo.21669195',
    summaryMk: 'Двојазична протоколарна белешка што го воведува невропротоколот, Индексот на ефективна отелотворена команда (ИЕОК/EECI), невронската приватност, човечката потврда и WPA Right to Pause во преминот од мисла кон дигитално или физичко дејство.',
    summaryEn: 'A bilingual Protocol Note introducing neuroprotocol, the Effective Embodied Command Index (EECI), neural privacy, human confirmation and the WPA Right to Pause in the passage from thought to digital or physical action.'
  };

  var applying = false;
  var scheduled = false;

  function path() {
    return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  }

  function text(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function setMeta(name, value, property) {
    var selector = property ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
    var node = document.querySelector(selector);
    if (node) node.setAttribute('content', value);
  }

  function replaceTextNodes(root, replacements) {
    if (!root || !document.createTreeWalker) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (item) {
      var value = item.nodeValue;
      var next = value;
      replacements.forEach(function (pair) { next = next.replace(pair[0], pair[1]); });
      if (next !== value) item.nodeValue = next;
    });
  }

  function replaceCorpusCounts() {
    replaceTextNodes(document.body, [
      [/13 Working Papers \+ 4 Protocol Notes \+ 1 Strategic Plan(?: report)? = 18(?: total WPA Zenodo records| records)?/g, '13 Working Papers + 6 Protocol Notes + 1 Strategic Plan = 20 records'],
      [/17 WPA series DOI records \(13 Working Papers \+ 4 Protocol Notes\) plus 1 Global Strategic Plan report = 18 total WPA Zenodo records/g, '19 WPA series DOI records (13 Working Papers + 6 Protocol Notes) plus 1 Global Strategic Plan report = 20 total WPA Zenodo records'],
      [/17 WPA Series DOI Records/g, '19 WPA Series DOI Records'],
      [/17 WPA series DOI records/g, '19 WPA series DOI records'],
      [/17 total WPA Zenodo DOI records/g, '19 total WPA Zenodo DOI records'],
      [/18 Total WPA Zenodo Records/g, '20 Total WPA Zenodo Records'],
      [/18 total WPA Zenodo records/g, '20 total WPA Zenodo records'],
      [/15 published WPA Zenodo records/g, '19 published WPA series DOI records'],
      [/fifteen public DOI records: twelve Working Papers and three Protocol Notes/gi, 'nineteen public DOI records: thirteen Working Papers and six Protocol Notes'],
      [/twelve Working Papers and three Protocol Notes/gi, 'thirteen Working Papers and six Protocol Notes'],
      [/12 Working Papers \+ 3 Protocol Notes/g, '13 Working Papers + 6 Protocol Notes'],
      [/13 Working Papers \+ 4 Protocol Notes/g, '13 Working Papers + 6 Protocol Notes'],
      [/4 WPA Protocol Notes/g, '6 WPA Protocol Notes'],
      [/3 WPA Protocol Notes/g, '6 WPA Protocol Notes'],
      [/2 WPA Protocol Notes/g, '6 WPA Protocol Notes'],
      [/WPA Protocol Notes 001–004/g, 'WPA Protocol Notes 001–006'],
      [/WPA Protocol Notes 001–003/g, 'WPA Protocol Notes 001–006'],
      [/Protocol Notes 001–004/g, 'Protocol Notes 001–006'],
      [/Protocol Notes 001–003/g, 'Protocol Notes 001–006'],
      [/Published · PN-001–PN-004 · 2026/g, 'Published · PN-001–PN-006 · 2026'],
      [/Published · PN-001–PN-003 · 2026/g, 'Published · PN-001–PN-006 · 2026'],
      [/Последно ажурирано: 23 јули 2026/g, 'Последно ажурирано: 29 јули 2026'],
      [/Last updated: 23 July 2026/g, 'Last updated: 29 July 2026'],
      [/Последно ажурирано: 16 јули 2026/g, 'Последно ажурирано: 29 јули 2026'],
      [/Last updated: 16 July 2026/g, 'Last updated: 29 July 2026']
    ]);
  }

  function latestHomeCard(item, latest) {
    return '<div class="wpa-latest-pn-grid"><div>' +
      '<div class="wpa-latest-pn-kicker">' + (latest ? 'Најнова Zenodo публикација · Latest Zenodo publication' : 'Нова Zenodo публикација · New Zenodo publication') + ' · WPA Protocol Note No. ' + item.no + '</div>' +
      '<h4 id="wpa-pn-' + item.no + '-title">' + item.titleMk + '</h4>' +
      '<div class="wpa-latest-pn-en">' + item.titleEn + '</div>' +
      '<p>' + item.summaryMk + ' / ' + item.summaryEn + '</p>' +
      '<div class="wpa-latest-pn-meta"><span>Version ' + item.version + '</span><span>' + item.date + '</span><span>DOI ' + item.doi + '</span><span>CC BY-NC-ND 4.0</span></div>' +
      '</div><div class="wpa-latest-pn-actions">' +
      '<a class="btn btn-gold" href="' + item.doiUrl + '" target="_blank" rel="noopener">Отвори на Zenodo →</a>' +
      '<a class="btn btn-ghost" href="https://worldprotocolacademy-code.github.io/bibliography/#pn-' + item.no + '">Библиографски запис →</a>' +
      '</div></div>';
  }

  function updateHome() {
    var p = path();
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    if (!(p === '/' || p === '/index.html' || page === 'index')) return;

    var existing = document.querySelector('.wpa-latest-pn, #wpa-pn-003, #wpa-pn-006');
    if (!existing) return;
    existing.id = 'wpa-pn-006';
    existing.setAttribute('aria-labelledby', 'wpa-pn-006-title');
    existing.innerHTML = latestHomeCard(PN006, true);

    var pn005 = document.getElementById('wpa-pn-005');
    if (!pn005) {
      pn005 = document.createElement('article');
      pn005.className = 'wpa-latest-pn';
      pn005.id = 'wpa-pn-005';
      pn005.setAttribute('aria-labelledby', 'wpa-pn-005-title');
      existing.insertAdjacentElement('afterend', pn005);
    }
    pn005.innerHTML = latestHomeCard(PN005, false);

    setMeta('description', 'World Protocol Academy — независна дигитална образовна, истражувачка и авторска платформа. Најнови Zenodo публикации: WPA-PN-005, DOI ' + PN005.doi + ', и WPA-PN-006, DOI ' + PN006.doi + '.');
    setMeta('keywords', 'World Protocol Academy, WPA-PN-005, WPA-PN-006, artificial intelligence governance, state sovereignty, neuroprotocol, brain-computer interfaces, cognitive sovereignty, protocolometry, Zenodo DOI');
  }

  function updateInstitute() {
    if (path() !== '/institute.html' && String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase() !== 'institute') return;
    var card = document.getElementById('wpa-protocol-notes');
    if (!card) return;
    var meta = card.querySelector('.pub-meta');
    var h3 = card.querySelector('h3');
    var paragraph = card.querySelector('p');
    var frequency = card.querySelector('.pub-frequency');
    var link = card.querySelector('a[href*="doi.org"], a[href*="zenodo"]');
    if (meta) meta.textContent = 'СЕРИЈА · 02 · 6 ZENODO DOI RECORDS';
    if (h3) h3.textContent = 'WPA Protocol Notes 001–006';
    if (paragraph) paragraph.innerHTML = 'Посебна серија на кратки, применети и изворно дисциплинирани анализи. Најновите записи се <strong>WPA-PN-005: Protocol of Artificial Intelligence and State Sovereignty</strong> и <strong>WPA-PN-006: Neuroprotocol 2030</strong>, со EASI/ИЕВИС, EECI/ИЕОК, когнитивен суверенитет, невронска приватност и WPA Right to Pause.';
    if (frequency) frequency.textContent = 'Published · PN-001–PN-006 · 2026';
    if (link) {
      link.href = PN006.doiUrl;
      link.textContent = 'Отвори WPA-PN-006 на Zenodo →';
    }
  }

  function paperCard(item, tags) {
    var card = document.createElement('article');
    card.className = 'card';
    card.id = 'wpaPn' + item.no + 'PapersCard';
    card.innerHTML = '<span class="small-kicker">WPA-PN-' + item.no + ' · Applied Protocolometry Record</span>' +
      '<h4 class="paper-title">' + item.titleEn + '</h4>' +
      '<p class="paper-summary">' + item.summaryEn + '</p>' +
      '<div class="paper-tags">' + tags.map(function (tag) { return '<span class="tag">' + tag + '</span>'; }).join('') + '</div>' +
      '<div class="paper-actions"><a class="btn btn-secondary" href="' + item.doiUrl + '" target="_blank" rel="noopener">→ Zenodo DOI</a></div>';
    return card;
  }

  function updatePapers() {
    if (path() !== '/papers.html') return;
    var section = document.getElementById('wpa-protocol-notes');
    if (!section) return;
    var h3 = section.querySelector('.section-header h3');
    var p = section.querySelector('.section-header p');
    if (h3) h3.textContent = 'Six applied protocolometry records — open access via Zenodo.';
    if (p) p.innerHTML = '<strong>Publication status:</strong> PN-001–PN-006 are published Zenodo DOI records. The WPA series corpus contains 19 public DOI records: 13 Working Papers and 6 Protocol Notes.';

    Array.prototype.slice.call(document.querySelectorAll('.stat-card')).forEach(function (card) {
      var label = card.querySelector('span');
      var number = card.querySelector('strong');
      if (label && number && text(label) === 'WPA Protocol Notes · Zenodo DOI') number.textContent = '6';
    });

    var grid = section.querySelector('.grid-3');
    if (grid && !document.getElementById('wpaPn005PapersCard')) grid.appendChild(paperCard(PN005, ['Protocol Note', 'AI Sovereignty', 'EASI']));
    if (grid && !document.getElementById('wpaPn006PapersCard')) grid.appendChild(paperCard(PN006, ['Protocol Note', 'Neuroprotocol', 'EECI']));
  }

  function makeBibEntry(item, tags, citation) {
    var article = document.createElement('article');
    article.className = 'bib-entry';
    article.id = 'pn-' + item.no;
    article.innerHTML = '<div class="bib-num">WPA-PN-' + item.no + '</div>' +
      '<div class="bib-mk">' + item.titleMk + '</div>' +
      '<div class="bib-en">' + item.titleEn + '</div>' +
      '<div class="bib-meta"><strong>2026</strong> · WPA Protocol Note No. ' + item.no + ' · Bilingual MK/EN · Version ' + item.version + '<br>' +
      '<strong>DOI</strong> <a class="bib-link" href="' + item.doiUrl + '" target="_blank" rel="noopener">' + item.doi + '</a><br>' +
      '<strong>Citation:</strong> ' + citation + '</div>' +
      '<div class="bib-tags"><span class="bib-tag blue">Protocol Note</span><span class="bib-tag green">Zenodo DOI</span>' + tags.map(function (tag) { return '<span class="bib-tag">' + tag + '</span>'; }).join('') + '</div>';
    return article;
  }

  function updateBibliography() {
    var p = path();
    if (!(p === '/bibliography' || p === '/bibliography/index.html')) return;

    var entries = Array.prototype.slice.call(document.querySelectorAll('.bib-entry'));
    var anchor = entries.filter(function (entry) { return text(entry).indexOf('WPA-PN-004') !== -1 || text(entry).indexOf('21469146') !== -1; })[0];
    if (!anchor) anchor = entries.filter(function (entry) { return text(entry).indexOf('WPA-PN-003') !== -1 || text(entry).indexOf('21390763') !== -1; }).pop();
    if (!anchor) return;

    var pn005 = document.getElementById('pn-005');
    if (!pn005) {
      pn005 = makeBibEntry(PN005, ['AI Governance', 'Cognitive Sovereignty'], 'Smiljanov, S. (2026). Protocol of Artificial Intelligence and State Sovereignty (Version 1.6). Zenodo. https://doi.org/' + PN005.doi);
      anchor.insertAdjacentElement('afterend', pn005);
    }
    var pn006 = document.getElementById('pn-006');
    if (!pn006) {
      pn006 = makeBibEntry(PN006, ['Neuroprotocol', 'Neurorights'], 'Smiljanov, S. (2026). Neuroprotocol 2030: From Thought to Action (Version 1.6). Zenodo. https://doi.org/' + PN006.doi);
      pn005.insertAdjacentElement('afterend', pn006);
    }
  }

  function workingPaperCard(item, type, meta, description) {
    var card = document.createElement('article');
    card.className = 'paper-card' + (item.no === '006' ? ' latest-record' : '');
    card.id = 'pn' + item.no;
    card.innerHTML = '<div class="paper-top"><div><div class="paper-id">WPA-PN-' + item.no + '</div><div class="paper-title-mk">' + item.titleMk + '</div><div class="paper-title-en">' + item.titleEn + '</div></div><span class="paper-type">' + type + '</span></div>' +
      '<div class="paper-meta">' + meta + '</div><p class="paper-desc">' + description + '</p>' +
      '<div class="doi-row"><a class="doi" href="' + item.doiUrl + '" target="_blank" rel="noopener">' + item.doi + '</a><a class="btn btn-ghost" href="' + item.doiUrl + '" target="_blank" rel="noopener">Files available on Zenodo</a><button type="button" data-copy="Smiljanov, S. (2026). ' + item.titleEn.replace(/"/g, '&quot;') + ' (Version ' + item.version + '). Zenodo. https://doi.org/' + item.doi + '">Copy citation</button></div>';
    return card;
  }

  function addJumpLink(href, label) {
    var menu = document.querySelector('.jump-menu');
    if (!menu || menu.querySelector('a[href="' + href + '"]')) return;
    var link = document.createElement('a');
    link.className = 'jump-link';
    link.href = href;
    link.textContent = label;
    var author = menu.querySelector('a[href="#author-responsibility"]');
    if (author) menu.insertBefore(link, author); else menu.appendChild(link);
  }

  function addReadingNote(id, title, body, connection, doi) {
    if (document.getElementById(id)) return;
    var container = document.querySelector('.notes .container');
    var responsibility = document.querySelector('.author-responsibility');
    if (!container) return;
    var note = document.createElement('div');
    note.className = 'note-card';
    note.innerHTML = '<h3 id="' + id + '">' + title + '</h3><p>' + body + '</p><p><strong>Recommended reading connection:</strong> ' + connection + '.</p><p><a class="doi" href="https://doi.org/' + doi + '" target="_blank" rel="noopener">https://doi.org/' + doi + '</a></p>';
    if (responsibility) container.insertBefore(note, responsibility); else container.appendChild(note);
  }

  function updateWorkingPapersIndex() {
    var p = path();
    if (!(p === '/working-papers' || p === '/working-papers/index.html')) return;
    var subtitle = document.querySelector('.hero .subtitle');
    if (subtitle) subtitle.textContent = 'Working Papers 001–013 · Protocol Notes 001–006';
    var sectionCount = document.querySelector('#series span');
    if (sectionCount) sectionCount.textContent = '13 Working Papers + 6 Protocol Notes + 1 Strategic Plan = 20 records';

    var grid = document.getElementById('papersGrid');
    if (grid) {
      var pn006 = document.getElementById('pn006');
      if (!document.getElementById('pn005')) {
        var c5 = workingPaperCard(PN005, 'WPA Protocol Note', 'Version 1.6 · Bilingual MK / EN · Published 28 July 2026 · Final DOI-Locked Edition', PN005.summaryEn);
        if (pn006) grid.insertBefore(c5, pn006); else grid.appendChild(c5);
      }
      if (!document.getElementById('pn006')) grid.appendChild(workingPaperCard(PN006, 'WPA Protocol Note · Latest Release', 'Version 1.6 · Bilingual MK / EN · Published 29 July 2026 · Final DOI-Locked Edition', PN006.summaryEn));
    }

    addJumpLink('#pn005', 'PN-005');
    addJumpLink('#pn006', 'PN-006');
    addReadingNote('pn005-note', 'Reading Note · AI Sovereignty, Infrastructure and Distributed Responsibility (PN-005)', 'WPA-PN-005 links legal jurisdiction, technical control, infrastructural resilience, accountable human authorisation and effective interruption through the Effective AI Sovereignty Index (EASI).', 'WP-012 → PN-003 → PN-005', PN005.doi);
    addReadingNote('pn006-note', 'Reading Note · Neuroprotocol, Embodied Command and the Right to Pause (PN-006)', 'WPA-PN-006 governs the passage from human intention through neural decoding and algorithmic interpretation to digital or physical action, with EECI, neural privacy, human confirmation and the WPA Right to Pause.', 'PN-005 → PN-006', PN006.doi);

    var responsibility = document.querySelector('.author-responsibility p');
    if (responsibility) responsibility.textContent = 'All nineteen WPA series DOI records — thirteen Working Papers and six Protocol Notes — plus one Global Strategic Plan report are issued under the authorship and final editorial responsibility of Sande Smiljanov. The Working Papers and Protocol Notes are author-reviewed public releases and are not presented as formal peer-reviewed journal articles. Each record remains subject to correction through future Zenodo versions if factual, bibliographic or formatting issues are identified.';
  }

  function bindCopyButtons() {
    Array.prototype.slice.call(document.querySelectorAll('button[data-copy]')).forEach(function (button) {
      if (button.dataset.wpaCopyBound === '1') return;
      button.dataset.wpaCopyBound = '1';
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-copy') || '';
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value);
        button.textContent = 'Copied';
        window.setTimeout(function () { button.textContent = 'Copy citation'; }, 1200);
      });
    });
  }

  function apply() {
    if (applying || !document.body) return;
    applying = true;
    try {
      replaceCorpusCounts();
      updateHome();
      updateInstitute();
      updatePapers();
      updateBibliography();
      updateWorkingPapersIndex();
      bindCopyButtons();
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(function () { scheduled = false; apply(); }, 80);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true }); else apply();
  [250, 700, 1500, 3000].forEach(function (delay) { window.setTimeout(apply, delay); });
  if (window.MutationObserver) {
    var observer = new MutationObserver(schedule);
    window.setTimeout(function () { if (document.body) observer.observe(document.body, { childList: true, subtree: true }); }, 100);
  }
})();
