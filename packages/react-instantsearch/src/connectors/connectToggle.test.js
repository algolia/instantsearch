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

    props = getProps({attributeName: 't'}, {toggle: {t: true}});
    expect(props).toEqual({checked: true});

    props = getProps({defaultRefinement: true, attributeName: 't'}, {});
    expect(props).toEqual({checked: true});
  });

  it('calling refine updates the widget\'s state', () => {
    let state = refine({attributeName: 't'}, {otherKey: 'val'}, true);
    expect(state).toEqual({
      otherKey: 'val',
      toggle: {t: true},
    });

    state = refine({attributeName: 't'}, {otherKey: 'val'}, false);
    expect(state).toEqual({
      otherKey: 'val',
      toggle: {t: false},
    });
  });

  it('refines the corresponding facet', () => {
    params = getSP(new SearchParameters(), {
      attributeName: 'facet',
      value: 'val',
    }, {toggle: {facet: true}});
    expect(params.getConjunctiveRefinements('facet')).toEqual(['val']);
  });

  it('applies the provided filter', () => {
    params = getSP(new SearchParameters(), {
      attributeName: 'facet',
      filter: sp => sp.setQuery('yep'),
    }, {toggle: {facet: true}});
    expect(params.query).toEqual('yep');
  });

  it('registers its filter in metadata', () => {
    let metadata = getMetadata({attributeName: 't'}, {});
    expect(metadata).toEqual({
      items: [],
      id: 't',
    });

    metadata = getMetadata({attributeName: 't', label: 'yep'}, {toggle: {t: true}});
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

    const state = metadata.items[0].value({toggle: {t: true}});
    expect(state).toEqual({toggle: {t: false}});
  });

  it('should return the right state when clean up', () => {
    let state = cleanUp({attributeName: 'name'}, {
      toggle: {name: 'state', name2: 'state'},
      another: {state: 'state'},
    });
    expect(state).toEqual({toggle: {name2: 'state'}, another: {state: 'state'}});

    state = cleanUp({attributeName: 'name2'}, state);
    expect(state).toEqual({another: {state: 'state'}});
  });
});
