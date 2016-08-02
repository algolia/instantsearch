/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import connectNumericRefinementList from './connectNumericRefinementList';
jest.unmock('./connectNumericRefinementList');

const {mapStateToProps, refine} = connectNumericRefinementList;

describe('connectNumericRefinementList', () => {
  it('provides the correct props to the component', () => {
    let searchParameters;
    let props;

    searchParameters = new SearchParameters();
    props = mapStateToProps({searchParameters}, {
      items: [
        {label: 'All'},
      ],
    });
    expect(props).toEqual({
      items: [
        {label: 'All', value: ':'},
      ],
      selectedItem: ':',
    });

    searchParameters = new SearchParameters()
      .addNumericRefinement('facet', '>=', '100');
    props = mapStateToProps({searchParameters}, {
      attributeName: 'facet',
      items: [
        {label: 'All'},
        {label: 'Ok', start: 100},
      ],
    });
    expect(props).toEqual({
      items: [
        {label: 'All', value: ':'},
        {label: 'Ok', value: '100:'},
      ],
      selectedItem: '100:',
    });

    searchParameters = new SearchParameters()
      .addNumericRefinement('facet', '<=', '200');
    props = mapStateToProps({searchParameters}, {
      attributeName: 'facet',
      items: [
        {label: 'All'},
        {label: 'Not ok', end: 200},
      ],
    });
    expect(props).toEqual({
      items: [
        {label: 'All', value: ':'},
        {label: 'Not ok', value: ':200'},
      ],
      selectedItem: ':200',
    });

    searchParameters = new SearchParameters()
      .addNumericRefinement('facet', '>=', '100')
      .addNumericRefinement('facet', '<=', '200');
    props = mapStateToProps({searchParameters}, {
      attributeName: 'facet',
      items: [
        {label: 'All'},
        {label: 'Ok', start: 100},
        {label: 'Not ok', end: 200},
        {label: 'Maybe ok?', start: 100, end: 200},
      ],
    });
    expect(props).toEqual({
      items: [
        {label: 'All', value: ':'},
        {label: 'Ok', value: '100:'},
        {label: 'Not ok', value: ':200'},
        {label: 'Maybe ok?', value: '100:200'},
      ],
      selectedItem: '100:200',
    });
  });

  it('refines the corresponding numeric facet', () => {
    const state = new SearchParameters();
    let refinedState;

    refinedState = refine(state, {attributeName: 'facet'}, ':');
    expect(refinedState.getNumericRefinements('facet')).toEqual({});

    refinedState = refine(state, {attributeName: 'facet'}, '100:');
    expect(refinedState.getNumericRefinements('facet')).toEqual({
      '>=': [100],
    });

    refinedState = refine(state, {attributeName: 'facet'}, ':200');
    expect(refinedState.getNumericRefinements('facet')).toEqual({
      '<=': [200],
    });

    refinedState = refine(state, {attributeName: 'facet'}, '100:200');
    expect(refinedState.getNumericRefinements('facet')).toEqual({
      '>=': [100],
      '<=': [200],
    });
  });
});
