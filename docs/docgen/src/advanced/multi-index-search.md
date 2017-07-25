---
title: Multi index search
mainTitle: Advanced
layout: main.pug
category: Advanced
withHeadings: true
navWeight: 1
editable: true
githubSource: docs/docgen/src/advanced/multi-index-search.md
---

In this guide, you will learn how to get results from multiple indices simultaneously.

We have a [live multi-index search example](examples/multi-index-search.html) for you to quickly grasp what we are talking about.

## When to use multi-index search

You will need multi-index search when, in the same UI, you want to display results
coming from different indices.

Here are two reasons to store your data into multiple indices:

- Have different ranking rules or settings depending on the type of data inside of the index
- Make it easier to display only the results of a given type in a given area of your page

If you don't need specific settings for part of your index and that you expect
to see all results inter-mixed in the same area of your page, then chances are
you do not need to implement multi-index search experience.

If you end up finding yourself trying to manually merge records coming
from different indices, it probably means you missed an opportunity to use
multi-index search.

## How it works

Every [search store](getting-started/search-store.html) is in charge of fetching the results from a single
Algolia index.

To implement a search experience that fetches results from two indices,
you need to have two search stores.

**Tip: you can fetch results from as many indices as you want. 💥**

As a reminder, before diving into some code, every time you use an [Index
component](components/index.html), a search store is automatically instantiated.

## Independent Multi-Index searches

Let's take a look at what a minimalistic example of multi-index search looks like:

```html
<!-- App.vue -->
<template>
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index-name="first">
    <ais-search-box />
    <ais-results />
  </ais-index>
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index-name="second">
    <ais-search-box />
    <ais-results />
  </ais-index>
</template>
```

In this example, we display results from two indices, but we are still using two search boxes.

## Correlated Multi-Index searches

Here's how to bind a single input displaying results from multiple indices:

**Note:** For now it's not feasible to bind the provided [Search Box component](components/search-box.html) directly to different indices, we are working on that

```html
<!-- App.vue -->
<template>
  <input v-model="query">
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index-name="first" :query="query">
    <ais-results />
  </ais-index>
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index-name="second" :query="query">
    <ais-results />
  </ais-index>
</template>
<script>
export default {
  data: function() {
    return {
      query: ''
    }
  }
}
</script>
```

We bind the `query` value using the [`v-model` directive](https://vuejs.org/v2/guide/forms.html#v-model-with-Components) so that as the value changes, it gets propagated to `data.query`.

Then the query value is sent to both indices:

```html
<ais-index :query="query">
```

The query property of the index will set the query on the underlying store as it changes.

Now when we change the value of the input, the query is changed in both stores at the same time.
The 2 stores will in turn fetch new results from Algolia and display them.

**Tip: You can bind any query parameter value to the index by binding an object to `queryParameters`.**

Here is the same example as above with a different syntax, binding the `query`.

```html
<!-- App.vue -->
<template>
  <input v-model="query">
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index-name="first" :query-parameters="{query: query}">
    <ais-results />
  </ais-index>
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index-name="second" :query-parameters="{query: query}">
    <ais-results />
  </ais-index>
</template>
<script>
export default {
  data: function() {
    return {
      query: ''
    }
  }
}
</script>
```
