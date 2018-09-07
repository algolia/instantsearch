---
title: Multi index search
mainTitle: Advanced
layout: main.pug
category: Advanced
withHeadings: true
navWeight: 1
editable: true
githubSource: docs/src/advanced/multi-index-search.md
---

In this guide, you'll learn how to get results out of searching from multiple indices simultaneously.

Take a look at a [live multi-index search example](examples/multi-index-search.html) to quickly grasp what we are talking about.

## When to use multi-index search

You will need multi-index search when, in the same UI, you want to display results coming from different indices.

Here are two reasons to store your data in multiple indices:

- To have different ranking rules or settings depending on the type of data inside the index
- To make it easier to display only the results of a given type in a given area of your page

If you don't need specific settings for part of your index, and you expect to see all results inter-mixed on the same area of your page, then chances are you won't need to implement a multi-index search experience.

However, if you end up finding yourself trying to manually merge records coming from different indices, you have probably missed an opportunity to use multi-index search.

## How it works

Every `ais-index` component is in charge of fetching the results from a single Algolia index.

To implement a search experience that fetches results from two indices, you need to have two `ais-index` components.

**Tip: you can fetch results from as many indices as you want. 💥**

## Independent Multi-Index searches

Let's take a look at what a minimal example of multi-index search looks like:

```html
<!-- App.vue -->
<template>
  <ais-index :search-client="searchClient" index-name="first">
    <ais-search-box />
    <ais-hits />
  </ais-index>
  <ais-index :search-client="searchClient" index-name="second">
    <ais-search-box />
    <ais-hits />
  </ais-index>
</template>

<script>
import algoliasearch from 'algoliasearch';

export default {
  data() {
    return {
      searchClient: algoliasearch('xxx', 'xxx', { _useRequestCache: true }),
    };
  },
};
</script>
```

In this example we display results from two indices, but we are still using two search boxes.

**Note: here, and in the other examples we put `_useRequestCache` to true. This is a feature that caches the requests rather than the responses and avoids extra queries being done here**

## Grouped Multi-Index searches

Here's how to bind a single input displaying results from multiple indices:

```html
<!-- App.vue -->
<template>
  <ais-index :search-client="searchClient" index-name="first">
    <ais-search-box v-model="query" />
    <ais-hits />
  </ais-index>
  <ais-index :search-client="searchClient"index-name="second">
    <ais-search-box v-model="query" hidden/>
    <ais-hits />
  </ais-index>
</template>

<script>
import algoliasearch from 'algoliasearch';

export default {
  data() {
    return {
      query: '',
      searchClient: algoliasearch('xxx', 'xxx', { _useRequestCache: true }),
    };
  },
};
</script>
```

We bind the `query` value using the [`v-model` directive](https://vuejs.org/v2/guide/forms.html#v-model-with-Components) so that as the value changes, it gets propagated to the query for both search boxes. Note that we made the second search box invisible by hiding it, but it's still rendered and thus still has an impact on the page

It's also possible to bind this model on configure, this has the advantage that other things than the query also can be synchronized if necessary, like for example a menu. Here's an example of using the `ais-configure` widget to synchronize the query.

```html
<!-- App.vue -->
<template>
  <input v-model="query">
  <ais-index :search-client="searchClient" index-name="first">
    <ais-configure :query="query" />
    <ais-results />
  </ais-index>
  <ais-index :search-client="searchClient" index-name="second">
    <ais-configure :query="query" />
    <ais-results />
  </ais-index>
</template>

<script>
import algoliasearch from 'algoliasearch';

export default {
  data: function() {
    return {
      query: '',
      searchClient: algoliasearch('xxx', 'xxx', { _useRequestCache: true }),
    };
  },
};
</script>
```
