# WPA Certificate Anti-Fake System – Technical Specification

## 1. JSON Schema (Certificate Database)

```json
{
  "certificate_id": "WPA-CERT-2026-000001",
  "student_name": "Name Surname",
  "programme": "Protocol and Diplomacy",
  "level": "Foundation",
  "grade": "Distinction",
  "issue_date": "2026-05-23",
  "expiry_date": null,
  "status": "valid",
  "sha256_hash_input": "certificate_id + student_name + programme + level + grade + issue_date + secret_salt",
  "sha256_hash": "generated_sha256_hash_here",
  "qr_url": "https://verify.wpa.com/WPA-CERT-2026-000001?hash=generated_sha256_hash_here",
  "pdf_digital_signature": {
    "method": "PKI",
    "signed": true,
    "signature_timestamp": "2026-05-23T10:00:00Z"
  },
  "verification_attempts": 0,
  "last_verified_at": null,
  "created_at": "2026-05-23T10:00:00Z",
  "updated_at": "2026-05-23T10:00:00Z"
}
```

Статуси: valid, expired, revoked, replaced, pending_verification, suspended

## 2. Technical Diagram

```text
[Student completes programme]
→ [Certification Officer approves]
→ [Generate certificate_id: WPA-CERT-YYYY-XXXXXX]
→ [Generate SHA-256 hash with secret_salt]
→ [Generate QR: https://verify.wpa.com/{id}?hash={hash}]
→ [Apply PKI digital signature to PDF]
→ [Issue certificate]
→ [Public verification page]
→ [Trust Layer monitors attempts]
→ [10 failed attempts = IP block 1 hour + log]
→ [critical = block + escalate + email alert]
```

## 3. Perfection Indicators

| Indicator | Target |
|---|---|
| QR verification | 100% certificates have valid QR |
| Hash check | 0 mismatch for legitimate certificates |
| PKI signature | Every PDF digitally signed |
| Trust Layer | Every suspicious attempt logged |
| IP protection | 10 failures = 1 hour block |
| Audit | All status changes logged |
