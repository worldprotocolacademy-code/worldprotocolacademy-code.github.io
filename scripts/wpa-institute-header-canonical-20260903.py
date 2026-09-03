#!/usr/bin/env python3
"""Canonical Institute-header repair: WPA logo, WPA Journal nav, Journal CTA contrast."""
# Generates the protected static Institute header source that is reviewed and merged through a pull request.
# Triggered independently from the legacy August reconciliation so unrelated stale checks cannot block this header repair.
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "institute.html"

def main():
    text = PATH.read_text(encoding="utf-8")
