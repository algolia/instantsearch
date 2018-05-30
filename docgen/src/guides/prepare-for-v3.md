---
title: Prepare for v3
mainTitle: Guides
layout: main.pug
category: guides
withHeadings: true
navWeight: 0
editable: true
githubSource: docgen/src/guides/prepare-for-v3.md
---

Starting with 2.8.0, we are introducing changes and deprecations to prepare for the upcoming release of InstantSearch.js 3.

## Initializing InstantSearch

InstantSearch has always worked with the [Algolia search client](https://github.com/algolia/algoliasearch-client-javascript) behind the scenes. This will no longer be the default for InstantSearch.js 3. To prepare this future migration, you can start using the new options now.

### Current usage

1.  [Import `InstantSearch.js`](https://community.algolia.com/instantsearch.js/v2/getting-started.html#install-instantsearchjs)
2.  Initialize InstantSearch

```javascript
const search = instantsearch({
  appId: 'appId',
  apiKey: 'apiKey',
  indexName: 'indexName',
});

search.start();
```

### New usage

1.  [Import `algoliasearch`](https://github.com/algolia/algoliasearch-client-javascript)
2.  [Import `InstantSearch.js`](https://community.algolia.com/instantsearch.js/v2/getting-started.html#install-instantsearchjs)
3.  Initialize InstantSearch with the `searchClient` option

```javascript
const search = instantsearch({
  indexName: 'indexName',
  searchClient: algoliasearch('appId', 'apiKey'),
});

search.start();
```

## Deprecations

* [`createAlgoliaClient`](https://community.algolia.com/instantsearch.js/v2/instantsearch.html#struct-InstantSearchOptions-createAlgoliaClient) becomes deprecated in favor of [`searchClient`](https://community.algolia.com/instantsearch.js/v2/instantsearch.html#struct-InstantSearchOptions-searchClient)
