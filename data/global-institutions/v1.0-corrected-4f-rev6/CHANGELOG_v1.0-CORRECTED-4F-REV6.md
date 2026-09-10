# Changelog — v1.0-CORRECTED-4F-REV6

**Date:** 2026-09-10

## Reconciliation result

REV6 integrates 51 additional records from the 10 September discovery sweep after full deduplication and entity-resolution review.

## Added

- **A036 — The Protocol Academy of Georgia**
- **A037 — The International Protocol Academy of Japan (ICPA)**
- **A038 — Diplomatic Academy of the Caribbean (DAOC)**
- **A039 — Diplomatic Institute to the Minister of Foreign Affairs of the Republic of Bulgaria**
- **A040 — DiploFoundation**
- **A041 — Anwar Gargash Diplomatic Academy (AGDA)**
- **A042 — European Academy of Diplomacy (EAD)**
- **A043 — Institute for Cultural Diplomacy (ICD) / Academy for Cultural Diplomacy**
- **A044 — Diplomatic Academy Nepal (DAN)**
- **A045 — Foreign Service Academy (Kenya)**
- **A046 — Protocol International (Netherlands)**
- **A047 — Protocol International (United States)**
- **A048 — US Institute of Diplomacy and Human Rights (USIDHR)**
- **A049 — ProtocolToday Academy of Soft Diplomacy and Protocol**
- **A050 — Diplomacy Academy of the Ministry of Foreign Affairs of Türkiye**
- **A051 — Diplomatic Academy of the Ministry of Foreign Affairs of Serbia**
- **A052 — Diplomatic Academy of the Ministry of Foreign and European Affairs of Croatia**
- **A053 — Hungarian Diplomatic Academy**
- **A054 — Diplomatic Academy of the Ministry of Foreign Affairs of the Kyrgyz Republic named after Kazy Dikambaev**
- **A055 — Foreign Service Academy of the Federal Foreign Office**
- **A056 — Moroccan Academy for Diplomatic Studies (AMED)**
- **A057 — Mediterranean Academy of Diplomatic Studies (MEDAC), University of Malta**
- **A058 — Kyiv School of Diplomatic Arts (KSDA)**
- **A059 — University of World Economy and Diplomacy (UWED)**
- **A060 — Diplomatic Academy of Vietnam (DAV)**
- **A061 — DIRCO Diplomatic Academy and International School**
- **A062 — USEK Diplomacy Academy, Holy Spirit University of Kaslik**
- **A063 — The Fletcher School of Law and Diplomacy, Tufts University**
- **A064 — School of Diplomacy and International Relations, Seton Hall University**
- **A065 — Institute for the Study of Diplomacy, Georgetown University**
- **A066 — Indian Academy of International Law and Diplomacy**
- **A067 — Institute for Diplomacy and International Affairs, Loughborough University London**
- **A068 — Folke Bernadotte Academy (FBA)**
- **A069 — Faculty of Diplomacy and Security (FDB), Belgrade**
- **A070 — Mount Protocol Ltd**
- **B026 — Asian Institute of Diplomacy and International Affairs (AIDIA)**
- **B027 — Institut Open Diplomacy**
- **B028 — European Institute of International Studies (EIIS)**
- **B029 — Centre for Security, Diplomacy and Strategy (CSDS), Vrije Universiteit Brussel**
- **B030 — Public Diplomacy Institute (PDI)**
- **B031 — Sié Chéou-Kang Center for International Security and Diplomacy, University of Denver**
- **B032 — Center for Communication Development and Diplomacy in Africa (CCDDA)**
- **B033 — Penn Biden Center for Diplomacy and Global Engagement, University of Pennsylvania**
- **D027 — London Academy of Diplomacy, University of East Anglia**
- **H031 — The American Academy of Diplomacy (AAD)**
- **H032 — The Indian Society of International Law (ISIL)**
- **H033 — Tech Diplomacy Network**
- **H034 — International Forum for Peace and Diplomacy (IFPD)**
- **H035 — Academy of Youth Diplomacy**
- **H036 — Inside Diplomacy**
- **H037 — ACD — Agency for Cultural Diplomacy**

## Entity-resolution controls

- A038 / D025, A065 / A011 and A066 / H032 are audit-visible specialist subunits and do not inflate the distinct institution count.
- A043 combines ICD / Academy for Cultural Diplomacy as one institutional family.
- A046 and A047 are distinct Netherlands/U.S. namesake entities.
- W001-W013 remain outside canonical counts.

## Final reconciliation QA trigger

The generated REV6 outputs were rechecked after integration and this final non-generated commit intentionally triggers the repository's pull-request validation suite against the complete reconciled branch state before merge.
