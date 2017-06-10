Multi-Index Search
---------

In this guide, you will learn how to get results from multiple indices simultaneously.

## When to use multi-index search

You will need multi-index search when in the same UI you want to display results
coming from different indices.

Here are 2 good reasons to store your data into multiple indices:

- Have different ranking rules or settings depending on the type of data inside of the index
- Make it easier to display only the results of a given type in a given area of your page

If you don't need specific settings for part of your index and that you expect
to see all results inter-mixed in the same area of your page, then chances are
you do not need to implement multi-index search experience.

If you end up finding yourself trying to manually merge records coming
from different indices, it probably means you missed an opportunity to use
multi-index search.

## How it works

Every search Store instance is in charge of fetching the results from a single
Algolia index.

To implement a search experience that fetches results from 2 indices,
you need to have 2 search Stores.

**Tip: you can fetch results from as many indices as you want.**

As a reminder before diving into some code, every time you use an Index
component (`<ais-index>`), a [search Store is instantiated behind the scenes](search-store-instance.md).


### Independent Multi-Index searches

Let's take a look at what a minimalistic example of multi-index search looks like:

```html
<!-- App.vue -->
<template>
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index="first">
    <ais-search-box />
    <ais-results />
  </ais-index>
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index="second">
    <ais-search-box />
    <ais-results />
  </ais-index>
</template>
```

In this example, we have 2 indices 2 search boxes and 2 different result sets.

Changing the text in the first input, will only update the first results.

### Correlated Multi-Index searches

Here is a different scenario:

```html
<!-- App.vue -->
<template>
  <input v-model="query">
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index="first" :query="query">
    <ais-results />
  </ais-index>
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index="second" :query="query">
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

In this example, there is only 1 text input.

We bind its value with the [`v-model` directive](https://vuejs.org/v2/guide/forms.html#v-model-with-Components) so that as the value changes, it gets propagated to `data.query`.

What you also see is that we bound the same `query` to both indices:

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
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index="first" :query-parameters="{query: query}">
    <ais-results />
  </ais-index>
  <ais-index app-id="xxxxxx" api-key="xxxxxx" index="second" :query-parameters="{query: query}">
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
