# WPA Diplomatic Correction Protocol (DCP) v1.1

**Authority:** World Protocol Academy (WPA) — Protocol Symbols Lab  
**Doctrine:** *Преговарањето е опционално. Протоколот е апсолутен.*  
**Effective date:** 23 May 2026 (v1.1 amendment same day)  
**Document ID:** WPA-DCP-2026-001 (rev. 1)  
**Director:** Assoc. Prof. Dr. Sande Smiljanov  
**Editorial authority:** WPA Academic & Lab Excellence Office

**Changelog v1.0 → v1.1 (Director order, 23 May 2026):**
1. Added Section 5-bis: WPA's right to request additional documentary evidence.
2. Added Section 12: explicit declaration that the DCP is a **free public-interest service** — no fees, ever.

---

## 1. Purpose

The Diplomatic Correction Protocol (DCP) establishes the **sole official mechanism** by which a sovereign state, through its competent organs, may request the correction, amendment, or clarification of any record held in the WPA Protocol Symbols Lab database (the canonical 53-record verified core and any future expansion).

The DCP guarantees:

1. That every state retains the **inalienable right** to be the final authority on the description of its own national symbols.
2. That WPA discharges its academic duty of accuracy through a **transparent, time-bound, and documented** correction workflow.
3. That every change to the database is **auditable**, **non-retroactive in the public record**, and **dignified** in form.

---

## 2. Scope

The DCP applies to all six core domains of each Protocol Symbols Lab record:

- Flag (description, proportion, adoption date, design law, designer, Pantone colours)
- National anthem (title, lyricist, composer, year, adoption date, design law)
- Coat of arms / national emblem (description, adoption dates, designer, design law, heraldic classification)
- Capital (name, coordinates, de jure / de facto status)
- Continent assignment
- Official name (English and local languages)

The DCP **does not apply to** editorial commentary, doctrinal text, or interpretive WPA scholarship — these remain under the editorial authority of the WPA Director.

---

## 3. Eligible Requesting Entities

A correction request may be submitted only by one of the following organs of the state concerned:

| Tier | Entity | Required form of authentication |
|---|---|---|
| A | Ministry of Foreign Affairs of the requesting state | Letterhead + signature of authorised official + ministerial stamp |
| A | Embassy or Consulate of the requesting state | Letterhead + signature of Ambassador / Consul + diplomatic seal |
| A | Office of the Head of State | Presidential / royal letterhead + appropriate seal |
| B | National Parliament / Assembly | Signed letter of the Speaker or designated committee chair |
| B | Ministry of Culture / National Heraldry Office / National Library | Ministerial letterhead + signature |
| C | Other state organs explicitly authorised by domestic law | Documentary proof of authorisation must accompany the request |

Requests from private individuals, NGOs, academic institutions, or unofficial diasporic organisations are received as **scholarly notifications** and may inform WPA editorial review, but they do not trigger the DCP workflow.

---

## 4. Two-Stage Official Channel

The DCP operates on a **two-stage channel** to balance accessibility with diplomatic dignity:

### Stage 1 — Initial request (email)

The eligible entity submits the request via electronic mail to the WPA correction inbox.

**Inbox:** `worldprotocolacademy@gmail.com`  
**Subject line format:** `WPA-DCR | [ISO country code] | [field affected]`  
*(Example: `WPA-DCR | MK | flag.adoption_date_current`)*

**Required content of the email:**

1. Full official name of the requesting entity.
2. Name, title, and contact details of the authorised officer.
3. The specific record (by WPA-PSL ID) and field(s) to be corrected.
4. The current value and the proposed corrected value.
5. **Documentary evidence** — at least one of:
   - Link to the published Official Gazette of the state (with article and date),
   - Scanned PDF of the relevant law or decree,
   - Link to the official state website carrying the symbol (head of state, parliament, ministry),
   - Certified extract from the national heraldry register or constitution.
6. Authorised signature of the requesting officer (in PDF form, scanned letterhead).

WPA acknowledges receipt within **3 working days** and assigns a Diplomatic Correction Request ID in the format `WPA-DCR-{year}-{4-digit serial}` (e.g., `WPA-DCR-2026-0001`).

### Stage 2 — Final diplomatic confirmation (diplomatic note)

Where the proposed correction would materially alter a fully verified record, WPA may request — and the state is in any event entitled to provide — a **formal diplomatic note (note verbale)** delivered through the diplomatic channel of the Republic of North Macedonia (where WPA is registered).

This second stage is **mandatory** for:

- Changes to flag design or proportion,
- Changes to the official national anthem title, lyricist, or composer,
- Changes to the coat of arms (excluding date clarifications),
- Changes to capital city,
- Changes to official state name.

For pure **date clarifications** (adoption_date_current, adoption_date_first) and **typographical corrections in local-language names**, Stage 1 alone is sufficient.

---

## 5. WPA Service-Level Commitment

| Step | Maximum elapsed time from receipt of compliant Stage 1 email |
|---|---|
| Acknowledgement of receipt + assignment of WPA-DCR ID | 3 working days |
| Editorial review by WPA Academic & Lab Excellence Office | 10 calendar days |
| Decision communicated to requesting entity in writing | 15 calendar days |
| If Stage 2 diplomatic note is required: full processing | 30 calendar days from receipt of the note verbale |
| Public database update and audit-log publication | 5 calendar days from decision |

If WPA cannot meet the 15-day deadline for cause (e.g., need for additional evidence), it shall, within 15 days, notify the requesting entity of the extension and the new expected date.

---

## 5-bis. WPA's Right to Request Additional Documentary Evidence

