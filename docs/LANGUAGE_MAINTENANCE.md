# WPA Language Maintenance Guide / Водич за одржување на јазици

**World Protocol Academy — Language Infrastructure**
*Светска протоколарна академија — Јазична инфраструктура*

> Doctrine: *Negotiation is optional. Protocol is absolute.*
> Доктрина: *Преговарањето е опционално. Протоколот е апсолутен.*

---

## 🇲🇰 МАКЕДОНСКИ

### 1. Преглед

WPA има јазична инфраструктура за **52 јазици**, поделени во три приоритети:

- **Приоритет 0** (човечки верификувани): македонски (mk), британски англиски (en)
- **Приоритет 1** (топ-12 за глобален дофат): кинески, руски, арапски, француски, германски, италијански, шпански, турски, албански, српски, бугарски, грчки
- **Приоритет 2** (проширена покриеност): преостанатите 38 јазици

Сите метаподатоци се чуваат во `data/languages.json`.

### 2. Како да додадам нов јазик

**Чекор 1.** Отворете го `data/languages.json` и додајте нов запис:

```json
"xx": {
  "name": "Native Name",
  "name_en": "English Name",
  "iso_639_1": "xx",
  "iso_639_2": "xxx",
  "script": "Latn",
  "direction": "ltr",
  "status": "pending",
  "priority": 2,
  "last_updated": null,
  "locale": "xx-XX",
  "regions": ["XX"]
}
```

**Чекор 2.** Креирајте папка `/xx/` во корен на репозиториумот.

**Чекор 3.** Копирајте го шаблонот од `/en/` во `/xx/` и преведете го.

**Чекор 4.** Додадете го јазикот во менито за избор на јазик (во `index.html` и сите страници).

**Чекор 5.** Кога ќе се заврши преводот, ажурирајте го статусот:
- `"status": "ai_generated"` ако е автоматски превод
- `"status": "human_verified"` ако е проверен од лектор
- Ажурирајте `"last_updated": "YYYY-MM-DD"`

### 3. Како да ажурирам постоечки превод

Кога ќе најдете грешка во конкретен јазик:

1. Отворете ја релевантната страница во `/xx/page-name.html`.
2. Поправете ја грешката.
3. Ажурирајте го `"last_updated"` во `data/languages.json` за тој јазик.
4. Ако грешката е критична (граматичка, семантичка, увредлива), означете го јазикот за лекторски преглед: додадете поле `"needs_review": true`.

### 4. Како да ја пуштам автоматската проверка

> **Забелешка:** Автоматската скрипта за проверка (`scripts/check-mk-spelling.js`) се изработува во **Задача 3**, која не е дел од оваа испорака. Овој дел е резервиран за иднина.

Кога ќе биде имплементирана, командата ќе биде:
```bash
npm install        # еднаш, за инсталација на зависности
npm run check-spelling
```

Излез: листа на пронајдени грешки со фајл и линија. Exit code 0 = чисто, 1 = има грешки.

### 5. Како да го исклучам автоматизмот

Ако нешто тргне наопаку (на пр. скриптата создава лажни позитиви):

1. Привремено отстранете го пред-deploy hook-от:
   ```bash
   git config --local core.hooksPath /dev/null
   ```
2. Или директно деактивирајте го GitHub Actions workflow-от:
   - Одете на GitHub → Repository → Actions → Disable workflow
3. Или обележете го јазикот како `"status": "in_progress"` за да биде исклучен од проверки.

### 6. Принципи за одржување

1. **Македонскиот и англискиот секогаш се извор.** Сите други јазици се пренасочуваат назад кон нив за официјална комуникација.
2. **Никогаш не менувајте бренд-термини при превод:** *World Protocol Academy*, *WPA*, *WPAWS*, *Virtual Sande*, *Protocol Symbols Lab*, *Diplomatic Analysis Lab*. Тие остануваат на оригинал.
3. **Имиња на држави и главни градови** — следете го Правописот 2017 (поглавје XI) за македонскиот; за останати јазици — официјалните стандарди на тие земји.
4. **RTL јазици (ar, he, fa)** — мора да имаат `dir="rtl"` на ниво на `<html>`, не само со CSS.
5. **Машинскиот превод секогаш носи disclaimer.** Никаков машински превод не смее да биде претставен како „официјален".

### 7. Контакт

За прашања или предлози: [worldprotocolacademy@gmail.com](mailto:worldprotocolacademy@gmail.com)
Алтернативен контакт: [worldprotocolacademy@outlook.com](mailto:worldprotocolacademy@outlook.com)

---

## 🇬🇧 ENGLISH

### 1. Overview

WPA maintains language infrastructure for **52 languages**, organised in three priority tiers:

- **Priority 0** (human-verified): Macedonian (mk), British English (en)
- **Priority 1** (top 12 for global reach): Chinese, Russian, Arabic, French, German, Italian, Spanish, Turkish, Albanian, Serbian, Bulgarian, Greek
- **Priority 2** (extended coverage): remaining 38 languages

All metadata is stored in `data/languages.json`.

