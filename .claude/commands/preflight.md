---
description: Run the pre-push checklist — lint, types, relevant tests, and a Conventional-Commit sanity check
allowed-tools: Bash(yarn lint:changed), Bash(yarn lint:fix), Bash(yarn type-check), Bash(yarn type-check:*), Bash(yarn jest:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

Run the InstantSearch pre-push checks against the **current changes** and report a concise pass/fail summary. Don't fix anything silently — surface failures and propose fixes.

## Steps

1. **Scope the change.** `git status` + `git diff --name-only` (and vs. the base branch if on a feature branch) to see which packages/files are touched.

2. **Lint the changed files:** `yarn lint:changed`. If it fails, show the violations; offer `yarn lint:fix` for auto-fixable ones (note that oxlint bans `for-in`/`for-of`/`async` and implicit `any` in library code — those need manual fixes).

3. **Type-check:** `yarn type-check`. If any touched code interacts with the legacy algoliasearch versions, also run `yarn type-check:v3` / `yarn type-check:v4`.

4. **Run the relevant tests** — not the whole suite. Map changed files to their `yarn jest <path>` (e.g. a connector → `yarn jest packages/instantsearch.js/src/connectors/<name>`; a React widget → its `__tests__` path). If a connector's cross-flavor behavior changed, include the matching `tests/common/` path.

5. **Conventional-Commit sanity check.** Look at staged changes / recent commits and confirm the message fits `type(scope): description` (scope = widget/connector or topic like `deps`/`ci`). Flag if it doesn't; suggest a corrected message. Reference issues with `fix #1234` in the body when applicable.

## Output

Report a short checklist:
- ✅/❌ lint:changed
- ✅/❌ type-check (+ v3/v4 if run)
- ✅/❌ tests (list the paths run)
- ✅/❌ commit message

For any ❌, show the failing output and the smallest fix. Don't run the full `yarn test` or `yarn build` unless asked — this is the fast pre-push loop.

Run the checks directly (don't spawn an agent just to run them). If a failure needs non-trivial fixing, *then* delegate it to the owning flavor agent — `instantsearch-core-engineer`, `react-instantsearch-engineer`, `vue-instantsearch-engineer`, or `instantsearch-ui-components-engineer` — based on which package the failing file is in.
