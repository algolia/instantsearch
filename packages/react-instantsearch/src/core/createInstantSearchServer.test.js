/* eslint-disable react/prop-types */

import { createInstantSearch } from './createInstantSearchServer';
import createConnector from './createConnector';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

import createIndex from './createIndex';
import { isEmpty } from 'lodash';
import { SearchParameters } from 'algoliasearch-helper';

describe('createInstantSearchServer', () => {
  const algoliaClient = {
    addAlgoliaAgent: jest.fn(),
    search: () => Promise.resolve({ results: [{ query: 'query' }] }),
  };
  const algoliaClientFactory = jest.fn(() => algoliaClient);
  const getSearchParametersCall = jest.fn();
  const {
    InstantSearch: CustomInstantSearch,
    findResultsState,
  } = createInstantSearch(algoliaClientFactory);
  const Connected = createConnector({
    displayName: 'CoolConnector',
    getProvidedProps: () => null,
    getSearchParameters: (searchParameters, props, searchState) => {
      getSearchParametersCall();
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

  beforeEach(() => {
    algoliaClient.addAlgoliaAgent.mockClear();
    algoliaClientFactory.mockClear();
  });

  describe('single index', () => {
    it('results shoud be SearchResults from the helper', () => {
      const wrapper = shallow(
        <CustomInstantSearch
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
        const App = () => (
          <CustomInstantSearch appId="app" apiKey="key" indexName="indexName">
            <Connected />
          </CustomInstantSearch>
        );

        expect.assertions(1);
        return findResultsState(App).then(() => {
          getSearchParametersCall.mockClear();
          findResultsState(App).then(() => {
            expect(getSearchParametersCall).toHaveBeenCalledTimes(2);
          });
        });
      });

      it('without search state', () => {
        const App = () => (
          <CustomInstantSearch appId="app" apiKey="key" indexName="indexName">
            <Connected />
          </CustomInstantSearch>
        );

        expect.assertions(3);

        return findResultsState(App).then(data => {
          expect(data._originalResponse).toBeDefined();
          expect(data.content).toBeDefined();
          expect(data.state.index).toBe('indexName');
        });
      });

      it('with search state', () => {
        const App = props => (
          <CustomInstantSearch
            appId="app"
            apiKey="key"
            indexName="name"
            searchState={props.searchState}
          >
            <Connected />
          </CustomInstantSearch>
        );

        expect.assertions(3);

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
    const CustomIndex = createIndex({
      Root: 'div',
    });
    it('results shoud be SearchResults from the helper', () => {
      const wrapper = shallow(
        <CustomInstantSearch
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
        const App = () => (
          <CustomInstantSearch appId="app" apiKey="key" indexName="indexName">
            <Connected />
          </CustomInstantSearch>
        );

        expect.assertions(1);

        return findResultsState(App).then(() => {
          getSearchParametersCall.mockClear();
          findResultsState(App).then(() => {
            expect(getSearchParametersCall).toHaveBeenCalledTimes(2);
          });
        });
      });

      it('without search state - first api', () => {
        const App = () => (
          <CustomInstantSearch appId="app" apiKey="key" indexName="index1">
            <CustomIndex indexName="index2">
              <Connected />
            </CustomIndex>
            <CustomIndex indexName="index1">
              <Connected />
            </CustomIndex>
          </CustomInstantSearch>
        );

        expect.assertions(3);

        return findResultsState(App).then(data => {
          expect(data).toHaveLength(2);
          expect(data.find(d => d.state.index === 'index1')).toBeTruthy();
          expect(data.find(d => d.state.index === 'index2')).toBeTruthy();
        });
      });

      it('without search state - second api', () => {
        const App = () => (
          <CustomInstantSearch appId="app" apiKey="key" indexName="index1">
            <CustomIndex indexName="index2">
              <Connected />
            </CustomIndex>
            <Connected />
          </CustomInstantSearch>
        );

        expect.assertions(3);

        return findResultsState(App).then(data => {
          expect(data).toHaveLength(2);
          expect(data.find(d => d.state.index === 'index1')).toBeTruthy();
          expect(data.find(d => d.state.index === 'index2')).toBeTruthy();
        });
      });

      it('with search state - first api', () => {
        const App = props => (
          <CustomInstantSearch
            appId="app"
            apiKey="key"
            indexName="index1"
            searchState={props.searchState}
          >
            <CustomIndex indexName="index2">
              <Connected />
            </CustomIndex>
            <CustomIndex indexName="index1">
              <Connected />
            </CustomIndex>
          </CustomInstantSearch>
        );

        expect.assertions(3);

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
        const App = props => (
          <CustomInstantSearch
            appId="app"
            apiKey="key"
            indexName="index1"
            searchState={props.searchState}
          >
            <CustomIndex indexName="index2">
              <Connected />
            </CustomIndex>
            <Connected />
          </CustomInstantSearch>
        );

        expect.assertions(3);

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
