# WPA Translator Cleanup Stage 1 · Validation Report

Овој пакет е направен од актуелниот стабилен `index.html` што го прати претходно. Live `index.html` не се менува.

## Structural counts

### original
- lines: 3891
- bytes_utf8: 243005
- section_open: 28
- section_close: 28
- style_open: 6
- style_close: 6
- script_open: 11
- script_close: 11
- header_open: 1
- header_close: 1
- main_open: 1
- main_close: 1
- footer_open: 1
- footer_close: 1

### stage1
- lines: 3893
- bytes_utf8: 247310
- section_open: 28
- section_close: 28
- style_open: 6
- style_close: 6
- script_open: 11
- script_close: 11
- header_open: 1
- header_close: 1
- main_open: 1
- main_close: 1
- footer_open: 1
- footer_close: 1

## Residual mixed-English terms after Stage 1

- `Certification Page`: 1
- `Membership & Access`: 1
- `Partner & Growth Logic`: 1
- `Executive / Institutional`: 3
- `Humanism & Dialogue`: 1

## Important note

Stage 1 е јазично чистење на македонската канонска основа во draft. Не е финална v4 key migration. Следната фаза ќе биде `data-i18n` / locale миграција по секции.
