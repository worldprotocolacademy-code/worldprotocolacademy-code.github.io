#!/usr/bin/env python3
"""WPA Pilot 20 secure bundle extractor v1.3.2.

Security properties:
- pinned Git blob provenance check for the Base64 source file;
- SHA-256 calculation and optional strict expected-hash enforcement;
- path traversal, symlink and special-file rejection;
- file-count, per-file and total-size limits;
- extraction into a temporary directory followed by atomic promotion;
- verify, list, dry-run and structured logging modes;
- deterministic extraction manifest with per-file SHA-256 values.
"""
from __future__ import annotations

import argparse
import base64
import binascii
import hashlib
import json
import logging
import os
import shutil
import sys
import tarfile
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Iterable

VERSION = "1.3.2"
ROOT = Path(__file__).resolve().parent
DEFAULT_SOURCE = ROOT.parent / "v1.3.1" / "pilot20-v1.3.1.tar.gz.b64"
DEFAULT_OUTPUT = ROOT / "extracted"
DEFAULT_INTEGRITY = ROOT / "bundle-integrity.json"
DEFAULT_LOG = ROOT / "pilot20-extraction.log"
EXPECTED_SOURCE_GIT_BLOB_SHA1 = "884be567e15530556656e45004b6a9f6daa40db8"
EXPECTED_FILES = {
    "pilot-20-final-manifest-v1.3.1.json",
    "pilot-20-final-report-v1.3.1.md",
    "pilot-20-unresolved-register-v1.3.1.md",
    "pilot-20-provenance-ledger-v1.3.1.json",
    "pilot-20-validation-report-v1.3.1.md",
    "pilot-20-consolidation-diff-v1.3-to-v1.3.1.md",
    "pilot-20-canonical-decisions-v1.3.md",
    "canonical-patch-D002-v1.3.json",
    "README.md",
}

class SecurityError(RuntimeError):
    pass

@dataclass(frozen=True)
class Limits:
    max_files: int = 32
    max_member_bytes: int = 5 * 1024 * 1024
    max_total_bytes: int = 25 * 1024 * 1024
    max_archive_bytes: int = 20 * 1024 * 1024

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()  # Git compatibility check

def decode_source(source: Path) -> tuple[bytes, str, str]:
    if not source.is_file():
        raise FileNotFoundError(f"Missing bundle source: {source}")
    source_bytes = source.read_bytes()
    source_blob = git_blob_sha1(source_bytes)
    if source_blob != EXPECTED_SOURCE_GIT_BLOB_SHA1:
        raise SecurityError(f"Pinned Git provenance mismatch: expected {EXPECTED_SOURCE_GIT_BLOB_SHA1}, got {source_blob}")
    try:
        archive = base64.b64decode(b"".join(source_bytes.split()), validate=True)
    except (binascii.Error, ValueError) as exc:
        raise SecurityError(f"Invalid Base64 bundle: {exc}") from exc
    return archive, source_blob, sha256_bytes(archive)

def load_expected_sha256(path: Path) -> str | None:
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    value = data.get("archive_sha256")
    if value in (None, "", "CALCULATE_ON_FIRST_VERIFIED_RUN"):
        return None
    if not isinstance(value, str) or len(value) != 64 or any(c not in "0123456789abcdef" for c in value.lower()):
        raise SecurityError(f"Invalid archive_sha256 in {path}")
    return value.lower()

def safe_member_name(name: str) -> str:
    normalized = name.replace("\\", "/")
    pure = PurePosixPath(normalized)
    if pure.is_absolute() or not pure.parts:
        raise SecurityError(f"Absolute or empty archive path rejected: {name!r}")
    if any(part in ("", ".", "..") for part in pure.parts):
        raise SecurityError(f"Unsafe archive path rejected: {name!r}")
    if len(pure.parts) != 1:
        raise SecurityError(f"Nested archive path rejected: {name!r}")
    return pure.name

def inspect_members(bundle: tarfile.TarFile, limits: Limits) -> list[tarfile.TarInfo]:
    members = bundle.getmembers()
    if len(members) > limits.max_files:
        raise SecurityError(f"Archive has {len(members)} entries; limit is {limits.max_files}")
    total = 0
    names: set[str] = set()
    safe: list[tarfile.TarInfo] = []
    for member in members:
        name = safe_member_name(member.name)
        if member.issym() or member.islnk() or member.isdev() or member.isfifo():
            raise SecurityError(f"Links and special files are forbidden: {name}")
        if member.isdir() or not member.isfile():
            raise SecurityError(f"Only flat regular files are allowed: {name}")
        if name in names:
            raise SecurityError(f"Duplicate archive member: {name}")
        names.add(name)
        if member.size < 0 or member.size > limits.max_member_bytes:
            raise SecurityError(f"Member size outside limit: {name} ({member.size} bytes)")
        total += member.size
        if total > limits.max_total_bytes:
            raise SecurityError(f"Expanded archive exceeds {limits.max_total_bytes} bytes")
        safe.append(member)
    actual = set(names)
    missing = EXPECTED_FILES - actual
    extra = actual - EXPECTED_FILES
    if missing or extra:
        raise SecurityError(f"Deliverable allowlist mismatch; missing={sorted(missing)}, extra={sorted(extra)}")
    return safe

