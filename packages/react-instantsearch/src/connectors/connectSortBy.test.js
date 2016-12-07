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

  it('calling refine updates the widget\'s search state', () => {
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

  it('should return the right searchState when clean up', () => {
    const searchState = cleanUp({}, {sortBy: {searchState: 'searchState'}, another: {searchState: 'searchState'}});
    expect(searchState).toEqual({another: {searchState: 'searchState'}});
  });
});
