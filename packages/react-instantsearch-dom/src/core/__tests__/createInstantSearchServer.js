import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { SearchParameters } from 'algoliasearch-helper';
import Enzyme from 'enzyme';
import React from 'react';
import {
  Index,
  InstantSearch,
  DynamicWidgets,
  createConnector,
  version,
  connectRefinementList,
} from 'react-instantsearch-core';
import { SearchBox } from 'react-instantsearch-dom';

import { findResultsState } from '../createInstantSearchServer';

Enzyme.configure({ adapter: new Adapter() });

describe('findResultsState', () => {
  const createSearchClient = ({ transformResponseParams } = {}) => ({
    search: jest.fn((requests) =>
      Promise.resolve({
        results: requests.map(({ indexName, params: { query } }) => ({
          query,
          hits: [],
          renderingContent: {
            facetOrdering: {
              facets: {
                order: ['brand', 'hierarchicalCategories.lvl0', 'categories'],
              },
              values: {
                brand: {
                  sortRemainingBy: 'count',
                },
                categories: {
                  sortRemainingBy: 'count',
                },
                'hierarchicalCategories.lvl0': {
                  sortRemainingBy: 'count',
                },
              },
            },
          },
          params: transformResponseParams
            ? transformResponseParams(query)
            : `query=${encodeURIComponent(query)}`,
          index: indexName,
        })),
      })
    ),
  });

  const createWidget = ({ getSearchParameters = () => {} } = {}) =>
    createConnector({
      displayName: 'CoolConnector',
      getProvidedProps: () => null,
      getSearchParameters(searchParameters, props, searchState) {
        getSearchParameters();

        const fallback = props.defaultRefinement || 'Apple';

        if (this.props.indexContextValue) {
          const index = this.props.indexContextValue.targetedIndex;
          const indexSearchState =
            searchState.indices && searchState.indices[index]
              ? searchState.indices[index]
              : {};

          return searchParameters.setQuery(indexSearchState.query || fallback);
        }

        return searchParameters.setQuery(searchState.query || fallback);
      },
      getMetadata(props, searchState) {
        return { id: 'cool', props, searchState };
      },
      getId: () => 'id',
    })(() => null);

  const requiredProps = {
    indexName: 'indexName',
    searchClient: createSearchClient({}),
  };

  it('throws an error if props are not provided', () => {
    const App = () => <div />;

    const trigger = () => findResultsState(App);

    expect(() => trigger()).toThrowErrorMatchingInlineSnapshot(
      `"The function \`findResultsState\` must be called with props: \`findResultsState(App, props)\`"`
    );
  });

  it('throws an error if props does not have a `searchClient`', () => {
    const App = () => <div />;

    const props = {};

    const trigger = () => findResultsState(App, props);

    expect(() => trigger()).toThrowErrorMatchingInlineSnapshot(
      `"The props provided to \`findResultsState\` must have a \`searchClient\`"`
    );
  });

  it('throws an error if props does not have an `indexName`', () => {
    const App = () => <div />;

    const props = {
      searchClient: createSearchClient({}),
    };

    const trigger = () => findResultsState(App, props);

    expect(() => trigger()).toThrowErrorMatchingInlineSnapshot(
      `"The props provided to \`findResultsState\` must have an \`indexName\`"`
    );
  });

  it('adds expected Algolia agents', () => {
    const App = (props) => (
      <InstantSearch {...props}>
        <SearchBox />
      </InstantSearch>
    );

    const searchClient = {
      ...createSearchClient({}),
      addAlgoliaAgent: jest.fn(),
    };

    const props = {
      ...requiredProps,
      searchClient,
    };

    findResultsState(App, props);

    // The `addAlgoliaAgent` method is called 7 times:
    // - 1 times with react-instantsearch-dom/server
    // - 2 times with react-instantsearch-core/InstantSearch
    // - 4 times with the AlgoliasearchHelper

    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledTimes(7);
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react (${React.version})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch (${version})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch-server (${version})`
    );
  });

  it('does not throw if `searchClient` does not have a `addAlgoliaAgent()` method', () => {
    const App = (props) => (
      <InstantSearch {...props}>
        <SearchBox />
      </InstantSearch>
    );

    const props = {
      ...requiredProps,
      searchClient: createSearchClient({}),
    };

    const trigger = () => findResultsState(App, props);

    expect(() => trigger()).not.toThrow();
  });

  it('throws if no widgets are added', () => {
    const App = (props) => <InstantSearch {...props} />;

    const props = {
      ...requiredProps,
      searchClient: createSearchClient({}),
    };

    expect(() =>
      findResultsState(App, props)
    ).toThrowErrorMatchingInlineSnapshot(
      `"[ssr]: no widgets were added, you likely did not pass the \`widgetsCollector\` down to the InstantSearch component."`
    );
  });

  describe('single index', () => {
    it('results should be state & results', async () => {
      const Connected = createWidget();

      const App = (props) => (
        <InstantSearch {...props}>
          <Connected />
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
      };

      const results = await findResultsState(App, props);

      expect(results).toEqual({
        metadata: [expect.objectContaining({ id: 'cool' })],
        state: expect.any(SearchParameters),
        rawResults: expect.arrayContaining([
          expect.objectContaining({ query: expect.any(String) }),
        ]),
      });
    });

    it('searchParameters should be cleaned each time', async () => {
      const getSearchParameters = jest.fn();
      const Connected = createWidget({
        getSearchParameters,
      });

      const App = (props) => (
        <InstantSearch {...props}>
          <Connected />
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
      };

      await findResultsState(App, props);

      expect(getSearchParameters).toHaveBeenCalledTimes(1);

      getSearchParameters.mockClear();

      await findResultsState(App, props);

      expect(getSearchParameters).toHaveBeenCalledTimes(1);
    });

    it('without search state', async () => {
      const Connected = createWidget();

      const App = (props) => (
        <InstantSearch {...props}>
          <Connected />
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
      };

      const data = await findResultsState(App, props);

      expect(data).toEqual({
        metadata: [expect.objectContaining({ id: 'cool' })],
        rawResults: [
          expect.objectContaining({ index: 'indexName', query: 'Apple' }),
        ],
        state: expect.objectContaining({ index: 'indexName', query: 'Apple' }),
      });
    });

    it('with search state', async () => {
      const Connected = createWidget();

      const App = (props) => (
        <InstantSearch {...props}>
          <Connected />
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
        searchState: {
          query: 'iPhone',
        },
      };

      const data = await findResultsState(App, props);

      expect(data).toEqual({
        metadata: [expect.objectContaining({ id: 'cool' })],
        rawResults: [
          expect.objectContaining({ index: 'indexName', query: 'iPhone' }),
        ],
        state: expect.objectContaining({ index: 'indexName', query: 'iPhone' }),
      });
    });

    it('forwards metadata', async () => {
      const Connected = createWidget();

      const App = (props) => (
        <InstantSearch {...props}>
          <Connected prop="something" />
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
        searchState: {
          query: 'godlike',
        },
      };

      const results = await findResultsState(App, props);

      expect(results).toEqual({
        metadata: [
          {
            id: 'cool',
            props: expect.objectContaining({ prop: 'something' }),
            searchState: { query: 'godlike' },
          },
        ],
        state: expect.any(SearchParameters),
        rawResults: expect.arrayContaining([
          expect.objectContaining({ query: expect.any(String) }),
        ]),
      });
    });

    describe('cleaning "params"', () => {
      it('with one query', async () => {
        const Connected = createWidget();

        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({}),
          searchState: {
            query: 'iPhone',
          },
        };

        const data = await findResultsState(App, props);

        expect(data.rawResults[0].params).toMatchInlineSnapshot(
          `"query=iPhone"`
        );
      });

      it('with custom client, without "params"', async () => {
        const Connected = createWidget();

        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({
            transformResponseParams() {
              return undefined;
            },
          }),
          searchState: {
            query: 'iPhone',
          },
        };

        const data = await findResultsState(App, props);

        expect(data.rawResults[0].params).toBeUndefined();
      });

      it('with shadowing query', async () => {
        const Connected = createWidget();

        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({}),
          searchState: {
            query: 'iPhone&query=iphone',
          },
        };

        const data = await findResultsState(App, props);

        expect(data.rawResults[0].params).toMatchInlineSnapshot(
          `"query=iPhone%26query%3Diphone"`
        );
      });

      it('with modified query', async () => {
        const Connected = createWidget();

        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({
            transformResponseParams: (query) =>
              `query=${encodeURIComponent(query)}&query=modified`,
          }),
          searchState: {
            query: 'iPhone',
          },
        };

        const data = await findResultsState(App, props);

        expect(data.rawResults[0].params).toMatchInlineSnapshot(
          `"query=iPhone"`
        );
      });

      it('with shadowing query and modified query', async () => {
        const Connected = createWidget();

        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({
            transformResponseParams: (query) =>
              `query=${encodeURIComponent(query)}&query=modified`,
          }),
          searchState: {
            query: 'iPhone&query=iphone',
          },
        };

        const data = await findResultsState(App, props);

        expect(data.rawResults[0].params).toMatchInlineSnapshot(
          `"query=iPhone%26query%3Diphone"`
        );
      });

      it('with padded, modified query', async () => {
        const Connected = createWidget();

        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({
            transformResponseParams: (query) =>
              `test=1&query=${encodeURIComponent(query)}&boo=ba&query=modified`,
          }),
          searchState: {
            query: 'iPhone&query=iphone',
          },
        };

        const data = await findResultsState(App, props);

        expect(data.rawResults[0].params).toMatchInlineSnapshot(
          `"test=1&query=iPhone%26query%3Diphone&boo=ba"`
        );
      });

      it('with nothing returned', async () => {
        const Connected = createWidget();

        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({
            transformResponseParams: () => '',
          }),
          searchState: {
            query: 'iPhone&query=iphone',
          },
        };

        const data = await findResultsState(App, props);

        expect(data.rawResults[0].params).toMatchInlineSnapshot(`""`);
      });

      it('with no query returned', async () => {
        const Connected = createWidget();

        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({
            transformResponseParams: () => 'lol=lol',
          }),
          searchState: {
            query: 'iPhone&query=iphone',
          },
        };

        const data = await findResultsState(App, props);

        expect(data.rawResults[0].params).toMatchInlineSnapshot(`"lol=lol"`);
      });
    });

    it('searches twice (cached) with dynamic widgets', async () => {
      const RefinementList = connectRefinementList(() => null);
      const App = (props) => (
        <InstantSearch {...props}>
          <DynamicWidgets fallbackComponent={RefinementList} />
        </InstantSearch>
      );

      const props = {
        searchClient: createSearchClient({}),
        indexName: 'abc',
        searchState: {
          query: 'iPhone',
        },
      };

      await findResultsState(App, props);

      expect(props.searchClient.search).toHaveBeenCalledTimes(2);
      // both calls are the same, so they're cached
      expect(props.searchClient.search.mock.calls[0][0]).toEqual(
        props.searchClient.search.mock.calls[1][0]
      );
    });

    it('searches twice with dynamic widgets and a refinement', async () => {
      const RefinementList = connectRefinementList(() => null);
      const App = (props) => (
        <InstantSearch {...props}>
          <DynamicWidgets fallbackComponent={RefinementList} />
        </InstantSearch>
      );

      const props = {
        searchClient: createSearchClient({}),
        indexName: 'instant_search',
        searchState: {
          query: 'iPhone',
          refinementList: { categories: ['refined!'] },
        },
      };

      await findResultsState(App, props);

      expect(props.searchClient.search).toHaveBeenCalledTimes(2);

      // first query doesn't have the fallback widget mounted yet
      expect(props.searchClient.search.mock.calls[0][0][0]).toEqual({
        indexName: 'instant_search',
        params: {
          facets: ['*'],
          highlightPostTag: '</ais-highlight-0000000000>',
          highlightPreTag: '<ais-highlight-0000000000>',
          maxValuesPerFacet: 20,
          tagFilters: '',
        },
      });

      // second query does have the fallback widget mounted, and thus also the refinement
      expect(props.searchClient.search.mock.calls[1][0][0]).toEqual({
        indexName: 'instant_search',
        params: {
          facetFilters: [['categories:refined!']],
          facets: ['*'],
          highlightPostTag: '</ais-highlight-0000000000>',
          highlightPreTag: '<ais-highlight-0000000000>',
          maxValuesPerFacet: 20,
          tagFilters: '',
        },
      });
    });
  });

  describe('multi index', () => {
    it('results should be instance of SearchResults and SearchParameters', async () => {
      const Connected = createWidget();

      const App = (props) => (
        <InstantSearch {...props}>
          <Index indexName="index2">
            <Connected />
          </Index>
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
      };

      const { results } = await findResultsState(App, props);

      results.forEach((result) => {
        expect(result.state).toBeInstanceOf(SearchParameters);
        expect(result.rawResults).toBeInstanceOf(Array);
      });
    });

    it('searchParameters should be cleaned each time', async () => {
      const getSearchParameters = jest.fn();
      const Connected = createWidget({
        getSearchParameters,
      });

      const App = (props) => (
        <InstantSearch {...props}>
          <Index indexName="index2">
            <Connected />
          </Index>
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
      };

      await findResultsState(App, props);

      expect(getSearchParameters).toHaveBeenCalledTimes(1);

      getSearchParameters.mockClear();

      await findResultsState(App, props);

      expect(getSearchParameters).toHaveBeenCalledTimes(1);
    });

    it('without search state - first API', async () => {
      const Connected = createWidget();
      const App = (props) => (
        <InstantSearch {...props}>
          <Index indexId="index1" indexName="index1">
            <Connected />
          </Index>

          <Index indexId="index2" indexName="index2">
            <Connected />
          </Index>
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
        indexName: 'index1',
      };

      const data = await findResultsState(App, props);

      expect(data.results).toHaveLength(2);

      const { metadata, results } = data;
      const [first, second] = results;

      expect(metadata).toEqual([
        expect.objectContaining({ id: 'cool' }),
        expect.objectContaining({ id: 'cool' }),
      ]);

      expect(first).toEqual({
        _internalIndexId: 'index1',
        state: expect.objectContaining({ index: 'index1', query: 'Apple' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'Apple' }),
        ],
      });

      expect(second).toEqual({
        _internalIndexId: 'index2',
        state: expect.objectContaining({ index: 'index2', query: 'Apple' }),
        rawResults: [
          expect.objectContaining({ index: 'index2', query: 'Apple' }),
        ],
      });
    });

    it('without search state - second API', async () => {
      const Connected = createWidget();
      const App = (props) => (
        <InstantSearch {...props}>
          <Connected />

          <Index indexId="index2" indexName="index2">
            <Connected />
          </Index>
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
        indexName: 'index1',
      };

      const { results, metadata } = await findResultsState(App, props);

      expect(metadata).toEqual([
        expect.objectContaining({ id: 'cool' }),
        expect.objectContaining({ id: 'cool' }),
      ]);

      expect(results).toHaveLength(2);

      const [first, second] = results;

      expect(first).toEqual({
        _internalIndexId: 'index1',
        state: expect.objectContaining({ index: 'index1', query: 'Apple' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'Apple' }),
        ],
      });

      expect(second).toEqual({
        _internalIndexId: 'index2',
        state: expect.objectContaining({ index: 'index2', query: 'Apple' }),
        rawResults: [
          expect.objectContaining({ index: 'index2', query: 'Apple' }),
        ],
      });
    });

    it('without search state - same index', async () => {
      const Connected = createWidget();
      const App = (props) => (
        <InstantSearch {...props}>
          <Connected defaultRefinement="Apple" />

          <Index indexId="index1_with_refinement" indexName="index1">
            <Connected defaultRefinement="iWatch" />
          </Index>
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
        indexName: 'index1',
      };

      const { results, metadata } = await findResultsState(App, props);

      expect(metadata).toEqual([
        expect.objectContaining({ id: 'cool' }),
        expect.objectContaining({ id: 'cool' }),
      ]);

      expect(results).toHaveLength(2);

      const [first, second] = results;

      expect(first).toEqual({
        _internalIndexId: 'index1',
        state: expect.objectContaining({ index: 'index1', query: 'Apple' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'Apple' }),
        ],
      });

      expect(second).toEqual({
        _internalIndexId: 'index1_with_refinement',
        state: expect.objectContaining({ index: 'index1', query: 'iWatch' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'iWatch' }),
        ],
      });
    });

    it('with search state - first API', async () => {
      const Connected = createWidget();
      const App = (props) => (
        <InstantSearch {...props}>
          <Index indexId="index1" indexName="index1">
            <Connected />
          </Index>

          <Index indexId="index2" indexName="index2">
            <Connected />
          </Index>
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
        indexName: 'index1',
        searchState: {
          indices: {
            index1: {
              query: 'iPhone',
            },
            index2: {
              query: 'iPad',
            },
          },
        },
      };

      const { results, metadata } = await findResultsState(App, props);

      expect(metadata).toEqual([
        expect.objectContaining({ id: 'cool' }),
        expect.objectContaining({ id: 'cool' }),
      ]);

      expect(results).toHaveLength(2);

      const [first, second] = results;

      expect(first).toEqual({
        _internalIndexId: 'index1',
        state: expect.objectContaining({ index: 'index1', query: 'iPhone' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'iPhone' }),
        ],
      });

      expect(second).toEqual({
        _internalIndexId: 'index2',
        state: expect.objectContaining({ index: 'index2', query: 'iPad' }),
        rawResults: [
          expect.objectContaining({ index: 'index2', query: 'iPad' }),
        ],
      });
    });

    it('with search state - second API', async () => {
      const Connected = createWidget();
      const App = (props) => (
        <InstantSearch {...props}>
          <Connected />

          <Index indexId="index2" indexName="index2">
            <Connected />
          </Index>
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
        indexName: 'index1',
        searchState: {
          query: 'iPhone',
          indices: {
            index2: {
              query: 'iPad',
            },
          },
        },
      };

      const { results, metadata } = await findResultsState(App, props);

      expect(metadata).toEqual([
        expect.objectContaining({ id: 'cool' }),
        expect.objectContaining({ id: 'cool' }),
      ]);

      expect(results).toHaveLength(2);

      const [first, second] = results;

      expect(first).toEqual({
        _internalIndexId: 'index1',
        state: expect.objectContaining({ index: 'index1', query: 'iPhone' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'iPhone' }),
        ],
      });

      expect(second).toEqual({
        _internalIndexId: 'index2',
        state: expect.objectContaining({ index: 'index2', query: 'iPad' }),
        rawResults: [
          expect.objectContaining({ index: 'index2', query: 'iPad' }),
        ],
      });
    });

    it('with search state - same index', async () => {
      const Connected = createWidget();
      const App = (props) => (
        <InstantSearch {...props}>
          <Connected />

          <Index indexId="index1WithRefinement" indexName="index1">
            <Connected />
          </Index>
        </InstantSearch>
      );

      const props = {
        ...requiredProps,
        indexName: 'index1',
        searchState: {
          query: 'iPhone',
          indices: {
            index1WithRefinement: {
              query: 'iPad',
            },
          },
        },
      };

      const { results, metadata } = await findResultsState(App, props);

      expect(metadata).toEqual([
        expect.objectContaining({ id: 'cool' }),
        expect.objectContaining({ id: 'cool' }),
      ]);

      expect(results).toHaveLength(2);

      const [first, second] = results;

      expect(first).toEqual({
        _internalIndexId: 'index1',
        state: expect.objectContaining({ index: 'index1', query: 'iPhone' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'iPhone' }),
        ],
      });
      expect(second).toEqual({
        _internalIndexId: 'index1WithRefinement',
        state: expect.objectContaining({ index: 'index1', query: 'iPad' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'iPad' }),
        ],
      });
    });

    it('forwards metadata', async () => {
      const Connected = createWidget();
      const App = (props) => (
        <InstantSearch {...props}>
          <Connected prop="value1" />

          <Index indexId="index1WithRefinement" indexName="index1">
            <Connected prop="value2" />
          </Index>
        </InstantSearch>
      );

      const searchState = {
        query: 'iPhone',
        indices: {
          index1WithRefinement: {
            query: 'iPad',
          },
        },
      };

      const props = {
        ...requiredProps,
        indexName: 'index1',
        searchState,
      };

      const { results, metadata } = await findResultsState(App, props);

      expect(metadata).toEqual([
        {
          id: 'cool',
          searchState,
          props: expect.objectContaining({ prop: 'value1' }),
        },
        {
          id: 'cool',
          searchState,
          props: expect.objectContaining({ prop: 'value2' }),
        },
      ]);

      expect(results).toHaveLength(2);

      const [first, second] = results;

      expect(first).toEqual({
        _internalIndexId: 'index1',
        state: expect.objectContaining({ index: 'index1', query: 'iPhone' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'iPhone' }),
        ],
      });
      expect(second).toEqual({
        _internalIndexId: 'index1WithRefinement',
        state: expect.objectContaining({ index: 'index1', query: 'iPad' }),
        rawResults: [
          expect.objectContaining({ index: 'index1', query: 'iPad' }),
        ],
      });
    });

    describe('cleaning "params"', () => {
      it('multiple queries', async () => {
        const Connected = createWidget();
        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
            <Index indexId="index1WithRefinement" indexName="index1">
              <Connected />
            </Index>
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({}),
          indexName: 'index1',
          searchState: {
            query: 'iPhone',
            indices: {
              index1WithRefinement: {
                query: 'iPad&query=test',
              },
            },
          },
        };

        const { results } = await findResultsState(App, props);

        expect(results).toHaveLength(2);

        const [first, second] = results;

        expect(first.rawResults[0].params).toMatchInlineSnapshot(
          `"query=iPhone"`
        );
        expect(second.rawResults[0].params).toMatchInlineSnapshot(
          `"query=iPad%26query%3Dtest"`
        );
      });

      it('custom client without "params"', async () => {
        const Connected = createWidget();
        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
            <Index indexId="index1WithRefinement" indexName="index1">
              <Connected />
            </Index>
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({
            transformResponseParams() {
              return undefined;
            },
          }),
          indexName: 'index1',
          searchState: {
            query: 'iPhone',
            indices: {
              index1WithRefinement: {
                query: 'iPad&query=test',
              },
            },
          },
        };

        const { results } = await findResultsState(App, props);

        expect(results).toHaveLength(2);

        const [first, second] = results;

        expect(first.rawResults[0].params).toBeUndefined();
        expect(second.rawResults[0].params).toBeUndefined();
      });

      it('server-side params', async () => {
        const Connected = createWidget();
        const App = (props) => (
          <InstantSearch {...props}>
            <Connected />
            <Index indexId="index1WithRefinement" indexName="index1">
              <Connected />
            </Index>
          </InstantSearch>
        );

        const props = {
          ...requiredProps,
          searchClient: createSearchClient({
            transformResponseParams: (query) =>
              `query=${encodeURIComponent(query)}&query=modified`,
          }),
          indexName: 'index1',
          searchState: {
            query: 'iPhone',
            indices: {
              index1WithRefinement: {
                query: 'iPad&query=test',
              },
            },
          },
        };

        const { results } = await findResultsState(App, props);

        expect(results).toHaveLength(2);

        const [first, second] = results;

        expect(first.rawResults[0].params).toMatchInlineSnapshot(
          `"query=iPhone"`
        );
        expect(second.rawResults[0].params).toMatchInlineSnapshot(
          `"query=iPad%26query%3Dtest"`
        );
      });
    });

    it('searches once with multiple indices', async () => {
      const Connected = createWidget();
      const App = (props) => (
        <InstantSearch {...props}>
          <Connected />
          <Index indexId="index1WithRefinement" indexName="index1">
            <Connected />
          </Index>
          <Index indexId="index2WithRefinement" indexName="index2">
            <Connected />
          </Index>
        </InstantSearch>
      );

      const props = {
        searchClient: createSearchClient({}),
        indexName: 'abc',
        searchState: {
          query: 'iPhone',
        },
      };

      const { results } = await findResultsState(App, props);

      expect(props.searchClient.search).toHaveBeenCalledTimes(1);
      expect(results.map(({ _internalIndexId }) => _internalIndexId)).toEqual([
        'abc',
        'index1WithRefinement',
        'index2WithRefinement',
      ]);
    });

    it('searches twice (cached) with dynamic widgets', async () => {
      const RefinementList = connectRefinementList(() => null);
      const App = (props) => (
        <InstantSearch {...props}>
          <Index indexName="index1WithRefinement">
            <DynamicWidgets fallbackComponent={RefinementList} />
          </Index>
        </InstantSearch>
      );

      const props = {
        searchClient: createSearchClient({}),
        indexName: 'abc',
        searchState: {
          query: 'iPhone',
        },
      };

      await findResultsState(App, props);

      // [search, dynamic]
      expect(props.searchClient.search).toHaveBeenCalledTimes(2);

      // both calls are the same, so they're cached
      expect(props.searchClient.search.mock.calls[0][0]).toEqual(
        props.searchClient.search.mock.calls[1][0]
      );
    });

    it('searches twice with dynamic widgets and a refinement', async () => {
      const RefinementList = connectRefinementList(() => null);
      const App = (props) => (
        <InstantSearch {...props}>
          <Index indexName="index1WithRefinement">
            <DynamicWidgets fallbackComponent={RefinementList} />
          </Index>
        </InstantSearch>
      );

      const props = {
        searchClient: createSearchClient({}),
        indexName: 'instant_search',
        searchState: {
          query: 'iPhone',
          indices: {
            index1WithRefinement: {
              refinementList: { categories: ['refined!'] },
            },
          },
        },
      };

      await findResultsState(App, props);

      // [search, dynamic]
      expect(props.searchClient.search).toHaveBeenCalledTimes(2);

      // first query doesn't have the fallback widget mounted yet
      expect(props.searchClient.search.mock.calls[0][0][1]).toEqual({
        indexName: 'index1WithRefinement',
        params: {
          facets: ['*'],
          highlightPostTag: '</ais-highlight-0000000000>',
          highlightPreTag: '<ais-highlight-0000000000>',
          maxValuesPerFacet: 20,
          tagFilters: '',
        },
      });

      // second query does have the fallback widget mounted, and thus also the refinement
      expect(props.searchClient.search.mock.calls[1][0][1]).toEqual({
        indexName: 'index1WithRefinement',
        params: {
          facetFilters: [['categories:refined!']],
          facets: ['*'],
          highlightPostTag: '</ais-highlight-0000000000>',
          highlightPreTag: '<ais-highlight-0000000000>',
          maxValuesPerFacet: 20,
          tagFilters: '',
        },
      });
    });
  });
});
