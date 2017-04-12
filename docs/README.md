## Welcome to Vue InstantSearch

Vue InstantSearch is the ultimate toolbox for creating instant-search
experiences using [Vue](https://vuejs.org/) and [Algolia](https://www.algolia.com/).

## Algolia demo credentials

To be able to use Vue InstantSearch you will need an Algolia account, and
get the credentials from your Algolia Dashboard.

For the sake of simplicity, here are some demo credentials that gives access to
an e-commerce website's index.

 - `appId`: `latency`
 - `searchKey`: `3d9875e51fbd20c7754e65422f7ce5e1`
 - `indexName`: `bestbuy`

## Setup a new Vue project

We recommend you bootstrap a new Vue project with the [official CLI tool](https://vuejs.org/v2/guide/installation.html#CLI).

We recommend you kick off your demo with the `webpack-simple` template:

```bash
$ vue init webpack-simple
```

## Install `vue-instantsearch`

Vue InstantSearch is available in the [npm](https://www.npmjs.com) registry.

Install it:

```shell
yarn add vue-instantsearch
```

Note: we use `yarn add` to install dependencies but Vue InstantSearch is also installable via `npm install`.

## Use the InstantSearch plugin

By telling Vue to use the InstantSearch plugin, you will be able to use all the components
in your templates:

```js
import Vue from 'vue';
import InstantSearch from 'vue-instantsearch';

Vue.use(InstantSearch);
```

**Note: if Vue is available as a global variable this will be done for you automatically.**

## Create your first search experience
```html
<template>
  <ais-store
    appId="latency"
    apiKey="3d9875e51fbd20c7754e65422f7ce5e1"
    indexName="bestbuy"
  >
    <ais-input />
    <ais-results>
      <template scope="{ result }">
        <h2><ais-highlight :result="result" attributeName="name" /></h2>
        <p><ais-snippet :result="result" attributeName="shortDescription" /></p>
      </template>
    </ais-results>
  </ais-store>
</template>
```
