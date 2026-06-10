#!/usr/bin/env bash
# WPA · QA for institute.html vs REV2 canonical counts.
# Usage:  bash qa-institute.sh path/to/institute.html
set -u
f="${1:-institute.html}"
[ -f "$f" ] || { echo "File not found: $f"; exit 2; }
fail=0
red(){ printf '  \033[31m✗ %s\033[0m\n' "$1"; }
grn(){ printf '  \033[32m✓ %s\033[0m\n' "$1"; }

echo "== A · MUST BE ABSENT as current public claims =="
for s in "125 institutions" "7 comparative groups" "first institute" "Емпириски применет: Вучиќ" "скован од ВПА"; do
  if grep -qF -- "$s" "$f"; then red "FOUND (remove): $s"; fail=1; else grn "absent: $s"; fi
done

echo "== B · Negated-only phrases (allowed ONLY inside a 'Not / не' disclaimer) =="
for s in "final public benchmark" "fully verified institutional ranking"; do
  bad="$(grep -nF -- "$s" "$f" | grep -viE 'not|не')"
  if [ -n "$bad" ]; then red "non-negated use of: $s"; echo "$bad"; fail=1; else grn "only in disclaimer: $s"; fi
done

echo "== C · MUST BE PRESENT (REV2 canonical + identity) =="
present=(
 "160 records"
 "159 external records"
 "155 distinct external institutions"
 "8 groups (A–D, G–I, R)"
 "Source verification pending"
 "URL restoration does not equal source verification"
 "Не рангираме"
 "One of the first specialised institutes"
 "protocolometry"
 "Draft instrument · internal methodology · AAB review pending"
 "Versioned instrument · DOI where applicable · AAB review pending"
 "Pre-publication methodology · Source verification pending"
 "E and F are not used in REV2"
 "Canonical counts and taxonomy note"
)
for s in "${present[@]}"; do
  if grep -qF -- "$s" "$f"; then grn "present: $s"; else red "MISSING: $s"; fail=1; fi
done

echo "== D · No duplicate document wrappers introduced by the identity block =="
# The identity block must not add a SECOND doctype/html/head/body.
for tag in "<!doctype" "<html>" "<head>" "<body>"; do
  c=$(grep -ciF -- "$tag" "$f")
  if [ "$c" -le 1 ]; then grn "single/none: $tag ($c)"; else red "duplicate $tag ($c) — check insertion"; fail=1; fi
done

echo
if [ "$fail" = 0 ]; then printf '\033[32m== QA PASS ==\033[0m\n'; else printf '\033[31m== QA FAIL — fix items above ==\033[0m\n'; fi
exit "$fail"
