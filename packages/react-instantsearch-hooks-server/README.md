# react-instantsearch-hooks-server

> 🚧 This version is not yet production-ready.

React InstantSearch Hooks is an open-source, **experimental UI library** for React that lets you server-side render a search interface.

## Installation

React InstantSearch Hooks Server is available on the npm registry.

```sh
yarn add react-instantsearch-hooks-server
# or
npm install react-instantsearch-hooks-server
```

## Getting started

Here's an example with `react-instantsearch-hooks-server` on an [express](https://github.com/expressjs/express) server.

### Without routing

In `server.js`:

```js
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getServerState } from 'react-instantsearch-hooks-server';
import App from './App';

const server = express();

server.get('/', async (_, res) => {
  const serverState = await getServerState(<App />);
  const html = renderToString(<App serverState={serverState} />);

  res.send(
    `
  <!DOCTYPE html>
  <html>
    <head>
      <script>window.__INITIAL_SEARCH_STATE__ = ${JSON.stringify(
        serverState
      )}</script>
    </head>
    
    <body>
      <div id="root">${html}</div>
    </body>
    
    <script src="/app.js"></script>
  </html>
    `
  );
});

server.listen(8080);
```

In `browser.js`:

```js
import React from 'react';
import { hydrate } from 'react-dom';
import App from './App';

const __INITIAL_SEARCH_STATE__ = window.__INITIAL_SEARCH_STATE__;

delete window.__INITIAL_SEARCH_STATE__;

hydrate(
  <App serverState={__INITIAL_SEARCH_STATE__} />,
  document.getElementById('root')
);
```

In `App.js`:

```js
import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import {
  InstantSearch,
  InstantSearchSSRProvider,
} from 'react-instantsearch-hooks';

const searchClient = algoliasearch('YOUR_APP_ID', 'YOUR_API_KEY');

function Search() {
  return (
    <InstantSearch indexName="instant_search" searchClient={searchClient}>
      {/* ... */}
    </InstantSearch>
  );
}

export default function App({ serverState }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <Search />
    </InstantSearchSsrProvider>
  );
}
```

### With routing

In `server.js`:

```js
server.get('/', async (req, res) => {
  const location = new URL(
    `${req.protocol}://${req.get('host')}${req.originalUrl}`
  );
  const serverState = await getServerState(<App location={location} />);
  const html = renderToString(
    <App serverState={serverState} location={location} />
  );

  // ...
});
```

In your `<App>`, you can provide `getLocation()` to the [`history`](https://www.algolia.com/doc/api-reference/widgets/history-router/js/) router. This lets you return either the location coming from the server when you're rendering on the server, or the one from `window` once on the client:

```js
function App({ serverState, location }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        indexName="instant_search"
        searchClient={searchClient}
        routing={{
          stateMapping: simple(),
          router: history({
            getLocation() {
              if (typeof window === 'undefined') {
                return location;
              }

              return window.location;
            },
          }),
        }}
      >
        {/* ... */}
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}
```

## API

### `getServerState(<App />)`

> `(children: React.ReactNode) => Promise<InstantSearchServerState>`

Function that takes the component that mounts `<InstantSearch>` and returns the server state.

**Types**

<details>
<summary><code>ServerState</code></summary>

```ts
import type {
  PlainSearchParameters,
  SearchResults,
} from 'algoliasearch-helper';

type InitialResult = {
  state: PlainSearchParameters;
  results: SearchResults['_rawResults'];
};

type InitialResults = Record<string, InitialResult>;

type InstantSearchServerState = {
  initialResults: InitialResults;
};
```

</details>

**Example**

```js
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getServerState } from 'react-instantsearch-hooks-server';
import App from './App';

const server = express();

server.get('/', async (_, res) => {
  const serverState = await getServerState(<App />);
  const html = renderToString(<App serverState={serverState} />);

  // ...
});
```

### `<InstantSearchSSRProvider {...serverState}>`

> `({ initialResults, children }: InstantSearchSSRProviderProps) => React.ReactNode`

React Context Provider that forwards the server state to `<InstantSearch>`.

**Types**

<details>
<summary><code>InstantSearchSSRProviderProps</code></summary>

```ts
type InstantSearchSSRProviderProps = Partial<InstantSearchServerState> & {
  children?: ReactNode;
};
```

</details>

**Examples**

```jsx
import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch('YOUR_APP_ID', 'YOUR_API_KEY');

function App({ serverState }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch searchClient={searchClient} indexName="indexName">
        {/* ... */}
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}
```
