/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import connectPagination from './connectPagination';
jest.unmock('./connectPagination');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  transitionState,
  getMetadata,
} = connectPagination;

let props;
let params;
let state;

describe('connectPagination', () => {
  it('provides the correct props to the component', () => {
    props = getProps({id: 'ok'}, {}, {results: {nbPages: 666}});
    expect(props).toEqual({page: 0, nbPages: 666});

    props = getProps({id: 'ok'}, {ok: 5}, {results: {nbPages: 666}});
    expect(props).toEqual({page: 5, nbPages: 666});

    props = getProps({id: 'ok'}, {ok: '5'}, {results: {nbPages: 666}});
    expect(props).toEqual({page: 5, nbPages: 666});
  });

  it('doesn\'t render when no results are available', () => {
    props = getProps({id: 'ok'}, {}, {});
    expect(props).toBe(null);
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({id: 'ok'}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      ok: 'yep',
    });
  });

  it('refines the page parameter', () => {
    const initSP = new SearchParameters();
    params = getSP(initSP, {id: 'ok'}, {ok: 666});
    expect(params.page).toBe(666);
  });

  it('clears the state when an update occurs without change', () => {
    state = transitionState({id: 'ok'}, {ok: 1}, {ok: 1});
    expect(state).toEqual({
      ok: undefined,
    });
    state = transitionState({id: 'ok'}, {ok: 1}, {ok: 2});
    expect(state).toEqual({
      ok: 2,
    });
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({id: 'ok'}, {});
    expect(metadata).toEqual({id: 'ok'});
  });
});
