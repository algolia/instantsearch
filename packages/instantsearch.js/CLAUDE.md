# instantsearch.js (vanilla JS flavor)

The vanilla JS flavor: widgets, templates, the JS `instantsearch()` entry and a re-export of `instantsearch-core`. **Connectors, the InstantSearch runtime, routers, state mappings and middlewares live in `packages/instantsearch-core`** and are consumed by all flavors; a behavior change usually belongs there (see its `CLAUDE.md`/README), not here. Users import everything from the single `instantsearch.js` root: named exports only, no default export.

## Layout

- `src/index.es.ts` — the package root (`exports["."]`): `export * from 'instantsearch-core'` plus the JS-only pieces (`instantsearch()`, `version`, widgets, templates, HTML-string helpers `highlight`/`snippet`/…, types). Names exported here win over core's, but never rely on that silently: two `export *` that collide are a TS2308.
- `src/index.ts` + `src/umd/` — the **UMD/CDN** build only (`dist/instantsearch.*.js`, global `instantsearch` with `.widgets`, `.connectors`, `.routers.history`, `.stateMappings.simple`, …). Not part of the ES/CJS builds and not importable by users.
- `src/lib/InstantSearch.ts` — the JS `InstantSearch` subclass (JS Algolia agent, template helpers) behind `instantsearch()`.
- `src/widgets/<name>/<name>.tsx` — vanilla JS widget = connector (from `instantsearch-core`) + default template/rendering. Exported from `src/widgets/index.ts`.
- `src/components/` — the **JS flavor's Preact components** (the widgets' markup). This is the _legacy_ home for widget layout; newer widgets pull their layout from the shared `instantsearch-ui-components` package instead, and some components here are now thin wrappers that import from it. Add **new shared** markup to `instantsearch-ui-components`, not here.
- `src/lib/` — JS-flavor runtime pieces (`InstantSearch` subclass, Hogan/Preact template helpers, `utils`). The core runtime is in `instantsearch-core`.
- `src/lib/ai-lite/` — hand-written reimplementation of the Vercel AI SDK's UI layer (`UIMessage` parts, the SSE chunk protocol, the `Chat` state machine `connectChat` drives). It replaced `ai@^5.0.18` in #6880 and tracks nothing upstream: AI SDK fixes land on the `ai@6` line and never reach us. **Before changing its semantics, diff the matching file under [`vercel/ai/packages/ai/src/ui`](https://github.com/vercel/ai/tree/main/packages/ai/src/ui)** — the auto-continue predicate silently missed vercel/ai#9944 (don't resend provider-executed tool turns) for months. Deliberate gaps: no tool-approval flow, no metadata/data-part schema validation, no `finishReason`.
- `src/types/` — JS-only public types (templates, components); the shared ones come from `instantsearch-core`.

## Working here

```bash
yarn workspace instantsearch.js build      # rollup → esm + cjs + umd + .d.ts
yarn workspace instantsearch.js test:exports   # the published entry resolves (ESM + CJS) and hides es/ and cjs/
yarn jest packages/instantsearch-core/src/connectors/<name>   # run one connector's tests (from repo root)
```

- `package.json#exports` only exposes the root, the UMD files in `dist/` and `package.json`; `es/` and `cjs/` stay on disk but are not importable. Inside this repo import from `'instantsearch.js'` (never `instantsearch.js/es/...`), and never from `instantsearch-core` in examples or `tests/common` (oxlint enforces both).
- Connectors return a typed render state — don't return untyped state (oxlint rule).
- A new widget that only varies presentation should **reuse an existing connector** (e.g. `menuSelect` reuses `connectMenu`) and set a distinct `$$widgetType`; don't fork the connector.
- Cross-flavor behavior is covered by `tests/common/connectors/<name>/`; flavor-agnostic logic tests go there, JS-specific ones stay in `__tests__/`.
