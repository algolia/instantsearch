
# Synchronizing the search with the URL

## Basics

### Initialize the routing

In order to make InstantSearch synchronize the search UI with the
URL you need to activate a feature called routing. To get you
started, you can just set the option to `true`:

```javascript
const search = instantsearch({
  // don't forget the credentials
  routing: true,
});
```

Setting this option to `true` will indicate to InstantSearch to use
the default mapping (using the simpleMapping) and output the state
to the URL (using the history router).

See an [example with the default parameters]().

### Customize the default routing

The example in the previous part is actually equivalent to:

```javascript
const search = instantsearch({
  // don't forget the credentials
  routing: {
    stateMapping: simpleMapping(),
    router: historyRouter(),
  },
});
```

The stateMapping lets you customize the UI state before it is serialized and after it has been parsed.
The default implementation provides no customization options, because each implementation will have
its own set of customization there.

The mapping is an object that contains two methods:
 - `stateToRoute(uiState)`
 -  `routeToState(syncable)`

And those two methods should comply to the following rule: for any `uiState`, `uiState` must be equal in
value to `routeToState(stateToRoute(uiState))`. This means that any transformation applied by `stateToRoute`
can be cancelled by `routeToState`.

Let's take an example:

```javascript
// state mapping that extracts brand from refinementList
// and put the values in a string
```

See a live example.

### Customizing the generated URL

```javascript
const search = instantsearch({
  // don't forget the credentials
  routing: {
    stateMapping: simpleMapping(),
    router: historyRouter({
      windowTitle: undefined,
      writeDelay: 400,
      createURL: function(qsModule, uiState) { /* implementation is too long to display here */},
      readURL: function(qsModule, location) { return qsModule.parse(location.search.slice(1)); },
    }),
  },
});
```

`createURL` returns a string (the complete URL) and you can use qsModule to serialize the parameters to a query string

`readURL` should return an UI state

## Going further

### Adding routing support to your custom widget

Widgets are responsible for providing handling their own part of the search state.

In order to communicate their own view of the state widgets must implement two new
methods:

```javacript
getWidgetState(fullState: object, { state: SearchParameters }): object

getWidgetSearchParameters(searchParam: SearchParameters, { uiState: object }): SearchParameters
```

Let's see an example, in which we implement this on the custom menu select of the
[create custom widget guide](custom-widget.html).

### Make a custom router

Sometimes the URL is not the best way to store the search. The routing API
is flexible and let you work with other outputs.

A router has multiple interesting properties:
 - writes and reads from a storage
 - can be triggered own its own (pressing the back button in a browser)
 - can optionaly generated an ID / URL for the current state

Let's see an example in which we implement a router for the localStorage.

