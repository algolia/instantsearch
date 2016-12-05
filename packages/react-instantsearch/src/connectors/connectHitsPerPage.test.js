/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectHitsPerPage';
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

describe('connectHitsPerPage', () => {
  const items = [{label: '10', value: 10}, {label: '20', value: 20}];
  it('provides the correct props to the component', () => {
    props = getProvidedProps({items}, {hitsPerPage: '10'});
    expect(props).toEqual({
      currentRefinement: 10,
      items: [{label: '10', value: 10, isRefined: true}, {
        label: '20', value: 20, isRefined: false,
      }],
    });

    props = getProvidedProps({defaultRefinement: 20, items}, {});
    expect(props).toEqual({
      currentRefinement: 20,
      items: [{
        label: '10', value: 10, isRefined: false,
      }, {label: '20', value: 20, isRefined: true}],
    });
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({}, {otherKey: 'val'}, 30);
    expect(nextState).toEqual({
      otherKey: 'val',
      hitsPerPage: 30,
    });
  });

  it('refines the hitsPerPage parameter', () => {
    const sp = new SearchParameters();

    params = getSP(sp, {}, {hitsPerPage: 10});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

    params = getSP(sp, {}, {hitsPerPage: '10'});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

    params = getSP(sp, {defaultRefinement: 20}, {});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 20));
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({});
    expect(metadata).toEqual({id: 'hitsPerPage'});
  });

  it('should return the right state when clean up', () => {
    const state = cleanUp({}, {hitsPerPage: {state: 'state'}, another: {state: 'state'}});
    expect(state).toEqual({another: {state: 'state'}});
  });
});
