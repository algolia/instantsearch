# react-instantsearch

React DOM bindings. This package = **hooks (from `react-instantsearch-core`) + UI markup (from `instantsearch-ui-components`)**. The search logic itself is the connector in `instantsearch-core`; don't reimplement it here.

`react-instantsearch-core` also does `export * from 'instantsearch-core'`, and this package inherits it, so users import connectors, routers (`historyRouter`), state mappings, middlewares and types (`Hit`, `UiState`, …) from `react-instantsearch` and never install `instantsearch.js` or `instantsearch-core`. When a name collides with a core export, add an explicit `export { … }` next to the star export so the React one wins (`InstantSearch`, `SortBy`); `__tests__/core-reexports.test.ts` guards this. Don't import `instantsearch.js` anywhere under `packages/react-instantsearch*` (oxlint bans it).

## Layer split (where each thing goes)

- `packages/react-instantsearch-core/src/connectors/use<Pascal>.ts` — the **hook** that wraps the `instantsearch-core` connector. Headless, no DOM. Exported from that package's `src/index.ts`.
- `packages/react-instantsearch/src/widgets/<Pascal>.tsx` — the **component**: calls the hook, renders UI. Exported from `src/widgets/index.ts`.
- `packages/react-instantsearch/src/ui/<Pascal>.tsx` — local presentational component, only when the markup isn't already in the shared `instantsearch-ui-components` package.

So adding/changing a React widget often touches `react-instantsearch-core` (hook) **and** `react-instantsearch` (component) — keep them in sync.

## Working here

```bash
yarn lerna run build --scope react-instantsearch
yarn lerna run build --scope react-instantsearch-core
yarn jest packages/react-instantsearch/src/widgets/__tests__/<Pascal>   # from repo root
```

- Uses React 19 / `@testing-library/react` for tests, co-located in `__tests__/`.
- Cross-flavor behavior lives in `tests/common/widgets/<name>/`; register it in this package's `common-widgets.test.*`.
- Prefer shared UI from `instantsearch-ui-components` (consume `create<Name>Component` with React's `createElement`) over new local `ui/` components. **Creating or changing a shared component is the `instantsearch-ui-components` package's job** — do that there, then consume it here. Add a local `src/ui/` component only when the markup truly isn't shareable.
