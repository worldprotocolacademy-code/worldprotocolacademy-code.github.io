# WPA Public Surface + Institute Hardening v1.1.0-rc2

**Date:** 2026-11-11
**Owner / Human Release Authority:** Asst. Prof. Dr Sande Smiljanov
**Primary class:** website / portal / interactive institutional platform
**Status:** READY FOR HUMAN GATE — NOT YET MERGED / NOT YET VERIFIED LIVE
**Pull request:** #634
**Release branch:** `feat/wpa-proactive-agent-fabric-v1`
**Rollback baseline:** `b52cefa359c2dec41abcd2419e26d3e38d3e9428`

## 1. Release identity

This release candidate consolidates the WPA public home, WPA Institute, canonical metrics, REV7 dataset pointer, OPC 2027 public gateway, multilingual public routing, security/identity protection and the governed Proactive Agent Fabric.

It does not activate unverified provider credentials, payments, credential issuance, automated external publication, legal commitments or final OPC date/venue.

## 2. Included deliverables

- `/index.html` — reconciled public WPA home.
- `/institute.html` — reconciled WPA Institute and visible Proactive Agent Fabric boundary.
- `/opc2027/` plus EN/FR/DE public mirrors — governed OPC 2027 preparation gateway.
- `/opc2026/` — archived/superseded preview.
- `/data/wpa-canonical-public-facts.json` — current 27/20 academic corpus and REV7 pointer.
- `/data/wpa-canonical-metrics-status.json` — current metrics pointer.
- `/data/wpa-proactive-agent-fabric.json` — five governed provider seats.
- `/scripts/wpa_proactive_agent_fabric.py` — bounded server-side orchestrator.
- `/.github/workflows/wpa-proactive-agent-fabric.yml` — validation and governed runtime workflow.
- `/SECURITY.md` — private security-disclosure policy.
- `/.well-known/security.txt` — canonical security contact.
- `/identity-verification.html` — anti-impersonation verification surface.
- `/docs/WPA_SECURITY_INCIDENT_RESPONSE_v1.md` — incident-response procedure.
- `/.github/CODEOWNERS` — high-trust ownership map.
- `/.github/dependabot.yml` — dependency-update coverage.
- `/.github/workflows/wpa-security-hardening-ci.yml` — continuous security gate.
- `/scripts/audit_wpa_public_surfaces.mjs` — deterministic public-surface audit.

## 3. Acceptance criteria

1. Public academic corpus is consistent at **27 total = 6 monographs/manuals + 1 dissertation + 20 papers/contributions**.
2. Current Global Institutions pointer is **REV7 = 250 records / 249 external / 241 distinct external institutions**.
3. Active conference route is **OPC 2027**; OPC 2026 is archived.
4. Active public-language registry remains exactly **57 surfaces** with MK/EN/FR/DE parity rules preserved.
5. No stale live REV2 card remains in the Institute Command Layer.
6. Proactive Agent Fabric exposes exactly five bounded provider seats and fails closed when configuration is missing.
7. HG2-HG4 consequential actions remain Human-Gated.
8. Security policy, `security.txt`, identity verification, CODEOWNERS, Dependabot and security CI exist.
9. No high-signal committed secrets are detected by the WPA security gate.
10. Public identity-verification page collects no form data and uses a restrictive local CSP.
11. Student Desk privacy and noindex boundary remains unchanged.
12. Production smoke, site quality, language gates, translator gates, Institute checks, REV7 checks, Protocolometry, Daily Product, Research Pipeline and security gates must all be green on the exact release head.

**Authoritative verification evidence:** GitHub Actions for PR #634 on the exact commit presented at the Human Gate. A prior green run is not sufficient if the head changes.

## 4. Known limitations / non-claims

- External provider connectivity for Grok/GPT/Claude/Kimi/Harvey-compatible seat is not claimed until credentials, endpoint contracts and successful provider smoke tests exist.
- GitHub repository rules currently require zero approving reviews; CODEOWNERS exists in this RC but code-owner review is not yet enforced by repository settings.
- Google-account, GitHub-account and Cloudflare-account passkey/2FA state cannot be proven from repository code.
- Outbound SPF/DKIM/DMARC policy for `worldprotocolacademy.mk` remains a separate DNS/account verification item.
- The public website is not claimed updated until merge, deployment and post-release live smoke tests pass.
- OPC 2027 final date, venue, speakers, partners, sponsors and payment/registration status remain unconfirmed unless separately evidenced.

## 5. Rollback

If post-merge verification fails:

1. stop consequential follow-on actions;
2. preserve the failed release evidence;
3. revert the release merge or restore the last known stable baseline `b52cefa359c2dec41abcd2419e26d3e38d3e9428`;
4. rerun site-quality, production-smoke, security, language and Institute checks;
5. confirm the public domain state before reopening release activity.

No DNS, account-recovery or credential rollback should be automated.

## 6. Human Gate

Before merge/release, the human release authority must confirm:

- the exact PR head SHA;
- all mandatory checks are green;
- no unexpected file changes exist;
- the operational security checklist has been reviewed;
- merge is explicitly authorised.

After merge, the release is still **not VERIFIED LIVE** until the live URLs and critical routes are smoke-tested.
