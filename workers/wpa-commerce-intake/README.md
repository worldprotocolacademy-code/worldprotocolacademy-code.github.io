# WPA Commerce Intake Worker — PRELAUNCH SCAFFOLD

Status: **NOT DEPLOYED / FAIL-CLOSED**

This isolated Cloudflare Worker is a future replacement for the current mailto-based WPA commerce request form.

It does **not** process cards, move money, publish products, issue credentials or approve membership. Its only future role is:

```
public request
→ Turnstile
→ server-side Siteverify
→ optional Worker rate limit
→ validated D1 intake record
→ PENDING_HUMAN_GATE
```

## Safety defaults

- `WPA_COMMERCE_BACKEND_MODE=DISABLED`
- no production route
- `workers_dev=false`
- `preview_urls=false`
- no D1 binding configured
- no Turnstile secret in GitHub
- no bank details in GitHub
- no email sending
- no automatic approval
- no payment-provider webhook handling

A POST request cannot be accepted until **all** required runtime bindings/secrets exist and the mode is explicitly set to `ENABLED`.

## Routes

- `GET /health`
- `POST /api/v1/commerce/request`

The POST route accepts JSON only and enforces the public-site Origin allowlist.

## Required production bindings — not configured here

### Turnstile

Create a Turnstile widget for the approved WPA hostnames.

Required secret:

```
TURNSTILE_SECRET
```

The secret must be set through Cloudflare secrets, never committed.

The frontend token must be submitted as `turnstileToken`.

Expected runtime values:

```
TURNSTILE_EXPECTED_HOSTNAME=worldprotocolacademy.mk
TURNSTILE_EXPECTED_ACTION=wpa_commerce_request
```

Server-side Siteverify is mandatory. Client-side rendering alone is not accepted as protection.

### D1

Create a dedicated D1 database only after Human Gate approval.

Apply:

```
migrations/0001_init.sql
```

Then bind it as:

```
DB
```

Do not reuse an unrelated student, Journal, AI or production database merely because one already exists.

### Optional Worker Rate Limiting binding

Before production, configure a dedicated `COMMERCE_RATE_LIMITER` binding if desired. The Worker treats it as optional while disabled/prelaunch, but production approval should decide whether it becomes mandatory.

Use a unique namespace id. Do not reuse another Worker's namespace casually.

## Intended request body

```json
{
  "name": "Example Person",
  "email": "person@example.com",
  "organisation": "Example",
  "requestType": "WPA Membership",
  "productPlan": "WPA Pro",
  "period": "Annual",
  "paymentRoute": "Bank Transfer · Human Gate",
  "language": "Macedonian",
  "note": "",
  "turnstileToken": "...",
  "website": ""
}
```

`website` is a honeypot field and should remain visually hidden in a future frontend integration.

## What is stored

Only minimum request data needed for Human Gate processing:
- name;
- email;
- organisation if supplied;
- request type;
- product/plan;
- period;
- payment route;
- language;
- note;
- terms/privacy version;
- request id/time/status.

It does not store:
- card numbers;
- CVV;
- bank passwords;
- OTPs;
- bank-login credentials;
- Turnstile secret;
- raw Turnstile token after validation.

## Human Gate state

Every accepted request is inserted as:

```
PENDING_HUMAN_GATE
```

No route in this Worker can approve it.

A future internal review console must be separately protected with Cloudflare Access/identity and audited before it can mutate request status.

## Deployment gates

Do not deploy until all are explicitly resolved:

1. Exact Cloudflare account/environment.
2. Exact Worker name.
3. Exact production route/custom domain.
4. Dedicated D1 database and binding.
5. Turnstile sitekey and secret.
6. Final allowed origins.
7. Rate-limit decision/configuration.
8. Privacy disclosure confirmed.
9. Retention period confirmed.
10. Seller/legal disclosure confirmed.
11. MoI/institutional-separation review confirmed.
12. Human approval for frontend cutover.

## Frontend cutover rule

The current public `commerce.html` mailto workflow remains the active fallback.

Do not replace it with this Worker until:
- Worker staging test passes;
- Turnstile server-side validation passes;
- D1 insert/readback is verified;
- failure modes are tested;
- rollback to mailto is documented;
- Human Gate approves production.

## Local/static syntax check

```
npm install
npm run check
```

A Wrangler dry run requires a compatible current Wrangler release and should be performed before any deployment.

## External documentation used for this scaffold

Cloudflare Turnstile server-side validation:
https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

Cloudflare D1 prepared statements:
https://developers.cloudflare.com/d1/worker-api/prepared-statements/

Cloudflare Workers Rate Limiting binding:
https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
