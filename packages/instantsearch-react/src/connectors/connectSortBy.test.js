/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import connectSortBy from './connectSortBy';
jest.unmock('./connectSortBy');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connectSortBy;

let props;
let params;

describe('connectSortBy', () => {
  it('provides the correct props to the component', () => {
    props = getProps({id: 'i'}, {});
    expect(props).toEqual({selectedIndex: null});

    props = getProps({id: 'i'}, {i: 'yep'});
    expect(props).toEqual({selectedIndex: 'yep'});

    props = getProps({id: 'i', defaultSelectedIndex: 'yep'}, {});
    expect(props).toEqual({selectedIndex: 'yep'});
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
