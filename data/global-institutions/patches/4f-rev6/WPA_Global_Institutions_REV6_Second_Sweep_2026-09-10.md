# WPA Global Institutions Master List — REV6 Second-Sweep Patch

**Date:** 10 September 2026  
**Base:** v1.0-CORRECTED-4F-REV5  
**Scope:** New protocol/diplomacy institutions surfaced in the 10 September 2026 LinkedIn evidence sweep and independently checked where primary sources were available.

## Canonical / audit-visible additions

| ID | Institution | Country | Group | Type | Relevance | Established | Verification | Website | Entity note |
|---|---|---|---|---|---|---:|---|---|---|
| A036 | The Protocol Academy of Georgia | United States | A | Private protocol and etiquette training institution | A | 2003 | LinkedIn institutional page + business-directory/registration corroboration; official domain reported but direct retrieval unresolved | https://theprotocolacademyofgeorgia.com/ | Columbus, Georgia (U.S. state), not the country Georgia. LLC registration evidence reports 2011 while business profiles report opening/founding in 2003. |
| A037 | The International Protocol Academy of Japan (ICPA) | Japan | A | Private members-only international protocol academy | A | 2016 | Primary source + LinkedIn corroboration | https://icpa-in.com/ | Official site states academy established Nov 2016 and company incorporated Jan 2018. Accreditation claims are recorded as self-reported and are not independently endorsed by WPA. |
| A038 | Diplomatic Academy of the Caribbean (DAOC) | Trinidad and Tobago | A | University-affiliated diplomatic studies training centre | A | 2014 | UWI primary source + LinkedIn corroboration | https://sta.uwi.edu/daoc/ | Integral part of D025 — UWI Institute of International Relations. Added as audit-visible academy record but not counted as a separate distinct external institution. |
| A039 | Diplomatic Institute to the Minister of Foreign Affairs of the Republic of Bulgaria | Bulgaria | A | Government diplomatic training institute | A | 2003 | Primary government/institute sources | https://bdi.bg/en/ | Legal entity / secondary budget administrator under the Minister of Foreign Affairs; professional training for diplomats and civil servants. |
| A040 | DiploFoundation | Malta / Switzerland | A | Non-profit diplomacy and digital-policy capacity-development foundation | A | 2002 | Primary/official-domain evidence + independent institutional corroboration | https://www.diplomacy.edu/ | Established by Malta and Switzerland; diplomacy, digital diplomacy, internet governance and emerging-technology capacity development. |
| A041 | Anwar Gargash Diplomatic Academy (AGDA) | United Arab Emirates | A | Diplomatic academy / higher-education and executive-training institute | A | 2015 | Primary source | https://www.agda.ac.ae/ | Licensed in 2015; graduate programmes, executive training and foreign-policy research. |
| A042 | European Academy of Diplomacy (EAD) | Poland | A | Non-governmental non-profit diplomatic academy | A | 2004 | Primary source + EU/EPALE corroboration | https://diplomats.pl/en/ | Warsaw-based diplomatic education and executive-training academy. |
| A043 | Institute for Cultural Diplomacy (ICD) / Academy for Cultural Diplomacy | Germany / United States | A | Non-profit cultural-diplomacy education and research institution | A | 1999 | Primary source + LinkedIn corroboration | https://www.culturaldiplomacy.org/ | One institutional family; Academy for Cultural Diplomacy is not counted as a second separate entity. |
| A044 | Diplomatic Academy Nepal (DAN) | Nepal | A | Independent diplomatic training and academic institution | A | — | Primary source + Bulgarian Diplomatic Institute corroboration | https://diplomaticacademynepal.com/ | Neutral, independent and non-partisan academy; training includes diplomacy, protocol, negotiation and Diplo-Tech. |
| A045 | Foreign Service Academy (Kenya) | Kenya | A | Government foreign-service academy | A | 2017 | Primary FSA + Kenya MFA sources | https://www.fsa.go.ke/ | Predecessor Foreign Service Institute established 2006; transformed into Academy in 2017; statutory framework strengthened by Foreign Service Act 2021. |
| H031 | The American Academy of Diplomacy (AAD) | United States | H | Independent non-profit professional association of senior diplomatic practitioners | A | 1983 | Primary source | https://www.academyofdiplomacy.org/ | Washington, DC association of former senior ambassadors and foreign-policy officials; Group H retained because it is an association rather than a training academy. |

## Entity-resolution controls

- **A038 / D025:** DAOC is an integral part of the University of the West Indies Institute of International Relations already represented as D025. A038 is audit-visible and operationally relevant, but `counted_as_distinct_external_institution=false`.
- **A043:** Institute for Cultural Diplomacy and Academy for Cultural Diplomacy are treated as one institutional family, not two records.
- **A036:** “Georgia” refers to Columbus, Georgia, United States; no relation to the country of Georgia.
- **A037:** WPA records ICPA’s accreditation assertions only as institutional self-description; WPA does not independently validate or endorse the accreditor in this patch.

## REV6 candidate arithmetic

- Total records: **183**
- External records: **182**
- Distinct external institutions: **176**
- Records with website URL: **178**
- Records without website URL: **5**
- Group A: **45**
- Group H: **31**
- Relevance Level A: **52**
- Relevance Level B: **109**
- Relevance Level C: **22**

The distinct count uses **six** methodological/entity adjustments: the five preserved from REV5 plus A038 under D025.

## Source note

LinkedIn search exports were used as discovery/corroboration inputs. Primary or official institutional sources were preferred for canonical verification. The wider dataset remains a pre-publication internal-review object and URL presence does not equal full source verification.
