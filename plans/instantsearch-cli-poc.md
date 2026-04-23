# InstantSearch CLI — POC Design

## Problem

`create-instantsearch-app` scaffolds whole applications from scratch. Most Algolia customers don't build apps from scratch — they have an existing app and want to add search to it. Adding InstantSearch widgets to an existing app is cumbersome: users need to know what props each widget expects, what data is available in their records, and how to map attributes to UI elements.

A CLI that installs and pre-configures widgets — introspecting the customer's Algolia index to map attributes, picking the right imports for the detected framework, and emitting opaque components the user owns — compresses a tedious manual step into a single command. Half way between `shadcn` and `create-instantsearch-app`: instead of scaffolding a project, it scaffolds widgets into an existing one. Can be driven by a human interactively or by an AI agent through `--json` + `--yes`.

## Resting model

Two user-facing concepts. One implementation detail.

| Concept | Role |
|---|---|
| **Widget** | A single UI primitive installed as a file. Some need a provider; some are self-contained. |
| **Experience** | A named folder grouping related widgets. Built incrementally (widget-by-widget) or installed in one shot from a **template** (a curated recipe — Algolia's opinion about what goes together). |
| _Provider_ (internal) | The `<InstantSearch>` context / JS `instantsearch()` instance. Created inside an experience folder when a widget that needs one is installed. Users don't see or manage it directly. |

**Relationships**
- Widgets that need a provider attach to one *by reference*, not by membership in an "experience."
- An experience is the convenience packaging: it creates a provider and attaches widgets to it.
- Templates are Algolia-curated compositions (POC ships `search`).

## Core principle

**Deterministic vs. subjective.** If a decision has a right answer the CLI can compute (schema mapping, correct provider import for the detected framework, correct package for the flavor), the CLI handles it. If a decision is subjective or codebase-contextual (styling, layout, where to mount, design system, className conventions), the CLI stays out — that's agent territory.

Applied twice already: (1) the CLI never edits user files, only writes new ones; (2) the CLI never generates styling.

## POC scope

### Flavors

- **React**: plain (Vite/CRA/Remix) + Next.js App Router (detected — uses `InstantSearchNext` from `react-instantsearch-nextjs` + `'use client'`)
- **JS**: `instantsearch.js` with a bundler (esbuild/Vite/Webpack — any ESM-capable setup)
- Skipped: Vue, Pages Router, importmap-rails, UMD, Astro, Qwik

### Templates

- One: `--template search` (the classic search page recipe)
- Reserved: `store-locator`, `autocomplete`, `chat` (future)

### Widget catalog

Six widgets, three with introspection, three structural:

| Widget | Introspection | Demo role |
|---|---|---|
| Hits | Records → pick title/image/etc. attributes | Showcase |
| RefinementList | Facets → pick attribute | Showcase |
| SortBy | Replicas → pick available sorts | Showcase |
| SearchBox | None | Plumbing |
| Pagination | None | Plumbing |
| ClearRefinements | None | Polish |

All six require a provider (none are standalone in POC).

## Command surface

```bash
npx instantsearch init                                              # once per project

# Bulk: install a curated recipe
npx instantsearch add experience <name> [--template search]

# Incremental: add one widget
npx instantsearch add widget <widget-name> --experience <experience>
```

### Semantics

- **`init`** auto-detects flavor/framework with confirmation, asks for Algolia creds (search key only — verified with a test call before writing anything), writes `instantsearch.json` + `src/lib/algolia-client.{ts,js}`.
- **`add experience <name> --template search`** creates the folder, provider, all default widgets, runs introspection questions for each schema-using widget.
- **`add widget <widget> --experience <name>`** where experience doesn't exist: auto-creates the experience inline (interactive: prompts for index + introspection; `--yes` mode: requires `--index` + other needed flags, errors with `index_required` if missing). This is power-user / agent territory — one-shot widget installs that materialize the experience incrementally.
- **Repeated widgets in one experience** (e.g., two RefinementLists on different facets) auto-suffix by attribute: `RefinementListBrand.tsx`, `RefinementListCategory.tsx`.

### Fails refused (by design)

- Unsupported framework → `unsupported_framework` with a specific message.
- Running `add widget` without `--experience` → interactive prompt / `--yes` mode error.
- Invalid credentials at `init` → `credentials_invalid`, nothing written.

## Generated file philosophy

1. **New files only.** The CLI never edits existing user code. No layouts modified, no CSS imports appended, no `<InstantSearch>` hoisted to `_app.tsx`.
2. **Opaque, no props.** Generated widget components take no props. Customization = edit the file. That's the whole point of owning them.
3. **Semantic HTML, unstyled.** No class names, no Tailwind detection, no BEM hooks. The CLI's job ends at correct schema mapping.
4. **Edit-friendly structure.** Named local components (e.g., `ProductHit` inside `Hits.tsx`), typed record declarations at the top, no comments explaining what the code does.
5. **TypeScript if detected, plain JS otherwise.** TS → `.tsx`/`.ts` with full type annotations. JS → `.jsx`/`.js`, no JSDoc typedefs.
6. **Same shape across flavors.** A React wrapper and a JS widget factory produce the same *kind* of file — the runtime substrate differs, the philosophy doesn't.

### Example — Hits (React + TypeScript)

```tsx
// src/components/product-search/Hits.tsx
import { Hits as InstantSearchHits } from 'react-instantsearch';

type ProductRecord = {
  name: string;
  image_url: string;
  description: string;
};

function ProductHit({ hit }: { hit: ProductRecord }) {
  return (
    <article>
      <img src={hit.image_url} alt={hit.name} />
      <h3>{hit.name}</h3>
      <p>{hit.description}</p>
    </article>
  );
}

export function Hits() {
  return <InstantSearchHits<ProductRecord> hitComponent={ProductHit} />;
}
```

### Example — Hits (JS flavor)

```js
// app/javascript/product-search/hits.js
import { hits } from 'instantsearch.js/es/widgets';

export const hitsWidget = hits({
  container: '#hits',
  templates: {
    item: (hit, { html }) => html`
      <article>
        <img src=${hit.image_url} alt=${hit.name} />
        <h3>${hit.name}</h3>
        <p>${hit.description}</p>
      </article>
    `,
  },
});
```

## Manifests

### Root — `instantsearch.json`

Project-wide concerns written once by `init`, read by every command.

```jsonc
{
  "apiVersion": 1,
  "flavor": "react",
  "framework": "next-app",
  "typescript": true,
  "componentsPath": "src/components",
  "aliases": { "components": "@/components" },
  "algolia": { "appId": "...", "searchApiKey": "..." },
  "experiences": [
    { "name": "product-search", "path": "src/components/product-search" }
  ]
}
```

### Experience — `<experience>/instantsearch.config.json`

Only what varies per experience. Merged with root at generation time.

```jsonc
{
  "apiVersion": 1,
  "indexName": "products",
  "schema": { "title": "name", "image": "image_url", "description": "description" },
  "widgets": ["SearchBox", "Hits", "RefinementList", "SortBy", "Pagination", "ClearRefinements"]
}
```

## Auto-detection at `init`

All detections surface to the user for confirmation (override with flags or interactive choice).

| Signal | Detects |
|---|---|
| `package.json` with `react-instantsearch` | React flavor |
| `react-instantsearch-nextjs` + `app/` dir | Next.js App Router |
| `instantsearch.js` in deps | JS flavor (bundled) |
| `tsconfig.json` exists | TypeScript |
| `tsconfig.json` `paths` | Import aliases |
| `src/` exists | Default `componentsPath` → `src/components` |
| None of the above | `unsupported_framework` error (require `--flavor`/`--framework`) |

The CLI refuses to install missing flavors — it is not `create-instantsearch-app`. Fails loudly with a hint: "Run `npm install react-instantsearch` first."

## Introspection strategy

Three beats, all attempted with the search key:

1. **Records** (Hits): `search` with `hitsPerPage: 1`. Extract attributes from `_highlightResult` keys + `Object.keys(hit)` for full coverage (including non-highlighted fields like images). Reuse `getPotentialImageAttributes` heuristic from `create-instantsearch-app`.
2. **Facets** (RefinementList): part of the search response when `facets: '*'`. Reuse `getFacetsFromIndex`.
3. **Replicas** (SortBy): `getSettings` on the index. Requires `settings` ACL on the key. If 403, fall back to prompting the user for comma-separated replica names.

### Failure taxonomy

| Failure | Error code | Behavior |
|---|---|---|
| Invalid creds | `credentials_invalid` | `init` refuses to write manifest |
| Network error | `network_error` | Retry once, then error out |
| Index not found | `index_not_found` | List accessible indices, re-prompt |
| Empty index | `index_empty` | Warn, prompt user for manual schema |
| Facets empty | `index_has_no_facets` | Warn, prompt for attribute anyway |
| Settings 403 | `settings_forbidden` | Fall back to manual replica entry |
| No replicas | `no_replicas` | Warn, offer to skip SortBy |

### What's out of scope

- Admin/write key for deeper introspection (future: `.env` pattern for auto-detected replica lists on restricted search keys)
- Multi-locale attributes (`title.en`, `title.fr`)
- Multi-record sampling for sparse datasets (use one record for POC)
- Auto-detection of numeric/geo attributes (RangeInput/GeoSearch not in POC)

## Agent interface

### `--json` flag

Every command accepts `--json`. Returns structured output with `apiVersion`. Agents use this + `--yes` for deterministic invocation.

```json
{
  "apiVersion": 1,
  "ok": true,
  "command": "add experience",
  "experience": { "name": "product-search", "path": "src/components/product-search" },
  "filesCreated": [
    "src/components/product-search/instantsearch.config.json",
    "src/components/product-search/provider.tsx",
    "src/components/product-search/SearchBox.tsx",
    "src/components/product-search/Hits.tsx",
    "..."
  ],
  "manifestUpdated": "instantsearch.json",
  "nextSteps": {
    "imports": [
      "import { ProductSearchProvider } from '@/components/product-search/provider';",
      "import { Hits } from '@/components/product-search';"
    ],
    "mountingGuidance": "Render <ProductSearchProvider> around the widgets wherever the search should appear."
  }
}
```

### Rules

- `--json` implies `--yes`. Missing inputs fail with an error object.
- Stable exit codes: 0 on success, non-zero on any error. `ok: false` in JSON is always paired with non-zero exit.
- Error objects have machine-readable `code` strings alongside human `message`.
- Stderr stays quiet under `--json` — all command-relevant output goes to stdout.
- Schema is versioned via `apiVersion` so we can evolve without breaking consumers.

### Flag parity

Every interactive prompt has an equivalent CLI flag so `--yes --json` runs are fully deterministic. The table below maps prompts to flags.

| Command | Prompt | Equivalent flag |
| --- | --- | --- |
| `init` | "Detected flavor (react/js) — confirm?" | `--flavor <react\|js>` |
| `init` | "Detected framework (nextjs) — confirm?" | `--framework <nextjs>` |
| `init` | "Algolia application ID" | `--app-id <id>` |
| `init` | "Algolia search-only API key" | `--search-key <key>` |
| `init` | "Where should generated components live?" | `--components-path <path>` |
| `add experience` | "Which template?" | `--template <name>` (default `search`) |
| `add experience` | "Which index?" | `--index <name>` |
| `add experience` (Hits) | "Which attribute is the title?" | `--hits-title <attr>` |
| `add experience` (Hits) | "Which attribute is the image?" | `--hits-image <attr>` |
| `add experience` (Hits) | "Which attribute is the description?" | `--hits-description <attr>` |
| `add experience` (RefinementList) | "Which facet attribute?" | `--refinement-list-attribute <attr>` |
| `add experience` (SortBy) | "Which replicas?" | `--sort-by-replicas <a,b,c>` |
| `add widget` | "Which experience to attach to?" | `--experience <name>` |
| `add widget` (auto-materialize) | "Which index for the new experience?" | `--index <name>` |
| all commands | "Skip confirmations?" | `--yes` (implied by `--json`) |
| all commands | "Emit JSON?" | `--json` |

### Deferred

- MCP server wrapping the CLI — natural follow-up once CLI is stable.
- Programmatic JS API — speculative; defer until asked.
- Streaming progress events (NDJSON) — our commands complete in seconds; single final object is enough.

## Distribution

### Monorepo

- New sibling package: `packages/instantsearch-cli/`
- npm name (post-publish): `@algolia/instantsearch-cli`
- Bin name: `instantsearch` (invoked as `instantsearch init` after local install; `npx @algolia/instantsearch-cli init` for one-off)
- Shares code with `create-instantsearch-app` via **copy-paste for POC** (introspection helpers: `getAttributesFromIndex`, `getFacetsFromIndex`, `getPotentialImageAttributes`, `getInformationFromIndex`). Extract into a shared internal package post-POC.

### Relationship to `create-instantsearch-app`

Two tools, coexist. `create-instantsearch-app` scaffolds new projects; this CLI installs widgets into existing ones. Not merged, not replaced.

### Publishing

**POC stays unpublished.** Demo runs locally from the monorepo via a dev script (`yarn workspace @algolia/instantsearch-cli start ...` or a convenience wrapper). Publish to npm once the API has stabilized.

## Use cases

### 1. Search page in Next.js App Router (headline demo)

```bash
npx instantsearch init
# → detects Next App Router + TS, asks for Algolia creds, writes instantsearch.json + algolia-client.ts

npx instantsearch add experience product-search --template search
# Interactive:
#   ? Index: products
#   ? Widgets: (all 6 checked by default)
#   ? Hits title attr: name
#   ? Hits image attr: image_url
#   ? RefinementList facet: brand
#   ? SortBy replicas: products_price_asc, products_price_desc
# → Writes src/components/product-search/ with provider.tsx (InstantSearchNext + 'use client')
#   and six widget wrappers pre-wired to the schema.
```

### 2. Incremental: add a second refinement

```bash
npx instantsearch add widget refinement-list --experience product-search
# ? Facet: category
# → Writes src/components/product-search/RefinementListCategory.tsx
```

### 3. Second experience, different index

```bash
npx instantsearch add experience docs-search --template search
# ? Index: docs
# ? Hits title attr: page_title
# ? RefinementList facet: section
# → Writes src/components/docs-search/ with its own provider and widgets
```

### 4. JS flavor on a Rails host with a bundler

```bash
npx instantsearch init
# → detects JS flavor (instantsearch.js in package.json), writes instantsearch.json

npx instantsearch add experience product-search --template search
# → Writes app/javascript/product-search/ with:
#     provider.js       (the instantsearch() instance + start/stop orchestration)
#     six widget wrappers (factories that take a container selector)
```

Same command, different generated code. No template-engine parsing.

### 5. Agent-driven (non-interactive)

```bash
npx instantsearch init \
  --flavor react --framework next-app \
  --app-id LATENCY_APP_ID --search-key $SEARCH_KEY \
  --components-path src/components --yes --json

npx instantsearch add experience product-search \
  --template search \
  --index products \
  --widgets searchbox,hits,refinement-list,sort-by,pagination,clear-refinements \
  --hits-title name \
  --hits-image image_url \
  --refinement-list-attribute brand \
  --sort-by-replicas products_price_asc,products_price_desc \
  --yes --json
```

Agent reads structured output to discover what was created and wire it up.

### 6. Power-user incremental (auto-creating experience)

```bash
npx instantsearch add widget hits --experience product-search
# product-search doesn't exist yet — created inline:
# ? Index: products
# ? Title attr: name
# ? Image attr: image_url
# → Writes src/components/product-search/ with provider.tsx + Hits.tsx
```

User adds widgets one at a time; the experience materializes as they go.

## POC minimum behaviors

- **Re-run conflict**: if a file would be overwritten, error with a clear message. No `--overwrite` flag in POC. Post-POC adds the full shadcn-like flag + prompt semantics.
- **Framework ambiguity** (Next.js with both `app/` and `pages/`, Rails with both JS setups): fail loudly, require explicit `--framework`/`--flavor` flag.

## Locked decisions summary

| # | Decision | Locked |
|---|---|---|
| 1 | Wrapper files (thin, owned by user) | ✓ |
| 2 | Experience-scoped folders | ✓ |
| 3 | Per-experience manifest + root manifest via `init` (shadcn-style) | ✓ |
| 4 | Auto-detect at `init` with confirmation | ✓ |
| 5 | Strictly new files, no edits to user code | ✓ |
| 6 | No HTML scaffolding file / no README / no styling | ✓ |
| 7 | Generate provider per experience (not per widget) | ✓ |
| 8 | Flavor scope: React (plain + Next App Router) + JS (bundled) | ✓ |
| 9 | Widget catalog (6 widgets, 3 introspection beats) | ✓ |
| 10 | Unified `add widget` + `add experience` command surface; no separate verb per widget family | ✓ |
| 11 | Experience = recipe (via `--template`); `--type` replaced with `--template` | ✓ |
| 12 | Opaque widgets, no props, edit-friendly structure | ✓ |
| 13 | `--json` + `--yes` agent surface | ✓ |
| 14 | New sibling package `@algolia/instantsearch-cli`, bin `instantsearch` | ✓ |
| 15 | POC stays unpublished | ✓ |
| 16 | Search key only (admin/write key via `.env` is post-POC) | ✓ |
| 17 | TypeScript output when detected, plain JS otherwise | ✓ |
| 18 | `add widget` against a non-existent experience auto-creates inline | ✓ |
| 19 | File conflict = error in POC (full `--overwrite` semantics post-POC) | ✓ |

## Deferred / post-POC

- Vue flavor support
- Next.js Pages Router, importmap-rails, UMD
- Additional templates: `store-locator`, `autocomplete`, `chat`
- Standalone widgets (autocomplete, chat) — the "self-contained, no provider" path
- Tier 3 widgets: Stats, HitsPerPage, CurrentRefinements, HierarchicalMenu, RangeInput/RangeSlider, GeoSearch, ToggleRefinement, InfiniteHits, Configure
- Multi-locale attribute handling
- Multi-record sampling for introspection
- Admin/write key in `.env` for richer introspection without storing admin creds
- `--overwrite` flag with full shadcn-like prompt/skip semantics
- `--add-css-import` opt-in for appending library CSS import to app entry
- File-based routing hooks (generate a new route file for Next.js App Router / Nuxt)
- MCP server wrapping the CLI
- Programmatic JS API (`import { addExperience } from '@algolia/instantsearch-cli/lib'`)
- Extract introspection helpers into a shared internal package (currently copied from `create-instantsearch-app`)
- Unscoped `instantsearch` npm alias for shorter `npx` invocation
