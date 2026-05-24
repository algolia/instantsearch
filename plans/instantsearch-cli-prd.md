# InstantSearch CLI — POC PRD

> Companion to the design doc at `plans/instantsearch-cli-poc.md`. The design doc is the source of truth for locked decisions and sample artifacts; this PRD frames the problem, user experience, and module/test architecture at the level a reviewer needs.

## Problem Statement

Most Algolia customers don't start apps from scratch — they have an existing codebase and want to add search to it. Today, the only first-party scaffolder is `create-instantsearch-app`, which generates whole applications. That tool is a poor fit for the common case.

From an existing-app developer's perspective, adding InstantSearch widgets today means:

- Reading documentation to figure out which widget package and which import matches their framework (React? Next App Router? plain JS? a bundler?).
- Knowing their index shape: which attributes exist on records, which ones are configured as facets, which replica indices are available for sorting.
- Hand-wiring widget props — `attribute="brand"`, `hitComponent={MyHit}`, `items={[{ label: 'Price asc', value: 'products_price_asc' }]}` — against that schema.
- Deciding how to mount `<InstantSearch>`/`instantsearch()` in their existing layout without stepping on their router, styling system, or data-fetching patterns.

The second and third steps are mechanical busywork: there is a right answer the machine could compute. The first step is mechanical too — the right import depends only on what's in `package.json`. Only the mounting/styling step is genuinely subjective.

AI coding agents magnify this gap. An agent asked "add search to this app" can guess at imports and widget props, but without introspecting the live Algolia index it has no way to produce correctly-schema-mapped widgets on the first try. The iteration loop becomes: agent writes widgets, user runs app, widgets display nothing or wrong fields, user debugs, agent tries again.

## Solution

A CLI — `instantsearch` — that installs and pre-configures InstantSearch widgets into an existing project. Halfway between `shadcn` and `create-instantsearch-app`: instead of scaffolding a project, it scaffolds widgets into an existing one.

The tool handles the deterministic parts (flavor detection, import selection, schema mapping via live index introspection) and stays out of the subjective parts (styling, layout, mount location). Generated files are opaque components the user owns and edits — no props to pass, no API to learn.

Two user-facing concepts:
- **Widget** — a single UI primitive installed as one file.
- **Experience** — a named folder grouping related widgets, optionally scaffolded from a curated **template** (`--template search`).

Three commands: `init` (once per project), `add experience` (bulk), `add widget` (incremental). All commands accept `--json` + `--yes` for non-interactive invocation by AI agents.

The CLI never edits user files. It only writes new files. Mounting the provider, routing, styling, and layout decisions are left to the human or the agent driving the tool.

## User Stories

### Primary — existing-app developers

1. As a React developer with an existing Vite app, I want to install a working SearchBox + Hits pair without reading widget prop docs, so that I can focus on where in my layout to place them rather than how to wire them up.
2. As a Next.js App Router developer, I want the CLI to detect my framework and generate a provider that uses `InstantSearchNext` with `'use client'`, so that I don't have to discover the Next-specific InstantSearch package by trial and error.
3. As a developer using TypeScript, I want generated widgets to be fully typed against my record shape, so that my IDE catches schema mismatches at compile time.
4. As a developer using plain JavaScript, I want the CLI to generate plain `.js`/`.jsx` files with no JSDoc typedef noise, so that the generated code matches the style of the rest of my codebase.
5. As a Rails developer with `instantsearch.js` bundled through esbuild, I want the same CLI surface as a React developer, so that my team doesn't have to learn two different tools for the same product.
6. As a developer with an unusual setup (Astro, Qwik, Vue, importmap-rails, UMD), I want the CLI to fail loudly with an explicit error, so that I know to set things up manually rather than getting half-broken generated code.

### Introspection-driven configuration

