/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectSortBy';
jest.mock('../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connect;

let props;
let params;

describe('connectSortBy', () => {
  it('provides the correct props to the component', () => {
    props = getProps({id: 'i'}, {});
    expect(props).toEqual({currentRefinement: null});

    props = getProps({id: 'i'}, {i: 'yep'});
    expect(props).toEqual({currentRefinement: 'yep'});

    props = getProps({id: 'i', defaultRefinement: 'yep'}, {});
    expect(props).toEqual({currentRefinement: 'yep'});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({id: 'ok'}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      ok: 'yep',
    });
  });

  it('refines the index parameter', () => {
    params = getSP(new SearchParameters(), {id: 'i'}, {i: 'yep'});
    expect(params.index).toBe('yep');
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({id: 'i'});
    expect(metadata).toEqual({id: 'i'});
  });
});
