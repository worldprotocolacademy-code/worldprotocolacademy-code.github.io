import sqlite3
import hashlib
import json
from pathlib import Path

class WPAStateDB:
    def __init__(self, db_path="wpa_output/wpa_state.db", schema_path="schema.sql"):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        if Path(schema_path).exists():
            self.conn.executescript(Path(schema_path).read_text(encoding="utf-8"))
            self.conn.commit()

    @staticmethod
    def title_year_hash(title, year):
        raw = f"{(title or '').strip().lower()}::{year or ''}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def is_duplicate(self, record):
        doi = record.get("doi")
        title = record.get("title")
        year = record.get("year")
        cur = self.conn.cursor()
        if doi:
            cur.execute("SELECT 1 FROM processed_records WHERE doi = ?", (doi,))
            if cur.fetchone():
                return True
        if title and year:
            h = self.title_year_hash(title, year)
            cur.execute("SELECT 1 FROM processed_records WHERE title_year_hash = ? AND year = ?", (h, year))
            if cur.fetchone():
                return True
        return False

    def save_record(self, record, authority_score=0, traceability_score=0, rag_included=False):
        title = record.get("title")
        year = record.get("year")
        record_id = record.get("record_id") or self.title_year_hash(title, year)
        h = self.title_year_hash(title, year)
        self.conn.execute(
            """INSERT OR IGNORE INTO processed_records
            (record_id, doi, title, year, title_year_hash, source_database, traceability_score, authority_score, rag_included)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (record_id, record.get("doi"), title, year, h, record.get("source_database"), traceability_score, authority_score, bool(rag_included))
        )
        self.conn.commit()
        return record_id
