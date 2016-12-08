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

```javascript
{
  const searchState = {
    range: {
      attributeName: {
        min: 2,
        max: 3
      }
    },
    refinementList: {
      attributeName: ['lemon', 'orange']
    },
    hierarchicalMenu: {
      attributeName: 'fruits > orange'
    },
    menu: {
      attributeName: 'orange'
    },
    multiRange: {
      attributeName: '2:3'
    },
    toggle: {
      attributeName: true
    },
    hitsPerPage: 10,
    sortBy: 'mostPopular',
    query: 'ora',
    page: 2 //use by both (connect)Pagination and (connect)InfiniteHits
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