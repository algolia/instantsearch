---
title: Synchronize with Vue Router
mainTitle: Advanced
layout: main.pug
category: Advanced
withHeadings: true
navWeight: 3
editable: true
githubSource: docs/src/advanced/vue-router-url-sync.md
---

> NOTE: this guide **has** been updated for v2



The `routing` prop on `ais-instant-search` accepts an object. The simplest way to get started without customising URLs at all is the following:

```vue
<template>
  <ais-instant-search
    :routing="routing"
  >
    <!-- Your search components go in here -->
  </ais-instant-search>
</template>

<script>
import { history as historyRouter } from 'instantsearch.js/es/lib/routers';
import { simple as simpleMapping } from 'instantsearch.js/es/lib/stateMappings';

export default {
  data() {
    return {
      routing: {
        router: historyRouter(),
        stateMapping: simpleMapping(),
      },
    };
  },
};
</script>
```

They're routing object contains two keys: `history` and `stateMapping`:

- **history**: used for writing and reading to the URL,
- **stateMapping**: used for mapping the InstantSearch state towards the state that will be read and written to the URL.

If you want to customise which things are written in the URL but don't want to customise how exactly the URL looks you will use state mapping. The way to do this is replacing the call to `stateMapping` with an object with the functions `stateToRoute` and `routeToState`.

If you also want to customise how the URL is read and written, for example when you are using Vue Router, you will override the behaviour of `router`. Note however that to use Vue Router, you don't **need** to synchronise InstantSearch routing to Vue Router routing, the only reason to do is if you are doing other router functions on your search page as well, and want to avoid conflicts when both are writing to the URL at the same time. To do this, you pass an object to the `router` key:

```javascript
const router = this.router; /* get this from Vue Router */

const instantSearchRouting = {
  router: {
    read() {
      return router.currentRoute.query;
    },
    write(routeState) {
      router.push({
        query: routeState,
      });
    },
    createURL(routeState) {
      return router.resolve({
        query: routeState,
      }).href;
    },
    onUpdate() {},
    dispose() {},
  },
};
```

Note that in this example only use the `query` key is used, but other Vue Router keys can also be used. It's advised here to use a `stateMapping` that changes nested objects into flat objects. The reason why you need flat objects, is because by default Vue Router will serialize an object as value for a query string object as `[object Object]`. This can be avoided by either _not_ having deep objects (possibly replaced by arrays, or a flat version with only what you need in your app):

```javascript
const stateMapping = {
  stateToRoute(uiState) {
    return {
      query: uiState.query,
      // we use the character ~ as it is one that is rarely present in data and renders well in urls
      // do this for every refinement you have
      brands:
        (uiState.refinementList &&
          uiState.refinementList.brand &&
          uiState.refinementList.brand.join('~')) ||
        'all',
      page: uiState.page,
    };
  },
  routeToState(routeState) {
    return {
      query: routeState.query,
      refinementList: {
        brand: routeState.brands && routeState.brands.split('~'),
      },
      page: routeState.page,
    };
  },
};
```

Or by modifying the Vue Router to allow nested objects in the query string:

```javascript
import qs from 'qs';

const router = new Router({
  routes: [
    // ...
  ],
  // set custom query resolver
  parseQuery(query) {
    return qs.parse(query);
  },
  stringifyQuery(query) {
    var result = qs.stringify(query);

    return result ? '?' + result : '';
  },
});
```

Note that the `qs` module is already used in InstantSearch, so this will not add to your bundle size, unless you use a different version.

All docs for InstantSearch routing configuration are [here](https://community.algolia.com/instantsearch.js/v2/guides/routing.html).
