# Oxlint auto-fix task

You are fixing a single oxlint rule across a bounded set of files in the InstantSearch monorepo. Your changes will be reviewed by humans in a draft PR.

## Inputs

The file `lint-fix-context.json` at the repo root describes this task:

```json
{
  "rule": "<plugin(rule-name)>",
  "totalViolations": <number>,
  "inScopeFiles": [<file paths>],
  "deferredFiles": [<file paths, possibly empty>]
}
```

Read it first.

## Goal

After your edits, the file list in `inScopeFiles` must report **zero violations of the targeted rule** when re-linted. Files not listed in `inScopeFiles` are out of scope — do not edit them.

## How to verify

Run oxlint scoped to one or more in-scope files and grep for the rule's `code` field:

```bash
node_modules/.bin/oxlint --type-aware -f json <file> [<file>...]
```

Each diagnostic's `code` looks like `eslint(no-debugger)` or `typescript-eslint(consistent-type-imports)`. You succeed when no diagnostic for the targeted rule remains in any in-scope file.

`yarn lint:fix` applies oxlint's autofixer (already run before you started; remaining violations are the ones the autofixer can't handle).

## Constraints — read carefully

1. **One rule, one task.** Only fix violations of the rule named in `lint-fix-context.json`. If you notice other lint issues, ignore them — they belong to future PRs.
2. **Surgical changes.** Touch only the lines required to fix the violation. Do not reformat unrelated code, rename variables, "modernize" syntax, or rewrite logic.
3. **Preserve behavior.** The fix must not change runtime semantics. If a fix would change behavior (e.g., turning sequential awaits into `Promise.all` changes ordering and error propagation), prefer a `// oxlint-disable-next-line <rule> -- <reason>` comment over a behavior change. Always include a reason after `--`.
4. **Match existing style.** Follow conventions you observe in the file — quote style, import order, `const` vs `let`, etc.
5. **No new dependencies.** Don't add packages or import from new modules to fix lint.
6. **Forbidden paths.** Never edit any of: `package.json`, `yarn.lock`, `.oxlintrc.json`, `.github/**`, `.circleci/**`, `tsconfig*.json`, `lerna.json`, `examples/**`, `packages/create-instantsearch-app/src/templates/**`, `packages/instantsearch-codemods/__testfixtures__/**`. Editing any of these will fail the workflow.
7. **Stay within scope.** Only edit files listed in `inScopeFiles`. The workflow caps scope deliberately for reviewability — don't expand it.
8. **Diff size.** Keep your changed lines under ~400 (insertions + deletions, on top of whatever the autofixer already produced). The workflow enforces this and a hard 800-line cap on the combined diff. If you find yourself making large structural changes, stop and add a `oxlint-disable` with a reason instead.

## When to use `oxlint-disable`

Use it sparingly, only when the violation is genuinely intentional or fixing it would require changes outside this task's scope. The comment must include a reason after `--`:

```ts
// oxlint-disable-next-line eslint(no-await-in-loop) -- ordering matters here, see PR #123
for (const item of items) {
  await process(item);
}
```

Disables without reasons will be rejected.

## Procedure

1. Read `lint-fix-context.json`.
2. For each file in `inScopeFiles`, read the file, identify the violations of the targeted rule, and apply the minimum edit that resolves them.
3. After editing all files, re-run oxlint on the in-scope files (single batched invocation is fine) and confirm no diagnostic with the targeted `code` remains.
4. If any in-scope file still has violations of the targeted rule, either fix them or replace your earlier edit with an `oxlint-disable-next-line` + reason. Do not declare the task complete with violations remaining.
5. Stop when the in-scope files are clean. Do not start fixing other rules or files.

## Output

No summary file is required — the workflow reads the diff directly. Just leave the working tree with your fixes applied.
