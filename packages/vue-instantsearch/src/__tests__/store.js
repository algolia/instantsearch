import algoliaClient from 'algoliasearch';
import algoliaHelper from 'algoliasearch-helper';

jest.useFakeTimers();

import {
  FACET_AND,
  FACET_OR,
  FACET_TREE,
  assertValidFacetType,
  createFromAlgoliaCredentials,
  createFromAlgoliaClient,
  Store,
  HIGHLIGHT_PRE_TAG,
  HIGHLIGHT_POST_TAG,
} from '../store';

const createStore = () => {
  const client = algoliaClient('appId', 'apiKey');
  const helper = algoliaHelper(client);

  return new Store(helper);
};

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
  const store = createFromAlgoliaCredentials('appId', 'apiKey');
  expect(store).toBeInstanceOf(Store);
  expect(store.algoliaApiKey).toBe('apiKey');
  expect(store.algoliaAppId).toBe('appId');
});

test('can create a Store instance from an algolia client', () => {
  const client = algoliaClient('appId', 'apiKey');
  const store = createFromAlgoliaClient(client);
  expect(store).toBeInstanceOf(Store);
  expect(store.algoliaClient).toBe(client);
});

describe('Store', () => {
  test('should be constructed with a helper instance', () => {
    const client = algoliaClient('appId', 'apiKey');
    const helper = algoliaHelper(client);
    const store = new Store(helper);

    expect(store.algoliaHelper).toBe(helper);
  });

  test('should throw an exception if not constructed with a helper', () => {
    expect(() => new Store({})).toThrow(
      new TypeError(
        'Store should be constructed with an AlgoliaSearchHelper instance as first parameter.'
      )
    );
  });

  test('should default highlighting tags should be undefined', () => {
    const store = createStore();

    expect(store.highlightPreTag).toEqual('<em>');
    expect(store.highlightPostTag).toEqual('</em>');
  });

  test('can retrieve index name', () => {
    const store = createStore();
    store._helper.setIndex('my_index');

    expect(store.indexName).toEqual('my_index');
  });

  test('can set index name', () => {
    const store = createStore();
    store.indexName = 'custom_indexName';

    expect(store.indexName).toEqual('custom_indexName');
  });

  test('can retrieve the current page', () => {
    const store = createStore();
    store._helper.setPage(1);

    expect(store.page).toEqual(2);
  });

  test('can change the current page', () => {
    const store = createStore();
    store.page = 2;

    expect(store._helper.getPage()).toEqual(1);
    expect(store.page).toEqual(2);
  });

  test('should add "vue-instantsearch" User Agent to the client with the current version', () => {
    const addAlgoliaAgent = jest.fn();
    const client = {
      addAlgoliaAgent,
    };

    const helper = algoliaHelper(client);
    new Store(helper); // eslint-disable-line no-new
    const version = require('../../package.json').version;
    expect(addAlgoliaAgent).toBeCalledWith(`vue-instantsearch ${version}`);
  });

  test('should throw an error upon adding a facet of unknown type', () => {
    const store = createStore();
    expect(() => {
      store.addFacet('attribute', 'unknown');
    }).toThrow(Error);
  });

  test('can register a conjunctive facet for retrieval', () => {
    const store = createStore();
    store.addFacet('attribute');

    expect(store._helper.state.isConjunctiveFacet('attribute')).toBe(true);
  });

  test('should remove existing non conjunctive facet if a conjunctive facet is added for retrieval', () => {
    const store = createStore();
    store.addFacet('attribute', FACET_OR);
    store.addFacet('attribute');

    expect(store._helper.state.isConjunctiveFacet('attribute')).toBe(true);
    expect(store._helper.state.isDisjunctiveFacet('attribute')).toBe(false);
  });

  test('can register a disjunctive facet for retrieval', () => {
    const store = createStore();
    store.addFacet('attribute', FACET_OR);

    expect(store._helper.state.isDisjunctiveFacet('attribute')).toBe(true);
  });

  test('should remove existing non disjunctive facet if a disjunctive facet is added for retrieval', () => {
    const store = createStore();
    store.addFacet('attribute');
    store.addFacet('attribute', FACET_OR);

    expect(store._helper.state.isDisjunctiveFacet('attribute')).toBe(true);
    expect(store._helper.state.isConjunctiveFacet('attribute')).toBe(false);
  });

  test('can register a hierarchical facet for retrieval', () => {
    const store = createStore();
    store.addFacet({ name: 'attribute' }, FACET_TREE);

    expect(store._helper.state.isHierarchicalFacet('attribute')).toBe(true);
  });

  test('should remove existing non hierarchical facet if a hierarchical facet is added for retrieval', () => {
    const store = createStore();
    store.addFacet('attribute');
    store.addFacet({ name: 'attribute' }, FACET_TREE);

    expect(store._helper.state.isHierarchicalFacet('attribute')).toBe(true);
    expect(store._helper.state.isConjunctiveFacet('attribute')).toBe(false);
  });

  test('should merge query parameters with existing ones', () => {
    const store = createStore();
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
    const store = createStore();
    store._helper.setQueryParameter('distinct', 1);
    store._helper.setPage(3);

    expect(store.queryParameters).toHaveProperty('distinct', 1);

    // Ensure that pages start at 1 by making sure our initial 3 became 4.
    expect(store.queryParameters).toHaveProperty('page', 4);
  });

  test('should allow page to be changed by updating query parameters', () => {
    const store = createStore();
    store.queryParameters = {
      page: 3,
      distinct: 1,
      attributesToRetrieve: ['objectID'],
    };

    expect(store.page).toEqual(3);
  });

  test('should trigger search only once when query parameters are changed', () => {
    const store = createStore();
    const search = jest.fn();

    store._helper.search = search;

    store.start();

    store._helper.search.mockClear();

    store.queryParameters = {
      page: 3,
      distinct: 1,
      attributesToRetrieve: ['objectID'],
    };

    expect(search).toHaveBeenCalledTimes(1);
  });

  test('should remove query parameters that have a value of null or undefined', () => {
    const store = createStore();
    const search = jest.fn();
    store._helper.getClient().search = search;

    store.queryParameters = {
      query: '',
      page: 3,
      distinct: 1,
      attributesToRetrieve: ['objectID'],
    };

    // Make sure distinct parameter is there.
    expect(store.queryParameters).toEqual(
      expect.objectContaining({ distinct: 1 })
    );

    store.queryParameters = {
      page: 3,
      distinct: undefined,
      attributesToRetrieve: ['objectID'],
    };

    // Make sure distinct parameter is gone when overridden with undefined.
    expect(store.queryParameters).toEqual(
      expect.objectContaining({ distinct: undefined })
    );

    store.queryParameters = {
      page: 3,
      distinct: null,
      attributesToRetrieve: ['objectID'],
    };
    store.addFacet('price');

    // Make sure distinct parameter is gone when overridden with null.
    expect(store.queryParameters).toEqual(
      expect.objectContaining({ distinct: undefined })
    );
  });

  test('should accept new query parameters', () => {
    const store = createStore();

    const newQueryParameters = { distinct: true };

    store.queryParameters = newQueryParameters;

    expect(store.queryParameters).toEqual(
      expect.objectContaining(newQueryParameters)
    );
  });

  test('highlighting tags set via query parameters should not leak to the helper', () => {
    const store = createStore();

    const newQueryParameters = {
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    };

    store.queryParameters = newQueryParameters;

    expect(store._helper.state).toEqual(
      expect.objectContaining({
        highlightPreTag: HIGHLIGHT_PRE_TAG,
        highlightPostTag: HIGHLIGHT_POST_TAG,
      })
    );
  });

  test('highlighting tags should not be local ones in query parameters', () => {
    const store = createStore();
    store.highlightPreTag = '<mark>';
    store.highlightPostTag = '</mark>';

    expect(store.queryParameters).toEqual(
      expect.objectContaining({
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      })
    );
  });

  test('page query parameter should start at 1', () => {
    const store = createStore();

    expect(store.queryParameters).toHaveProperty('page', 1);

    store._helper.setPage(2);
    expect(store.queryParameters).toHaveProperty('page', 3);

    const newQueryParameters = Object.assign({}, store.queryParameters, {
      page: 5,
    });

    store.queryParameters = newQueryParameters;

    expect(store._helper.getPage()).toEqual(4);
  });

  test('query parameters should not contain internal highlighting tags', () => {
    const store = createStore();

    expect(store.queryParameters).toEqual(
      expect.objectContaining({
        highlightPreTag: '<em>',
        highlightPostTag: '</em>',
      })
    );
  });

  test('should allow to fetch sanitized results', () => {
    const store = createStore();
    const response = {
      hits: [
        {
          objectID: '1',
          name: 'test',
          _highlightResult: {
            name: {
              value:
                "__ais-highlight__te__/ais-highlight__st<script>alert('test')</script>",
              matchLevel: 'full',
            },
          },
        },
      ],
    };

    store._helper.emit('result', response);

    expect(store.results).toEqual([
      {
        objectID: '1',
        name: 'test',
        _highlightResult: {
          name: {
            value:
              '<em>te</em>st&lt;script&gt;alert(&#39;test&#39;)&lt;/script&gt;',
            matchLevel: 'full',
          },
        },
      },
    ]);
  });

  test('should accept custom highlighting tags', () => {
    const store = createStore();
    store.highlightPreTag = '<mark class="hl">';
    store.highlightPostTag = '</mark>';
    const response = {
      hits: [
        {
          objectID: '1',
          name: 'test',
          _highlightResult: {
            name: {
              value:
                "__ais-highlight__te__/ais-highlight__st<script>alert('test')</script>",
              matchLevel: 'full',
            },
          },
        },
      ],
    };

    store._helper.emit('result', response);

    expect(store.results).toEqual([
      {
        objectID: '1',
        name: 'test',
        _highlightResult: {
          name: {
            value:
              '<mark class="hl">te</mark>st&lt;script&gt;alert(&#39;test&#39;)&lt;/script&gt;',
            matchLevel: 'full',
          },
        },
      },
    ]);
  });

  test('should not clean client cache by default', () => {
    const store = createStore();

    const clearCache = jest.fn();
    store._helper = {
      search: jest.fn(),
      getClient: {
        clearCache,
      },
    };

    store.refresh();
    expect(clearCache).not.toHaveBeenCalled();
  });

  test('should allow to disable caching queries', () => {
    const store = createStore();

    const clearCache = jest.fn();
    store._helper = {
      search: jest.fn(),
      getClient() {
        return { clearCache };
      },
    };
    store.start();
    store.disableCache();
    store.refresh();
    expect(clearCache).toHaveBeenCalledTimes(1);
  });

  describe('getFacetStats', () => {
    test('expect to return the stats object when last results is set', () => {
      const attributeName = 'price';
      const store = createStore();

      store._helper = {
        lastResults: {
          getFacetStats: jest.fn(() => ({
            min: 10,
            max: 100,
          })),
        },
      };

      const expectation = { min: 10, max: 100 };
      const actual = store.getFacetStats(attributeName);

      expect(actual).toEqual(expectation);
      expect(store._helper.lastResults.getFacetStats).toHaveBeenCalledWith(
        attributeName
      );
    });

    test('expect to return an empty object when last results is not set', () => {
      const attributeName = 'price';
      const store = createStore();

      store._helper = {};

      const expectation = {};
      const actual = store.getFacetStats(attributeName);

      expect(actual).toEqual(expectation);
    });

    test("expect to return an empty object when stats don't exist for this attribute", () => {
      const attributeName = 'price';
      const store = createStore();

      store._helper = {
        lastResults: {
          getFacetStats: jest.fn(() => null),
        },
      };

      const expectation = {};
      const actual = store.getFacetStats(attributeName);

      expect(actual).toEqual(expectation);
    });
  });

  describe('loading indicator', () => {
    test('should change isSearchStalled to true after a timeout', () => {
      const client = makeManagedClient();
      const store = createFromAlgoliaClient(client);
      expect(client.search).not.toHaveBeenCalled();

      // True at the initialization of InstantSearch for consistency
      expect(store.isSearchStalled).toBe(true);

      store.start();
      store.refresh();

      expect(client.search).toHaveBeenCalledTimes(1);
      // first results from Algolia
      client.searchResultsResolvers[0]();
      return client.searchResultsPromises[0]
        .then(() => {
          expect(store.isSearchStalled).toBe(false);

          store.refresh();
          // The search timeout kicks in
          jest.runAllTimers();

          expect(store.isSearchStalled).toBe(true);

          client.searchResultsResolvers[1]();
          return client.searchResultsPromises[1];
        })
        .then(() => {
          expect(store.isSearchStalled).toBe(false);
        });
    });
  });
});

function makeManagedClient() {
  const searchResultsResolvers = [];
  const searchResultsPromises = [];
  const fakeClient = {
    search: jest.fn((qs, cb) => {
      const p = new Promise(resolve =>
        searchResultsResolvers.push(resolve)
      ).then(() => {
        cb(null, defaultResponse());
      });
      searchResultsPromises.push(p);
    }),
    addAlgoliaAgent: () => {},
    searchResultsPromises,
    searchResultsResolvers,
  };

  return fakeClient;
}

const defaultResponse = () => ({
  results: [
    {
      params: 'query=&hitsPerPage=10&page=0&facets=%5B%5D&tagFilters=',
      page: 0,
      hits: [],
      hitsPerPage: 10,
      nbPages: 0,
      processingTimeMS: 4,
      query: '',
      nbHits: 0,
      index: 'index',
    },
  ],
});
