# WPA Human-Gate Pre-Release Security Checklist v1.1

**Applies to:** WPA Public Surface + Institute Hardening v1.1.0-rc2  
**Purpose:** manual controls that repository CI cannot prove.

## A. Google / Gmail identity

- [ ] Open Google Account Security directly, not from an email link.
- [ ] Review Recent security activity and remove any unrecognised sign-in method/device.
- [ ] Confirm 2-Step Verification is enabled.
- [ ] Prefer trusted passkeys or physical security keys for the primary account.
- [ ] Confirm recovery email and recovery phone are correct.
- [ ] Review third-party/OAuth access and remove anything not recognised or no longer needed.
- [ ] In Gmail, review delegation, automatic forwarding, filters, send-as addresses, POP/IMAP and Sent mail for unauthorised changes.
- [ ] Report identity-harvesting/phishing messages through Gmail's Report phishing action.

## B. GitHub identity and repository

- [ ] Confirm the repository owner's GitHub account has strong 2FA/passkey protection.
- [ ] Review active sessions, authorised OAuth/GitHub Apps, PATs and SSH keys.
- [ ] Revoke unused or unfamiliar credentials.
- [ ] Confirm the `main` ruleset still blocks deletion and non-fast-forward changes.
- [ ] Raise required approving reviews from 0 to at least 1 when an independent authorised reviewer is available.
- [ ] Enable required Code Owner review for high-trust paths when organisational workflow supports it.
- [ ] Require the Security Hardening CI and Public Surface Audit as protected-branch checks before merge.
- [ ] Keep Actions permissions least-privilege; no unreviewed `pull_request_target` or `write-all`.

## C. Cloudflare / DNS / domain identity

- [ ] Confirm Cloudflare account 2FA/passkey/security-key protection.
- [ ] Review account members and remove unnecessary access.
- [ ] Review API tokens for least privilege and rotate/revoke obsolete tokens.
- [ ] Review DNS change history and Email Routing destinations.
- [ ] Confirm registrar lock / transfer lock and DNSSEC where supported.
- [ ] Inventory every legitimate sender that uses `@worldprotocolacademy.mk`.
- [ ] Verify SPF.
- [ ] Verify DKIM for each legitimate outbound sender.
- [ ] Verify DMARC reporting and alignment before enforcement.
- [ ] Move DMARC enforcement progressively only after legitimate senders pass: monitor -> quarantine -> reject.

## D. Release verification

- [ ] Record the exact PR #634 head SHA.
- [ ] Confirm all mandatory Actions checks are green on that exact SHA.
- [ ] Review the PR diff for unexpected account, DNS, payment or provider changes.
- [ ] Merge only after explicit Human Gate approval.
- [ ] Verify live home, Institute, Security Center, Identity Verification, OPC 2027 and critical Institute routes.
- [ ] Verify no stale 26/19, REV2 or OPC 2026 active-current claims reappear.
- [ ] Confirm rollback path remains available.

## E. External-provider boundary

- [ ] Do not call Grok/GPT/Claude/Kimi/Harvey seats ACTIVE until each has a real server-side credential/endpoint and a successful provider-specific smoke test.
- [ ] Never store provider API keys in public HTML, browser storage or repository source.
- [ ] Keep external publication, payments, credentials, legal commitments and doctrine changes behind the Human Gate.
