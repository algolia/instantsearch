# @algolia/instantsearch-cli

A CLI that scaffolds InstantSearch widgets into your project. It detects your framework, introspects your Algolia index, and generates ready-to-mount components without the need for manual wiring.

> **Status:** proof of concept (unpublished). Run it from the monorepo.

## Quick start

From the monorepo root:

```bash
# Interactive
yarn workspace @algolia/instantsearch-cli start init
yarn workspace @algolia/instantsearch-cli start add experience product-search --template search

# Non-interactive (for agents / CI)
yarn workspace @algolia/instantsearch-cli start init \
  --yes --json \
  --flavor react --app-id YOUR_APP_ID --search-key YOUR_SEARCH_KEY

yarn workspace @algolia/instantsearch-cli start add experience product-search \
  --yes --json \
  --template search --index products \
  --hits-title name --hits-image image_url \
  --refinement-list-attribute brand \
  --sort-by-replicas products_price_asc,products_price_desc

# Only generate specific widgets (skip SortBy and ClearRefinements)
yarn workspace @algolia/instantsearch-cli start add experience product-search \
  --yes --json \
  --template search --index products \
  --hits-title name \
  --widgets SearchBox,Hits,RefinementList,Pagination

# Discover index schema before scaffolding
yarn workspace @algolia/instantsearch-cli start introspect \
  --yes --json --index products
```

## Supported flavors and frameworks

| Flavor | Framework | Provider emitted |
| --- | --- | --- |
| `react` | _(none)_ | `<InstantSearch>` from `react-instantsearch` |
| `react` | `nextjs` | `<InstantSearchNext>` from `react-instantsearch-nextjs` with `'use client'` |
| `js` | _(none)_ | `instantsearch()` instance from `instantsearch.js` |

Detection is automatic. The CLI reads your `package.json` and project layout:

- If `react-instantsearch` or `instantsearch.js` is already installed, the CLI uses it directly.
- If no InstantSearch package is found, the CLI infers the right flavor from your project dependencies (`next` → react + nextjs, `react` → react, neither → js) and **installs the packages for you** before proceeding. In interactive mode, it prompts for confirmation first.
- When detection is ambiguous (e.g., both `react-instantsearch` and `instantsearch.js` installed), pass `--flavor` explicitly.

The package manager is auto-detected from your lockfile (`yarn.lock` → yarn, `package-lock.json` → npm, `pnpm-lock.yaml` → pnpm).

TypeScript output is emitted when `tsconfig.json` is present; plain JavaScript otherwise.

## Commands

### `instantsearch init`

Initialize InstantSearch in the current project. Writes `instantsearch.json` (root manifest) and `algolia-client.ts|js`.

| Flag | Description |
| --- | --- |
| `--json` | Emit a single JSON object on stdout (implies `--yes`) |
| `--yes` | Accept defaults without prompting |
| `--flavor <flavor>` | `react` or `js` |
| `--framework <framework>` | `nextjs` (omit for bare library) |
| `--app-id <appId>` | Algolia application ID |
| `--search-key <searchKey>` | Algolia search-only API key |
| `--components-path <path>` | Path where components will be generated |

In `--yes` mode, `--app-id` and `--search-key` are required.

### `instantsearch add experience <name>`

Add a new search experience from a template. Creates an experience folder with a provider, widgets, and a per-experience manifest (`instantsearch.config.json`).

| Flag | Description |
| --- | --- |
| `--json` | Emit a single JSON object on stdout (implies `--yes`) |
| `--yes` | Accept defaults without prompting |
| `--template <template>` | Template to use (default: `search`) |
| `--index <index>` | Algolia index name |
| `--hits-title <attr>` | Record attribute for Hits title |
| `--hits-image <attr>` | Record attribute for Hits image |
| `--hits-description <attr>` | Record attribute for Hits description |
| `--refinement-list-attribute <attr>` | Facet attribute for RefinementList |
| `--sort-by-replicas <list>` | Comma-separated replica index names for SortBy |
| `--widgets <list>` | Comma-separated widget list (overrides template defaults) |

In `--yes` mode, `--index` is required. Schema flags (`--hits-title`, etc.) are optional — when omitted, the CLI introspects the index and picks sensible defaults interactively.

The `search` template generates all six widgets by default: SearchBox, Hits, RefinementList, SortBy, Pagination, ClearRefinements. Use `--widgets` to override the list, e.g., `--widgets SearchBox,Hits,Pagination` to skip RefinementList, SortBy, and ClearRefinements.

### `instantsearch add widget <widget>`

Add a single widget to an existing experience.

| Flag | Description |
| --- | --- |
| `--json` | Emit a single JSON object on stdout (implies `--yes`) |
| `--yes` | Accept defaults without prompting |
| `--experience <name>` | Experience to add the widget to (required) |
| `--index <index>` | Algolia index (required when auto-creating the experience) |
| `--hits-title <attr>` | Record attribute for Hits title |
| `--hits-image <attr>` | Record attribute for Hits image |
| `--hits-description <attr>` | Record attribute for Hits description |
| `--refinement-list-attribute <attr>` | Facet attribute for RefinementList |
| `--sort-by-replicas <list>` | Comma-separated replica index names for SortBy |

