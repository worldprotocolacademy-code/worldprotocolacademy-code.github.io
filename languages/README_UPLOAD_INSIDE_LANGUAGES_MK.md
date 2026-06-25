# WPA Languages Hub Link Fix v1.0

## Што поправа

Ако директните URL работат, но клик од `/languages/` дава 404, проблемот е во hub страницата `/languages/index.html`.

Овој пакет дава replacement `index.html` за `/languages/`, со директни линкови:

- `/languages/fr/index.html`
- `/languages/de/index.html`
- `/languages/ar/index.html`
- итн.

## Каде да се качи

Оди во GitHub папката:

`/languages/`

и качи го само:

`index.html`

како replacement.

## Не качувај во root

Овој `index.html` НЕ оди во главниот root. Оди само во `/languages/`.

## Commit message

`Fix WPA languages hub links`
