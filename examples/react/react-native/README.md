# React InstantSearch with React Native

[![Edit react-native](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/algolia/instantsearch/tree/master/examples/react/react-native)

This example shows how to use React InstantSearch with React Native (Expo). Because `react-instantsearch-core` ships headless hooks (no DOM widgets), every widget below is built from those hooks and plain React Native primitives — no `react-native-svg` or other native UI dependencies required.

## Widgets

Each widget lives in its own file under [`src/`](./src) so it can be copied into your own app:

| Widget | File | Hook / connector |
| --- | --- | --- |
| Search box | `SearchBox.tsx` | `useSearchBox` |
| Infinite scroll results | `InfiniteHits.tsx` | `useInfiniteHits` |
| Highlighting | `Highlight.tsx` | `getHighlightedParts` |
| Snippeting | `Snippet.tsx` | `getHighlightedParts` (`_snippetResult`) |
| Star rating (display) | `Rating.tsx` | — |
| Category drill-down | `HierarchicalMenu.tsx` | `useHierarchicalMenu` |
| Searchable brand facet | `RefinementList.tsx` | `useRefinementList` |
| Price range inputs | `PriceRange.tsx` | `useRange` |
| Free-shipping switch | `ToggleRefinement.tsx` | `useToggleRefinement` |
| Ratings facet | `RatingMenu.tsx` | `useConnector(connectRatingMenu)` |
| Sort between replicas | `SortBy.tsx` | `useSortBy` |
| Result count / timing | `Stats.tsx` | `useStats` |
| Active refinement chips | `CurrentRefinements.tsx` | `useCurrentRefinements` |
| Filters modal (composes the facets) | `Filters.tsx` | `useClearRefinements`, `useCurrentRefinements` |
| Empty state | `NoResults.tsx` | `useInstantSearch`, `useClearRefinements` |

> `RatingMenu` shows the escape hatch for connectors that don't yet have a
> dedicated hook: wrap the vanilla `connectRatingMenu` connector with
> `useConnector`.

## Recommend

Algolia Recommend runs through the same `searchClient` (the v5 `algoliasearch/lite` client exposes `getRecommendations`), so no extra client is needed. Tapping a product opens `ProductDetail.tsx`, which shows three model-backed carousels; a "Trending" carousel also sits atop the results list.

| Widget | File | Hook |
| --- | --- | --- |
| Related products | `Recommend.tsx` | `useRelatedProducts` |
| Frequently bought together | `Recommend.tsx` | `useFrequentlyBoughtTogether` |
| Looking similar | `Recommend.tsx` | `useLookingSimilar` |
| Trending items | `Recommend.tsx` | `useTrendingItems` |

`Carousel.tsx` and `ProductCard.tsx` are the presentational pieces shared by all four.

## Query suggestions & recent searches

Focusing the search box reveals `Suggestions.tsx`. Suggestions are fetched through a nested `<Index indexName="instant_search_demo_query_suggestions">` + `useHits`, so they ride along in the same multi-index request as the main search — no second InstantSearch instance. Recent searches are persisted to `AsyncStorage` (`recentSearches.ts`) since `localStorage` doesn't exist in React Native.

## Routing & analytics adapters

The DOM-coupled parts of InstantSearch are replaced with React Native equivalents:

| Concern | File | What it does |
| --- | --- | --- |
| Routing | `router.ts` | A custom `Router` persisting UI state to `AsyncStorage` (the built-in history router needs `window.history`/URLs). State is hydrated before `<InstantSearch>` mounts because `router.read()` is synchronous. |
| Insights | `insights.ts` | A minimal Insights client that `POST`s events with `fetch` and keeps the user token in memory, avoiding the CDN `<script>` and `document.cookie`. Wired via `insights={{ insightsClient, insightsInitParams: { useCookie: false } }}`; clicks are reported from `InfiniteHits.tsx` via `sendEvent`. |

> This example depends on `@react-native-async-storage/async-storage` for the
> routing and recent-searches persistence above.

## Clone the example

```sh
curl https://codeload.github.com/algolia/instantsearch/tar.gz/master | tar -xz --strip=3 instantsearch-master/examples/react/react-native
```

## Start the example

```sh
yarn install --no-lockfile
yarn run start
```

Read more about React InstantSearch [in our documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/).
