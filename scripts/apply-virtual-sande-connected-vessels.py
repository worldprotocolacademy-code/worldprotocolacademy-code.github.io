from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOADER = '<script defer src="/scripts/virtual-sande-connected-vessels.js?v=20260718-1"></script>'
TARGETS = [
    'protocolometry-center.html',
    'tools/wpa-five-engines.html',
    'tools/wpa-watch/index.html',
    'journal/watch/index.html',
    'student-desk/index.html',
    'intelligence-center.html',
    'wpa-services.html',
    'journal/live/index.html',
    'wpa-live-intelligence-feed.html',
    'wpa-sublimate-engine.html',
    'wpaws/index.html',
]


def add_loader(rel):
    path = ROOT / rel
    if not path.exists():
        raise RuntimeError(f'missing target: {rel}')
    text = path.read_text(encoding='utf-8')
    if LOADER in text:
        return False
    if '</head>' not in text:
        raise RuntimeError(f'missing </head>: {rel}')
    path.write_text(text.replace('</head>', LOADER + '\n</head>', 1), encoding='utf-8')
    return True


def patch_lab():
    path = ROOT / 'virtual-sande-ai.html'
    text = path.read_text(encoding='utf-8')
    changed = False
    if LOADER not in text:
        if '</head>' not in text:
            raise RuntimeError('virtual-sande-ai missing </head>')
        text = text.replace('</head>', LOADER + '\n</head>', 1)
        changed = True
    marker = 'id=\'q\''
    if marker not in text and 'id="q"' not in text:
        raise RuntimeError('virtual-sande-ai textarea marker missing')
    handoff = '''<script id="wpa-connected-vessels-handoff-consumer">
(function(){
  function loadHandoff(){
    var raw=sessionStorage.getItem('wpaVirtualSandeHandoff');
    if(!raw)return;
    try{
      var handoff=JSON.parse(raw);
      if(!handoff||Date.now()-Number(handoff.createdAt||0)>1800000){sessionStorage.removeItem('wpaVirtualSandeHandoff');return;}
      var q=document.getElementById('q');
      if(!q)return;
      var page=handoff.context&&handoff.context.page?handoff.context.page:'WPA module';
      q.value=(handoff.message||'Објасни ја оваа WPA функција.')+'\\n\\nКонтекст: '+page+' · '+(handoff.context&&handoff.context.title||document.title);
      q.focus();
      sessionStorage.removeItem('wpaVirtualSandeHandoff');
      var msgs=document.getElementById('msgs');
      if(msgs){var note=document.createElement('div');note.className='notice';note.textContent='Контекстот од '+page+' е подготвен. Прегледајте го прашањето и притиснете испрати.';msgs.prepend(note);}
    }catch(e){sessionStorage.removeItem('wpaVirtualSandeHandoff');}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadHandoff,{once:true});else loadHandoff();
})();
</script>'''
    if 'wpa-connected-vessels-handoff-consumer' not in text:
        if '</body>' not in text:
            raise RuntimeError('virtual-sande-ai missing </body>')
        text = text.replace('</body>', handoff + '\n</body>', 1)
        changed = True
    if changed:
        path.write_text(text, encoding='utf-8')
    return changed


if __name__ == '__main__':
    changed = [rel for rel in TARGETS if add_loader(rel)]
    lab = patch_lab()
    print({'loaders_added': changed, 'lab_patched': lab})
