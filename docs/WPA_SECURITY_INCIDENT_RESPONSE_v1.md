# WPA Security Incident Response v1.0

Status: RELEASE CANDIDATE / HUMAN-GATED  
Updated: 2026-11-11

## Objective

Protect the World Protocol Academy / WPA Institute identity, public website, GitHub source, email routing and connected services from account takeover, phishing, impersonation, credential theft and unauthorised publication.

## Severity

**SEV-1 — identity/account takeover**
- unauthorised Google/GitHub/Cloudflare login;
- password/recovery/2FA method changed without approval;
- unauthorised production deployment or DNS change;
- exposed production credential;
- confirmed sender-domain spoofing used for fraud.

**SEV-2 — credible compromise attempt**
- phishing that targets WPA credentials;
- unknown OAuth application or browser extension;
- suspicious login blocked;
- malicious PR/workflow attempt;
- public secret-like value requiring validation.

**SEV-3 — suspicious/unverified**
- unsolicited security email;
- impersonation claim without evidence;
- suspicious link not opened;
- automated alert awaiting verification.

## Immediate containment

1. Do not use links or phone numbers from the suspicious message.
2. Open the relevant provider directly from a known bookmark/address.
3. Review recent security activity and signed-in devices.
4. If an event is unfamiliar, revoke the session and rotate the affected credential.
5. Review recovery email/phone, passkeys/security keys and OAuth applications.
6. Review Gmail forwarding/delegation/filters and sent mail for unauthorised changes.
7. Review GitHub recent sessions, authorised apps, PATs/SSH keys, Actions secrets and repository changes.
8. Review Cloudflare account members, API tokens, DNS changes, Email Routing rules and Worker deployments.
9. Preserve evidence: timestamp, sender, subject, headers, event IDs and screenshots. Do not publish secrets.
10. Escalate any DNS, credential, production or public-statement change to the Human Gate.

## WPA identity controls

Canonical identity:
- Website: https://worldprotocolacademy.mk/
- Institute: https://worldprotocolacademy.mk/institute.html
- Security policy: https://worldprotocolacademy.mk/SECURITY.md
- Security contact: sande@worldprotocolacademy.mk
- Source repository: https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io

WPA does not validate identity by requesting passwords, 2FA codes, recovery codes or API secrets over email, chat or telephone.

## Recovery order

For a confirmed compromise:
1. secure the primary Google identity;
2. secure the primary GitHub identity;
3. secure the DNS/Cloudflare account;
4. rotate high-impact tokens and deployment credentials;
5. verify repository/default-branch integrity;
6. verify DNS, email routes and Workers;
7. verify public website checksum/state;
8. communicate externally only after evidence review.

## Post-incident

- document root cause and affected time window;
- invalidate obsolete credentials;
- confirm all provider recovery channels;
- run repository/security CI;
- update detection rules;
- keep an evidence-preserving incident record;
- publish a correction/advisory only when materially necessary and verified.
