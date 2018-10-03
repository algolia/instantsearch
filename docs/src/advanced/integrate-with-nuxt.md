---
title: Integrate with Nuxt.js
mainTitle: Advanced
layout: main.pug
category: Advanced
withHeadings: true
navWeight: 3
editable: true
githubSource: docs/src/advanced/integrate-with-nuxt.md
---

> NOTE: this guide has not yet been updated for v2

[Nuxt.js](https://nuxtjs.org) is a framework built on top of Vue.js that helps you build robust applications.
Nuxt.js has a strong focus on making sure your application can be [server side rendered](https://nuxtjs.org/guide/#server-rendered).

In this guide, you will learn how to bootstrap a Nuxt.js project and then how to integrate Vue InstantSearch.

## Bootstrapping a Nuxt.js project

We recommend using the official [vue-cli](https://vuejs.org/v2/guide/installation.html#CLI) to bootstrap your Nuxt.js project, along with the [nuxt/starter template](https://github.com/nuxt/nuxt.js/tree/dev/start).

```shell
$ npm install --global vue-cli
$ vue init nuxt/starter nuxt-app
```

**Hint:** Default settings are enough, hit `Enter ⏎` at every question.

Then install the dependencies of your new project:

```shell
$ cd nuxt-app
$ npm install
```

You can now have Nuxt track the changes in your project and host your application on `http://localhost:3000` by running:

```shell
$ npm run dev
```

## Integrate Vue InstantSearch with Nuxt.js

### Install & register the Vue InstantSearch plugin

Now that your basic Nuxt application is ready, let's add Vue InstantSearch to it.

First, you need to install `vue-instantsearch` as a dependency:

```shell
$ npm install --save vue-instantsearch
```

By default, Vue InstantSearch exports a Vue plugin, and you need to register it.

This can be done very easily in Nuxt by creating a new file `plugins/vue-instantsearch.js` containing:

```javascript
import Vue from 'vue'
import InstantSearch from 'vue-instantsearch'

Vue.use(InstantSearch)
```

Then you need to register that new plugin in Nuxt's config file `nuxt.config.js`:

```javascript
module.exports = {
  // ...
  plugins: ['~plugins/vue-instantsearch']
}
```

Now you can use any Vue InstantSearch component anywhere in your application.

### Create a search page powered by Vue InstantSearch

Nuxt [makes it a breeze for you to register new routes](https://nuxtjs.org/guide/routing). It is a matter of dropping `.vue` component files inside the `pages/` directory.

You can go ahead and create a search page by creating a new file called `pages/search.vue`.

```html
<template>
  <ais-instant-search :search-client="searchClient" index-name="bestbuy">
    <ais-search-box></ais-search-box>
    <ais-results>
      <template slot-scope="{ result }">
        <h2>{{ result.name }}</h2>
      </template>
    </ais-results>
  </ais-instant-search>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';

export default {
  data() {
    return {
      searchClient: algoliasearch('latency', '3d9875e51fbd20c7754e65422f7ce5e1'),
    };
  },
};
</script>
```

Now, if you head to `http://localhost:3000/search`, you should be able to see your search experience.

The only issue with the current implementation is that the results are fetched from the browser, whereas it would be better if they were already filled the first time we open this page.

### Make search results server side rendered

Nuxt.js let's you provide a handy `asyncData` method to your component so that the server can wait for your data.
It then passes that data to the frontend by serializing it as javaScript.

You'll want to operate the initial query to Algolia, fetch the results and render the search experience with those results.
That way, even if the browser does not support JavaScript, results will still display.
This adds a nice performance gain by first rendering the page while caching the results, using features provided by the HTTP(S) protocol.

Here is what you need to do to enable your server to pre-render results:

```vue
<template>
  <ais-instant-search :search-store="searchStore" >
    <ais-search-box></ais-search-box>
    <ais-results>
      <template slot-scope="{ result }">
        <h2>{{ result.name }}</h2>
      </template>
    </ais-results>
  </ais-instant-search>
</template>

<script>
import { createFromAlgoliaCredentials, createFromSerialized } from 'vue-instantsearch'
const searchStore = createFromAlgoliaCredentials('latency', '3d9875e51fbd20c7754e65422f7ce5e1')
searchStore.indexName = 'bestbuy'

export default {
  async asyncData () {
    searchStore.start()
    searchStore.refresh()
    await searchStore.waitUntilInSync()

    return { serializedSearchStore: searchStore.serialize() }
  },

  data () {
    return {
      searchStore: null
    }
  },

  created () {
    this.searchStore = createFromSerialized(this.serializedSearchStore)
  }
}
</script>
```

First thing to notice is that you now [manually pass down the search store](getting-started/search-store.html#how-to-manually-create-a-search-store) to your `<ais-index>` component. 
This allows you to have a better control over the lifecycle of the search.

In the `asyncData` method, multiple things happen:
1. you first manually start & refresh the store which will launch the first query to Algolia `searchStore.start()` && `searchStore.refresh()`
2. you then wait for the query to be done so that you get all the results in the store with `store.waitUntilInSync()` method
3. you return the serialized version of the store so that it can be passed to the frontend `return { serializedSearchStore: searchStore.serialize() }`

The next step is exposing the `searchStore` to the template.
To do that, you need to deserialize the previously serialized store with the [`createFromSerialized` factory method](getting-started/search-store.html#create-a-search-store-from-a-previously-serialized-store).
The best place to do so is the [`created` Vue lifecycle hook](https://vuejs.org/v2/api/#created) because it is the only hook that:
- is triggered both in frontend and server side
- has access to observed `data` via the usage of `this`

You can then expose it in the data, by doing: `this.searchStore = createFromSerialized(this.serializedSearchStore)`.
Note that you need to let Vue know that `searchStore` should be observed by adding it to the `data` option:

```javascript
data () {
  return {
    searchStore: null
  }
},
```
