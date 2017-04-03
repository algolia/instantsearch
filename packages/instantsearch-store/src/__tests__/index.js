import {
  FACET_AND,
  FACET_OR,
  FACET_TREE,
  assertValidFacetType,
  createFromAlgoliaCredentials,
  createFromAlgoliaClient,
  Store
} from 'instantsearch-store';

import algoliaClient from 'algoliasearch';
import algoliaHelper from 'algoliasearch-helper';

test('FACET_AND should be "and"', () => {
  expect(FACET_AND).toBe('and');
});

test('FACET_OR should be "or"', () => {
  expect(FACET_OR).toBe('or');
});

test('FACET_TREE should be "tree"', () => {
  expect(FACET_TREE).toBe('tree');
});

test('can assert that a facet type is valid', () => {
  expect( () => { assertValidFacetType(FACET_AND) } ).not.toThrow()
  expect( () => { assertValidFacetType(FACET_OR) } ).not.toThrow()
  expect( () => { assertValidFacetType(FACET_TREE) } ).not.toThrow()
  expect( () => { assertValidFacetType('unknown') } ).toThrow()
});

test('can create a Store instance from algolia credentials', () => {
  const store = createFromAlgoliaCredentials('app_id', 'api_key');
  expect(store).toBeInstanceOf(Store)
  expect(store.algoliaApiKey).toBe('api_key')
  expect(store.algoliaAppId).toBe('app_id')
})

test('can create a Store instance from an algolia client', () => {
  const client = algoliaClient('app_id', 'api_key');
  const store = createFromAlgoliaClient(client);
  expect(store).toBeInstanceOf(Store)
  expect(store.algoliaClient).toBe(client)
})

describe('Store', () => {

  test('should be constructed with a helper instance', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    const store = new Store(helper);

    expect(store.algoliaHelper).toBe(helper);
  })

  test('can retrieve index name', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client, 'my_index');
    const store = new Store(helper);

    expect(store.indexName).toEqual('my_index');
  })

  test('can set index name', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    const store = new Store(helper);

    store.indexName = 'custom_index_name';

    expect(store.indexName).toEqual('custom_index_name');
  })

  test('can retrieve the current page', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    helper.setPage(1);
    const store = new Store(helper);

    expect(store.page).toEqual(2);
  })

  test('can change the current page', () => {
    const client = algoliaClient('app_id', 'api_key');
    const helper = algoliaHelper(client);
    const store = new Store(helper);

    store.page = 2;

    expect(helper.getPage()).toEqual(1);
    expect(store.page).toEqual(2);
  })

});
