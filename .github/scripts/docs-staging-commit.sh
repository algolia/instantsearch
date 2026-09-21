#!/usr/bin/env bash
# Commit whatever the docs agent produced onto the staging branch and push it.
set -euo pipefail

: "${DOCS_TOKEN:?DOCS_TOKEN is required (a GitHub App installation token)}"

WS="${GITHUB_WORKSPACE:-$PWD}"
DOCS="$WS/docs-new"
STATE="$WS/agent-state"
SUMMARY="$STATE/CHANGES_SUMMARY.md"
BRANCH="${DOCS_BRANCH:-${DOCS_BRANCH_NAME:-instantsearch/staging}}"
FALLBACK="${DOCS_FALLBACK_TITLE:-fix(ui-libraries): update the InstantSearch documentation}"
# A fallback that breaks the rule it exists to enforce is worse than no check.
if [ "${#FALLBACK}" -gt 70 ]; then
  echo "::warning::Fallback title is ${#FALLBACK} characters, over the 70 limit; shortening it."
  FALLBACK="fix(ui-libraries): update the InstantSearch documentation"
fi

# The remote URLs live in one place. The push URL carries the credential; the
# tokenless one is what stays in .git/config while the agent runs. Both are
# overridable so the scripts can be exercised against a throwaway remote.
DOCS_REMOTE_URL="${DOCS_REMOTE_URL:-https://github.com/algolia/docs-new.git}"
DOCS_PUSH_URL="${DOCS_PUSH_URL:-https://x-access-token:${DOCS_TOKEN}@github.com/algolia/docs-new.git}"

cd "$DOCS"

if [ -z "$(git status --porcelain)" ]; then
  echo "No documentation changes to commit."
  echo "committed=false" >> "${GITHUB_OUTPUT:-/dev/stdout}"
  exit 0
fi

# The agent has no business touching build config, CI, or its own instructions.
# This is a boundary, not a hint: it reads contributor-authored text and its
# output is pushed, so a violation stops the push rather than being logged next
# to a `git add -A` that commits it anyway.
ALLOWED='^(doc/|docs\.json|config/|snippets/|include-snippets/|images/)'
UNEXPECTED=$(git status --porcelain | awk '{ print $NF }' | grep -vE "$ALLOWED" || true)
if [ -n "$UNEXPECTED" ]; then
  echo "::error::The agent modified files outside the docs content paths; refusing to push."
  printf '%s\n' "$UNEXPECTED"
  exit 1
fi

TITLE=""
BODY=""
if [ -f "$SUMMARY" ]; then
  TITLE=$(head -n 1 "$SUMMARY")
  BODY=$(tail -n +3 "$SUMMARY")
fi

# docs-new's AGENTS.md: conventional commits limited to feat/fix/chore, never
# `docs:`, sentence case, imperative, no trailing period, under 70 characters.
# Pull requests squash-merge there, so a malformed title lands on the default
# branch verbatim. Validate it rather than trusting the model.
if ! printf '%s' "$TITLE" | grep -qE '^(feat|fix|chore)(\([a-z0-9-]+\))?: [^A-Z].{0,60}[^.]$'; then
  echo "::warning::Title '${TITLE}' does not match the docs-new convention; using the fallback."
  TITLE="$FALLBACK"
elif [ "${#TITLE}" -gt 70 ]; then
  echo "::warning::Title is ${#TITLE} characters, over the 70 limit; using the fallback."
  TITLE="$FALLBACK"
fi

MSG=$(mktemp)
{
  printf '%s\n' "$TITLE"
  if [ -n "$BODY" ]; then
    printf '\n%s\n' "$BODY"
  fi
  printf '\nSource: %s/%s/actions/runs/%s\n' \
    "${GITHUB_SERVER_URL:-https://github.com}" "${GITHUB_REPOSITORY:-algolia/instantsearch}" "${GITHUB_RUN_ID:-local}"
  # Provenance, so the release run can work out which of these documented
  # changes are in a published release and which would document an API nobody
  # can install yet. docs-release-status.sh reads these trailers back.
  if [ -n "${SOURCE_PR:-}" ]; then
    printf 'Source-PR: %s\n' "$SOURCE_PR"
  fi
  if [ -n "${SOURCE_COMMIT:-}" ]; then
    printf 'Source-Commit: %s\n' "$SOURCE_COMMIT"
  fi
  printf '\nCo-Authored-By: Claude <noreply@anthropic.com>\n'
} > "$MSG"

# Stage the content paths explicitly rather than `git add -A`, so the boundary
# above is what decides what ships. One `git add` per path: a single invocation
# listing them all aborts on the first path that does not exist in the repo,
# staging nothing at all.
for path in doc docs.json config snippets include-snippets images; do
  if [ -e "$path" ]; then
    git add -A -- "$path"
  fi
done
if git diff --cached --quiet; then
  echo "Nothing staged after filtering to the docs content paths."
  echo "committed=false" >> "${GITHUB_OUTPUT:-/dev/stdout}"
  exit 0
fi
git commit -q --file "$MSG"

# The checkout script left the remote tokenless so the agent could not read the
# credential. Put it back only for the push, and take it out again afterwards -
# on the failure path too, hence the trap.
restore_tokenless() { git remote set-url origin "$DOCS_REMOTE_URL" 2>/dev/null || true; }
trap restore_tokenless EXIT
git remote set-url origin "$DOCS_PUSH_URL"

if [ "${DOCS_BRANCH_RECREATED:-false}" = "true" ]; then
  git push --force-with-lease origin "$BRANCH"
else
  git push origin "$BRANCH"
fi

{
  echo "committed=true"
  echo "title=${TITLE}"
} >> "${GITHUB_OUTPUT:-/dev/stdout}"

echo "Committed to ${BRANCH}: ${TITLE}"
