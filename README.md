# instantsearch.js

Instant search for everyone, even for your cat 😸.

API is unstable. We welcome any idea.

## Usage

```js
var instantsearch = require('instantsearch.js');
var instant = new instantsearch.InstantSearch(appId, apiKey, indexName);

// add a widget
instant.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for libraries in France...'
  })
);

// start
instant.start();
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

instant.addWidget(mySuperWidget());
```

## Dev

Here is the development workflow:

```sh
npm run dev
# open http://localhost:8080
# make changes in your widgets, or in example/app.js
```
