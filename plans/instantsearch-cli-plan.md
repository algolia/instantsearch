# Plan: InstantSearch CLI (POC)

> Source PRD: `plans/instantsearch-cli-prd.md` (companion design doc: `plans/instantsearch-cli-poc.md`)

## Architectural decisions

Durable decisions that apply across all phases:

- **Package location**: new sibling at `packages/instantsearch-cli/`, bin name `instantsearch`, npm scope `@algolia/instantsearch-cli`. POC stays unpublished; demo runs from the monorepo.
- **Module architecture** (six modules):
  - Deep: **Detector**, **Introspector**, **Generator**, **Manifest**.
  - Thin: **Command runner** (`commander` + `inquirer`), **JSON reporter**.
- **Command surface**: `init`, `add experience <name>`, `add widget <widget> --experience <name>`. Every command accepts `--json` + `--yes`. `--json` implies `--yes`.
- **Manifests**:
  - Root `instantsearch.json` (project-wide, written by `init`, `apiVersion: 1`).
  - Per-experience `<experience>/instantsearch.config.json` (index + schema + widget list, `apiVersion: 1`).
  - Merged at generation time.
- **Generator contract**: `(resolvedManifest) → Map<relativePath, fileContents>`. Pure function — no filesystem writes, no network.
- **Introspector contract**: `introspect({ appId, key, index }) → { records, facets, replicas, diagnostics }` with typed failure variants (`credentials_invalid`, `index_not_found`, `index_empty`, `index_has_no_facets`, `settings_forbidden`, `no_replicas`, `network_error`).
- **Error shape**: `{ ok: false, code, message }` paired with non-zero exit code. Machine-readable `code` always present.
- **Flavor matrix** (closed set for POC): React plain, React Next.js App Router, JS bundled (`instantsearch.js`). Anything else → `unsupported_framework`.
- **File philosophy**: CLI only writes new files. Never edits user code. Opaque widgets with no props. Semantic HTML, no class names. TypeScript when `tsconfig.json` is present, plain JS otherwise.
- **Widget catalog**: six — SearchBox, Hits, RefinementList, SortBy, Pagination, ClearRefinements. All require a provider in POC.
- **Templates**: one — `search`. Reserved names (`store-locator`, `autocomplete`, `chat`) not implemented.
- **Tooling**: `commander` for parsing, `inquirer` for prompts, Jest for tests (fixtures for Detector, mocked Algolia responses for Introspector, snapshots for Generator, round-trip for Manifest). Introspection helpers copy-pasted from `create-instantsearch-app` for POC.

---

## Phase 1: Package skeleton + `init` (React plain, TypeScript path)

**User stories**: 16, 17, 19, 20, 22

### What to build

Tracer bullet through every module. Establish the package at `packages/instantsearch-cli/`, wire Commander + Inquirer, and ship the `init` command end-to-end for the simplest flavor/framework combination (React plain + TypeScript).

Covers: Detector's React-plain signal path (reads `package.json`, `tsconfig.json`, `src/` layout, tsconfig `paths` aliases), Manifest writer for the root `instantsearch.json`, cred verification against Algolia with the search key, emission of `src/lib/algolia-client.ts`, and the JSON reporter skeleton emitting `{ ok, apiVersion, ... }` on success and `{ ok: false, code, message }` on failure.

Supports interactive + non-interactive modes from day one: `--yes --json` with flags (`--flavor`, `--framework`, `--app-id`, `--search-key`, `--components-path`) produces deterministic output. Ambiguous detection (unsupported framework, or multiple flavors present) fails with `unsupported_framework` and requires explicit flags.

Happy-path cred verification only; full Introspector failure taxonomy arrives in Phase 3. At this phase, invalid creds surface as `credentials_invalid` and nothing is written.

### Acceptance criteria

- [x] `packages/instantsearch-cli/` exists with bin `instantsearch`, runnable via `yarn workspace @algolia/instantsearch-cli start init` from the monorepo.
- [x] `instantsearch init` in a React+TS fixture detects the flavor/framework/TS signal, prompts for Algolia creds, verifies them with a test search call, and writes `instantsearch.json` + `src/lib/algolia-client.ts`.
- [x] `instantsearch init --yes --json --flavor react --framework react-plain --app-id ... --search-key ... --components-path src/components` runs non-interactively and emits a single JSON object with `apiVersion: 1`.
- [x] Invalid creds produce `{ ok: false, code: "credentials_invalid", message: ... }` on stdout, non-zero exit, no files written.
- [x] Unsupported or ambiguous framework produces `unsupported_framework` with a specific hint.
- [x] Detector unit tests cover: React-plain+TS, React-plain+JS, ambiguous, unsupported.
- [x] Manifest unit tests cover round-trip read → mutate → write → read.
- [x] JSON reporter unit tests cover success shape and error shape, both with `apiVersion`.

