Custom Components
---------

In order to provide the flexibility necessary to build an advanced search experience, Vue Instant Search includes the ability to build custom components.

## What is a Custom Component

A custom component is simply a Vue.js component that has access to the search store.

It can then:

- mutate the state of the search search
- get the state from the search store

## How to create a custom Component

To make it as easy as possible to access the search store, you simply need to inject a mixin into your component.

Here is a bare minimum Vue InstantSearch component:

```html
<!-- CurrentQuery.vue -->
<template>
  <div>
    {{ query }}
  </div>
</template>

<script>
import { Component } from 'vue-instantsearch';

export default {
  mixins: [Component],
  computed: {
    query() {
      return this.searchStore.query;
    },
  },
};
</script>
```

This component will display the current search query.

## How it works

By using the `component` mixin, the custom component will automatically be able to access `this.searchStore`.

This is made possible because the `component` mixin `injects` the searchStore.
You can read more about the inject/provide feature on the [Vue.js documentation](https://vuejs.org/v2/api/#provide-inject).

The search store will be automatically fetched from a parent [Index component](/components/index.md) higher in the DOM tree.

As a reminder, you can also [provide your custom searchStore to any custom component](using-components.md#manually-inject-the-search-store-into-components) as a property.

## Component Best Practices

To ensure consistency and re-usability for custom components, we recommend reviewing the following guidelines.

### Styles and Classes

* As Vue InstantSearch is using `ais`, we recommend choosing a different prefix
* Do not use [`scoped`](https://vue-loader.vuejs.org/en/features/scoped-css.html) styles, it makes it very hard to override them.
* Use [BEM notation](http://getbem.com/introduction/) with only one depth level.
* Unless you are trying to ship a very opinionated styled component, just add styles for the elements that helps understanding the behaviour. i.e. for a pagination component, you will want to put in bold the current page.

### Component good practices

* Use the `component` mixin that we provide. This will make sure your component can resolve the `searchStore` if not provided. It ensures the `searchStore` prop is available in your component at any time.
* If you need mutate the `searchStore` multiple times, please use `searchStore.stop()` and `searchStore.start()`, so that other components don't update their rendering on every intermediary state mutation.
* Make sure that when the component is mounted, you catch up with the `searchStore`. You can optionally mutate the state of the `searchStore` at this stage.
* When a component is `unmounted` or `destroyed`, make sure that you leave the `searchStore` in a state that does not include things you might have added (facets / filters / etc.).
* Make sure your component gracefully handles any state of the `searchStore`.

### Export UMD + ES2015

* Export your components as UMD, CommonJS and ES2015.
