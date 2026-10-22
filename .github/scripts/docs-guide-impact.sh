#!/usr/bin/env bash
# Append a "pages that may be affected" section to the agent's context.
#
# Reference pages are easy to keep current: a new option means a new row in a
# known table. Guides are where documentation actually rots - prose describing
# the old behaviour stays plausible and nobody notices. Telling the agent to
# "check the guides" is vague and turn-expensive; grepping the docs tree for the
# names this change touched turns it into a bounded checklist.
#
# Usage: docs-guide-impact.sh <changed-source-files> <context-file-to-append-to>
set -euo pipefail

CHANGED="${1:?path to a file listing changed source paths}"
CONTEXT="${2:?path to the context file to append to}"

if [ ! -s "$CHANGED" ]; then
  echo "No changed source files recorded; skipping guide impact." >&2
  exit 0
fi
DOCS="${GITHUB_WORKSPACE:-$PWD}/docs-new"
MAX_FILES="${GUIDE_IMPACT_MAX_FILES:-25}"
# A term on more than this many pages is describing the product, not this
# change. Dropping those is what keeps the list worth reading: without it a
# term like `open` or `display` matches a third of the repository.
MAX_PAGES_PER_TERM="${GUIDE_IMPACT_MAX_PAGES_PER_TERM:-40}"

TERMS=$(mktemp); RAW=$(mktemp); PAIRS=$(mktemp)
KEPT=$(mktemp); DROPPED=$(mktemp); RANKED=$(mktemp)

# Search terms come from the paths themselves - each file's own name and its
# directory - which is more reliable than parsing identifiers out of a diff.
# The later grep is case-insensitive, so one lowercase spelling covers
# chatTrigger, ChatTrigger and chat-trigger alike.
while IFS= read -r file; do
  [ -n "$file" ] || continue
  base=$(basename "$file"); base="${base%%.*}"
  dir=$(basename "$(dirname "$file")")
  for raw in "$base" "$dir"; do
    kebab=$(printf '%s' "$raw" \
      | sed -E 's/^_+//' \
      | sed -E 's/^(connect|use)([A-Z])/\2/' \
      | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' \
      | tr '[:upper:]' '[:lower:]')
    [ -n "$kebab" ] || continue
    printf '%s\n%s\n' "$kebab" "${kebab//-/}" >> "$TERMS"
  done
done < "$CHANGED"

# The frequency filter below catches most noise, but a handful of names are
# never product surface no matter how rare they are in the docs.
sort -u "$TERMS" | awk 'length($0) >= 4' \
  | grep -vxE 'utils|helpers|constants|defaults|fixtures|mocks|stubs|shared|internal|deprecated' \
  > "${TERMS}.u" && mv "${TERMS}.u" "$TERMS"
if [ ! -s "$TERMS" ]; then
  echo "No usable search terms derived from the changed files; skipping." >&2
  exit 0
fi

# One pass over the docs tree: every (page, matched term) pair.
for tree in "$DOCS/doc/guides" "$DOCS/doc/api-reference"; do
  [ -d "$tree" ] || continue
  grep -roiFf "$TERMS" --include='*.mdx' "$tree" >> "$RAW" 2>/dev/null || true
done

if [ ! -s "$RAW" ]; then
  {
    echo
    echo "## Pages that may be affected"
    echo
    echo "_No existing page mentions any of \`$(paste -sd' ' "$TERMS")\`. If this"
    echo "change is user-facing it likely needs a new page rather than an edit._"
  } >> "$CONTEXT"
  exit 0
fi

# path:match -> "term<TAB>page", deduplicated
# InstantSearch here means the web flavours; an android/ios/flutter page that
# happens to share a widget name is not ours to update.
awk -F: -v docs="$DOCS/" '
  { p = $1; sub(docs, "", p) }
  p ~ /\/(android|ios|flutter|kotlin|swift|dart|php|python|ruby|go|java|csharp|scala)\.mdx$/ { next }
  { print tolower($2) "\t" p }
' "$RAW" | sort -u > "$PAIRS"

# Split terms into ones that identify something and ones that are everywhere
cut -f1 "$PAIRS" | uniq -c | while read -r count term; do
  if [ "$count" -le "$MAX_PAGES_PER_TERM" ]; then
    printf '%s\n' "$term" >> "$KEPT"
  else
    printf '%s (%s pages)\n' "$term" "$count" >> "$DROPPED"
  fi
done

if [ ! -s "$KEPT" ]; then
  {
    echo
    echo "## Pages that may be affected"
    echo
    echo "_Every term derived from this change is too common in the docs to point"
    echo "anywhere useful ($(paste -sd, "$DROPPED" 2>/dev/null | sed 's/,/, /g')). Find the relevant"
    echo "pages by searching for the specific option or component name instead._"
  } >> "$CONTEXT"
  exit 0
fi

# Rank pages by how many distinct specific terms they mention, then by volume
awk -F'\t' 'NR == FNR { keep[$1]; next } $1 in keep { n[$2]++ } END { for (p in n) printf "%s\t%s\n", n[p], p }' \
  "$KEPT" "$PAIRS" | sort -rn -k1,1 > "$RANKED"

TOTAL=$(wc -l < "$RANKED" | tr -d ' ')

{
  echo
  echo "## Pages that may be affected"
  echo
  echo "Terms derived from the changed files: \`$(paste -sd' ' "$KEPT")\`"
  echo
  echo "These existing pages mention them, most distinct terms first. Check the"
  echo "ones that could now be wrong. Prose describing the old behaviour is the"
  echo "failure mode here, not a missing table row - and a guide that walks"
  echo "through a flow you have just changed is the most likely casualty."
  echo
  echo "| Terms | Page |"
  echo "| ---: | --- |"
  head -n "$MAX_FILES" "$RANKED" | awk -F'\t' '{ printf "| %s | `%s` |\n", $1, $2 }'
  if [ "$TOTAL" -gt "$MAX_FILES" ]; then
    echo
    echo "_${TOTAL} pages matched; the $((TOTAL - MAX_FILES)) matching the fewest terms are not listed._"
  fi
  if [ -s "$DROPPED" ]; then
    echo
    echo "_Ignored as too common to identify anything: $(paste -sd, "$DROPPED" | sed 's/,/, /g')._"
  fi
} >> "$CONTEXT"

echo "Guide impact: ${TOTAL} page(s) matched on $(wc -l < "$KEPT" | tr -d ' ') specific term(s), listed up to ${MAX_FILES}."
