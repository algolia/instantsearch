# Migrating to InstantSearch v4

This latest version of InstantSearch is focused mostly around Federated Search, as well as bundle size. To achieve this, we have made some changes which impact your apps. These changes are detailed here:

## Federated Search (multi-index)

If you were already using federated search, likely via synchronizing two InstantSearch indices via `searchFunction`, you can now rejoice that this is simpler. There's now a new `index` widget, upon which you can attach more widgets. An example use case is the following:

```js
const search = instantsearch({ indexName: 'primary', /* ... */ });

search.addWidgets([
  searchBox(),
  hits(),
  index({ indexName: 'secondary' }).addWidgets([
    searchBox(),
    hits(),
  ])
]);
```

A more detailed guide on this topic will follow once this version is out of beta stage.

## Routing

Even if you are not using multi-index, the UiState has changed shape; what used to be:

```json
{
  "query": "value",
  "page": 5
}
```

Is now:

```json
{
  "indexName": {
    "query": "value",
    "page": 5
  }
}
```

If you are using the default stateMapping with the current version, you can replace that with `singleIndexStateMapping('yourIndexName')` (import from `instantsearch.js/es/lib/stateMappings`).

If you were using a custom stateMapping, you need to loop over the outer level of index, and add this extra level back in `routeToState`. You can check the [source](https://github.com/algolia/instantsearch.js/blob/next/src/lib/stateMappings/singleIndex.ts) for reference on how to implement this. A stateMapping where you map only some of the properties for example would change like this:

```js
// before
const stateMapping = {
  stateToRoute(uiState) {
    return {
      query: uiState.query,
      page: uiState.page,
      // ...
    };
  },

  routeToState(routeState) {
    return {
      query: routeState.query,
      page: routeState.page,
      // ...
    };
  },
};

// after
const stateMapping = {
  stateToRoute(uiState) {
    const indexUiState = uiState[indexName];
    return {
      query: indexUiState.query,
      page: indexUiState.page,
      // ...
    };
  },

  routeToState(routeState) {
    return {
      [indexName]: {
        query: routeState.query,
        page: routeState.page,
        // ...
      },
    };
  },
};
```

### Configure

The `configure` widget is now included in the UiState. If you want to exclude this from the URL (because it's usually static, or it allows users to add arbitrary search parameters), you can either use the default stateMappings which exclude it, or exclude it yourself in a custom state mapping. This has to be done both in `stateToRoute` to prevent it appearing in the URL, and `routeToState` to prevent it from applying from the URL. You can check the [source](https://github.com/algolia/instantsearch.js/blob/next/src/lib/stateMappings/simple.ts) for inspiration.

## Helper

This release includes v3 of the `algoliasearch-helper` package. If you are using the built-in widgets, nothing will change for you. This version no longer includes `lodash`, having two main places of impact for users. The main difference will be in bundle size, which is now significantly smaller (`algoliasearch-helper` standalone has gone from 27.5 kB gz to now 9.1 kB gz). If you are using any methods from the `helper` or `searchResults`, please see the detailed changelog [here](https://github.com/algolia/algoliasearch-helper-js/blob/next/documentation-src/metalsmith/content/upgrade.md).

## `addWidget` & `removeWidget`

The function `search.addWidget(myWidget)` is now deprecated. You can replace it with `search.addWidgets([myWidget])`. This makes it simpler to see the structure of nested applications. The identical migration also happens for `removeWidget(myWidget)` to `removeWidgets([myWidget])`.

## Custom widgets

As mentioned earlier, any reference to the helper now contains the "new helper", as well as the `getConfiguration` life cycle no longer being used. You can replace its usage with `getWidgetSearchParameters` and `getWidgetState`. Note that this means that your custom widget will also take part in routing from then on. You can still exclude it from the URL via `stateMapping`.

### getConfiguration

This life cycle could be used for setting up a facet, or a default refinement previously. This is now replaced by `getWidgetState` and `getWidgetSearchParameters`. This means that there's no longer a separate step for setting up. However, that can be implemented using a check inside `getWidgetSearchParameters`. Code like this (abbreviated):

```js
const widget = {
  getConfiguration(searchParams) {
    return {
      disjunctiveFacets: ['myAttribute'],
    };
  },
  getWidgetSearchParameters(searchParameters, { uiState }) {
    return searchParameters
      .addDisjunctiveFacetRefinement(
        'myAttribute',
        uiState.myWidgetName.myAttribute
      );
  },
  getWidgetState(uiState, { searchParameters }) {
    return {
      ...uiState,
      myWidgetName: {
        myAttribute: searchParameters.getDisjunctiveRefinements('myAttribute')
      }
    };
  }
};
```

Will become like this:

```js
const widget = {
  getWidgetSearchParameters(searchParameters, { uiState }) {
    return searchParameters
      .addDisjunctiveFacet('myAttribute')
      .addDisjunctiveFacetRefinement(
        'myAttribute',
        uiState.myWidgetName.myAttribute
      );
  },
  getWidgetState(uiState, { searchParameters }) {
    return {
      ...uiState,
      myWidgetName: {
        myAttribute: searchParameters.getDisjunctiveRefinements('myAttribute')
      }
    };
  }
};
```

## connectAutoComplete

The `indices` option has been removed, in favour of using `index` widgets (see the federated search section). In practice, this:

```js
const autocomplete = connectAutocomplete(() => {/* ... */});

search.addWidget(
  autocomplete({
    indices: [{
      name: "additional"
    }]
  })
);
```

Will be replaced with this:

```js
const autocomplete = connectAutocomplete(() => {/* ... */});

search.addWidgets([
  index({ indexName: "additional" }),
  autocomplete()
]);
```

## onHistoryChange

This was a function which wasn't documented, and has been a no-op since InstantSearch v2, it has now been removed. Listening to changes in the URL can be done by creating a custom `router` and listening in the `write` hook. An example of this strategy is:

```js
const router = historyRouter()
const originalWrite = router.write.bind(router)
router.write = state => {
  console.log('listen to route state here');
  originalWrite(state)
}
```

## router

The `dispose` function on the `router` interface is now required. Its signature has also be updated (see below). Those changes shouldn't impact most codebases because the implementation of a custom router is not that common. The previous signature was tied to how widgets are working but a router is not a widget. We've updated the API to use a simpler signature that matches the actual usage better.

```ts
interface Router {
  // ...
  // Before
  dispose?({ helper, state }: { helper: AlgoliaSearchHelper, state: SearchParameters }): SearchParameters | void
  // After
  dispose(): void
}
```
