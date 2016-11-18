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
} = connect;

let props;
let params;
let state;

describe('connectPagination', () => {
  it('provides the correct props to the component', () => {
    props = getProps({}, {}, {results: {nbPages: 666}});
    expect(props).toEqual({currentRefinement: 1, nbPages: 666});

    props = getProps({}, {p: 5}, {results: {nbPages: 666}});
    expect(props).toEqual({currentRefinement: 5, nbPages: 666});

    props = getProps({}, {p: '5'}, {results: {nbPages: 666}});
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
      p: 'yep',
    });
  });

  it('refines the page parameter', () => {
    const initSP = new SearchParameters();
    params = getSP(initSP, {}, {p: 667});
    expect(params.page).toBe(666);
  });

  it('Transition state when the value is identical and does not contain isSamePage flag', () => {
    state = transitionState({}, {p: 1}, {p: 1});
    expect(state).toEqual({});
    state = transitionState({}, {p: 1}, {p: 2});
    expect(state).toEqual({
      p: 2,
    });
    const newSameValue = {
      valueOf: () => 1,
      isSamePage: true,
    };
    state = transitionState({}, {p: 1}, {p: newSameValue});
    expect(state).toEqual({
      p: 1,
    });
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({}, {});
    expect(metadata).toEqual({id: 'p'});
  });
});
