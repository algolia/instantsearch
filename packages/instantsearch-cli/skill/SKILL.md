---
name: add-search
description: Add Algolia InstantSearch to the current project using the InstantSearch CLI. Use when the user asks to add search, build a search page, integrate Algolia, or add InstantSearch widgets. This skill drives the CLI for scaffolding, then does what the CLI can't, such as mounting components, styling, layout, and wiring everything into the existing app.
---

# Add Search with the InstantSearch CLI

You have access to the `instantsearch` CLI. It scaffolds correctly-wired InstantSearch widget files into this project. Your job is to drive the CLI, then go further: mount the generated components, style them, and integrate them into the app's layout and routing.

## Division of labor

| The CLI handles (deterministic) | You handle (contextual) |
| --- | --- |
| Detecting flavor/framework/TypeScript | Choosing where search lives in the app |
| Verifying Algolia credentials | Mounting the provider in the root layout |
| Introspecting the Algolia index (records, facets, replicas) | Mounting the generated feature component on a page/route |
| Generating shared provider, widget wrappers, assembled index file | Styling and layout (CSS, Tailwind, design system) |
| Writing `instantsearch.json` and feature config | Editing existing files (imports, routing, navigation links) |
| Installing missing InstantSearch packages | Building the product tile / hit card beyond the basic scaffold |
|  | Adding responsive design, loading states, empty states |

The CLI never edits existing user files. That is your job.

## Workflow

### 1. Gather information

Before running any CLI commands, you need:

- **Algolia credentials**: app ID and search-only API key. Check `.env`, `.env.local`, or ask the user. Never use an admin key with the CLI.
- **Index name**: ask the user or look for existing Algolia usage in the codebase.

### 2. Run the CLI

Always use `--json --yes` so you get structured output and no interactive prompts.

**IMPORTANT: Always run `npx instantsearch <command> --help` before running a command for the first time.** Flag names differ between commands and may not match what you'd guess from Algolia docs. Do not assume flag names — check `--help` output first to avoid wasted attempts.

Run the three commands in order (skip `init` if `instantsearch.json` already exists):

1. **`npx instantsearch init --help`**, then **`npx instantsearch init`** — initializes the project, writes `instantsearch.json`, generates the shared search client and provider (`algolia-client.ts` and `algolia-provider.tsx`), installs packages.
2. **`npx instantsearch introspect --help`**, then **`npx instantsearch introspect`** — discovers attributes, facets, and replicas for the target index.
3. **`npx instantsearch add --help`**, then **`npx instantsearch add search`** — scaffolds the widget files for a search feature and an autocomplete component.

Use the introspect output to understand what the index contains, then use your judgment to pick the best values for the `add search` flags.

**Autocomplete:** `add search` automatically generates an `Autocomplete` component in `components/autocomplete/` alongside the search feature. It uses `EXPERIMENTAL_Autocomplete` from `react-instantsearch`, wired to the feature's index with a default item template based on the hits schema. If an autocomplete already exists (e.g., from a previous `add search`), it is left untouched. **Autocomplete replaces SearchBox** — never render both. When mounting, place Autocomplete in the site header/layout and do not mount the SearchBox component.

**Multiple RefinementLists:** `--refinement-list-attribute` accepts comma-separated values (e.g. `--refinement-list-attribute brand,category,color`). Each attribute generates its own suffixed widget file (`RefinementListBrand.tsx`, `RefinementListCategory.tsx`, etc.). Use introspect's facets output to pick the most useful facets for the search experience.

If a field has no viable options (e.g., no replicas, no facets), simply omit the corresponding schema flag. The CLI automatically skips widgets whose required schema flags are not provided — omit `--sort-by-replicas` to skip SortBy, omit `--refinement-list-attribute` to skip RefinementList.

**Error recovery:** If `ok` is `false`, the `code` and `message` fields explain the problem and what to do next.

### 3. Mount the provider, autocomplete, and search feature

After the CLI succeeds, **you** must:

1. **Mount the shared provider.** `init` generates `AlgoliaProvider` in `src/lib/algolia-provider.tsx`. Wrap your app with it high in the component tree:
   - Next.js App Router: wrap children in `app/layout.tsx` with `<AlgoliaProvider>`.
   - Plain React: wrap your app root (e.g., in `main.tsx` or `App.tsx`) with `<AlgoliaProvider>`.
2. **Mount the autocomplete.** `add search` generates `Autocomplete` in `components/autocomplete/Autocomplete.tsx`. Render it in the site header or layout — it's site-wide, not page-specific. It must be inside `<AlgoliaProvider>`.
3. **Read `nextSteps` from the JSON response.** It contains the exact import statement and mounting guidance for the search feature.
4. **Create or edit a page/route** to render the search feature:
   - Next.js App Router: create `app/search/page.tsx` importing the generated component.
   - Plain React: add a route in your router or import into an existing page.
5. **Add navigation** to the search page (nav link, header search icon, etc.).

### 4. Style the experience

The generated widgets use semantic HTML with no styling. Style them using whatever approach the project uses (Tailwind, CSS modules, styled-components, design system).

**Use the same styling approach for every component.** If the project uses a utility-first CSS framework (Tailwind, UnoCSS, etc.), use the `classNames` prop on InstantSearch widgets where available. Before styling a widget, read its source in `react-instantsearch` to discover which elements support `classNames` and which use hardcoded `ais-*` CSS classes. For elements only reachable via `ais-*` classes, target them in CSS — this is expected, not a workaround.

Focus especially on the **hit card** (`Hit` component inside `Hits.tsx`). The CLI generates a minimal `<article>` with title and image. Enhance it to match the project's design: price formatting, badges, ratings, hover states, responsive grid layout.

### 5. Polish

Go beyond the scaffold:

- Add a page title and description.
- Lay out filters (RefinementLists) in a sidebar.
- Add responsive behavior (filters in a drawer on mobile).
- Add a loading skeleton or `<Suspense>` boundary.
- Add an empty state for zero results.

## Important rules

- **Always use `--json --yes`** when calling the CLI. Never run it interactively.
- **Always introspect before `add search`.** Don't guess attribute names or retry in a loop.
- **Parse the JSON response** and use `nextSteps` to guide your integration work.
- **Never regenerate files the CLI already created.** Edit them instead. The user owns these files.
- **Don't replace bootstrapped widgets with hooks.** The CLI generates thin wrappers (e.g., `<InstantSearchSearchBox />`) intentionally. Never rewrite them to use hooks like `useSearchBox()` — that replaces a clean scaffold with a reimplementation of the library widget. Customize the wrapper, don't replace it.
- **Don't remove `<Index>` from the generated experience.** The CLI wraps widgets in an `<Index indexName="...">` component — this is required. The shared provider has no `indexName` on purpose; each feature targets its index via `<Index>`. Never remove the `<Index>` wrapper or move `indexName` onto the provider.
- **Don't duplicate what the CLI does.** Don't manually create provider files, don't manually wire up `algoliasearch`, don't query Algolia APIs directly.
- **Do the things the CLI can't.** Mount the provider, mount components, edit routes, add styling, build rich product tiles, wire up navigation. That's your value.
- **Don't start the dev server, open a browser, or fetch from localhost.** After making changes, run the type checker to verify correctness and ask the user to verify the result in their browser.
- **Check `ok` before proceeding.** If the CLI returns `ok: false`, diagnose and fix before moving on.
