# InstantSearch monorepo

Search UI libraries for Algolia across three flavors (vanilla JS, React, Vue), sharing one connector + UI-component core. Yarn 1 workspaces + Lerna (independent versioning).

## Repo map

| Package | What it is |
|---|---|
| `packages/instantsearch.js` | **Core.** Vanilla JS library. **All connectors live here** (`src/connectors/`) and are shared by every flavor. |
| `packages/react-instantsearch-core` | Headless React: hooks (`useSearchBox`, …) that wrap connectors. Framework-agnostic (web/RN). |
| `packages/react-instantsearch` | React DOM widgets = hooks + UI from `instantsearch-ui-components`. |
| `packages/vue-instantsearch` | Vue 2/3 components wrapping connectors. |
| `packages/instantsearch-ui-components` | **Shared UI layer.** Framework-agnostic widget markup + `ais-*` classes via factory components (`create<Name>Component({ createElement, Fragment })`); reused by React directly, Vue via `renderCompat`, JS via the Preact renderer. Newer widgets get their layout here; older ones still define it in `instantsearch.js/src/components/`. |
| `packages/algoliasearch-helper` | Low-level search-parameter/state manager underneath connectors. Mature, separately-versioned; **rarely the place for a change** — fix the connector instead. See its `CLAUDE.md`. |
| `packages/instantsearch.css` | Default themes. |
| `packages/react-instantsearch-nextjs` / `-router-nextjs` | Next.js App Router / Pages Router integrations. |
| `packages/create-instantsearch-app`, `instantsearch-cli`, `instantsearch-codemods` | Scaffolding / CLI / migration tooling. |

Architecture in one line: **connector (logic, in instantsearch.js) → flavor wrapper (JS widget / React hook+component / Vue component) → shared UI components**. Change behavior in the connector; change markup in the UI layer.

## Where work goes (per layer)

Because behavior lives in the connector and the flavors only wrap it, most changes have a natural home — and the per-package `CLAUDE.md` files carry each layer's conventions:

| Work in… | Package |
|---|---|
| Connectors, JS widgets, runtime (`src/lib`), legacy Preact components (`src/components`), types | `packages/instantsearch.js` |
| Shared framework-agnostic markup / `ais-*` classes | `packages/instantsearch-ui-components` |
| React widgets/hooks + Next.js integrations | `react-instantsearch` / `react-instantsearch-core` / `*-nextjs` |
| Vue components (Vue 2 **and** 3) | `vue-instantsearch` |

For a **cross-flavor change**, settle the contract in the connector first, then update the React and Vue wrappers, then the common tests. If the change is to **shared markup/layout** (not behavior), it lives in `instantsearch-ui-components` and the flavors consume the result — a class/structure change there ripples to all flavors and `instantsearch.css` at once.

**Adding or surfacing a connector option is always cross-flavor work** — settle the contract in the connector first, then thread it through React **and** Vue, then add/extend common tests. Don't wire one flavor and stop. The **`/expose-option <connector> <option>`** command walks this recipe; **`/preflight`** runs the pre-push lint/types/tests/commit check; the `/port-widget` skill adds a brand-new widget across flavors.

## Commands

Node `20.19.0` (`.nvmrc`). Use Yarn (v1).

```bash
# Build
yarn build                      # all packages (lerna)
yarn workspace <pkg> build      # single package, e.g. yarn workspace instantsearch.js build

# Unit tests (Jest, jsdom)
yarn jest <path-or-pattern>     # fastest loop: run one file/pattern at root
yarn jest packages/<pkg>        # one package's suite (flavor pkgs have no `test` script — scope jest by path)
yarn jest common-widgets        # shared cross-flavor widget suites (JS+React+Vue); -connectors for connectors
yarn jest common-widgets -t "Chat widget common tests"   # scope to one widget (label = "<Widget> widget common tests")
yarn test                       # everything (slow)

# Lint (oxlint) + format (prettier) + types
yarn lint:changed               # lint only changed files — use this while iterating
yarn lint:fix                   # auto-fix
yarn type-check                 # tsc + per-package (also :v3 / :v4 for legacy algoliasearch)

# E2E — see .claude/rules/e2e.md (Playwright). Examples must be built first:
yarn website:examples && E2E_FLAVOR=react E2E_BROWSER=chromium yarn test:e2e
```

## Conventions

- **TypeScript strict.** No implicit any; unused vars/params error. Avoid `for-in`/`for-of` and `async` in library code (oxlint enforces).
- **Tests** co-locate in `__tests__/` next to source — Jest picks up *any* file under `__tests__/` (the default `testMatch`), so some legacy tests are plain `*.js`; name new ones `*.test.ts(x)`. Prefer focused assertions; use inline snapshots sparingly (initial render only). Mocks/helpers come from `@instantsearch/mocks` and `@instantsearch/testutils`.
- **Cross-flavor tests** live in `tests/common/{widgets,connectors}/<name>/` and each flavor registers them in its `common-widgets.test.*` / `common-connectors.test.*`. Run with `yarn jest common-widgets` (all three flavors) and scope to one widget via `-t "<Widget> widget common tests"`. This is the primary test surface for newer widgets like Autocomplete and Chat. See `tests/common/README.md`.
- **Commits: Conventional Commits** — `type(scope): description`, scope = widget/connector or topic (`deps`, `ci`). e.g. `fix(searchbox): increase magnifying glass size`, `feat(hits): add custom rendering`. Reference issues with `fix #1234` in the body.
- **Branches:** target `master`; `vX` branches are critical-fix-only. Branch names: `fix/<issue>`, `feat/<name>`.
- **Releases** are automated via Ship.js (`yarn release`); changelogs are generated from commits — don't hand-edit them.

## Keep these docs alive

If you discover something durable and non-obvious while working — a gotcha that cost you a debugging detour, a convention, a non-obvious file location, a cross-flavor constraint — **propose** adding it to the right doc (package `CLAUDE.md` if package-specific, this file if repo-wide, `.claude/rules/e2e.md` for e2e). Surface the proposed edit for the user to approve rather than editing silently. Bar: it must generalize beyond the current task (same bar as a good code comment) and not already be documented.

## Reference docs (read before relevant work — don't duplicate here)

- `CONTRIBUTING.md` — full process, commit/branch rules, package-import flow.
- `.claude/rules/e2e.md` — E2E testing (Playwright helpers, flavors, debugging).
- `.claude/skills/port-widget/` — adding a widget across all three flavors (the `/port-widget` skill).
- `tests/common/README.md` — shared cross-flavor test architecture.
- Per-package `CLAUDE.md` in `instantsearch.js`, `instantsearch-ui-components`, `react-instantsearch`, `vue-instantsearch` for package-specific layout.
