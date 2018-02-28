import { SearchParameters } from 'algoliasearch-helper';
import connect from './connectRefinementList';

jest.mock('../core/createConnector');

let props;
let params;

describe('connectRefinementList', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };

    const { searchForFacetValues } = connect;
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const refine = connect.refine.bind(context);
    const getSP = connect.getSearchParameters.bind(context);
    const getMetadata = connect.getMetadata.bind(context);
    const cleanUp = connect.cleanUp.bind(context);

    const results = {
      getFacetValues: jest.fn(() => []),
      getFacetByName: () => true,
      hits: [],
    };

    it('provides the correct props to the component', () => {
      props = getProvidedProps({ attributeName: 'ok' }, {}, { results });
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
      });

      props = getProvidedProps({ attributeName: 'ok' }, {}, {});
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
      });

      props = getProvidedProps(
        { attributeName: 'ok' },
        { refinementList: { ok: ['wat'] } },
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: ['wat'],
        isFromSearch: false,
        canRefine: false,
      });

      props = getProvidedProps(
        { attributeName: 'ok', defaultRefinement: ['wat'] },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: ['wat'],
        isFromSearch: false,
        canRefine: false,
      });

      props = getProvidedProps(
        { attributeName: 'ok', withSearchBox: true },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
        withSearchBox: true,
      });

      // searchForFacetValues is @deprecated. This test should be removed when searchForFacetValues is removed
      props = getProvidedProps(
        { attributeName: 'ok', searchForFacetValues: true },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
        withSearchBox: true,
      });

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
      props = getProvidedProps({ attributeName: 'ok' }, {}, { results });
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

      props = getProvidedProps(
        { attributeName: 'ok', limitMin: 1 },
        {},
        { results }
      );
      expect(props.items).toEqual([
        {
          value: ['wat'],
          label: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);

      props = getProvidedProps(
        { attributeName: 'ok', limitMin: 1 },
        {},
        { results },
        {},
        {
          query: 'query',
          ok: [
            {
              value: 'wat',
              count: 10,
              highlighted: 'wat',
              isRefined: false,
            },
          ],
        }
      );
      expect(props.items).toEqual([
        {
          value: ['wat'],
          label: 'wat',
          isRefined: false,
          count: 10,
          _highlightResult: { label: { value: 'wat' } },
        },
      ]);

      props = getProvidedProps(
        { attributeName: 'ok', limitMin: 1 },
        {},
        { results },
        {},
        { query: '' }
      );
      expect(props.items).toEqual([
        {
          value: ['wat'],
          label: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);

      props = getProvidedProps(
        { attributeName: 'ok', showMore: true, limitMin: 0, limitMax: 1 },
        {},
        { results }
      );
      expect(props.items).toEqual([
        {
          value: ['wat'],
          label: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);

      const transformItems = jest.fn(() => ['items']);
      props = getProvidedProps(
        { attributeName: 'ok', transformItems },
        {},
        { results }
      );
      expect(transformItems.mock.calls[0][0]).toEqual([
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
      expect(props.items).toEqual(['items']);
    });

    it('facetValues results should be provided as props if they exists', () => {
      props = getProvidedProps(
        { attributeName: 'ok' },
        {},
        { results },
        {},
        {
          ok: [
            {
              value: ['wat'],
              label: 'wat',
              isRefined: true,
              count: 20,
              highlighted: 'wat',
            },
          ],
        }
      );
      expect(props.items).toEqual([
        {
          _highlightResult: { label: { value: 'wat' } },
          count: 20,
          isRefined: true,
          label: ['wat'],
          value: [['wat']],
        },
      ]);
      expect(props.isFromSearch).toBe(true);
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = refine(
        { attributeName: 'ok' },
        { otherKey: 'val', refinementList: { otherKey: ['val'] } },
        ['yep']
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 1,
        refinementList: { ok: ['yep'], otherKey: ['val'] },
      });
    });

    it("increases maxValuesPerFacet when it isn't big enough", () => {
      const initSP = new SearchParameters({ maxValuesPerFacet: 100 });

      params = getSP(
        initSP,
        {
          limitMin: 101,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(101);

      params = getSP(
        initSP,
        {
          showMore: true,
          limitMax: 101,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(101);

      params = getSP(
        initSP,
        {
          limitMin: 99,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(100);

      params = getSP(
        initSP,
        {
          showMore: true,
          limitMax: 99,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(100);
    });

    it('correctly applies its state to search parameters', () => {
      const initSP = new SearchParameters();

      params = getSP(
        initSP,
        {
          attributeName: 'ok',
          operator: 'or',
          limitMin: 1,
        },
        { refinementList: { ok: ['wat'] } }
      );
      expect(params).toEqual(
        initSP
          .addDisjunctiveFacet('ok')
          .addDisjunctiveFacetRefinement('ok', 'wat')
          .setQueryParameter('maxValuesPerFacet', 1)
      );

      params = getSP(
        initSP,
        {
          attributeName: 'ok',
          operator: 'and',
          limitMin: 1,
        },
        { refinementList: { ok: ['wat'] } }
      );
      expect(params).toEqual(
        initSP
          .addFacet('ok')
          .addFacetRefinement('ok', 'wat')
          .setQueryParameter('maxValuesPerFacet', 1)
      );
    });

    it('registers its id in metadata', () => {
      const metadata = getMetadata({ attributeName: 'ok' }, {});
      expect(metadata).toEqual({ id: 'ok', index: 'index', items: [] });
    });

    it('registers its filter in metadata', () => {
      const metadata = getMetadata(
        { attributeName: 'wot' },
        { refinementList: { wot: ['wat', 'wut'] } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'index',
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
    });

    it('items value function should clear it from the search state', () => {
      const metadata = getMetadata(
        { attributeName: 'one' },
        { refinementList: { one: ['one1', 'one2'], two: ['two'] } }
      );

      let searchState = metadata.items[0].items[0].value({
        refinementList: { one: ['one1', 'one2'], two: ['two'] },
      });

      expect(searchState).toEqual({
        page: 1,
        refinementList: { one: ['one2'], two: ['two'] },
      });

      searchState = metadata.items[0].items[1].value(searchState);

      expect(searchState).toEqual({
        page: 1,
        refinementList: { one: '', two: ['two'] },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = cleanUp(
        { attributeName: 'name' },
        {
          refinementList: { name: 'searchState', name2: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        refinementList: { name2: 'searchState' },
        another: { searchState: 'searchState' },
      });

      searchState = cleanUp({ attributeName: 'name2' }, searchState);
      expect(searchState).toEqual({
        refinementList: {},
        another: { searchState: 'searchState' },
      });
    });

    it('calling searchForItems return the right searchForItems parameters with limitMin', () => {
      const parameters = searchForFacetValues(
        { attributeName: 'ok', limitMin: 15, limitMax: 25, showMore: false },
        {},
        'yep'
      );

      expect(parameters).toEqual({
        facetName: 'ok',
        query: 'yep',
        maxFacetHits: 15,
      });
    });

    it('calling searchForItems return the right searchForItems parameters with limitMax', () => {
      const parameters = searchForFacetValues(
        { attributeName: 'ok', limitMin: 15, limitMax: 25, showMore: true },
        {},
        'yep'
      );

      expect(parameters).toEqual({
        facetName: 'ok',
        query: 'yep',
        maxFacetHits: 25,
      });
    });
  });

  describe('multi index', () => {
    let context = {
      context: {
        ais: { mainTargetedIndex: 'first' },
        multiIndexContext: { targetedIndex: 'first' },
      },
    };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const getSP = connect.getSearchParameters.bind(context);
    const getMetadata = connect.getMetadata.bind(context);
    const cleanUp = connect.cleanUp.bind(context);

    const results = {
      first: {
        getFacetValues: jest.fn(() => []),
        getFacetByName: () => true,
      },
    };

    it('provides the correct props to the component', () => {
      props = getProvidedProps({ attributeName: 'ok' }, {}, { results });
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
      });

      props = getProvidedProps(
        { attributeName: 'ok' },
        { indices: { first: { refinementList: { ok: ['wat'] } } } },
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: ['wat'],
        isFromSearch: false,
        canRefine: false,
      });

      results.first.getFacetValues.mockClear();
      results.first.getFacetValues.mockImplementation(() => [
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
    });

    it("calling refine updates the widget's search state", () => {
      let refine = connect.refine.bind(context);

      let nextState = refine(
        { attributeName: 'ok' },
        {
          otherKey: 'val',
          indices: { first: { refinementList: { otherKey: ['val'] } } },
        },
        ['yep']
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: {
          first: {
            page: 1,
            refinementList: { ok: ['yep'], otherKey: ['val'] },
          },
        },
      });

      context = {
        context: {
          ais: { mainTargetedIndex: 'first' },
          multiIndexContext: { targetedIndex: 'second' },
        },
      };
      refine = connect.refine.bind(context);

      nextState = refine(
        { attributeName: 'ok' },
        {
          otherKey: 'val',
          indices: { first: { refinementList: { otherKey: ['val'] } } },
        },
        ['yep']
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: {
          first: { refinementList: { otherKey: ['val'] } },
          second: { page: 1, refinementList: { ok: ['yep'] } },
        },
      });
    });

    it('correctly applies its state to search parameters', () => {
      const initSP = new SearchParameters();

      params = getSP(
        initSP,
        {
          attributeName: 'ok',
          operator: 'or',
          limitMin: 1,
        },
        { indices: { first: { refinementList: { ok: ['wat'] } } } }
      );
      expect(params).toEqual(
        initSP
          .addDisjunctiveFacet('ok')
          .addDisjunctiveFacetRefinement('ok', 'wat')
          .setQueryParameter('maxValuesPerFacet', 1)
      );

      params = getSP(
        initSP,
        {
          attributeName: 'ok',
          operator: 'and',
          limitMin: 1,
        },
        { indices: { first: { refinementList: { ok: ['wat'] } } } }
      );
      expect(params).toEqual(
        initSP
          .addFacet('ok')
          .addFacetRefinement('ok', 'wat')
          .setQueryParameter('maxValuesPerFacet', 1)
      );
    });

    it('registers its filter in metadata', () => {
      const metadata = getMetadata(
        { attributeName: 'wot' },
        { indices: { first: { refinementList: { wot: ['wat', 'wut'] } } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'first',
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
    });

    it('items value function should clear it from the search state', () => {
      const metadata = getMetadata(
        { attributeName: 'one' },
        {
          indices: {
            first: { refinementList: { one: ['one1', 'one2'], two: ['two'] } },
          },
        }
      );

      let searchState = metadata.items[0].items[0].value({
        indices: {
          first: { refinementList: { one: ['one1', 'one2'], two: ['two'] } },
        },
      });

      expect(searchState).toEqual({
        indices: {
          first: { page: 1, refinementList: { one: ['one2'], two: ['two'] } },
        },
      });

      searchState = metadata.items[0].items[1].value(searchState);

      expect(searchState).toEqual({
        indices: {
          first: { page: 1, refinementList: { one: '', two: ['two'] } },
        },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = cleanUp(
        { attributeName: 'name' },
        {
          indices: {
            first: {
              refinementList: { name: 'searchState', name2: 'searchState' },
            },
          },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        indices: { first: { refinementList: { name2: 'searchState' } } },
        another: { searchState: 'searchState' },
      });

      searchState = cleanUp({ attributeName: 'name2' }, searchState);
      expect(searchState).toEqual({
        indices: { first: { refinementList: {} } },
        another: { searchState: 'searchState' },
      });
    });
  });
});
