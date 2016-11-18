/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectSearchBox';
jest.mock('../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
} = connect;

let props;
let params;

describe('connectSearchBox', () => {
  it('provides the correct props to the component', () => {
    props = getProps({}, {});
    expect(props).toEqual({query: ''});

    props = getProps({}, {q: 'yep'});
    expect(props).toEqual({query: 'yep'});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      q: 'yep',
    });
  });

  it('refines the query parameter', () => {
    params = getSP(new SearchParameters(), {}, {q: 'bar'});
    expect(params.query).toBe('bar');
  });
});
