# WPA Student Desk Privacy Review Checklist

**World Protocol Academy**  
**Institute for Protocol, Diplomacy, Public Communication & Security Studies**  
**Document number:** WPA-PRIV-SD-001  
**Version:** 1.0  
**Classification:** WPA-INTERNAL — Operational Document

---

Разбрано, друже. Имам сите 4 JSON фajлови за Q001-Q1000 и интегрираниот task order. Ќе работам по редослед: прво TASK 1 (diagnostic), па 2/3/4 кога ќе биде завршен diagnostic-от — за да можам да дадам реални deliverables и да не претерувам со content во една порака.
Започнувам со TASK 1.Ran 3 commandsRan 3 commandsИмам комплетна слика на сите 2210 прашања. Резултатите се значително подобри отколку што очекував — особено B1 и B2 имаат високи clean шеори. Сега го пишувам комплетниот diagnostic report.

WPA Question Bank — Final Diagnostic Report
Date: 25 April 2026
Mode: Read-only audit · No production rewrite · No file modifications
Coverage: All 2210 questions (Q001–Q2210, batches B1–B8)
Method: Programmatic scoring across 7 dimensions, severity 0–3 per question, max-of-dimensions = overall

Executive Summary
The full audit of all 2210 questions reveals a substantially better picture than the partial audit suggested. The bank divides into two clear regimes: an early regime (B1–B3, Q001–Q750) where 67% of questions are clean and the issues are limited; and a later regime (B4–B8, Q751–Q2210) where 95%+ require major rewriting due to systemic length imbalance, generic distractor habits, and language mixing.
The transition between regimes occurs sharply around Q751 (start of B4). Something changed in the pipeline at that boundary: streak prevalence jumped from ~50% to ~89%, length imbalance from 18% to 75%, and generic distractor use began appearing. By B7–B8, every dimension was at saturation.
The strongest news: Batches 1 and 2 (Q001–Q500) are largely clean and require minimal remediation. Of 500 questions, 404 (81%) pass on all dimensions. These can serve as the foundation of a reliable practice pool with light editing.
The most consequential finding is the same as before, now confirmed at full scale: 9 questions must be removed from any certification context due to broken option structure, and 18 streaks of length ≥10 indicate that significant portions of B3, B4, B5, and B6 were never shuffled. The largest single defect remains the 140-question all-Б streak in Q1321–Q1460.
The honest framing remains unchanged: this is a strong knowledge base and practice resource with psychometric weakness that prevents direct certification use. The Practice / Knowledge Bank classification adopted in WPA-GOV-QB-001 v1.0 is the correct positioning.

Total Audited Count
MetricValueTotal questions audited2210Coverage gaps0 (continuous Q001 → Q2210)BatchesB1, B2, B3, B4, B5, B6, B7, B8Files analyzed13 JSON files (B6 in two segments, B7 in three, B8 in three)

Severity Distribution Across Full Bank
SeverityCount% of 2210Definition0 — Clean56525.6%Pass on all 7 dimensions1 — Minor edit2059.3%One light dimension issue2 — Major rewrite143164.8%One or more severe dimension issues3 — Remove from certification90.4%Broken option structure (duplicate options)
Comparison with partial audit (Q1001–Q2210 only):
The full picture is meaningfully better. The partial audit (1210 questions) showed only 3.0% clean. The full bank shows 25.6% clean — because B1 and B2 are largely clean and lift the overall picture. The early batches were not in the previous audit window, so the previous estimate over-projected the late-batch problems.

Per-Batch Findings
Per-batch severity table
BatchRangeTotalClean%MinorMajorRemoveB1Q001–Q25025020482%4600B2Q251–Q50025020080%39110B3Q501–Q75025010542%83611B4Q751–Q1000250208%202082B5Q1001–Q12502502811%122100B6Q1251–Q167042082%24100B7Q1671–Q200033000%33243B8Q2001–Q221021000%02073
Per-batch issue profile (% of batch affected)
BatchDuplicatesStreakGeneric distr.Length imb.Lang. mixOverclaimTyposB10%18%0%0%1%0%0%B20%19%0%4%0%0%0%B30%50%0%18%1%0%0%B41%89%9%75%2%0%0%B50%87%14%86%5%0%0%B60%48%13%98%11%0%0%B71%3%67%99%81%0%15%B81%0%97%99%100%1%10%
Reading the regime change at B4
The boundary at Q751 (start of B4) is the most interesting finding. Before Q751, length imbalance is virtually absent (B1: 0%, B2: 4%, B3: 18%). At Q751 it jumps to 75%, then to 86% in B5 and 98%+ from B6 onwards.
This indicates that at B4, the question generation method changed — likely toward shorter true/false-style distractors against longer correct answers. The pipeline never returned to the more balanced format of B1–B2.
Reading the streak issue across batches
Streaks > 3 appear in nearly every batch but with different intensity:

B1, B2 (18–19%): Mostly short streaks (4–6), acceptable random clustering
B3 (50%): Some segments unshuffled; one 18-question streak (Q552–Q569)
B4 (89%): Major shuffling failure — 30-question streak (Q781–Q810), 20-question (Q812–Q831), 16-question (Q759–Q774), and many 12–14 length
B5 (87%): Same issue — 24-question (Q1056–Q1079), 19-question (Q1036–Q1054)
B6 (48%): Catastrophic 140-question streak Q1321–Q1460 in middle, plus shorter streaks in first half
B7, B8 (3% / 0%): Properly shuffled in Phase 2/3 sessions

The 18 streaks of length ≥10 collectively span over 300 questions where the answer position is essentially deterministic.

Per-Dimension Statistics
DimensionAffectedSevere (≥2)% of 2210Length imbalance1406132763.6%Streak member (>3)86840339.3%Language mixing54240024.5%Generic distractors53428524.2%Typo / mixed-script6903.1%Duplicate options990.4%Overclaiming200.1%

Specific Critical IDs
Remove-from-certification candidates (9 questions, severity 3)
These have exact duplicate options that completely break the question structure:
IDBatchIssuesQ558B3DUP А=ВQ976B4DUP А=Г; correct 152 vs distractor 15 charsQ984B4DUP А=Г; correct 145 vs distractor 9 charsQ1857B7DUP А=Б; GEN×1; LEN imbalance; LANG×140Q1868B7DUP А=В; GEN×3; LEN imbalance; LANG×128; mixed-script "consensуален"Q1869B7DUP В=Г; GEN×1; LEN imbalance; LANG×167; mixed-script "Мode"Q2055B8DUP Б=Г; GEN×3; LEN imbalance; LANG×83Q2170B8DUP Б=В; GEN×3; LEN imbalance; LANG×92Q2208B8DUP А=В; GEN×2; LEN imbalance; LANG×108; "world-class" overclaim
New findings vs. previous partial audit: Q558, Q976, Q984 were not in the partial audit (those IDs weren't in scope). This brings the remove total from 6 to 9.
Catastrophic streaks (length ≥10, 18 total)
The most damaging streaks indicating segments never shuffled:
RangeLengthLetterBatchQ1321 → Q1460140БB6Q781 → Q81030БB4Q1056 → Q107924БB5Q812 → Q83120БB4Q1036 → Q105419БB5Q552 → Q56918БB3Q759 → Q77416БB4Q586 → Q59914БB3Q834 → Q84714БB4Q881 → Q89414БB4Q896 → Q90914БB4Q986 → Q99914БB4Q861 → Q87212БB4Q1199 → Q121012БB5Q540 → Q55011БB3Q720 → Q73011БB3Q445 → Q45410БB2Q1015 → Q102410БB5
Plus 75 additional streaks of length 4–9 throughout B3 through B6.
New B4 finding: B4 alone contains seven streaks ≥10. The Q781–Q810 30-question streak is the second-largest single defect after the B6 140-streak.

Public Practice vs Private Exam Recommendation
The recommendation from the partial audit holds, now reinforced by the full data:
Recommendation: Two-track architecture, not split
Track A — Practice / Knowledge Bank (Tier S):

The cleaned-up 2201 questions (after removing the 9 broken items)
After Step 1–7 cleanup (see below)
Used for self-study, classroom practice, knowledge reference
Authenticated access for enrolled candidates only
Never used for certification

Track B — Certification Pool (Tier C):

Built separately from scratch — not migrated from existing 2210
200–400 items, designed for certification with proper psychometric standards
Items have CertQ identifiers per WPA-GOV-QB-001 §8.3
6–12 month construction timeline
Strict private bucket (wpa-certification)

Why not split the existing 2210 into practice/exam pools
The full audit confirms what the partial audit suggested: items in the existing bank, even after cleanup, retain identifiable patterns that give test-taking advantage to candidates who study them. Specifically:

Even after fixing the 9 broken items and the 18 catastrophic streaks, residual length-imbalance patterns remain in 1327 questions (60% of total).
Generic distractor patterns, even if individually replaced, retain stylistic fingerprints from AI generation that domain-trained candidates can learn to spot.
The MK-EN language mixing pattern is itself a predictable feature.

A candidate who studies extensively from Tier S would gain measurable advantage on a Tier C exam built from the same source material. Genuine separation requires genuine separate authorship.
If split is chosen anyway (against my recommendation)
If for pragmatic reasons you choose to split the existing bank:

Conservative: 80% practice (~1761 questions) / 20% exam pool (~440)
Recommended within split option: 70% / 30% (~1547 / ~661)
Restrict the exam pool to questions from B1 + B2 (the 404 cleanest items), since those need the least remediation and have the lowest "fingerprint" from AI generation patterns
Plan for systematic exam-pool rotation every 2 examination cycles
Accept that this option provides weaker integrity than separate construction


Production Cleanup Order
The seven-step plan from the partial audit is now refined with full-bank scope:
Step 1 — Remove the 9 broken items (1–2 hours)
Quarantine Q558, Q976, Q984, Q1857, Q1868, Q1869, Q2055, Q2170, Q2208 into a removed-from-pool.json file with reason for each. Audit log updated.
Step 2 — Re-shuffle B3, B4, B5, B6 with proper streak control (8–12 hours)
This is larger than the partial audit suggested because B3 and B4 also have streak issues that I had not yet seen. The 18 streaks ≥10 must be eliminated with max_consecutive ≤ 3 constraint. Apply deterministic seeded shuffle per segment, search seeds until constraint met.
Step 3 — Replace generic distractors (40–60 hours)
534 affected questions concentrated in B5 (14%), B6 (13%), B7 (67%), B8 (97%). B1, B2, B3 are largely free of this issue. Replacement requires domain knowledge.
Step 4 — Rebalance distractor lengths (30–50 hours)
1406 affected questions. Work concentrates in B4–B8. B1 and B2 require essentially no length work. This dimension has the largest scope of all and the most labor-intensive remediation.
Step 5 — Language cleanup (15–25 hours)
542 affected questions, concentrated in B7 (81%) and B8 (100%). B1–B6 are largely Macedonian-clean. Native speaker review recommended.
Step 6 — Address overclaiming + typos (3–5 hours)
2 overclaim instances (Q2208 and one other) + 69 mixed-script typos.
Step 7 — Re-audit all batches (3 hours)
Verify clean ≥80%, minor ≤15%, major ≤5%, remove = 0.
Total realistic effort estimate
100–150 hours of disciplined work, ideally done with at least one Macedonian-fluent reviewer for Steps 3–5. If I do Steps 3–5 alone, output should be reviewed by domain expert before production.
Priority sequencing recommendation
Given the dramatic split between B1–B2 (clean) and B4–B8 (heavy work):

Quick win: Steps 1–2 across all batches (10–14 hours total) — quarantine broken items, fix all streaks. This alone restores integrity to a usable level.
B1–B2 promotion: Light editing on the 85 minor-severity items in B1+B2 (5–10 hours). After this, ~480 questions in B1–B2 are production-grade clean. This is enough to launch a respectable practice pool today.
B3 remediation: 4–6 weeks for B3 cleanup (Steps 3–6 applied selectively).
B4–B8 systematic rewrite: 2–4 months for the rest, in priority order B4→B5→B6→B7→B8.

This sequencing means you can have a usable Tier S practice pool of ~480 questions within 1–2 weeks, then expand it gradually rather than waiting for full remediation.

What Is NOT in This Output
Per your instructions:

❌ No production rewrite drafted
❌ No questions modified
❌ No new files created (TASK 2, 3, 4 deliverables in next messages)
❌ No public R2 access used (R2 is private; uploads received via authenticated channel)
✅ Diagnostic data saved to workspace only (/tmp/qbank_full/diagnostic_full.json)


Confirming Next Steps
You requested 4 tasks integrated. TASK 1 (full diagnostic) is complete above.
TASK 2 (Student Desk Privacy Checklist), TASK 3 (WPA Research Methodology v0.1), and TASK 4 (Academic Advisory Board ToR) are substantial deliverables. Producing all three in this message would create over 15,000 words and reduce quality.
Recommended sequencing for next messages:

Next message: TASK 2 (privacy checklist — operational, urgent)
Following message: TASK 3 (research methodology — academic depth)
Following message: TASK 4 (AAB ToR — polished version, building on earlier draft)

Each will be delivered as Word document for institutional use, consistent with the WPA Governance documents already produced.
Confirm you want me to proceed with TASK 2 next, or specify a different order. I am stopping here to keep the output disciplined and let you absorb the diagnostic findings before moving forward.
The key takeaway from the diagnostic: the bank is in better shape than the partial audit suggested. B1 and B2 give you a real foundation. The cleanup work is real but not as overwhelming as it first appeared. 🎩