---

## Phase 2: `add experience` with structural widgets (React plain, TypeScript)

**User stories**: 1, 15, 23, 24

### What to build

Introduce the Generator module and extend Manifest with experience-level merge (root + per-experience config). Ship `add experience <name> --template search` for React plain + TypeScript with only the three structural widgets (SearchBox, Pagination, ClearRefinements) plus a provider — no index introspection yet.

The command creates the experience folder under `componentsPath`, writes the per-experience `instantsearch.config.json`, a provider file (React context around `<InstantSearch>`), one widget file per requested widget, and updates the root manifest's `experiences` array. Schema questions are skipped at this phase because none of the three widgets need attribute introspection; the user is prompted for (or supplies via flag) the index name only.

The command runner's `nextSteps` block returns the generated imports and a one-sentence mounting hint so an agent can finish wiring up the layout without further prompting.

### Acceptance criteria

- [x] `instantsearch add experience product-search --template search --index products` creates `src/components/product-search/` containing `instantsearch.config.json`, `provider.tsx`, `SearchBox.tsx`, `Pagination.tsx`, `ClearRefinements.tsx`. _(Phase 3 expanded `--template search` to additionally emit `Hits.tsx`, `RefinementList.tsx`, `SortBy.tsx`; all five originals still present.)_
- [x] Root `instantsearch.json` gains an entry in `experiences` pointing at the new folder.
- [ ] Running the same command with a generated provider in place in a minimal Vite + React + TS host renders a working SearchBox + Pagination + ClearRefinements against the configured index. _(Requires live Algolia creds — deferred to the Phase 8 acceptance recording gate.)_
- [x] `--yes --json` mode emits `filesCreated`, `manifestUpdated`, and a `nextSteps` block with imports + mounting guidance.
- [x] Generator snapshot tests cover each of the three widgets plus provider, for React + TS.
- [x] Manifest unit tests cover root + experience merge semantics.

---

## Phase 3: Introspection + schema-driven widgets (React plain, TypeScript)

**User stories**: 7, 8, 9, 10, 11, 12

### What to build

Introduce the Introspector module covering all three beats — records (search with `hitsPerPage: 1`, extract attributes + image heuristic), facets (search with `facets: '*'`), replicas (`getSettings`). Copy-paste the four helpers from `create-instantsearch-app` (`getInformationFromIndex`, `getAttributesFromIndex`, `getFacetsFromIndex`, `getPotentialImageAttributes`) and wrap them behind the Introspector facade with typed failure variants.

Add the three schema-driven widgets: Hits (prompts for title/image/description attributes), RefinementList (prompts for one facet attribute), SortBy (reads replicas or prompts on 403). Wire the full failure taxonomy into the command flow:

- `credentials_invalid` — refuse to proceed.
- `index_not_found` — list accessible indices and re-prompt (or error in `--yes`).
- `index_empty` — warn, fall back to manual schema entry.
- `index_has_no_facets` — warn, prompt for attribute anyway.
- `settings_forbidden` — fall back to manual replica entry for SortBy.
- `no_replicas` — warn, offer to skip SortBy.
- `network_error` — retry once, then error.

`--template search` now delivers the full six-widget experience against a real index with correct schema mapping on the first run.

#### Scope note: interactive prompts ~~deferred~~ done

Interactive prompts (inquirer flow) have been implemented. The `Prompter` abstraction (`src/prompter/`) wraps inquirer behind a testable interface. All seven failure-variant fallbacks (`index_not_found`, `index_empty`, `index_has_no_facets`, `settings_forbidden`, `no_replicas`, `credentials_invalid`, `network_error`) are handled interactively when `--yes`/`--json` is not set. In `--yes` mode these still surface as non-zero-exit report failures — the documented agent-mode behavior.

New flags on `add experience` for Phase 3:

- `--hits-title <attr>`, `--hits-image <attr>`, `--hits-description <attr>` (description optional)
- `--refinement-list-attribute <attr>`
- `--sort-by-replicas <comma-separated-list>`

