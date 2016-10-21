/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connect';
jest.mock('../../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
} = connect;

let props;
let params;

describe('SearchBox.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps({id: 'q'}, {});
    expect(props).toEqual({query: ''});

    props = getProps({id: 'q'}, {q: 'yep'});
    expect(props).toEqual({query: 'yep'});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({id: 'ok'}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      ok: 'yep',
    });
  });

  it('refines the query parameter', () => {
    params = getSP(new SearchParameters(), {id: 'q'}, {q: 'bar'});
    expect(params.query).toBe('bar');
  });
});
