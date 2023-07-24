/**
 * @jest-environment jsdom
 */

import { runAllMicroTasks } from '@instantsearch/testutils';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { SearchResults } from 'algoliasearch-helper';
import algoliasearch from 'algoliasearch/lite';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import {
  InstantSearch,
  Index,
  SortBy,
  Configure,
} from 'react-instantsearch-dom';

import createInstantSearchManager from '../createInstantSearchManager';

Enzyme.configure({ adapter: new Adapter() });

jest.useFakeTimers();

const runOnlyNextMicroTask = () => Promise.resolve();

const createSearchClient = () => ({
  search: jest.fn(() =>
    Promise.resolve({
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
    })
  ),
});

describe('createInstantSearchManager', () => {
  it('initializes the manager with an empty state', () => {
    const ism = createInstantSearchManager({
      indexName: 'index',
      searchClient: createSearchClient({}),
    });

    expect(ism.store.getState()).toEqual({
      error: null,
      isSearchStalled: true,
      metadata: [],
      results: null,
      searching: false,
      searchingForFacetValues: false,
      widgets: {},
    });

    expect(ism.widgetsManager.getWidgets()).toEqual([]);

    expect(ism.transitionState({})).toEqual({});

    expect(ism.getWidgetsIds()).toEqual([]);
  });

  describe('client hydratation', () => {
    it('hydrates the `searchClient` for a single index results', () => {
      const searchClient = algoliasearch('appId', 'apiKey', {
        _cache: true, // cache is not enabled by default inside Node
      });

      // Skip this test with Algoliasearch API Client >= v4
      // (cache is handled by the client ifself)
      if (searchClient.transporter) {
        return;
      }

      const resultsState = {
        metadata: [],
        rawResults: [
          {
            index: 'index',
            query: 'query',
          },
        ],
        state: {
          index: 'index',
          query: 'query',
        },
      };

      expect(Object.keys(searchClient.cache)).toHaveLength(0);

      createInstantSearchManager({
        indexName: 'index',
        searchClient,
        resultsState,
      });

      expect(Object.keys(searchClient.cache)).toHaveLength(1);
      Object.keys(searchClient.cache).forEach((key) => {
        expect(typeof searchClient.cache[key]).toBe('string');
        expect(JSON.parse(searchClient.cache[key])).toEqual({
          results: [
            {
              index: 'index',
              query: 'query',
            },
          ],
        });
      });
    });

    it('hydrates the `searchClient` for a multi index results', () => {
      const searchClient = algoliasearch('appId', 'apiKey', {
        _cache: true, // cache is not enabled by default inside Node
      });

      // Skip this test with Algoliasearch API Client >= v4
      // (cache is handled by the client ifself)
      if (searchClient.transporter) {
        return;
      }

      const resultsState = {
        metadata: [],
        results: [
          {
            _internalIndexId: 'index1',
            rawResults: [
              {
                index: 'index1',
                query: 'query1',
              },
            ],
            state: {
              index: 'index1',
              query: 'query1',
            },
          },
          {
            _internalIndexId: 'index2',
            rawResults: [
              {
                index: 'index2',
                query: 'query2',
              },
            ],
            state: {
              index: 'index2',
              query: 'query2',
            },
          },
        ],
      };

      expect(Object.keys(searchClient.cache)).toHaveLength(0);

      createInstantSearchManager({
        indexName: 'index',
        searchClient,
        resultsState,
      });

      expect(Object.keys(searchClient.cache)).toHaveLength(1);
      Object.keys(searchClient.cache).forEach((key) => {
        expect(typeof searchClient.cache[key]).toBe('string');
        expect(JSON.parse(searchClient.cache[key])).toEqual({
          results: [
            {
              index: 'index1',
              query: 'query1',
            },
            {
              index: 'index2',
              query: 'query2',
            },
          ],
        });
      });
    });

    it('does not hydrate the `searchClient` without results', () => {
      const searchClient = algoliasearch('appId', 'apiKey');

      // Skip this test with Algoliasearch API Client >= v4
      // (cache is handled by the client ifself)
      if (searchClient.transporter) {
        return;
      }

      expect(Object.keys(searchClient.cache)).toHaveLength(0);

      createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      expect(Object.keys(searchClient.cache)).toHaveLength(0);
    });

    it("does not hydrate the `searchClient` if it's not an Algolia client", () => {
      const searchClient = {
        _useCache: true,
        cache: {},
      };

      // Skip this test with Algoliasearch API Client >= v4
      // (cache is handled by the client ifself)
      if (searchClient.transporter) {
        return;
      }

      const resultsState = {
        metadata: [],
        rawResults: [
          {
            index: 'indexName',
            query: 'query',
          },
        ],
        state: {
          index: 'indexName',
          query: 'query',
        },
      };

      expect(Object.keys(searchClient.cache)).toHaveLength(0);

      createInstantSearchManager({
        indexName: 'index',
        searchClient,
        resultsState,
      });

      expect(Object.keys(searchClient.cache)).toHaveLength(0);
    });

    it('does not hydrate the `searchClient` without cache enabled', () => {
      const searchClient = algoliasearch('appId', 'apiKey', {
        _cache: false,
      });

      // Skip this test with Algoliasearch API Client >= v4
      // (cache is handled by the client ifself)
      if (searchClient.transporter) {
        return;
      }

      const resultsState = {
        metadata: [],
        rawResults: [
          {
            index: 'indexName',
            query: 'query',
          },
        ],
        state: {
          index: 'indexName',
          query: 'query',
        },
      };

      expect(Object.keys(searchClient.cache)).toHaveLength(0);

      createInstantSearchManager({
        indexName: 'index',
        searchClient,
        resultsState,
      });

      expect(Object.keys(searchClient.cache)).toHaveLength(0);
    });

    it('when using algoliasearch@v4, it overrides search only once', () => {
      const searchClient = algoliasearch('appId', 'apiKey', {
        _cache: true,
      });

      // Skip this test with Algoliasearch API Client < v4, as
      // search does not need to be overridden.
      if (!searchClient.transporter) {
        return;
      }

      const resultsState = {
        metadata: [],
        rawResults: [
          {
            index: 'indexName',
            query: 'query',
          },
        ],
        state: {
          index: 'indexName',
          query: 'query',
        },
      };

      const originalSearch = algoliasearch.search;

      createInstantSearchManager({
        indexName: 'index',
        searchClient,
        resultsState,
      });

      expect(searchClient.search).not.toBe(originalSearch);

      const alreadyOverridden = jest.fn();
      searchClient.search = alreadyOverridden;

      createInstantSearchManager({
        indexName: 'index',
        searchClient,
        resultsState,
      });

      expect(searchClient.search).toBe(alreadyOverridden);
    });
  });

  describe('results hydration', () => {
    it('initializes the manager with a single index hydrated results', () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
        resultsState: {
          metadata: [],
          rawResults: [
            {
              index: 'indexName',
              query: 'query',
            },
          ],
          state: {
            index: 'indexName',
            query: 'query',
          },
        },
      });

      expect(ism.store.getState().results).toBeInstanceOf(SearchResults);
      expect(ism.store.getState().results.query).toEqual('query');
    });

    it('initializes the manager with a multi index hydrated results', () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
        resultsState: {
          metadata: [],
          results: [
            {
              _internalIndexId: 'index1',
              rawResults: [
                {
                  index: 'index1',
                  query: 'query1',
                },
              ],
              state: {
                index: 'index1',
                query: 'query1',
              },
            },
            {
              _internalIndexId: 'index2',
              rawResults: [
                {
                  index: 'index2',
                  query: 'query2',
                },
              ],
              state: {
                index: 'index2',
                query: 'query2',
              },
            },
          ],
        },
      });

      expect(ism.store.getState().results.index1.query).toBe('query1');
      expect(ism.store.getState().results.index1).toBeInstanceOf(SearchResults);
      expect(ism.store.getState().results.index2.query).toBe('query2');
      expect(ism.store.getState().results.index2).toBeInstanceOf(SearchResults);
    });
  });

  describe('metadata hydration', () => {
    test('replaces value with a function returning empty search state', () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
        resultsState: {
          metadata: [
            { stuff: 1, items: [{ stuff: 2, items: [{ stuff: 3 }] }] },
          ],
          rawResults: [
            {
              index: 'indexName',
              query: 'query',
            },
          ],
          state: {
            index: 'indexName',
            query: 'query',
          },
        },
      });

      const hydratedMetadata = ism.store.getState().metadata;

      expect(hydratedMetadata).toEqual([
        {
          value: expect.any(Function),
          stuff: 1,
          items: [
            {
              value: expect.any(Function),
              stuff: 2,
              items: [
                {
                  value: expect.any(Function),
                  stuff: 3,
                },
              ],
            },
          ],
        },
      ]);

      expect(hydratedMetadata[0].value()).toEqual({});
      expect(hydratedMetadata[0].items[0].value()).toEqual({});
      expect(hydratedMetadata[0].items[0].items[0].value()).toEqual({});
    });
  });

  describe('widget manager', () => {
    it('triggers a search when a widget is added', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.widgetsManager.registerWidget({
        getSearchParameters: () => ({}),
        props: {},
        context: {},
      });

      expect(ism.store.getState().searching).toBe(false);

      await runOnlyNextMicroTask();

      expect(ism.store.getState().searching).toBe(true);

      await runAllMicroTasks();

      expect(ism.store.getState().searching).toBe(false);
    });
  });

  describe('transitionState', () => {
    it('executes widgets hook', () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
      });

      ism.widgetsManager.registerWidget({
        transitionState: (next, current) => {
          expect(next).toEqual({});

          return {
            ...current,
            a: 1,
          };
        },
      });

      ism.widgetsManager.registerWidget({
        transitionState: (next, current) => {
          expect(next).toEqual({});

          return {
            ...current,
            b: 2,
          };
        },
      });

      expect(ism.transitionState()).toEqual({
        a: 1,
        b: 2,
      });
    });
  });

  describe('getWidgetsIds', () => {
    it('returns the list of ids of all registered widgets', async () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
      });

      expect(ism.getWidgetsIds()).toEqual([]);

      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'a' }) });
      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'b' }) });
      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'c' }) });
      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'd' }) });

      await runAllMicroTasks();

      expect(ism.getWidgetsIds()).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('getSearchParameters', () => {
    it('expects a widget top level to be shared between main and derived parameters', () => {
      // <InstantSearch indexName="index">
      //   <SearchBox defaultRefinement="shared" />
      //   <Index indexId="main" indexName="main" />
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
      });

      // <SearchBox defaultRefinement="shared" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setQuery('shared');
        },
        context: {},
        props: {},
      });

      // <Index indexId="main" indexName="main" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('main');
        },
        props: {
          indexId: 'main',
        },
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index',
          query: 'shared',
        })
      );

      expect(derivedParameters).toEqual([
        {
          indexId: 'main',
          parameters: expect.objectContaining({
            index: 'main',
            query: 'shared',
          }),
        },
      ]);
    });

    it('expects a widget with the same id than the indexName to be a main parameters', () => {
      // <InstantSearch indexName="index">
      //   <Index indexId="index" indexName="main" />
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
      });

      // <Index indexId="index" indexName="main" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('main');
        },
        context: {},
        props: {
          indexId: 'index',
        },
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'main',
        })
      );

      expect(derivedParameters).toEqual([]);
    });

    it('expects a widget with a different id than the indexName to be a derived parameters', () => {
      // <InstantSearch indexName="index">
      //   <Index indexId="index_main" indexName="main" />
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
      });

      // <Index indexId="index_main" indexName="main" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('main');
        },
        context: {},
        props: {
          indexId: 'index_main',
        },
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index',
        })
      );

      expect(derivedParameters).toEqual([
        {
          indexId: 'index_main',
          parameters: expect.objectContaining({
            index: 'main',
          }),
        },
      ]);
    });

    it('expects a widget within a mutli index context with the same id than the indexName to be a main parameters', () => {
      // <InstantSearch indexName="index">
      //   <Index indexId="index" indexName="index" />
      //     <SearchBox defaultRefinement="main" />
      //   </Index>
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
      });

      // <Index indexId="index" indexName="index" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('index');
        },
        context: {},
        props: {
          indexId: 'index',
        },
      });

      // <Index indexId="index" indexName="index" />
      //   <SearchBox defaultRefinement="main" />
      // </Index>
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setQuery('main');
        },
        context: {
          multiIndexContext: {
            targetedIndex: 'index',
          },
        },
        props: {},
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index',
          query: 'main',
        })
      );

      expect(derivedParameters).toEqual([]);
    });

    it('expects a widget within a mutli index context with a different id than the indexName to be a derived parameters', () => {
      // <InstantSearch indexName="index">
      //   <Index indexId="index_with_refinement" indexName="index" />
      //     <SearchBox defaultRefinement="dervied" />
      //   </Index>
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient({}),
      });

      // <Index indexId="index_with_refinement" indexName="index" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('index');
        },
        props: {
          indexId: 'index_with_refinement',
        },
      });

      // <Index indexId="index_with_refinement" indexName="index" />
      //   <SearchBox defaultRefinement="derived" />
      // </Index>
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setQuery('derived');
        },
        props: {
          indexContextValue: {
            targetedIndex: 'index_with_refinement',
          },
        },
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index',
        })
      );

      expect(derivedParameters).toEqual([
        {
          indexId: 'index_with_refinement',
          parameters: expect.objectContaining({
            index: 'index',
            query: 'derived',
          }),
        },
      ]);
    });

    it('expects widgets main parameters and derived parameters to be correctly calculated within a multi index context', () => {
      const wrapper = mount(
        <InstantSearch indexName="index1" searchClient={createSearchClient({})}>
          <Index indexName="bestbuy" />
          <Index indexName="instant_search" />

          <Index indexId="instant_search_apple" indexName="instant_search">
            <Configure filters="brand:Apple" />
          </Index>

          <Index indexId="instant_search_samsung" indexName="instant_search">
            <Configure filters="brand:Samsung" />
          </Index>

          <Index indexId="instant_search_microsoft" indexName="instant_search">
            <Configure filters="brand:Microsoft" />
          </Index>
        </InstantSearch>
      );

      const { mainParameters, derivedParameters } = wrapper
        .instance()
        .state.instantSearchManager.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index1',
        })
      );

      expect(derivedParameters).toEqual([
        expect.objectContaining({
          indexId: 'bestbuy',
          parameters: expect.objectContaining({
            index: 'bestbuy',
          }),
        }),
        expect.objectContaining({
          indexId: 'instant_search',
          parameters: expect.objectContaining({
            index: 'instant_search',
          }),
        }),
        expect.objectContaining({
          indexId: 'instant_search_apple',
          parameters: expect.objectContaining({
            index: 'instant_search',
            filters: 'brand:Apple',
          }),
        }),
        expect.objectContaining({
          indexId: 'instant_search_samsung',
          parameters: expect.objectContaining({
            index: 'instant_search',
            filters: 'brand:Samsung',
          }),
        }),
        expect.objectContaining({
          indexId: 'instant_search_microsoft',
          parameters: expect.objectContaining({
            index: 'instant_search',
            filters: 'brand:Microsoft',
          }),
        }),
      ]);
    });

    it('expects widgets main parameters and derived parameters to be correctly calculated with SortBy within a multi index context', () => {
      const wrapper = mount(
        <InstantSearch indexName="index1" searchClient={createSearchClient({})}>
          <Index indexName="categories">
            <SortBy
              defaultRefinement="bestbuy"
              items={[
                { value: 'categories', label: 'Categories' },
                { value: 'bestbuy', label: 'Best buy' },
              ]}
            />
          </Index>

          <Index indexName="products">
            <SortBy
              defaultRefinement="brands"
              items={[
                { value: 'products', label: 'Products' },
                { value: 'brands', label: 'Brands' },
              ]}
            />
          </Index>
        </InstantSearch>
      );

      const { mainParameters, derivedParameters } = wrapper
        .instance()
        .state.instantSearchManager.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index1',
        })
      );

      expect(derivedParameters).toEqual([
        expect.objectContaining({
          indexId: 'categories',
          parameters: expect.objectContaining({
            index: 'bestbuy',
          }),
        }),
        expect.objectContaining({
          indexId: 'products',
          parameters: expect.objectContaining({
            index: 'brands',
          }),
        }),
      ]);
    });
  });

  describe('searchStalled', () => {
    it('should be updated if search is stalled', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        transitionState: () => {},
      });

      expect(searchClient.search).not.toHaveBeenCalled();
      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: true,
      });

      await runOnlyNextMicroTask();

      expect(searchClient.search).toHaveBeenCalledTimes(1);

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: true,
      });

      jest.runAllTimers();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: true,
      });

      await runOnlyNextMicroTask();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: false,
      });

      ism.widgetsManager.update();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: false,
      });

      await runOnlyNextMicroTask();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: false,
      });

      jest.runAllTimers();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: true,
      });

      await runOnlyNextMicroTask();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: false,
      });
    });
  });

  describe('client.search', () => {
    it('should be called when there is a new widget', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        transitionState: () => {},
      });

      expect(searchClient.search).toHaveBeenCalledTimes(0);

      await runAllMicroTasks();

      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    it('should be called when there is a new client', () => {
      const searchClient = createSearchClient({});
      const nextSearchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      expect(searchClient.search).toHaveBeenCalledTimes(0);
      expect(nextSearchClient.search).toHaveBeenCalledTimes(0);

      ism.updateClient(nextSearchClient);

      expect(searchClient.search).toHaveBeenCalledTimes(0);
      expect(nextSearchClient.search).toHaveBeenCalledTimes(1);
    });

    it('should not be called when the search is skipped', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.skipSearch();

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        transitionState: () => {},
      });

      await runAllMicroTasks();

      expect(searchClient.search).toHaveBeenCalledTimes(0);
    });
  });
});