### Acceptance criteria

- [x] `instantsearch add experience product-search --template search --index products --hits-title name --hits-image image_url --refinement-list-attribute brand --sort-by-replicas products_price_asc,products_price_desc --yes --json` generates `Hits.tsx`, `RefinementList.tsx`, `SortBy.tsx` with the correct attributes and types baked in.
- [x] Each failure variant produces the documented error code in `--json` mode. (Interactive fallback UX deferred — see scope note.)
- [ ] Against a real sandbox index (e.g., the Algolia ecommerce demo), a fresh `init` + `add experience` run (flag-driven) produces a working six-widget search page with no manual edits. _(Requires live Algolia creds — deferred to the Phase 8 acceptance recording gate.)_
- [x] Introspector unit tests cover each success beat and every failure variant with mocked Algolia responses.
- [x] Generator snapshot tests extend to Hits/RefinementList/SortBy variants parameterized on schema.

---

## Phase 4: Plain-JS output path (React flavor, no `tsconfig.json`)

**User stories**: 4

### What to build

Extend the Generator with a plain-JavaScript output variant for the React flavor. Every widget and the provider gain a `.jsx` / `.js` emission path producing code with the same shape as the TypeScript version minus annotations — no JSDoc typedefs, no type imports, just idiomatic JS.

Detector's `typescript: false` signal (no `tsconfig.json`) routes generation to the JS variants. Everything else (introspection, manifest, command flow) is unchanged.

### Acceptance criteria

- [x] `instantsearch init` in a React+JS fixture (no `tsconfig.json`) writes `src/lib/algolia-client.js` and a root manifest with `"typescript": false`.
- [x] `add experience` in that project emits `.jsx` / `.js` files for all six widgets + provider, matching the TypeScript variant's structure but without types.
- [ ] A minimal Vite + React (no TS) host renders the same working search page as the TS path. _(Requires live Algolia creds + host app — deferred to the Phase 8 acceptance recording gate, consistent with Phase 2/3.)_
- [x] Generator snapshots cover the JS variants for every widget + provider.

---

## Phase 5: Next.js App Router flavor

**User stories**: 2

### What to build

Teach the Detector to recognize Next.js App Router: `react-instantsearch-nextjs` in `package.json` plus an `app/` directory. Add the `InstantSearchNext` + `'use client'` provider variant to the Generator. Widget files remain the same as the React-plain path — only the provider changes.

Handle the Next.js ambiguity case (project has both `app/` and `pages/`) by refusing to guess and requiring an explicit `--framework` flag, surfaced as an unsupported-framework-style error with a specific message.

This phase lights up the PRD's headline use case — a working search page in an existing Next.js App Router app from two commands.

### Acceptance criteria

- [x] `instantsearch init` in a Next.js App Router + TS fixture detects the App Router and writes the root manifest with `"framework": "nextjs"`.
- [x] `add experience product-search --template search` emits a provider using `InstantSearchNext` with `'use client'` at the top.
- [ ] The generated output in an existing Next.js App Router host renders a working search page when the provider is mounted. _(Requires live Algolia creds + host app — deferred to the Phase 8 acceptance recording gate, consistent with Phase 2/3/4.)_
- [x] Projects with both `app/` and `pages/` fail with a specific ambiguity error; explicit `--framework` flag lets the user proceed.
- [x] Detector and Generator tests extend to cover the Next App Router variant.

---

## Phase 6: JS (`instantsearch.js`) flavor

**User stories**: 5

### What to build

Add the parallel generator track for the JS flavor. Detector recognizes `instantsearch.js` in `package.json`. Generator emits widget factories that take a container selector, and a provider file holding the `instantsearch()` instance with `addWidgets` / `start` orchestration.

Introspection is identical to the React path (same Algolia index, same helpers). Manifest and command surfaces are identical. Only the emitted file shape differs.

Covers the second acceptance flow from the PRD (JS bundler, e.g., Rails + esbuild or a Vite-bundled JS app).

### Acceptance criteria

