# WPA Symbols & Protocol Main Bot Module v1.0 — Upload Instructions

## Цел

Овој пакет го додава **WPA Symbols & Protocol Lab** како специјализиран knowledge module во главниот WPA Protocol Bot.

Главниот бот останува главен институционален бот. Овој модул се активира само кога прашањето е за:

- знамиња
- химни
- државни симболи
- географија
- главни градови
- национални денови
- меѓународни организации
- дипломатски протокол
- чувствителни ентитети

## Каде да се качи

Качи ги овие папки во root на GitHub repo-то:

`tools/`

`wpaws/`

`docs/`

## Фајлови и патеки

| Фајл во пакетот | Крајна патека |
|---|---|
| `tools/virtual-sande/symbols-protocol-knowledge-policy.json` | `/tools/virtual-sande/symbols-protocol-knowledge-policy.json` |
| `tools/virtual-sande/symbols-protocol-routing-rules.json` | `/tools/virtual-sande/symbols-protocol-routing-rules.json` |
| `tools/virtual-sande/symbols-protocol-system-prompt.md` | `/tools/virtual-sande/symbols-protocol-system-prompt.md` |
| `tools/virtual-sande/symbols-protocol-sensitive-entities-policy.json` | `/tools/virtual-sande/symbols-protocol-sensitive-entities-policy.json` |
| `tools/virtual-sande/symbols-protocol-verification-sources.json` | `/tools/virtual-sande/symbols-protocol-verification-sources.json` |
| `tools/virtual-sande/symbols-protocol-bot-response-template.md` | `/tools/virtual-sande/symbols-protocol-bot-response-template.md` |
| `tools/virtual-sande/bot-connector-manifest-symbols-extension.json` | `/tools/virtual-sande/bot-connector-manifest-symbols-extension.json` |
| `tools/virtual-sande/worker-integration-snippet-v35-symbols.js` | `/tools/virtual-sande/worker-integration-snippet-v35-symbols.js` |
| `wpaws/protocol-symbols/bot-module.json` | `/wpaws/protocol-symbols/bot-module.json` |
| `docs/WPA_SYMBOLS_PROTOCOL_MAIN_BOT_MODULE_MK.md` | `/docs/WPA_SYMBOLS_PROTOCOL_MAIN_BOT_MODULE_MK.md` |

## Не заменувај

Овој пакет НЕ треба да ги замени:

- `/index.html`
- `/institute.html`
- постојниот Cloudflare Worker

Worker snippet-от е само за подоцнежна внимателна интеграција.

## Препорачан commit message

`Add WPA Symbols Protocol main bot module`

## Тест URL по upload

- `https://worldprotocolacademy-code.github.io/tools/virtual-sande/symbols-protocol-knowledge-policy.json`
- `https://worldprotocolacademy-code.github.io/tools/virtual-sande/symbols-protocol-routing-rules.json`
- `https://worldprotocolacademy-code.github.io/wpaws/protocol-symbols/bot-module.json`
