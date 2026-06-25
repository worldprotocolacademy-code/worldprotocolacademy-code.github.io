# DEPLOYMENT CHECKLIST

1. `mkdir wpa-final-v3.1 && cd wpa-final-v3.1`
2. `python3 -m venv wpa_env`
3. `source wpa_env/bin/activate`
4. `pip install -r requirements.txt`
5. `mkdir -p wpa_output`
6. `sqlite3 wpa_output/wpa_state.db < schema.sql`
7. `cp config.example.json config.json`
8. `python wpa_harvester.py --dry-run`
9. `python wpa_harvester.py --test`
10. Inspect generated reports.
11. Only after QA, production deployment may be considered.
