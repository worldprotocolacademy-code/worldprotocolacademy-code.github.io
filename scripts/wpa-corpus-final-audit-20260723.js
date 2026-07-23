/* WPA corpus final arithmetic, search and responsibility audit - 23 July 2026 */
(function () {
  'use strict';
  if (window.WPA_CORPUS_FINAL_AUDIT_20260723) return;
  window.WPA_CORPUS_FINAL_AUDIT_20260723 = true;

  var STRATEGY_DOI = '10.5281/zenodo.21396832';
  var STRATEGY_URL = 'https://doi.org/' + STRATEGY_DOI;
  var AUTHOR_RESPONSIBILITY = 'All eighteen records — thirteen Working Papers, four Protocol Notes and one Global Strategic Plan report — are issued under the authorship and final editorial responsibility of Sande Smiljanov. The Working Papers and Protocol Notes are author-reviewed public releases and are not presented as formal peer-reviewed journal articles. Each record remains subject to correction through future Zenodo versions if factual, bibliographic or formatting issues are identified.';
  var CANONICAL_COUNT = '17 WPA series DOI records (13 Working Papers + 4 Protocol Notes) plus 1 Global Strategic Plan report = 18 total WPA Zenodo records.';

  function qsa(selector, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
    catch (error) { return []; }
  }

  function text(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function norm(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function styleStrategicPublication() {
    var section = document.getElementById('wpaStrategicPlanPapersSection');
    var card = document.getElementById('wpaStrategicPlanPapersCard');
    if (!section || !card) return;

    section.classList.add('wpa-strategic-publication-section');
    card.classList.add('wpa-strategic-publication-card');

    var grid = section.querySelector('.grid-3');
    if (grid) grid.classList.add('wpa-strategic-publication-grid');

    var eyebrow = section.querySelector('.section-header .eyebrow');
    if (eyebrow) eyebrow.textContent = 'WPA Strategic Publication';

    var title = section.querySelector('.section-header h2');
    if (title) title.textContent = 'Global Strategic Plan 2026';

    var kicker = card.querySelector('.small-kicker');
    if (kicker) kicker.textContent = 'WPA Global Strategic Plan 2026 · Strategic Report';

    var summary = card.querySelector('.paper-summary');
    if (summary && !card.querySelector('.wpa-strategic-doi-line')) {
      var doiLine = document.createElement('p');
      doiLine.className = 'wpa-strategic-doi-line';
      doiLine.innerHTML = '<strong>Permanent DOI:</strong> <a href="' + STRATEGY_URL + '" target="_blank" rel="noopener">' + STRATEGY_DOI + '</a>';
      summary.insertAdjacentElement('afterend', doiLine);
    }

    var doiButton = card.querySelector('.paper-actions a');
    if (doiButton) {
      doiButton.classList.add('wpa-strategic-doi-button');
      doiButton.href = STRATEGY_URL;
      doiButton.target = '_blank';
      doiButton.rel = 'noopener';
      doiButton.textContent = 'Open Zenodo DOI · ' + STRATEGY_DOI;
    }

    if (!document.getElementById('wpa-strategic-publication-style')) {
      var style = document.createElement('style');
      style.id = 'wpa-strategic-publication-style';
      style.textContent = [
        '#wpaStrategicPlanPapersSection{position:relative;background:linear-gradient(180deg,#fbf8f3 0%,#f6f2eb 100%);border-top:1px solid rgba(154,119,40,.18);border-bottom:1px solid rgba(154,119,40,.18);}',
        '#wpaStrategicPlanPapersSection .section-header{max-width:none;margin-bottom:28px;padding:22px 26px;background:#fff;border:1px solid rgba(154,119,40,.22);border-left:6px solid var(--gold,#9a7728);border-radius:0 18px 18px 0;box-shadow:0 10px 30px rgba(20,31,52,.08);}',
        '#wpaStrategicPlanPapersSection .section-header .eyebrow{margin-bottom:12px;background:rgba(154,119,40,.09);border:1px solid rgba(154,119,40,.34);color:var(--gold-dark,#7b5f1f);font-weight:900;letter-spacing:.48px;}',
        '#wpaStrategicPlanPapersSection .section-header h2{margin:0 0 9px;color:var(--navy,#162947);font-family:Georgia,"Times New Roman",serif;font-size:clamp(30px,3vw,44px);line-height:1.08;}',
        '#wpaStrategicPlanPapersSection .section-header p{font-size:16px;color:var(--muted,#5a6577);}',
        '#wpaStrategicPlanPapersSection .wpa-strategic-publication-grid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:0!important;}',
        '#wpaStrategicPlanPapersCard{position:relative;width:100%;max-width:none;min-height:0;padding:30px 32px 32px;background:linear-gradient(135deg,#fffdf7 0%,#fff 58%,#fbf8f3 100%)!important;border:1px solid rgba(154,119,40,.25)!important;border-left:7px solid var(--gold,#9a7728)!important;border-top:3px solid #c9a84c!important;border-radius:0 18px 18px 0!important;box-shadow:0 14px 38px rgba(20,31,52,.11)!important;overflow:hidden;}',
        '#wpaStrategicPlanPapersCard:after{content:"";position:absolute;right:-78px;top:-78px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,76,.15),rgba(201,168,76,0) 70%);pointer-events:none;}',
        '#wpaStrategicPlanPapersCard .small-kicker{position:relative;z-index:1;display:inline-flex;align-self:flex-start;width:auto;margin-bottom:14px;padding:7px 11px;border:1px solid rgba(154,119,40,.35);border-radius:999px;background:rgba(154,119,40,.08);color:var(--gold-dark,#7b5f1f);font-size:11px;font-weight:900;letter-spacing:.42px;}',
        '#wpaStrategicPlanPapersCard .paper-title{position:relative;z-index:1;margin-bottom:12px;color:var(--navy,#162947);font-family:Georgia,"Times New Roman",serif;font-size:clamp(25px,2.6vw,34px);line-height:1.16;}',
        '#wpaStrategicPlanPapersCard .paper-summary{position:relative;z-index:1;max-width:980px;margin-bottom:14px;font-size:16px;line-height:1.72;color:var(--muted,#5a6577);}',
        '#wpaStrategicPlanPapersCard .wpa-strategic-doi-line{position:relative;z-index:1;margin:0 0 18px;padding:11px 14px;background:rgba(154,119,40,.07);border-left:3px solid #c9a84c;border-radius:0 8px 8px 0;color:var(--navy,#162947);font-size:14px;}',
        '#wpaStrategicPlanPapersCard .wpa-strategic-doi-line a{color:var(--gold-dark,#7b5f1f);font-weight:900;word-break:break-word;}',
        '#wpaStrategicPlanPapersCard .paper-tags{position:relative;z-index:1;margin-bottom:20px;}',
        '#wpaStrategicPlanPapersCard .paper-tags .tag{background:rgba(154,119,40,.08);border-color:rgba(154,119,40,.28);color:var(--navy,#162947);}',
        '#wpaStrategicPlanPapersCard .paper-actions{position:relative;z-index:1;}',
        '#wpaStrategicPlanPapersCard .wpa-strategic-doi-button{background:var(--gold,#9a7728)!important;border-color:var(--gold,#9a7728)!important;color:#fff!important;box-shadow:0 8px 22px rgba(154,119,40,.22);}',
        '#wpaStrategicPlanPapersCard .wpa-strategic-doi-button:hover{background:var(--gold-dark,#7b5f1f)!important;border-color:var(--gold-dark,#7b5f1f)!important;transform:translateY(-1px);}',
        '@media(max-width:640px){#wpaStrategicPlanPapersSection .section-header{padding:20px;border-left-width:5px}#wpaStrategicPlanPapersCard{padding:24px 21px 26px;border-left-width:5px!important}#wpaStrategicPlanPapersCard .wpa-strategic-doi-button{width:100%;text-align:center;white-space:normal}}'
      ].join('');
      document.head.appendChild(style);
    }
  }

  function fixStrategyLinks() {
    qsa('[data-record-link="SP-2026"],#strategic-plan-2026 a,#wpaStrategicPlanPapersCard a,#wpaBibStrategicPlan a').forEach(function (anchor) {
      anchor.href = STRATEGY_URL;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      if (anchor.classList.contains('doi') || anchor.classList.contains('bib-link')) anchor.textContent = STRATEGY_DOI;
    });
    var strategicBib = document.getElementById('wpaBibStrategicPlan');
    if (strategicBib) strategicBib.setAttribute('data-doi', STRATEGY_DOI);
  }

  function fixVisualSummary() {
    var graph = document.querySelector('.zenodo-graph');
    if (!graph) return;

    var stats = qsa('.zenodo-stat strong', graph);
    if (stats[0]) stats[0].textContent = '13';
    if (stats[1]) stats[1].textContent = '001–013';
    if (stats[2]) stats[2].textContent = '13/13';

    var coverage = graph.querySelector('.zenodo-doi-line strong');
    if (coverage) coverage.textContent = 'DOI coverage: 13 Zenodo records';

    var bar = graph.querySelector('.zenodo-bar-segmented');
    if (bar) {
      var segments = qsa('.zenodo-seg', bar);
      segments.forEach(function (segment, index) {
        segment.style.width = index === 0 ? '15.38%' : index === 1 ? '30.77%' : '7.69%';
      });
      if (!document.getElementById('wpaWp013VisualSegment')) {
        var segment = document.createElement('div');
        segment.id = 'wpaWp013VisualSegment';
        segment.className = 'zenodo-seg';
        segment.style.width = '7.69%';
        segment.style.background = 'linear-gradient(135deg,#5b3f78,#8060a3)';
        segment.title = 'India–North Macedonia / Official Visit Protocolometry: 1';
        segment.textContent = '1';
        bar.appendChild(segment);
      }
    }

    var legend = graph.querySelector('.zenodo-legend');
    if (legend && !document.getElementById('wpaWp013VisualLegend')) {
      var item = document.createElement('div');
      item.id = 'wpaWp013VisualLegend';
      item.className = 'zenodo-legend-item';
      item.innerHTML = '<span class="zenodo-legend-swatch" style="background:#6f508e"></span><span><strong>India–North Macedonia / Official Visit Protocolometry · 1</strong><br/><span class="leg-papers">WP-013 Bridges, Not Barriers / Droupadi Murmu official visit</span></span>';
      legend.appendChild(item);
    }
  }

  function fixBibliographyMetrics() {
    qsa('.bib-note').forEach(function (note) {
      if (text(note).indexOf('WPA Research Metrics') === -1) return;
      note.innerHTML = '<strong>WPA Research Metrics · WPA Истражувачки показатели</strong><br/><br/>' +
        '• 25 Academic Publications / Академски публикации<br/>' +
        '• 13 WPA Working Papers (Zenodo DOI)<br/>' +
        '• 4 WPA Protocol Notes (Zenodo DOI)<br/>' +
        '• 17 WPA Series DOI Records<br/>' +
        '• 1 Global Strategic Plan report (Zenodo DOI)<br/>' +
        '• 18 Total WPA Zenodo Records<br/>' +
        '• 5 Monographs and Handbooks<br/>' +
        '• 1 Doctoral Dissertation<br/>' +
        '• Research Areas: Protocol Studies · Protocolometry · Diplomatic Protocol · Ceremonial Diplomacy · Visual Statecraft · Sacred Diplomacy · Security Studies · Digital Protocol · AI Governance';
    });

    var badge = document.querySelector('.zenodo-hero-badge strong');
    if (badge) badge.textContent = '◆ 18 WPA Zenodo Records · 13 Working Papers + 4 Protocol Notes + 1 Strategic Plan';

    qsa('.bib-main div,.bib-main p').forEach(function (node) {
      if (node.children.length > 4) return;
      var value = text(node);
      if (value.indexOf('Следните дванаесет working papers') === 0) {
        node.innerHTML = node.innerHTML.replace('Следните дванаесет working papers', 'Следните тринаесет working papers');
      }
      if (value.indexOf('Дванаесетте WPA Working Papers') === 0) {
        node.innerHTML = node.innerHTML.replace('Дванаесетте WPA Working Papers', 'Тринаесетте WPA Working Papers');
      }
    });
  }

  function publicationEntries() {
    return qsa('.bib-entry[data-search]').filter(function (entry) {
      return entry.id !== 'record' && !entry.closest('#academic-profiles');
    });
  }

  function ensureReportFilter() {
    var select = document.getElementById('bibType');
    if (!select || qsa('option', select).some(function (option) { return option.value === 'report'; })) return;
    var option = document.createElement('option');
    option.value = 'report';
    option.textContent = 'Стратешки извештаи · Strategic reports';
    select.appendChild(option);
  }

  function applyBibliographySearch() {
    var query = document.getElementById('bibSearch');
    var type = document.getElementById('bibType');
    var year = document.getElementById('bibYear');
    var index = document.getElementById('bibIndex');
    var counter = document.getElementById('bibResultCount');
    if (!counter) return;

    var entries = publicationEntries();
    var queryValue = norm(query && query.value);
    var typeValue = type && type.value || 'all';
    var yearValue = year && year.value || 'all';
    var indexValue = index && index.value || 'all';
    var visible = 0;

    entries.forEach(function (entry) {
      var matchesQuery = !queryValue || norm(entry.getAttribute('data-search') + ' ' + text(entry)).indexOf(queryValue) !== -1;
      var matchesType = typeValue === 'all' || entry.getAttribute('data-type') === typeValue;
      var matchesYear = yearValue === 'all' || entry.getAttribute('data-year') === yearValue;
      var indexes = String(entry.getAttribute('data-index') || '').split(/\s+/);
      var matchesIndex = indexValue === 'all' || indexes.indexOf(indexValue) !== -1;
      var show = matchesQuery && matchesType && matchesYear && matchesIndex;
      entry.hidden = !show;
      if (show) visible += 1;
    });

    counter.textContent = 'Прикажани ' + visible + ' од ' + entries.length + ' записи · Showing ' + visible + ' of ' + entries.length + ' records';
  }

  function bindBibliographySearch() {
    if (!document.getElementById('bibResultCount') || document.documentElement.dataset.wpaFinalBibAuditBound === '1') return;
    document.documentElement.dataset.wpaFinalBibAuditBound = '1';
    ensureReportFilter();
    ['bibSearch', 'bibType', 'bibYear', 'bibIndex'].forEach(function (id) {
      var control = document.getElementById(id);
      if (control) {
        control.addEventListener('input', function () { window.setTimeout(applyBibliographySearch, 0); });
        control.addEventListener('change', function () { window.setTimeout(applyBibliographySearch, 0); });
      }
    });
    var reset = document.getElementById('bibReset');
    if (reset) reset.addEventListener('click', function () { window.setTimeout(applyBibliographySearch, 0); });
    applyBibliographySearch();
  }

  function fixDoiIndexText() {
    var intro = document.querySelector('.intro-box');
    if (intro) {
      var paragraphs = qsa('p', intro);
      if (paragraphs[0] && /Published Zenodo/i.test(text(paragraphs[0]))) {
        paragraphs[0].innerHTML = '<strong>Published Zenodo Records:</strong> The WPA corpus contains seventeen public DOI records in its two publication series — thirteen Working Papers and four Protocol Notes — plus one Global Strategic Plan report, for eighteen total WPA Zenodo records. The Working Papers and Protocol Notes are author-reviewed public releases and are not presented as formal peer-reviewed journal articles.';
      }
      if (!document.getElementById('wpaDoiIndexCanonicalCount')) {
        var summary = document.createElement('p');
        summary.id = 'wpaDoiIndexCanonicalCount';
        summary.innerHTML = '<strong>Canonical WPA Zenodo count:</strong> ' + CANONICAL_COUNT;
        intro.appendChild(summary);
      }
    }

    var seriesCount = document.querySelector('.section-title span');
    if (seriesCount) seriesCount.textContent = '13 Working Papers + 4 Protocol Notes + 1 Strategic Plan = 18 records';

    var responsibility = document.querySelector('.author-responsibility p');
    if (responsibility) responsibility.textContent = AUTHOR_RESPONSIBILITY;
  }

  function fixCanonicalNotes() {
    qsa('#wpaCanonicalCorpusCount,#wpaCanonicalZenodoSummary').forEach(function (node) {
      if (node.id === 'wpaCanonicalZenodoSummary') node.innerHTML = '<strong>Canonical WPA Zenodo count:</strong> ' + CANONICAL_COUNT;
      else node.textContent = CANONICAL_COUNT;
    });
  }

  function boot() {
    fixStrategyLinks();
    styleStrategicPublication();
    fixVisualSummary();
    fixBibliographyMetrics();
    bindBibliographySearch();
    applyBibliographySearch();
    fixDoiIndexText();
    fixCanonicalNotes();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 200);
  window.setTimeout(boot, 850);
  window.setTimeout(boot, 2200);

  if (window.MutationObserver && document.documentElement) {
    var observer = new MutationObserver(function () {
      window.clearTimeout(observer._wpaAuditTimer);
      observer._wpaAuditTimer = window.setTimeout(boot, 100);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
