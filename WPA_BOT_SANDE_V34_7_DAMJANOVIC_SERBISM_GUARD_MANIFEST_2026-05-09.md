# WPA Bot-Sande v34.7 Damjanovic / Serbism Guard Manifest — 2026-05-09

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Issue

Live testing showed that answers about defence and military diplomacy could be contaminated by:

```text
Damjanovic / Damjanović source material
Serbian terminology and Serbian-language fragments
```

This is not solvable by prompt instructions alone.

## Fix

Prepared a new Worker production-candidate:

```text
bot-sande-worker-final-production-candidate-v34-7-damjanovic-serbism-guard-2026-05-09.js
```

It adds:

```text
hard source ban for Damjanovic / Damjanović / Дамјановиќ
Serbian contamination markers
post-answer firewall
protected doctrine route for defence vs military diplomacy
preservation of v34.6 diplomacy/protocol/exequatur routes
```

## Protected Routes Now Included

```text
diplomacy
protocol
exequatur
defence vs military diplomacy
```

## Test Result

```text
PASS: 16
FAIL: 0
```

## Candidate Hash

```text
sha256: 37c17fafffd4b07db4b35c29b375e2370e3fbad28f0495a3e555e85f1ec8c436
```

## Production Status

This is a production-candidate hotfix.

Production deployment still requires replacing the full Worker code in Cloudflare with the v34.7 file.
