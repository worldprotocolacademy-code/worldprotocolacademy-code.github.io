# WPA Institute — Maximum Protection Doctrine v1.1

## Цел

Да се заштити WPA / Институтот од неовластено AI training користење, dataset ingestion, scraping, voice/persona imitation, автоматско реобјавување и неовластена комерцијална употреба, без да се уништи јавната видливост на сајтот.

## Главна одлука

Не ја ослабуваме заштитата само за CI да помине.

Наместо тоа:

1. `robots.txt` останува силен и блокира конкретни AI-training / bulk-data bots.
2. `User-agent: *` останува дозволен, за да не се блокира целиот јавен сајт.
3. `scripts/site_quality_check.py` се поправа да прави разлика меѓу:
   - опасно: `User-agent: *` + `Disallow: /`
   - дозволено: `User-agent: GPTBot` + `Disallow: /`
4. `ai.txt`, `.well-known/ai.txt` и `LICENSE` ја носат правната/TDM резервација.
5. Ова не е технички firewall. За вистинска серверска enforcement фаза треба Cloudflare Worker / WAF / rate limiting / IP verification.

## Што заштитува

- AI training;
- model training;
- dataset ingestion;
- bulk scraping;
- content mirroring;
- synthetic voice/persona creation;
- automated republication;
- unauthorized derivative products.

## Што останува дозволено

- Google/Bing/DuckDuckGo/Applebot indexing;
- нормално човечко читање;
- кратко академско цитирање со attribution;
- public linking.

## Важна реална граница

`robots.txt` е доброволен стандард. Добри crawlers ќе го почитуваат; злонамерни crawlers можат да го игнорираат. Затоа ова е Layer 1 + legal/TDM layer, не целосен firewall. Следна фаза за поголема реална заштита е Cloudflare Worker/WAF, rate limiting, bot scoring и server-side logging.
