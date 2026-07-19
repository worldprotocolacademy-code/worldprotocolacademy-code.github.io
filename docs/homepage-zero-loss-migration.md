# WPA Homepage Zero-Loss Migration Protocol

## Non-negotiable rule
No homepage redesign may be merged into `main` until every existing content block, public capability, navigation destination, legal notice and functional module has been accounted for.

Reference source:
- Production homepage: `index.html` on `main`
- Reference blob SHA: `62a82e607faba5c3b85008cfbf4ad7fb64f5de4a`
- Safety archive branch: `archive/home-before-unique-v2-20260719`
- Redesign branch: `redesign/home-unique-v2-20260719`

Status values:
- `KEEP` — preserve function and public meaning
- `REDESIGN` — preserve content/function with new structure and visual treatment
- `LINK` — keep as a clear route to an existing dedicated page
- `ARCHIVE` — retain in repository and document why it is not shown on the homepage
- `VERIFY` — inventory or behavior still requires confirmation

## Identity, governance and legal
- [ ] WPA Macedonian and English identity — REDESIGN
- [ ] Official logo and author identity — KEEP
- [ ] Development / test-phase notice — REDESIGN
- [ ] Independent-platform status wording — KEEP
- [ ] Public disclaimer and institutional boundaries — KEEP + LINK
- [ ] Privacy, security, rights and correction routes — LINK
- [ ] Copyright and authorship lines — KEEP

## Navigation and language
- [ ] Desktop navigation destinations — VERIFY all current links
- [ ] Mobile navigation and drawer behavior — REDESIGN with parity
- [ ] Language selector / language hub — KEEP
- [ ] Macedonian-first identity and English secondary line — KEEP
- [ ] Skip navigation and keyboard accessibility — KEEP / IMPROVE

## Core homepage content
- [ ] Announcement / status area — REDESIGN
- [ ] Hero message and core doctrine — REDESIGN
- [ ] Institutional experience and key metrics — KEEP
- [ ] About WPA / doctrine / mission — KEEP
- [ ] Four pillars / central protocol axis — REDESIGN
- [ ] Programme families — KEEP + REDESIGN
- [ ] Certification