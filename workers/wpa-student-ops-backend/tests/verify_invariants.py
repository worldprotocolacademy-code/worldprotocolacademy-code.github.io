from pathlib import Path
import json
import sqlite3
import sys

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    raise AssertionError(message)


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        fail(f"missing invariant: {label}")


def test_fail_closed_config() -> None:
    cfg = json.loads((ROOT / "wrangler.jsonc").read_text(encoding="utf-8"))
    assert cfg["vars"]["WPA_BACKEND_MODE"] == "DISABLED"
    assert cfg["workers_dev"] is False
    assert cfg["preview_urls"] is False
    assert cfg.get("d1_databases") == []
    assert str(cfg["vars"]["ACCESS_AUD"]).startswith("REPLACE_")
    assert str(cfg["vars"]["ACCESS_TEAM_DOMAIN"]).startswith("REPLACE_")


def test_hg3_source_guards() -> None:
    src = (ROOT / "src" / "index.mjs").read_text(encoding="utf-8")
    require(src, "function requireMutationEnabled(env)", "central mutation gate")
    require(src, "backend_activation_disabled", "disabled-mode rejection")
    require(src, "Cf-Access-Jwt-Assertion", "Cloudflare Access JWT")
    require(src, "audience: env.ACCESS_AUD", "Access audience validation")
    require(src, "issuer: `https://${env.ACCESS_TEAM_DOMAIN}`", "Access issuer validation")
    require(src, "SELECT role FROM user_roles", "database-backed RBAC")

    for function_name in (
        "decideApplication",
        "confirmAssessment",
        "authoriseCertificate",
        "issueCertificate",
    ):
        start = src.find(f"async function {function_name}")
        if start < 0:
            fail(f"missing HG3 function: {function_name}")
        end = src.find("\nasync function ", start + 1)
        block = src[start:] if end < 0 else src[start:end]
        require(block, "requireMutationEnabled(env);", f"{function_name} activation gate")
        require(block, "gateClass: 'HG3'", f"{function_name} HG3 audit classification")

    require(src, "requireRole(actor, ['reviewer', 'admin']);", "reviewer/admin boundary")
    require(src, "requireRole(actor, ['issuer', 'admin']);", "issuer/admin boundary")
    require(src, "assessment.status !== 'confirmed_pass'", "human-confirmed assessment prerequisite")
    require(src, "row.status !== 'authorised'", "certificate authorisation prerequisite")
    require(src, "!row.authorised_by || !row.authorised_at", "persisted human authorisation prerequisite")
    require(src, "env.DB.batch([...statements, approval, audit])", "transition + approval + audit batch")


def test_append_only_database_guards() -> None:
    sql = (ROOT / "migrations" / "0001_initial.sql").read_text(encoding="utf-8")
    require(sql, "audit_events_no_update", "audit UPDATE trigger")
    require(sql, "audit_events_no_delete", "audit DELETE trigger")
    require(sql, "human_approvals_no_update", "approval UPDATE trigger")
    require(sql, "human_approvals_no_delete", "approval DELETE trigger")

    db = sqlite3.connect(":memory:")
    db.executescript(sql)
    db.execute(
        "INSERT INTO audit_events VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        ("a1", "test", "certificate", "c1", "actor@example.invalid", "admin", "r1", None, "x", "{}", "2026-08-25T00:00:00Z"),
    )
    db.execute(
        "INSERT INTO human_approvals VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        ("p1", "certificate", "c1", "HG3", "test", "approved", "actor@example.invalid", "admin", "reason", None, "x", "2026-08-25T00:00:00Z"),
    )
    db.commit()

    for statement in (
        "UPDATE audit_events SET new_state='y' WHERE audit_id='a1'",
        "DELETE FROM audit_events WHERE audit_id='a1'",
        "UPDATE human_approvals SET new_state='y' WHERE approval_id='p1'",
        "DELETE FROM human_approvals WHERE approval_id='p1'",
    ):
        try:
            db.execute(statement)
            db.commit()
        except sqlite3.DatabaseError:
            db.rollback()
        else:
            fail(f"append-only invariant did not block: {statement}")


def test_privacy_minimisation() -> None:
    src = (ROOT / "src" / "index.mjs").read_text(encoding="utf-8")
    start = src.find("async function verifyCertificate")
    end = src.find("\nexport default", start)
    block = src[start:end]
    if "student_email" in block or "studentName" in block or "display_name" in block:
        fail("public verification must not expose student identity in v0.1.0")
    require(block, "serial", "public verification serial")
    require(block, "programmeId", "public verification programme")
    require(block, "status", "public verification status")


def main() -> int:
    tests = [
        test_fail_closed_config,
        test_hg3_source_guards,
        test_append_only_database_guards,
        test_privacy_minimisation,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"PASS {len(tests)} WPA Student Ops Backend invariant groups")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"FAIL {exc}", file=sys.stderr)
        raise
