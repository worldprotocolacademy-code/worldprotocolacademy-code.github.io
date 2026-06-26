# WPA Audio Media Engine — v3.0 Unified Build

## Контекст
Во repo-то постоеја три различни „audio engine" датотеки (root `audio-media-engine.html`, фолдер `audio-media-engine/index.html` = Beta landing, и `wpa-audio-media-engine-v1-4-bound.html`). По финална WPA редакциска одлука: престанавме да бркаме која верзија е која и изградивме **една дефинитивна, идеална и уникатна** верзија.

## Што спојува v3.0
Целиот feature-set од „Production polish pass" екранот + безбедната инженерска основа од v2.1, во еден самостоен фајл:
- Тријазично **MK / EN / SQ** (dictionary-driven; цел UI се превклучува, вклучително `<html lang>`).
- **Режими** Academic / Formal / Executive / Viral — го менуваат регистарот на сите генератори и метаподатоците.
- **Уникатен потпис: instrument panel** — жива **FLOOR** ламба (еден активен говорник, свети зелено кога е зафатена) + аудио-нивоа мотив; monospace конзолни читања.
- **Секогаш видлива WPA Конзола**: Тековен проект · Метаподатоци · Политика на соба · Белешки · Жив преглед.
- **4 режима на соба** (Класа / Работилница / Вебинар / Институционална) со капацитети + контрола на зборот поврзана со FLOOR ламбата.
- Demo value snapshot (јасно означен како демо, не финансиско ветување) + табела со 10 проекти.
- Save / Export / Reset со целосна hydration на состојбата.

## Зачувано / безбедност
- WPA house style (navy/gold), доктрина и footer disclaimer непроменети.
- Сите Phase 2 guards: глас = consent-first (без неовластено клонирање), живи соби = симулација, Web3 = само по правна ревизија.
- Нема root `index.html`; `institute.html` / `privacy.html` / `disclaimer.html` недопрени. Repo-root-relative патеки.

## Валидација
- JS syntax OK (двете копии) · 0 дупликат ID · 10/10 tab–section parity.
- 99 i18n клучеви × 3 јазици = 0 што недостасуваат.
- Headless jsdom smoke test: 0 runtime грешки (init, SQ switch, mode-aware generate, floor grant, stages).

## Test URLs
- `https://worldprotocolacademy-code.github.io/audio-media-engine.html`
- `https://worldprotocolacademy-code.github.io/tools/wpa-audio-media-engine/`

## Commit message
`Unify WPA Audio Media Engine to v3.0 (trilingual + console + floor control)`
