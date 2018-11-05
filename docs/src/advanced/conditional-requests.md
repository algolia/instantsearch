---
title: Conditionally making search requests
mainTitle: Advanced
layout: main.pug
category: Advanced
withHeadings: true
navWeight: 7
editable: true
githubSource: docs/src/advanced/conditional-requests.md
---

> NOTE: this guide **has** been updated for v2

InstantSearch sends a request to Algolia servers on every keystroke, which means that it's fast and users will see updated results instantly. A request is also sent to show the initial results on an empty query. This is the original behavior since it warms up the network connection so subsequent requests will be done faster too.

However, there are cases in which you do not want to do extra network requests than strictly necessary, for example when you are using a custom backend, or when the initial results are never displayed.

## How it's made possible

InstantSearch is the UI part on top of a search client with a state managed by a [JavaScript Helper](https://github.com/algolia/algoliasearch-helper-js). These three layers are composable and can be interchanged to leverage the InstantSearch widgets system with different search clients.

The [search client](https://github.com/algolia/algoliasearch-client-javascript) that Algolia offers queries Algolia's backends whenever the user refines the search. It is possible to implement your own search client that queries your backend, which then queries Algolia's backend with the [Algolia search client](https://github.com/algolia/algoliasearch-client-javascript) on your server.

To create your own client, you will need to implement a given interface that receives and returns formatted data that InstantSearch can understand.

## Implementing a proxy

The way we will prevent searches to Algolia from happening in certain use cases is by making a proxy object around the `algoliasearch` client. This will then be passed to `ais-instant-search`:

```vue
<template>
  <ais-instant-search
    :search-client="searchClient"
    index-name="instant_search"
  >
    <ais-search-box />
    <ais-hits />
  </ais-instant-search>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';

const algoliaClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const searchClient = {
  async search(requests) {
    return algoliaClient.search(requests);
  },
  async searchForFacetValues(requests) {
    return algoliaClient.searchForFacetValues(requests);
  },
};

export default {
  data() {
    return {
      searchClient,
    };
  },
};
</script>
```

Functionally this is not any different from directly passing the created search client from the `algoliasearch` call, but what it empowers us is conditionally **not** calling the Algolia search request, and thus not doing the query.

## Mocking a search request

Since we don't want to do a request when the query is empty (`""`), we first need to detect it:

```js
const searchClient = {
  async search(requests) {
    if (requests.every(({ params: { query } }) => Boolean(query) === false)) {
      // here we need to do something else
    }
    return algoliaClient.search(requests);
  },
};
```

There can be multiple requests done in case a user for example clicks a hierarchical menu open. For now, this doesn't really have a big impact except that we have to make sure to check that every query is empty before we intercept the function call.

Then, we need to return a [formatted response](https://www.algolia.com/doc/api-reference/api-methods/search/?language=javascript#response). This is an array of objects of the same length as the `requests` array. At the bare minimum, each object needs to contain: `processingTimeMS`, `nbHits`, `hits` and `facets`:

```js
const searchClient = {
  async search(requests) {
    if (requests.every(({ params: { query } }) => Boolean(query) === false)) {
      return {
        results: requests.map(params => {
          return {
            processingTimeMS: 0,
            nbHits: 0,
            hits: [],
            facets: {},
          };
        }),
      };
    }
    return algoliaClient.search(requests);
  },
};
```

We can then build both together and get to a result like this:

```vue
<template>
  <ais-instant-search
    :search-client="searchClient"
    index-name="instant_search"
  >
    <ais-search-box />
    <ais-hits />
  </ais-instant-search>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';

const algoliaClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const searchClient = {
  async search(requests) {
    // change conditional if any of the other facets are faked"
    if (requests.every(({ params: { query } }) => Boolean(query) === false)) {
      return {
        results: requests.map(params => {
          // fake something of the result if used by the search interface
          return {
            processingTimeMS: 0,
            nbHits: 0,
            hits: [],
            facets: {},
          };
        }),
      };
    }
    return algoliaClient.search(requests);
  },
  async searchForFacetValues(requests) {
    return algoliaClient.searchForFacetValues(requests);
  },
};

export default {
  data() {
    return {
      searchClient,
    };
  },
};
</script>
```

<iframe src="https://codesandbox.io/embed/9o4qo147jw?module=%2Fsrc%2FApp.vue" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
