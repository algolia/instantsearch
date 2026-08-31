#!/usr/bin/env bash
# Put this project's accumulating staging branch in the already-checked-out
# docs-new working tree. Every per-change documentation run lands there; the
# release run opens a single pull request from it.
#
# docs-new is shared across Algolia products, so the branch name is namespaced
# to InstantSearch rather than something generic like `docs/next`. Override it
# with DOCS_BRANCH_NAME - both workflows set it from one place.
set -euo pipefail

: "${DOCS_TOKEN:?DOCS_TOKEN is required (a GitHub App installation token)}"
export GH_TOKEN="${GH_TOKEN:-$DOCS_TOKEN}"

WS="${GITHUB_WORKSPACE:-$PWD}"
DOCS="$WS/docs-new"
BRANCH="${DOCS_BRANCH_NAME:-instantsearch/staging}"

DOCS_REPO="${DOCS_REPO:-algolia/docs-new}"

if [ ! -d "$DOCS/.git" ]; then
  echo "Expected ${DOCS} to be checked out already." >&2
  exit 1
fi
cd "$DOCS"

# Commits are authored by the App's bot user, so they are attributed to the App
# rather than to a generic actions bot.
if [ -n "${APP_SLUG:-}" ]; then
  USER_ID=$(gh api "/users/${APP_SLUG}%5Bbot%5D" --jq .id)
  git config user.name "${APP_SLUG}[bot]"
  git config user.email "${USER_ID}+${APP_SLUG}[bot]@users.noreply.github.com"
else
  git config user.name "github-actions[bot]"
  git config user.email "github-actions[bot]@users.noreply.github.com"
fi

DEFAULT_BRANCH=$(gh api "repos/${DOCS_REPO}" --jq .default_branch 2>/dev/null \
  || git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##' \
  || echo main)
echo "Default branch: ${DEFAULT_BRANCH}"

RECREATED=false
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git fetch --quiet origin "$BRANCH"
  REMOTE_TIP=$(git rev-parse "origin/${BRANCH}")

  # docs-new squash-merges, which rewrites the commit: after a merge the
  # staging tip is NOT an ancestor of the default branch, so an ancestor test
  # alone concludes "still open" forever and drags merged content into every
  # later cycle. Ask GitHub whether this branch's head was actually merged.
  MERGED_HEAD=$(gh pr list \
    --repo "$DOCS_REPO" --head "$BRANCH" --state merged \
    --limit 1 --json headRefOid --jq '.[0].headRefOid // ""' 2>/dev/null || true)

  if git merge-base --is-ancestor "origin/${BRANCH}" "origin/${DEFAULT_BRANCH}"; then
    echo "${BRANCH} is contained in ${DEFAULT_BRANCH}; recreating it."
    git checkout --quiet -B "$BRANCH" "origin/${DEFAULT_BRANCH}"
    RECREATED=true
  elif [ -n "${MERGED_HEAD:-}" ] && git merge-base --is-ancestor "$MERGED_HEAD" "$REMOTE_TIP" 2>/dev/null; then
    echo "A pull request for ${BRANCH} was squash-merged at ${MERGED_HEAD}; rebuilding from ${DEFAULT_BRANCH}."
    git checkout --quiet -B "$BRANCH" "origin/${DEFAULT_BRANCH}"
    RECREATED=true
    # Anything pushed after that merge is not in the default branch yet.
    if [ "$MERGED_HEAD" != "$REMOTE_TIP" ]; then
      echo "Replaying the commits pushed after the merge."
      if ! git cherry-pick "${MERGED_HEAD}..${REMOTE_TIP}"; then
        git cherry-pick --abort || true
        echo "::warning::Could not replay post-merge commits from ${BRANCH}; they conflict with ${DEFAULT_BRANCH} and need a human. They remain reachable at ${REMOTE_TIP}."
      fi
    fi
  else
    echo "Continuing the open ${BRANCH}."
    git checkout --quiet -B "$BRANCH" "origin/${BRANCH}"
    if ! git merge -q --no-edit "origin/${DEFAULT_BRANCH}"; then
      git merge --abort || true
      echo "::warning::Could not merge ${DEFAULT_BRANCH} into ${BRANCH}; it conflicts and needs a human. Continuing on the unmerged branch."
    fi
  fi
else
  echo "${BRANCH} does not exist yet; creating it from ${DEFAULT_BRANCH}."
  git checkout --quiet -B "$BRANCH" "origin/${DEFAULT_BRANCH}"
  RECREATED=true
fi

# The agent runs next and must not be able to reach the push credential.
# actions/checkout persists it as an http.<url>.extraheader in .git/config,
# which the agent can Read, so take it out. docs-staging-commit.sh restores
# credentials for the push alone, in a step that legitimately has them.
git config --local --unset-all "http.https://github.com/.extraheader" 2>/dev/null || true
git config --local --unset-all "http.${DOCS_REMOTE_URL:-https://github.com/}.extraheader" 2>/dev/null || true

{
  echo "DOCS_DEFAULT_BRANCH=${DEFAULT_BRANCH}"
  echo "DOCS_BRANCH=${BRANCH}"
  echo "DOCS_BRANCH_RECREATED=${RECREATED}"
} >> "${GITHUB_ENV:-/dev/stdout}"
