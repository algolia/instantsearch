# @algolia/instantsearch-cli

A CLI that scaffolds InstantSearch widgets into your project. It detects your framework, introspects your Algolia index, and generates ready-to-mount components without the need for manual wiring.

## Quick start

```bash
# Interactive
npx instantsearch init
npx instantsearch add search

# Non-interactive (for agents / CI)
npx instantsearch init \
  --yes --json \
  --flavor react --app-id YOUR_APP_ID --search-api-key YOUR_SEARCH_KEY

npx instantsearch add search product-search \
  --yes --json \
  --index products \
  --hits-title name --hits-image image_url \
  --refinement-list-attribute brand \
  --sort-by-replicas products_price_asc,products_price_desc

# Discover index schema before scaffolding
npx instantsearch introspect --yes --json --index products
```

## Concepts

The CLI uses a **shadcn-inspired unified `add` command**. What you add determines what gets generated:

- **Composite features** (like shadcn blocks): `add search`, `add search product-search`. Generates a folder with multiple widgets, a config manifest, and an index component that wraps everything in an `<Index>` widget.
- **Widgets** (like shadcn components): `add refinement-list search`. Adds a single widget to an existing feature.

There is a single `<InstantSearch>` provider generated at `init` time. Features use `<Index>` to target their Algolia index — no per-feature provider.

## Supported flavors and frameworks

| Flavor | Framework | Provider emitted |
| --- | --- | --- |
| `react` | _(none)_ | `<InstantSearch>` from `react-instantsearch` |
| `react` | `nextjs` | `<InstantSearchNext>` from `react-instantsearch-nextjs` with `'use client'` |
| `js` | _(none)_ | `instantsearch()` instance from `instantsearch.js` |

Detection is automatic. The CLI reads your `package.json` and project layout:

- If `react-instantsearch` or `instantsearch.js` is already installed, the CLI uses it directly.
- If no InstantSearch package is found, the CLI infers the right flavor from your project dependencies (`next` -> react + nextjs, `react` -> react, neither -> js) and **installs the packages for you** before proceeding. In interactive mode, it prompts for confirmation first.
- When detection is ambiguous (e.g., both `react-instantsearch` and `instantsearch.js` installed), pass `--flavor` explicitly.

The package manager is auto-detected from your lockfile (`yarn.lock` -> yarn, `package-lock.json` -> npm, `pnpm-lock.yaml` -> pnpm).

TypeScript output is emitted when `tsconfig.json` is present; plain JavaScript otherwise.

## Commands

### `npx instantsearch init`

Initialize InstantSearch in the current project. Writes `instantsearch.json` (root manifest), `algolia-client.ts|js`, and `algolia-provider.tsx|jsx|ts|js` (shared provider with no `indexName`).

| Flag | Description |
| --- | --- |
| `--json` | Emit a single JSON object on stdout (implies `--yes`) |
| `--yes` | Accept defaults without prompting |
| `--flavor <flavor>` | `react` or `js` |
| `--framework <framework>` | `nextjs` (omit for bare library) |
| `--app-id <appId>` | Algolia application ID |
| `--search-api-key <searchApiKey>` | Algolia search-only API key |
| `--components-path <path>` | Path where components will be generated |

In `--yes` mode, `--app-id` and `--search-api-key` are required.

### `npx instantsearch add <item> [name]`

Add a composite feature or a widget. The CLI determines what to generate based on the item name.

**Composite features** (e.g., `add search`, `add search product-search`):

Creates a feature folder with widgets wrapped in an `<Index>` component and a per-feature manifest (`instantsearch.config.json`). The second argument is an optional custom name (defaults to the item name).

| Flag | Description |
| --- | --- |
| `--json` | Emit a single JSON object on stdout (implies `--yes`) |
| `--yes` | Accept defaults without prompting |
| `--index <index>` | Algolia index name |
| `--hits-title <attr>` | Record attribute for Hits title |
| `--hits-image <attr>` | Record attribute for Hits image |
| `--hits-description <attr>` | Record attribute for Hits description |
| `--refinement-list-attribute <attr>` | Facet attribute for RefinementList |
| `--sort-by-replicas <list>` | Comma-separated replica index names for SortBy |

