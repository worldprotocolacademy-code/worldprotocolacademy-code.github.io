# 📦 WPA — Мапа за качување (UPLOAD MAP)

**Светска академија за протокол · World Protocol Academy**
Репозиториум: `worldprotocolacademy-code.github.io`

---

## Од ZIP → Во GitHub repo

```text
.well-known/                          → /.well-known/
ai.txt                                → /ai.txt
robots.txt                            → /robots.txt
LICENSE                               → /LICENSE
tools/wpa-ip-protection/index.html    → /tools/wpa-ip-protection/index.html
docs/README-WPA-IP-ZASHTITA.md        → /docs/README-WPA-IP-ZASHTITA.md
docs/html-copyright-header-snippet.html → /docs/html-copyright-header-snippet.html
```

Помошни (за тебе, не задолжителни на сајтот):

```text
UPLOAD-MAP-MK.md         → референца
SAFE_UPLOAD_CHECKS.json  → валидациски извештај
```

---

## ⛔ ВАЖНО — БЕЗБЕДНОСНИ ПРАВИЛА

```text
НЕ КАЧУВАЈ root index.html.
НЕ ЗАМЕНУВАЈ главна WPA почетна страница.
НЕ ЗАМЕНУВАЈ institute.html.
```

Овој пакет **намерно не содржи** ниедна почетна страница. Алатката за заштита
оди само во `/tools/wpa-ip-protection/` и **не е** почетна страница.

---

## Како да качиш (GitHub веб-интерфејс)

1. На github.com во репото: **Add file → Upload files**.
2. Повлечи ги папките/фајловите од отпакуваниот ZIP. Структурата (`tools/`,
   `docs/`, `.well-known/`) се задржува.
3. Commit message:

   ```text
   Add WPA IP protection and AI training reservation layer
   ```

4. **Commit directly to the main branch** → почекај 1–2 мин за деплој.

> 💡 Ако веб-интерфејсот не дозволува повлекување на `.well-known` (скриена папка):
> **Add file → Create new file**, име `.well-known/ai.txt`, и залепи ја содржината од `ai.txt`.

---

## Тест по деплој

- `https://worldprotocolacademy-code.github.io/robots.txt`
- `https://worldprotocolacademy-code.github.io/ai.txt`
- `https://worldprotocolacademy-code.github.io/.well-known/ai.txt`
- `https://worldprotocolacademy-code.github.io/LICENSE`
- `https://worldprotocolacademy-code.github.io/tools/wpa-ip-protection/`

Сето ова треба да се отвора → заштитата е активна. 🟢
