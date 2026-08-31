#!/usr/bin/env bash
# Tell the docs pull request which of the changes it documents are actually in a
# published release, and therefore whether it is safe to merge.
#
# The staging branch accumulates one commit per merged InstantSearch change, and
# a release publishes some subset of them. A docs pull request opened by one
# release keeps collecting commits while it waits for review, so it can quietly
# come to document an API nobody can install yet. Merging then ships
# documentation ahead of the code. Nothing else in this workflow tracks that, so
# this maintains a single updated comment that says plainly what is released,
# what is not, and whether the pull request is still blocked.
#
# Usage: docs-release-status.sh <docs-pr-number> <released-prs-file>
set -euo pipefail

PR="${1:?docs pull request number}"
RELEASED_FILE="${2:?file listing the InstantSearch PR numbers in this release}"

: "${DOCS_TOKEN:?DOCS_TOKEN is required}"
export GH_TOKEN="$DOCS_TOKEN"

DOCS_REPO="${DOCS_REPO:-algolia/docs-new}"
SOURCE_REPO="${GITHUB_REPOSITORY:-algolia/instantsearch}"
DOCS="${GITHUB_WORKSPACE:-$PWD}/docs-new"
BASE="origin/${DOCS_DEFAULT_BRANCH:-main}"
MARKER='<!-- instantsearch-docs-release-status -->'
BLOCKED_LABEL="${DOCS_BLOCKED_LABEL:-unreleased}"

RELEASED=$(mktemp); ITEMS=$(mktemp); BODY=$(mktemp)
sort -u "$RELEASED_FILE" 2>/dev/null > "$RELEASED" || true

# One line per documentation commit: subject and the source PR it came from.
# %(trailers:...) keeps this to a single git call.
git -C "$DOCS" log "${BASE}..HEAD" --reverse \
  --format='%s%x1f%(trailers:key=Source-PR,valueonly,separator=%x2c)' > "$ITEMS"

if [ ! -s "$ITEMS" ]; then
  echo "No documentation commits on the branch; nothing to report."
  exit 0
fi

released_lines=""
pending_lines=""
pending=0

while IFS=$'\x1f' read -r subject source_pr; do
  [ -n "${subject:-}" ] || continue
  source_pr=$(printf '%s' "${source_pr:-}" | tr -d '[:space:],')
  if [ -z "$source_pr" ]; then
    # The release sweep's own commit has no source PR: it documents this
    # release, so it is released by definition.
    released_lines="${released_lines}- ${subject}"$'\n'
  elif grep -qx "$source_pr" "$RELEASED" 2>/dev/null; then
    released_lines="${released_lines}- ${subject} (${SOURCE_REPO}#${source_pr})"$'\n'
  else
    pending_lines="${pending_lines}- ${subject} (${SOURCE_REPO}#${source_pr})"$'\n'
    pending=$(( pending + 1 ))
  fi
done < "$ITEMS"

{
  printf '%s\n' "$MARKER"
  echo "## Release status"
  echo
  if [ "$pending" -eq 0 ]; then
    echo ":white_check_mark: **No longer blocked.** Everything documented here is in a published release."
  else
    echo ":hourglass: **Blocked.** ${pending} change(s) documented here are not in a published release yet."
    echo "Merging now would document an API that cannot be installed. This comment updates itself on the next release."
  fi
  echo
  if [ -n "$released_lines" ]; then
    echo "### In a published release"
    echo
    printf '%s' "$released_lines"
    echo
  fi
  if [ -n "$pending_lines" ]; then
    echo "### Not released yet"
    echo
    printf '%s' "$pending_lines"
    echo
  fi
  printf '_Updated by [%s](%s/%s/actions/runs/%s)._\n' \
    "$SOURCE_REPO" "${GITHUB_SERVER_URL:-https://github.com}" "$SOURCE_REPO" "${GITHUB_RUN_ID:-local}"
} > "$BODY"

# One comment kept up to date rather than one per release, found by its marker.
EXISTING=$(gh api --paginate "repos/${DOCS_REPO}/issues/${PR}/comments" \
  --jq "[.[] | select(.body | contains(\"${MARKER}\")) | .id] | .[0] // \"\"" 2>/dev/null || true)

if [ -n "${EXISTING:-}" ]; then
  gh api --method PATCH "repos/${DOCS_REPO}/issues/comments/${EXISTING}" \
    -F "body=@${BODY}" --jq .id > /dev/null
  echo "Updated the release-status comment on ${DOCS_REPO}#${PR}."
else
  gh api --method POST "repos/${DOCS_REPO}/issues/${PR}/comments" \
    -F "body=@${BODY}" --jq .id > /dev/null
  echo "Posted the release-status comment on ${DOCS_REPO}#${PR}."
fi

# A label as well as a comment: the comment is for a human reading the pull
# request, the label is what you can filter on. Best effort - it needs
# issues:write on docs-new and the label may not exist yet.
if [ "$pending" -gt 0 ]; then
  gh label create "$BLOCKED_LABEL" --repo "$DOCS_REPO" \
    --description "Documents an InstantSearch change that is not in a published release" \
    --color D4C5F9 >/dev/null 2>&1 || true
  gh pr edit "$PR" --repo "$DOCS_REPO" --add-label "$BLOCKED_LABEL" >/dev/null 2>&1 \
    || echo "::warning::Could not add the ${BLOCKED_LABEL} label to ${DOCS_REPO}#${PR}."
else
  gh pr edit "$PR" --repo "$DOCS_REPO" --remove-label "$BLOCKED_LABEL" >/dev/null 2>&1 || true
fi

# Only ever promote, never demote: a human may have taken it out of draft
# deliberately, and undoing that is not this script's call. docs-new's AGENTS.md
# asks that pull requests stay in draft until the checks pass, so being released
# is necessary but not sufficient.
if [ "$pending" -eq 0 ] \
  && [ "${AGENT_STATUS:-}" = "complete" ] \
  && [ "${AGENT_VERIFY:-}" = "clean" ]; then
  if [ "$(gh pr view "$PR" --repo "$DOCS_REPO" --json isDraft --jq .isDraft)" = "true" ]; then
    gh pr ready "$PR" --repo "$DOCS_REPO" >/dev/null 2>&1 \
      && echo "Marked ${DOCS_REPO}#${PR} ready for review: released, complete and checks clean." \
      || echo "::warning::Could not mark ${DOCS_REPO}#${PR} ready for review."
  fi
else
  echo "Leaving ${DOCS_REPO}#${PR} as it is (pending=${pending}, status=${AGENT_STATUS:-?}, checks=${AGENT_VERIFY:-?})."
fi

echo "released_pending=${pending}" >> "${GITHUB_OUTPUT:-/dev/stdout}"
