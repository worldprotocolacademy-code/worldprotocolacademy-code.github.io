# WPA Question Bank Governance — Phase 1–4 Implementation Checklist

**World Protocol Academy**  
**Institute for Protocol, Diplomacy, Public Communication & Security Studies**  
**Classification:** WPA-INTERNAL

## Phase 1 — Secure the Legacy Bucket

Goal: keep `protocol-kb` private and create a full inventory.

- [ ] Confirm `protocol-kb` Public Access is disabled.
- [ ] Confirm Public Development URL is disabled.
- [ ] Confirm no custom domain exposes `protocol-kb`.
- [ ] Test one old public URL and confirm it returns 401 / 403 / 404 / access denied.
- [ ] Create inventory of all files in `protocol-kb`.
- [ ] For each file, record filename, path, size, modified date, content type, proposed tier, and whether it contains `correct_answer`, explanations, or source references.
- [ ] Restrict operational access to Director and Custodian until migration plan is complete.
- [ ] Save inventory as internal record.

Definition of done: public access is disabled and inventory exists.

## Phase 2 — Establish Public Bucket

Goal: create a clean public bucket for Tier P only.

- [ ] Create `wpa-public`.
- [ ] Enable public access only for `wpa-public`.
- [ ] Add only Tier P material.
- [ ] Confirm no `correct_answer` field exists in public files.
- [ ] Confirm no answer keys exist in public files.
- [ ] Confirm no full explanation/source mapping exists in public files.
- [ ] Document public bucket verification.

Definition of done: `wpa-public` exists and contains only Tier P material.

## Phase 3 — Establish Certification Bucket

Goal: create a strict private bucket for future certification material.

- [ ] Create `wpa-certification`.
- [ ] Keep public access disabled.
- [ ] Do not migrate any existing 2210 practice questions into it.
- [ ] Prepare future naming prefix: `CertQ0001`, `CertQ0002`, etc.
- [ ] Require named access only.
- [ ] Use short-lived pre-signed URLs when file retrieval is needed.
- [ ] Document access controls.
- [ ] Keep bucket empty until certification pool construction begins.

Definition of done: `wpa-certification` exists, is private, and has no migrated practice material.

## Phase 4 — Migrate and Rename Files

Goal: migrate legacy material into correct buckets and apply naming convention.

- [ ] Create `wpa-student`.
- [ ] Create `wpa-internal`.
- [ ] Move Practice / Knowledge Bank items to `wpa-student`.
- [ ] Move answer keys, explanations, and source mappings to `wpa-internal`.
- [ ] Apply naming convention: `WPA-QB-{TIER}-{POOL}-{BATCH}-{RANGE}-{TYPE}-v{VERSION}.{ext}`
- [ ] Create mapping table from old filename/location to new filename/location.
- [ ] Freeze or decommission `protocol-kb`.
- [ ] Confirm no Practice / Knowledge Bank file moved into `wpa-certification`.

Definition of done: all files migrated, renamed, mapped, and signed off by Director.

## Immediate do-not-do list

- [ ] Do not re-enable public access on `protocol-kb`.
- [ ] Do not put answer keys in public storage.
- [ ] Do not put certification material in public or student buckets.
- [ ] Do not use the 2210 Practice / Knowledge Bank as official certification exam pool.
- [ ] Do not rely on `robots.txt` alone for private material.
