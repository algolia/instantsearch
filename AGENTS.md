# InstantSearch monorepo

Search UI libraries for Algolia across three flavors (vanilla JS, React, Vue), sharing one connector + UI-component core. Yarn 4 workspaces + Lerna (independent versioning).

## Repo map

| Package | What it is |
| --- | --- |
| `packages/instantsearch-core` | **Core.** Connectors (`src/connectors/`), the runtime, routers, state mappings, middlewares and shared types, shared by every flavor. Its root (`instantsearch-core`) is the user-facing API that each flavor re-exports; `instantsearch-core/internal` holds helpers for the first-party flavors only (no semver guarantee, never import it outside `packages/*/src`). Users import from their flavor package, not from core. |
| `packages/instantsearch.js` | Vanilla JS flavor: widgets, templates and the JS `InstantSearch` class on top of core. |
| `packages/react-instantsearch-core` | Headless React: hooks (`useSearchBox`, …) that wrap connectors. Framework-agnostic (web/RN). |
| `packages/react-instantsearch` | React DOM widgets = hooks + UI from `instantsearch-ui-components`. |
| `packages/vue-instantsearch` | Vue 2/3 components wrapping connectors. |
| `packages/instantsearch-ui-components` | **Shared UI layer.** Framework-agnostic widget markup + `ais-*` classes via factory components (`create<Name>Component({ createElement, Fragment })`); reused by React directly, Vue via `renderCompat`, JS via the Preact renderer. Some widgets take their layout from here; others define it in their flavor (`instantsearch.js/src/components/`, `react-instantsearch/src/ui/`). |
| `packages/algoliasearch-helper` | Low-level search-parameter/state manager underneath connectors. Mature, separately-versioned; **rarely the place for a change** — fix the connector instead. See its `AGENTS.md`. |
| `packages/instantsearch.css` | Default themes. |
| `packages/react-instantsearch-nextjs` / `-router-nextjs` | Next.js App Router / Pages Router integrations. |
| `packages/create-instantsearch-app`, `instantsearch-cli`, `instantsearch-codemods` | Scaffolding / CLI / migration tooling. |

Architecture in one line: **connector (logic, in instantsearch-core) → flavor wrapper (JS widget / React hook+component / Vue component) → shared UI components**. Change behavior in the connector; change markup in the UI layer.

## Where work goes (per layer)

Because behavior lives in the connector and the flavors only wrap it, most changes have a natural home — and the per-package `AGENTS.md` files carry each layer's conventions:

| Work in… | Package |
| --- | --- |
| Connectors, runtime, routers, state mappings, middlewares, shared types | `packages/instantsearch-core` (public → `src/index.ts`, flavor-only helpers → `src/internal.ts`; its `AGENTS.md` has the connector contract) |
| JS widgets, Preact components (`src/components`) | `packages/instantsearch.js` |
| Shared framework-agnostic markup / `ais-*` classes | `packages/instantsearch-ui-components` |
| React widgets/hooks + Next.js integrations | `react-instantsearch` / `react-instantsearch-core` / `*-nextjs` |
| Vue components (Vue 2 **and** 3) | `vue-instantsearch` |

For a **cross-flavor change**, settle the contract in the connector first, then update the React and Vue wrappers, then the common tests. If the change is to **shared markup/layout** (not behavior), it lives in `instantsearch-ui-components` and the flavors consume the result — a class/structure change there ripples to all flavors and `instantsearch.css` at once.

**Adding or surfacing a connector option is always cross-flavor work** — settle the contract in the connector first, then thread it through React **and** Vue, then add/extend common tests. Don't wire one flavor and stop. The **`/expose-option <connector> <option>`** command walks this recipe; **`/preflight`** runs the pre-push lint/types/tests/commit check; the `/port-widget` skill adds a brand-new widget across flavors.

## Commands

Node `20.19.0` (`.nvmrc`). Use Yarn (v4, pinned by `packageManager`).

```bash
# Build
yarn build                      # all packages and examples (lerna)
yarn build:ci                   # packages only, as CI builds them
yarn lerna run build --scope <pkg>   # single package; swap in build:types for declarations only

# Unit tests (Jest, jsdom)
yarn jest <path-or-pattern>     # fastest loop: run one file/pattern at root
yarn jest packages/<pkg>        # one package's suite (flavor pkgs have no `test` script — scope jest by path)
yarn jest common-widgets        # shared cross-flavor widget suites (JS+React+Vue); -connectors for connectors
yarn jest common-widgets -t "Chat widget common tests"   # scope to one widget (label = "<Widget> widget common tests")
yarn test                       # everything (slow)

# Lint (oxlint) + format (oxfmt) + types
yarn lint:changed               # lint only changed files — use this while iterating
yarn lint:fix                   # auto-fix
yarn format                     # format the repo; yarn format:check only reports
yarn type-check                 # tsc + per-package
yarn type-check:v4              # the same check against the algoliasearch v4 client (CI downgrades it first)

# E2E — see .claude/rules/e2e.md (Playwright). Examples must be built first:
yarn website:examples && E2E_FLAVOR=react E2E_BROWSER=chromium yarn test:e2e
```

