---
title: Creating widgets
layout: guide.pug
category: guide
navWeight: 2
---

If you wish to implement features that are not covered by the default widgets connectors, you will need to create your own connector via the `createConnector` method. This methods takes in a descriptor of your connector with the following properties and methods:

## Creating your own connector

### displayName, propTypes, defaultProps

Those properties are directly applied to the higher-order component. Providing a `displayName` is mandatory.

### getProps(props, state, search, meta)

This method should return the props to forward to the composed component.

`props` are the props that were provided to the higher-order component.

`state` holds the state of all widgets, with the shape `{[widgetId]: widgetState}`. Stateful widgets describe the format of their state in their respective documentation entry.

`search` holds the search results, search errors and search loading state, with the shape `{results: ?SearchResults, error: ?Error, loading: bool}`. The `SearchResults` type is described in the [Helper's documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchresults).

`meta` is the list of metadata from all widgets whose connector defines a `getMetadata` method.

### refine(props, state, ...args)

This method defines exactly how the `refine` prop of connected widgets affects the InstantSearch state.

It takes in the current props of the higher-order component, the state of all widgets, as well as all arguments passed to the `refine` and `createURL` props of stateful widgets, and returns a new state.

```javascript
const CoolWidget = createConnector({
  displayName: 'CoolWidget',

  getProps(props, state) {
    // Since the `queryAndPage` state entry isn't necessarily defined, we need
    // to default its value.
    const [query, page] = state.queryAndPage || ['', 0];

    // Connect the underlying component to the `queryAndPage` state entry.
    return {
      query: state.queryAndPage[0],
      page: state.queryAndPage[1],
    }
  },

  refine(props, state, newQuery, newPage) {
    // When the underlying component calls its `refine` prop, update the state
    // with the new query and page.
    return {
      // `state` represents the state of *all* widgets. We need to extend it
      // instead of replacing it, otherwise other widgets will lose their
      // respective state.
      ...state,
      queryAndPage: [newQuery, newPage],
    };
  },
})(props =>
  <div>
    The query is {props.query}, the page is {props.page}.
    {/*
      Clicking on this button will update the state to:
      {
        ...otherState,
        query: 'algolia',
        page: 20,
      }
    */}
    <button onClick={() => props.refine('algolia', 20)} />
    {/*
      Clicking on this button will update the state to:
      {
        ...otherState,
        query: 'instantsearch',
        page: 15,
      }
    */}
    <button onClick={() => props.refine('instantsearch', 15)} />
  </div>
);
```

In the example above, we create a widget that reads and manipulates the `queryAndPage` state entry. However, we haven't described how those entries should affect the search parameters passed to the Algolia client just yet.

### getSearchParameters(searchParameters, props, state)

This method applies the current props and state to the provided `SearchParameters`, and returns a new `SearchParameters`. The `SearchParameters` type is described in the [Helper's documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchparameters).

Every time the props or state of a widget change, all the `getSearchParameters` methods of all the registered widgets are called in a chain to produce a new `SearchParameters`. Then, if the output `SearchParameters` differs from the previous one, a new search is triggered.

As such, the `getSearchParameters` method allows you to describe how the state and props of a widget should affect the search parameters.

```javascript
const CoolWidget = createConnector({
  // displayName, getProps, refine

  getSearchParameters(searchParameters, props, state) {
    // Since the `queryAndPage` state entry isn't necessarily defined, we need
    // default its value.
    const [query, page] = state.queryAndPage || ['', 0];

    // When the `queryAndPage` state entry changes, update the query and page of
    // search.
    return searchParameters
      .setQuery(query)
      .setPage(page);
  },
})(Widget);
```

### getMetadata(props, state)

This method allows the widget to register a custom `metadata` object for any props and state combination.

If your widget is stateful, the corresponding URL key should be declared on the metadata object as the `id` property, so that the `InstantSearch` component can determine which URL keys it controls and which are foreign and should be left intact.

The metadata object also allows you to declare any data that you would like to pass down to all other widgets. The list of metadata objects of all components is available as the fourth argument to the `getProps` method.

The `CurrentRefinements` widget leverages this mechanism in order to allow any widget to declare the filters it has applied. If you want to add your own filter, declare a `filters` property on your widget's metadata object:

```javascript
const CoolWidget = createConnector({
  // displayName, getProps, refine, getSearchParameters

  getMetadata(props, state) {
    // Since the `queryAndPage` state entry isn't necessarily defined, we need
    // default its value.
    const [query, page] = state.queryAndPage || ['', 0];

    const filters = [];
    if (query !== '') {
      filters.push({
        // Unique identifier for this filter.
        key: `queryAndPage.query`,
        // String label (or node) that should appear in the CurrentRefinements
        // component.
        label: `Query: ${query}`,
        // Describes how clearing this filter affects the InstantSearch state.
        // In our case, clearing the query just resets it to an empty string
        // without affecting the page.
        clear: nextState => {
          return {
            ...nextState,
            // Do not depend on the current `state` here. Since filters can be
            // cleared in batches, the `state` parameter is not up-to-date when
            // this method is called.
            queryAndPage: ['', nextState.queryAndPage[1]],
          };
        },
      });
    }

    if (page !== 0) {
      filters.push({
        key: `queryAndPage.page`,
        label: `Page: ${page}`,
        clear: nextState => {
          return {
            ...nextState,
            queryAndPage: [nextState.queryAndPage[0], 0],
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
