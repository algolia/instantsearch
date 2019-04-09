# Federated Search

This document lists all the changes/impacts that the implementation of federated search required (on both the Algoliasearch Helper & InstantSearch.js). The goal is to be as clear as possible on the changes to avoid hidden issues. It’s also an opportunity to explain the changes/implementation and get feedback on parts that might have been forgotten. This document is based on the [Federated Search RFC](https://github.com/algolia/instantsearch-rfcs/blob/master/accepted/federated-search-instantsearch.md), we won't discuss high-level API in it. Those subjects have already been tackled in the RFC. Here is an example to showcase the wanted API:

```js
const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
});

search.addWidgets([
  instantsearch.widgets.configure({
    hitsPerPage: 50,
  }),
  instantsearch.widgets.searchBox({
    container: '#search-box',
  }),

  index({ indexName: 'instant_search' }).addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: 4,
    }),
    instantsearch.widgets.hits({
      container: '#instant-search-hits',
    }),
  ]),

  index({ indexName: 'bestbuy' }).addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: 4,
    }),
    instantsearch.widgets.hits({
      container: '#best-buy-hits',
    }),
  ]),
]);
```

## Problem

The current implementation of InstantSearch.js is highly tied to the `AlgoliasearchHelper` (`Helper`). The `Helper` is always tied to a **singular** index. We use it for almost everything inside InstantSearch.js, it's his responsibility to: manage the state, trigger the search, trigger the render, trigger the URLSync. EVERYWHERE. The main pain point describe above is the fact that it's tied to a single index.

### Usage of the DerivedHelper

The `Helper` provides an API to trigger multiple queries from the main instance, it's called the [`DerivedHelper`](https://community.algolia.com/algoliasearch-helper-js/reference.html#derive-multi-queries). We can leverage this function to target multiple indices for example. To create a `DerivedHlper` we call the `derive` function. It takes a derivation function as an argument that must return an instance of the `SearchParameters`. The `derive` function returns an instance of a `DerivedHelper` which is basically an `EventEmitter`. It provides none of the API that the regular `Helper` can provide e.g. `setQuery`, `setPage`, ... The only part that allows controlling which state is sent with the request is the derivation function. It means that we can't switch the usage of a regular `Helper` for a `Derived` one (e.g. at the widget level) since it does not provide the same API.

- node with helper + derivedHelper
- duplication of information between node/index

### Merge of the SearchParameters

To implement a proper federated search support inside InstantSearch.js we have to merge the parameters from top to bottom. Basically the widgets scoped under an `index` inherits from the widgets above. The merge of the parameters consist of a merge of multiple `SearchParameters` (`state` of the `Helper`). The implementation of the `class` does not help to easily merge those objects. Inside the `constructor` we have [a lot of default values](https://github.com/algolia/algoliasearch-helper-js/blob/develop/src/SearchParameters/index.js#L91-L473) that often fallback to `undefined` (see below). The main issue with this structure is that we can't merge the value top to bottom since we can't determine whether or not the value is inherited from the parent. We could find a solution for the `undefined` values but not for `query` and `page`.

```js
algoliasearchHelper.SearchParameters.make({
  index: 'instant_search'
});

// {
//   "index": "instant_search",
//   "query": "", <-- always override the parent
//   "page": 0, <-- always override the parent
//   "facets": [],
//   "disjunctiveFacets": [],
//   "hierarchicalFacets": [],
//   [...]
//   "numericFilters": undefined,
//   "tagFilters": undefined,
//   "optionalTagFilters": undefined,
//   "optionalFacetFilters": undefined,
//   "hitsPerPage": undefined,
//   ...
// }
```

- SearchParameters without default values (excpect for controlled)
- `getConfiguration` have to return default values (potentially `getSearchParameters`)
- careful about the meaning of the function call e.g. `setQuery()`, `setQuery('')`, `setQuery('value')`
- careful about the implementation that was relying on those default value mostly `query` & `page`

> https://algolia.atlassian.net/secure/RapidBoard.jspa?rapidView=10&projectKey=IFW&modal=detail&selectedIssue=IFW-507

### Controlled search request

The federated search implementation allows multiple `index` widgets to share the same index identifier. The different `SearchParameters` are merged in the order they appear inside the tree, the latter takes precedence. This is also true for the top level one (the main instance). With the `index` widgets it's not an issue because they use the `DerivedHelper` API. We can control which state is used for the request with the derivation function. On the other hand for the main instance, we have an issue. The `Helper` is a black box we can alter the request only once we change the state, but this is exactly what we want to avoid in that case. We want to alter the request **without** changing the state. We can’t mutate it because it means that the inner `index` widgets will inherit from this updated state.

- allow the `.search()` function to take a state as argument (dirty but it works)
- the correct solution would be to treat the top level like a DerivedHelper but we can't avoid the "main" request
- resolve the nodes that share the same identifier (current one, but also for the parent)

> https://algolia.atlassian.net/secure/RapidBoard.jspa?rapidView=10&projectKey=IFW&modal=detail&selectedIssue=IFW-510

### Automatically reset the page

One of the feature of the `Helper` is to [reset the page "automagically"](https://community.algolia.com/algoliasearch-helper-js/concepts.html#smart-page-behaviour) on most state changes. The purpose of the federeated search API is to share widgets across different indices. Common use case for that is to share a top level `searchBox` with multiple `index` that have a list of `hits` and a `pagination` (see below). Each time the `searchBox` is updated we have to reset the page of the indices below the tree. We can't apply a reset blindly because the part of the state might be "controlled" or "uncontrolled". On a part of the state that is "controlled" we actually reset the page to 0; on a part that is "uncontrolled" we omit the value otherwise the parent lose the control.

```js
const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#search-box',
  }),

  index({ indexName: 'instant_search' }).addWidgets([
    instantsearch.widgets.hits({
      container: '#instant-search-hits',
    }),
    instantsearch.widgets.pagination({
      container: '#instant-search-pagination', // <-- How do we reset this widget?
    }),
  ]),

  index({ indexName: 'bestbuy' }).addWidgets([
    instantsearch.widgets.hits({
      container: '#best-buy-hits',
    }),
    instantsearch.widgets.pagination({
      container: '#best-buy-pagination', // <-- How do we reset this widget?
    }),
  ]),
]);
```

- differentiate set page vs reset page at the `Helper` level
- indicates inside the `emit` event that we've triggered a reset
- SearchParameters without `undefined` values otherwise we introduce ghost value that breaks the merge
- Walk on the tree to reset the part of the state that is "controlled" (test whether or not we have a value)

> https://algolia.atlassian.net/secure/RapidBoard.jspa?rapidView=10&projectKey=IFW&modal=detail&selectedIssue=IFW-519

### URLSync