Packages build with the root's `rollup` and `tsc`, which only scripts started from the root can reach, so build through Lerna as CI does: `yarn workspace <pkg> build` stops at `command not found`, and `instantsearch.js`'s `build:types` exits 0 with stale declarations. `yarn type-check` reads other packages, and public paths like `instantsearch.js/es/…`, from those built declarations: rebuild the packages you changed before type-checking, and run `yarn build:ci` after a rebase or a branch switch.

CI checks these three in a single job, in the order `Format check` → `Lint` → `Type checking`: the first failure stops the job, so a red `Lint` step means `Type checking` never ran — read a missing step as unknown, not as passing, and run `yarn format` before pushing.

Don't pass `--silent` to `yarn jest`. Some tests count `console.error` calls, and Jest's silent console doesn't turn `console.trace` into one, so the "can attach many `render` listeners" test in `instantsearch-core` fails with it.

## Conventions

- **TypeScript strict.** No implicit any; unused vars/params error. Avoid `for-in`/`for-of` and `async` in library code (oxlint enforces).
- **Tests** co-locate in `__tests__/` next to source — Jest picks up _any_ file under `__tests__/` (the default `testMatch`), so some existing tests are plain `*.js`; name new ones `*.test.ts(x)`. Prefer focused assertions; use inline snapshots sparingly (initial render only). Mocks/helpers come from `@instantsearch/mocks` and `@instantsearch/testutils`.
- **Cross-flavor tests** live in `tests/common/{widgets,connectors}/<name>/` and each flavor registers them in its `common-widgets.test.*` / `common-connectors.test.*`. Run with `yarn jest common-widgets` (all three flavors) and scope to one widget via `-t "<Widget> widget common tests"`. This is the primary test surface for widgets like Autocomplete and Chat. See `tests/common/README.md`.
- **Commits: Conventional Commits** — `type(scope): description`, scope = widget/connector or topic (`deps`, `ci`). e.g. `fix(searchbox): increase magnifying glass size`, `feat(hits): add custom rendering`. Reference issues with `fix #1234` in the body.
- **Branches:** target `master`; `vX` branches are critical-fix-only. Branch names: `fix/<issue>`, `feat/<name>`.
- **Releases** are automated via Ship.js (`yarn release`); changelogs are generated from commits — don't hand-edit them. **Prereleases** bypass Ship.js: dispatch the **CI** workflow on the branch to release (`channel` = the npm dist-tag, `action` = `plan` first to see the exact versions). It publishes only that channel tag, never `latest`, and it has to stay a job in `ci.yml` because that is the workflow filename npm's trusted publishers already name — a new workflow file would need that form filled in on every package. Merging a branch into `master` graduates its betas: Ship.js's `semver.inc` drops the prerelease.
- **Agent workflows that write to another repo** (`.github/workflows/docs-*.yml`) must run with the working directory _inside_ that repo: only that directory's own instruction files (and the ones above it) load at start, so the target repo's conventions get silently ignored otherwise. A file in a _subdirectory_ does load, but only once the agent touches a file in it — don't count on it. Reach this repo's source via `--add-dir` instead, and know that an `--add-dir` directory contributes no `AGENTS.md`/`CLAUDE.md` at all unless `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`. Same for `--allowedTools`: `Bash(git diff:*)` matches, `Bash(git diff *)` matches nothing, and every denied call burns a turn.

## Keep these docs alive

- **The instruction file is `AGENTS.md`** — here and in every documented package; `instantsearch-core`'s covers the connector contract. There is deliberately **no `CLAUDE.md` anywhere**: Claude Code reads `AGENTS.md` only while a directory has no `CLAUDE.md`, so adding one silently shadows (and replaces) the real doc. If a tool ever insists on `CLAUDE.md`, make it contain `@AGENTS.md` — never a copy of the content.

If you discover something durable and non-obvious while working — a gotcha that cost you a debugging detour, a convention, a non-obvious file location, a cross-flavor constraint — **propose** adding it to the right doc (package `AGENTS.md` if package-specific, this file if repo-wide, `.claude/rules/e2e.md` for e2e). Surface the proposed edit for the user to approve rather than editing silently. Bar: it must generalize beyond the current task (same bar as a good code comment) and not already be documented.

## Reference docs (read before relevant work — don't duplicate here)

- `CONTRIBUTING.md` — full process, commit/branch rules, package-import flow.
- `.claude/rules/e2e.md` — E2E testing (Playwright helpers, flavors, debugging).
- `.claude/skills/port-widget/` — adding a widget across all three flavors (the `/port-widget` skill).
- `tests/common/README.md` — shared cross-flavor test architecture.
- Per-package `AGENTS.md` — in `instantsearch-core`, `instantsearch.js`, `instantsearch-ui-components`, `react-instantsearch`, `react-instantsearch-nextjs`, `react-instantsearch-router-nextjs`, `vue-instantsearch` and `algoliasearch-helper` — for package layout, conventions and pitfalls.
- `.claude/prompts/architecture-refactor/` — the scout/rubric/implement prompts driven by `.github/workflows/architecture-refactor.yml` (stages of that workflow, not slash commands).
