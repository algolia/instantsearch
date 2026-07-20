#!/usr/bin/env bash
#
# Local mirror of the "Compressed Size" GitHub workflow
# (.github/workflows/compressed-size.yml). Measures the gzipped size of the
# same tracked bundles and, optionally, diffs against a saved baseline.
#
# Usage:
#   yarn build:ci                       # bundles must exist first
#   scripts/bundle-size.sh              # print current gzipped sizes
#   scripts/bundle-size.sh > base.txt   # save a baseline (e.g. from master)
#   scripts/bundle-size.sh base.txt     # print sizes + delta vs baseline
#
# gzip -9 matches the `gzip-size` level used by compressed-size-action.

set -euo pipefail
shopt -s nullglob

cd "$(dirname "$0")/.."

# Keep this list in sync with the `pattern` in compressed-size.yml.
# `dist/*.js` is non-recursive on purpose — it skips the es/cjs module fan-outs.
globs=(
  packages/*/dist/*.js
  packages/*/dist/umd/*.min.js
  packages/vue-instantsearch/vue2/umd/*.js
  packages/vue-instantsearch/vue3/umd/*.js
  packages/vue-instantsearch/vue2/cjs/*.js
  packages/vue-instantsearch/vue3/cjs/*.js
  packages/instantsearch.css/themes/*.css
  packages/instantsearch.css/components/*.css
)

# Bundles to skip (match the workflow's `exclude`).
skip_re='instantsearch-codemods'

baseline="${1:-}"

if [[ -n "$baseline" && ! -f "$baseline" ]]; then
  echo "baseline file not found: $baseline" >&2
  exit 1
fi

# Look up a path's byte size in the baseline file (bash 3.2 has no assoc arrays).
lookup_base() { awk -v p="$1" '$2 == p { print $1; exit }' "$baseline"; }

fmt_kb() { awk "BEGIN { printf \"%.2f kB\", $1 / 1000 }"; }

for glob in "${globs[@]}"; do
  for file in $glob; do
    [[ "$file" == *.map ]] && continue
    [[ "$file" == *"$skip_re"* ]] && continue
    bytes=$(gzip -9 -c "$file" | wc -c | tr -d ' ')

    if [[ -n "$baseline" ]]; then
      old="$(lookup_base "$file")"
      if [[ -z "$old" ]]; then
        delta="  (new)"
      else
        diff=$(( bytes - old ))
        if [[ "$diff" -eq 0 ]]; then
          delta="  (=)"
        else
          sign=$([[ "$diff" -gt 0 ]] && echo "+" || echo "")
          delta="  (${sign}$(fmt_kb "$diff"))"
        fi
      fi
      printf "%s\t%s%s\n" "$(fmt_kb "$bytes")" "$file" "$delta"
    else
      # Baseline-friendly output: raw bytes + path (re-readable by this script).
      printf "%s %s\n" "$bytes" "$file"
    fi
  done
done
