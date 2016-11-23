/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectToggle';
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

describe('connectToggle', () => {
  it('provides the correct props to the component', () => {
    props = getProps({attributeName: 't'}, {});
    expect(props).toEqual({checked: false});

    props = getProps({attributeName: 't'}, {t: 'on'});
    expect(props).toEqual({checked: true});

    props = getProps({defaultRefinement: true, attributeName: 't'}, {});
    expect(props).toEqual({checked: true});
  });

  it('calling refine updates the widget\'s state', () => {
    let state = refine({attributeName: 't'}, {otherKey: 'val'}, true);
    expect(state).toEqual({
      otherKey: 'val',
      t: 'on',
    });

    state = refine({attributeName: 't'}, {otherKey: 'val'}, false);
    expect(state).toEqual({
      otherKey: 'val',
      t: 'off',
    });
  });

  it('refines the corresponding facet', () => {
    params = getSP(new SearchParameters(), {
      attributeName: 'facet',
      value: 'val',
    }, {facet: 'on'});
    expect(params.getConjunctiveRefinements('facet')).toEqual(['val']);
  });

  it('applies the provided filter', () => {
    params = getSP(new SearchParameters(), {
      attributeName: 'facet',
      filter: sp => sp.setQuery('yep'),
    }, {facet: 'on'});
    expect(params.query).toEqual('yep');
  });

  it('registers its filter in metadata', () => {
    let metadata = getMetadata({attributeName: 't'}, {});
    expect(metadata).toEqual({
      items: [],
      id: 't',
    });

    metadata = getMetadata({attributeName: 't', label: 'yep'}, {t: 'on'});
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

  it('should return the right state when clean up', () => {
    const state = cleanUp({attributeName: 'name'}, {name: {state: 'state'}, another: {state: 'state'}});
    expect(state).toEqual({another: {state: 'state'}});
  });
});