The `search` template generates: Hits, RefinementList, SortBy, Pagination, ClearRefinements. Schema-driven widgets are automatically skipped when their required flags are not provided: omit `--refinement-list-attribute` to skip RefinementList, omit `--sort-by-replicas` to skip SortBy.

**Widgets** (e.g., `add refinement-list search`):

Adds a single widget to an existing feature. The second argument is the target feature name (required).

| Flag | Description |
| --- | --- |
| `--json` | Emit a single JSON object on stdout (implies `--yes`) |
| `--yes` | Accept defaults without prompting |
| `--index <index>` | Algolia index (required when auto-creating the feature) |
| `--hits-title <attr>` | Record attribute for Hits title |
| `--hits-image <attr>` | Record attribute for Hits image |
| `--hits-description <attr>` | Record attribute for Hits description |
| `--refinement-list-attribute <attr>` | Facet attribute for RefinementList |
| `--sort-by-replicas <list>` | Comma-separated replica index names for SortBy |

Adding the same widget twice auto-suffixes files by attribute (e.g., `RefinementListBrand.tsx`, `RefinementListCategory.tsx`).

If the feature doesn't exist yet, the CLI creates it inline — prompting for index and schema interactively, or requiring `--index` in `--yes` mode.

### `npx instantsearch introspect`

Discover attributes, facets, and replicas of an Algolia index. Useful for understanding an index's schema before scaffolding a feature, or for agents that need to plan which flags to pass.

| Flag | Description |
| --- | --- |
| `--json` | Emit a single JSON object on stdout (implies `--yes`) |
| `--yes` | Accept defaults without prompting |
| `--index <index>` | Algolia index name (required) |
| `--app-id <appId>` | Algolia application ID (overrides `instantsearch.json`) |
| `--search-api-key <searchApiKey>` | Algolia search-only API key (overrides `instantsearch.json`) |

Credentials are read from `instantsearch.json` by default. Pass `--app-id` and `--search-api-key` to override, or when the project hasn't been initialized yet.

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
| `Pagination` | Structural | -- |
| `ClearRefinements` | Structural | -- |
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
  "filesCreated": ["src/components/product-search/Hits.tsx", "..."],
  "manifestUpdated": "instantsearch.json"
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
| `invalid_manifest` | `instantsearch.json` or `instantsearch.config.json` is malformed |
| `file_conflict` | Generated file already exists on disk |
| `missing_required_flag` | A required flag was omitted in `--yes` mode |
| `index_required` | `--index` required when auto-creating a feature in `--yes` mode |
| `missing_schema` | Schema inputs missing for required widgets in `--yes` mode |
| `unknown_template` | Template name not recognized |
| `unknown_widget` | Widget name not in supported list |
| `unknown_item` | Item name not recognized by the unified `add` command |
| `target_required` | Widget requires a target feature name |
| `unknown_command` | Command not recognized |
| `unknown_option` | Flag not recognized |

## Generated file structure

After `init` + `add search product-search` in a React + TypeScript project:

```
your-project/
├── instantsearch.json                              # Root manifest
├── src/
│   ├── lib/
│   │   ├── algolia-client.ts                       # Search client
│   │   └── algolia-provider.tsx                    # Shared InstantSearch provider
│   └── components/
│       └── product-search/
│           ├── instantsearch.config.json            # Feature manifest
│           ├── index.tsx                             # <Index> wrapper + widget composition
│           ├── Hits.tsx
│           ├── RefinementList.tsx
│           ├── SortBy.tsx
│           ├── Pagination.tsx
│           └── ClearRefinements.tsx
```

The CLI only writes new files — it never edits existing code. Mount the provider in your layout and render the feature component wherever the search should appear (or follow the `nextSteps` guidance from the JSON output).

## Running tests

```bash
yarn workspace @algolia/instantsearch-cli test
```
