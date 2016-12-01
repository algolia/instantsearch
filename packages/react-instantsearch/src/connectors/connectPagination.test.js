/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectPagination';
jest.mock('../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  transitionState,
  getMetadata,
  cleanUp,
} = connect;

let props;
let params;
let state;

describe('connectPagination', () => {
  it('provides the correct props to the component', () => {
    props = getProps({}, {}, {results: {nbPages: 666}});
    expect(props).toEqual({currentRefinement: 1, nbPages: 666});

    props = getProps({}, {page: 5}, {results: {nbPages: 666}});
    expect(props).toEqual({currentRefinement: 5, nbPages: 666});

    props = getProps({}, {page: '5'}, {results: {nbPages: 666}});
    expect(props).toEqual({currentRefinement: 5, nbPages: 666});
  });

  it('doesn\'t render when no results are available', () => {
    props = getProps({}, {}, {});
    expect(props).toBe(null);
  });

  it('calling refine updates the widget\'s state', () => {
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

  it('Transition state when the value is identical and does not contain isSamePage flag', () => {
    state = transitionState({}, {page: 1}, {page: 1});
    expect(state).toEqual({});
    state = transitionState({}, {page: 1}, {page: 2});
    expect(state).toEqual({
      page: 2,
    });
    const newSameValue = {
      valueOf: () => 1,
      isSamePage: true,
    };
    state = transitionState({}, {page: 1}, {page: newSameValue});
    expect(state).toEqual({
      page: 1,
    });
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({}, {});
    expect(metadata).toEqual({id: 'page'});
  });

  it('should return the right state when clean up', () => {
    const newState = cleanUp({}, {page: {state: 'state'}, another: {state: 'state'}});
    expect(newState).toEqual({another: {state: 'state'}});
  });
});
