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
| Verifying Algolia credentials | Mounting the generated component in a page/route |
| Introspecting the Algolia index (records, facets, replicas) | Styling and layout (CSS, Tailwind, design system) |
| Generating provider, widget wrappers, assembled index file | Editing existing files (imports, routing, navigation links) |
| Writing `instantsearch.json` and experience config | Building the product tile / hit card beyond the basic scaffold |
| Installing missing InstantSearch packages | Adding responsive design, loading states, empty states |

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

1. **`npx instantsearch init --help`**, then **`npx instantsearch init`** — initializes the project, writes `instantsearch.json`, installs packages.
2. **`npx instantsearch introspect --help`**, then **`npx instantsearch introspect`** — discovers attributes, facets, and replicas for the target index.
3. **`npx instantsearch add experience --help`**, then **`npx instantsearch add experience`** — scaffolds the widget files.

Use the introspect output to understand what the index contains, then use your judgment to pick the best values for the `add experience` flags.

**Multiple RefinementLists:** `--refinement-list-attribute` accepts comma-separated values (e.g. `--refinement-list-attribute brand,category,color`). Each attribute generates its own suffixed widget file (`RefinementListBrand.tsx`, `RefinementListCategory.tsx`, etc.). Use introspect's facets output to pick the most useful facets for the search experience.

If a field has no viable options (e.g., no replicas, no facets), simply omit the corresponding schema flag. The CLI automatically skips widgets whose required schema flags are not provided — omit `--sort-by-replicas` to skip SortBy, omit `--refinement-list-attribute` to skip RefinementList.

**Error recovery:** If `ok` is `false`, the `code` and `message` fields explain the problem and what to do next.

### 3. Mount the component

After the CLI succeeds, **you** must:

1. **Read `nextSteps` from the JSON response.** It contains the exact import statement and mounting guidance.
2. **Create or edit a page/route** to render the search experience:
   - Next.js App Router: create `app/search/page.tsx` importing the generated component.
   - Plain React: add a route in your router or import into an existing page.
   - JS flavor: import the entry point in your JS bundle and add container `<div>` elements.
3. **Add navigation** to the search page (nav link, header search icon, etc.).

### 4. Style the experience

The generated widgets use semantic HTML with no styling. Style them using whatever approach the project uses (Tailwind, CSS modules, styled-components, design system).

Focus especially on the **hit card** (`Hit` component inside `Hits.tsx`). The CLI generates a minimal `<article>` with title and image. Enhance it to match the project's design: price formatting, badges, ratings, hover states, responsive grid layout.

### 5. Polish

Go beyond the scaffold:

- Add a page title and description.
- Lay out filters (RefinementLists) in a sidebar, search box in a header.
- Add responsive behavior (filters in a drawer on mobile).
- Add a loading skeleton or `<Suspense>` boundary.
- Add an empty state for zero results.

## Important rules

- **Always use `--json --yes`** when calling the CLI. Never run it interactively.
- **Always introspect before `add experience`.** Don't guess attribute names or retry in a loop.
- **Parse the JSON response** and use `nextSteps` to guide your integration work.
- **Never regenerate files the CLI already created.** Edit them instead. The user owns these files.
- **Don't replace bootstrapped widgets with hooks.** The CLI generates thin wrappers (e.g., `<InstantSearchSearchBox />`) intentionally. Never rewrite them to use hooks like `useSearchBox()` — that replaces a clean scaffold with a reimplementation of the library widget. Customize the wrapper, don't replace it.
- **Don't duplicate what the CLI does.** Don't manually create provider files, don't manually wire up `algoliasearch`, don't query Algolia APIs directly.
- **Do the things the CLI can't.** Mount components, edit routes, add styling, build rich product tiles, wire up navigation. That's your value.
- **Check `ok` before proceeding.** If the CLI returns `ok: false`, diagnose and fix before moving on.
