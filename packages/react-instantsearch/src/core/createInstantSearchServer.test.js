/* eslint-disable react/prop-types */

import { isEmpty } from 'lodash';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { version } from '../../package.json';
import { SearchParameters } from 'algoliasearch-helper';
import createConnector from './createConnector';
import createIndex from './createIndex';
import { createInstantSearch } from './createInstantSearchServer';

Enzyme.configure({ adapter: new Adapter() });

describe('createInstantSearchServer', () => {
  const createAlgoliaClient = () => ({
    search: () =>
      Promise.resolve({
        results: [{ query: 'query' }],
      }),
  });

  const createWidget = ({ getSearchParameters = () => {} } = {}) =>
    createConnector({
      displayName: 'CoolConnector',
      getProvidedProps: () => null,
      getSearchParameters: (searchParameters, props, searchState) => {
        getSearchParameters();

        return isEmpty(searchState)
          ? searchParameters.setIndex(searchParameters.index)
          : searchParameters.setIndex(
              searchState.index
                ? searchState.index
                : searchState.indices[searchParameters.index].index
            );
      },
      getMetadata: () => null,
      getId: () => 'id',
    })(() => null);

  describe('props', () => {
    it('creates an algolia client using the provided factory', () => {
      const algoliaClient = {
        ...createAlgoliaClient(),
        addAlgoliaAgent: jest.fn(),
      };
      const createAlgoliaClientSpy = jest.fn(() => algoliaClient);
      const { InstantSearch } = createInstantSearch(createAlgoliaClientSpy);

      shallow(<InstantSearch appId="app" apiKey="key" indexName="name" />);

      expect(createAlgoliaClientSpy).toHaveBeenCalledTimes(1);
      expect(createAlgoliaClientSpy).toHaveBeenCalledWith('app', 'key');
      expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
      expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledWith(
        `react-instantsearch ${version}`
      );
    });

    it('uses the provided searchClient', () => {
      const searchClient = createAlgoliaClient();
      const createAlgoliaClientSpy = jest.fn(() => searchClient);
      const { InstantSearch } = createInstantSearch(createAlgoliaClientSpy);

      const wrapper = shallow(
        <InstantSearch searchClient={searchClient} indexName="name" />
      );

      expect(wrapper.props().searchClient).toBe(searchClient);
    });

    it('uses the provided algoliaClient', () => {
      const algoliaClient = {
        ...createAlgoliaClient(),
        addAlgoliaAgent: jest.fn(),
      };
      const createAlgoliaClientSpy = jest.fn(() => algoliaClient);
      const { InstantSearch } = createInstantSearch(createAlgoliaClientSpy);

      const wrapper = shallow(
        <InstantSearch algoliaClient={algoliaClient} indexName="name" />
      );

      expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
      expect(wrapper.props().algoliaClient).toBe(algoliaClient);
    });

    it('does not throw if searchClient does not have a `addAlgoliaAgent()` method', () => {
      const searchClient = createAlgoliaClient();
      const createAlgoliaClientSpy = jest.fn(() => searchClient);
      const { InstantSearch } = createInstantSearch(createAlgoliaClientSpy);

      const trigger = () =>
        shallow(<InstantSearch indexName="name" searchClient={searchClient} />);

      expect(() => trigger()).not.toThrow();
    });

    it('does not throw if algoliaClient does not have a `addAlgoliaAgent()` method', () => {
      const algoliaClient = createAlgoliaClient();
      const createAlgoliaClientSpy = jest.fn(() => algoliaClient);
      const { InstantSearch } = createInstantSearch(createAlgoliaClientSpy);

      const trigger = () =>
        shallow(
          <InstantSearch indexName="name" algoliaClient={algoliaClient} />
        );

      expect(() => trigger()).not.toThrow();
    });

    it('throws if algoliaClient is given with searchClient', () => {
      const { InstantSearch } = createInstantSearch(createAlgoliaClient);

      const trigger = () =>
        shallow(
          <InstantSearch
            indexName="name"
            searchClient={createAlgoliaClient()}
            algoliaClient={createAlgoliaClient()}
          />
        );

      expect(() => trigger()).toThrow();
    });

    it('throws if appId is given with searchClient', () => {
      const { InstantSearch } = createInstantSearch(createAlgoliaClient);

      const trigger = () =>
        shallow(
          <InstantSearch
            indexName="name"
            appId="appId"
            searchClient={createAlgoliaClient()}
          />
        );

      expect(() => trigger()).toThrow();
    });

    it('throws if apiKey is given with searchClient', () => {
      const { InstantSearch } = createInstantSearch(createAlgoliaClient);

      const trigger = () =>
        shallow(
          <InstantSearch
            indexName="name"
            apiKey="apiKey"
            searchClient={createAlgoliaClient()}
          />
        );

      expect(() => trigger()).toThrow();
    });
  });

  describe('single index', () => {
    it('results shoud be SearchResults from the helper', () => {
      const { InstantSearch } = createInstantSearch(createAlgoliaClient);

      const wrapper = shallow(
        <InstantSearch
          appId="app"
          apiKey="key"
          indexName="name"
          resultsState={{
            _originalResponse: { results: [{ query: 'query' }] },
            state: new SearchParameters(),
          }}
        />
      );

      expect(wrapper.props().resultsState.getFacetByName).toBeDefined();
      expect(wrapper.props().resultsState.query).toEqual('query');
    });

    describe('find results', () => {
      it('searchParameters should be cleaned each time', () => {
        expect.assertions(1);

        const { InstantSearch, findResultsState } = createInstantSearch(
          createAlgoliaClient
        );

        const getSearchParameters = jest.fn();
        const Connected = createWidget({
          getSearchParameters,
        });

        const App = () => (
          <InstantSearch appId="app" apiKey="key" indexName="indexName">
            <Connected />
          </InstantSearch>
        );

        return findResultsState(App)
          .then(() => {
            getSearchParameters.mockClear();
            return findResultsState(App);
          })
          .then(() => {
            expect(getSearchParameters).toHaveBeenCalledTimes(2);
          });
      });

      it('without search state', () => {
        expect.assertions(3);

        const { InstantSearch, findResultsState } = createInstantSearch(
          createAlgoliaClient
        );

        const Connected = createWidget();

        const App = () => (
          <InstantSearch appId="app" apiKey="key" indexName="indexName">
            <Connected />
          </InstantSearch>
        );

        return findResultsState(App).then(data => {
          expect(data._originalResponse).toBeDefined();
          expect(data.content).toBeDefined();
          expect(data.state.index).toBe('indexName');
        });
      });

      it('with search state', () => {
        expect.assertions(3);

        const { InstantSearch, findResultsState } = createInstantSearch(
          createAlgoliaClient
        );

        const Connected = createWidget();

        const App = props => (
          <InstantSearch
            appId="app"
            apiKey="key"
            indexName="name"
            searchState={props.searchState}
          >
            <Connected />
          </InstantSearch>
        );

        return findResultsState(App, {
          searchState: { index: 'index search state' },
        }).then(data => {
          expect(data._originalResponse).toBeDefined();
          expect(data.content).toBeDefined();
          expect(data.state.index).toBe('index search state');
        });
      });
    });
  });

  describe('multi index', () => {
    const Index = createIndex({ Root: 'div' });

    it('results shoud be SearchResults from the helper', () => {
      const { InstantSearch } = createInstantSearch(createAlgoliaClient);

      const wrapper = shallow(
        <InstantSearch
          appId="app"
          apiKey="key"
          indexName="name"
          resultsState={[
            {
              _originalResponse: { results: [{ query: 'query1' }] },
              state: new SearchParameters({ index: 'index1' }),
            },
            {
              _originalResponse: { results: [{ query: 'query2' }] },
              state: new SearchParameters({ index: 'index2' }),
            },
          ]}
        />
      );

      expect(wrapper.props().resultsState.index1.query).toBe('query1');
      expect(wrapper.props().resultsState.index1.getFacetByName).toBeDefined();
      expect(wrapper.props().resultsState.index2.query).toBe('query2');
      expect(wrapper.props().resultsState.index2.getFacetByName).toBeDefined();
    });

    describe('find results', () => {
      it('searchParameters should be cleaned each time', () => {
        expect.assertions(1);

        const { InstantSearch, findResultsState } = createInstantSearch(
          createAlgoliaClient
        );

        const getSearchParameters = jest.fn();
        const Connected = createWidget({
          getSearchParameters,
        });

        const App = () => (
          <InstantSearch appId="app" apiKey="key" indexName="indexName">
            <Index indexName="index2">
              <Connected />
            </Index>
          </InstantSearch>
        );

        return findResultsState(App)
          .then(() => {
            getSearchParameters.mockClear();

            return findResultsState(App);
          })
          .then(() => {
            expect(getSearchParameters).toHaveBeenCalledTimes(2);
          });
      });

      it('without search state - first api', () => {
        expect.assertions(3);

        const { InstantSearch, findResultsState } = createInstantSearch(
          createAlgoliaClient
        );

        const Connected = createWidget();

        const App = () => (
          <InstantSearch appId="app" apiKey="key" indexName="index1">
            <Index indexName="index2">
              <Connected />
            </Index>
            <Index indexName="index1">
              <Connected />
            </Index>
          </InstantSearch>
        );

        return findResultsState(App).then(data => {
          expect(data).toHaveLength(2);
          expect(data.find(d => d.state.index === 'index1')).toBeTruthy();
          expect(data.find(d => d.state.index === 'index2')).toBeTruthy();
        });
      });

      it('without search state - second api', () => {
        expect.assertions(3);

        const { InstantSearch, findResultsState } = createInstantSearch(
          createAlgoliaClient
        );

        const Connected = createWidget();

        const App = () => (
          <InstantSearch appId="app" apiKey="key" indexName="index1">
            <Index indexName="index2">
              <Connected />
            </Index>
            <Connected />
          </InstantSearch>
        );

        return findResultsState(App).then(data => {
          expect(data).toHaveLength(2);
          expect(data.find(d => d.state.index === 'index1')).toBeTruthy();
          expect(data.find(d => d.state.index === 'index2')).toBeTruthy();
        });
      });

      it('with search state - first api', () => {
        expect.assertions(3);

        const { InstantSearch, findResultsState } = createInstantSearch(
          createAlgoliaClient
        );

        const Connected = createWidget();

        const App = props => (
          <InstantSearch
            appId="app"
            apiKey="key"
            indexName="index1"
            searchState={props.searchState}
          >
            <Index indexName="index2">
              <Connected />
            </Index>
            <Index indexName="index1">
              <Connected />
            </Index>
          </InstantSearch>
        );

        return findResultsState(App, {
          searchState: {
            indices: {
              index1: { index: 'index1 new name' },
              index2: { index: 'index2 new name' },
            },
          },
        }).then(data => {
          expect(data).toHaveLength(2);
          expect(
            data.find(d => d.state.index === 'index1 new name')
          ).toBeTruthy();
          expect(
            data.find(d => d.state.index === 'index2 new name')
          ).toBeTruthy();
        });
      });

      it('with search state - second api', () => {
        expect.assertions(3);

        const { InstantSearch, findResultsState } = createInstantSearch(
          createAlgoliaClient
        );

        const Connected = createWidget();

        const App = props => (
          <InstantSearch
            appId="app"
            apiKey="key"
            indexName="index1"
            searchState={props.searchState}
          >
            <Index indexName="index2">
              <Connected />
            </Index>
            <Connected />
          </InstantSearch>
        );

        return findResultsState(App, {
          searchState: {
            indices: {
              index1: { index: 'index1 new name' },
              index2: { index: 'index2 new name' },
            },
          },
        }).then(data => {
          expect(data).toHaveLength(2);
          expect(
            data.find(d => d.state.index === 'index1 new name')
          ).toBeTruthy();
          expect(
            data.find(d => d.state.index === 'index2 new name')
          ).toBeTruthy();
        });
      });
    });
  });
});
