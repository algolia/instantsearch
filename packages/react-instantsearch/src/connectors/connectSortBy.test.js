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
    props = getProvidedProps({items: [{value: 'yep'}, {value: 'yop'}]}, {sortBy: 'yep'});
    expect(props).toEqual({
      items: [{value: 'yep', isRefined: true}, {value: 'yop', isRefined: false}],
      currentRefinement: 'yep',
    });

    props = getProvidedProps({items: [{value: 'yep'}], defaultRefinement: 'yep'}, {});
    expect(props).toEqual({items: [{value: 'yep', isRefined: true}], currentRefinement: 'yep'});
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
