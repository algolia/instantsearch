# instantsearch-core

The **logic layer** every flavor is built on: connectors, the `InstantSearch` runtime, routers, state mappings, middlewares, the chat machinery and the shared types. Published separately (`instantsearch-core`, currently `1.0.0-beta.x`) so flavors can depend on and type against it — but users install their flavor, which re-exports this package's public root. `instantsearch.js` re-exports this package's root, so logic whose name looks flavour-shaped lives _here_, not in the flavor.

> Most behavior bugs and every new connector option belong here, not in a flavor. The flavors only wrap what this package exposes — see the repo-root `AGENTS.md` for the cross-flavor recipe (`/expose-option`).

## Entry points — pick the right one

- `src/index.ts` — the **public, semver-guaranteed** root. Everything users can reach. Adding an export here is a public API change: name it deliberately, and expect the three flavors to re-export it.
- `src/internal.ts` — helpers for the first-party flavors only (`InstantSearch` base class, `version`, chat internals, `warn`, `suitComponent`, `walkIndex`, …). **No semver guarantee.** Anything flavor-only goes here, never in `index.ts`. oxlint blocks it in `tests/mocks`, `tests/e2e`, `tests/versions` and `tests/umd.test.ts`; `tests/common/**` and `tests/utils/**` use it freely.
- Flavors reach this package as `'instantsearch-core'` / `'instantsearch-core/internal'`, never the reverse: nothing here may import a flavor.

## Layout

- `src/connectors/<kebab-name>/connect<PascalName>.ts` — one directory per connector (≈45 of them: `search-box`, `chat`, `hits`, `autocomplete`, `compare`, `tasks`, …), barrelled by `src/connectors/index.ts`.
- `src/instantsearch.ts` — the **framework-agnostic `InstantSearch`** class (widget lifecycle, helper wiring, `refresh`/`scheduleSearch`, UI-state + `renderState` plumbing, and initial-results hydration via `hydrateSearchClient`/`hydrateRecommendCache`), plus the `instantsearch()` factory and `INSTANTSEARCH_FUTURE_DEFAULTS`. Only `instantsearch.js` subclasses it (`instantsearch.js/src/lib/InstantSearch.ts`, to add its own Algolia agent); React and Vue build the core instance directly (`react-instantsearch-core/src/lib/useInstantSearchApi.ts`, `vue-instantsearch/src/components/InstantSearch.js`).
- `src/widgets/index/` — the `index` widget, the only widget here (it has no UI). Widgets with markup live in the flavors.
- `src/lib/routers/` (`history`, `queryString`), `src/lib/stateMappings/` (`simple`, `singleIndex`), `src/middlewares/` (insights, router, metadata), `src/lib/tasks/`, `src/lib/infiniteHitsCache/`, `src/lib/voiceSearchHelper/`, `src/lib/server.ts` (SSR), `src/lib/suit.ts`, `src/lib/utils/`, `src/types/`, `src/helpers/` (insights client), `src/version.ts`.
- `src/lib/chat/` + `src/lib/ai-lite/` — the chat state machine and its transport. See below before touching either.

## The connector contract

Every connector is `connectX(renderFn, unmountFn = noop) => (widgetParams) => widget`, typed as `Connector<XWidgetDescription, XConnectorParams>`:

- `$$type: 'ais.x'` identifies it; `checkRendering(renderFn, withUsage())` guards the render callback, and `createDocumentationMessageGenerator({ name: 'search-box', connector: true })` builds the docs link inside thrown messages.
- `init` and `render` both call `renderFn({ ...this.getWidgetRenderState(options), instantSearchInstance }, firstRender)`; `dispose` calls `unmountFn()`. Keep action closures (`_refine`, `_clear`) in `let` bindings created on the first `getWidgetRenderState` and reuse them — that is what every connector does; nothing here pins their identity in a test, so treat it as convention, not contract.
- `getRenderState` folds this widget's render state into the index render state; `getWidgetUiState` (params → URL/UI state) and `getWidgetSearchParameters` (UI state → params) are the **round-trip pair**: a widget that gains state must implement both directions or its state won't survive a page reload. The two directions are **not** symmetric. `getWidgetUiState` returns the incoming `uiState` untouched when the widget has nothing to contribute, so an inactive widget leaves no key in the URL. `getWidgetSearchParameters` must instead write its own slice on every pass, _including_ the empty form — `setQueryParameter('query', uiState.query || '')` in `connectSearchBox`, `removeFacetRefinement(attribute)` plus an empty `[attribute]: []` in `connectRefinementList` — because returning `searchParameters` untouched once the widget's UI-state entry is gone leaves the stale query or refinement applied.
- Types follow the same shape: `XConnectorParams`, `XRenderState`, `XWidgetDescription` (`$$type`, `renderState`, `indexRenderState`, `indexUiState`), exposed as `WidgetRenderState<…>`. oxlint enforces a return type on `getRenderState`.
- Library code in `packages/**` bans `async`, `for-in` and `for-of` (oxlint, tests excepted) — use `Promise` chains and `forEach`/`reduce`.

## Chat and `ai-lite`

`src/lib/ai-lite/` is a **hand-written reimplementation of the Vercel AI SDK's UI layer** (`UIMessage` parts, the SSE chunk protocol, the `AbstractChat` state machine that `connectChat` drives). Nothing keeps it in sync with upstream: AI SDK fixes land on the `ai@6` line and never reach us. **Before changing its semantics, diff the matching file under [`vercel/ai/packages/ai/src/ui`](https://github.com/vercel/ai/tree/main/packages/ai/src/ui).** Deliberate gaps: no tool-approval flow, no metadata/data-part schema validation, no `finishReason`.

Agent Studio runs its tools server-side without setting `providerExecuted`, so `onToolCall` also sees every server tool call: answer one only through a registered tool, or once the response completes without the server's result. An earlier answer resolves the call, and the server's `tool-output-available` is then dropped. The exception is `algolia_compare_products` declared as a server tool: the chat ships a handler under that name, so Agent Studio flags those calls `providerExecuted`, and `onToolCall` never sees them.

## Working here

```bash
yarn lerna run build --scope instantsearch-core      # rollup → dist/ + .d.ts
yarn jest packages/instantsearch-core/src/connectors/<name>   # one connector (from repo root)
yarn jest common-connectors                          # the cross-flavor connector suites
```

- Connector tests co-locate in `src/connectors/<name>/__tests__/`. **Cross-flavor behavior goes in `tests/common/connectors/<name>/`**, registered by each flavor's `common-connectors.test.*` (`instantsearch.js`, `react-instantsearch`, `vue-instantsearch`) — run all three with `yarn jest common-connectors`.
- This package only ships `README.md` + `dist/`, and `yarn type-check` in the flavors reads those built declarations: rebuild here after changing public types, or the flavors report phantom errors.
- Attribution: `src/instantsearch.ts` tags the search client with `addAlgoliaAgent('instantsearch-core (<version>)')` and each flavor adds its own on top — that string is what adoption analytics read. When a major moves, `createMetadataMiddleware` tests (which assert the agent/`ua` payload) need the new majors.
