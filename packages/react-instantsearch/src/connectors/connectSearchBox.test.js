/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectSearchBox';
jest.mock('../core/createConnector');

const {
  getProvidedProps,
  refine,
  getSearchParameters: getSP,
  cleanUp,
} = connect;

let props;
let params;

describe('connectSearchBox', () => {
  it('provides the correct props to the component', () => {
    props = getProvidedProps({}, {});
    expect(props).toEqual({currentRefinement: ''});

    props = getProvidedProps({}, {query: 'yep'});
    expect(props).toEqual({currentRefinement: 'yep'});
  });

  it('calling refine updates the widget\'s search state', () => {
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

  it('should return the right searchState when clean up', () => {
    const searchState = cleanUp({}, {query: {searchState: 'searchState'}, another: {searchState: 'searchState'}});
    expect(searchState).toEqual({another: {searchState: 'searchState'}});
  });
});
