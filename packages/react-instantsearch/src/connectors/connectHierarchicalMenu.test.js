/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectHierarchicalMenu';
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

describe('connectHierarchicalMenu', () => {
  it('provides the correct props to the component', () => {
    const results = {
      getFacetValues: jest.fn(),
      getFacetByName: () => true,
    };

    results.getFacetValues.mockImplementationOnce(() => ({}));
    props = getProvidedProps({attributes: ['ok']}, {hierarchicalMenu: {ok: 'wat'}}, {results});
    expect(props).toEqual({canRefine: false, currentRefinement: 'wat', items: []});

    props = getProvidedProps({attributes: ['ok']}, {}, {});
    expect(props).toEqual({canRefine: false, currentRefinement: null, items: []});

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
    props = getProvidedProps({attributes: ['ok']}, {}, {results});
    expect(props.items).toEqual([
      {
        label: 'wat',
        value: 'wat',
        count: 20,
        items: [
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

    props = getProvidedProps({attributes: ['ok'], limitMin: 1}, {}, {results});
    expect(props.items).toEqual([
      {
        label: 'wat',
        value: 'wat',
        count: 20,
        items: [
          {
            label: 'wot',
            value: 'wat > wot',
            count: 15,
          },
        ],
      },
    ]);

    props = getProvidedProps(
      {attributes: ['ok'], showMore: true, limitMin: 0, limitMax: 1},
      {},
      {results}
    );
    expect(props.items).toEqual([
      {
        label: 'wat',
        value: 'wat',
        count: 20,
        items: [
          {
            label: 'wot',
            value: 'wat > wot',
            count: 15,
          },
        ],
      },
    ]);

    const transformItems = jest.fn(() => ['items']);
    props = getProvidedProps({attributes: ['ok'], transformItems}, {}, {results});
    expect(transformItems.mock.calls[0][0]).toEqual([
      {
        label: 'wat',
        value: 'wat',
        count: 20,
        items: [
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
    expect(props.items).toEqual(['items']);
  });

  it('calling refine updates the widget\'s search state', () => {
    const nextState = refine({attributes: ['ok']}, {otherKey: 'val', hierarchicalMenu: {otherKey: 'val'}}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      hierarchicalMenu: {ok: 'yep', otherKey: 'val'},
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
    }, {hierarchicalMenu: {ATTRIBUTE: 'ok'}});
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
    const metadata = getMetadata({attributes: ['ok']}, {hierarchicalMenu: {ok: 'wat'}});
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
  });

  it('items value function should clear it from the search state', () => {
    const metadata = getMetadata({attributes: ['one']}, {hierarchicalMenu: {one: 'one', two: 'two'}});

    const searchState = metadata.items[0].value({hierarchicalMenu: {one: 'one', two: 'two'}});

    expect(searchState).toEqual({hierarchicalMenu: {one: '', two: 'two'}});
  });

  it('should return the right searchState when clean up', () => {
    let searchState = cleanUp({attributes: ['name']}, {
      hierarchicalMenu: {name: 'searchState', name2: 'searchState'},
      another: {searchState: 'searchState'},
    });
    expect(searchState).toEqual({hierarchicalMenu: {name2: 'searchState'}, another: {searchState: 'searchState'}});

    searchState = cleanUp({attributes: ['name2']}, searchState);
    expect(searchState).toEqual({another: {searchState: 'searchState'}});
  });
});