Adding the same widget twice auto-suffixes files by attribute (e.g., `RefinementListBrand.tsx`, `RefinementListCategory.tsx`).

If the experience doesn't exist yet, the CLI creates it inline — prompting for index and schema interactively, or requiring `--index` in `--yes` mode.

### `instantsearch introspect`

Discover attributes, facets, and replicas of an Algolia index. Useful for understanding an index's schema before scaffolding an experience, or for agents that need to plan which flags to pass.

| Flag | Description |
| --- | --- |
| `--json` | Emit a single JSON object on stdout (implies `--yes`) |
| `--yes` | Accept defaults without prompting |
| `--index <index>` | Algolia index name (required) |
| `--app-id <appId>` | Algolia application ID (overrides `instantsearch.json`) |
| `--search-key <searchKey>` | Algolia search-only API key (overrides `instantsearch.json`) |

Credentials are read from `instantsearch.json` by default. Pass `--app-id` and `--search-key` to override, or when the project hasn't been initialized yet.

Returns partial results with warnings when some introspections fail (e.g., facets or replicas inaccessible but records are readable).

**Example JSON output:**

```json
{
  "apiVersion": 1,
  "ok": true,
  "command": "introspect",
  "indexName": "products",
  "attributes": ["name", "brand", "price", "image_url", "description"],
  "imageCandidates": ["image_url"],
  "facets": ["brand", "category"],
  "replicas": ["products_price_asc", "products_price_desc"],
  "warnings": []
}
```

## Widgets

| Widget | Type | Schema flags |
| --- | --- | --- |
| `SearchBox` | Structural | — |
| `Pagination` | Structural | — |
| `ClearRefinements` | Structural | — |
| `Hits` | Schema-driven | `--hits-title`, `--hits-image`, `--hits-description` |
| `RefinementList` | Schema-driven | `--refinement-list-attribute` |
| `SortBy` | Schema-driven | `--sort-by-replicas` |

Structural widgets need no index-specific configuration. Schema-driven widgets use introspection to discover attributes, or accept them via flags.

## JSON output

Every command emits a JSON report on stdout when `--json` is set. Stderr stays silent.

**Success:**

```json
{
  "apiVersion": 1,
  "ok": true,
  "command": "add experience",
  "filesCreated": ["src/components/product-search/provider.tsx", "..."],
  "manifestUpdated": "instantsearch.json",
  "nextSteps": {
    "imports": [
      "import { ProductSearchProvider } from '@/components/product-search/provider'"
    ],
    "mountingGuidance": "Render <ProductSearchProvider> around the widgets wherever the search should appear."
  }
}
```

**Failure:**

```json
{
  "apiVersion": 1,
  "ok": false,
  "command": "init",
  "code": "credentials_invalid",
  "message": "The provided API key is not valid for application XXXXX."
}
```

Exit code is `0` on success, non-zero on failure.

## Error codes

| Code | When |
| --- | --- |
| `install_failed` | Package install command failed (network error, registry down, etc.) |
| `install_declined` | User declined package installation in interactive mode |
| `credentials_invalid` | API key or app ID is wrong |
| `index_not_found` | Index doesn't exist or isn't accessible |
| `index_empty` | Index has zero records |
| `index_has_no_facets` | No facets configured on the index |
| `settings_forbidden` | API key lacks permission to read index settings |
| `no_replicas` | No replica indices configured (SortBy needs them) |
| `network_error` | Algolia API unreachable after retry |
| `unsupported_framework` | Framework not recognized or ambiguous detection |
| `not_initialized` | `instantsearch.json` not found (run `init` first) |
| `file_conflict` | Generated file already exists on disk |
| `missing_required_flag` | A required flag was omitted in `--yes` mode |
| `index_required` | `--index` required when auto-creating an experience in `--yes` mode |
| `missing_schema` | Schema inputs missing for required widgets in `--yes` mode |
| `unknown_template` | Template name not recognized |
| `unknown_widget` | Widget name not in supported list |
| `unknown_command` | Command not recognized |
| `unknown_option` | Flag not recognized |

## Generated file structure

After `init` + `add experience product-search --template search` in a React + TypeScript project:

```
your-project/
├── instantsearch.json                              # Root manifest
├── src/
│   ├── lib/
│   │   └── algolia-client.ts                       # Search client
│   └── components/
│       └── product-search/
│           ├── instantsearch.config.json            # Experience manifest
│           ├── provider.tsx                          # InstantSearch provider
│           ├── SearchBox.tsx
│           ├── Hits.tsx
│           ├── RefinementList.tsx
│           ├── SortBy.tsx
│           ├── Pagination.tsx
│           └── ClearRefinements.tsx
```

The CLI only writes new files — it never edits existing code. Mount the provider in your layout manually (or follow the `nextSteps` guidance from the JSON output).

## Running tests

```bash
yarn workspace @algolia/instantsearch-cli test
```