7. As a developer installing Hits, I want the CLI to read one record from my index and ask me which attribute is the title and which is the image, so that the generated component displays real data the first time I run it.
8. As a developer installing RefinementList, I want the CLI to read my index's configured facets and ask me which one to use, so that I don't have to remember which attributes I set up as `attributesForFaceting` months ago.
9. As a developer installing SortBy, I want the CLI to read my index's replicas and pre-fill the sort options, so that the generated `SortBy` works immediately against my existing replica configuration.
10. As a developer whose search API key lacks the `settings` ACL, I want the SortBy replica step to gracefully fall back to manual entry, so that a restricted key doesn't block me entirely.
11. As a developer with an empty index, I want a clear warning plus a manual schema-entry fallback, so that I can still scaffold widgets to iterate against locally.
12. As a developer who mis-typed their index name, I want to see a list of accessible indices and re-pick, so that I don't have to abort and re-run `init`.

### Incremental & multi-experience

13. As a developer who wants to filter by both `brand` and `category`, I want to run `add widget refinement-list` twice and get two differently-named files (auto-suffixed by attribute), so that I don't overwrite the first one or have to name files myself.
14. As a developer building both a product search and a docs search in the same app, I want to create two separate experiences each with its own provider and index, so that they run independently on the same page or on different pages.
15. As a power user, I want to run `add widget hits --experience product-search` even if `product-search` doesn't exist yet and have the experience materialize inline, so that I can build up my search UI widget-by-widget without committing to a template upfront.

### Agent-driven (non-interactive)

