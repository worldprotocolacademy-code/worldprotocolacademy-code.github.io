# WPA Bot-Sande v34.6 Core Definitions Hotfix Manifest — 2026-05-09

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Issues

Live tests showed core definition problems:

```text
1. Егзекватура was incorrectly answered as IT / blockchain.
2. Протокол needed a more suitable WPA-canonical definition.
3. Дипломатија was confused with protocol and included invented / overstated source-title claims.
```

## Fix

Prepared a new Worker production-candidate:

```text
bot-sande-worker-final-production-candidate-v34-6-core-definitions-hotfix-2026-05-09.js
```

It adds protected doctrine fast-path before retrieval and LLM for:

```text
diplomacy
protocol
exequatur
```

## Expected Behavior

For `Што е Дипломатија?`, answer must define diplomacy as organised practice / instrument for communication, negotiation, representation and protection of interests among states and international actors. It must distinguish diplomacy from protocol and must not invent book/source titles.

For `Што е Протокол?`, answer must define protocol as a system of rules, norms, order and formal procedures governing official, state, diplomatic and institutional conduct, and distinguish it from etiquette and ceremonial.

For `Што е Егзекватура?`, answer must define exequatur as a consular/protocol act or document authorising a foreign consul to perform consular functions in the receiving state, and must not define it as software, blockchain, computer science or IT.

## Test Result

```text
PASS: 14
FAIL: 0
```

## Candidate Hash

```text
sha256: 2e7f15793a98cef68593881bdaafd14a9befcac5e9271f9d76a98d153ef799d3
```

## Production Status

This is a production-candidate hotfix.

Production deployment still requires replacing the full Worker code in Cloudflare with the v34.6 file.
