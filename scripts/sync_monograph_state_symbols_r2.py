#!/usr/bin/env python3
"""Prepare the WPA State Symbols monograph for AI-ready R2 ingestion.

The canonical PDF stays in private Cloudflare R2. This script runs in GitHub
Actions after the PDF is downloaded from R2, verifies its exact SHA-256,
extracts page-labelled text, creates bounded Markdown chunks, and writes a
provenance-rich completion manifest. It never deletes data.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader

EXPECTED_PDF_SHA256 = "79192f6e3190c4927efbc052c2004786f6c7a38a5c13e4b78bf6a61cd7ff6d54"
EXPECTED_PDF_BYTES = 7037392
EXPECTED_PDF_PAGES = 75
CHUNK_CHARS = 12000
OVERLAP_CHARS = 600

TITLE_MK = "Протокол на државни симболи, химни и национални денови"
TITLE_EN = "Protocol of State Symbols, Anthems and National Days"
AUTHOR = "Sande Smiljanov"
ORCID = "0009-0008-3219-394X"
ISBN = "978-608-66168-5-4"
COBISS = "69316613"
TARGET_NAMESPACE = "01_smiljanov_books_chunks/protocol-state-symbols-anthems-national-days-2026"
MARKER_RELATIVE = "_metadata/books/protocol-state-symbols-anthems-national-days-2026.json"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def normalize(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    return re.sub(r"\n{4,}", "\n\n\n", text).strip()


def extract_pdf(pdf: Path) -> tuple[str, int]:
    reader = PdfReader(str(pdf), strict=False)
    pages: list[str] = []
    for number, page in enumerate(reader.pages, 1):
        try:
            text = page.extract_text() or ""
        except Exception as exc:
            print(f"WARN page {number}: {exc}", flush=True)
            text = ""
        if text.strip():
            pages.append(f"[Page {number}]\n{text}")
    return normalize("\n\n".join(pages)), len(reader.pages)


def split_chunks(text: str) -> list[str]:
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


def header(pdf_sha: str, number: int, total: int) -> str:
    q = lambda v: json.dumps(str(v), ensure_ascii=False)
    return "\n".join([
        "---",
        'wpa_schema: "book-ai-ready-v1"',
        'source: "WPA canonical monograph"',
        f"title_mk: {q(TITLE_MK)}",
        f"title_en: {q(TITLE_EN)}",
        f"author: {q(AUTHOR)}",
        f"orcid: {q(ORCID)}",
        f"isbn: {q(ISBN)}",
        'edition: "First bilingual print edition / Premium Print Edition FINAL v1.6"',
        'publication_place: "Skopje"',
        'publication_year: "2026"',
        'publisher: "Sande Smiljanov - independently published under the World Protocol Academy brand"',
        f"source_file_sha256: {q(pdf_sha)}",
        f"chunk_number: {number}",
        f"chunk_total: {total}",
        'provenance_policy: "source-verified core + clearly labelled reference layer"',
        'official_use_guard: "Reference-layer data must be rechecked against applicable national law and official graphic standards before official use."',
        "---", "", f"# {TITLE_MK}", ""
    ])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", required=True)
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--manifest", required=True)
    args = ap.parse_args()

    pdf = Path(args.pdf)
    out_dir = Path(args.out_dir)
    manifest_path = Path(args.manifest)
    data = pdf.read_bytes()
    pdf_sha = sha256_bytes(data)
    if pdf_sha != EXPECTED_PDF_SHA256:
        raise SystemExit(f"canonical PDF SHA-256 mismatch: {pdf_sha}")
    if len(data) != EXPECTED_PDF_BYTES:
        raise SystemExit(f"canonical PDF byte-size mismatch: {len(data)}")

    text, pdf_pages = extract_pdf(pdf)
    if pdf_pages != EXPECTED_PDF_PAGES:
        raise SystemExit(f"canonical PDF page-count mismatch: {pdf_pages}")
    if len(text) < 100000:
        raise SystemExit(f"extracted text unexpectedly short: {len(text)} chars")

    parts = split_chunks(text)
    if len(parts) < 10 or len(parts) > 20:
        raise SystemExit(f"unexpected chunk count: {len(parts)}")

    out_dir.mkdir(parents=True, exist_ok=True)
    objects: list[dict[str, object]] = []
    for i, part in enumerate(parts, 1):
        body = (header(pdf_sha, i, len(parts)) + part + "\n").encode("utf-8")
        path = out_dir / f"chunk-{i:04d}.md"
        path.write_bytes(body)
        objects.append({
            "filename": path.name,
            "sha256": sha256_bytes(body),
            "bytes": len(body),
            "chunk_number": i,
        })

    manifest = {
        "schema_version": "1.1",
        "wpa_schema": "book-ai-ready-v1",
        "source_type": "canonical_monograph",
        "title_mk": TITLE_MK,
        "title_en": TITLE_EN,
        "author": AUTHOR,
        "orcid": ORCID,
        "isbn": ISBN,
        "cobiss_mk_id": COBISS,
        "edition": "First bilingual print edition / Premium Print Edition FINAL v1.6",
        "publication_place": "Skopje",
        "publication_year": 2026,
        "pdf_pages": pdf_pages,
        "printed_pages": 74,
        "source_file_sha256": pdf_sha,
        "source_bytes": len(data),
        "extracted_chars": len(text),
        "extracted_text_sha256": sha256_bytes(text.encode("utf-8")),
        "chunk_count": len(parts),
        "target_namespace": TARGET_NAMESPACE,
        "metadata_marker": MARKER_RELATIVE,
        "policy": "additive-no-delete",
        "provenance_policy": "source-verified core + clearly labelled reference layer",
        "verified_core_scope": "Parts I-IV and VI: national days, anthems, organisations, memberships and operational protocol rules.",
        "reference_layer_scope": "Part V: profiles of 197 states and protocol entities; orientation layer requiring official national law and graphic standards for official use.",
        "source_pdf_binary_in_r2": True,
        "objects": objects,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"PREPARED: pages={pdf_pages} chars={len(text)} chunks={len(parts)} sha256={pdf_sha}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
