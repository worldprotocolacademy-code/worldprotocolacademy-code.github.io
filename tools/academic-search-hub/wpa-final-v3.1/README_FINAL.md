# WPA Academic Search Hub v3.1

**Status: STAGING READY — Production after QA**

WPA Academic Search Hub v3.1 is a staging-ready academic infrastructure for bibliographic discovery, source traceability, authority auditing and future RAG support.

Institutional frame:
**World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies**

## Core policy

This is not a scraping tool.  
This is not a paywall bypass tool.  
This is not a substitute for human academic verification.

Restricted, paywalled, profile-based and login-restricted platforms are handled only through external search links.

## Main modules

- `wpa_harvester.py` — test/dry-run harvester shell with SQLite and traceability logic.
- `wpa_search_hub.py` — external-link and unified search hub.
- `wpa_authority_engine.py` — evidence-backed authority and RAG gate.
- `wpa_state_db.py` — SQLite state manager.
- `wpa_precedence_engine.py` — seating / precedence matrix prototype.
- `wpa_protocol_breach_observatory.py` — protocol incident monitoring queue, manual verification required.

## Quick start

```bash
python3 -m venv wpa_env
source wpa_env/bin/activate
pip install -r requirements.txt
mkdir -p wpa_output
sqlite3 wpa_output/wpa_state.db < schema.sql
cp config.example.json config.json
python wpa_harvester.py --dry-run
python wpa_harvester.py --test
python wpa_search_hub.py --external-links-only "diplomatic protocol"
```

Production deployment is allowed only after QA validation.
