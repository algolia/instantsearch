---
title: Server-side rendering
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 30
---

React InstantSearch is compatible with server-side rendering. We provide an API that can be used
with any server-side rendering solution. Such as [Next.js](https://github.com/zeit/next.js/).

## Examples

* Using [Express and ReactDOMServer](https://github.com/algolia/react-instantsearch/tree/master/examples/server-side-rendering).
* Using  [Next.js](https://github.com/algolia/react-instantsearch/tree/master/examples/next).

If you are looking for an example using another solution, read how to do custom implementations.

## Three steps custom implementation

We provide a new API entry, `createInstantSearch`, available under `'react-instantsearch/server'`.

When called, `createInstantSearch` returns:

* A dedicated [`<InstantSearch>`](widgets/<InstantSearch>.html) component accepting a `resultsState` prop containing the Algolia results.
* A `findResultsState` function to retrieve a `resultsState`.

More details are available in the [server-side API docs](server-side-rendering/).

We split this guide in three parts:
- App.js is the server and browser shared main React component from your application
- server.js is a simple Node.js http server, it's the main server entry
- browser.js is the main browser entry that ultimately gets compiled to bundle.js

### App.js

`App.js` is usually the main entry point of your React application, it exports an <App> component.

```jsx
import React, { Component } from 'react';
import { SearchBox, Hits } from 'react-instantsearch/dom';
import { createInstantSearch } from 'react-instantsearch/server';

// Now we create a dedicated `InstantSearch` component
const { InstantSearch, findResultsState } = createInstantSearch();

class App extends Component {
  render() {
    return (
      <InstantSearch
        appId="appId"
        apiKey="apiKey"
        indexName="indexName"
        searchState={this.props.searchState}
        resultsState={this.props.resultsState}
      >
        <SearchBox />
        <Hits />
      </InstantSearch>
    );
  }
}

export { App, findResultsState };
```

**Steps:**
- Use `createInstantSearch()` to get a `findResultsState` function and a dedicated `<InstantSearch>` component (instead of importing the one under `react-instantsearch/dom`)
- Export `<App>` (to be used by browser and server code) and `findResultsState` (to be used by server code)

**Notes:**
* **Keep a reference** to your dedicated `InstantSearch` component, do not re-create it at each render loop of your `App` component (This will fail: `... render() { return createInstantSearch(); }`)
* If you want to use multiple `<InstantSearch>` components then you need to create dedicated `<InstantSearch>` components for each of them.
* If you are syncing the searchState to the url for [proper routing](guide/Routing.html), pass a [`searchState`](guide/Search_state.html) to the `InstantSearch` component.

### server.js

```jsx
import React from 'react';
import { createServer } from 'http';
import { App, findResultsState } from './app.js';
import { renderToString } from 'react-dom/server';

const server = createServer((req, res) => {
  const searchState = {query: 'chair'};
  const resultsState = await findResultsState(App, {searchState});
  const appInitialState = {searchState, resultsState}
  const appAsString = renderToString(<App {...appInitialState} />);
  res.send(
`
<!doctype html>
<html>
  <body>
    <h1>Awesome server-side rendered search</h1>
    <did id="root">${appAsString}</div>
    <script>window.__APP_INITIAL_STATE__ = ${JSON.stringify(appInitialState)}</script>
    <script src="bundle.js"></script> <!-- this is the build of browser.js -->
  </body>
</html>`
  );
});

server.listen(8080);
```

**Notes:**
- You have to transpile (with [Babel](https://babeljs.io/) for example) your server-side code to be able to use JSX and import statements.
- `__APP_INITIAL_STATE__` will be used so that React ensures what was sent by the server matches what the browser expects (checksum)

### browser.js

This is the last part that does the plumbing between server-side rendering and the
start of the application on the browser.

```jsx
import React from 'react';
import { render } from 'react-dom';
import { App } from './index';

render(
  <App {...window.__APP_INITIAL_STATE__} />,
  document.querySelector('#root')
);
```

**Notes:**
- A request will still be sent to Algolia when React mount your `<App>` in the browser.

👌 **That's it!** You know the basics of doing a custom server-side implementation.

## The InstantSearch = createInstantSearch() pattern

It might be a bit confusing why we cannot use directly the `<InstantSearch>` component you were previously using, this part details a bit why we took this approach.

React InstantSearch is a declarative API that programmatically builds an Algolia query. Based on every widget used, and their own options, we compute a set of parameters that should be sent to Algolia.

While doing browser rendering, we need to first render a Component tree alone (to compute every parameter) to then re-render it again with results. Unfortunately React server-side rendering feature does not allows for such a pattern.

The only solution is to provide an API to get a set of results to then be passed down to an `<InstantSearch>` component as a prop.

As this can be confusing, you might have better ideas on how we could have implemented this, if so, reach out on our GitHub or on our [discourse forum](https://discourse.algolia.com/).

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/React_native.html">← React Native</a>
    </div>
    <div class="guide-nav-right">
            Next: <a href="guide//Autocomplete_menu.html">Autocomplete menu →</a>
    </div>
</div>
