/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectHierarchicalMenu';
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

describe('connectHierarchicalMenu', () => {
  it('provides the correct props to the component', () => {
    const results = {
      getFacetValues: jest.fn(),
      getFacetByName: () => true,
    };

    results.getFacetValues.mockImplementationOnce(() => ({}));
    props = getProps({attributes: ['ok']}, {ok: 'wat'}, {results});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    results.getFacetValues.mockImplementationOnce(() => ({}));
    props = getProps({attributes: ['ok'], defaultRefinement: 'wat'}, {}, {results});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    results.getFacetValues.mockImplementationOnce(() => ({}));
    props = getProps({attributes: ['ok']}, {}, {results});
    expect(props).toEqual({items: [], currentRefinement: null});

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
    props = getProps({attributes: ['ok']}, {}, {results});
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

    props = getProps({attributes: ['ok'], limitMin: 1}, {}, {results});
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
      {attributes: ['ok'], showMore: true, limitMin: 0, limitMax: 1},
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
    props = getProps({attributes: ['ok']}, {}, {});
    expect(props).toBe(null);
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({attributes: ['ok']}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      ok: 'yep',
    });
  });

  it('increases maxValuesPerFacet when it isn\'t big enough', () => {
    const initSP = new SearchParameters({maxValuesPerFacet: 100});

    params = getSP(initSP, {
      attributes: ['attribute'],
      limitMin: 101,
    }, {});
    expect(params.maxValuesPerFacet).toBe(101);

    params = getSP(initSP, {
      attributes: ['attribute'],
      showMore: true,
      limitMax: 101,
    }, {});
    expect(params.maxValuesPerFacet).toBe(101);

    params = getSP(initSP, {
      attributes: ['attribute'],
      limitMin: 99,
    }, {});
    expect(params.maxValuesPerFacet).toBe(100);

    params = getSP(initSP, {
      attributes: ['attribute'],
      showMore: true,
      limitMax: 99,
    }, {});
    expect(params.maxValuesPerFacet).toBe(100);
  });

  it('correctly applies its state to search parameters', () => {
    const initSP = new SearchParameters();

    params = getSP(initSP, {
      attributes: ['ATTRIBUTE'],
      separator: 'SEPARATOR',
      rootPath: 'ROOT_PATH',
      showParentLevel: true,
      limitMin: 1,
    }, {ATTRIBUTE: 'ok'});
    expect(params).toEqual(
      initSP
        .addHierarchicalFacet({
          name: 'ATTRIBUTE',
          attributes: ['ATTRIBUTE'],
          separator: 'SEPARATOR',
          rootPath: 'ROOT_PATH',
          showParentLevel: true,
        })
        .toggleHierarchicalFacetRefinement('ATTRIBUTE', 'ok')
        .setQueryParameter('maxValuesPerFacet', 1)
    );
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({attributes: ['ok']}, {});
    expect(metadata).toEqual({items: [], id: 'ok'});
  });

  it('registers its filter in metadata', () => {
    const metadata = getMetadata({attributes: ['ok']}, {ok: 'wat'});
    expect(metadata).toEqual({
      id: 'ok',
      items: [{
        label: 'ok: wat',
        attributeName: 'ok',
        currentRefinement: 'wat',
        // Ignore clear, we test it later
        value: metadata.items[0].value,
      }],
    });

    const state = metadata.items[0].value({ok: 'wat'});
    expect(state).toEqual({ok: ''});
  });

  it('should return the right state when clean up', () => {
    const state = cleanUp({attributes: ['name']}, {name: {state: 'state'}, another: {state: 'state'}});
    expect(state).toEqual({another: {state: 'state'}});
  });
});
