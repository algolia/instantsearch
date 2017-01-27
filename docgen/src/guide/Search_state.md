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

```jsx
{
  const searchState = {
    range: {
      price: {
        min: 20,
        max: 3000
      }
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
}
```

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Search_parameters.html">← Search Parameters</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Multi_index.html">Multi index →</a>
    </div>
</div>
