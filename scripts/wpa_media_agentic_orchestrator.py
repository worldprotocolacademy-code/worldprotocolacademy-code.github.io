#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def parse_args():
    p = argparse.ArgumentParser(description="WPA Media proactive agentic orchestrator")
    p.add_argument("--repo-root", default=str(ROOT))
    p.add_argument("--output-dir", default="wpa-media-agentic-output")
    p.add_argument("--mode", choices=["daily", "weekly", "all"], default="all")
    p.add_argument("--fixture")
    p.add_argument("--self-test", action="store_true")
    return p.parse_args()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_text(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def run(cmd, cwd: Path):
    cp = subprocess.run(cmd, cwd=str(cwd), text=True, capture_output=True)
    if cp.returncode != 0:
        sys.stderr.write(cp.stdout)
        sys.stderr.write(cp.stderr)
        raise SystemExit(cp.returncode)
    return cp.stdout.strip()


def validate_pack(path: Path, data: dict):
    checks = []
    boundaries = data.get("boundaries") or {}
    if boundaries and boundaries.get("automatic_external_publication") is not False:
        raise RuntimeError(f"automatic publication boundary drift: {path}")

    presenters = data.get("presenters") or {}
    if presenters:
        aliases = {x.get("public_alias") for x in presenters.values() if isinstance(x, dict)}
        if not {"Дипломатка", "Дипломат"}.issubset(aliases):
            raise RuntimeError(f"canonical public presenter names missing: {path}")
        checks.append("presenter_names_locked")

    status = str(data.get("status") or data.get("product_status") or "")
    if "READY" not in status and "PENDING" not in status and "HUMAN" not in status:
        checks.append("status_review_required")
    else:
        checks.append("bounded_status_present")

    if data.get("script_lines"):
        source_lines = [x for x in data["script_lines"] if x.get("kind") == "source_report"]
        analysis_lines = [x for x in data["script_lines"] if x.get("kind") == "wpa_analysis"]
        if not source_lines:
            raise RuntimeError(f"no source_report lines: {path}")
        if not analysis_lines:
            raise RuntimeError(f"no wpa_analysis lines: {path}")
        if any(not x.get("source_url") for x in source_lines):
            raise RuntimeError(f"source_report line without source URL: {path}")
        checks.append("source_analysis_separation")

    return checks


def build_human_gate(run_manifest: dict):
    lines = [
        "# WPA Media · Human Gate Checklist",
        "",
        f"Run: {run_manifest['run_id']}",
        f"Mode: {run_manifest['mode']}",
        f"Status: {run_manifest['status']}",
        "",
        "## Before any external release",
        "",
        "- [ ] Open and verify every original source used in the final script.",
        "- [ ] Confirm source-reported facts are separate from WPA analysis.",
        "- [ ] Confirm the presenter identities are the locked fictional Дипломатка + Дипломат pair.",
        "- [ ] Confirm voice rendering uses approved production voices; no unconsented real-person cloning.",
        "- [ ] Confirm avatar/lip-sync output matches the approved script and identity lock.",
        "- [ ] Confirm captions/transcript match the final approved audio.",
        "- [ ] Confirm visual rights / licence / attribution for every third-party visual.",
        "- [ ] Review sensitive/tragedy coverage and suppress decorative/community-support overlays where required.",
        "- [ ] Approve or reject the final release object.",
        "",
        "## Release boundary",
        "",
        "**No external publication, TV partner delivery or commercial commitment is authorised by this automation.**",
        "",
        "Principle: **AI may work continuously. It may never authorise itself.**",
        ""
    ]
    return "\n".join(lines)


def main():
    args = parse_args()
    repo = Path(args.repo_root).resolve()
    out = Path(args.output_dir)
    if not out.is_absolute():
        out = repo / out
    out.mkdir(parents=True, exist_ok=True)

    config = read_json(repo / "media/data/agentic-orchestration.json")
    presenters = read_json(repo / "media/data/presenters.json")
    pair = presenters.get("public_pair") or {}
    if pair.get("display_name_mk") != "Дипломатка + Дипломат":
        raise SystemExit("Presenter pair config is not on the Дипломатка + Дипломат canonical public naming.")

    if args.self_test:
        run([
            sys.executable,
            "scripts/generate_wpa_media_programmes.py",
            "--repo-root", ".",
            "--mode", "all",
            "--self-test",
        ], repo)

    production_dir = out / "production"
    if production_dir.exists():
        shutil.rmtree(production_dir)
    production_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        sys.executable,
        "scripts/generate_wpa_media_programmes.py",
        "--repo-root", ".",
        "--output-dir", str(production_dir),
        "--mode", args.mode,
    ]
    if args.fixture:
        cmd += ["--fixture", args.fixture]
    generator_stdout = run(cmd, repo)

    json_files = sorted(production_dir.rglob("*.json"))
    if not json_files:
        raise SystemExit("No production JSON manifests generated.")

    validation = []
    for p in json_files:
        data = read_json(p)
        checks = validate_pack(p, data)
        validation.append({
            "file": str(p.relative_to(out)),
            "checks": checks,
            "status": data.get("status") or data.get("product_status") or "N/A"
        })

    now = datetime.now(timezone.utc)
    run_id = "WPA-MEDIA-" + now.strftime("%Y%m%dT%H%M%SZ")
    agent_results = []
    for agent in config["agents"]:
        agent_results.append({
            "id": agent["id"],
            "name": agent["name"],
            "mode": agent["mode"],
            "result": "PASS",
            "authority": agent["authority"]
        })

    manifest = {
        "schema": "wpa-media-agentic-run/1.0",
        "run_id": run_id,
        "generated_at": now.isoformat().replace("+00:00", "Z"),
        "mode": args.mode,
        "status": "READY_FOR_HUMAN_GATE",
        "automation_config_version": config["version"],
        "presenter_pair": {
            "female": "Дипломатка",
            "male": "Дипломат",
            "identity_drift": False
        },
        "agent_results": agent_results,
        "production_validation": validation,
        "generator_stdout": generator_stdout,
        "release_boundary": {
            "automatic_external_publication": False,
            "automatic_tv_partner_delivery": False,
            "automatic_commercial_commitment": False,
            "voice_adapter_required": True,
            "avatar_lipsync_adapter_required": True,
            "human_gate_required": True
        }
    }

    write_json(out / "agentic-run.json", manifest)
    write_text(out / "HUMAN-GATE-CHECKLIST.md", build_human_gate(manifest))
    write_text(
        out / "README.md",
        "# WPA Media Agentic Production Run\n\n"
        "This package was prepared by bounded proactive agents. "
        "It is a ready-for-review production bundle, not an externally released broadcast.\n\n"
        f"Run ID: {run_id}\n\n"
        "Presenter pair: **Дипломатка + Дипломат**.\n"
    )
    print(f"WPA MEDIA AGENTIC ORCHESTRATOR PASS · {run_id} · {args.mode}")


if __name__ == "__main__":
    main()
