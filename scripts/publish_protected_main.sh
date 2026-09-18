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
body="${PUBLISH_BODY:-Automated WPA refresh. Generated outputs passed their workflow health gate. Required repository checks are run on the exact generated commit before merge.}"

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

# Rebase once before publishing so strict status checks start from the newest main.
git fetch origin "${base_branch}"
git rebase "origin/${base_branch}"
head_sha="$(git rev-parse HEAD)"
git push --set-upstream origin "${branch}"

pr_url=""
if ! pr_url="$(gh pr create   --repo "${GITHUB_REPOSITORY}"   --base "${base_branch}"   --head "${branch}"   --title "${PUBLISH_TITLE}"   --body "${body}")"; then
  cat >&2 <<'EOF'
Protected-main publisher could not create its pull request.
Keep the main-branch rules enabled. If the repository-level Actions setting blocks
GITHUB_TOKEN from creating pull requests, enable "Allow GitHub Actions to create
and approve pull requests" or provide a WPA_AUTOMATION_TOKEN repository secret
with contents/actions/pull-request write access.
EOF
  exit 1
fi
pr_number="${pr_url##*/}"
echo "Opened protected refresh PR #${pr_number} for ${head_sha}."

run_required_checks() {
  local ref="$1"
  gh workflow run site-quality.yml --repo "${GITHUB_REPOSITORY}" --ref "${ref}"
  gh workflow run translator-quality.yml --repo "${GITHUB_REPOSITORY}" --ref "${ref}"
}

wait_for_required_checks() {
  local sha="$1"
  local deadline=$((SECONDS + check_timeout))
  local state="pending"
  while (( SECONDS < deadline )); do
    state="$(
      gh api         -H "Accept: application/vnd.github+json"         "repos/${GITHUB_REPOSITORY}/commits/${sha}/check-runs?per_page=100" |
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
        echo "Required checks passed for ${sha}."
        return 0
        ;;
      failed)
        echo "A required check failed for ${sha}:" >&2
        gh api           -H "Accept: application/vnd.github+json"           "repos/${GITHUB_REPOSITORY}/commits/${sha}/check-runs?per_page=100" |
          jq -r '.check_runs[]
            | select(.name == "Validate public site" or .name == "Validate translator system")
            | "\(.name): status=\(.status) conclusion=\(.conclusion // "pending")"' >&2
        return 1
        ;;
    esac
    sleep 5
  done

  echo "Timed out waiting for required checks on ${sha}." >&2
  return 1
}

for cycle in 1 2; do
  run_required_checks "${branch}"
  wait_for_required_checks "${head_sha}"

  set +e
  merge_response="$(
    gh api       --method PUT       -H "Accept: application/vnd.github+json"       "repos/${GITHUB_REPOSITORY}/pulls/${pr_number}/merge"       -f merge_method=squash       -f sha="${head_sha}" 2>&1
  )"
  merge_rc=$?
  set -e

  if (( merge_rc == 0 )) && [[ "$(jq -r '.merged // false' <<<"${merge_response}")" == "true" ]]; then
    echo "Merged protected refresh PR #${pr_number}."
    git push origin --delete "${branch}" || true
    exit 0
  fi

  if (( cycle == 2 )); then
    echo "Protected refresh PR #${pr_number} did not merge after required checks." >&2
    echo "${merge_response}" >&2
    exit 1
  fi

  echo "Main moved or merge was temporarily blocked; rebasing once and re-validating."
  git fetch origin "${base_branch}"
  git rebase "origin/${base_branch}"
  head_sha="$(git rev-parse HEAD)"
  git push --force-with-lease origin "${branch}"
done
