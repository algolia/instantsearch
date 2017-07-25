---
title: Search store
mainTitle: Essentials
layout: main.pug
category: Getting started
withHeadings: true
navWeight: 5
editable: true
githubSource: docs/docgen/src/getting-started/search-store.md
---

The search store of Vue InstantSearch allows you to:

- Perform search calls to Algolia
- Change search parameters
- Retrieve search results

## You don't necessarily need to know about the search store

Before going further, it is important to realize that directly interacting with the search store is not mandatory but an advanced use of Vue InstantSearch.

If you use [provided components](getting-started/using-components.html), wrapped into an [Index](components/index.html) component, then search stores are created and used automatically by components.

In that case, it is the responsibility of the `Index` component to make sure a search store is successfully made available to child components.

It does so by leveraging the [provide/inject feature](https://vuejs.org/v2/api/#provide-inject) of Vue.js.

## When you will need to directly create search stores

There are many reasons to manually create search stores, here are some of them:

- A search component is [not wrapped into an Index component](components.md#manually-inject-the-search-store-into-components)
- You want to watch search store parameters or results to affect other parts of the application
- You want to do [render the initial application vue on the server side](advanced/server-side-rendering.html)
- You are [developing a custom component](getting-started/custom-components.html)

## How to manually create a search store

There are several ways to create a new search store.

### Create a search store from Algolia credentials

The easiest way to create a search store, is by using the `createFromAlgoliaCredentials` factory method. In that case, all you need is the Algolia application ID and the search API key. These information can both be found on your [Algolia dashboard](https://www.algolia.com/dashboard), on the "API keys" screen.

**Security notice: Make sure you always use search only API keys. Using the Admin API key in a frontend application would let any user have full control over your Algolia application.**

```javascript
import { createFromAlgoliaCredentials } from 'vue-instantsearch';

const searchStore = createFromAlgoliaCredentials('appId', 'apiKey');
```

### Create a search store from an Algolia client instance

The Algolia Client is the [official JavaScript API Client](https://github.com/algolia/algoliasearch-client-javascript) which simplifies communication with the Algolia API.

If you are already a user of Algolia, and have an existing application using the Algolia client, you could re-use an existing instance of that API client like so:

```javascript
import algoliaClient from 'algoliasearch';
import { createFromAlgoliaClient } from 'vue-instantsearch';

const client = algoliaClient('appId', 'apiKey');
const searchStore = createFromAlgoliaClient(client);
```

Note that there is no reason to provide your own client if you are not reusing it elsewhere.

### Create a search store from an Algolia helper instance

The [Algolia helper](https://github.com/algolia/algoliasearch-helper-js) is a JavaScript library that is built on top of the Algolia API client. Its goal is to expose a simple API to achieve advanced queries while also exposing utility methods and behaviours like keeping track of the last result.

As for the Algolia client, if you do not have an existing Algolia helper in your application, there should be no reason for you to instantiate the search store like showcased below.

```javascript
import algoliaClient from 'algoliasearch';
import algoliaHelper from 'algoliasearch-helper';
import { Store } from 'vue-instantsearch';

const client = algoliaClient('appId', 'apiKey');
const helper = algoliaHelper(client);
const searchStore = new Store(helper);
```

### Create a search store from a previously serialized store

The search store has a method `serialize()` that returns a plain JavaScript object.

This object can later be used to re-construct the search store and put it in the state it was the moment it was serialized.

This is especially useful when [implementing server side rendering](advanced/server-side-rendering.html), where you need to share the backend store state with your frontend.

```javascript
import { createFromAlgoliaCredentials, createFromSerialized } from 'vue-instantsearch';

const searchStore = createFromAlgoliaCredentials('appId', 'apiKey');
const serializedData = searchStore.serialize();

const reconstructedSearchStore = createFromSerialized(serializedData);
```

## Understanding how the search store synchronizes with Algolia

Every time the state of the store is mutated, it will produce a new call to the Algolia API.
The moment the response comes back, the state is updated and all components observing the results will be able to re-render if needed.

```javascript
const store = /* Existing Store instance */;
store.page = 3;
// Triggers a call to Algolia with page set to 3.
store.resultsPerPage = 10;
// Triggers a call to Algolia with page set to 3 and resultsPerPage set to 10.
```

There are times though you will not want the store to perform Algolia requests right after a query parameter changed.

Here are some examples where you want to "batch" mutations, and only trigger a call to the Algolia API once you have finished mutating the state:

- When you want to change multiple query parameters
- When your search application first loads
- When you are doing server rendering and want to manually trigger the search and wait for the first response

To allow you to control what calls are being made to Algolia, you can `stop` the store, and `start` it once you want it to become reactive to change again.

```javascript
// ...
const store = /* Existing store instance */;

store.stop();

store.indexName = 'new_index';
store.query = '';
store.queryParameters({'distinct': true});

store.start();
```

In this example, even if the state is mutated several times, only one call to Algolia will be made after the Store is resumed by the `start()` call.

**Important:** When you manually create a search store, it is stopped by default. You need to manually call `start()` to trigger the first call. This gives you full control over the initial state of the store before the first call to Algolia is sent.

```javascript
import { createFromAlgoliaCredentials } from 'vue-instantsearch';

const store = createFromAlgoliaCredentials('appId', 'search_apiKey');
store.indexName = 'new_index';
store.start();
```

In the example above, the first query will be sent to Algolia after `store.start()` has been called.
