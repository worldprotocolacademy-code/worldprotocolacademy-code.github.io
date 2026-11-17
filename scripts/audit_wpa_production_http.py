#!/usr/bin/env python3
"""Read-only WPA production HTTP and response-header evidence, never an AI LIVE proof.

The audit uses only anonymous GETs to publicly exposed WPA routes and a GET /health
on the configured Worker. It never sends chat prompts, PII, credentials, forms, 
consent settings or other mutable requests. It DOES NOT deploy CSP or HSTS.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "qa-output" / "production-http" / "report.json"
ORIGIN = "https://worldprotocolacademy.mk"
WORKER = "https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev"
ALLOWED_HOSTS = frozenset({
    "worldprotocolacademy.mk", "www.worldprotocolacademy.mk",
    "wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev",
})
PROBES = (
    ("mk-home", "/", True),
    ("mk-index", "/index.html", True),
    ("mk-institute", "/institute.html", True),
    ("en-home", "/en/index.html", True),
    ("en-institute", "/en/institute.html", True),
    ("favicon", "/favicon.ico", False),
    ("pwa-manifest", "/manifest.json", False),
    ("service-worker", "/sw.js", False),
    ("sitemap", "/sitemap.xml", False),
    ("living-lab", "/protocol-living-lab/", False),
)
HEADER_NAMES = (
    "content-type", "cache-control", "content-security-policy",
    "content-security-policy-report-only", "x-content-type-options",
    "referrer-policy", "permissions-policy", "strict-transport-security",
    "x-frame-options",
)


class RestrictedRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        dest = urllib.parse.urlparse(newurl)
        if dest.scheme != "https" or dest.hostname not in ALLOWED_HOSTS:
            raise urllib.error.URLError("redirect refused: destination not on approved WPA HTTPS hosts")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def checked_url(url: str) -> str:
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise ValueError("Unapproved audit target")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError("Audit target may not contain userinfo, query or fragment")
    return url


def fetch(opener, name: str, url: str, timeout: float, critical: bool) -> dict:
    result = {
        "name": name, "requested": url, "critical": critical,
        "status": None, "final_url": None, "elapsed_ms": None,
        "headers": {}, "error": None, "interpretation": "UNVERIFIED",
    }
    started = time.monotonic()
    try:
        req = urllib.request.Request(checked_url(url), headers={
            "User-Agent": "WPA-ReleaseEvidence/1.0 (anonymous read-only audit)",
            "Accept": "text/html,application/json,application/xml,image/x-icon,*/*;q=0.8",
            "Cache-Control": "no-cache",
        }, method="GET")
        with opener.open(req, timeout=timeout) as response:
            result["status"] = int(response.status)
            result["final_url"] = checked_url(response.geturl())
            result["headers"] = {
                k: str(response.headers.get(k, ""))[:1500]
                for k in HEADER_NAMES if response.headers.get(k)
            }
            # Deliberately do not read body, invoke LLM or retain cookies.
            result["interpretation"] = "HTTP_OK" if 200 <= response.status < 400 else "HTTP_ERROR"
    except urllib.error.HTTPError as exc:
        result["status"] = exc.code
        result["interpretation"] = "HTTP_ERROR"
        result["error"] = "HTTP " + str(exc.code)
    except (urllib.error.URLError, TimeoutError, ValueError, ssl.SSLError, OSError) as exc:
        result["interpretation"] = "UNVERIFIED_NETWORK"
        result["error"] = type(exc).__name__ + ": " + str(getattr(exc, "reason", str(exc)))[:160]
    finally:
        result["elapsed_ms"] = round((time.monotonic() - started)*1000)
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--critical-routes", action="store_true",
        help="Require a successful HTTPS request for MK/EN Home & Institute; other targets remain observations.")
    parser.add_argument("--timeout", type=float, default=10.0)
    args = parser.parse_args()
    opener = urllib.request.build_opener(RestrictedRedirectHandler)
    timestamp = dt.datetime.now(dt.timezone.utc).isoformat()
    rows = [fetch(opener, name, ORIGIN + path, args.timeout, critical) for name, path, critical in PROBES]
    worker = fetch(opener, "virtual-sande-health-only", WORKER + "/health", args.timeout, False)
    worker["interpretation"] = (
        "HEALTH_HTTP_REACHABLE_NOT_AI_LIVE_VERIFIED"
        if worker["status"] == 200
        else "WORKER_HEALTH_NOT_VERIFIED"
    )
    rows.append(worker)
    security_flags = {}
    for row in rows:
        if row["name"] not in ("mk-home", "mk-institute", "en-home", "en-institute"):
            continue
        h = row["headers"]
        security_flags[row["name"]] = {
            "csp_report_only_present": bool(h.get("content-security-policy-report-only")),
            "csp_enforced_present": bool(h.get("content-security-policy")),
            "nosniff_present": h.get("x-content-type-options", "").lower() == "nosniff",
            "referrer_policy_present": bool(h.get("referrer-policy")),
            "permissions_policy_present": bool(h.get("permissions-policy")),
            "hsts_present": bool(h.get("strict-transport-security")),
            "frame_control_present": bool(h.get("x-frame-options")) or "frame-ancestors" in h.get("content-security-policy", ""),
        }
    failures = [r["name"] for r in rows if r["critical"] and r["interpretation"] != "HTTP_OK"]
    data = {
        "schema_version": "1.0",
        "scope": "ANONYMOUS_PRODUCTION_HTTP_GET_ONLY_NOT_BROWSER_NOT_AI_LIVE",
        "observed_at": timestamp,
        "checked_sha": os.environ.get("GITHUB_SHA") or "manual",
        "checks": rows,
        "security_header_presence": security_flags,
        "critical_unverified_or_bad": failures,
        "limitations": [
            "A 200 HTTP response does not establish browser functionality or actual production AI inference.",
            "GET /health proves only that the health endpoint responded; never use it as last_verified_at for model inference.",
            "Header existence does not prove the CSP was observed without breakage; report-only is required before enforcement.",
            "No subdomain TLS inventory or formal legal compliance review was run.",
            "This audit makes no mutable or personal-data requests.",
        ],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for row in rows:
        print(f"{row['name']}: HTTP={row['status']} {row['interpretation']} elapsed_ms={row['elapsed_ms']}")
    print("Critical failures:", failures or "none")
    print("Security header presence:", json.dumps(security_flags, sort_keys=True))
    if args.critical_routes and failures:
        print("FAIL: required public MK/EN Home/Institute routes were not verified.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
