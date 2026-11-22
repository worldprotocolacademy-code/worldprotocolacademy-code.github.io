# Verified academic P16–P21 filename reconciliation — 23 November 2026

## What was wrong
The academic paper identities and public publication count were previously reconciled, but the physical files in `papers/` still carried the old numbering P17–P21 for canonical P16–P20. A retired extra PDF named `p16-leadership-protocol-case-mk.pdf` remained despite its exclusion as a duplicate of P04; and two visible files for the new P21 existed in `papers/`: its PDF plus redundant catalogue Markdown.

## Exact corrections
- Retired the extra old P16 file from current main-branch candidate. Its Git blob SHA1 `b8a545e4d8b2c5fb78e3c0e2e5c14dc1ef56ed58` is recoverable from Git history. **Canonical P16 (*Protocol and Leadership Characteristics*) is preserved.**
- Renamed, using unchanged **existing Git PDF blobs**, canonical P16, P17, P18, P19, P20 to `papers/p16-`, `papers/p17-`, `papers/p18-`, `papers/p19-`, `papers/p20-`; the exact original blob IDs and byte sizes are in `data/wpa-academic-pdf-id-map.json`.
- The older P20 *The Flag Is Not Decoration* now has a correctly numbered `p20-` filename. Its DOI `10.5281/zenodo.22305077` remains unchanged.
- P21 *Институционалниот протокол и дипломатската симболика* is academic publication **No. 28** and retains its authorised **14-page** journal excerpt with the article on original printed pages **170–178**, source Git blob SHA1 `4f0f87b93603b25e44613fce0682ae7180b5f7ad`. Its redundant catalogue record was moved to `docs/publications/p21-institucionalniot-protokol-diplomatskata-simbolika-bezbednost-2026.md` to leave exactly one PDF item in `papers/`.
- WPA **WP-016** *The Visible Mandate*, DOI `10.5281/zenodo.24446404`, remains a **separate Zenodo Working Paper**. Academic publications remain **28**, Zenodo records **26**, not added together.

## Provenance, rights, compatibility
PDF article bytes were not rewritten by these filename corrections. The author's specific written editorial permission for publicly sharing P21, dated 18 Nov 2026, is recorded privately, without changing publisher rights or disclosing private correspondence.

Scholar HTML pages remain at their original stable `/scholar/p16.html` through `/scholar/p21.html`; historical Scholar mirror PDFs are kept to avoid disrupting existing scholarly links. Retired old *direct* `/papers/` filenames may return 404, but their binaries remain available through prior Git commits. This URL transition is intentional to restore one canonical academic identifier per paper.
