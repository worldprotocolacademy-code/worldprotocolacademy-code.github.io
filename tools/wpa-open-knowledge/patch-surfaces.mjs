import fs from 'fs/promises';

const HUB = 'tools/academic-search-hub/index.html';
const VIRAL = 'viral-sande-ai/index.html';

const HUB_START = '<!-- WPA_OPEN_KNOWLEDGE_LANE_START -->';
const HUB_END = '<!-- WPA_OPEN_KNOWLEDGE_LANE_END -->';
const VIRAL_START = '<!-- WPA_VIRAL_OPEN_KNOWLEDGE_START -->';
const VIRAL_END = '<!-- WPA_VIRAL_OPEN_KNOWLEDGE_END -->';

function replaceManaged(source, start, end, block, anchor) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex >= 0 && endIndex > startIndex) {
    return source.slice(0, startIndex) + block + source.slice(endIndex + end.length);
  }
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex < 0) throw new Error(`Required surface anchor not found: ${anchor.slice(0, 80)}`);
  return source.slice(0, anchorIndex) + block + '\n\n' + source.slice(anchorIndex);
}

const hubBlock = `${HUB_START}
    <section id="proactive-open-knowledge" class="note">
      <h2>Proactive Open Knowledge Agents · 24/7</h2>
      <p>
        Manual academic search is only one entrance. The Institute also runs a governed proactive lane that
        continuously discovers <strong>public-domain and explicitly open-licensed books</strong>, open scholarly book metadata,
        and <strong>public institutional portal signals</strong> from protocol, diplomacy, public relations/public communication,
        security studies, communicology and Protocolometry-related sources.
      </p>
      <div class="grid">
        <div class="card"><h3 id="wpaOpenBookCount">Open Books</h3><p>Project Gutenberg public-domain text may be boundedly extracted; OpenAlex book records enter metadata/rights review. Full-text reuse requires a public-domain or explicit open-licence basis.</p></div>
        <div class="card"><h3 id="wpaOpenInstitutionCount">Institutional Portals</h3><p>The global institutions master list supplies rotating public-portal targets. Agents derive short practice signals and provenance without retaining protected page bodies.</p></div>
        <div class="card"><h3>Core Extraction</h3><p>Agents create source-traceable Scholarly Knowledge Atoms and Institutional Practice Atoms, preserve authorship/source identity, and keep uncertainty and limitations visible.</p></div>
        <div class="card"><h3>Institute-wide Routing</h3><p>Eligible candidates are routed to Virtual Sande, Viral Sande, WPAWS, Protocolometry, research, Journal, programmes, curriculum, briefings, strategy, social communication and other governed WPA uses.</p></div>
      </div>
      <div class="actions">
        <a class="btn" href="/open-knowledge-command/">Open Knowledge Command</a>
        <a class="btn secondary" href="/data/open-knowledge/status.json">Machine Status JSON</a>
        <a class="btn secondary" href="/data/virtual-sande/open-knowledge-intake.json">Virtual/Viral Sande Intake</a>
        <a class="btn secondary" href="/wpa-global-institutions-master-list.html">Global Institutions Master</a>
      </div>
      <p id="wpaOpenKnowledgeState" class="small">Status: waiting for the first governed 24/7 cycle on this deployment.</p>
    </section>

    <script>
    (function(){
      fetch('/data/open-knowledge/status.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('status');return r.json();}).then(function(s){
        var b=document.getElementById('wpaOpenBookCount');
        var i=document.getElementById('wpaOpenInstitutionCount');
        var st=document.getElementById('wpaOpenKnowledgeState');
        if(b)b.textContent=String((s.book_lane&&s.book_lane.retained_total)||0)+' governed book atoms';
        if(i)i.textContent=String((s.institutional_lane&&s.institutional_lane.retained_total)||0)+' institutional practice atoms';
        if(st)st.textContent='Status: '+String(s.operational_state||s.mode||'available')+' · generated '+String(s.generated||'');
      }).catch(function(){/* public page stays truthful with fallback text */});
    })();
    </script>
${HUB_END}`;

