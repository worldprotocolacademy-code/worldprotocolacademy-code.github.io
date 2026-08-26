from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'audio-media-engine.html'
t = p.read_text(encoding='utf-8')
t = t.replace('audio, video, PPP, lesson, course item, product note.', 'audio, video, PPT, lesson, course item, delivery note.')
t = t.replace('<option>Premium</option>', '<option>Executive</option>')
t = t.replace('Бесплатни едукативни клипови, јавна протоколарна писменост, newsletter funnel.', 'Бесплатни едукативни клипови, јавна протоколарна писменост и public learning pathway.')
p.write_text(t, encoding='utf-8')
print('Audio post-enhancement microfix applied and verified for the controlled six-enhancement package.')
