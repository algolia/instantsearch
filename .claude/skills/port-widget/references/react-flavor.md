# React Flavor (`react-instantsearch`)

## Package split

- `packages/react-instantsearch-core`: hooks that wrap `instantsearch.js` connectors
- `packages/react-instantsearch`: public widgets and optional React-only UI components

## Hook pattern

File: `packages/react-instantsearch-core/src/connectors/use<Pascal>.ts`

- Import the connector from `instantsearch.js/es/connectors/<widget>/connect<Pascal>`.
- Import `useConnector` and `AdditionalWidgetProperties` from `../hooks/useConnector`.
- Export `Use<Pascal>Props = <Pascal>ConnectorParams`.
- Pass `additionalWidgetProperties` through to `useConnector(...)`.

## Widget pattern

Choose the closest precedent before writing code:

- Shared UI component wrapper: `Hits.tsx`, `RelatedProducts.tsx`, `TrendingItems.tsx`, `FilterSuggestions.tsx`
- React-only presentational UI in `src/ui`: `SearchBox.tsx`, `RangeInput.tsx`, `RefinementList.tsx`, `Menu.tsx`, `MenuSelect.tsx`, `SortBy.tsx`

### If the UI is shared via `instantsearch-ui-components`

- Instantiate the factory with `createElement as Pragma` and `Fragment`.
- Keep connector params separate from UI-only props.
- Pass `{ $$widgetType: 'ais.<camelName>' }` as the second argument to the hook.
- Use `useInstantSearch()` only when the UI needs search status or other top-level state.
- Only add `useMemo` or `useCallback` when an adjacent widget uses them to stabilize component props passed into a shared UI factory.

### If no shared factory exists (React-only UI)

- Create `packages/react-instantsearch/src/ui/<Pascal>.tsx` for the presentational component. This applies to all widgets without a shared factory — even simple ones like `MenuSelect` (a plain `<select>`).
- Keep the widget file focused on mapping hook state and event handlers into the UI component.

### Variant widgets (shared connector)

Some widgets reuse another widget's hook instead of having a dedicated one. For example, `MenuSelect` uses `useMenu` (not `useMenuSelect`). In this case:
- Import the existing hook directly in the widget file.
- Pick only the relevant connector params (e.g., exclude `showMore`/`showMoreLimit` for `MenuSelect`).
- Set a distinct `$$widgetType` (e.g., `'ais.menuSelect'`).

## Registration checklist

- Export the hook from `packages/react-instantsearch-core/src/index.ts` (skip for variant widgets that reuse an existing hook).
- Export the widget from both `packages/react-instantsearch/src/widgets/index.ts` and `index.umd.ts`.
- If the widget is public, `packages/react-instantsearch/src/index.ts` already re-exports it through `./widgets`.
- Add the widget to the switch in `packages/react-instantsearch/src/widgets/__tests__/__utils__/all-widgets.tsx` with required minimum props (e.g., `attribute="brand"`).
- In `packages/react-instantsearch/src/__tests__/common-widgets.test.tsx`:
  - Replace the `throw new Error('X is not supported in React InstantSearch')` with real setup code.
  - Remove the `skippedTests` entry for the widget in `testOptions`.
