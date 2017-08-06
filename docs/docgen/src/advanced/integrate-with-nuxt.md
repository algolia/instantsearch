---
title: Integrate with Nuxt.js
mainTitle: Advanced
layout: main.pug
category: Advanced
withHeadings: true
navWeight: 3
editable: true
githubSource: docs/docgen/src/advanced/integrate-with-nuxt.md
---

[Nuxt.js](https://nuxtjs.org) is a framework built on top of Vue.js that helps you built applications robust applications.
Nuxt.js has a strong focus in making sure your application can be [server side rendered](https://nuxtjs.org/guide/#server-rendered).

In this guide, you will learn how to bootstrap a Nuxt.js project and then how to integrate Vue InstantSearch.

## Bootstrapping a Nuxt.js project

We recommend you to use the official [vue-cli](https://vuejs.org/v2/guide/installation.html#CLI) to bootstrap your Nuxt.js project, along with the [nuxt/starter template](https://github.com/nuxt/nuxt.js/tree/dev/start).

```shell
$ npm install --global vue-cli
$ vue init nuxt/starter nuxt-app
```

**info:** Default settings are enough, hit `Enter ⏎` at every question

Then install the dependencies of your new project:

```shell
$ cd nuxt-app
$ npm install
```

You can now have Nuxt watch the changes in your project, and serve your application on `http://localhost:3000` by running:

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
  <ais-index app-id="latency" api-key="3d9875e51fbd20c7754e65422f7ce5e1" index-name="bestbuy">
    <ais-search-box></ais-search-box>
    <ais-results>
      <template scope="{ result }">
        <h2>{{ result.name }}</h2>
      </template>
    </ais-results>
  </ais-index>
</template>
```

Now, if you head to `http://localhost:3000/search`, you should see your search experiences.

The only issue with the current implementation, is that the results are fetched from the browser, and it would be better if they were fetched from the server side.

### Make search results server side rendered

Nuxt.js let's you provide a handy `asyncData` method to your component so that the server can wait for your data.
It then passes that data to the frontend by serializing it as javascript.

You will want to operate the initial query to Algolia, fetch the results and render the search experience with those results.
That way, even if the browser does not support Javascript, results still display.
This can also be a nice performance gain for first rendering of the page and allows you to cache the results with features provided by the HTTP(S) protocol.

Here is what you need to do to enable your server to pre-render results:

```vue
<template>
  <ais-index :search-store="searchStore" >
    <ais-search-box></ais-search-box>
    <ais-results>
      <template scope="{ result }">
        <h2>{{ result.name }}</h2>
      </template>
    </ais-results>
  </ais-index>
</template>

<script>
import { createFromAlgoliaCredentials, createFromSerialized } from 'vue-instantsearch'
const searchStore = createFromAlgoliaCredentials('latency', '3d9875e51fbd20c7754e65422f7ce5e1')
searchStore.indexName = 'bestbuy'

export default {
  async asyncData () {
    searchStore.start()
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
1. you first manually start the store which will launch the first query to Algolia `searchStore.start()`
2. you then wait for the query to be done so that you got all the results in the store with `store.waitUntilInSync()` method
3. you return the serialized version of the store so that it can be passed to the frontend `return { serializedSearchStore: searchStore.serialize() }`

Next step is making sure to expose the `searchStore` to the template.
To do so, you simply need to deserialize the previously serialized store with the [`createFromSerialized` factory method](getting-started/search-store.html#create-a-search-store-from-a-previously-serialized-store).
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