def manifest_for(directory: Path, archive_sha256: str, source_blob: str, mode: str) -> dict:
    files = []
    for path in sorted(p for p in directory.iterdir() if p.is_file()):
        files.append({"name": path.name, "bytes": path.stat().st_size, "sha256": sha256_file(path)})
    return {
        "schema_version": "1.0",
        "tool": "WPA Pilot 20 secure extractor",
        "tool_version": VERSION,
        "generated_at_utc": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "mode": mode,
        "source": {"relative_path": "../v1.3.1/pilot20-v1.3.1.tar.gz.b64", "git_blob_sha1": source_blob, "archive_sha256": archive_sha256},
        "guardrails": {
            "rev2_changed": False,
            "d002_applied": False,
            "d002_status": "APPROVED_FOR_NEXT_CANONICAL_REVISION_NOT_APPLIED",
            "h005_next_action": "MANUAL_REVIEW_AND_REATTEMPT_IN_NEXT_BATCH_CYCLE"
        },
        "files": files,
    }

def list_members(archive: bytes, limits: Limits) -> list[dict]:
    with tempfile.NamedTemporaryFile(suffix=".tar.gz") as temp:
        temp.write(archive)
        temp.flush()
        with tarfile.open(temp.name, "r:gz") as bundle:
            return [{"name": safe_member_name(m.name), "bytes": m.size} for m in inspect_members(bundle, limits)]

def extract_atomic(archive: bytes, output: Path, limits: Limits, archive_sha256: str, source_blob: str) -> dict:
    output_parent = output.parent.resolve()
    output_parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="pilot20-v132-", dir=output_parent) as tmp:
        staging = Path(tmp) / "payload"
        staging.mkdir()
        archive_path = Path(tmp) / "bundle.tar.gz"
        archive_path.write_bytes(archive)
        if archive_path.stat().st_size > limits.max_archive_bytes:
            raise SecurityError(f"Archive exceeds {limits.max_archive_bytes} bytes")
        with tarfile.open(archive_path, "r:gz") as bundle:
            for member in inspect_members(bundle, limits):
                name = safe_member_name(member.name)
                stream = bundle.extractfile(member)
                if stream is None:
                    raise SecurityError(f"Unable to read member: {name}")
                target = staging / name
                with target.open("xb") as handle:
                    shutil.copyfileobj(stream, handle, length=1024 * 1024)
                os.chmod(target, 0o644)
        result = manifest_for(staging, archive_sha256, source_blob, "extract")
        (staging / "extraction-manifest.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        backup = output.with_name(output.name + ".previous")
        if backup.exists():
            shutil.rmtree(backup)
        if output.exists():
            output.rename(backup)
        try:
            staging.rename(output)
        except Exception:
            if backup.exists() and not output.exists():
                backup.rename(output)
            raise
        if backup.exists():
            shutil.rmtree(backup)
        return result

def configure_logging(log_path: Path, verbose: bool) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(level=logging.DEBUG if verbose else logging.INFO, format="%(asctime)s %(levelname)s %(message)s", handlers=[logging.StreamHandler(), logging.FileHandler(log_path, encoding="utf-8")])

def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Securely verify and extract WPA Pilot 20 v1.3.1 with tooling v1.3.2")
    p.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    p.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    p.add_argument("--integrity", type=Path, default=DEFAULT_INTEGRITY)
    p.add_argument("--expected-sha256", help="Strict expected SHA-256 override")
    p.add_argument("--verify", action="store_true")
    p.add_argument("--list", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--verbose", action="store_true")
    p.add_argument("--log", type=Path, default=DEFAULT_LOG)
    p.add_argument("--max-files", type=int, default=Limits.max_files)
    p.add_argument("--max-member-mib", type=int, default=5)
    p.add_argument("--max-total-mib", type=int, default=25)
    p.add_argument("--max-archive-mib", type=int, default=20)
    return p

def main(argv: Iterable[str] | None = None) -> int:
    args = parser().parse_args(argv)
    configure_logging(args.log, args.verbose)
    limits = Limits(args.max_files, args.max_member_mib * 1024 * 1024, args.max_total_mib * 1024 * 1024, args.max_archive_mib * 1024 * 1024)
    try:
        archive, source_blob, archive_sha256 = decode_source(args.source)
        expected = args.expected_sha256 or load_expected_sha256(args.integrity)
        if expected and archive_sha256 != expected.lower():
            raise SecurityError(f"SHA-256 mismatch: expected {expected}, got {archive_sha256}")
        if len(archive) > limits.max_archive_bytes:
            raise SecurityError(f"Decoded archive exceeds {limits.max_archive_bytes} bytes")
        members = list_members(archive, limits)
        logging.info("Pinned Git blob verified: %s", source_blob)
        logging.info("Decoded archive SHA-256: %s", archive_sha256)
        logging.info("Validated %d allowlisted deliverables", len(members))
        if args.list or args.dry_run:
            print("DRY RUN" if args.dry_run else "VALIDATED CONTENTS")
            for item in members:
                print(f"- {item['name']} ({item['bytes']} bytes)")
            print(f"Archive SHA-256: {archive_sha256}\nNo files were extracted.")
            return 0
        if args.verify:
            print(json.dumps({"verified": True, "source_git_blob_sha1": source_blob, "archive_sha256": archive_sha256, "deliverables": len(members), "d002_applied": False, "rev2_changed": False}, indent=2))
            return 0
        result = extract_atomic(archive, args.output, limits, archive_sha256, source_blob)
        logging.info("Extraction completed atomically: %s", args.output)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (OSError, SecurityError, tarfile.TarError, json.JSONDecodeError) as exc:
        logging.error("Pilot 20 extraction failed: %s", exc)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
