---
title: InstantSearch
layout: api.ejs
nav_groups:
  - core
nav_sort: 1
---

# InstantSearch

Connects to your Algolia index and provides data to all children widgets.


```js
import {InstantSearch, SearchBox, Hits} from 'react-instantsearch';

export default function Search() {
  return (
    <InstantSearch
      appId="appId"
      apiKey="apiKey"
      indexName="indexName"
    >
      <div>
        <SearchBox />
        <Hits />
      </div>
    </InstantSearch>
  );
}
```

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`appId` | `string` | | The Algolia application id.
`apiKey` | `string` | | Your Algolia Search-Only API key.
`indexName` | `string` | | The index in which to search.
`urlSync` | `?bool` | `true` | Enables automatic synchronization of widgets state to the URL. See [URL Synchronization](#url-synchronization).
`history` | `?object` | | A custom [history](https://github.com/ReactTraining/history) to push location to. Useful for quick integration with [React Router](https://github.com/reactjs/react-router). Takes precedence over `urlSync`. See [Custom History](#custom-history).
`threshold` | `?number` | `700` | Threshold in milliseconds above which new locations will be pushed to the history, instead of replacing the previous one. See [Location Debouncing](#location-debouncing).
`onStateChange` | `?func` | | See [Controlled State](#controlled-state).
`state` | `?object` | | See [Controlled State](#controlled-state).
`createURL` | `?func` | | See [Controlled State](#controlled-state).

## URL Synchronization

The `InstantSearch` component features a complete URL synchronization solution. Whenever a widget's state changes, the URL will be updated to reflect the new state of the search UI. This has two main benefits:

* the user can use the browser's back and forward buttons to navigate back and forth between the different states of the search.
* the user can bookmark, copy and share a custom search URL.

### Location Debouncing

Since UI updates can happen in quick succession, for instance when the user types in a query, the new locations are debounced. The `treshold` prop controls how long the component should wait between state changes before pushing a new location instead of replacing the old one.

### Custom History

If you're using [React Router](https://github.com/reactjs/react-router) and/or the [history](https://github.com/ReactTraining/history) library, you can pass a custom history object for the component to push locations to.

#### With React Router

```js
import {withRouter} from 'react-router';
import {InstantSearch} from 'react-instantsearch';

function Search(props) {
  return (
    <InstantSearch
      appId="appId"
      apiKey="apiKey"
      indexName="indexName"
      history={props.router}
    >
      {/* ... */}
    </InstantSearch>
  );
}

export default withRouter(Search);
```

#### With a custom history

```js
import {InstantSearch, SearchBox, Hits} from 'react-instantsearch';

import myHistory from './path-to-my-history';

function Search(props) {
  return (
    <InstantSearch
      appId="appId"
      apiKey="apiKey"
      indexName="indexName"
      history={myHistory}
    >
      {/* ... */}
    </InstantSearch>
  );
}

export default Search;
```

## Controlled State

The `InstantSearch` component defaults to an uncontrolled behavior, which means that the widgets state is kept and updated internally. This behavior allows for [URL Synchronization](#url-synchronization). However, in some cases, you might want to control this state from outside of this component. For instance, if you implement your own routing solution, or if you wish to customize your URLs.

As such, this component behaves just like a React `input`. By providing `state` and `onStateChange(nextState)` props, you can store and update the widgets state from outside the component. For instance, in a parent component's state or in a Redux store.

Note that controlling the state from outside of the component disables [URL Synchronization](#url-synchronization). If you need this feature, you will need to reimplement it yourself. In this case, as there is no way for widgets that contain hyperlinks to guess how a state change will affect the URL, you should provide a `createURL` prop to the component.

The `createURL` function takes in a widgets `state` object and returns a `string` to be used as a `href` attribute.
