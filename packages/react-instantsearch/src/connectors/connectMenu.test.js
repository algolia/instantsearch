/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectMenu';
jest.mock('../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connect;

let props;
let params;

describe('connectMenu', () => {
  it('provides the correct props to the component', () => {
    const results = {
      getFacetValues: jest.fn(() => []),
      getFacetByName: () => true,
    };

    props = getProps({id: 'ok'}, {ok: 'wat'}, {results});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    props = getProps({attributeName: 'ok'}, {ok: 'wat'}, {results});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    props = getProps({id: 'ok', defaultRefinement: 'wat'}, {}, {results});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    props = getProps({id: 'ok'}, {}, {results});
    expect(props).toEqual({items: [], currentRefinement: null});

    results.getFacetValues.mockClear();
    const sortBy = ['my:custom:sort'];
    getProps({attributeName: 'ok', sortBy}, {}, {results});
    expect(results.getFacetValues.mock.calls[0]).toEqual(['ok', {sortBy}]);

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
    props = getProps({id: 'ok'}, {}, {results});
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

    props = getProps({id: 'ok', limitMin: 1}, {}, {results});
    expect(props.items).toEqual([
      {
        value: 'wat',
        label: 'wat',
        isRefined: true,
        count: 20,
      },
    ]);

    props = getProps(
      {id: 'ok', showMore: true, limitMin: 0, limitMax: 1},
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

  it('doesn\'t render when no results are available', () => {
    props = getProps({id: 'ok'}, {}, {});
    expect(props).toBe(null);
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({id: 'ok'}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      ok: 'yep',
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
    }, {ok: 'wat'});
    expect(params).toEqual(
      initSP
      .addDisjunctiveFacet('ok')
      .addDisjunctiveFacetRefinement('ok', 'wat')
      .setQueryParameter('maxValuesPerFacet', 1)
    );
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({id: 'ok'}, {});
    expect(metadata).toEqual({id: 'ok', filters: []});
  });

  it('registers its filter in metadata', () => {
    const metadata = getMetadata({id: 'ok', attributeName: 'wot'}, {ok: 'wat'});
    expect(metadata).toEqual({
      id: 'ok',
      filters: [{
        label: 'wot: wat',
        // Ignore clear, we test it later
        clear: metadata.filters[0].clear,
      }],
    });

    const state = metadata.filters[0].clear({ok: 'wat'});
    expect(state).toEqual({ok: ''});
  });
});
