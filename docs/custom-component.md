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

**Info: Best practices regarding development of custom components are provided in a [dedicated section here](best-practices.md#custom-component).**

## How it works

By using the `component` mixin, the custom component will automatically be able to access `this.searchStore`.

This is made possible because the `component` mixin `injects` the searchStore.
You can read more about the inject/provide feature on the [Vue.js documentation](https://vuejs.org/v2/api/#provide-inject).

The search store will be automatically fetched from a parent [Index component](/components/index.md) higher in the DOM tree.

As a reminder, you can also [provide your custom searchStore to any custom component](using-components.md#manually-inject-the-search-store-into-components) as a property.
