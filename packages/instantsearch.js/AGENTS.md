# instantsearch.js (vanilla JS flavor)

The vanilla JS flavor: widgets, templates, the JS `instantsearch()` entry and a re-export of `instantsearch-core`. **Connectors, the InstantSearch runtime, routers, state mappings and middlewares live in `packages/instantsearch-core`** and are consumed by all flavors; a behavior change usually belongs there (see its `AGENTS.md`), not here. Users import everything from the single `instantsearch.js` root: named exports only, no default export.

## Layout

- `src/index.es.ts` — the package root (`exports["."]`): `export * from 'instantsearch-core'` plus the JS-only pieces (`instantsearch()`, `version`, widgets, templates, types). Names exported here win over core's, but never rely on that silently: two `export *` that collide are a TS2308.
- `src/index.ts` + `src/umd/` — the **UMD/CDN** build only (`dist/instantsearch.*.js`, global `instantsearch` with `.widgets`, `.connectors`, `.routers.history`, `.stateMappings.simple`, …). Not part of the ES/CJS builds and not importable by users.
- `src/lib/InstantSearch.ts` — the JS `InstantSearch` subclass (JS Algolia agent, template helpers) behind `instantsearch()`.
- `src/widgets/<name>/<name>.tsx` — vanilla JS widget = connector (from `instantsearch-core`) + default template/rendering. Exported from `src/widgets/index.ts`.
- `src/components/` — the **JS flavor's Preact components** (the widgets' markup). Widgets that take their layout from the shared `instantsearch-ui-components` package have no component here, or a thin wrapper that imports from it. Put **shared** markup in `instantsearch-ui-components`, not here.
- `src/lib/` — JS-flavor runtime pieces (`InstantSearch` subclass, Preact template helpers, `utils`). The core runtime is in `instantsearch-core`.
- `src/widgets/{chat,chat-trigger,prompt-suggestions,compare-bar}/` — the JS chat surface: connector + template. There is **no chat logic and no `ai-lite` here** — `src/lib/ai-lite/` holds only a public-types test; the AI-SDK reimplementation, the `Chat` state machine and `connectChat` all live in `packages/instantsearch-core` (`src/lib/ai-lite/`, `src/lib/chat/`, `src/connectors/chat/` there — read that package's `AGENTS.md` before touching chat semantics), and the shared chat markup is in `instantsearch-ui-components/src/components/chat/`.
- `src/types/` — JS-only public types (templates, components); the shared ones come from `instantsearch-core`.

## Working here

```bash
yarn lerna run build --scope instantsearch.js      # rollup → esm + cjs + umd + .d.ts
yarn workspace instantsearch.js test:exports   # the published entry resolves (ESM + CJS) and hides es/ and cjs/
yarn jest packages/instantsearch-core/src/connectors/<name>   # run one connector's tests (from repo root)
```

- `package.json#exports` only exposes the root, the UMD files in `dist/` and `package.json`; `es/` and `cjs/` stay on disk but are not importable. Inside this repo import from `'instantsearch.js'` — oxlint bans every deep path into it (`instantsearch.js/es/…`) repo-wide, except `dist/` and `package.json`. Examples and `tests/` consume flavors rather than core: `examples/react/**` may only import `react-instantsearch` — or the headless `react-instantsearch-core`, which is what the React Native example uses (`examples/react/react-native/App.tsx`), so don't "fix" those imports to the DOM package — and `instantsearch-core/internal` is blocked in `tests/{mocks,e2e,versions}` and `tests/umd.test.ts` (`tests/common/**` does use it, for shared helpers).
- Connectors return a typed render state — don't return untyped state (oxlint rule).
- A new widget that only varies presentation should **reuse an existing connector** (e.g. `menuSelect` reuses `connectMenu`) and set a distinct `$$widgetType`; don't fork the connector.
- Cross-flavor behavior is covered by `tests/common/connectors/<name>/`; flavor-agnostic logic tests go there, JS-specific ones stay in `__tests__/`.
