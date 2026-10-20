# vue-instantsearch

Vue 2 **and** Vue 3 bindings (single source, built for both). Components wrap the `instantsearch.js` connectors — the logic isn't reimplemented here.

## Layout

- `src/components/<Pascal>.vue` (SFC) or `.js` (render function) — the component wrapping a connector. Exported from `src/widgets.js`.
- `src/mixins/` — shared connector-wiring logic reused across components.
- To reuse shared markup, import the `create<Name>Component` factory from `instantsearch-ui-components` and render it inside a **`renderCompat`** render function, passing Vue's `h` as `createElement` — e.g. `render: renderCompat((h) => h(createHitsComponent({ createElement: h }), { … }))` (see `src/components/Hits.js`). `renderCompat` (`src/util/vue-compat/`) is the Vue 2/3 render-fn shim. **Creating or changing the shared component itself is the `instantsearch-ui-components` package's job** — do that there, then consume the factory here.

## Consuming hook-based shared components (Carousel, Autocomplete, Chat)

Most shared factories are stateless markup and consume via `renderCompat` (above). But some are **hook-driven** (`createAutocompletePropGetters`, `createCarouselComponent`) — written against a React-style `Hooks` contract (`useState`/`useEffect`/`useRef`/`useMemo`/`useId`) and emitting React-style props (`className`, `onClick`, `ref={mutableRef}`). Vue can't supply React hooks natively, so:

- Give the component a hooks store with `mixins: [createHooksMixin()]` (`src/mixins/hooks.js`): it creates `this.hooksStore` (`src/util/hooks.js`), flushes effects in `mounted`/`updated` and cleans up on destroy. In `render`, call `this.hooksStore.beginRender()` before the hook calls and `endRender()` after. Each hook-using component needs its **own** store — a shared store breaks on conditionally-mounted subtrees (React gives each component its own hook context). Factories that call hooks internally take them as arguments — pass the store's (`createCarouselComponent({ createElement, Fragment, useEffect, useRef })`), never import them from `react`/`preact`.
- Create shared components **once per instance** with `this.getUiComponent(key, () => createXxxComponent({ createElement: h, … }))`, not on every render: the factories keep state across renders (`createChatPromptComponent` tracks the textarea for auto-resize through a ref Vue 2 only fires on insert; `createChatSidePanelLayoutComponent` holds a `WeakMap` of parent margins).
- Hook calls share one store, indexed by call order, so the tree's hook sequence must be stable across renders. Variable-count hooks (one per message, one per tool call) are fine only when they come last or live in their own Vue component (that's why the chat tool layouts are Vue components). A `useMemo` returning VNodes is safe to reuse across renders in both versions (Vue 2 skips an identical vnode in `patchVnode`, Vue 3 clones mounted vnodes and skips components whose `props` reference didn't change) — this is how `AisChat` avoids re-rendering finished messages while streaming.
- Overridable components (`headerComponent`, tool `layoutComponent`, …) are plain functions or Vue component objects: the React-compat `createElement` calls functions eagerly with the props and renders objects as child components. Expose them as scoped slots too (`AisChat` adapts `slot → (props) => slot(props)`, with the adapter cached per slot so memo deps stay stable).
- Render with **`renderReactCompat`** (not `renderCompat`) so `className` → `class`, `onX` → listeners, and `ref` MutableRefs are bridged (Vue 2 vnode `insert`/`destroy` hooks; Vue 3 function refs). `renderCompat`'s augmenter drops vnode `hook`s, so it can't carry refs.
- Use the plain-function `Fragment` from `vue-compat` (never Vue 3's native `Fragment` symbol — it adds whitespace/anchor nodes that break shared snapshots).
- Testing gotcha: boolean attrs serialize differently across versions (`hidden="hidden"` in Vue 2, `hidden=""` in Vue 3) — assert on the DOM `.hidden` property, not the attribute string. Focus/`ref.focus()` are no-ops on detached nodes, so mount with `attachTo: document.body`.
- Shared-suite gotcha (`tests/common`): the `vue` params of a flavored suite can't `import … from 'vue'` — Vue 2's types augment the global `JSX` namespace and break every React `<div />` in those `.tsx` files under `tsc`. Load Vue with `require` inside a function instead (see `tests/common/widgets/chat/utils.ts`: `vueH`, `createVueElement`). Vue re-renders asynchronously, so between a user interaction and the step that depends on it the shared test needs `await act(…)` (a no-op for JS/React).

See `src/components/Carousel.js` (+ `RelatedProducts.js` which uses it as an opt-in layout) and `src/components/Chat.js` (+ `chat/tools/`) for worked examples.

## Working here

```bash
yarn workspace vue-instantsearch build
yarn jest packages/vue-instantsearch/src/components/__tests__/<Pascal>   # from repo root
```

- Vue 2/3 dual support: run `./scripts/prepare-vue3.js` (root `yarn prepare-vue3`) when switching the working tree to Vue 3. Don't assume one Vue version — changes must work for both.
- Cross-flavor behavior lives in `tests/common/widgets/<name>/`; register it in this package's `common-widgets.test.*`.
