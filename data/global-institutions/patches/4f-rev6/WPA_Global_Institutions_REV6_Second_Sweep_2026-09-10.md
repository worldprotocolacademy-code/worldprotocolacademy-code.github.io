# WPA Global Institutions Master List — REV6 Integral Reconciliation Patch

**Date:** 10 September 2026  
**Base:** v1.0-CORRECTED-4F-REV5  
**Status:** Reconciled source package for the 10 September 2026 discovery sweep  
**Machine-readable source:** `WPA_REV6_Additions.json`

## Scope

REV6 reconciles the two 10 September 2026 LinkedIn discovery exports against the REV5 canonical master and other WPA benchmark layers. Discovery mentions were **not** automatically promoted. Each candidate was classified as a canonical institution, audit-visible specialist subunit, historical record, alias/successor context, programme/community, or unresolved watchlist candidate.

The reconciliation identified **51 additional records** suitable for the REV6 dataset. Three of those — **A038, A065 and A066** — are specialist child/subunit records and therefore do **not** increase the distinct-institution count.

## Reconciled REV6 arithmetic

| Measure | REV5 | REV6 |
|---|---:|---:|
| Total records | 172 | **223** |
| External records | 171 | **222** |
| Distinct external institutions | 166 | **214** |
| Records with website URL | 167 | **216** |
| Records without website URL | 5 | **7** |
| Group A | 35 | **70** |
| Group B | 25 | **33** |
| Group D | 26 | **27** |
| Group H | 30 | **37** |
| Relevance Level A | 41 | **77** |
| Relevance Level B | 109 | **124** |
| Relevance Level C | 22 | **22** |

The distinct count is **222 external records − 8 methodological/entity adjustments = 214 distinct external institutions**. Five adjustments are carried forward from REV5; REV6 adds A038/D025, A065/A011 and A066/H032 as non-distinct specialist-subunit relationships.

## Key entity-resolution decisions

- **A038 — Diplomatic Academy of the Caribbean (DAOC)** is an integral part of **D025 — University of the West Indies, Institute of International Relations**. It remains audit-visible but is not counted as a second distinct external institution.
- **A039 — Bulgarian Diplomatic Institute** already appeared in other WPA benchmark/institute content. REV6 normalizes it into the canonical Master List; it is not described as a first-time WPA discovery.
- **A043 — Institute for Cultural Diplomacy / Academy for Cultural Diplomacy** is one institutional family, not two records.
- **A046 — Protocol International (Netherlands)** and **A047 — Protocol International (United States)** are distinct namesake entities and remain separate.
- **A065 — Georgetown Institute for the Study of Diplomacy** is a specialist subunit under existing **A011 — Georgetown School of Foreign Service** and is non-distinct for canonical counting.
- **A066 — Indian Academy of International Law and Diplomacy** is the teaching wing of **H032 — Indian Society of International Law** and is non-distinct for canonical counting.
- **A067 — Institute for Diplomacy and International Affairs, Loughborough University London** carries current-successor/context treatment for the historical Academy of Diplomacy and International Governance; the historical academy is not duplicated.
- **A069 — Faculty of Diplomacy and Security, Belgrade** carries current-successor/context treatment for historical Academy for Diplomacy and Security references.

## Included record ranges

- **A036–A070** — protocol schools, diplomatic academies, foreign-service academies, diplomacy-focused university schools/institutes and directly relevant training entities.
- **B026–B033** — diplomacy/international-affairs research institutes and think tanks.
- **D027** — historical London Academy of Diplomacy, retained explicitly as historical/inactive/unresolved-current-status rather than represented as a current academy.
- **H031–H037** — professional associations, networks and civil-society diplomacy organizations.

Full names, countries, institutional types, verification status, websites, parent relationships and notes are maintained in `WPA_REV6_Additions.json` and generated into the REV6 JSON/CSV/Markdown master outputs.

## Watchlist exclusions

**W001–W013** are deliberately excluded from canonical distinct-institution counts. They include professional communities, LinkedIn groups, programmes, unresolved academy references and organizations whose legal/primary institutional identity did not reach the REV6 insertion threshold. This includes the Global Protocol Circle, European Union Diplomatic Academy programme layer, Youth Diplomacy Academy of Africa, Girls In Diplomacy Inc., Ankara Diplomacy Academy, unresolved Konrad Adenauer/Academy for Economic Diplomacy references, Kyiv-Mohyla School of Diplomacy, American Diplomacy House Academy, Climate Diplomacy Academy, Sport Diplomacy Academy, Ambassador’s Youth Diplomacy Academy and the LinkedIn group Public Diplomacy & Diplomatic Academy.

## Methodological note

REV6 is the **integral reconciled revision for this discovery sweep**, not a claim that every protocol/diplomacy institution globally has been exhaustively identified. Wider legacy-record source verification remains in progress. URL presence alone does not equal source verification, and accreditation/marketing claims are not independently endorsed by WPA unless explicitly documented.
