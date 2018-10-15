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

Currently there's three existing ways how to use InstantSearch routing.

The first option is putting `:routing="true"` on `ais-instant-search`. This will use the default serialising that doesn't lose any information, but might be a bit verbose

The second option is to put an object of configuration. This object can take `stateMapping`, with the functions `stateToRoute` and `routeToState` to serialise differently, but still use the default routing. This allows to rename things to make them easier to read, without touching how the serialising itself happens.

Finally, you can also change the URL to use full URLs, rather than just the query string. You need to change the `router` key inside the `routing` object. You can import the default (history) router from `import {history} from 'instantsearch.js/es/lib/routers'`, and modify, like in InstantSearch JS.

[![Edit vue-instantsearch-app](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/q8pmz6n7lj?module=%2Fsrc%2FApp.vue)

All docs for InstantSearch routing configuration are [here](https://community.algolia.com/instantsearch.js/v2/guides/routing.html).

Finally an option is to use Vue Router. All previous examples will _work_ using Vue Router, as long as they don't conflict, as long as you don't try to do specific Vue Router things which are controlled by InstantSearch, since InstantSearch provided query strings won't be available to Vue Router, as soon as the routing changes from its initial deserialization.

## How **do** I use Vue Router?

If you have a Vue Router configuration that requires a synchronized use of the query parameters, or other parameters, as described in the InstantSearch guide, you need to write a custom "router" key for InstantSearch:

```js
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

```js
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

```js
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
