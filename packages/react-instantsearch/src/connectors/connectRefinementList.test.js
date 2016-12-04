/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectRefinementList';
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

describe('connectRefinementList', () => {
  it('provides the correct props to the component', () => {
    const results = {
      getFacetValues: jest.fn(() => []),
      getFacetByName: () => true,
    };

    props = getProvidedProps({attributeName: 'ok'}, {}, {results});
    expect(props).toEqual({items: [], currentRefinement: []});

    props = getProvidedProps({attributeName: 'ok'}, {refinementList: {ok: ['wat']}}, {results});
    expect(props).toEqual({items: [], currentRefinement: ['wat']});

    props = getProvidedProps({attributeName: 'ok', defaultRefinement: ['wat']}, {}, {results});
    expect(props).toEqual({items: [], currentRefinement: ['wat']});

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
        value: ['wat'],
        label: 'wat',
        isRefined: true,
        count: 20,
      },
      {
        value: ['oy'],
        label: 'oy',
        isRefined: false,
        count: 10,
      },
    ]);

    props = getProvidedProps({attributeName: 'ok', limitMin: 1}, {}, {results});
    expect(props.items).toEqual([
      {
        value: ['wat'],
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
        value: ['wat'],
        label: 'wat',
        isRefined: true,
        count: 20,
      },
    ]);
  });

  it('doesn\'t render when no results are available', () => {
    props = getProvidedProps({attributeName: 'ok'}, {}, {});
    expect(props).toBe(null);
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({attributeName: 'ok'}, {otherKey: 'val'}, ['yep']);
    expect(nextState).toEqual({
      otherKey: 'val',
      refinementList: {ok: ['yep']},
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
      operator: 'or',
      limitMin: 1,
    }, {refinementList: {ok: ['wat']}});
    expect(params).toEqual(
      initSP
        .addDisjunctiveFacet('ok')
        .addDisjunctiveFacetRefinement('ok', 'wat')
        .setQueryParameter('maxValuesPerFacet', 1)
    );

    params = getSP(initSP, {
      attributeName: 'ok',
      operator: 'and',
      limitMin: 1,
    }, {refinementList: {ok: ['wat']}});
    expect(params).toEqual(
      initSP
        .addFacet('ok')
        .addFacetRefinement('ok', 'wat')
        .setQueryParameter('maxValuesPerFacet', 1)
    );
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({attributeName: 'ok'}, {});
    expect(metadata).toEqual({id: 'ok', items: []});
  });

  it('registers its filter in metadata', () => {
    const metadata = getMetadata(
      {attributeName: 'wot'},
      {refinementList: {wot: ['wat', 'wut']}}
    );
    expect(metadata).toEqual({
      id: 'wot',
      items: [
        {
          label: 'wot: ',
          attributeName: 'wot',
          currentRefinement: ['wat', 'wut'],
          value: metadata.items[0].value,
          items: [
            {
              label: 'wat',
              value: metadata.items[0].items[0].value,
            },
            {
              label: 'wut',
              value: metadata.items[0].items[1].value,
            },
          ],
          // Ignore value, we test it later
        },
      ],
    });

    let state = metadata.items[0].items[0].value({refinementList: {wot: ['wat', 'wut']}});
    expect(state).toEqual({refinementList: {wot: ['wut']}});
    state = metadata.items[0].items[1].value(state);
    expect(state).toEqual({refinementList: {wot: ''}});
  });

  it('should return the right state when clean up', () => {
    let state = cleanUp({attributeName: 'name'}, {
      refinementList: {name: 'state', name2: 'state'},
      another: {state: 'state'},
    });
    expect(state).toEqual({refinementList: {name2: 'state'}, another: {state: 'state'}});

    state = cleanUp({attributeName: 'name2'}, state);
    expect(state).toEqual({another: {state: 'state'}});
  });
});