const legalSafeBlock = `    <section class="safe-note">
      <strong>Legal-safe rule:</strong> the manual search surface opens external search pages only. The proactive lane is separate and may process only official/open APIs, public-domain or explicitly open-licensed book material, and publicly reachable institutional web pages under bounded source/robots checks. It never bypasses login, CAPTCHA, paywall or access controls and never treats mere discoverability as permission to copy protected full text.
    </section>`;

const viralBlock = `${VIRAL_START}
<div class="card" id="viral-open-knowledge">
  <h3>🌍 Proactive Open Knowledge Intake · 24/7</h3>
  <p>
    Viral Sande is connected to the Institute's governed Open Knowledge lane. Proactive agents continuously look for
    legally reusable knowledge in <strong>protocol, diplomacy, public relations/public communication, security studies,
    communicology and Protocolometry</strong>, and for public practice signals from relevant academies, diplomatic schools,
    universities, institutes and security/communication institutions worldwide.
  </p>
  <p>
    Books are substantively extracted only when a <strong>public-domain or explicit open-licence</strong> basis exists.
    Public institutional portals are converted into short source-traceable practice signals; protected body text is not retained.
    Every new atom enters the Human Gate before consequential WPA reuse or external publication.
  </p>
  <p id="viralOpenKnowledgeState"><strong>Open Knowledge status:</strong> waiting for the current governed cycle.</p>
  <div class="nav-links">
    <a href="/open-knowledge-command/">📡 Open Knowledge Command</a>
    <a href="/tools/academic-search-hub/">🔎 Academic Search Hub</a>
    <a href="/wpa-global-institutions-master-list.html">🏛️ Global Institutions</a>
    <a href="/data/virtual-sande/open-knowledge-intake.json">🧠 Intake JSON</a>
  </div>
</div>
<script>
(function(){
  fetch('/data/open-knowledge/status.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('status');return r.json();}).then(function(s){
    var el=document.getElementById('viralOpenKnowledgeState');
    if(!el)return;
    var books=(s.book_lane&&s.book_lane.retained_total)||0;
    var inst=(s.institutional_lane&&s.institutional_lane.retained_total)||0;
    el.innerHTML='<strong>Open Knowledge status:</strong> '+String(s.operational_state||s.mode||'available')+' · '+books+' book atoms · '+inst+' institutional practice atoms · Human Gate required.';
  }).catch(function(){/* keep fallback */});
})();
</script>
${VIRAL_END}`;

let hub = await fs.readFile(HUB, 'utf8');
hub = hub.replace('STAGING READY — Legal-safe external discovery', 'ACADEMIC SEARCH + 24/7 OPEN KNOWLEDGE · HUMAN-GOVERNED');
hub = hub.replace('проверливост на извори, authority audit и идна RAG поддршка за Virtual Sande.', 'проверливост на извори, authority audit и 24/7 governed Open Knowledge intake за Virtual Sande, Viral Sande и WPA Institute.');
hub = replaceManaged(hub, HUB_START, HUB_END, hubBlock, '    <section class="safe-note">');
hub = hub.replace(/    <section class="safe-note">[\s\S]*?<\/section>/, legalSafeBlock);
await fs.writeFile(HUB, hub, 'utf8');

let viral = await fs.readFile(VIRAL, 'utf8');
viral = viral.replace('Beta Preview · AI Communication Concept', 'Beta Preview · Governed 24/7 Knowledge-to-Communication');
viral = replaceManaged(viral, VIRAL_START, VIRAL_END, viralBlock, '<div class="card">\n  <h3>Поврзани WPA алатки</h3>');
await fs.writeFile(VIRAL, viral, 'utf8');

console.log('Connected Academic Search Hub and Viral Sande to the proactive Open Knowledge lane.');
