# instantsearch.js
Instant search for everyone

## Usage

```js
var instantSearch = require('instantsearch.js');
var instant = new instantSearch.InstantSearch();
```

## Widget API

```js
function searchBox(opts) {

  return {
    configure: function(searchParameters) {
      return {
        // helper params
      }
    },
    init: function(initialState, helper) {
      // called before first `helper.on('result');`
    },
    render: function(content, state, helper) {
      // called at each `helper.on('result')`
    }
  }
}
```

## Dev

```sh
npm run dev
```