To preserve the integrity of the database against unauthorised, fraudulent, or unsubstantiated submissions, **WPA reserves the absolute right to require additional documentary proof** before accepting any correction. Without this safeguard, the email channel could be abused by impostors purporting to act on behalf of a state.

WPA may request, in writing, any combination of the following:

1. **Certified extract of the underlying law, decree, or constitutional article**, issued by the Official Gazette / Diário Oficial / Bundesgesetzblatt / Service Books or equivalent registry of the requesting state.
2. **Original or certified copy of the state seal** affixed to the request letter (presidential, royal, ministerial, or parliamentary seal as appropriate).
3. **Certified translation** of the supporting documents into Macedonian or English, performed by a sworn court translator of the requesting state or of the Republic of North Macedonia.
4. **Confirmation of authority of the signing officer** — a separate letter from the Minister, Ambassador, or Head of Mission attesting that the signatory was duly authorised to act on behalf of the entity.
5. **Cross-confirmation through diplomatic channel** — the Republic of North Macedonia's Ministry of Foreign Affairs may be asked to confirm receipt of an analogous note verbale from the requesting state's diplomatic mission.
6. **Direct verification via the state's official website** — WPA may require that the requesting state post a confirmation of the proposed correction on its official MFA, presidential, or heraldry-office website within 30 days, to which the WPA correction can then link.

A request lacking sufficient evidence shall not be rejected outright on first review; WPA shall move it to status `request_more_evidence` and shall specify in writing exactly which of the above (or other equivalent) materials are required. The 15-day SLA clock pauses upon issuance of such a notice and resumes upon receipt of the additional evidence.

---

## 6. Decision Categories

| Decision | Meaning | Database action |
|---|---|---|
| **Approved** | Evidence is sufficient and authoritative; correction applied. | `verification_status` updated to `corrected_by_state`; field updated; audit log entry created. |
| **Rejected** | Evidence does not establish the requested correction; WPA provides written rationale. | No database change; rejected request retained in `correction_layer.corrections_received` for transparency. |
| **Request more evidence** | Initial submission incomplete or ambiguous; WPA specifies what is needed. | No database change; clock pauses pending additional submission. |
| **Pending** | Decision in progress within SLA window. | No database change. |

All decisions are signed by the WPA Director (or designate) and recorded with timestamp in the record's `audit_trail` and `correction_layer.corrections_received[].wpa_decision_*` fields.

---

## 7. Transparency and Audit

- Every decision (Approved, Rejected, More-evidence) is logged in the record's `correction_layer` block.
- The full text of state submissions is retained internally; redacted public summaries are published in the WPA Annual Protocol Symbols Bulletin.
- States retain the right to **resubmit** a rejected request with new evidence at any time; resubmissions receive new WPA-DCR IDs.
- WPA publishes an **annual transparency report** listing: requests received, decisions, average response time, and material corrections applied.

---

## 8. Dispute Escalation

Where a state disputes a WPA decision, escalation follows the diplomatic hierarchy:

1. **First instance:** WPA Academic & Lab Excellence Officer (decision).
2. **Second instance:** WPA Director (Assoc. Prof. Dr. Sande Smiljanov).
3. **Final instance:** WPA Governing Board — referral by the Director with a written opinion. The Governing Board (constituted with international diplomatic and academic representation) may convene a 3-member ad-hoc panel that issues a binding decision within 60 days.

WPA's commitment: **no record will remain in `partial_consensus` status indefinitely once a state has formally engaged the DCP.** A definitive resolution — Approved or Rejected with rationale — will be reached.

---

## 9. Languages

The DCP accepts submissions in: **Macedonian, English, French, Spanish, Russian, Arabic, Chinese (Mandarin)**, and the official language(s) of the requesting state. Translations into Macedonian and English are performed by WPA at its own cost for archival purposes.

---

## 10. Privacy and Sovereign Dignity

- Internal correspondence between WPA and a state organ is treated as **confidential by default**; only the metadata and final decision are public.
- No state is named in WPA public materials as having submitted a "rejected" request unless the state itself elects to publicise the matter.
- The corrected record carries the notation `verification_status = corrected_by_state`, without polemic framing — the state is the **author** of its own symbols; WPA is their **custodial scribe**.

---

## 11. Free Public-Interest Service — No Fees, Ever

The Diplomatic Correction Protocol is, and shall remain, a **free public-interest service** of the World Protocol Academy.

- WPA does not charge, and shall never charge, any fee — administrative, processing, expedite, certification, archival, or other — for submitting, processing, reviewing, or applying a correction.
- WPA does not accept gifts, honoraria, hospitality, or other forms of consideration from any state or state-affiliated entity in exchange for, or in connection with, the processing of a DCP request.
- The integrity of WPA's verified academic core is non-monetisable. A state's right to be the final authority on the description of its own national symbols is **inalienable** and is exercised through the DCP **at zero cost** to that state.

Where WPA must incur costs (translation, certified mail, diplomatic-channel transmission), those costs are borne by WPA from its institutional budget.

This provision is doctrinal and cannot be altered except by formal amendment of the DCP issued in writing by the WPA Director with the unanimous concurrence of the WPA Governing Board.

---

## 12. Signatures

**Issued by:**  
Assoc. Prof. Dr. Sande Smiljanov  
Founder and Director, World Protocol Academy  
Head of Protocol, Ministry of Interior of the Republic of North Macedonia  
Skopje, 23 May 2026

**Doctrinal seal:**  
*Преговарањето е опционално. Протоколот е апсолутен.*
