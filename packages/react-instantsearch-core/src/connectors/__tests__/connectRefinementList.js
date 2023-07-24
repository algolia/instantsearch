import { SearchResults, SearchParameters } from 'algoliasearch-helper';

import connect from '../connectRefinementList';

jest.mock('../../core/createConnector', () => (x) => x);

let props;
let params;

describe('connectRefinementList', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    const results = {
      getFacetValues: jest.fn(() => []),
      getFacetByName: () => true,
      hits: [],
    };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
        {},
        {}
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
        { refinementList: { ok: ['wat'] } },
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: ['wat'],
        isFromSearch: false,
        canRefine: false,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', defaultRefinement: ['wat'], contextValue },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: ['wat'],
        isFromSearch: false,
        canRefine: false,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', searchable: true, contextValue },
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
          escapedValue: 'wat',
          isRefined: true,
          count: 20,
        },
        {
          name: 'oy',
          escapedValue: 'oy',
          isRefined: false,
          count: 10,
        },
      ]);
      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
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
        {
          value: ['oy'],
          label: 'oy',
          isRefined: false,
          count: 10,
        },
      ]);

      props = connect.getProvidedProps(
        { attribute: 'ok', limit: 1, contextValue },
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

      props = connect.getProvidedProps(
        { attribute: 'ok', limit: 1, contextValue },
        {},
        { results },
        {},
        {
          query: 'query',
          ok: [
            {
              value: 'wat',
              escapedValue: 'wat',
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

      props = connect.getProvidedProps(
        { attribute: 'ok', limit: 1, contextValue },
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

      props = connect.getProvidedProps(
        {
          attribute: 'ok',
          showMore: true,
          limit: 0,
          showMoreLimit: 1,
          contextValue,
        },
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
      props = connect.getProvidedProps(
        { attribute: 'ok', transformItems, contextValue },
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
      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
        {},
        { results },
        {},
        {
          ok: [
            {
              value: 'wat',
              escapedValue: 'wat',
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
          label: 'wat',
          value: ['wat'],
        },
      ]);
      expect(props.isFromSearch).toBe(true);
    });

    it('facetValues have facetOrdering by default', () => {
      const userProps = {
        ...connect.defaultProps,
        attribute: 'ok',
        contextValue,
      };
      const searchState = {
        refinementList: { ok: ['wat'] },
      };
      const parameters = connect.getSearchParameters(
        new SearchParameters(),
        userProps,
        searchState
      );

      const searchResults = new SearchResults(parameters, [
        {
          hits: [],
          renderingContent: {
            facetOrdering: {
              values: {
                ok: {
                  order: ['lol'],
                },
              },
            },
          },
          facets: {
            ok: {
              wat: 20,
              lol: 2000,
            },
          },
        },
      ]);

      const providedProps = connect.getProvidedProps(userProps, searchState, {
        results: searchResults,
      });

      expect(providedProps.items).toEqual([
        {
          count: 2000,
          isRefined: false,
          label: 'lol',
          value: ['wat', 'lol'],
        },
        {
          count: 20,
          isRefined: true,
          label: 'wat',
          value: [],
        },
      ]);
      expect(providedProps.isFromSearch).toBe(false);
    });

    it('facetValues results does not use facetOrdering if disabled', () => {
      const userProps = { attribute: 'ok', facetOrdering: false, contextValue };
      const searchState = {
        refinementList: { ok: ['wat'] },
      };
      const parameters = connect.getSearchParameters(
        new SearchParameters(),
        userProps,
        searchState
      );

      const searchResults = new SearchResults(parameters, [
        {
          hits: [],
          renderingContent: {
            facetOrdering: {
              values: {
                ok: {
                  order: ['lol'],
                },
              },
            },
          },
          facets: {
            ok: {
              wat: 20,
              lol: 2000,
            },
          },
        },
      ]);

      const providedProps = connect.getProvidedProps(userProps, searchState, {
        results: searchResults,
      });

      expect(providedProps.items).toEqual([
        {
          count: 20,
          isRefined: true,
          label: 'wat',
          value: [],
        },
        {
          count: 2000,
          isRefined: false,
          label: 'lol',
          value: ['wat', 'lol'],
        },
      ]);
      expect(providedProps.isFromSearch).toBe(false);
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = connect.refine(
        { attribute: 'ok', contextValue },
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

      params = connect.getSearchParameters(
        initSP,
        {
          limit: 101,
          contextValue,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(101);

      params = connect.getSearchParameters(
        initSP,
        {
          showMore: true,
          showMoreLimit: 101,
          contextValue,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(101);

      params = connect.getSearchParameters(
        initSP,
        {
          limit: 99,
          contextValue,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(100);

      params = connect.getSearchParameters(
        initSP,
        {
          showMore: true,
          showMoreLimit: 99,
          contextValue,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(100);
    });

    it('correctly applies its state to search parameters', () => {
      const initSP = new SearchParameters();

      params = connect.getSearchParameters(
        initSP,
        {
          attribute: 'ok',
          operator: 'or',
          limit: 1,
          contextValue,
        },
        { refinementList: { ok: ['wat'] } }
      );
      expect(params).toEqual(
        initSP
          .addDisjunctiveFacet('ok')
          .addDisjunctiveFacetRefinement('ok', 'wat')
          .setQueryParameter('maxValuesPerFacet', 1)
      );

      params = connect.getSearchParameters(
        initSP,
        {
          attribute: 'ok',
          operator: 'and',
          limit: 1,
          contextValue,
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

    describe('getMetadata', () => {
      it('registers its id in metadata', () => {
        const metadata = connect.getMetadata(
          { attribute: 'ok', contextValue },
          {}
        );
        expect(metadata).toEqual({ id: 'ok', index: 'index', items: [] });
      });

      it('registers its filter in metadata', () => {
        const metadata = connect.getMetadata(
          { attribute: 'wot', contextValue },
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

      it('registers escaped filterd in metadata', () => {
        const metadata = connect.getMetadata(
          { attribute: 'wot', contextValue },
          { refinementList: { wot: ['\\-wat', 'wut'] } }
        );
        expect(metadata).toEqual({
          id: 'wot',
          index: 'index',
          items: [
            {
              label: 'wot: ',
              attribute: 'wot',
              currentRefinement: ['\\-wat', 'wut'],
              value: metadata.items[0].value,
              items: [
                {
                  label: '-wat',
                  value: metadata.items[0].items[0].value,
                },
                {
                  label: 'wut',
                  value: metadata.items[0].items[1].value,
                },
              ],
            },
          ],
        });
      });

      it('items value function should clear it from the search state', () => {
        const metadata = connect.getMetadata(
          { attribute: 'one', contextValue },
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
    });

    it('should return the right searchState when clean up', () => {
      let searchState = connect.cleanUp(
        { attribute: 'name', contextValue },
        {
          refinementList: { name: 'searchState', name2: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        refinementList: { name2: 'searchState' },
        another: { searchState: 'searchState' },
      });

      searchState = connect.cleanUp(
        { attribute: 'name2', contextValue },
        searchState
      );
      expect(searchState).toEqual({
        refinementList: {},
        another: { searchState: 'searchState' },
      });
    });

    it('calling searchForItems return the right searchForItems parameters with limit', () => {
      const parameters = connect.searchForFacetValues(
        {
          attribute: 'ok',
          limit: 15,
          showMoreLimit: 25,
          showMore: false,
          contextValue,
        },
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
      const parameters = connect.searchForFacetValues(
        {
          attribute: 'ok',
          limit: 15,
          showMoreLimit: 25,
          showMore: true,
          contextValue,
        },
        {},
        'yep'
      );

      expect(parameters).toEqual({
        facetName: 'ok',
        query: 'yep',
        maxFacetHits: 25,
      });
    });

    it('computes canRefine based on the length of the transformed items list', () => {
      const transformItems = () => [];

      props = connect.getProvidedProps(
        { attribute: 'ok', transformItems, contextValue },
        {},
        { results }
      );

      expect(props.canRefine).toEqual(false);
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    const results = {
      first: {
        getFacetValues: jest.fn(() => []),
        getFacetByName: () => true,
      },
      second: {
        getFacetValues: jest.fn(() => []),
        getFacetByName: () => true,
      },
    };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue, indexContextValue },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: [],
        isFromSearch: false,
        canRefine: false,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue, indexContextValue },
        { indices: { second: { refinementList: { ok: ['wat'] } } } },
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: ['wat'],
        isFromSearch: false,
        canRefine: false,
      });

      results.second.getFacetValues.mockClear();
      results.second.getFacetValues.mockImplementation(() => [
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
      let nextState = connect.refine(
        { attribute: 'ok', contextValue, indexContextValue },
        {
          otherKey: 'val',
          indices: { second: { refinementList: { otherKey: ['val'] } } },
        },
        ['yep']
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: {
          second: {
            page: 1,
            refinementList: { ok: ['yep'], otherKey: ['val'] },
          },
        },
      });

      nextState = connect.refine(
        {
          attribute: 'ok',
          contextValue,
          indexContextValue,
        },
        {
          otherKey: 'val',
          indices: { second: { refinementList: { otherKey: ['val'] } } },
        },
        ['yep']
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: {
          second: {
            page: 1,
            refinementList: { ok: ['yep'], otherKey: ['val'] },
          },
        },
      });
    });

    it('correctly applies its state to search parameters', () => {
      const initSP = new SearchParameters();

      params = connect.getSearchParameters(
        initSP,
        {
          attribute: 'ok',
          operator: 'or',
          limit: 1,
          contextValue,
          indexContextValue,
        },
        { indices: { second: { refinementList: { ok: ['wat'] } } } }
      );
      expect(params).toEqual(
        initSP
          .addDisjunctiveFacet('ok')
          .addDisjunctiveFacetRefinement('ok', 'wat')
          .setQueryParameter('maxValuesPerFacet', 1)
      );

      params = connect.getSearchParameters(
        initSP,
        {
          attribute: 'ok',
          operator: 'and',
          limit: 1,
          contextValue,
          indexContextValue,
        },
        { indices: { second: { refinementList: { ok: ['wat'] } } } }
      );
      expect(params).toEqual(
        initSP
          .addFacet('ok')
          .addFacetRefinement('ok', 'wat')
          .setQueryParameter('maxValuesPerFacet', 1)
      );
    });

    it('registers its filter in metadata', () => {
      const metadata = connect.getMetadata(
        { attribute: 'wot', contextValue, indexContextValue },
        { indices: { second: { refinementList: { wot: ['wat', 'wut'] } } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'second',
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
      const metadata = connect.getMetadata(
        { attribute: 'one', contextValue, indexContextValue },
        {
          indices: {
            second: { refinementList: { one: ['one1', 'one2'], two: ['two'] } },
          },
        }
      );

      let searchState = metadata.items[0].items[0].value({
        indices: {
          second: { refinementList: { one: ['one1', 'one2'], two: ['two'] } },
        },
      });

      expect(searchState).toEqual({
        indices: {
          second: { page: 1, refinementList: { one: ['one2'], two: ['two'] } },
        },
      });

      searchState = metadata.items[0].items[1].value(searchState);

      expect(searchState).toEqual({
        indices: {
          second: { page: 1, refinementList: { one: '', two: ['two'] } },
        },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = connect.cleanUp(
        { attribute: 'name', contextValue, indexContextValue },
        {
          indices: {
            second: {
              refinementList: { name: 'searchState', name2: 'searchState' },
            },
          },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        indices: { second: { refinementList: { name2: 'searchState' } } },
        another: { searchState: 'searchState' },
      });

      searchState = connect.cleanUp(
        { attribute: 'name2', contextValue, indexContextValue },
        searchState
      );
      expect(searchState).toEqual({
        indices: { second: { refinementList: {} } },
        another: { searchState: 'searchState' },
      });
    });

    it('errors if searchable is used in a multi index context', () => {
      expect(() => {
        connect.getProvidedProps(
          {
            contextValue,
            indexContextValue,
            searchable: true,
          },
          {},
          {}
        );
      }).toThrowErrorMatchingInlineSnapshot(
        `"react-instantsearch: searching in *List is not available when used inside a multi index context"`
      );
    });
  });
});
