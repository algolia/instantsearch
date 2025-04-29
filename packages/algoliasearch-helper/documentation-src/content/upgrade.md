---
layout: documentation.pug
title: Upgrade guides
---

## Upgrade to version 3

We are preparing to integrate the Helper directly inside InstantSearch, and for this are making some breaking changes. If you are happy using the current version of the Helper, there's no pressing need for you to upgrade to the next version. If you want to migrate to the next version of the Helper, breaking changes are in the following places:

### Lodash

We have fully migrated away from lodash in v3. This means that there are some cases which used to accept incorrect shapes (objects where it should be arrays) will throw errors now.

### URL sync

Synchronizing to the URL is no longer a responsibility of the Helper, but instead now it's a responsibility of the routing functionality of InstantSearch. This means the following methods no longer exist:

- `algoliasearch-helper/url`
- `algoliasearchHelper.url`
- `getStateAsQueryString`
- `getConfigurationFromQueryString`
- `getForeignConfigurationInQueryString`
- `setStateFromQueryString`

### Events

The event payload now always is an object, instead of multiple arguments:

```js
helper.on('search', ({ state: SearchParameters, results: SearchResults }) => {
  //
});
helper.on(
  'change',
  ({
    state: SearchParameters,
    results: SearchResults,
    isPageReset: boolean,
  }) => {
    //
  }
);
helper.on(
  'searchForFacetValues',
  ({ state: SearchParameters, facet: string, query: string }) => {
    //
  }
);
helper.on('searchOnce', ({ state: SearchParameters }) => {
  //
});
helper.on('result', ({ results: SearchResults, state: SearchParameters }) => {
  //
});
helper.on('error', ({ error: Error }) => {
  //
});
helper.on('searchQueueEmpty', () => {
  //
});
```

### Default values

SearchParameters no longer contains a default value for the parameters, from the previous `undefined`, `""` or `0`, we now have no more values on the object by default, this means an empty SearchParameters now looks like this:

```json
{
  "facets": [],
  "disjunctiveFacets": [],
  "hierarchicalFacets": [],
  "facetsRefinements": {},
  "facetsExcludes": {},
  "disjunctiveFacetsRefinements": {},
  "numericRefinements": {},
  "tagRefinements": [],
  "hierarchicalFacetsRefinements": {}
}
```

### Errors on getters

There were multiple places in SearchParameters or SearchResults which would throw an error when e.g. a refinement is requested which isn't set up via facets. This behavior was confusing, and especially unhelpful in InstantSearch where we have situations where we try to fetch before the results are in. We chose for that reason to migrate those cases to the default response:

- `SearchResults.getFacetValues` -> undefined
- `SearchResults.getFacetStats` -> undefined
- `SearchParameters.getConjunctiveRefinements` -> []
- `SearchParameters.getDisjunctiveRefinements` -> []
- `SearchParameters.getExcludeRefinements` -> []
- `SearchParameters.getHierarchicalFacetBreadcrumb` -> []
- `SearchParameters.isFacetRefined` -> false
- `SearchParameters.isExcludeRefined` -> false
- `SearchParameters.isDisjunctiveFacetRefined` -> false
- `SearchParameters.isHierarchicalFacetRefined` -> false

### Removed methods

- `getQueryParameter` & `helper.state.getQueryParameter`

```
// With getQueryParameter
helper.getQueryParameter('hitsPerPage');

// Without getQueryParameter
helper.state.hitsPerPage;
```

- `helper.state.filter`

You need to filter the returned object yourself using e.g. `Object.fromEntries(Object.entries(helper.state).filter(/**/))`

- `helper.state.mutateMe`

- `helper.getState` -> `helper.state`

- `helper.isRefined` -> `helper.hasRefinements`
