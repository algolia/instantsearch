/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connect';
jest.mock('../../core/createConnector');

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

describe('Pagination.connect', () => {
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

  it('Transition state when the value is identical and does not contain isSamePage flag', () => {
    state = transitionState({id: 'ok'}, {ok: 1}, {ok: 1});
    expect(state).toEqual({});
    state = transitionState({id: 'ok'}, {ok: 1}, {ok: 2});
    expect(state).toEqual({
      ok: 2,
    });
    const newSameValue = {
      valueOf: () => 1,
      isSamePage: true,
    };
    state = transitionState({id: 'ok'}, {ok: 1}, {ok: newSameValue});
    expect(state).toEqual({
      ok: 1,
    });
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({id: 'ok'}, {});
    expect(metadata).toEqual({id: 'ok'});
  });
});
