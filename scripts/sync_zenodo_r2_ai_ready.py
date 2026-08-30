#!/usr/bin/env python3
"""Add public WPA Zenodo records to the R2 AI-ready corpus, without deletes."""
from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from docx import Document
from pypdf import PdfReader

ZENODO_API = "https://zenodo.org/api/records"
DEFAULT_BUCKET = "protocol-kb"
DEFAULT_PREFIX = "world-protocol-academy/UPLOAD_TO_WORLD_PROTOCOL_ACADEMY/99_ai_search_ready"
CHUNK_CHARS = 24000
OVERLAP_CHARS = 1200
MAX_SOURCE_BYTES = 80 * 1024 * 1024
USER_AGENT = "WorldProtocolAcademy-Zenodo-R2-Sync/1.1 (+https://worldprotocolacademy.mk/)"


def log(msg: str) -> None:
    print(msg, flush=True)


def normalize(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    return re.sub(r"\n{4,}", "\n\n\n", text).strip()


def clean_html(text: str) -> str:
    text = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", text or "")
    text = re.sub(r"(?i)<br\s*/?>", "\n", text)
    text = re.sub(r"(?i)</p\s*>", "\n\n", text)
    text = re.sub(r"<[^>]+>", " ", text)
    return normalize(html.unescape(text).replace("\xa0", " "))


def slug(value: str, limit: int = 70) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return (value[:limit].rstrip("-") or "source")


def get_json(session: requests.Session, url: str) -> dict[str, Any]:
    for attempt in range(4):
        try:
            r = session.get(url, timeout=60)
            r.raise_for_status()
            return r.json()
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))
    raise RuntimeError("unreachable")


def creators(meta: dict[str, Any]) -> list[str]:
    out: list[str] = []
    for c in meta.get("creators") or []:
        if isinstance(c, str):
            out.append(c)
        elif isinstance(c, dict):
            po = c.get("person_or_org")
            if isinstance(po, dict) and po.get("name"):
                out.append(str(po["name"]))
            elif c.get("name"):
                out.append(str(c["name"]))
    return out


def doi(record: dict[str, Any]) -> str:
    pids = record.get("pids") or {}
    d = pids.get("doi") if isinstance(pids, dict) else None
    if isinstance(d, dict):
        return str(d.get("identifier") or "")
    if isinstance(d, str):
        return d
    return str((record.get("metadata") or {}).get("doi") or "")


def resource_type(meta: dict[str, Any]) -> str:
    rt = meta.get("resource_type") or meta.get("upload_type") or ""
    if isinstance(rt, dict):
        return str(rt.get("title") or rt.get("id") or rt.get("type") or "")
    return str(rt)


def file_entries(session: requests.Session, record: dict[str, Any]) -> list[dict[str, Any]]:
    files = record.get("files")
    entries: list[dict[str, Any]] = []
    if isinstance(files, list):
        entries = [x for x in files if isinstance(x, dict)]
    elif isinstance(files, dict):
        raw = files.get("entries")
        if isinstance(raw, dict):
            entries = [x for x in raw.values() if isinstance(x, dict)]
        elif isinstance(raw, list):
            entries = [x for x in raw if isinstance(x, dict)]
    if not entries and (record.get("links") or {}).get("files"):
        payload = get_json(session, str(record["links"]["files"]))
        raw = payload.get("entries")
        if isinstance(raw, dict):
            entries = [x for x in raw.values() if isinstance(x, dict)]
        elif isinstance(raw, list):
            entries = [x for x in raw if isinstance(x, dict)]
    out = []
    for e in entries:
        name = str(e.get("key") or e.get("filename") or e.get("name") or "").strip()
        links = e.get("links") or {}
        url = str(links.get("content") or links.get("download") or links.get("self") or "") if isinstance(links, dict) else ""
        if name and url:
            out.append({"name": name, "url": url, "size": int(e.get("size") or 0), "checksum": str(e.get("checksum") or "")})
    return out


