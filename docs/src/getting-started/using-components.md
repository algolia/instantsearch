---
title: Using components
mainTitle: Essentials
layout: main.pug
category: Getting started
withHeadings: true
navWeight: 3
editable: true
githubSource: docs/src/getting-started/using-components.md
---

Vue InstantSearch comes pre-packaged with many components necessary to build a full-featured search experience.

If provided components do not fit your needs, let us know via [GitHub](https://github.com/algolia/vue-instantsearch/issues).

## Available components

You can try most of them out in our playground.

<a class="btn btn-static-theme" href="stories/">🕹 try out live</a>

* [Index](components/index.html)
* [Autocomplete](components/Autocomplete.html)
* [Breadcrumb](components/Breadcrumb.html)
* [ClearRefinements](components/ClearRefinements.html)
* [CurrentRefinements](components/CurrentRefinements.html)
* [HierarchicalMenu](components/HierarchicalMenu.html)
* [Hits](components/Hits.html)
* [HitsPerPage](components/HitsPerPage.html)
* [InfiniteHits](components/InfiniteHits.html)
* [Menu](components/Menu.html)
* [MenuSelect](components/MenuSelect.html)
* [NumericMenu](components/NumericMenu.html)
* [Panel](components/Panel.html)
* [RangeInput](components/RangeInput.html)
* [RefinementList](components/RefinementList.html)
* [SortBy](components/SortBy.html)
* [ToggleRefinement](components/ToggleRefinement.html)
* [configure](components/configure.html)
* [highlight](components/highlight.html)
* [pagination](components/pagination.html)
* [PoweredBy](components/powered-by.html)
* [Rating](components/rating-menu.html)
* [SearchBox](components/search-box.html)
* [SearchState](components/SearchState.html)
* [Snippet](components/snippet.html)
* [Stats](components/stats.html)

## Registering components

There are 2 ways to register components: all at once or one by one.

### All components at once

Vue InstantSearch is also shipped as a Vue plugin.

```javascript
// src/main.js
import Vue from 'vue';
import App from './App.vue'
import InstantSearch from 'vue-instantsearch';

Vue.use(InstantSearch);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

The line `Vue.use(InstantSearch);` registers all components at once and makes them available
in templates.

**Info:** When using the [standalone build](getting-started/installing.html#using-a-tag), all components are automatically imported.

### Only the used components

The previous approach is nice and easy, but it has the drawback of including code from components in the final application that we might not use.

An alternative approach is to register components when we need them:

```javascript
// src/main.js
import Vue from 'vue';
import App from './App.vue'
import { Index, SearchBox, Hits, Pagination } from 'vue-instantsearch';

Vue.component('ais-index', Index);
Vue.component('ais-search-box', SearchBox);
Vue.component('ais-hits', Hits);
Vue.component('ais-pagination', Pagination);

new Vue({
  el: '#app',
  render: h => h(App)
})
```

With this approach, only the four manually imported components will be part of your production build. The other components will be removed after [tree-shaking](https://webpack.js.org/guides/tree-shaking/).

### Naming

When using `Vue.use(InstantSearch);`, all components are registered with the `ais-` prefix, which stands for Algolia InstantSearch. Example: `ais-search-box`.

When manually importing components, you can change that naming convention and assign a custom tag name.

## Using components

All search components must be wrapped in an [`Index`](components/index.html) component.

```html
<template>
  <div id="app">
    <ais-index app-id="appId" api-key="apiKey" index-name="indexName">
      <ais-search-box></ais-search-box>
      <ais-hits></ais-hits>
      <ais-pagination></ais-pagination>
    </ais-index>
  </div>
</template>
```
