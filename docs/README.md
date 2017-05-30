## Welcome to Vue InstantSearch

**WARNING: This project is currently in BETA.**

Vue InstantSearch is the ultimate toolbox for creating instant-search
experiences using [Vue.js](https://vuejs.org/) and [Algolia](https://www.algolia.com/).

## Algolia demo credentials

To be able to use Vue InstantSearch we will need an Algolia account. Once we have an Algolia account, we can get
the credentials from the [Algolia Dashboard](https://www.algolia.com/api-keys).

For the sake of simplicity, here are some demo credentials that will give us access to
an e-commerce website's index.

 - `appId`: `latency`
 - `searchKey`: `3d9875e51fbd20c7754e65422f7ce5e1`
 - `indexName`: `bestbuy`

## Setup a new Vue project

Let's first bootstrap a new Vue project with the [official CLI tool](https://vuejs.org/v2/guide/installation.html#CLI).

```sh
npm install --global vue-cli
```

Now let's kick off our demo with the `webpack-simple` template:

```sh
vue init webpack-simple
```

Now Finally, let's install the npm dependencies:

```sh
npm install
```

## Install `vue-instantsearch`

Now let's create our first Algolia Vue InstantSearch experience.

First we need to add Vue InstantSearch as a dependency.

Vue InstantSearch is available in the [npm](https://www.npmjs.com) registry.

Let's install it:

```sh
npm install --save vue-instantsearch
```

## Use the InstantSearch plugin

Now we need to tell Vue to use the Vue InstantSearch plugin so that all search
components are available in the templates.

Let's open the main entry point of our application, `src/main.js` and replace the existing content with the following:

```js
import Vue from 'vue';
import App from './App.vue'
import InstantSearch from 'vue-instantsearch';

Vue.use(InstantSearch);

new Vue({
  el: '#app',
  render: h => h(App)
})

```

From now on, we are able to use all Vue InstantSearch components in our templates throughout the whole application.

## Create your first search experience

Let's now replace the default Vue logo with a simple search experience.

Open the `src/App.vue` component, and replace the content between the `<template></template>` tags with the following:

```html
<template>
  <ais-index
    appId="latency"
    apiKey="3d9875e51fbd20c7754e65422f7ce5e1"
    indexName="bestbuy"
  >
    <ais-search-box />
    <ais-results>
      <template scope="{ result }">
        <h2><ais-highlight :result="result" attributeName="name" /></h2>
      </template>
    </ais-results>
  </ais-index>
</template>
```

From here on out, we are able to run the simple application:

```sh
npm run dev
```
