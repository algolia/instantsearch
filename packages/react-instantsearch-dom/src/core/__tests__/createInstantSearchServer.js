import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import {
  createIndex,
  createConnector,
  version,
} from 'react-instantsearch-core';
import createInstantSearchServer from '../createInstantSearchServer';

Enzyme.configure({ adapter: new Adapter() });

describe('createInstantSearchServer', () => {
  const createSearchClient = () => ({
    search: () =>
      Promise.resolve({
        results: [{ query: 'query' }],
      }),
  });

  const createWidget = ({ getSearchParameters = () => {} } = {}) =>
    createConnector({
      displayName: 'CoolConnector',
      getProvidedProps: () => null,
      getSearchParameters(searchParameters, props, searchState) {
        getSearchParameters();

        const fallback = props.defaultRefinement || 'Apple';

        if (this.context && this.context.multiIndexContext) {
          const index = this.context.multiIndexContext.targetedIndex;
          const indexSearchState =
            searchState.indices && searchState.indices[index]
              ? searchState.indices[index]
              : {};

          return searchParameters.setQuery(indexSearchState.query || fallback);
        }

        return searchParameters.setQuery(searchState.query || fallback);
      },
      getMetadata: () => null,
      getId: () => 'id',
    })(() => null);

  const requiredProps = {
    indexName: 'indexName',
  };

  const requiredPropsWithSearchClient = {
    ...requiredProps,
    searchClient: createSearchClient(),
  };

  describe('props', () => {
    it('uses the provided factory', () => {
      const searchClient = {
        ...createSearchClient(),
        addAlgoliaAgent: jest.fn(),
      };

      const createSearchClientMock = jest.fn(() => searchClient);

      const { InstantSearch } = createInstantSearchServer(
        createSearchClientMock
      );

      const props = {
        ...requiredProps,
        appId: 'appId',
        apiKey: 'apiKey',
      };

      shallow(<InstantSearch {...props} />);

      expect(createSearchClientMock).toHaveBeenCalledTimes(1);
      expect(createSearchClientMock).toHaveBeenCalledWith('appId', 'apiKey');
      expect(searchClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
      expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
        `react-instantsearch ${version}`
      );
    });

    it('uses the provided searchClient', () => {
      const { InstantSearch } = createInstantSearchServer();

      const searchClient = createSearchClient();

      const props = {
        ...requiredProps,
        searchClient,
      };

      const wrapper = shallow(<InstantSearch {...props} />);

      expect(wrapper.props().searchClient).toBe(searchClient);
    });

    it('uses the provided algoliaClient', () => {
      const { InstantSearch } = createInstantSearchServer();

      const algoliaClient = {
        ...createSearchClient(),
        addAlgoliaAgent: jest.fn(),
      };

      const props = {
        ...requiredProps,
        algoliaClient,
      };

      const wrapper = shallow(<InstantSearch {...props} />);

      expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
      expect(wrapper.props().algoliaClient).toBe(algoliaClient);
    });

    it('does not throw if searchClient does not have a `addAlgoliaAgent()` method', () => {
      const { InstantSearch } = createInstantSearchServer();

      const props = {
        ...requiredProps,
        searchClient: createSearchClient(),
      };

      const trigger = () => shallow(<InstantSearch {...props} />);

      expect(() => trigger()).not.toThrow();
    });

    it('does not throw if algoliaClient does not have a `addAlgoliaAgent()` method', () => {
      const { InstantSearch } = createInstantSearchServer();

      const props = {
        ...requiredProps,
        algoliaClient: createSearchClient(),
      };

      const trigger = () => shallow(<InstantSearch {...props} />);

      expect(() => trigger()).not.toThrow();
    });

    it('throws if algoliaClient is given with searchClient', () => {
      const { InstantSearch } = createInstantSearchServer();

      const props = {
        ...requiredProps,
        searchClient: createSearchClient(),
        algoliaClient: createSearchClient(),
      };

      const trigger = () =>
        shallow(<InstantSearch indexName="name" {...props} />);

      expect(() => trigger()).toThrowErrorMatchingInlineSnapshot(
        `"react-instantsearch:: \`searchClient\` cannot be used with \`appId\`, \`apiKey\` or \`algoliaClient\`."`
      );
    });

    it('throws if appId is given with searchClient', () => {
      const { InstantSearch } = createInstantSearchServer();

      const props = {
        ...requiredProps,
        appId: 'appId',
        searchClient: createSearchClient(),
      };

      const trigger = () => shallow(<InstantSearch {...props} />);

      expect(() => trigger()).toThrowErrorMatchingInlineSnapshot(
        `"react-instantsearch:: \`searchClient\` cannot be used with \`appId\`, \`apiKey\` or \`algoliaClient\`."`
      );
    });

    it('throws if apiKey is given with searchClient', () => {
      const { InstantSearch } = createInstantSearchServer();

      const props = {
        ...requiredProps,
        apiKey: 'apiKey',
        searchClient: createSearchClient(),
      };

      const trigger = () => shallow(<InstantSearch {...props} />);

      expect(() => trigger()).toThrowErrorMatchingInlineSnapshot(
        `"react-instantsearch:: \`searchClient\` cannot be used with \`appId\`, \`apiKey\` or \`algoliaClient\`."`
      );
    });
  });

  describe('single index', () => {
    it('results should be instance of SearchResults', () => {
      const { InstantSearch } = createInstantSearchServer();

      const props = {
        ...requiredPropsWithSearchClient,
        resultsState: {
          _originalResponse: {
            results: [
              {
                index: 'indexName',
                query: 'query',
              },
            ],
          },
          state: {
            index: 'indexName',
            query: 'query',
          },
        },
      };

      const wrapper = shallow(<InstantSearch {...props} />);

      expect(wrapper.props().resultsState).toBeInstanceOf(SearchResults);
      expect(wrapper.props().resultsState.query).toEqual('query');
    });

    describe('find results', () => {
      it('results should be instance of SearchResults and SearchParameters', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const getSearchParameters = jest.fn();
        const Connected = createWidget({
          getSearchParameters,
        });

        const props = {
          ...requiredPropsWithSearchClient,
        };

        const App = () => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const results = await findResultsState(App);

        expect(results.content).toBeInstanceOf(SearchResults);
        expect(results.state).toBeInstanceOf(SearchParameters);
      });

      it('searchParameters should be cleaned each time', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const getSearchParameters = jest.fn();
        const Connected = createWidget({
          getSearchParameters,
        });

        const props = {
          ...requiredPropsWithSearchClient,
        };

        const App = () => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        await findResultsState(App);

        // It's called two times because of an issue we have inside
        // `createConnector`. We register the widget inside the constructor it
        // means that it's executed on the server. But on the server we already
        // have the hook `onSearchParamters` that collect `getSearchParameters`
        // on all the widgets. At the end both are executed it should be fixed
        // once we move the registration inside `componentDidMount`.
        expect(getSearchParameters).toHaveBeenCalledTimes(2);

        getSearchParameters.mockClear();

        await findResultsState(App);

        expect(getSearchParameters).toHaveBeenCalledTimes(2);
      });

      it('without search state', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const Connected = createWidget();

        const props = {
          ...requiredPropsWithSearchClient,
        };

        const App = () => (
          <InstantSearch {...props}>
            <Connected />
          </InstantSearch>
        );

        const data = await findResultsState(App);

        expect(data._originalResponse).toBeDefined();
        expect(data.content).toBeDefined();
        expect(data.state.index).toBe('indexName');
        expect(data.state.query).toBe('Apple');
      });

      it('with search state', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const Connected = createWidget();

        const props = {
          ...requiredPropsWithSearchClient,
        };

        const App = ({ searchState }) => (
          <InstantSearch {...props} searchState={searchState}>
            <Connected />
          </InstantSearch>
        );

        const data = await findResultsState(App, {
          searchState: {
            query: 'iPhone',
          },
        });

        expect(data._originalResponse).toBeDefined();
        expect(data.content).toBeDefined();
        expect(data.state.index).toBe('indexName');
        expect(data.state.query).toBe('iPhone');
      });
    });
  });

  describe('multi index', () => {
    const Index = createIndex({ Root: 'div' });

    it('results should be instance of SearchResults', () => {
      const { InstantSearch } = createInstantSearchServer();

      const props = {
        ...requiredPropsWithSearchClient,
        resultsState: [
          {
            _internalIndexId: 'index1',
            _originalResponse: {
              results: [
                {
                  index: 'index1',
                  query: 'query1',
                },
              ],
            },
            state: {
              index: 'index1',
              query: 'query1',
            },
          },
          {
            _internalIndexId: 'index2',
            _originalResponse: {
              results: [
                {
                  index: 'index2',
                  query: 'query2',
                },
              ],
            },
            state: {
              index: 'index2',
              query: 'query2',
            },
          },
        ],
      };

      const wrapper = shallow(<InstantSearch {...props} />);

      expect(wrapper.props().resultsState.index1.query).toBe('query1');
      expect(wrapper.props().resultsState.index1).toBeInstanceOf(SearchResults);
      expect(wrapper.props().resultsState.index2.query).toBe('query2');
      expect(wrapper.props().resultsState.index2).toBeInstanceOf(SearchResults);
    });

    describe('find results', () => {
      it('results should be instance of SearchResults and SearchParameters', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const getSearchParameters = jest.fn();
        const Connected = createWidget({
          getSearchParameters,
        });

        const props = {
          ...requiredPropsWithSearchClient,
        };

        const App = () => (
          <InstantSearch {...props}>
            <Index indexName="index2">
              <Connected />
            </Index>
          </InstantSearch>
        );

        const results = await findResultsState(App);

        results.forEach(result => {
          expect(result.content).toBeInstanceOf(SearchResults);
          expect(result.state).toBeInstanceOf(SearchParameters);
        });
      });

      it('searchParameters should be cleaned each time', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const getSearchParameters = jest.fn();
        const Connected = createWidget({
          getSearchParameters,
        });

        const props = {
          ...requiredPropsWithSearchClient,
        };

        const App = () => (
          <InstantSearch {...props}>
            <Index indexName="index2">
              <Connected />
            </Index>
          </InstantSearch>
        );

        await findResultsState(App);

        // It's called two times because of an issue we have inside
        // `createConnector`. We register the widget inside the constructor it
        // means that it's executed on the server. But on the server we already
        // have the hook `onSearchParamters` that collect `getSearchParameters`
        // on all the widgets. At the end both are executed it should be fixed
        // once we move the registration inside `componentDidMount`.
        expect(getSearchParameters).toHaveBeenCalledTimes(2);

        getSearchParameters.mockClear();

        await findResultsState(App);

        expect(getSearchParameters).toHaveBeenCalledTimes(2);
      });

      it('without search state - first API', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const Connected = createWidget();

        const props = {
          ...requiredPropsWithSearchClient,
          indexName: 'index1',
        };

        const App = () => (
          <InstantSearch {...props}>
            <Index indexId="index1" indexName="index1">
              <Connected />
            </Index>

            <Index indexId="index2" indexName="index2">
              <Connected />
            </Index>
          </InstantSearch>
        );

        const data = await findResultsState(App);

        expect(data).toHaveLength(2);

        const [first] = data;

        expect(first._internalIndexId).toBe('index1');
        expect(first.state.index).toBe('index1');
        expect(first.state.query).toBe('Apple');

        const [, second] = data;

        expect(second._internalIndexId).toBe('index2');
        expect(second.state.index).toBe('index2');
        expect(second.state.query).toBe('Apple');
      });

      it('without search state - second API', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const Connected = createWidget();

        const props = {
          ...requiredPropsWithSearchClient,
          indexName: 'index1',
        };

        const App = () => (
          <InstantSearch {...props}>
            <Connected />

            <Index indexId="index2" indexName="index2">
              <Connected />
            </Index>
          </InstantSearch>
        );

        const data = await findResultsState(App);

        expect(data).toHaveLength(2);

        const [first] = data;

        expect(first._internalIndexId).toBe('index1');
        expect(first.state.index).toBe('index1');
        expect(first.state.query).toBe('Apple');

        const [, second] = data;

        expect(second._internalIndexId).toBe('index2');
        expect(second.state.index).toBe('index2');
        expect(second.state.query).toBe('Apple');
      });

      it('without search state - same index', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const Connected = createWidget();

        const props = {
          ...requiredPropsWithSearchClient,
          indexName: 'index1',
        };

        const App = () => (
          <InstantSearch {...props}>
            <Connected defaultRefinement="Apple" />

            <Index indexId="index1_with_refinement" indexName="index1">
              <Connected defaultRefinement="iWatch" />
            </Index>
          </InstantSearch>
        );

        const data = await findResultsState(App);

        expect(data).toHaveLength(2);

        const [first] = data;

        expect(first._internalIndexId).toBe('index1');
        expect(first.state.index).toBe('index1');
        expect(first.state.query).toBe('Apple');

        const [, second] = data;

        expect(second._internalIndexId).toBe('index1_with_refinement');
        expect(second.state.index).toBe('index1');
        expect(second.state.query).toBe('iWatch');
      });

      it('with search state - first API', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const Connected = createWidget();

        const props = {
          ...requiredPropsWithSearchClient,
          indexName: 'index1',
        };

        const App = ({ searchState }) => (
          <InstantSearch {...props} searchState={searchState}>
            <Index indexId="index1" indexName="index1">
              <Connected />
            </Index>

            <Index indexId="index2" indexName="index2">
              <Connected />
            </Index>
          </InstantSearch>
        );

        const data = await findResultsState(App, {
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
        });

        expect(data).toHaveLength(2);

        const [first] = data;

        expect(first._internalIndexId).toBe('index1');
        expect(first.state.index).toBe('index1');
        expect(first.state.query).toBe('iPhone');

        const [, second] = data;

        expect(second._internalIndexId).toBe('index2');
        expect(second.state.index).toBe('index2');
        expect(second.state.query).toBe('iPad');
      });

      it('with search state - second API', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const Connected = createWidget();

        const props = {
          ...requiredPropsWithSearchClient,
          indexName: 'index1',
        };

        const App = ({ searchState }) => (
          <InstantSearch {...props} searchState={searchState}>
            <Connected />

            <Index indexId="index2" indexName="index2">
              <Connected />
            </Index>
          </InstantSearch>
        );

        const data = await findResultsState(App, {
          searchState: {
            query: 'iPhone',
            indices: {
              index2: {
                query: 'iPad',
              },
            },
          },
        });

        expect(data).toHaveLength(2);

        const [first] = data;

        expect(first._internalIndexId).toBe('index1');
        expect(first.state.index).toBe('index1');
        expect(first.state.query).toBe('iPhone');

        const [, second] = data;

        expect(second._internalIndexId).toBe('index2');
        expect(second.state.index).toBe('index2');
        expect(second.state.query).toBe('iPad');
      });

      it('with search state - same index', async () => {
        const { InstantSearch, findResultsState } = createInstantSearchServer();

        const Connected = createWidget();

        const props = {
          ...requiredPropsWithSearchClient,
          indexName: 'index1',
        };

        const App = ({ searchState }) => (
          <InstantSearch {...props} searchState={searchState}>
            <Connected />

            <Index indexId="index1_with_refinement" indexName="index1">
              <Connected />
            </Index>
          </InstantSearch>
        );

        const data = await findResultsState(App, {
          searchState: {
            query: 'iPhone',
            indices: {
              // eslint-disable-next-line camelcase
              index1_with_refinement: {
                query: 'iPad',
              },
            },
          },
        });

        expect(data).toHaveLength(2);

        const [first] = data;

        expect(first._internalIndexId).toBe('index1');
        expect(first.state.index).toBe('index1');
        expect(first.state.query).toBe('iPhone');

        const [, second] = data;

        expect(second._internalIndexId).toBe('index1_with_refinement');
        expect(second.state.index).toBe('index1');
        expect(second.state.query).toBe('iPad');
      });
    });
  });
});
