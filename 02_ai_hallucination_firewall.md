# WPA AI Hallucination Firewall – Technical Specification

## 1. Diagram

```text
[User asks question]
→ [Classify question]
→ [Is political or territorial?]
→ YES: [Diplomatic Language Filter]
→ [Rewrite neutrally]
→ [Is about symbols, flags, anthems, states, titles?]
→ YES: [Search Protocol Symbols Lab]
→ [Count verified sources]
→ 3 sources: answer allowed
→ 2 sources: answer with caution + confidence 0.60
→ 1 source: no answer, human verification
→ 0 sources: no final answer
→ [Calculate confidence_score]
→ [If confidence > 0.70: answer]
→ [If confidence < 0.70: block answer]
```

## 2. Confidence Score Calculation

| Element | Points |
|---|---|
| 3 independent sources | +0.40 |
| Last verified < 12 months | +0.20 |
| No disputed status | +0.20 |
| Terminological consistency | +0.10 |
| Diplomatic filter passed | +0.10 |
| **Total** | **1.00** |

**Rules:**
- > 0.70 = answer allowed
- 0.60 = caution only (2 sources)
- < 0.70 = human verification required
- **No verified source = No final answer**

**"Don't know" phrasing:** *"Бара верификација. WPA Protocol Symbols Lab нема запис за ова."*

## 3. Diplomatic Language Filter – Banned Phrases

| ❌ NOT allowed | ✅ Allowed |
|---|---|
| спорна територија | територија со нерешен меѓународен статус |
| окупирана територија | територија под меѓународна администрација / subject to UNSC resolutions |
| непризната држава | држава со ограничено меѓународно признавање |
| терористичка организација | организација означена како терористичка од [ОН/ЕУ] |

## 4. Success Indicators

| Indicator | Target |
|---|---|
| Hallucinations for symbols | 0 |
| Answer without source | 0 |
| Confidence < 0.70 | Auto-block |
| Filter list | Quarterly updates |
