/* eslint-env jest, jasmine */

import {SearchParameters, SearchResults} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createRange from './createRange';
jest.unmock('./createRange');
import {assertFacetDefined} from '../utils';

const {
  configure,
  mapStateToProps,
  transformProps,
  refine,
  shouldRender,
} = createRange;

describe('createRange', () => {
  it('adds the required disjunctiveFacet', () => {
    let state;
    let configuredState;

    state = new SearchParameters();
    configuredState = configure(state, {
      attributeName: 'facet',
    });
    expect(configuredState.disjunctiveFacets).toEqual(['facet']);

    state = new SearchParameters({disjunctiveFacets: ['facet']});
    configuredState = configure(state, {
      attributeName: 'facet',
    });
    expect(configuredState.disjunctiveFacets).toEqual(['facet']);
  });

  it('provides the correct props to the component', () => {
    let searchParameters;
    let props;

    searchParameters = new SearchParameters();
    props = mapStateToProps({searchParameters}, {
      attributeName: 'facet',
    });
    expect(props).toEqual({
      shouldRender: false,
    });

    props = mapStateToProps({searchParameters}, {
      attributeName: 'facet',
      min: 10,
    });
    expect(props).toEqual({
      shouldRender: false,
    });

    props = mapStateToProps({searchParameters}, {
      attributeName: 'facet',
      max: 10,
    });
    expect(props).toEqual({
      shouldRender: false,
    });

    searchParameters = new SearchParameters({
      disjunctiveFacets: ['facet'],
    });
    const searchResults = new SearchResults(searchParameters, {
      results: [
        {
          facets: {
            facet: {},
          },
          // eslint-disable-next-line camelcase
          facets_stats: {
            facet: {
              min: 10,
              max: 30,
            },
          },
        },
      ],
    });
    props = mapStateToProps({
      searchParameters,
      searchResults,
      searchResultsSearchParameters: searchParameters,
    }, {
      attributeName: 'facet',
    });
    expect(props).toEqual({
      shouldRender: true,
      min: 10,
      max: 30,
      value: [10, 30],
    });

    searchParameters = new SearchParameters()
      .addNumericRefinement('facet', '>=', '15')
      .addNumericRefinement('facet', '<=', '25');
    props = mapStateToProps({
      searchParameters,
      searchResults,
      searchResultsSearchParameters: searchParameters,
    }, {
      attributeName: 'facet',
    });
    expect(props).toEqual({
      shouldRender: true,
      min: 10,
      max: 30,
      value: [15, 25],
    });
  });

  it('asserts the facet is defined', () => {
    assertFacetDefined.mockClear();
    const searchParameters = new SearchParameters({
      disjunctiveFacets: ['facet'],
    });
    const searchResults = new SearchResults(searchParameters, {
      results: [{}],
    });
    mapStateToProps({
      searchParameters,
      searchResultsSearchParameters: searchParameters,
      searchResults,
    }, {
      attributeName: 'facet',
    });
    expect(assertFacetDefined.mock.calls.length).toBe(1);
    expect(assertFacetDefined.mock.calls[0][0]).toBe(searchParameters);
    expect(assertFacetDefined.mock.calls[0][1]).toBe(searchResults);
    expect(assertFacetDefined.mock.calls[0][2]).toBe('facet');
  });

  it('only renders when shouldRender=true', () => {
    expect(shouldRender({shouldRender: false})).toBe(false);
    expect(shouldRender({shouldRender: true})).toBe(true);
  });

  it('transforms its props', () => {
    expect(transformProps({
      min: 10,
      max: 30,
      value: [10, 30],
      hello: 'you',
    })).toEqual({
      min: 10,
      max: 30,
      value: [10, 30],
    });
  });

  it('refines the corresponding numeric facet', () => {
    const state = new SearchParameters();
    const refinedState = refine(state, {attributeName: 'facet'}, [10, 30]);
    expect(refinedState.getNumericRefinements('facet')).toEqual({
      '>=': [10],
      '<=': [30],
    });
  });
});
