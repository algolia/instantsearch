# instantsearch.js

Instant search for everyone, even your cat 😸.

## Usage

```js
var instantSearch = require('instantsearch.js');
var instant = new instantSearch.InstantSearch();
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