def source_score(f: dict[str, Any]) -> tuple[int, int, str]:
    name = f["name"].lower()
    ext = Path(name).suffix
    score = {".pdf": 500, ".docx": 400, ".md": 300, ".txt": 250}.get(ext, 0)
    for token, weight in (("bilingual", 100), ("final", 90), ("publication", 60), ("paper", 45), ("english", 30), ("macedonian", 30)):
        if token in name:
            score += weight
    for token, weight in (("qa", 250), ("review", 250), ("metadata", 250), ("readme", 250), ("citation", 250), ("bibliography", 200), ("figure", 180), ("cover", 180), ("supplement", 160)):
        if token in name:
            score -= weight
    return score, -f["size"], f["name"]


def choose_sources(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    eligible = [f for f in entries if Path(f["name"].lower()).suffix in {".pdf", ".docx", ".md", ".txt"}]
    blocked = ("qa", "review", "metadata", "readme", "citation", "bibliography", "figure", "cover", "supplement")
    primary = [f for f in eligible if not any(t in f["name"].lower() for t in blocked)] or eligible
    primary.sort(key=source_score, reverse=True)
    pdfs = [f for f in primary if Path(f["name"].lower()).suffix == ".pdf"]
    return (pdfs or primary)[:2]


def download(session: requests.Session, source: dict[str, Any]) -> tuple[bytes, str]:
    with session.get(source["url"], stream=True, timeout=120) as r:
        r.raise_for_status()
        parts: list[bytes] = []
        total = 0
        h = hashlib.sha256()
        for part in r.iter_content(1024 * 1024):
            if not part:
                continue
            total += len(part)
            if total > MAX_SOURCE_BYTES:
                raise RuntimeError(f"source too large: {source['name']}")
            h.update(part)
            parts.append(part)
        return b"".join(parts), h.hexdigest()


def extract_text(name: str, data: bytes) -> str:
    ext = Path(name.lower()).suffix
    if ext == ".pdf":
        reader = PdfReader(io.BytesIO(data), strict=False)
        out: list[str] = []
        for i, page in enumerate(reader.pages, 1):
            try:
                text = page.extract_text() or ""
            except Exception as exc:
                log(f"WARN extract {name} page {i}: {exc}")
                text = ""
            if text.strip():
                out.append(f"[Page {i}]\n{text}")
        return normalize("\n\n".join(out))
    if ext == ".docx":
        doc = Document(io.BytesIO(data))
        out = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                cells = [c.text.strip() for c in row.cells]
                if any(cells):
                    out.append(" | ".join(cells))
        return normalize("\n\n".join(out))
    return normalize(data.decode("utf-8", errors="replace"))


def chunks(text: str) -> list[str]:
    text = normalize(text)
    out: list[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + CHUNK_CHARS)
        if end < len(text):
            floor = start + CHUNK_CHARS // 2
            cut = text.rfind("\n\n", floor, end)
            if cut >= floor:
                end = cut
        part = text[start:end].strip()
        if part:
            out.append(part)
        if end >= len(text):
            break
        start = max(start + 1, end - OVERLAP_CHARS)
    return out


class R2:
    def __init__(self, bucket: str, account_id: str, api_token: str):
        self.bucket = bucket
        self.env = os.environ.copy()
        self.env["CLOUDFLARE_ACCOUNT_ID"] = account_id
        self.env["CLOUDFLARE_API_TOKEN"] = api_token
        self.bin = os.environ.get("WRANGLER_BIN", "wrangler")

    def run(self, args: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
        p = subprocess.run([self.bin, *args], env=self.env, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=180)
        if check and p.returncode:
            raise RuntimeError(f"Wrangler failed ({p.returncode}): {p.stdout[-4000:]}")
        return p

    def exists(self, key: str) -> bool:
        with tempfile.TemporaryDirectory(prefix="wpa-r2-get-") as td:
            dest = str(Path(td) / "object")
            p = self.run(["r2", "object", "get", f"{self.bucket}/{key}", "--remote", "--file", dest], check=False)
            if p.returncode == 0:
                return True
            msg = (p.stdout or "").lower()
            if any(x in msg for x in ("not found", "object does not exist", "no such key", "10007", "404")):
                return False
            raise RuntimeError(f"Wrangler existence check failed for {key}: {p.stdout[-4000:]}")

    def put(self, key: str, body: bytes, content_type: str) -> None:
        with tempfile.TemporaryDirectory(prefix="wpa-r2-put-") as td:
            src = Path(td) / "payload"
            src.write_bytes(body)
            self.run(["r2", "object", "put", f"{self.bucket}/{key}", "--remote", "--force", "--file", str(src), "--content-type", content_type])


def meta_for(record_id: str, record: dict[str, Any]) -> dict[str, Any]:
    meta = record.get("metadata") or {}
    links = record.get("links") or {}
    return {
        "schema_version": "1.0",
        "source": "Zenodo",
        "zenodo_record_id": record_id,
        "zenodo_url": str(links.get("self_html") or links.get("html") or f"https://zenodo.org/records/{record_id}"),
        "doi": doi(record),
        "title": str(meta.get("title") or "").strip(),
        "creators": creators(meta),
        "publication_date": str(meta.get("publication_date") or meta.get("date") or ""),
        "resource_type": resource_type(meta),
        "description": clean_html(str(meta.get("description") or meta.get("notes") or "")),
    }


def header(meta: dict[str, Any], source: dict[str, Any], sha: str, number: int, total: int) -> str:
    q = lambda value: json.dumps(str(value), ensure_ascii=False)
    return "\n".join([
        "---",
        'wpa_schema: "zenodo-ai-ready-v1"',
        'source: "Zenodo"',
        f"zenodo_record_id: {q(meta['zenodo_record_id'])}",
        f"doi: {q(meta.get('doi', ''))}",
        f"title: {q(meta.get('title', ''))}",
        f"creators: {q('; '.join(meta.get('creators') or []))}",
        f"publication_date: {q(meta.get('publication_date', ''))}",
        f"resource_type: {q(meta.get('resource_type', ''))}",
        f"zenodo_url: {q(meta.get('zenodo_url', ''))}",
        f"source_file: {q(source['name'])}",
        f"source_file_sha256: {q(sha)}",
        f"source_file_checksum_zenodo: {q(source.get('checksum', ''))}",
        f"chunk_number: {number}",
        f"chunk_total: {total}",
        "---", "", f"# {meta.get('title') or 'Untitled'}", ""
    ])


def sync_record(session: requests.Session, r2: R2, prefix: str, record_id: str) -> dict[str, Any]:
    marker = f"{prefix}/_metadata/zenodo/{record_id}.json"
    if r2.exists(marker):
        log(f"SKIP {record_id}: completion marker exists")
        return {"record_id": record_id, "status": "skipped_existing", "chunks": 0}

    record = get_json(session, f"{ZENODO_API}/{record_id}")
    meta = meta_for(record_id, record)
    if "Smiljanov" not in " | ".join(meta["creators"]):
        raise RuntimeError(f"creator guard failed: {meta['creators']}")
    selected = choose_sources(file_entries(session, record))
    if not selected:
        raise RuntimeError("no suitable source file")

    objects: list[dict[str, Any]] = []
    source_reports: list[dict[str, Any]] = []
    rec_slug = slug(meta["title"] or record_id)
    for source in selected:
        log(f"DOWNLOAD {record_id} :: {source['name']}")
        data, source_sha = download(session, source)
        text = extract_text(source["name"], data)
        if len(text) < 500:
            log(f"WARN too little extracted text: {source['name']} ({len(text)})")
            continue
        parts = chunks(text)
        file_slug = slug(Path(source["name"]).stem, 60)
        for i, part in enumerate(parts, 1):
            body = (header(meta, source, source_sha, i, len(parts)) + part + "\n").encode("utf-8")
            key = f"{prefix}/02_smiljanov_papers_chunks/zenodo/{record_id}-{rec_slug}/{file_slug}/chunk-{i:04d}.md"
            r2.put(key, body, "text/markdown; charset=utf-8")
            objects.append({"key": key, "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()})
        source_reports.append({"name": source["name"], "source_url": source["url"], "zenodo_checksum": source.get("checksum", ""), "download_sha256": source_sha, "source_bytes": len(data), "extracted_chars": len(text), "chunk_count": len(parts)})

    if not objects:
        raise RuntimeError("zero AI-ready chunks produced")
    completion = dict(meta)
    completion.update({"synced_at": datetime.now(timezone.utc).isoformat(), "policy": "additive-no-delete", "target_namespace": "02_smiljanov_papers_chunks/zenodo", "source_files": source_reports, "objects": objects, "object_count": len(objects)})
    marker_body = (json.dumps(completion, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")
    r2.put(marker, marker_body, "application/json; charset=utf-8")
    log(f"OK {record_id}: {len(objects)} chunks + marker")
    return {"record_id": record_id, "title": meta["title"], "status": "uploaded", "chunks": len(objects), "marker": marker}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--record-ids", required=True)
    ap.add_argument("--bucket", default=os.environ.get("R2_BUCKET", DEFAULT_BUCKET))
    ap.add_argument("--prefix", default=os.environ.get("TARGET_PREFIX", DEFAULT_PREFIX))
    ap.add_argument("--report", default="zenodo-sync-report.json")
    args = ap.parse_args()

    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID") or os.environ.get("CF_ACCOUNT_ID")
    token = os.environ.get("CLOUDFLARE_API_TOKEN") or os.environ.get("CF_API_TOKEN")
    if not account_id or not token:
        raise SystemExit("missing Cloudflare credentials")
    ids = [x.strip() for x in args.record_ids.split(",") if x.strip()]
    if not ids or any(not re.fullmatch(r"\d+", x) for x in ids):
        raise SystemExit("invalid record IDs")

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})
    r2 = R2(args.bucket, account_id, token)
    log(f"R2 transport: Wrangler remote bucket={args.bucket}")

    results: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    for record_id in ids:
        try:
            results.append(sync_record(session, r2, args.prefix, record_id))
        except Exception as exc:
            log(f"ERROR {record_id}: {exc}")
            failures.append({"record_id": record_id, "error": str(exc)})

    manifest = {"schema_version": "1.1", "operation": "WPA Zenodo remaining-after-WP004 to R2 AI-ready sync", "generated_at": datetime.now(timezone.utc).isoformat(), "bucket": args.bucket, "prefix": args.prefix, "policy": "additive-no-delete", "record_ids": ids, "requested_records": len(ids), "uploaded_records": sum(r.get("status") == "uploaded" for r in results), "skipped_existing_records": sum(r.get("status") == "skipped_existing" for r in results), "failures": failures, "results": results}
    report = Path(args.report)
    report.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    if failures:
        return 2

    manifest_key = f"{args.prefix}/_metadata/zenodo/remaining-after-wp004-sync.json"
    r2.put(manifest_key, report.read_bytes(), "application/json; charset=utf-8")
    expected = [f"{args.prefix}/_metadata/zenodo/{rid}.json" for rid in ids] + [manifest_key]
    missing = [key for key in expected if not r2.exists(key)]
    if missing:
        raise RuntimeError(f"R2 verification failed: {missing}")
    manifest["verified_at"] = datetime.now(timezone.utc).isoformat()
    manifest["verified_completion_markers"] = len(ids)
    report.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    r2.put(manifest_key, report.read_bytes(), "application/json; charset=utf-8")
    log(f"SYNC COMPLETE: uploaded={manifest['uploaded_records']} skipped={manifest['skipped_existing_records']} failures=0 verified_markers={len(ids)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
