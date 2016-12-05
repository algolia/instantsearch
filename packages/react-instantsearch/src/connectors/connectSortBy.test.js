/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectSortBy';
jest.mock('../core/createConnector');

const {
  getProvidedProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
  cleanUp,
} = connect;

let props;
let params;

describe('connectSortBy', () => {
  it('provides the correct props to the component', () => {
    props = getProvidedProps({}, {});
    expect(props).toEqual({currentRefinement: null});

    props = getProvidedProps({}, {sortBy: 'yep'});
    expect(props).toEqual({currentRefinement: 'yep'});

    props = getProvidedProps({defaultRefinement: 'yep'}, {});
    expect(props).toEqual({currentRefinement: 'yep'});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      sortBy: 'yep',
    });
  });

  it('refines the index parameter', () => {
    params = getSP(new SearchParameters(), {}, {sortBy: 'yep'});
    expect(params.index).toBe('yep');
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({});
    expect(metadata).toEqual({id: 'sortBy'});
  });

  it('should return the right state when clean up', () => {
    const state = cleanUp({}, {sortBy: {state: 'state'}, another: {state: 'state'}});
    expect(state).toEqual({another: {state: 'state'}});
  });
});