### 2. How to add a new language

**Step 1.** Open `data/languages.json` and add a new entry:

```json
"xx": {
  "name": "Native Name",
  "name_en": "English Name",
  "iso_639_1": "xx",
  "iso_639_2": "xxx",
  "script": "Latn",
  "direction": "ltr",
  "status": "pending",
  "priority": 2,
  "last_updated": null,
  "locale": "xx-XX",
  "regions": ["XX"]
}
```

**Step 2.** Create a `/xx/` folder at the repository root.

**Step 3.** Copy the template from `/en/` into `/xx/` and translate it.

**Step 4.** Add the language to the language selector menu (in `index.html` and all pages).

**Step 5.** When the translation is complete, update the status:
- `"status": "ai_generated"` for machine translation
- `"status": "human_verified"` for lector-reviewed translation
- Update `"last_updated": "YYYY-MM-DD"`

### 3. How to update an existing translation

When you find an error in a specific language:

1. Open the relevant page at `/xx/page-name.html`.
2. Fix the error.
3. Update `"last_updated"` in `data/languages.json` for that language.
4. If the error is critical (grammatical, semantic, or offensive), flag the language for lector review: add `"needs_review": true`.

### 4. How to run the automated check

> **Note:** The automated spell-check script (`scripts/check-mk-spelling.js`) is part of **Task 3**, which is not included in this delivery. This section is reserved for future implementation.

When implemented, the command will be:
```bash
npm install        # once, to install dependencies
npm run check-spelling
```

Output: list of errors with file and line. Exit code 0 = clean, 1 = errors found.

### 5. How to disable the automation

If something goes wrong (e.g. the script produces false positives):

1. Temporarily remove the pre-deploy hook:
   ```bash
   git config --local core.hooksPath /dev/null
   ```
2. Or directly disable the GitHub Actions workflow:
   - Go to GitHub → Repository → Actions → Disable workflow
3. Or mark the language as `"status": "in_progress"` to exclude it from checks.

### 6. Maintenance principles

1. **Macedonian and English are always the source.** All other languages redirect back to them for official communication.
2. **Never translate brand terms:** *World Protocol Academy*, *WPA*, *WPAWS*, *Virtual Sande*, *Protocol Symbols Lab*, *Diplomatic Analysis Lab*. These remain in original form.
3. **Country names and capitals** — follow Pravopis 2017 (Chapter XI) for Macedonian; for other languages, follow each country's official standards.
4. **RTL languages (ar, he, fa)** — must have `dir="rtl"` at the `<html>` element level, not only via CSS.
5. **Machine translation always carries a disclaimer.** No machine translation may be presented as "official."

### 7. Contact

Questions or suggestions: [worldprotocolacademy@gmail.com](mailto:worldprotocolacademy@gmail.com)
Alternative contact: [worldprotocolacademy@outlook.com](mailto:worldprotocolacademy@outlook.com)

---

## 📂 Repository Structure / Структура на репозиториум

```
wpa/
├── index.html                       ← Macedonian (default)
├── /en/                             ← British English
│   ├── index.html
│   └── ...
├── /zh/                             ← Chinese (Simplified)
├── /ru/                             ← Russian
├── /ar/                             ← Arabic (RTL)
├── ...                              ← 48 more language folders
├── data/
│   ├── languages.json               ← Language metadata (this delivery)
│   └── countries.json               ← 53 countries (existing)
├── docs/
│   ├── WPA_PRAVOPIS_VODIC.md        ← Pravopis guide (this delivery)
│   └── LANGUAGE_MAINTENANCE.md      ← This document
├── scripts/
│   ├── check-mk-spelling.js         ← (Task 3 — future)
│   ├── translator-loader-v6.js      ← (Task 7 — future)
│   └── generate-all-languages.js    ← (Task 9 — future)
├── templates/
│   └── page-template.html           ← (Task 9 — future)
└── .github/
    └── workflows/
        └── language-check.yml       ← (Task 3 — future)
```

---

## 📋 Status / Статус — May 2026

| Task / Задача | Status / Статус |
|---|---|
| Task 1: Pravopis guide (Markdown) | ✅ Delivered / Испорачано |
| Task 2: Pravopis HTML (interactive) | ✅ Delivered / Испорачано |
| Task 3: Auto-check script + GitHub Actions | ⏳ Pending / Чека |
| Task 4: HTML page corrections | ⏳ Pending real error list / Чека реална листа на грешки |
| Task 5: American → British English | ⏳ Pending / Чека |
| Task 6: 48-language translation | 🔄 Redefined: i18n architecture first / Редефинирано: прво i18n |
| Task 7: Translator loader v6 | ⏳ Pending / Чека |
| Task 8: languages.json | ✅ Delivered / Испорачано |
| Task 9: Template + generator | ⏳ Pending / Чека |
| Task 10: This document | ✅ Delivered / Испорачано |

---

*Maintained by World Protocol Academy, Skopje, North Macedonia.*
*Се одржува од Светската протоколарна академија, Скопје, Северна Македонија.*
