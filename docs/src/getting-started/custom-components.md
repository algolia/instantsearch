---
title: Custom Components
mainTitle: Essentials
layout: main.pug
category: Getting started
withHeadings: true
navWeight: 4
editable: true
githubSource: docs/src/getting-started/custom-components.md
---

> NOTE: this guide has not yet been updated for v2

You can build your own components when the provided ones are not sufficient. Since we try
as hard as possible to provide an out-of-the-box experience, we would love to hear
about your custom component use case before you build it.

Let us know about your use case for a custom component via our [issue tracker](https://github.com/algolia/vue-instantsearch/issues).

## What is a custom component

A custom component is a Vue.js component that has access to the [search store](getting-started/search-store.html).

It can:

- mutate the state of the search store
- get the state from the search store

## How to create a custom component

We have a `Component` [mixin](https://vuejs.org/v2/guide/mixins.html) for you to use:

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

By using the `Component` mixin, the custom component will automatically be able to access `this.searchStore`.

This is made possible because the `Component` mixin `injects` the searchStore.
You can read more about the inject/provide feature on the [Vue.js documentation](https://vuejs.org/v2/api/#provide-inject).

The search store will be automatically fetched from a parent [Index component](components/index.html) higher in the DOM tree.

As a reminder, you can also [provide your custom searchStore to any custom component](getting-started/search-store.html#manually-inject-the-search-store-into-components) as a property.

## Best practices

To ensure consistency and re-usability for custom components, we recommend reviewing the following guidelines.

### Styles and CSS classes

* Vue InstantSearch uses `ais` as a prefix for CSS classes, we recommend choosing a different prefix to avoid conflicts
* We do not recommend the use of [`scoped`](https://vue-loader.vuejs.org/en/features/scoped-css.html) styles, it makes it very hard to override them.
* Use the [BEM notation](http://getbem.com/introduction/) with only one depth level.
* Think about reusability: ship the bare minimum style for your component to be displayed well, while allowing for easy customization.

### Vue component

* Use the `Component` mixin that we provide. This will make sure your component can resolve the `searchStore` if not provided. It ensures the `searchStore` prop is available in your component at any time.
* If you need to mutate the `searchStore` multiple times, please use `searchStore.stop()` and `searchStore.start()`, so that other components don't update their rendering on every intermediary state mutation. Do not forget the `searchStore.refresh()` if you want to sync the store afterwards.
* Make sure that when the component is `mounted`, you catch up with the `searchStore`. You can optionally mutate the state of the `searchStore` at this stage.
* When a component is `unmounted` or `destroyed`, make sure that you leave the `searchStore` in a state that does not include things you might have added (facets / filters / etc.).
* Make sure your component gracefully handles any state of the `searchStore`.
