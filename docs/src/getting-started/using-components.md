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

* [ais-instant-search](components/InstantSearch.html)
* [ais-autocomplete](components/Autocomplete.html)
* [ais-breadcrumb](components/Breadcrumb.html)
* [ais-clear-refinements](components/ClearRefinements.html)
* [ais-current-refinements](components/CurrentRefinements.html)
* [ais-hierarchical-menu](components/HierarchicalMenu.html)
* [ais-hits](components/Hits.html)
* [ais-hits-per-page](components/HitsPerPage.html)
* [ais-infinite-hits](components/InfiniteHits.html)
* [ais-menu](components/Menu.html)
* [ais-menu-select](components/MenuSelect.html)
* [ais-numeric-menu](components/NumericMenu.html)
* [ais-panel](components/Panel.html)
* [ais-range-input](components/RangeInput.html)
* [ais-refinement-list](components/RefinementList.html)
* [ais-sort-by](components/SortBy.html)
* [ais-toggle-refinement](components/ToggleRefinement.html)
* [ais-configure](components/Configure.html)
* [ais-highlight](components/Highlight.html)
* [ais-pagination](components/Pagination.html)
* [ais-powered-by](components/PoweredBy.html)
* [ais-rating-menu](components/RatingMenu.html)
* [ais-search-box](components/SearchBox.html)
* [ais-state-results](components/StateResults.html)
* [ais-snippet](components/Snippet.html)
* [ais-stats](components/Stats.html)

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
import {
  AisInstantSearch,
  AisSearchBox,
  AisHits,
  AisPagination
} from 'vue-instantsearch';

Vue.component(AisInstantSearch.name, AisInstantSearch);
Vue.component(AisSearchBox.name, AisSearchBox);
Vue.component(AisHits.name, AisHits);
Vue.component(AisPagination.name, AisPagination);

new Vue({
  el: '#app',
  render: h => h(App)
})
```

With this approach, only the four manually imported components will be part of your production build. The other components will be removed after [tree-shaking](https://webpack.js.org/guides/tree-shaking/).

It's also possible to do this in your component itself:

```vue
<template>
  <div id="app">
    <ais-instant-search :search-client="searchClient" index-name="indexName">
      <ais-search-box></ais-search-box>
      <ais-hits></ais-hits>
      <ais-pagination></ais-pagination>
    </ais-instant-search>
  </div>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';
import {
  AisInstantSearch,
  AisSearchBox,
  AisHits,
  AisPagination
} from 'vue-instantsearch';

export default {
  components: {
    AisInstantSearch,
    AisSearchBox,
    AisHits,
    AisPagination,
  },
  data() {
    return {
      searchClient: algoliasearch('appId', 'apiKey');
    };
  },
};
</script>
```

### Naming

When using `Vue.use(InstantSearch);`, all components are registered with the `ais-` prefix, which stands for Algolia InstantSearch. Example: `ais-search-box`.

When manually importing components, you can change that naming convention and assign a custom tag name.

## Using components

All search components must be wrapped in an [`ais-instant-search`](components/InstantSearch.html) component.

```html
<template>
  <div id="app">
    <ais-instant-search :search-client="searchClient" index-name="indexName">
      <ais-search-box></ais-search-box>
      <ais-hits></ais-hits>
      <ais-pagination></ais-pagination>
    </ais-instant-search>
  </div>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';

export default {
  data() {
    return {
      searchClient: algoliasearch('appId', 'apiKey');
    };
  },
};
</script>
```
