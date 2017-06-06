Search Store Instance
---

The core of Vue InstantSearch will allow you to:

- Perform search calls to Algolia
- Change search parameters
- Retrieve search results

## You don't necessarily need to know about the search store

Before going further, it is important to realize that directly interacting with the search store is not mandatory.

If you use [provided components](using-components.md), wrapped into Index components, then search stores are created and interacted with behind the scenes.

In that case, it is the responsibility of the Index component to make sure a search store is successfully made available to child components.

It does so by leveraging the [provide/inject feature](https://vuejs.org/v2/api/#provide-inject) of Vue.js.

## When you will need to directly create search stores

There are many reasons to manually create search stores, here are some of them:

- A search component is [not wrapped into an Index component](using-components.md#manually-inject-the-search-store-into-components)
- You want to watch search store parameters or results to affect other parts of the application
- You want to do [render the initial application vue on the server side](server-side-rendering.md)
- You are [developing a custom component](custom-component.md)

## How to manually create a search store

There are several ways to create a new search store.

### Create a search store from Algolia credentials

The easiest way to create a search store, is by using the `createFromAlgoliaCredentials` factory method.

```js
import { createFromAlgoliaCredentials } from 'vue-instantsearch';

const searchStore = createFromAlgoliaCredentials('app_id', 'api_key');
```

### Create a search store from an Algolia Client instance

If you already have an instance of the [official Algolia client](https://github.com/algolia/algoliasearch-client-javascript), here is how you would create a search store instance:


```js
import algoliaClient from 'algoliasearch';
import { createFromAlgoliaClient } from 'vue-instantsearch';

const client = algoliaClient('app_id', 'api_key');
const searchStore = createFromAlgoliaClient(client);
```

### Create a search store from an Algolia Helper instance

If you already have an instance of the [Algolia Helper](https://github.com/algolia/algoliasearch-helper-js), here is how you would create a search store instance:

```js
import algoliaClient from 'algoliasearch';
import algoliaHelper from 'algoliasearch-helper';
import { Store } from 'vue-instantsearch';

const client = algoliaClient('app_id', 'api_key');
const helper = algoliaHelper(client);
const searchStore = new Store(helper);
```

### Create a search store from a previously serialized store

The search store has a method `serialize()` that returns a plain JavaScript object.

This object can later be used to re-construct the search store and put it in the state it was the moment it was serialized.

This is especially useful when [implementing server side rendering](server-side-rendering.md), where you need to share the backend store state with the frontend.

```js
import { createFromAlgoliaCredentials, createFromSerialized } from 'vue-instantsearch';

const searchStore = createFromAlgoliaCredentials('app_id', 'api_key');
const serializedData = searchStore.serialize();

const reconstructedSearchStore = createFromSerialized(serializedData);
```


## Understanding how the search store synchronizes with Algolia

Every time the state of the store is mutated, it will produce a new call to the Algolia API.
The moment the response comes back, the state is updated and all components observing the results will be able to re-render if needed.

There are times though you will not want the store to perform Algolia requests right after a query parameter changed.

Here are some examples where you want to "batch" mutations, and only trigger a call to the Algolia API once you have finished mutating the state:

- When you want to change multiple query parameters
- When your search application first loads
- When you are doing server rendering and want to manually trigger the search and wait for the first response

To allow you to control what calls are being made to Algolia, you can `stop` the store, and `start` it once you want it to become reactive to change again.

```js
// ...
const store = /* Existing store instance */

store.stop();

store.index = 'new_index';
store.query = '';
store.queryParameters({'distinct': true});

store.start();
```

In this example, even if the state is mutated several times, only one call to Algolia will be made after the Store is resumed by the `start()` call.

**Important: When you manually create a search Store, it is stopped by default. You need to manually call `start()` to trigger the first call. This gives you full control over the initial state of the store before the first call to Algolia is sent.**
