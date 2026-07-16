from pathlib import Path

TARGET = Path("wpaws/protocol-symbols/index.html")
MARKER = "<!-- WPA PREMIUM REFERENCE 2026 -->"
CSS_MARKER = "/* WPA Premium Reference 2026 */"

CSS = r'''

/* WPA Premium Reference 2026 */
.wpa-premium-section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 20px 18px;
}
.wpa-premium-card {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, .85fr);
  gap: 30px;
  align-items: center;
  padding: 30px;
  border: 1px solid rgba(184,148,31,.45);
  border-radius: 14px;
  background:
    radial-gradient(circle at 88% 14%, rgba(201,168,76,.18), transparent 32%),
    linear-gradient(135deg, #071426 0%, #102944 100%);
  box-shadow: 0 18px 48px rgba(8,20,38,.22);
  color: #f4f1ec;
  isolation: isolate;
}
.wpa-premium-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(115deg, transparent 0 52%, rgba(255,255,255,.035) 52% 53%, transparent 53% 100%);
  z-index: -1;
}
.wpa-premium-copy { min-width: 0; }
.wpa-premium-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 13px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
  text-transform: uppercase;
  color: #e2c56b;
}
.wpa-premium-eyebrow::before {
  content: "WPA";
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(226,197,107,.55);
  border-radius: 50%;
  font-family: 'Cormorant Garamond', serif;
  font-size: 11px;
  letter-spacing: .5px;
}
.wpa-premium-title {
  margin: 0;
  max-width: 760px;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(29px, 3.5vw, 46px);
  line-height: 1.03;
  font-weight: 700;
  color: #fffaf0;
}
.wpa-premium-en {
  margin-top: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  line-height: 1.35;
  color: #d6dce5;
}
.wpa-premium-desc {
  max-width: 740px;
  margin-top: 15px;
  font-size: 13px;
  line-height: 1.7;
  color: #bec8d5;
}
.wpa-premium-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 19px;
}
.wpa-premium-badge {
  padding: 6px 9px;
  border: 1px solid rgba(226,197,107,.28);
  border-radius: 999px;
  background: rgba(255,255,255,.045);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .45px;
  color: #ead582;
}
.wpa-premium-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}
.wpa-premium-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 7px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.wpa-premium-btn.primary {
  background: linear-gradient(135deg, #f1d77d, #bd9635);
  color: #071426;
  box-shadow: 0 10px 26px rgba(0,0,0,.26);
}
.wpa-premium-btn.secondary {
  border: 1px solid rgba(255,255,255,.26);
  color: #f5f1e8;
  background: rgba(255,255,255,.035);
}
.wpa-premium-btn:hover { transform: translateY(-2px); }
.wpa-premium-btn.primary:hover { box-shadow: 0 14px 32px rgba(0,0,0,.34); }
.wpa-premium-price {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  margin-left: 4px;
  color: #f4db88;
  white-space: nowrap;
}
.wpa-premium-price strong {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
}
.wpa-premium-price span {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  color: #aab6c5;
  text-transform: uppercase;
  letter-spacing: .7px;
}
.wpa-premium-visual {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wpa-premium-cover {
  width: min(100%, 360px);
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 24px 44px rgba(0,0,0,.36);
  transform: rotate(1.1deg);
  transition: transform .3s ease;
}
.wpa-premium-card:hover .wpa-premium-cover { transform: rotate(0) translateY(-3px); }
.wpa-premium-ribbon {
  position: absolute;
  right: 4px;
  top: 8px;
  padding: 7px 10px;
  border-radius: 5px;
  background: #f1d77d;
  color: #071426;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .6px;
  box-shadow: 0 8px 18px rgba(0,0,0,.24);
}
.wpa-premium-note {
  grid-column: 1 / -1;
  margin-top: -4px;
  padding-top: 15px;
  border-top: 1px solid rgba(226,197,107,.2);
  font-size: 10px;
  line-height: 1.6;
  color: #9eabb9;
}
@media (max-width: 800px) {
  .wpa-premium-card { grid-template-columns: 1fr; padding: 24px; }
  .wpa-premium-visual { order: -1; }
  .wpa-premium-cover { width: min(100%, 300px); }
  .wpa-premium-ribbon { right: calc(50% - 155px); }
}
@media (max-width: 520px) {
  .wpa-premium-section { padding-left: 12px; padding-right: 12px; }
  .wpa-premium-card { padding: 20px; border-radius: 11px; }
  .wpa-premium-title { font-size: 31px; }
  .wpa-premium-actions { align-items: stretch; }
  .wpa-premium-btn { width: 100%; }
  .wpa-premium-price { width: 100%; margin: 2px 0 0; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .wpa-premium-btn, .wpa-premium-cover { transition: none; }
}
'''

HTML = r'''

<!-- WPA PREMIUM REFERENCE 2026 -->
<section class="wpa-premium-section" aria-labelledby="wpaPremiumTitle">
  <article class="wpa-premium-card">
    <div class="wpa-premium-copy">
      <div class="wpa-premium-eyebrow">Premium Digital Reference · Edition 2026</div>
      <h2 class="wpa-premium-title" id="wpaPremiumTitle">Протокол на државни симболи, химни и национални денови</h2>
      <div class="wpa-premium-en">Protocol of State Symbols, Anthems and National Days</div>
      <p class="wpa-premium-desc">Професионален MK/EN пакет за протоколарни службеници, дипломати, институции и организатори на официјални настани — со главно издание, Mobile Quick Reference, Premium Supplement и Executive Field Card.</p>
      <div class="wpa-premium-badges" aria-label="Package highlights">
        <span class="wpa-premium-badge">197 ENTITIES</span>
        <span class="wpa-premium-badge">95 NATIONAL DAYS</span>
        <span class="wpa-premium-badge">MK / EN</span>
        <span class="wpa-premium-badge">MOBILE + FIELD TOOLS</span>
        <span class="wpa-premium-badge">PROTECTED DIGITAL EDITION</span>
      </div>
      <div class="wpa-premium-actions">
        <a class="wpa-premium-btn primary" href="../../premium-reference-2026.html" aria-label="View WPA Premium Reference 2026">Прегледај го Premium пакетот <span aria-hidden="true">→</span></a>
        <a class="wpa-premium-btn secondary" href="../../premium-reference-2026.html#bundle">Што содржи пакетот?</a>
        <span class="wpa-premium-price"><strong>€19</strong><span>single-user licence</span></span>
      </div>
    </div>
    <div class="wpa-premium-visual" aria-hidden="true">
      <img class="wpa-premium-cover" src="../../assets/wpa-premium-reference-2026-cover.svg" alt="">
      <span class="wpa-premium-ribbon">WPA PREMIUM · v1.3</span>
    </div>
    <p class="wpa-premium-note">Образовен и професионален референтен алат. Временски чувствителните информации задолжително се потврдуваат со официјален државен или дипломатски извор пред употреба на официјален настан. За дигиталниот производ важат објавените лиценцни услови и политиката за поврат.</p>
  </article>
</section>
'''


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")

    if MARKER not in text:
        anchor = "<!-- SEARCH BAR -->"
        if anchor not in text:
            raise SystemExit(f"HTML anchor not found: {anchor}")
        text = text.replace(anchor, HTML + "\n" + anchor, 1)

    if CSS_MARKER not in text:
        anchor = "</style>"
        if anchor not in text:
            raise SystemExit(f"CSS anchor not found: {anchor}")
        text = text.replace(anchor, CSS + "\n" + anchor, 1)

    TARGET.write_text(text, encoding="utf-8")
    print(f"Patched {TARGET}")


if __name__ == "__main__":
    main()
