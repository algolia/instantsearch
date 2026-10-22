# vue-instantsearch

Vue 2 **and** Vue 3 bindings (single source, built for both). Components wrap the `instantsearch.js` connectors — the logic isn't reimplemented here.

## Layout

- `src/components/<Pascal>.vue` (SFC) or `.js` (render function) — the component wrapping a connector. Exported from `src/widgets.js`.
- `src/mixins/` — shared connector-wiring logic reused across components.
- To reuse shared markup, import the `create<Name>Component` factory from `instantsearch-ui-components` and render it inside a **`renderCompat`** render function, passing Vue's `h` as `createElement` — e.g. `render: renderCompat((h) => h(createHitsComponent({ createElement: h }), { … }))` (see `src/components/Hits.js`). `renderCompat` (`src/util/vue-compat/`) is the Vue 2/3 render-fn shim. **Creating or changing the shared component itself is the `instantsearch-ui-components` package's job** — do that there, then consume the factory here.

## Working here

```bash
yarn workspace vue-instantsearch build
yarn jest packages/vue-instantsearch/src/components/__tests__/<Pascal>   # from repo root
```

- Vue 2/3 dual support: run `./scripts/prepare-vue3.js` (root `yarn prepare-vue3`) when switching the working tree to Vue 3. Don't assume one Vue version — changes must work for both.
- Cross-flavor behavior lives in `tests/common/widgets/<name>/`; register it in this package's `common-widgets.test.*`.
