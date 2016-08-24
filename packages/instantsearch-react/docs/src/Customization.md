---
title: Making your own widgets
layout: api.ejs
nav_groups:
  - main
nav_sort: 5
---

# Making your own widgets

While instantsearch-react already provides widgets out of the box, there are cases where you need to implement a custom feature that isn't covered by the default widget set.

## Default widgets connectors

All default widgets have a corresponding higher-order component that acts as a connector, providing the required props to the widget.

Those connectors are available as named imports. Their name are composed of the `connect` prefix followed by the name of the particular widget they connect. For instance, the `SearchBox` widgets used the `connectSearchBox` higher-order component under the hood in order to retrieve the current query and to refine it.

### Stateful widgets

While some widgets hold no state, like the `Hits` widget which simply renders the available hits, others do. For instance, the `SearchBox` widget's state is the current query.

When a widget is stateful, its state will get serialized and persisted to the URL. The corresponding URL parameter key can be customized via the widget's `id` prop.

Stateful widgets are also provided with `refine` and `createURL` methods. The `refine(nextState)` method allows the widget to edit its state, while the `createURL(nextState)` method allows the widget to generate a URL for the corresponding state.

## Creating your own connectors

If you wish to implement features that are not covered by the default widgets connectors, you will need to create your own connector via the `createConnector` method. This methods takes in a descriptor of your connector with the following properties and methods:

### displayName, propTypes, defaultProps

Those properties are directly applied to the higher-order component. Providing a `displayName` is mandatory.

### getProps(props, state, search, meta)

`props` are the props that were provided to the higher-order component.

`state` holds the state of all widgets, with the shape `{[widgetId]: widgetState}`.

`search` holds the search results, search errors and search loading state, with the shape `{results: ?SearchResults, error: ?Error, loading: bool}`.

`meta` is the list of metadata for all widgets whose connector defined a `getMetadata` method.

This method should return the props to pass to the composed component.

### refine(props, state, value)

This method takes in the current props of the higher-order component, the state of all widgets, as well as a new value which is the argument of the `refine` and `createURL` props of stateful widgets, and returns a new state.

### getSearchParameters(searchParameters, props, state)

This method applies the current props and state to the provided `SearchParameters`, and returns a new `SearchParameters`.

Every time the props or state of a widget change, all the `getSearchParameters` methods of all the registered widgets are called in a chain to produce a new `SearchParameters`. Then, if the output `SearchParameters` differs from the previous one, a new search is triggered.

### getMetadata(props, state)

This method allows the widget to register a custom `metadata` object for any props and state combo.

If your widget is stateful, the corresponding URL key should be declared on the metadata object as the `id` property, so that the `InstantSearch` component can determine which URL keys it controls and which are foreign and should be left intact.

The metadata object also allows you to declare any data that you would like to pass down to all other widgets. The list of metadata objects of all components is available as the fourth argument to the `getProps` method.

The `CurrentFilters` widget leverages this mechanism in order to allow any widget to declare the filters it has applied. If you want to add your own filter, declare a `filters` property on your widget's metadata object:

```
function getMetadata(props, state) {
  return {
    id: props.id,
    // No filters when the state is null
    filters: state === null ? [] : [{
      // Unique identifier for this filter.
      key: `${props.id}.myFilter`,
      // String label (or node) that should appear in the CurrentFilters
      // component.
      label: `My Filter: ${state}`,
      // Takes in a state and returns a new state with this filter cleared.
      clear: nextState => {
        return {
          ...nextState,
          [id]: null,
        };
      },
    }],
  };
}
```
