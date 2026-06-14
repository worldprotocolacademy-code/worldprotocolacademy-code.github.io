# WPA Mini-System · DEPLOYMENT NOTES
**Version:** Production-Ready v1.0  
**Audience:** WPA technical administrator  

---

## 1. Before Public Launch — Checklist

- [ ] Set real payment links in `wpa-card-checkout.html`
- [ ] Set form endpoint or confirm email fallback in `opc2026-conference.html`
- [ ] Set `DEMO_MODE = false` in `verify.html` and connect real API
- [ ] Update OPC 2026 conference date in countdown
- [ ] Test all pages on mobile (375px) and desktop
- [ ] Test keyboard navigation on all forms and buttons
- [ ] Test mailto fallback if no form backend is configured
- [ ] Test URL parameter: `verify.html?id=WPA-2026-00001`
- [ ] Check all internal anchor links work
- [ ] Confirm WPA email address is correct in all files
- [ ] Confirm privacy policy page exists at `/privacy.html`
- [ ] Confirm rights/takedown page exists at `/rights-takedown.html`

---

## 2. wpa-card-checkout.html — Payment Links

Open the `<script>` block near the bottom. Find:

```js
const PAYMENT_LINKS = {
  pro_annual:      "REPLACE_WITH_PRO_ANNUAL_PAYMENT_LINK",
  pro_monthly:     "REPLACE_WITH_PRO_MONTHLY_PAYMENT_LINK",
  academic_annual: "REPLACE_WITH_ACADEMIC_ANNUAL_PAYMENT_LINK",
  academic_monthly:"REPLACE_WITH_ACADEMIC_MONTHLY_PAYMENT_LINK"
};
```

Replace each `REPLACE_WITH_...` value with the actual checkout URL from LemonSqueezy
(or another payment provider). Example:

```js
const PAYMENT_LINKS = {
  pro_annual:      "https://yourstore.lemonsqueezy.com/checkout/buy/wpa-pro-annual",
  pro_monthly:     "https://yourstore.lemonsqueezy.com/checkout/buy/wpa-pro-monthly",
  academic_annual: "https://yourstore.lemonsqueezy.com/checkout/buy/wpa-acad-annual",
  academic_monthly:"https://yourstore.lemonsqueezy.com/checkout/buy/wpa-acad-monthly"
};
```

Until links are set, buttons open a pre-composed email to WPA as fallback.

---

## 3. opc2026-conference.html — Form Endpoint

Open the `<script>` block. Find:

```js
const FORM_CONFIG = {
  ENDPOINT:      "NONE",
  CONTACT_EMAIL: "worldprotocolacademy@gmail.com"
};
```

**Option A — Formspree (recommended for static hosting):**
1. Create a form at https://formspree.io
2. Copy your form endpoint (e.g. `https://formspree.io/f/abcdefgh`)
3. Replace `"NONE"` with that URL

**Option B — Tally.so:**
1. Create a form at https://tally.so
2. Use the "Embed" option to get an `<iframe>` code
3. Insert the iframe inside `.form-wrapper`, replacing the `<form>` tag

**Option C — No backend (email fallback):**
Leave `ENDPOINT` as `"NONE"`. The form will open the email client with pre-filled content.

---

## 4. opc2026-conference.html — Conference Date

Find in the script:

```js
const TARGET_DATE = new Date('2026-12-05T09:00:00');
```

Replace `2026-12-05T09:00:00` with the confirmed OPC 2026 date and time (ISO format, local time).

Also update the hero section text if the date changes:
```html
<span class="cm-val">Декември 2026 *</span>
```
Remove the `*` and update the disclaimer note when the date is officially confirmed.

---

## 5. verify.html — Disabling Demo Mode & Connecting Real API

### Step 1: Switch off demo mode

In the `<script>` block, find:

```js
const VERIFY_CONFIG = {
  DEMO_MODE:       true,
  VERIFY_ENDPOINT: "NONE",
  CONTACT_EMAIL:   "worldprotocolacademy@gmail.com"
};
```

Set `DEMO_MODE: false` and provide your API endpoint:

```js
const VERIFY_CONFIG = {
  DEMO_MODE:       false,
  VERIFY_ENDPOINT: "https://your-backend.com/api/verify",
  CONTACT_EMAIL:   "worldprotocolacademy@gmail.com"
};
```

### Step 2: Remove demo database

Delete the entire `DEMO_DB` object from the script. It contains fake data and should not appear in production.

### Step 3: Set up your backend

The page sends a GET request to:
```
VERIFY_ENDPOINT + "?id=" + certificateId
```

Your backend should return JSON in this format:

```json
{
  "found": true,
  "status": "active",
  "name": "Ana Petrovska",
  "certType": "WPA Professional Certificate",
  "programme": "Professional Certificate Programme",
  "grade": "Pass with Distinction",
  "issued": "15 September 2026"
}
```

Possible `status` values: `active`, `expired`, `revoked`, `pending`

If not found:
```json
{ "found": false }
```

**Backend options:**
- Google Apps Script (no server needed, free)
- Supabase Edge Functions
- Airtable API via proxy
- Any Node.js/Python/PHP endpoint

**Security notes:**
- Never expose the full certificate database in front-end JavaScript
- Validate and sanitize all inputs server-side
- Use HTTPS only
- Consider rate limiting on the verification endpoint

---

## 6. All Files — Contact Email

The contact email `worldprotocolacademy@gmail.com` appears throughout all three files.
Search-replace to update if needed. It also appears in the config constants for easy maintenance.

---

## 7. Hosting on GitHub Pages

All three files are static HTML and work on GitHub Pages without any backend.

Upload to your repository root or appropriate folder. Recommended filenames:
- `wpa-card.html` (or keep as `wpa-card-checkout.html`)
- `opc2026.html` (or keep as `opc2026-conference.html`)
- `verify.html` (keep as-is — QR codes link to this exact name)

QR codes should point to:
```
https://worldprotocolacademy-code.github.io/verify.html?id=WPA-YYYY-NNNNN
```

---

## 8. Fonts

All three pages use Google Fonts:
- Playfair Display (display/heading)
- Inter (body)
- JetBrains Mono (UI labels, code)

These load from `fonts.googleapis.com`. If offline or self-hosted fonts are needed,
download the fonts and replace the `@import` line with local `@font-face` declarations.

---

## 10. Assistant QA Pass v1.1

Before launch, also confirm:

- The canonical URLs match the exact filenames used on GitHub Pages or your final domain.
- The Pro and Academic Pro buttons open real checkout URLs after replacing the `REPLACE_WITH_...` values.
- If payment links remain placeholders, users will receive a visible notice and a manual email fallback.
- The verification API should return plain text fields; the frontend now renders them with `textContent` to reduce XSS risk.
- Keep `DEMO_MODE = true` only for internal testing and screenshots. For public launch, connect the real endpoint and set it to `false`.

