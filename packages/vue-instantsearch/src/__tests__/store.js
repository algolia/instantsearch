import algoliaClient from 'algoliasearch';
import algoliaHelper from 'algoliasearch-helper';

import {
  FACET_AND,
  FACET_OR,
  FACET_TREE,
  HIGHLIGHT_PRE_TAG,
  HIGHLIGHT_POST_TAG,
  assertValidFacetType,
  createFromAlgoliaCredentials,
  createFromAlgoliaClient,
  Store,
} from '../store';

test('FACET_AND should be "and"', () => {
  expect(FACET_AND).toBe('and');
});

test('FACET_OR should be "or"', () => {
  expect(FACET_OR).toBe('or');
});

test('FACET_TREE should be "tree"', () => {
  expect(FACET_TREE).toBe('tree');
});

test('HIGHLIGHT_PRE_TAG should be "__ais-highlight__"', () => {
  expect(HIGHLIGHT_PRE_TAG).toBe('__ais-highlight__');
});

test('HIGHLIGHT_POST_TAG should be "__/ais-highlight__"', () => {
  expect(HIGHLIGHT_POST_TAG).toBe('__/ais-highlight__');
});

test('can assert that a facet type is valid', () => {
  expect(() => {
    assertValidFacetType(FACET_AND);
  }).not.toThrow();
  expect(() => {
    assertValidFacetType(FACET_OR);
  }).not.toThrow();
  expect(() => {
    assertValidFacetType(FACET_TREE);
  }).not.toThrow();
  expect(() => {
    assertValidFacetType('unknown');
  }).toThrow();
});

test('can create a Store instance from algolia credentials', () => {
  const store = createFromAlgoliaCredentials('app_id', 'api_key');
  expect(store).toBeInstanceOf(Store);
  expect(store.algoliaApiKey).toBe('api_key');
  expect(store.algoliaAppId).toBe('app_id');
});

test('can create a Store instance from an algolia client', () => {
  const client = algoliaClient('app_id', 'api_key');
  const store = createFromAlgoliaClient(client);
  expect(store).toBeInstanceOf(Store);
  expect(store.algoliaClient).toBe(client);
});

describe('Store', () => {
  test('should be constructed with a helper instance', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    const store = new Store(helper);

    expect(store.algoliaHelper).toBe(helper);
  });

  test('should always use custom highlighting tags', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    const store = new Store(helper);

    expect(store.highlightPreTag).toEqual(HIGHLIGHT_PRE_TAG);
    expect(store.highlightPostTag).toEqual(HIGHLIGHT_POST_TAG);
  });

  test('can retrieve index name', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client, 'my_index');
    const store = new Store(helper);

    expect(store.indexName).toEqual('my_index');
  });

  test('can set index name', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    const store = new Store(helper);

    store.indexName = 'custom_index_name';

    expect(store.indexName).toEqual('custom_index_name');
  });

  test('can retrieve the current page', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    helper.setPage(1);
    const store = new Store(helper);

    expect(store.page).toEqual(2);
  });

  test('can change the current page', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    const store = new Store(helper);

    store.page = 2;

    expect(helper.getPage()).toEqual(1);
    expect(store.page).toEqual(2);
  });

  test('should add "vue-instantsearch" User Agent to the client with the current version', () => {
    const addAlgoliaAgent = jest.fn();
    const client = {
      addAlgoliaAgent,
    };

    const helper = algoliaHelper(client);
    new Store(helper);
    const version = require('../../package.json').version;
    expect(addAlgoliaAgent).toBeCalledWith(`vue-instantsearch ${version}`);
  });

  test('should merge query parameters with existing ones', () => {
    const store = createFromAlgoliaCredentials('whatever', 'whatever');
    store.queryParameters = {
      attributesToRetrieve: ['objectID'],
      nonRetrievableAttributes: ['secret'],
    };

    expect(store.queryParameters).toHaveProperty('attributesToRetrieve', [
      'objectID',
    ]);
    expect(store.queryParameters).toHaveProperty('nonRetrievableAttributes', [
      'secret',
    ]);

    // Ensure parameters have been merged with existing ones.
    expect(Object.keys(store.queryParameters).length).toBeGreaterThan(2);
  });

  test('can retrieve query parameters', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    helper.setQueryParameter('distinct', 1);
    helper.setPage(3);

    const store = new Store(helper);

    expect(store.queryParameters).toHaveProperty('distinct', 1);

    // Ensure that pages start at 1 by making sure our initial 3 became 4.
    expect(store.queryParameters).toHaveProperty('page', 4);
  });

  test('should reset page when query parameters are changed', () => {
    const store = createFromAlgoliaCredentials('whatever', 'whatever');
    store.page = 2;
    store.queryParameters = {
      distinct: 1,
      attributesToRetrieve: ['objectID'],
    };

    expect(store.page).toEqual(1);
  });

  test('should allow page to be changed by updating query parameters', () => {
    const store = createFromAlgoliaCredentials('whatever', 'whatever');
    store.queryParameters = {
      page: 3,
      distinct: 1,
      attributesToRetrieve: ['objectID'],
    };

    expect(store.page).toEqual(3);
  });

  test('should trigger search only once when query parameters are changed', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    const store = new Store(helper);

    const search = jest.fn();
    helper.search = search;

    store.start();

    helper.search.mockClear();

    store.queryParameters = {
      page: 3,
      distinct: 1,
      attributesToRetrieve: ['objectID'],
    };

    expect(search).toHaveBeenCalledTimes(1);
  });
});
