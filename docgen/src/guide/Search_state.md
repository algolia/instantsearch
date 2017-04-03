---
title: Search state
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 55
---

The `searchState` contains all widgets states.
If a widget uses an attribute, we store it under its widget category to prevent collision.

Here's the `searchState` shape for all the connectors or widgets that we provide:

```js
const searchState = {
  range: {
    price: {
      min: 20,
      max: 3000
    }
  },
  configure: {
    aroundLatLng: true,
  },
  refinementList: {
    fruits: ['lemon', 'orange']
  },
  hierarchicalMenu: {
    products: 'Laptops > Surface'
  },
  menu: {
    brands: 'Sony'
  },
  multiRange: {
    rank: '2:5'
  },
  toggle: {
    freeShipping: true
  },
  hitsPerPage: 10,
  sortBy: 'mostPopular',
  query: 'ora',
  page: 2
}
```

If you are performing a search on multiple indices using the [Index](widgets/<Index>.html)
component, you'll get the following shape:


```js
const searchState = {
  query: 'ora', //shared state between all indices
  page: 2, //shared state between all indices 
  indices: {
    index1: {
      configure: {
        hitsPerPage: 3,
      },
    },
    index2: {
      configure: {
        hitsPerPage: 10,
      },
    },
  },
}
```

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Search_parameters.html">← Search parameters</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Operations.html">Operations →</a>
    </div>
</div>
