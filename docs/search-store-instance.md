Search Store Instance
---

The core of Vue InstantSearch is to:

- Perform search calls to Algolia
- Allow us to change search parameters
- Allow us to retrieve search results

This behaviour is encapsulated in the search store.

## We don't necessarily need to know about the search store

Before going further, it is important to realize that directly interacting with the search store is not mandatory.

If we use [provided components](using-components.md), wrapped into Index components, then search stores are created and interacted with behind the scenes.

In that case, it is the responsibility of the Index component to make sure a search store is successfully made available to child components.

## When do we need to directly create search stores

There are many reasons to manually create search stores, here are some of them:

- A search component is [not wrapped into an Index component](using-components.md#manually-inject-the-search-store-into-components)
- We want to watch search store parameters or results to affect other parts of the application
- We want to do [render the initial application vue on the server side](server-side-rendering.md)
- We are [developing a custom component](custom-component.md)

## How to manually create a search store

There are several ways to create a new search store.

### Create a search store from Algolia credentials

The easiest way to create a search store, is by using the `createFromAlgoliaCredentials` factory method.

```js
import { createFromAlgoliaCredentials } from 'vue-instantsearch';

const searchStore = createFromAlgoliaCredentials('app_id', 'api_key');
```

### Create a search store from an Algolia Client instance

If we already have an instance of the [official Algolia client](https://github.com/algolia/algoliasearch-client-javascript), here is how we would create a search store instance:


```js
import algoliaClient from 'algoliasearch';
import { createFromAlgoliaClient } from 'vue-instantsearch';

const client = algoliaClient('app_id', 'api_key');
const searchStore = createFromAlgoliaClient(client);
```

### Create a search store from an Algolia Helper instance

If we already have an instance of the [Algolia Helper](https://github.com/algolia/algoliasearch-helper-js), here is how we would create a search store instance:

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

This is especially useful when [implementing server side rendering](server-side-rendering.md), where we need to share the backend store state with the frontend.

```js
import { createFromAlgoliaCredentials, createFromSerialized } from 'vue-instantsearch';

const searchStore = createFromAlgoliaCredentials('app_id', 'api_key');
const serializedData = searchStore.serialize();

const reconstructedSearchStore = createFromSerialized(serializedData);
```


## Understanding how the search store synchronizes with Algolia

Every time the state of the store is mutated, it will produce a new call to the Algolia API.
The moment the result comes back, state is updated and all components observing the results will be able to re-render if needed.

There are times though we don't want the store to perform Algolia requests right after a query parameter changed.

Here are some examples where we want ton "batch" mutations, and only trigger a call to the Algolia API once we have finished mutating the state:

- When we want to change multiple query parameters
- When our search application first loads
- When we are doing server rendering and want to manually trigger the search and wait for the first result

To allow use to control what calls are being made to Algolia, we can `stop` the store, and `start` it once we want it to be reactive to change again.

```js
// ...
const store = /* Existing store instance */

store.stop();

store.index = 'new_index';
store.query = '';
store.queryParameters({'distinct': true});

store.start();
```

In this example, even if we mutated the state several times, only one call to Algolia will be made after the Store is resumed by the `start()` call.

**Important: When we manually create a search Store, it is stopped. We need to call `start()` manually to trigger the first call. This gives us full control over the initial state of the store for the first call made to Algolia.**
