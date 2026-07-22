# vue-instantsearch

Vue 2 **and** Vue 3 bindings (single source, built for both). Components wrap the `instantsearch.js` connectors — the logic isn't reimplemented here.

## Layout

- `src/components/<Pascal>.vue` (SFC) or `.js` (render function) — the component wrapping a connector. Exported from `src/widgets.js`.
- `src/mixins/` — shared connector-wiring logic reused across components.
- To reuse shared markup, import the `create<Name>Component` factory from `instantsearch-ui-components` and render it inside a **`renderCompat`** render function, passing Vue's `h` as `createElement` — e.g. `render: renderCompat((h) => h(createHitsComponent({ createElement: h }), { … }))` (see `src/components/Hits.js`). `renderCompat` (`src/util/vue-compat/`) is the Vue 2/3 render-fn shim. **Creating or changing the shared component itself is the `instantsearch-ui-components` package's job** — do that there, then consume the factory here.

## Consuming hook-based shared components (Carousel, Autocomplete, Chat)

Most shared factories are stateless markup and consume via `renderCompat` (above). But some are **hook-driven** (`createAutocompletePropGetters`, `createCarouselComponent`) — written against a React-style `Hooks` contract (`useState`/`useEffect`/`useRef`/`useMemo`/`useId`) and emitting React-style props (`className`, `onClick`, `ref={mutableRef}`). Vue can't supply React hooks natively, so:

- Give the component a hooks store: `this.hooksStore = createHooksStore(() => this.$forceUpdate())` (`src/util/hooks.js`). Call `beginRender()` before the hook calls and `endRender()` after in `render`, flush effects in `mounted`/`updated`, and `cleanup()` in `beforeDestroy`/`beforeUnmount`. Each hook-using component needs its **own** store — a shared store breaks on conditionally-mounted subtrees (React gives each component its own hook context).
- Render with **`renderReactCompat`** (not `renderCompat`) so `className` → `class`, `onX` → listeners, and `ref` MutableRefs are bridged (Vue 2 vnode `insert`/`destroy` hooks; Vue 3 function refs). `renderCompat`'s augmenter drops vnode `hook`s, so it can't carry refs.
- Use the plain-function `Fragment` from `vue-compat` (never Vue 3's native `Fragment` symbol — it adds whitespace/anchor nodes that break shared snapshots).
- Testing gotcha: boolean attrs serialize differently across versions (`hidden="hidden"` in Vue 2, `hidden=""` in Vue 3) — assert on the DOM `.hidden` property, not the attribute string. Focus/`ref.focus()` are no-ops on detached nodes, so mount with `attachTo: document.body`.

See `src/components/Carousel.js` (+ `RelatedProducts.js` which uses it as an opt-in layout) for a worked example.

## Working here

```bash
yarn workspace vue-instantsearch build
yarn jest packages/vue-instantsearch/src/components/__tests__/<Pascal>   # from repo root
```

- Vue 2/3 dual support: run `./scripts/prepare-vue3.js` (root `yarn prepare-vue3`) when switching the working tree to Vue 3. Don't assume one Vue version — changes must work for both.
- Cross-flavor behavior lives in `tests/common/widgets/<name>/`; register it in this package's `common-widgets.test.*`.
