---
title: Custom connectors
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 45
---

If you wish to implement features that are not covered by the default widgets connectors,
you will need to create your own connector via the `createConnector` method.

We tried very hard to make React InstantSearch a pluggable library that is able to solve
most use cases in with simple API entries. But we could not plan everything and thus
in some cases the current API may not be able to fulfill this promise of simplicity.

If that's not the case or in doubt, **before diving into custom connectors**
please expose us your use case and come ask us questions on [discourse](https://discourse.algolia.com/tags/react-instantsearch)
or [GitHub](https://github.com/algolia/react-instantsearch/issues) first. We will be glad
that you do so.

If you are confident `createConnector` is what you need, here's its API:

## `const connector = createConnector(implementation)`

`implementation` is an object whose shape and properties matches the following conventions:

## `{displayName, propTypes, defaultProps}`

Those properties are directly applied to the higher-order component. Providing a `displayName` is mandatory.

## `getProvidedProps(props, searchState, searchResults, meta, searchForFacetValuesResults)`

This method should return the props to forward to the composed component.

`props` are the props that were provided to the higher-order component.

`searchState` holds the search state of all widgets. You can find the shape of all widgets search state in [the corresponding guide](guide/Search_state.html).

`searchResults` holds the search results, search errors and search loading state, with the shape `{results: ?SearchResults, error: ?Error, loading: bool}`. The `SearchResults` type is described in the [Helper's documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchresults).

`meta` is the list of metadata from all widgets whose connector defines a `getMetadata` method.

`searchForFacetValuesResults` holds the search for facet values results.

## `refine(props, searchState, ...args)`

This method defines exactly how the `refine` prop of widgets affects the search state.

It takes in the current props of the higher-order component, the [search state](guide/Search_state.html) of all widgets, as well as all arguments passed to the `refine` and `createURL` props of stateful widgets, and returns a new state.

```jsx
import {createConnector} from 'react-instantsearch';

const CoolWidget = createConnector({
  displayName: 'CoolWidget',

  getProvidedProps(props, searchState) {
    // Since the `queryAndPage` searchState entry isn't necessarily defined, we need
    // to default its value.
    const [query, page] = searchState.queryAndPage || ['', 0];

    // Connect the underlying component to the `queryAndPage` searchState entry.
    return {
      query,
      page,
    }
  },

  refine(props, searchState, newQuery, newPage) {
    // When the underlying component calls its `refine` prop, update the searchState
    // with the new query and page.
    return {
      // `searchState` represents the search state of *all* widgets. We need to extend it
      // instead of replacing it, otherwise other widgets will lose their
      // respective state.
      ...searchState,
      queryAndPage: [newQuery, newPage],
    };
  },
})(props =>
  <div>
    The query is {props.query}, the page is {props.page}.
    {/*
      Clicking on this button will update the searchState to:
      {
        ...otherSearchState,
        query: 'algolia',
        page: 20,
      }
    */}
    <button onClick={() => props.refine('algolia', 20)} />
    {/*
      Clicking on this button will update the searchState to:
      {
        ...otherSearchState,
        query: 'instantsearch',
        page: 15,
      }
    */}
    <button onClick={() => props.refine('instantsearch', 15)} />
  </div>
);
```

In the example above, we create a widget that reads and manipulates the `queryAndPage` state entry. However, we haven't described how those entries should affect the search parameters passed to the Algolia client just yet.

## `getSearchParameters(searchParameters, props, searchState)`

This method applies the current props and state to the provided `SearchParameters`, and returns a new `SearchParameters`. The `SearchParameters` type is described in the [Helper's documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchparameters).

Every time the props or state of a widget change, all the `getSearchParameters` methods of all the registered widgets are called in a chain to produce a new `SearchParameters`. Then, if the output `SearchParameters` differs from the previous one, a new search is triggered.

As such, the `getSearchParameters` method allows you to describe how the state and props of a widget should affect the search parameters.

```jsx
import {createConnector} from 'react-instantsearch';

const CoolWidget = createConnector({
  // displayName, getProvidedProps, refine

  getSearchParameters(searchParameters, props, searchState) {
    // Since the `queryAndPage` state entry isn't necessarily defined, we need
    // to default its value.
    const [query, page] = state.queryAndPage || ['', 0];

    // When the `queryAndPage` state entry changes, update the query and page of
    // search.
    return searchParameters
      .setQuery(query)
      .setPage(page);
  },
})(Widget);
```

## `getMetadata(props, searchState)`

This method allows the widget to register a custom `metadata` object for any props and state combination.

If your widget is stateful, the corresponding URL key should be declared on the metadata object as the `id` property, so that the `InstantSearch` component can determine which URL keys it controls and which are foreign and should be left intact.

The metadata object also allows you to declare any data that you would like to pass down to all other widgets. The list of metadata objects of all components is available as the fourth argument to the `getProvidedProps` method.

The `CurrentRefinements` widget leverages this mechanism in order to allow any widget to declare the filters it has applied. If you want to add your own filter, declare a `filters` property on your widget's metadata object:

```jsx
import {createConnector} from 'react-instantsearch';

const CoolWidget = createConnector({
  // displayName, getProvidedProps, refine, getSearchParameters

  getMetadata(props, searchState) {
    // Since the `queryAndPage` searchState entry isn't necessarily defined, we need
    // to default its value.
    const [query, page] = searchState.queryAndPage || ['', 0];

    const filters = [];
    if (query !== '') {
      filters.push({
        // Unique identifier for this filter.
        key: `queryAndPage.query`,
        // String label (or node) that should appear in the CurrentRefinements
        // component.
        label: `Query: ${query}`,
        // Describes how clearing this filter affects the InstantSearch searchState.
        // In our case, clearing the query just resets it to an empty string
        // without affecting the page.
        clear: nextSearchState => {
          return {
            ...nextSearchState,
            // Do not depend on the current `searchState` here. Since filters can be
            // cleared in batches, the `searchState` parameter is not up-to-date when
            // this method is called.
            queryAndPage: ['', nextSearchState.queryAndPage[1]],
          };
        },
      });
    }

    if (page !== 0) {
      filters.push({
        key: `queryAndPage.page`,
        label: `Page: ${page}`,
        clear: nextSearchState => {
          return {
            ...nextSearchState,
            queryAndPage: [nextSearchState.queryAndPage[0], 0],
          };
        },
      });
    }

    return {
      // This widget manipulates the `queryAndPage` state entry.
      id: 'queryAndPage',
      filters,
    };
  },
})(Widget);
```

## `searchForFacetValues(props, searchState, nextRefinement)`

This method needs to be implemented if you want to have the ability to perform a search for facet values inside your widget.

It takes in the current props of the higher-order component, the [search state](guide/Search_state.html) of all widgets, as well as all arguments passed to the `searchForFacetValues` props of stateful widgets, and returns an
object of the shape: `{facetName: string, query: string, maxFacetHits?: number}`. The default value for the `maxFacetHits` is the one set by [the API](https://www.algolia.com/doc/api-reference/api-parameters/maxFacetHits) which is `10`.

```jsx
import {createConnector} from 'react-instantsearch';

const CoolWidget = createConnector({
  // displayName, getProvidedProps, refine, getSearchParameters, getMetadata

  searchForFacetValues(props, searchState, nextRefinement) {
    return {facetName: props.attribute, query: nextRefinement};
  },
})(Widget);
```
## `cleanUp(props, searchState)`

This method is called when a widget is about to unmount in order to clean the searchState.

It takes in the current props of the higher-order component and the searchState of all widgets and expect a new searchState in return.

`props` are the props that were provided to the higher-order component.

`searchState` holds the searchState of all widgets, with the shape `{[widgetId]: widgetState}`. Stateful widgets describe the format of their searchState in their respective documentation entry.

```jsx
import {omit} from 'lodash';
import {createConnector} from 'react-instantsearch';

const CoolWidget = createConnector({
  // displayName, getProvidedProps, refine, getSearchParameters, getMetadata

  cleanUp(props, searchState) {
    return omit('queryAndPage', searchState)
  },
})(Widget);
```

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Multi_index.html">← Multi_index</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Conditional_display.html">Conditional Display →</a>
    </div>
</div>
