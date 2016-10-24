/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectHitsPerPage';
jest.mock('../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connect;

let props;
let params;

describe('connectHitsPerPage', () => {
  it('provides the correct props to the component', () => {
    props = getProps({id: 'hPP'}, {hPP: 10});
    expect(props).toEqual({currentRefinement: 10});

    props = getProps({id: 'hPP'}, {hPP: '10'});
    expect(props).toEqual({currentRefinement: 10});

    props = getProps({id: 'hPP', defaultRefinement: 20}, {});
    expect(props).toEqual({currentRefinement: 20});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({id: 'hPP'}, {otherKey: 'val'}, 30);
    expect(nextState).toEqual({
      otherKey: 'val',
      hPP: 30,
    });
  });

  it('refines the hitsPerPage parameter', () => {
    const sp = new SearchParameters();

    params = getSP(sp, {id: 'hPP'}, {hPP: 10});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

    params = getSP(sp, {id: 'hPP'}, {hPP: '10'});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

    params = getSP(sp, {id: 'hPP', defaultRefinement: 20}, {});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 20));
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({id: 'hPP'});
    expect(metadata).toEqual({id: 'hPP'});
  });
});
