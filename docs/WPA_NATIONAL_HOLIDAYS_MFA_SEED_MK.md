# WPA National Holidays MFA Seed Dataset v1.0

## Што е ова

Ова е почетен **seed dataset** за National Days модулот, извлечен од PDF табелата `NATIONAL HOLIDAYS`.

PDF-от има 2 страници и содржи табела по месеци со земја и назив на празник.

Во PDF header-от визуелно стои **Република Северна Македонија · Министерство за надворешни работи**.

## Број на записи

96 записи.

## Важно

Ова НЕ е финална 197-државна проверена база.

Ова е seed база за ботот, со статус:

`source_seed_needs_final_verification`

Значи ботот може да ја користи како почетна референца, но за финални јавни одговори треба:

- официјална проверка;
- нормализација на имиња;
- проверка на променливи датуми;
- проверка на чувствителни ентитети;
- усогласување со WPA Symbols & Protocol Lab.

## Специјални забелешки

Во табелата има некои чувствителни или неодредени формулации:

- Kosovo
- Holy See
- SMO of Malta
- P.R. of China
- Korea

За нив ботот мора да користи дипломатска претпазливост и disclaimer.

## Upload paths

- `/tools/virtual-sande/national-holidays-mfa-seed.json`
- `/wpaws/protocol-symbols/national-holidays-mfa-seed.json`
- `/docs/national-holidays-mfa-seed.csv`
