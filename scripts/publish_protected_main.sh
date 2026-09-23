#!/usr/bin/env bash
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_RUN_ID:?GITHUB_RUN_ID is required}"
: "${GITHUB_RUN_ATTEMPT:?GITHUB_RUN_ATTEMPT is required}"
: "${PUBLISH_BRANCH_PREFIX:?PUBLISH_BRANCH_PREFIX is required}"
: "${PUBLISH_TITLE:?PUBLISH_TITLE is required}"
: "${PUBLISH_FILES:?PUBLISH_FILES is required}"

base_branch="${PUBLISH_BASE_BRANCH:-main}"
check_timeout="${PUBLISH_CHECK_TIMEOUT_SECONDS:-420}"
branch="automation/${PUBLISH_BRANCH_PREFIX}-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"
body="${PUBLISH_BODY:-Automated WPA refresh. Generated outputs passed their workflow health gate. Required repository checks are validated on both the generated head and the exact protected PR merge commit before merge.}"

git config user.name "${PUBLISH_GIT_NAME:-wpa-automation-bot}"
git config user.email "${PUBLISH_GIT_EMAIL:-actions@users.noreply.github.com}"

read -r -a publish_files <<< "${PUBLISH_FILES}"
git add -- "${publish_files[@]}"

if git diff --cached --quiet; then
  echo "No generated changes to publish."
  exit 0
fi

git switch -c "${branch}"
git commit -m "${PUBLISH_TITLE}"

git fetch origin "${base_branch}"
git rebase "origin/${base_branch}"
head_sha="$(git rev-parse HEAD)"
git push --set-upstream origin "${branch}"

pr_url=""
if ! pr_url="$(gh pr create \
  --repo "${GITHUB_REPOSITORY}" \
  --base "${base_branch}" \
  --head "${branch}" \
  --title "${PUBLISH_TITLE}" \
  --body "${body}")"; then
  cat >&2 <<'EOM'
Protected-main publisher could not create its pull request.
Keep the main-branch rules enabled. If the repository-level Actions setting blocks
GITHUB_TOKEN from creating pull requests, enable "Allow GitHub Actions to create
and approve pull requests" or provide a WPA_AUTOMATION_TOKEN repository secret
with contents/actions/pull-request write access.
EOM
  exit 1
fi
pr_number="${pr_url##*/}"
echo "Opened protected refresh PR #${pr_number} for ${head_sha}."

run_required_head_checks() {
  local ref="$1"
  gh workflow run site-quality.yml --repo "${GITHUB_REPOSITORY}" --ref "${ref}"
  gh workflow run translator-quality.yml --repo "${GITHUB_REPOSITORY}" --ref "${ref}"
}

wait_for_required_head_checks() {
  local sha="$1"
  local deadline=$((SECONDS + check_timeout))
  local state="pending"
  while (( SECONDS < deadline )); do
    state="$(
      gh api \
        -H "Accept: application/vnd.github+json" \
        "repos/${GITHUB_REPOSITORY}/commits/${sha}/check-runs?per_page=100" |
      jq -r '
        def latest($n):
          ([.check_runs[] | select(.name == $n)]
           | sort_by(.started_at // .created_at)
           | last);
        [latest("Validate public site"), latest("Validate translator system")] as $r
        | if ($r | any(. == null)) then "pending"
          elif ($r | any(.status == "completed" and .conclusion != "success")) then "failed"
          elif ($r | all(.status == "completed" and .conclusion == "success")) then "success"
          else "pending"
          end
      '
    )"

    case "${state}" in
      success)
        echo "Head checks passed for ${sha}."
        return 0
        ;;
      failed)
        echo "A required head check failed for ${sha}:" >&2
        gh api \
          -H "Accept: application/vnd.github+json" \
          "repos/${GITHUB_REPOSITORY}/commits/${sha}/check-runs?per_page=100" |
          jq -r '.check_runs[]
            | select(.name == "Validate public site" or .name == "Validate translator system")
            | "\(.name): status=\(.status) conclusion=\(.conclusion // "pending")"' >&2
        return 1
        ;;
    esac
    sleep 5
  done

  echo "Timed out waiting for required head checks on ${sha}." >&2
  return 1
}

create_completed_check() {
  local name="$1"
  local sha="$2"
  local conclusion="$3"
  local title="$4"
  local summary="$5"
  jq -n \
    --arg name "$name" \
    --arg head_sha "$sha" \
    --arg conclusion "$conclusion" \
    --arg title "$title" \
    --arg summary "$summary" \
    '{name:$name,head_sha:$head_sha,status:"completed",conclusion:$conclusion,output:{title:$title,summary:$summary}}' |
    gh api \
      --method POST \
      -H "Accept: application/vnd.github+json" \
      "repos/${GITHUB_REPOSITORY}/check-runs" \
      --input - >/dev/null
}

