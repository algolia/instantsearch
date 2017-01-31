/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectMultiRange';
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

describe('connectMultiRange', () => {
  it('provides the correct props to the component', () => {
    let results = {
      getFacetStats: () => ({min: 0, max: 300}),
      getFacetByName: () => true,
    };

    props = getProvidedProps({
      items: [
        {label: 'All'},
      ],
    }, {}, {results});
    expect(props).toEqual({
      items: [
        {label: 'All', value: '', isRefined: true, noRefinement: false},
      ],
      currentRefinement: '',
      canRefine: true,
    });

    props = getProvidedProps({
      items: [
        {label: 'All'},
        {label: 'Ok', start: 100},
      ],
    }, {}, {results});
    expect(props).toEqual({
      items: [
        {label: 'All', value: '', isRefined: true, noRefinement: false},
        {label: 'Ok', value: '100:', isRefined: false, noRefinement: false},
      ],
      currentRefinement: '',
      canRefine: true,
    });

    props = getProvidedProps({
      items: [
        {label: 'All'},
        {label: 'Not ok', end: 200},
      ],
    }, {}, {results});
    expect(props).toEqual({
      items: [
        {label: 'All', value: '', isRefined: true, noRefinement: false},
        {label: 'Not ok', value: ':200', isRefined: false, noRefinement: false},
      ],
      currentRefinement: '',
      canRefine: true,
    });

    props = getProvidedProps({
      items: [
        {label: 'All'},
        {label: 'Ok', start: 100},
        {label: 'Not ok', end: 200},
        {label: 'Maybe ok?', start: 100, end: 200},
      ],
    }, {}, {results});
    expect(props).toEqual({
      items: [
        {label: 'All', value: '', isRefined: true, noRefinement: false},
        {label: 'Ok', value: '100:', isRefined: false, noRefinement: false},
        {label: 'Not ok', value: ':200', isRefined: false, noRefinement: false},
        {label: 'Maybe ok?', value: '100:200', isRefined: false, noRefinement: false},
      ],
      currentRefinement: '',
      canRefine: true,
    });

    it('no items define', () => {
      props = getProvidedProps({attributeName: 'ok', items: []}, {multiRange: {ok: 'wat'}}, {});
      expect(props).toEqual({items: [], currentRefinement: 'wat', canRefine: false});

      props = getProvidedProps({attributeName: 'ok', items: []}, {multiRange: {ok: 'wat'}}, {});
      expect(props).toEqual({items: [], currentRefinement: 'wat', canRefine: false});

      props = getProvidedProps({attributeName: 'ok', items: [], defaultRefinement: 'wat'}, {}, {});
      expect(props).toEqual({items: [], currentRefinement: 'wat', canRefine: false});
    });

    it('use the transform items props if passed', () => {
      const transformItems = jest.fn(() => ['items']);
      props = getProvidedProps({
        items: [
        {label: 'All'},
        {label: 'Ok', start: 100},
        {label: 'Not ok', end: 200},
        {label: 'Maybe ok?', start: 100, end: 200},
        ],
        transformItems,
      }, {}, {results});
      expect(transformItems.mock.calls[0][0]).toEqual([
        {label: 'All', value: '', isRefined: true, noRefinement: false},
        {label: 'Ok', value: '100:', isRefined: false, noRefinement: false},
        {label: 'Not ok', value: ':200', isRefined: false, noRefinement: false},
        {label: 'Maybe ok?', value: '100:200', isRefined: false, noRefinement: false},
      ]);
      expect(props.items).toEqual(['items']);
    });

    it('compute the no refinement value for each item range when stats exists', () => {
      results = {
        getFacetStats: () => ({min: 250, max: 300}),
        getFacetByName: () => true,
      };

      props = getProvidedProps({
        items: [
          {label: '1', start: 100},
          {label: '2', start: 400},
          {label: '3', end: 200},
          {label: '4', start: 100, end: 200},
        ],
      }, {}, {results});
      expect(props).toEqual({
        items: [
          {label: '1', value: '100:', isRefined: false, noRefinement: false},
          {label: '2', value: '400:', isRefined: false, noRefinement: true},
          {label: '3', value: ':200', isRefined: false, noRefinement: true},
          {label: '4', value: '100:200', isRefined: false, noRefinement: true},
        ],
        currentRefinement: '',
        canRefine: true,
      });
    });
  });

  it('calling refine updates the widget\'s search state', () => {
    const nextState = refine({attributeName: 'ok'}, {otherKey: 'val', multiRange: {otherKey: 'val'}}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      multiRange: {ok: 'yep', otherKey: 'val'},
    });
  });

  it('refines the corresponding numeric facet', () => {
    const initSP = new SearchParameters();

    params = getSP(initSP, {attributeName: 'facet'}, {facet: ''});
    expect(params.getNumericRefinements('facet')).toEqual({});

    params = getSP(initSP, {attributeName: 'facet'}, {multiRange: {facet: '100:'}});
    expect(params.getNumericRefinements('facet')).toEqual({
      '>=': [100],
    });

    params = getSP(initSP, {attributeName: 'facet'}, {multiRange: {facet: ':200'}});
    expect(params.getNumericRefinements('facet')).toEqual({
      '<=': [200],
    });

    params = getSP(initSP, {attributeName: 'facet'}, {multiRange: {facet: '100:200'}});
    expect(params.getNumericRefinements('facet')).toEqual({
      '>=': [100],
      '<=': [200],
    });
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({attributeName: 'ok'}, {});
    expect(metadata).toEqual({id: 'ok', items: []});
  });

  it('registers its filter in metadata', () => {
    const metadata = getMetadata(
      {
        attributeName: 'wot',
        items: [{
          label: 'YAY',
          start: 100,
          end: 200,
        }],
      },
      {multiRange: {wot: '100:200'}}
    );
    expect(metadata).toEqual({
      id: 'wot',
      items: [{
        label: 'wot: YAY',
        // Ignore clear, we test it later
        value: metadata.items[0].value,
        attributeName: 'wot',
        currentRefinement: 'YAY',
      }],
    });
  });

  it('items value function should clear it from the search state', () => {
    const metadata = getMetadata(
      {
        attributeName: 'one',
        items: [{
          label: 'YAY',
          start: 100,
          end: 200,
        }],
      },
      {multiRange: {one: '100:200', two: '200:400'}}
    );

    const searchState = metadata.items[0].value({multiRange: {one: '100:200', two: '200:400'}});

    expect(searchState).toEqual({multiRange: {one: '', two: '200:400'}});
  });

  it('should return the right searchState when clean up', () => {
    let searchState = cleanUp({attributeName: 'name'}, {
      multiRange: {name: 'searchState', name2: 'searchState'},
      another: {searchState: 'searchState'},
    });
    expect(searchState).toEqual({multiRange: {name2: 'searchState'}, another: {searchState: 'searchState'}});

    searchState = cleanUp({attributeName: 'name2'}, searchState);
    expect(searchState).toEqual({another: {searchState: 'searchState'}});
  });
});
