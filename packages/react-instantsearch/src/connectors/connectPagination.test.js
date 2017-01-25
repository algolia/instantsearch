/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectPagination';
jest.mock('../core/createConnector');

const {
  getProvidedProps,
  refine,
  getSearchParameters: getSP,
  transitionState,
  getMetadata,
  cleanUp,
} = connect;

let props;
let params;
let searchState;

describe('connectPagination', () => {
  it('provides the correct props to the component', () => {
    props = getProvidedProps({}, {}, {results: {nbPages: 666}});
    expect(props).toEqual({currentRefinement: 1, nbPages: 666, canRefine: true});

    props = getProvidedProps({}, {page: 5}, {results: {nbPages: 666}});
    expect(props).toEqual({currentRefinement: 5, nbPages: 666, canRefine: true});

    props = getProvidedProps({}, {page: '5'}, {results: {nbPages: 666}});
    expect(props).toEqual({currentRefinement: 5, nbPages: 666, canRefine: true});

    props = getProvidedProps({}, {page: '1'}, {results: {nbPages: 1}});
    expect(props).toEqual({currentRefinement: 1, nbPages: 1, canRefine: false});
  });

  it('doesn\'t render when no results are available', () => {
    props = getProvidedProps({}, {}, {});
    expect(props).toBe(null);
  });

  it('calling refine updates the widget\'s search state', () => {
    const nextState = refine({}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      page: 'yep',
    });
  });

  it('refines the page parameter', () => {
    const initSP = new SearchParameters();
    params = getSP(initSP, {}, {page: 667});
    expect(params.page).toBe(666);
  });

  it('Transition searchState when the value is identical and does not contain isSamePage flag', () => {
    searchState = transitionState({}, {page: 1}, {page: 1});
    expect(searchState).toEqual({});
    searchState = transitionState({}, {page: 1}, {page: 2});
    expect(searchState).toEqual({
      page: 2,
    });
    const newSameValue = {
      valueOf: () => 1,
      isSamePage: true,
    };
    searchState = transitionState({}, {page: 1}, {page: newSameValue});
    expect(searchState).toEqual({
      page: 1,
    });
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({}, {});
    expect(metadata).toEqual({id: 'page'});
  });

  it('should return the right searchState when clean up', () => {
    const newState = cleanUp({}, {page: {searchState: 'searchState'}, another: {searchState: 'searchState'}});
    expect(newState).toEqual({another: {searchState: 'searchState'}});
  });
});
