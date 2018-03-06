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
      props = getProvidedProps({ attribute: 'ok' }, {}, { results });
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
      });

      props = getProvidedProps({ attribute: 'ok' }, {}, {});
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
      });

      props = getProvidedProps(
        { attribute: 'ok' },
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
        { attribute: 'ok', defaultRefinement: ['wat'] },
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
        { attribute: 'ok', searchable: true },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
        searchable: true,
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
      props = getProvidedProps({ attribute: 'ok' }, {}, { results });
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

      props = getProvidedProps({ attribute: 'ok', limit: 1 }, {}, { results });
      expect(props.items).toEqual([
        {
          value: ['wat'],
          label: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);

      props = getProvidedProps(
        { attribute: 'ok', limit: 1 },
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
        { attribute: 'ok', limit: 1 },
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
        { attribute: 'ok', showMore: true, limit: 0, showMoreLimit: 1 },
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
        { attribute: 'ok', transformItems },
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
        { attribute: 'ok' },
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
        { attribute: 'ok' },
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
          limit: 101,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(101);

      params = getSP(
        initSP,
        {
          showMore: true,
          showMoreLimit: 101,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(101);

      params = getSP(
        initSP,
        {
          limit: 99,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(100);

      params = getSP(
        initSP,
        {
          showMore: true,
          showMoreLimit: 99,
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
          attribute: 'ok',
          operator: 'or',
          limit: 1,
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
          attribute: 'ok',
          operator: 'and',
          limit: 1,
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
      const metadata = getMetadata({ attribute: 'ok' }, {});
      expect(metadata).toEqual({ id: 'ok', index: 'index', items: [] });
    });

    it('registers its filter in metadata', () => {
      const metadata = getMetadata(
        { attribute: 'wot' },
        { refinementList: { wot: ['wat', 'wut'] } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'index',
        items: [
          {
            label: 'wot: ',
            attribute: 'wot',
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
        { attribute: 'one' },
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
        { attribute: 'name' },
        {
          refinementList: { name: 'searchState', name2: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        refinementList: { name2: 'searchState' },
        another: { searchState: 'searchState' },
      });

      searchState = cleanUp({ attribute: 'name2' }, searchState);
      expect(searchState).toEqual({
        refinementList: {},
        another: { searchState: 'searchState' },
      });
    });

    it('calling searchForItems return the right searchForItems parameters with limit', () => {
      const parameters = searchForFacetValues(
        { attribute: 'ok', limit: 15, showMoreLimit: 25, showMore: false },
        {},
        'yep'
      );

      expect(parameters).toEqual({
        facetName: 'ok',
        query: 'yep',
        maxFacetHits: 15,
      });
    });

    it('calling searchForItems return the right searchForItems parameters with showMoreLimit', () => {
      const parameters = searchForFacetValues(
        { attribute: 'ok', limit: 15, showMoreLimit: 25, showMore: true },
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
      props = getProvidedProps({ attribute: 'ok' }, {}, { results });
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
      });

      props = getProvidedProps(
        { attribute: 'ok' },
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
        { attribute: 'ok' },
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
        { attribute: 'ok' },
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
          attribute: 'ok',
          operator: 'or',
          limit: 1,
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
          attribute: 'ok',
          operator: 'and',
          limit: 1,
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
        { attribute: 'wot' },
        { indices: { first: { refinementList: { wot: ['wat', 'wut'] } } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'first',
        items: [
          {
            label: 'wot: ',
            attribute: 'wot',
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
        { attribute: 'one' },
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
        { attribute: 'name' },
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

      searchState = cleanUp({ attribute: 'name2' }, searchState);
      expect(searchState).toEqual({
        indices: { first: { refinementList: {} } },
        another: { searchState: 'searchState' },
      });
    });
  });
});
