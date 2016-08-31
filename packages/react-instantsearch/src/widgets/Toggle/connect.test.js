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

describe('Toggle.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps({id: 't'}, {});
    expect(props).toEqual({checked: false});

    props = getProps({id: 't'}, {t: 'on'});
    expect(props).toEqual({checked: true});

    props = getProps({id: 't', defaultChecked: true}, {});
    expect(props).toEqual({checked: true});
  });

  it('calling refine updates the widget\'s state', () => {
    let state = refine({id: 'ok'}, {otherKey: 'val'}, true);
    expect(state).toEqual({
      otherKey: 'val',
      ok: 'on',
    });

    state = refine({id: 'ok'}, {otherKey: 'val'}, false);
    expect(state).toEqual({
      otherKey: 'val',
      ok: 'off',
    });
  });

  it('refines the corresponding facet', () => {
    params = getSP(new SearchParameters(), {
      id: 't',
      attributeName: 'facet',
      value: 'val',
    }, {t: 'on'});
    expect(params.getConjunctiveRefinements('facet')).toEqual(['val']);
  });

  it('applies the provided filter', () => {
    params = getSP(new SearchParameters(), {
      id: 't',
      filter: sp => sp.setQuery('yep'),
    }, {t: 'on'});
    expect(params.query).toEqual('yep');
  });

  it('registers its filter in metadata', () => {
    let metadata = getMetadata({id: 't'}, {});
    expect(metadata).toEqual({
      id: 't',
      filters: [],
    });

    metadata = getMetadata({id: 't', label: 'yep'}, {t: 'on'});
    expect(metadata).toEqual({
      id: 't',
      filters: [
        {
          key: 't',
          label: 'yep',
          // Ignore clear, we test it later
          clear: metadata.filters[0].clear,
        },
      ],
    });

    const state = metadata.filters[0].clear({t: 'on'});
    expect(state).toEqual({t: 'off'});
  });
});
