Using components
---

Vue InstantSearch comes with a bunch of existing components that cover common search patterns.

If provided components do not fit your needs, we can [create a custom components](custom-component.md).


## Available components

* [Index](components/index.md)
* [Search Box](components/search-box.md)
* [Results](components/results.md)
* [No Results](components/no-results.md)
* [Refinement List](components/refinement-list.md)
* [Pagination](components/pagination.md)
* [Clear](components/clear.md)
* [Highlight](components/highlight.md)
* [Snippet](components/snippet.md)
* [Stats](components/stats.md)
* [Powered By](components/powered-by.md)
* [Price Range](components/price-range.md)
* [Results per Page Selector](components/results-per-page-selector.md)
* [Sort by Selector](components/sort-by-selector.md)
* [Rating](components/rating.md)

## Register Components

There are 2 ways of registering components.

You can register them all at once or only manually register the ones you need.

### Register all components at once

Vue InstantSearch is shipped as a Vue plugin.

By telling Vue to "use" the Vue InstantSearch plugin, it will automatically make all
search components available throughout your whole application.

```js
// src/main.js
import Vue from 'vue';
import App from './App.vue'
import InstantSearch from 'vue-instantsearch';

Vue.use(InstantSearch);

new Vue({
  el: '#app',
  render: h => h(App)
})

```

**Info: If we use the [UMD build directly in the browser](https://codepen.io/rayrutjes/pen/BRgyGV), then all components will automatically be imported. No need to register anything.**

### Register only components we need

The previous approach is nice and easy, BUT it has the drawback of including code in the final application that we might not use.

An alternative approach is to register only the components we need.

```js
// src/main.js
import Vue from 'vue';
import App from './App.vue'
import { Index, SearchBox, Results, Pagination } from 'vue-instantsearch';

Vue.component('ais-index', Index);
Vue.component('ais-searchBox', SearchBox);
Vue.component('ais-results', Results);
Vue.component('ais-pagination', Pagination);

new Vue({
  el: '#app',
  render: h => h(App)
})
```

With this approach, only the 4 manually imported components will be part of the production build. The other components will be removed after tree-shake.

## Use a component

All components are registered with the `ais-` name prefix which stands for Algolia InstantSearch.

If we would like to change that naming we would need to [manually import components](#register-only-components-we-need) and assign a custom tag name.

Here we will use default names.

### Wrap search components inside of Index components

All search components must be wrapped in an `Index` component.

```html
<!-- WRONG: do not do this -->
<template>
  <div id="app">
    <ais-search-box></ais-search-box>
    <ais-index app-id="app_id" api-key="api_key" index-name="index_name">
      <ais-results></ais-results>
      <ais-pagination></ais-pagination>
    </ais-index>
  </div>
</template>


<!-- CORRECT: do this instead -->
<template>
  <div id="app">
    <ais-index app-id="app_id" api-key="api_key" index-name="index_name">
      <ais-search-box></ais-search-box>
      <ais-results></ais-results>
      <ais-pagination></ais-pagination>
    </ais-index>
  </div>
</template>
```

To better understand why a search component needs to be wrapped into an Index component,
we need to understand how the search state is retrieved from inside a component, which is [explained here](custom-component.md).

### Manually inject the search Store into components

Sometimes, search components could be located in different parts of your view, and we don't want to add an additional Index component wrapper on top of the whole view.

There are also times where we have multiple inter-related search experiences, and wrapping components
becomes a difficult.

In these cases, we can simply pass a searchStore as a property of the component instead of wrapping the components in an Index component.

```html
<template>
  <div id="app">
    <ais-search-box :search-store="searchStore"></ais-search-box>
    <ais-index :search-store="searchStore" index-name="index_name">
      <ais-results></ais-results>
      <ais-pagination></ais-pagination>
    </ais-index>
  </div>
</template>
<script>
  import { createFromAlgoliaCredentials } from 'vue-instantsearch';

  export default {
    name: 'app',
    data: function() {
      return {
        searchStore: createFromAlgoliaCredentials('app_id', 'api_key'),
      };
    },
  }
</script>
```

**Info: The Index component also accepts the searchStore as parameter.
Here we used that to avoid us to repeat the Algolia credentials.**
