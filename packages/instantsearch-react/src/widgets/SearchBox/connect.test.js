/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import connect from './connect';
jest.unmock('./connect');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connect;

let props;
let params;

describe('SearchBox.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps({id: 'q'}, {});
    expect(props).toEqual({query: ''});

    props = getProps({id: 'q'}, {q: 'yep'});
    expect(props).toEqual({query: 'yep'});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({id: 'ok'}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      ok: 'yep',
    });
  });

  it('refines the query parameter', () => {
    params = getSP(new SearchParameters(), {id: 'q'}, {q: 'bar'});
    expect(params.query).toBe('bar');
  });

  it('registers its filter in metadata', () => {
    let metadata = getMetadata({id: 'q'}, {});
    expect(metadata).toEqual({
      id: 'q',
      filters: [],
    });

    metadata = getMetadata({id: 'q'}, {q: 'wat'});
    expect(metadata).toEqual({
      id: 'q',
      filters: [
        {
          key: 'q',
          label: 'wat',
          hide: true,
          // Ignore clear, we test it later
          clear: metadata.filters[0].clear,
        },
      ],
    });

    const state = metadata.filters[0].clear({q: 'wat'});
    expect(state).toEqual({q: ''});
  });
});
