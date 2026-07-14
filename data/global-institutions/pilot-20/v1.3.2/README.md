# WPA Pilot 20 — Security and Verification Upgrade v1.3.2

## Status

- **Tooling release:** v1.3.2 candidate
- **Canonical data:** REV2 unchanged
- **D002:** approved for the next controlled canonical revision; **not applied**
- **H005:** unresolved; next action is manual review and reattempt in the next batch cycle
- **Source bundle:** reuses the frozen v1.3.1 Base64 TAR.GZ package

This release upgrades the extraction, verification, evidence and user-interface layer. It does not alter the nine frozen v1.3.1 deliverables.

## Security controls

The secure extractor rejects:

- absolute paths, `..`, backslash traversal and nested paths;
- symbolic links, hard links, devices, FIFOs and non-regular TAR members;
- duplicate filenames;
- files not present in the nine-file allowlist;
- archives above the configured compressed-size limit;
- individual files above the configured per-file limit;
- file counts or total expanded size above configured limits;
- a Base64 source whose pinned Git blob SHA-1 differs from the audited source.

Extraction occurs in a temporary staging directory. The validated directory is promoted only after all files pass the checks. An existing output directory is preserved until promotion succeeds.

## Verification model

The audited v1.3.1 Base64 source is pinned by Git blob SHA-1:

```text
884be567e15530556656e45004b6a9f6daa40db8
```

This value can be independently recomputed as:

```text
SHA1("blob " + byte_length + NUL + exact_file_bytes)
```

The extractor also computes SHA-256 for the decoded TAR.GZ archive and for every extracted deliverable. The first verified CI run must pin the computed archive SHA-256 in `bundle-integrity.json` before this candidate is declared final.

The `canonical_source.commit_sha` and `canonical_source.blob_sha` fields are verification data, not decorative identifiers. They can be independently checked through the GitHub API or raw file endpoint at the exact commit.

## Commands

Run from this directory:

```bash
python secure_extract_bundle.py --verify
python secure_extract_bundle.py --list
python secure_extract_bundle.py --dry-run
python secure_extract_bundle.py
```

Optional strict verification:

```bash
python secure_extract_bundle.py --verify --expected-sha256 <64-character-sha256>
```

Optional limits:

```bash
python secure_extract_bundle.py \
  --max-files 32 \
  --max-member-mib 5 \
  --max-total-mib 25 \
  --max-archive-mib 20
```

`--verify`, `--list` and `--dry-run` do not extract files. The normal mode writes:

```text
extracted/extraction-manifest.json
```

The extraction manifest contains:

- tool and schema versions;
- source Git blob SHA-1;
- decoded archive SHA-256;
- per-file size and SHA-256;
- explicit REV2 and D002 guardrails;
- the H005 next action.

## Evidence schema

`pilot20-package.schema.json` validates the extraction manifest. It enforces:

- immutable `rev2_changed = false`;
- immutable `d002_applied = false`;
- the controlled D002 status;
- the explicit H005 next action;
- valid Git SHA-1 and SHA-256 formats;
- flat filenames and per-file size limits.

## D002 revision preview

The web interface separates the current canonical state from the future candidate:

- **Current canonical:** REV2 unchanged;
- **Candidate:** D002 approved for the next controlled revision;
- **Applied now:** no.

The visual diff is informational. It has no apply control and cannot mutate REV2.

## Executive and technical views

The web interface provides:

- an Executive view for package status, public-use limits and change control;
- a Technical view for commands, checksums, schema and extraction controls;
- status cards for validation, evidence, canonical state and public-use restriction;
- package facts and verification instructions.

## robots.txt assessment

No robots.txt change is included in this upgrade.

The current policy intentionally allows ordinary search engines and blocks named AI/model-training crawlers site-wide. Creating a special `/data/` exception would make public verification easier for some automated tools, but it would also weaken the existing maximum-protection policy and behaves differently across crawlers.

The safer current route is:

1. keep the site-level policy unchanged;
2. expose verification through GitHub repository files, exact commit URLs and the GitHub API;
3. reconsider a narrowly scoped exception only after a separate legal, IP and operational review.

## Canonical guardrails

- Frozen evidence remains unchanged.
- D002 is not applied.
- REV2 remains unchanged.
- H005 is not silently promoted.
- No public ranking, accreditation or recognition claim is created.
- No D1, Worker, Cron or production API change is part of this release.
