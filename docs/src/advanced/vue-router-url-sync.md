---
title: Synchronize with Vue Router
mainTitle: Advanced
layout: main.pug
category: Advanced
withHeadings: true
navWeight: 3
editable: true
githubSource: docs/src/advanced/vue-router-url-sync.md
---
> NOTE: this guide has not yet been updated for v2

In this guide you'll learn how to synchronize your InstantSearch experience with the [official Vue-Router](https://github.com/vuejs/vue-router).

There are two things you'll want to setup in order to have the Vue router play nicely with InstantSearch.

1. Extract some parameters from the router and initialize the search store with it. That way, on the initial load of the search experience, it will display results based on the current route.

2. Push the new state of the search to the router as the user interacts with the InstantSearch components.

## Example app

A fully working example of synchronizing the Vue router with Vue InstantSearch can be found here: https://github.com/algolia/vue-instantsearch-examples/tree/master/examples/vue-router

## Initialize InstantSearch with route parameters

In the example app linked above, we register one route that looks like this:

```javascript
const router = new VueRouter({
  routes: [
    {
      name: 'search',
      path: '/search',
      component: Search,
      props: route => ({ query: route.query.q }),
    },
    // ...
  ],
});
```

This route will pass down the `query` parameter as a prop to the `Search` component.

Every time the 'search' named route matches, it will extract the `q` url query parameter and pass it as a property down to the `Search` component.

**Info:** You can read more about how to pass properties to your components in the official [Vue router documentation](https://router.vuejs.org/en/essentials/passing-props.html).

In the `Search.vue` file, we can see that we actually accept this prop coming in from the router:

```javascript
export default {
  props: {
    query: {
      type: String,
      default: '',
    },
  },
  // ...
}
```

We also make sure the property is initialized to an empty string by providing the `default: ''` option.

Now that the query has been injected by the router into our `Search` component, we need to tell the `Index` component to bind to it.

```html
<template>
  <ais-index :search-store="searchStore" :query="query">
    <!-- ... -->
  </ais-index>
</template>
```

Now, every time the route changes, the search store query will be updated with the value coming from the URL `q` query parameter.

## Keep Vue router in sync with Vue router

The previous section made our search state aware of the route. Here we will learn how to push the new state to the router in order to keep URLs in sync with the current search state as users interact with it.

In our `Search.vue` file, we [manually instantiated the search store](/getting-started/search-store.html#how-to-manually-create-a-search-store) and exposed it to our template by adding it to `data`.

```javascript
import { createFromAlgoliaCredentials } from 'vue-instantsearch';
const searchStore = createFromAlgoliaCredentials(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);
searchStore.indexName = 'ikea';

export default {
  // ...
  data() {
    return {
      searchStore,
    };
  },
  // ...
}
```

We then bound the search store to the `Index` component in the template, like so:

```html
<template>
  <ais-index :search-store="searchStore" :query="query">
    <!-- ... -->
  </ais-index>
</template>
```

The search store being bound to the `data` option, we can now observe the changes to reflect them in the router.

Hereafter, we watch the `searchStore.query` value and push the change to the router:

```javascript
export default {
  // ...
  watch: {
    'searchStore.query'(value) {
      this.$router.push({
        name: 'search',
        query: { q: value },
      });
    },
  },
  // ...
}
```

Now every time the search query is changed, we will push the `q` query parameter to the router which will update the URL instantly.

