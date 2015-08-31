# instantsearch.js

Instant search for everyone, even for your cat 😸.

API is unstable. We welcome any idea.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)
- [Widget API](#widget-api)
- [Dev](#dev)
- [Test](#test)
- [Available widgets](#available-widgets)
  - [searchBox](#searchbox)
  - [pagination](#pagination)
  - [hits](#hits)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

```js
var instantsearch = require('instantsearch.js');
var search = new instantsearch.InstantSearch(appId, apiKey, indexName);

// add a widget
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for libraries in France...'
  })
);

// start
search.start();
```

## Widget API

```js
function mySuperWidget(opts) {

  return {
    getConfiguration: function(searchParameters) {
      return {
        // helper params
      }
    },
    init: function(initialState, helper) {
      // helper: see http://algolia.github.io/algoliasearch-helper-js/docs/
      // called before first `helper.on('result');`
    },
    render: function(results, state, helper) {
      // content: see http://algolia.github.io/algoliasearch-helper-js/docs/SearchResults.html
      // helper: see http://algolia.github.io/algoliasearch-helper-js/docs/
      // called at each `helper.on('result')`
    }
  }
}

search.addWidget(mySuperWidget());
```

## Dev

Here is the development workflow:

```sh
npm run dev
# open http://localhost:8080
# make changes in your widgets, or in example/app.js
```

## Test

```sh
npm test # test and lint
npm run test:watch # developer mode, test only
npm run test:coverage
```

## Available widgets

### searchBox

```html
<div id="search-box"></div>
```

```js
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
    // cssClass
  })
);
```

### pagination

```html
<div id="pagination"></div>
```

```js
search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    // cssClass, // add cssClasses to the main wrapper
    // padding: 3, // number of page numbers to show before/after current
    // showFirstLast: true, // show or hide first and last links
    // maxPages, // automatically computed based on the result set
    // labels: {
    //   prev: '‹', // &lsaquo;
    //   next: '›', // &rsaquo;
    //   first: '«', // &laquo;
    //   last: '»' // &raquo;
    // }
  })
);
```

### hits

```html
<div id="hits"></div>
```

```js
search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty, // string (mustache format) or function(hit) return string 
      hit // string (mustache format) or function(hit) return string
    },
    hitsPerPage: 20,
    // cssClass
  })
);
```

