/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectToggle';
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

describe('connectToggle', () => {
  it('provides the correct props to the component', () => {
    props = getProvidedProps({attributeName: 't'}, {});
    expect(props).toEqual({checked: false});

    props = getProvidedProps({attributeName: 't'}, {toggle: {t: true}});
    expect(props).toEqual({checked: true});

    props = getProvidedProps({defaultRefinement: true, attributeName: 't'}, {});
    expect(props).toEqual({checked: true});
  });

  it('calling refine updates the widget\'s search state', () => {
    let searchState = refine({attributeName: 't'}, {otherKey: 'val', toggle: {otherKey: false}}, true);
    expect(searchState).toEqual({
      otherKey: 'val',
      toggle: {t: true, otherKey: false},
    });

    searchState = refine({attributeName: 't'}, {otherKey: 'val'}, false);
    expect(searchState).toEqual({
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

    const searchState = metadata.items[0].value({toggle: {t: true}});
    expect(searchState).toEqual({toggle: {t: false}});
  });

  it('should return the right searchState when clean up', () => {
    let searchState = cleanUp({attributeName: 'name'}, {
      toggle: {name: 'searchState', name2: 'searchState'},
      another: {searchState: 'searchState'},
    });
    expect(searchState).toEqual({toggle: {name2: 'searchState'}, another: {searchState: 'searchState'}});

    searchState = cleanUp({attributeName: 'name2'}, searchState);
    expect(searchState).toEqual({another: {searchState: 'searchState'}});
  });
});
