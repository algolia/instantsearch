---
title: Getting started
layout: api.ejs
nav_groups:
  - core
nav_sort: 0
---

This is the home of `react-instantsearch`, a set of [React](https://facebook.github.io/react/) components to create unique instant-search experiences using [Algolia](https://www.algolia.com/) search engine.

**This is an alpha release, everything may be broken**.

Links:
- [Chat with us](https://gitter.im/react-instantsearch/Lobby) on gitter, we are active and waiting for feedback
- Code is at <https://github.com/algolia/instantsearch.js/tree/v2>, jump in


## Example

```sh
npm install react-instantsearch --save
```

app.js
```js
import React from 'react';
import ReactDOM from 'react-dom';

import {
  InstantSearch,
  SearchBox,
  Hits,
} from 'react-instantsearch';

const App = () =>
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="movies"
  >
    <div>
      <SearchBox />
      <Hits />
    </div>
  </InstantSearch>;
};

ReactDOM.render(<App/>, document.querySelector('#app'));
```

index.html
```html
<div id="app"></div>
```
