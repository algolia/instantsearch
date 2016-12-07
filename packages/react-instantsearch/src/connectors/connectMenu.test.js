/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectMenu';
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

describe('connectMenu', () => {
  it('provides the correct props to the component', () => {
    const results = {
      getFacetValues: jest.fn(() => []),
      getFacetByName: () => true,
    };

    props = getProvidedProps({attributeName: 'ok'}, {menu: {ok: 'wat'}}, {results});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    props = getProvidedProps({attributeName: 'ok'}, {menu: {ok: 'wat'}}, {results});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    props = getProvidedProps({attributeName: 'ok', defaultRefinement: 'wat'}, {}, {results});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    props = getProvidedProps({attributeName: 'ok'}, {}, {results});
    expect(props).toEqual({items: [], currentRefinement: null});

    results.getFacetValues.mockClear();
    results.getFacetValues.mockImplementation(() => [
      {
        name: 'wat',
        isRefined: true,
        count: 20,
      },
      {
        name: 'oy',
        isRefined: false,
        count: 10,
      },
    ]);
    props = getProvidedProps({attributeName: 'ok'}, {}, {results});
    expect(props.items).toEqual([
      {
        value: 'wat',
        label: 'wat',
        isRefined: true,
        count: 20,
      },
      {
        value: 'oy',
        label: 'oy',
        isRefined: false,
        count: 10,
      },
    ]);

    props = getProvidedProps({attributeName: 'ok', limitMin: 1}, {}, {results});
    expect(props.items).toEqual([
      {
        value: 'wat',
        label: 'wat',
        isRefined: true,
        count: 20,
      },
    ]);

    props = getProvidedProps(
      {attributeName: 'ok', showMore: true, limitMin: 0, limitMax: 1},
      {},
      {results}
    );
    expect(props.items).toEqual([
      {
        value: 'wat',
        label: 'wat',
        isRefined: true,
        count: 20,
      },
    ]);
  });

  it('if an item is equal to the currentRefinement, its value should be an empty string', () => {
    const results = {
      getFacetValues: jest.fn(() => []),
      getFacetByName: () => true,
    };
    results.getFacetValues.mockImplementation(() => [
      {
        name: 'wat',
        isRefined: true,
        count: 20,
      },
    ]);

    props = getProvidedProps({attributeName: 'ok'}, {menu: {ok: 'wat'}}, {results});

    expect(props.items).toEqual([{
      value: '',
      label: 'wat',
      isRefined: true,
      count: 20,
    }]);
  });

  it('doesn\'t render when no results are available', () => {
    props = getProvidedProps({attributeName: 'ok'}, {}, {});
    expect(props).toBe(null);
  });

  it('calling refine updates the widget\'s search state', () => {
    const nextState = refine({attributeName: 'ok'}, {otherKey: 'val', menu: {otherKey: 'val'}}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      menu: {ok: 'yep', otherKey: 'val'},
    });
  });

  it('increases maxValuesPerFacet when it isn\'t big enough', () => {
    const initSP = new SearchParameters({maxValuesPerFacet: 100});

    params = getSP(initSP, {
      limitMin: 101,
    }, {});
    expect(params.maxValuesPerFacet).toBe(101);

    params = getSP(initSP, {
      showMore: true,
      limitMax: 101,
    }, {});
    expect(params.maxValuesPerFacet).toBe(101);

    params = getSP(initSP, {
      limitMin: 99,
    }, {});
    expect(params.maxValuesPerFacet).toBe(100);

    params = getSP(initSP, {
      showMore: true,
      limitMax: 99,
    }, {});
    expect(params.maxValuesPerFacet).toBe(100);
  });

  it('correctly applies its state to search parameters', () => {
    const initSP = new SearchParameters();

    params = getSP(initSP, {
      attributeName: 'ok',
      limitMin: 1,
    }, {menu: {ok: 'wat'}});
    expect(params).toEqual(
      initSP
        .addDisjunctiveFacet('ok')
        .addDisjunctiveFacetRefinement('ok', 'wat')
        .setQueryParameter('maxValuesPerFacet', 1)
    );
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({attributeName: 'ok'}, {});
    expect(metadata).toEqual({id: 'ok', items: []});
  });

  it('registers its filter in metadata', () => {
    const metadata = getMetadata({attributeName: 'wot'}, {menu: {wot: 'wat'}});
    expect(metadata).toEqual({
      id: 'wot',
      items: [{
        label: 'wot: wat',
        attributeName: 'wot',
        currentRefinement: 'wat',
        // Ignore clear, we test it later
        value: metadata.items[0].value,
      }],
    });

    const searchState = metadata.items[0].value({menu: {wot: 'wat'}});
    expect(searchState).toEqual({menu: {wot: ''}});
  });

  it('should return the right searchState when clean up', () => {
    let searchState = cleanUp({attributeName: 'name'}, {
      menu: {name: 'searchState', name2: 'searchState'},
      another: {searchState: 'searchState'},
    });
    expect(searchState).toEqual({menu: {name2: 'searchState'}, another: {searchState: 'searchState'}});

    searchState = cleanUp({attributeName: 'name2'}, searchState);
    expect(searchState).toEqual({another: {searchState: 'searchState'}});
  });
});
