/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectSearchBox';
jest.mock('../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  cleanUp,
} = connect;

let props;
let params;

describe('connectSearchBox', () => {
  it('provides the correct props to the component', () => {
    props = getProps({}, {});
    expect(props).toEqual({query: ''});

    props = getProps({}, {query: 'yep'});
    expect(props).toEqual({query: 'yep'});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      query: 'yep',
    });
  });

  it('refines the query parameter', () => {
    params = getSP(new SearchParameters(), {}, {query: 'bar'});
    expect(params.query).toBe('bar');
  });

  it('should return the right state when clean up', () => {
    const state = cleanUp({}, {query: {state: 'state'}, another: {state: 'state'}});
    expect(state).toEqual({another: {state: 'state'}});
  });
});
