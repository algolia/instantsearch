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

## transformData vs transformItems

Since InstantSearch.js first public release, we have provided an option to customize the values used in the widgets. This method was letting you map 1-1 the values with other values. With react-instantsearch, we implemented a slightly different API that allowed for mapping but also completly change the content of the list of values. This API is way more powerful and therefore it will be the one that we want to push forward with.

### Current usage

```js
search.addWidget(
  instantsearch.widget.refinementList({
    container: '#someDomNode',
    attributeName: 'facet',
    transformData: function(item) {
      item.count = 0;
      return item;
    },
  })
);
```

Will update the counts of every item to 0.

### New usage

```js
search.addWidget(
  instantsearch.widget.refinementList({
    container: '#someDomNode',
    attributeName: 'facet',
    transformItems: function(items) {
      return items.map(function(item) {
        item.count = 0;
        return item;
      });
    },
  })
);
```

For just updating the values, it's more work but it also new operations on the items:

```js
search.addWidget(
  instantsearch.widget.refinementList({
    container: '#someDomNode',
    attributeName: 'facet',
    transformItems: function(items) {
      items.push({
        value: 'facetValue',
        count: 100,
      }); // injecting new values
      items.splice(0, 1); // removing items
      items.sort((a, b) => b.count - a.count); // custom sort
      return items;
    },
  })
);
```

## Deprecations

* [`createAlgoliaClient`](https://community.algolia.com/instantsearch.js/v2/instantsearch.html#struct-InstantSearchOptions-createAlgoliaClient) becomes deprecated in favor of [`searchClient`](https://community.algolia.com/instantsearch.js/v2/instantsearch.html#struct-InstantSearchOptions-searchClient)
* `transformData` becomes deprecated in favor of `transformItems` in all widgets
