/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectToggle';
jest.mock('../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connect;

let props;
let params;

describe('connectToggle', () => {
  it('provides the correct props to the component', () => {
    props = getProps({id: 't'}, {});
    expect(props).toEqual({checked: false});

    props = getProps({id: 't'}, {t: 'on'});
    expect(props).toEqual({checked: true});

    props = getProps({id: 't', defaultRefinement: true}, {});
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
      items: [],
      id: 't',
    });

    metadata = getMetadata({attributeName: 't', id: 't', label: 'yep'}, {t: 'on'});
    expect(metadata).toEqual({
      items: [
        {
          label: 'yep',
          // Ignore clear, we test it later
          value: metadata.items[0].value,
          attributeName: 't',
          currentRefinement: 'yep',
        },
      ],
      id: 't',
    });

    const state = metadata.items[0].value({t: 'on'});
    expect(state).toEqual({t: 'off'});
  });
});
