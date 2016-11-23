/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectHitsPerPage';
jest.mock('../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
  cleanUp,
} = connect;

let props;
let params;

describe('connectHitsPerPage', () => {
  it('provides the correct props to the component', () => {
    props = getProps({}, {hPP: '10'});
    expect(props).toEqual({currentRefinement: 10});

    props = getProps({defaultRefinement: 20}, {});
    expect(props).toEqual({currentRefinement: 20});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({}, {otherKey: 'val'}, 30);
    expect(nextState).toEqual({
      otherKey: 'val',
      hPP: 30,
    });
  });

  it('refines the hitsPerPage parameter', () => {
    const sp = new SearchParameters();

    params = getSP(sp, {}, {hPP: 10});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

    params = getSP(sp, {}, {hPP: '10'});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

    params = getSP(sp, {defaultRefinement: 20}, {});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 20));
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({});
    expect(metadata).toEqual({id: 'hPP'});
  });

  it('should return the right state when clean up', () => {
    const state = cleanUp({}, {hPP: {state: 'state'}, another: {state: 'state'}});
    expect(state).toEqual({another: {state: 'state'}});
  });
});
