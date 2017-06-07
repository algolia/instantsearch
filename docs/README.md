## Welcome to Vue InstantSearch

**WARNING: This project is currently in BETA.**

Vue InstantSearch is the ultimate toolbox for creating instant-search
experiences using [Vue.js](https://vuejs.org/) and [Algolia](https://www.algolia.com/).

## Algolia demo credentials

To be able to use Vue InstantSearch you will need an Algolia account. Once you have an Algolia account, you can get
the credentials from the [Algolia Dashboard](https://www.algolia.com/api-keys).

For the sake of simplicity, here are some demo credentials that will give you access to
an e-commerce website's index.

 - `appId`: `latency`
 - `searchKey`: `3d9875e51fbd20c7754e65422f7ce5e1`
 - `indexName`: `bestbuy`

## Setup a new Vue project

You can bootstrap a new Vue project with the [official CLI tool](https://vuejs.org/v2/guide/installation.html#CLI).

```sh
npm install --global vue-cli
```

Now kick off your demo with the `webpack-simple` template:

```sh
vue init webpack-simple
```

Finally, you should install the npm dependencies:

```sh
npm install
```

## Install `vue-instantsearch`

You should now add Vue InstantSearch as a dependency.

Vue InstantSearch is available in the [npm](https://www.npmjs.com) registry.

You can install it by running:

```sh
npm install --save vue-instantsearch
```

## Use the InstantSearch plugin

Now you need to tell Vue to use the Vue InstantSearch plugin so that all search
components are available in the templates.

Open the main entry point of your application, `src/main.js` and replace the existing content with the following:

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

From now on, you can use all Vue InstantSearch components in your templates throughout the whole application.

## Create your first search experience

You can now replace the default Vue logo with a simple search experience.

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

From here on out, you should be able to run the simple application by running:

```sh
npm run dev
```