wait_for_merge_ref() {
  local expected_head="$1"
  local deadline=$((SECONDS + 90))
  local merge_sha=""
  while (( SECONDS < deadline )); do
    git fetch --quiet origin "refs/pull/${pr_number}/merge" || true
    merge_sha="$(git rev-parse -q --verify FETCH_HEAD 2>/dev/null || true)"
    if [[ -n "${merge_sha}" ]]; then
      local merge_head
      merge_head="$(git rev-parse "${merge_sha}^2" 2>/dev/null || true)"
      if [[ "${merge_head}" == "${expected_head}" ]]; then
        printf '%s\n' "${merge_sha}"
        return 0
      fi
    fi
    sleep 3
  done
  echo "Timed out waiting for a protected PR merge ref matching head ${expected_head}." >&2
  return 1
}

validate_merge_commit_and_publish_checks() {
  local expected_head="$1"
  local merge_sha
  merge_sha="$(wait_for_merge_ref "${expected_head}")"
  echo "Validating strict PR merge commit ${merge_sha} for head ${expected_head}."

  local merge_dir
  merge_dir="$(mktemp -d)"
  git worktree add --detach "${merge_dir}" "${merge_sha}" >/dev/null

  local site_ok=0 translator_ok=0
  if (cd "${merge_dir}" && python scripts/site_quality_check.py); then
    site_ok=1
    create_completed_check       "Validate public site"       "${merge_sha}"       "success"       "Protected merge-tree validation passed"       "The exact PR merge commit passed scripts/site_quality_check.py."
  else
    create_completed_check       "Validate public site"       "${merge_sha}"       "failure"       "Protected merge-tree validation failed"       "The exact PR merge commit failed scripts/site_quality_check.py. Inspect the parent automation log."
  fi

  if (
    cd "${merge_dir}"
    python -m py_compile scripts/translator_quality_check.py
    python -m py_compile scripts/translator_architecture_check.py
    python -m py_compile scripts/mk_home_language_integrity_check.py
    python -m py_compile scripts/en_public_language_integrity_check.py
    python -m py_compile scripts/fr_full_mirror_check.py
    python -m py_compile scripts/fr_complete_parity_check.py
    python scripts/translator_architecture_check.py
    python scripts/mk_home_language_integrity_check.py
    python scripts/en_public_language_integrity_check.py
    python scripts/fr_complete_parity_check.py
    hist_dir="$(mktemp -d)"
    git worktree add --detach "${hist_dir}" c81ab09642d9fa3b51df013006fe7835614c240e >/dev/null
    (cd "${hist_dir}" && python scripts/fr_full_mirror_check.py)
    git worktree remove "${hist_dir}" --force >/dev/null
    git cat-file blob e4dcadcbce290950e189d74d24f81d04ac546b44 > languages/fr/index.html
    git cat-file blob 6c442c26a7c908c414683315220486dacd33e873 > languages/fr/institute.html
    test "$(git hash-object languages/fr/index.html)" = "e4dcadcbce290950e189d74d24f81d04ac546b44"
    test "$(git hash-object languages/fr/institute.html)" = "6c442c26a7c908c414683315220486dacd33e873"
    python scripts/translator_quality_check.py
  ); then
    translator_ok=1
    create_completed_check       "Validate translator system"       "${merge_sha}"       "success"       "Protected merge-tree translator validation passed"       "The exact PR merge commit passed the canonical translator validation suite."
  else
    create_completed_check       "Validate translator system"       "${merge_sha}"       "failure"       "Protected merge-tree translator validation failed"       "The exact PR merge commit failed the canonical translator validation suite. Inspect the parent automation log."
  fi

  git worktree remove "${merge_dir}" --force >/dev/null || true

  if (( site_ok != 1 || translator_ok != 1 )); then
    echo "Strict merge-tree validation failed." >&2
    return 1
  fi

  echo "Strict merge-tree checks passed and were attached to ${merge_sha}."
}

for cycle in 1 2; do
  run_required_head_checks "${branch}"
  wait_for_required_head_checks "${head_sha}"
  validate_merge_commit_and_publish_checks "${head_sha}"

  set +e
  merge_response="$(
    gh api \
      --method PUT \
      -H "Accept: application/vnd.github+json" \
      "repos/${GITHUB_REPOSITORY}/pulls/${pr_number}/merge" \
      -f merge_method=squash \
      -f sha="${head_sha}" 2>&1
  )"
  merge_rc=$?
  set -e

  if (( merge_rc == 0 )) && [[ "$(jq -r '.merged // false' <<<"${merge_response}")" == "true" ]]; then
    echo "Merged protected refresh PR #${pr_number}."
    git push origin --delete "${branch}" || true
    exit 0
  fi

  if (( cycle == 2 )); then
    echo "Protected refresh PR #${pr_number} did not merge after strict required checks." >&2
    echo "${merge_response}" >&2
    exit 1
  fi

  echo "Main moved or merge was temporarily blocked; rebasing once and re-validating the new merge tree."
  git fetch origin "${base_branch}"
  git rebase "origin/${base_branch}"
  head_sha="$(git rev-parse HEAD)"
  git push --force-with-lease origin "${branch}"
done