- [x] `instantsearch init` in a JS-flavor fixture (`instantsearch.js` in deps, no React) detects `flavor: "js"` and writes the root manifest accordingly.
- [x] `add experience product-search --template search` emits a provider (`provider.js` with the `instantsearch()` instance) plus six widget factories wired to container selectors.
- [ ] A minimal Vite-bundled JS host using the generated output renders a working search page. _(Requires live Algolia creds + host app — deferred to the Phase 8 acceptance recording gate, consistent with Phase 2/3/4/5.)_
- [x] Generator snapshots cover every widget in the JS variant.
- [x] Introspector tests are reused without duplication.

---

## Phase 7: Incremental `add widget` + auto-suffixing + file conflict errors

**User stories**: 13, 14, 21

### What to build

Harden the incremental and multi-experience flows:

- `add widget <widget> --experience <name>` auto-suffixes repeated widgets by their attribute: `RefinementListBrand.tsx`, `RefinementListCategory.tsx`, etc. The per-experience `instantsearch.config.json` tracks the expanded list.
- Running `add widget` against a non-existent experience auto-materializes the experience inline (interactive prompts for index + introspection; `--yes` mode requires `--index` or errors with `index_required`).
- Running `add experience` twice on the same project produces two independent experiences, each with its own provider and index.
- Any command that would overwrite an existing generated file errors with a clear `file_conflict` code and non-zero exit. No `--overwrite` flag — post-POC.

### Acceptance criteria

- [x] `add widget refinement-list --experience product-search` invoked twice (different facets) produces two differently-named files without overwriting the first.
- [x] `add widget hits --experience docs-search` where `docs-search` doesn't exist creates the experience inline, prompts for index + schema, and emits provider + Hits. _(Flag-driven path only; interactive prompting deferred per the Phase 3 scope note.)_
- [x] Two successive `add experience` commands in the same project yield two folders with independent providers and indices; both render when mounted side-by-side. _(File creation + independent providers verified; render-time check shares the Phase 8 acceptance recording gate.)_
- [x] Re-running a command that would overwrite any existing generated file errors with `{ code: "file_conflict", ... }`, non-zero exit, nothing changed on disk.
- [x] `--yes` without `--index` on an auto-materializing `add widget` errors with `index_required`.

---

## Phase 8: Agent surface hardening + acceptance demo recording

**User stories**: 6, 16, 17, 18, 19

### What to build

Final audit of the agent-facing surface and the POC acceptance gate:

- Every interactive question has a corresponding flag (e.g., `--hits-title`, `--hits-image`, `--refinement-list-attribute`, `--sort-by-replicas`, `--widgets`) so `--yes --json` runs are fully deterministic.
- Every error path emits a machine-readable `code`. Stderr stays silent under `--json`; all command-relevant output goes to stdout.
- Success payloads include a `nextSteps` block with `imports` and a one-sentence `mountingGuidance`.
- Stable exit codes: 0 on success, non-zero on any error. `ok: false` in JSON always paired with non-zero exit.
- Unsupported-flavor error message includes an install hint ("Run `npm install react-instantsearch` first.").

Acceptance gate: record the two end-to-end flows from the PRD.

- **Flow A — Next.js App Router**: `init` + `add experience product-search --template search` against a real Algolia index. Recording shows prompts, file creation, and a working search page in the host app.
- **Flow B — JS bundler**: same two commands against a JS-flavor host. Recording shows the same outcome with `.js` widget factories and an `instantsearch()` provider.

If both flows work end-to-end in the recording, the POC is done.

### Acceptance criteria

- [x] Flag parity: a walkthrough table in the README or design doc lists every interactive prompt and its equivalent flag. `--yes --json` with all flags set produces deterministic, no-prompt runs for both `init` and `add experience`. _(Table added to design doc `plans/instantsearch-cli-poc.md` under "Flag parity".)_
- [x] Every documented error code in the failure taxonomy appears in the `--json` output when triggered, with a non-zero exit. _(Covered by introspector + cli unit tests; `cli-surface.test.ts` additionally covers `missing_required_flag`, `unsupported_framework`, `not_initialized`, `unknown_command`, and `commander.unknownOption` end-to-end through the CLI binary.)_
- [x] `nextSteps.imports` + `nextSteps.mountingGuidance` present on every success payload for `add experience` and `add widget`.
- [x] Stderr is empty under `--json` on both success and failure. _(Enforced by `cli-surface.test.ts`, which spawns the CLI binary and asserts empty stderr across five failure variants.)_
- [ ] Recording of Flow A exists, exercised against a real Algolia index, and the host app renders a working search page without manual edits.
- [ ] Recording of Flow B exists, same criteria.
