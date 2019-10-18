## Upgrade to 6.x.x

This new major version of React InstantSearch leverages the [`Context`](https://reactjs.org/docs/context.html) API that has been released part of React 16.3.0. It means that now the **minimal required version for React InstantSearch is React 16.3.0**. We took this opportunity to make React InstantSearch compliant with the [`Strict`](https://reactjs.org/docs/strict-mode.html) mode too. Prior to this version, the library was not working with those constraints. Here is the list of APIs that have breaking changes:

### SSR

We made changes to the SSR API to use the `server` module only on the server. It was previously used on both client and server. Those changes in the API also simplify the flow of information and makes the SSR simpler to reason about. The neat addition that we've made to the API is the `searchClient` hydration. The request was done on the server, but also on the client when the app was mounted. Since the state is passed from the server to the client, the initial request on the client was useless. We're now able to avoid this initial request by re-using the results retrieved on the server.

```diff
// server.js

import React from 'react';
import { renderToString } from "react-dom/server";
+import { findResultsState } from "react-instantsearch-dom/server";
-import { App, findResultsState } from "./App";
+import { App } from "./App";

+const indexName = "instant_search";
+const searchClient = algoliasearch(
+  "latency",
+  "6be0576ff61c053d5f9a3225e2a90f76"
+);

server.get("/", async (req, res) => {
  const initialState = {
-    resultsState: await findResultsState(App)
+    resultsState: await findResultsState(App, {
+      indexName,
+      searchClient
+    })
  };


  const plainHTML = renderToString(<App {...initialState} />);

  // ...
});
```

```diff
// browser.js

import React from 'react';
import { hydrate } from 'react-dom';
import { App } from './App';

+const indexName = "instant_search";
+const searchClient = algoliasearch(
+  "latency",
+  "6be0576ff61c053d5f9a3225e2a90f76"
+);

hydrate(
  <App
    {...window.__APP_INITIAL_STATE__}
+    indexName={indexName}
+    searchClient={searchClient}
  />,
  document.getElementById("root")
);
```

```diff
// App.js

import React from "react";
-import algoliasearch from "algoliasearch/lite";
-import { createInstantSearch } from "react-instantsearch-dom/server";
-import { SearchBox } from "react-instantsearch-dom";
+import { InstantSearch, SearchBox } from "react-instantsearch-dom";

-const { InstantSearch, findResultsState } = createInstantSearch();

-const searchClient = algoliasearch(
-  "latency",
-  "6be0576ff61c053d5f9a3225e2a90f76"
-);

-const App = ({ resultsState }) => (
+const App = ({ indexName, searchClient, resultsState }) => (
  <InstantSearch
-    indexName="instant_search"
+    indexName={indexName}
    searchClient={searchClient}
    resultsState={resultsState}
  >
    <SearchBox />
  </InstantSearch>
);

-export { App, findResultsState };
+export { App };
```

You can notice that we have some duplication inside the module `server` and `browser`. We have duplicated the declaration of `indexName` and `searchClient`. We can avoid this easily with a `createApp` function that returns the `App` and the `props` that we have to provide. You can find this pattern applied inside the complete example on [GitHub](https://github.com/algolia/react-instantsearch/tree/fbc89aa7a7c02e572081444ab4b5039e7b1df1a9/examples/server-side-rendering).

### Remove support for `appId` and `apiKey`

We've removed the support for `appId` & `apiKey` on `InstantSearch`. Those props were not documented anymore but they were still supported. The preferred solution is to use the prop [`searchClient`](https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/#widget-param-searchclient) with the package the [`algoliasearch`](https://www.algolia.com/doc/api-client/getting-started/install/javascript/). The benefit of this change is that we don't ship `algoliasearch` anymore with React InstantSearch. When the `searchClient` used is not the Algolia one you don't pay the cost of it anymore.

```diff
import React from "react";
+import algoliasearch from "algoliasearch/lite";
import { InstantSearch, SearchBox } from "react-instantsearch-dom";

+const searchClient = algoliasearch(
+  "latency",
+  "6be0576ff61c053d5f9a3225e2a90f76"
+);

const App = () => (
  <InstantSearch
-    appId="latency"
-    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="instant_search"
+    searchClient={searchClient}
  >
    <SearchBox />
  </InstantSearch>
);
```

### Remove support for `root` in `InstantSearch` and `Index`

We have introduced the support of the prop `root` in `InstantSearch` & `Index` to be able to render a specific element, with specific props at the root. Its usage is not useful anymore because we don't have a root element. The top-level element is the `Context.Provider` which does not render anything. You can move the element provided to `root` directly around `InstantSearch`. This is great news for our React Native users!

```diff
// ...

const App = () => (
+  <section style={{ display: 'flex' }}>
    <InstantSearch
      indexName="instant_search"
      searchClient={searchClient}
-      root={{
-        Root: 'section',
-        props: {
-          style: {
-            display: 'flex',
-          },
-        },
-      }}
    >
      <SearchBox />
    </InstantSearch>
+  <section>
);
```

### `algoliasearch-helper` 3.x.x

In this major release we also migrate to the next major release of the `algoliasearch-helper`. This means if at any point you interact with a `SearchResults` or `SearchParameters` object, the breaking changes there will also take effect here. For use in React InstantSearch this should be only when creating a custom connector using `createConnector`.

There will no longer be the default value of page (0) or query ('') in `SearchParameters`. Both of those will now be undefined if no value is given.

The function `getQueryParameter` has been removed in favor of simply calling the getter for that parameter.
