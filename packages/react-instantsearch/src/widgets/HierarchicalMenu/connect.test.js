/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connect';
jest.mock('../../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connect;

let props;
let params;

describe('HierarchicalMenu.connect', () => {
  it('provides the correct props to the component', () => {
    const results = {
      getFacetValues: jest.fn(),
      getFacetByName: () => true,
    };

    results.getFacetValues.mockImplementationOnce(() => ({}));
    props = getProps({id: 'ok'}, {ok: 'wat'}, {results});
    expect(props).toEqual({items: [], selectedItem: 'wat'});

    results.getFacetValues.mockImplementationOnce(() => ({}));
    props = getProps({id: 'ok', defaultSelectedItem: 'wat'}, {}, {results});
    expect(props).toEqual({items: [], selectedItem: 'wat'});

    results.getFacetValues.mockImplementationOnce(() => ({}));
    props = getProps({id: 'ok'}, {}, {results});
    expect(props).toEqual({items: [], selectedItem: null});

    results.getFacetValues.mockClear();
    results.getFacetValues.mockImplementationOnce(() => ({}));
    const sortBy = ['my:custom:sort'];
    getProps({id: 'ok', sortBy}, {}, {results});
    expect(results.getFacetValues.mock.calls[0]).toEqual(['ok', {sortBy}]);

    results.getFacetValues.mockClear();
    results.getFacetValues.mockImplementation(() => ({
      data: [
        {
          name: 'wat',
          path: 'wat',
          count: 20,
          data: [
            {
              name: 'wot',
              path: 'wat > wot',
              count: 15,
            },
            {
              name: 'wut',
              path: 'wat > wut',
              count: 5,
            },
          ],
        },
        {
          name: 'oy',
          path: 'oy',
          count: 10,
        },
      ],
    }));
    props = getProps({id: 'ok'}, {}, {results});
    expect(props.items).toEqual([
      {
        label: 'wat',
        value: 'wat',
        count: 20,
        children: [
          {
            label: 'wot',
            value: 'wat > wot',
            count: 15,
          },
          {
            label: 'wut',
            value: 'wat > wut',
            count: 5,
          },
        ],
      },
      {
        label: 'oy',
        value: 'oy',
        count: 10,
      },
    ]);

    props = getProps({id: 'ok', limitMin: 1}, {}, {results});
    expect(props.items).toEqual([
      {
        label: 'wat',
        value: 'wat',
        count: 20,
        children: [
          {
            label: 'wot',
            value: 'wat > wot',
            count: 15,
          },
        ],
      },
    ]);

    props = getProps(
      {id: 'ok', showMore: true, limitMin: 0, limitMax: 1},
      {},
      {results}
    );
    expect(props.items).toEqual([
      {
        label: 'wat',
        value: 'wat',
        count: 20,
        children: [
          {
            label: 'wot',
            value: 'wat > wot',
            count: 15,
          },
        ],
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
      id: 'NAME',
      attributes: ['ATTRIBUTE'],
      separator: 'SEPARATOR',
      rootPath: 'ROOT_PATH',
      showParentLevel: true,
      limitMin: 1,
    }, {NAME: 'ok'});
    expect(params).toEqual(
      initSP
      .addHierarchicalFacet({
        name: 'NAME',
        attributes: ['ATTRIBUTE'],
        separator: 'SEPARATOR',
        rootPath: 'ROOT_PATH',
        showParentLevel: true,
      })
      .toggleHierarchicalFacetRefinement('NAME', 'ok')
      .setQueryParameter('maxValuesPerFacet', 1)
    );
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({id: 'ok'}, {});
    expect(metadata).toEqual({id: 'ok', filters: []});
  });

  it('registers its filter in metadata', () => {
    const metadata = getMetadata({id: 'ok'}, {ok: 'wat'});
    expect(metadata).toEqual({
      id: 'ok',
      filters: [{
        key: 'ok.wat',
        label: 'ok: wat',
        // Ignore clear, we test it later
        clear: metadata.filters[0].clear,
      }],
    });

    const state = metadata.filters[0].clear({ok: 'wat'});
    expect(state).toEqual({ok: ''});
  });
});