16. As an AI agent asked "add search to this app," I want to pass all inputs as flags plus `--yes --json`, so that I can drive the tool deterministically without a TTY.
17. As an AI agent, I want stable exit codes plus machine-readable error `code` strings alongside human `message`s, so that I can branch on specific failure modes (invalid creds vs. missing index vs. unsupported framework).
18. As an AI agent, I want the success output to include a `nextSteps` block listing imports and mounting guidance, so that I can perform the one remaining subjective step (placing the provider in the user's layout) without re-asking the user.
19. As an AI agent, I want `apiVersion` on every JSON payload, so that my parsing logic can evolve alongside the CLI without silently breaking.

### Safety & recovery

20. As a developer running `init`, I want the CLI to verify my Algolia credentials with a test call before writing any files, so that I don't end up with a stale manifest pointing at invalid creds.
21. As a developer re-running a command, I want a clear error when a generated file would be overwritten, so that I don't lose manual edits I've made to owned widget files.
22. As a developer on a project with both `app/` and `pages/` (Next.js) or both JS setups (Rails), I want the CLI to refuse to guess and require an explicit `--framework` flag, so that I don't get generated code for the wrong runtime.

### Discoverability

23. As a developer evaluating the CLI, I want a single `--template search` flag to install all six default widgets pre-wired, so that I can see a working search page within one command.
24. As a developer who installed a widget and wants to know how to mount it, I want the CLI to print (or return in JSON) the import paths and a one-sentence mounting hint, so that I don't have to grep through a generated folder to figure out what to do next.

## Implementation Decisions

### Architecture — six modules

The POC decomposes into six modules. Four are "deep" (encapsulate non-trivial logic behind a small interface) and two are thin orchestration layers.

**Deep modules:**

- **Detector** — inspects the project's `package.json`, `tsconfig.json`, and filesystem layout. Returns a normalized `{ flavor, framework, typescript, componentsPath, aliases }` struct plus a list of detection signals (for surfacing to the user for confirmation). Pure functions over a filesystem seam.
- **Introspector** — wraps the Algolia-index discovery path behind one facade: `introspect({ appId, key, index }) → { records, facets, replicas, diagnostics }` with typed failure variants (`credentials_invalid`, `index_not_found`, `index_empty`, `settings_forbidden`, etc.). Encapsulates the three introspection beats (records, facets, replicas) and their individual fallback rules.
- **Generator** — given a resolved manifest (flavor, framework, typescript flag, schema mapping, widget list) returns an in-memory map of `{ relativePath → fileContents }`. No filesystem writes, no network. One generator per widget × flavor combination, keyed into a lookup table.
- **Manifest** — reads, writes, and merges the two manifest files (root `instantsearch.json` and per-experience `instantsearch.config.json`). Exposes typed accessors; hides JSON parsing and filesystem I/O.

**Thin modules:**

- **Command runner** — the `commander` + `inquirer` surface. Declares the three commands, their flags, and the interactive prompt flow. Orchestrates Detector → Introspector → Generator → Manifest in sequence. Stays small by pushing logic down into the deep modules.
- **JSON reporter** — shapes success/error objects for `--json` mode. Owns the `apiVersion` constant and the `ok: false` shape.

### Principles

- **Deterministic vs. subjective.** The CLI handles decisions with a computable right answer (schema mapping, import selection, framework detection). It stays out of subjective decisions (styling, class names, layout, mount location).
- **New files only.** The CLI never edits existing user code. Layouts, entry files, and CSS imports are untouched.
- **Opaque widgets.** Generated components take no props. Customization happens by editing the generated file.
- **Semantic HTML, unstyled.** No class names, no design-system detection, no Tailwind detection.
- **Same shape across flavors.** A React wrapper and a JS widget factory produce files with the same intent — named local components, typed record declarations at the top, no boilerplate comments — differing only in runtime substrate.
- **TypeScript when detected, plain JS otherwise.** Never mixed, never forced.

### Command surface

Three commands: `init`, `add experience <name>`, `add widget <widget> --experience <name>`. `init` runs once per project; `add widget` without a matching experience auto-creates the experience inline (interactive mode prompts for inputs, `--yes` mode requires them as flags).

Every command accepts `--json` (implies `--yes`) and emits a structured payload with `apiVersion`. Errors surface as `{ ok: false, code, message }` paired with a non-zero exit code.

### POC scope constraints

- **Flavors:** React (plain + Next.js App Router) and JS (bundled via any ESM-capable setup). Vue, Pages Router, importmap-rails, UMD, Astro, Qwik explicitly excluded.
- **Templates:** one — `search`. (`store-locator`, `autocomplete`, `chat` are reserved names for post-POC.)
- **Widgets:** six — SearchBox, Hits, RefinementList, SortBy, Pagination, ClearRefinements. Three use schema introspection; three are structural.
- **Provider model:** all six widgets require a provider in POC. Standalone widgets (the "no provider needed" path) are post-POC.
- **Authentication:** search API key only. Admin/write-key introspection deferred.

### Monorepo & distribution

- New sibling package under `packages/`, following the existing yarn workspaces + Lerna layout. No root config changes required (the `packages/*` glob auto-discovers).
- Shares introspection helpers with `create-instantsearch-app` by **copy-paste** for POC. The four helpers (`getInformationFromIndex`, `getAttributesFromIndex`, `getFacetsFromIndex`, `getPotentialImageAttributes`) are already pure and extraction-ready; a proper shared-internal-package extraction is post-POC.
- Reuses the existing CLI stack: `commander` for command parsing, `inquirer` for interactive prompts, Jest for tests.
- POC stays **unpublished**. Demo runs locally from the monorepo. Publishing happens once the API stabilizes.

### Relationship to `create-instantsearch-app`

Two tools, coexist. `create-instantsearch-app` scaffolds new projects; this CLI installs widgets into existing ones. Not merged, not replaced.

## Testing Decisions

### What makes a good test here

Each module's tests should verify externally-visible behavior, not internal representation:

- **Detector** — given a fixture filesystem, does it return the correct normalized struct? Not: does it call `fs.readFileSync` in the expected order.
- **Introspector** — given mocked Algolia responses, does it return the right typed success or failure variant? Not: does it construct the Algolia client a specific way.
- **Generator** — given a manifest, does the emitted file map contain the expected file paths and the expected imports/types/JSX? Not: does it use string templates vs. AST builders.
- **Manifest** — given a root + experience merge scenario, does the merged result match? Not: does it parse JSON with a specific library.

### Modules to test in POC

Four of the six modules have unit test coverage:

- **Detector** — fixture-based tests over mock `package.json` + filesystem shapes, one per supported flavor/framework combination plus the ambiguous and unsupported cases.
- **Introspector** — mocked Algolia responses covering the success path for each of the three beats plus every entry in the failure taxonomy (`credentials_invalid`, `index_not_found`, `index_empty`, `index_has_no_facets`, `settings_forbidden`, `no_replicas`, `network_error`).
- **Generator** — snapshot tests per widget × flavor × TS/JS combination. Snapshots are the right tool here: the generator's output is text, it should change rarely, and diffs are the clearest signal when it does.
- **Manifest** — round-trip tests (read → mutate → write → read) and merge tests (root + experience merge produces expected resolved config).

The two thin modules (Command runner, JSON reporter) are not tested in POC. They orchestrate the deep modules and have minimal logic of their own; testing them would overlap heavily with the deep-module tests. Post-POC, a small integration smoke test of each command in `--yes --json` mode would be sufficient coverage.

### Acceptance gate — live recording

Unit tests verify correctness of the pieces. The acceptance gate for POC completion is a live demo, recorded end-to-end, exercising both flavor flows against a real Algolia index:

- **Flow A — Next.js App Router.** `init` detects framework and TypeScript, verifies creds, writes root manifest + Algolia client. `add experience product-search --template search` prompts through index + schema questions, writes a full experience folder with a Next-specific provider and six typed widgets. App renders a working search page.
- **Flow B — JS bundler flavor.** Same two commands against a project with `instantsearch.js` in `package.json`. Generated output is plain JS widget factories and an `instantsearch()`-based provider. App renders a working search page.

If both flows work end-to-end in the recording, POC is done.

### Prior art

The existing `create-instantsearch-app` package uses Jest with mocked Algolia responses for its introspection helpers. Tests live alongside source in `__tests__/` folders. This is the pattern to follow for the Introspector module; the Detector and Manifest modules follow the same unit-with-fixtures style; the Generator module adds Jest snapshot tests on top.

## Out of Scope

### Out of scope for the POC (deferred to post-POC work)

- Vue flavor support.
- Next.js Pages Router, importmap-rails, UMD, Astro, Qwik, and any other flavor/framework not explicitly enumerated.
- Additional templates beyond `search`: `store-locator`, `autocomplete`, `chat`.
- Standalone widgets (the "self-contained, no provider" path), which unlocks autocomplete and chat templates.
- Tier-3 widgets: Stats, HitsPerPage, CurrentRefinements, HierarchicalMenu, RangeInput/RangeSlider, GeoSearch, ToggleRefinement, InfiniteHits, Configure.
- Multi-locale attribute handling (`title.en`, `title.fr`).
- Multi-record sampling for sparse datasets (POC samples one record).
- Admin/write-key introspection (e.g., reading replica settings when the search key lacks the `settings` ACL, via a `.env` pattern).
- `--overwrite` flag with full `shadcn`-style prompt/skip semantics. POC errors on any file conflict.
- `--add-css-import` opt-in for appending the library's CSS import to the app entry.
- File-based routing hooks (e.g., generating a new route file for Next.js App Router or Nuxt).
- MCP server wrapping the CLI.
- Programmatic JS API (`import { addExperience } from '@algolia/instantsearch-cli/lib'`).
- Extracting the shared introspection helpers into a dedicated internal package. POC uses copy-paste.
- Streaming progress events (NDJSON). POC emits a single final JSON object.
- Unscoped `instantsearch` npm alias for shorter `npx` invocation.
- Publishing to npm. POC stays unpublished and runs from the monorepo.

### Explicitly outside the product's intent (not just this POC)

- The CLI never edits user files. Layouts, entry files, and CSS imports remain untouched in all versions.
- The CLI never generates styling (class names, Tailwind utilities, CSS modules). That remains user or agent territory permanently.
- The CLI never replaces `create-instantsearch-app`. The two tools coexist.

## Further Notes

- Full locked-decisions table, sample generated code, error taxonomy, and auto-detection signal table live in the design doc at `plans/instantsearch-cli-poc.md`.
- POC authored and reviewed by a single owner. No external stakeholder sign-off gate; acceptance is the live recording.
- Post-POC milestones (second template, publication to npm, shared helpers extraction) are explicitly not scoped here. A follow-up doc sequences them once the POC feedback cycle has run.
