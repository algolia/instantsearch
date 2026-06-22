# algoliasearch-helper

The **low-level search-state manager** that sits *underneath* InstantSearch connectors. It's a separately-published, long-stable npm package (`algoliasearch-helper`, own semver — currently 3.x) that wraps the `algoliasearch` JS client with a higher-level, stateful API: it tracks search parameters, builds the actual Algolia queries, parses responses, and emits events. Every connector in `instantsearch.js` reads and writes this helper's state — but the connector is the layer you change, not this one.

> **⚠️ Rarely the right place for a change/fix/update.** This package is mature and broadly depended on — InstantSearch (all flavors) plus other Algolia front-end libraries build on it. Almost all widget/connector behavior is implemented *on top of* the helper, not in it. Touch it **only** for a genuine state-manager or response-parsing bug, or to add a real new search-parameter primitive. Any change here is a **public-API, independently-versioned** change with a blast radius far beyond this repo — flag it explicitly and prefer fixing the connector instead. No dedicated subagent: the rare legitimate change is handled by `instantsearch-core-engineer`.

## What's in it

Entry: `algoliasearchHelper(client, index, opts)` → an `AlgoliaSearchHelper` (an `EventEmitter`). Core pieces under `src/`:

- **`SearchParameters/`** — the **immutable** query state (query, `facets`/`disjunctiveFacets`/`hierarchicalFacets`, numeric & tag refinements, `page`, etc.). Setters return a *new* instance; never mutate in place. This is the object connectors mutate via `getWidgetSearchParameters`.
- **`SearchResults/`** — parses the raw Algolia response into a richer structure: facet values, `facets_stats`, and hierarchical facet trees (`generate-hierarchical-tree.js`).
- **`requestBuilder.js`** — turns `SearchParameters` into the actual query payload(s); notably **splits disjunctive faceting into multiple queries**.
- **`DerivedHelper/`** — sub-requests derived from a main helper (federated / multi-index search); this is what powers the `index` widget.
- **`RecommendParameters/` + `RecommendResults/`** — the equivalent state/results pair for the Recommend API.
- **`functions/`** — small internal lodash-style utilities (`merge`, `omit`, `orderBy`, …).

Events emitted by the helper (what InstantSearch's lifecycle listens to): `change`, `search`, `result`, `error`, `fetch`, `searchOnce`, `searchForFacetValues`, `searchQueueEmpty`, `recommendQueueEmpty`.

## Conventions that differ from the rest of the monorepo

- **Plain CommonJS JavaScript**, not the TS-strict source the other packages use. Public types are **hand-written** in `index.d.ts` — update them by hand if you change the surface.
- Has its own **`README.md` + `CHANGELOG.md`** (don't fold into the monorepo's). Build is Rollup (`yarn workspace algoliasearch-helper build`); tests run via its own `scripts/test.sh` (`yarn workspace algoliasearch-helper test`).
