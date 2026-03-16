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
- React-only presentational UI in `src/ui`: `SearchBox.tsx`, `RangeInput.tsx`, `RefinementList.tsx`, `Menu.tsx`

### If the UI is shared

- Instantiate the factory with `createElement as Pragma` and `Fragment`.
- Keep connector params separate from UI-only props.
- Pass `{ $$widgetType: 'ais.<camelName>' }` as the second argument to the hook.
- Use `useInstantSearch()` only when the UI needs search status or other top-level state.
- Only add `useMemo` or `useCallback` when an adjacent widget uses them to stabilize component props passed into a shared UI factory.

### If the UI is React-only

- Put pure presentational code in `packages/react-instantsearch/src/ui/<Pascal>.tsx`.
- Keep the widget file focused on mapping hook state and event handlers into the UI component.

## Registration checklist

- Export the hook from `packages/react-instantsearch-core/src/index.ts`.
- Export the widget from `packages/react-instantsearch/src/widgets/index.ts`.
- If the widget is public, `packages/react-instantsearch/src/index.ts` already re-exports it through `./widgets`.
- Check `packages/react-instantsearch/src/widgets/__tests__/__utils__/all-widgets.tsx` when the new widget needs special minimum props for snapshot or registry coverage.
