# World Protocol Academy — Security Policy

## Reporting a security or identity-abuse issue

Please report suspected account compromise, phishing, impersonation, domain/email spoofing, exposed credentials, vulnerable WPA code, or abuse of the World Protocol Academy identity privately to:

**sande@worldprotocolacademy.mk**

Do not publish passwords, API keys, recovery codes, private tokens, personal identity documents, or exploitable vulnerability details in a public GitHub issue.

## Verification boundary

World Protocol Academy (WPA) is an independent digital educational, research and authorial platform in development, test and pilot phase.

WPA will never ask a user, reviewer, author, partner or visitor by unsolicited email or message to disclose:
- account passwords;
- two-factor authentication codes;
- passkeys;
- recovery codes;
- API secrets;
- payment-card PINs or banking credentials.

A message using the WPA name or logo is not proof of identity. Verify the sender domain and, for consequential requests, confirm through the canonical WPA website or the contact above.

## Supported security scope

Security reports may include:
- worldprotocolacademy.mk public surfaces;
- the public WPA GitHub repository;
- WPA-owned Cloudflare Workers referenced by the public repository;
- WPA email/domain impersonation and phishing;
- exposed secrets or unsafe CI/CD configuration;
- privacy or access-control defects in WPA-owned systems.

Third-party systems, provider infrastructure and external services remain governed by their respective owners.

## Disclosure process

1. Preserve evidence without interacting with suspicious links or attachments.
2. Send a concise description, affected URL/component, observed time and non-sensitive reproduction details.
3. WPA will triage the report under the Human Gate.
4. Sensitive remediation details remain private until disclosure is safe.
5. Public claims of certification, audit completion or compromise status will be made only when supported by evidence.

## Release authority

Automated tools may detect, classify, test and prepare remediation. Consequential deployment, account recovery, DNS changes, credential rotation and public incident statements require attributable human approval.
