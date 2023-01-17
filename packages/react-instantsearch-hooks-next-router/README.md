# instantsearch-router-next-experimental

This package is an experimental router for [React InstantSearch Hooks](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react-hooks/) that is compatible with [Next.js](https://nextjs.org/) routing.

> **Warning**
> As the name suggests, this package is experimental and its name and API will change in the future.

## Installation

```sh
yarn add instantsearch-router-next-experimental
# or with npm
npm install instantsearch-router-next-experimental
```

## Usage

If you are doing SSR with the `getServerState` and `InstantSearchSSRProvider` from `react-instantsearch-hooks-server`, you need to pass the `url` prop to `createInstantSearchNextRouter`'s `serverUrl` option :

```js
import { createInstantSearchNextRouter } from 'instantsearch-router-next-experimental';

export default function Page({ serverState, url }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        routing={{ router: createInstantSearchNextRouter({ serverUrl: url }) }}
      >
        {/* ... */}
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}
```

If you are not doing SSR but only CSR, you can omit the `serverUrl` option:

```js
import { createInstantSearchNextRouter } from 'instantsearch-router-next-experimental';

export default function Page() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="instant_search"
      routing={{ router: createInstantSearchNextRouter() }}
    >
      {/* ... */}
    </InstantSearch>
  );
}
```

Lastly, if you had custom routing logic in your app, you can pass it to the `createInstantSearchNextRouter`'s `routerOptions` option:

```js
import { createInstantSearchNextRouter } from 'instantsearch-router-next-experimental';

export default function Page({ serverState, url }) {
  return (
    {/* ... */}
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        routing={{
          router: createInstantSearchNextRouter({
            serverUrl: url,
            routerOptions: {
              createURL: /* ... */,
              parseURL: /* ... */,
            },
          }),
           // if you are using a custom `stateMapping` you can still pass it :
          stateMapping: /* ... */,
        }}
      >
        {/* ... */}
      </InstantSearch>
    {/* ... */}
  );
}
```

## API

The options are :

- `serverUrl`: the URL of the page on the server. It's used to compute the initial `uiState`.
- `routerOptions`: the options passed to the `history` router. See [the documentation](https://www.algolia.com/doc/api-reference/widgets/history-router/js/) for more details. If you need to override `getLocation` make sure to handle server-side rendering by checking if `window` is defined or not.

For troubleshooting purposes, some other options are available :

- `doNotOverrideBeforePopState`: if you provided a custom `beforePopState` to the next router, you can pass this option to `createInstantSearchNextRouter` to prevent it from overriding it. You will however need to handle the `beforePopState` logic yourself.
- in `routerOptions` :
  - `beforeStart`: a function called when the router starts. It receives a callback which should normally be `setUiState` as well as the `router` instance.
  - `beforeDispose`: a function called when the router is disposed. It's used to detach events which were attached in `beforeStart` / `onUpdate`.
