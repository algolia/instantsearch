import { SearchParameters, SearchResults } from 'algoliasearch-helper';

import connect from '../connectMenu';

jest.mock('../../core/createConnector', () => (x) => x);

let props;
let params;

describe('connectMenu', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    it('provides the correct props to the component', () => {
      const results = {
        getFacetValues: jest.fn(() => []),
        getFacetByName: () => true,
        hits: [],
      };

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
        {},
        {}
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: null,
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
        { menu: { ok: 'wat' } },
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: 'wat',
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
        { menu: { ok: 'wat' } },
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: 'wat',
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', defaultRefinement: 'wat', contextValue },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: 'wat',
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: null,
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
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

      props = connect.getProvidedProps(
        { attribute: 'ok', limit: 1, contextValue },
        {},
        { results }
      );
      expect(props.items).toEqual([
        {
          value: 'wat',
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
          value: 'wat',
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
          value: 'wat',
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
          value: 'wat',
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
      expect(props.items).toEqual(['items']);
    });

    it('if an item is equal to the currentRefinement, its value should be an empty string', () => {
      const results = {
        getFacetValues: jest.fn(() => []),
        getFacetByName: () => true,
        hits: [],
      };
      results.getFacetValues.mockImplementation(() => [
        {
          name: 'wat',
          escapedValue: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue },
        { menu: { ok: 'wat' } },
        { results }
      );

      expect(props.items).toEqual([
        {
          value: '',
          label: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);
    });

    it('facetValues have facetOrdering by default', () => {
      const userProps = {
        ...connect.defaultProps,
        attribute: 'ok',
        contextValue,
      };
      const searchState = {
        menu: { ok: 'wat' },
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
                  order: ['wat'],
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
          value: '',
        },
        {
          count: 2000,
          isRefined: false,
          label: 'lol',
          value: 'lol',
        },
      ]);
      expect(providedProps.isFromSearch).toBe(false);
    });

    it('facetValues results does not use facetOrdering if disabled', () => {
      const userProps = { attribute: 'ok', facetOrdering: false, contextValue };
      const searchState = {
        menu: { ok: 'wat' },
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
                  order: ['wat'],
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
          value: 'lol',
        },
        {
          count: 20,
          isRefined: true,
          label: 'wat',
          value: '',
        },
      ]);
      expect(providedProps.isFromSearch).toBe(false);
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = connect.refine(
        { attribute: 'ok', contextValue },
        { otherKey: 'val', menu: { otherKey: 'val' } },
        'yep'
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 1,
        menu: { ok: 'yep', otherKey: 'val' },
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
          limit: 1,
          contextValue,
        },
        { menu: { ok: 'wat' } }
      );
      expect(params).toEqual(
        initSP
          .addDisjunctiveFacet('ok')
          .addDisjunctiveFacetRefinement('ok', 'wat')
          .setQueryParameter('maxValuesPerFacet', 1)
      );
    });

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
        { menu: { wot: 'wat' } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'index',
        items: [
          {
            label: 'wot: wat',
            attribute: 'wot',
            currentRefinement: 'wat',
            // Ignore clear, we test it later
            value: metadata.items[0].value,
          },
        ],
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = connect.getMetadata(
        { attribute: 'one', contextValue },
        { menu: { one: 'one', two: 'two' } }
      );

      const searchState = metadata.items[0].value({
        menu: { one: 'one', two: 'two' },
      });

      expect(searchState).toEqual({ page: 1, menu: { one: '', two: 'two' } });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = connect.cleanUp(
        { attribute: 'name', contextValue },
        {
          menu: { name: 'searchState', name2: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        menu: { name2: 'searchState' },
        another: { searchState: 'searchState' },
      });

      searchState = connect.cleanUp(
        { attribute: 'name2', contextValue },
        searchState
      );
      expect(searchState).toEqual({
        menu: {},
        another: { searchState: 'searchState' },
      });
    });

    it('calling searchForItems return the right searchForItems parameters with limit', () => {
      const parameters = connect.searchForFacetValues(
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
      const parameters = connect.searchForFacetValues(
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

    it('if not searchable: uses a static sortBy order', () => {
      const results = {
        getFacetValues: jest.fn(() => [
          {
            name: 'oy',
            escapedValue: 'oy',
            isRefined: true,
            count: 10,
          },
          {
            name: 'wat',
            escapedValue: 'wat',
            isRefined: false,
            count: 20,
          },
        ]),
        getFacetByName: () => true,
        hits: [],
      };

      const { defaultProps } = connect;
      props = connect.getProvidedProps(
        { ...defaultProps, attribute: 'ok', contextValue },
        {},
        { results }
      );

      expect(results.getFacetValues).toHaveBeenCalledWith('ok', {
        sortBy: ['count:desc', 'name:asc'],
        facetOrdering: true,
      });

      expect(props.items).toEqual([
        {
          value: 'oy',
          label: 'oy',
          isRefined: true,
          count: 10,
        },
        {
          value: 'wat',
          label: 'wat',
          isRefined: false,
          count: 20,
        },
      ]);
    });

    it('if searchable: use the default sortBy order', () => {
      const results = {
        getFacetValues: jest.fn(() => [
          {
            name: 'oy',
            escapedValue: 'oy',
            isRefined: true,
            count: 10,
          },
          {
            name: 'wat',
            escapedValue: 'wat',
            isRefined: false,
            count: 20,
          },
        ]),
        getFacetByName: () => true,
        hits: [],
      };

      const { defaultProps } = connect;
      props = connect.getProvidedProps(
        {
          ...defaultProps,
          attribute: 'ok',
          searchable: true,
          contextValue,
        },
        {},
        { results }
      );

      expect(results.getFacetValues).toHaveBeenCalledWith('ok', {
        sortBy: undefined,
        facetOrdering: true,
      });

      expect(props.items).toEqual([
        {
          value: 'oy',
          label: 'oy',
          isRefined: true,
          count: 10,
        },
        {
          value: 'wat',
          label: 'wat',
          isRefined: false,
          count: 20,
        },
      ]);
    });

    it('computes canRefine based on the length of the transformed items list', () => {
      const transformItems = () => [];
      const results = {
        getFacetValues: () => [
          { count: 1, id: 'test', isRefined: true, name: 'test' },
        ],
        getFacetByName: () => true,
        hits: [],
      };

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

    it('provides the correct props to the component', () => {
      const results = {
        second: {
          getFacetValues: jest.fn(() => []),
          getFacetByName: () => true,
        },
      };

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue, indexContextValue },
        {},
        {}
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: null,
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue, indexContextValue },
        { indices: { second: { menu: { ok: 'wat' } } } },
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: 'wat',
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue, indexContextValue },
        { indices: { second: { menu: { ok: 'wat' } } } },
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: 'wat',
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
      });

      props = connect.getProvidedProps(
        {
          attribute: 'ok',
          defaultRefinement: 'wat',
          contextValue,
          indexContextValue,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: 'wat',
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue, indexContextValue },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [],
        currentRefinement: null,
        isFromSearch: false,
        canRefine: false,
        searchForItems: undefined,
      });

      results.second.getFacetValues.mockClear();
      results.second.getFacetValues.mockImplementation(() => [
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
        { attribute: 'ok', contextValue, indexContextValue },
        {},
        { results }
      );
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

      props = connect.getProvidedProps(
        { attribute: 'ok', limit: 1, contextValue, indexContextValue },
        {},
        { results }
      );
      expect(props.items).toEqual([
        {
          value: 'wat',
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
          indexContextValue,
        },
        {},
        { results }
      );
      expect(props.items).toEqual([
        {
          value: 'wat',
          label: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);

      props = connect.getProvidedProps(
        { attribute: 'ok', limit: 1, contextValue, indexContextValue },
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
          value: 'wat',
          label: 'wat',
          isRefined: false,
          count: 10,
          _highlightResult: { label: { value: 'wat' } },
        },
      ]);

      props = connect.getProvidedProps(
        { attribute: 'ok', limit: 1, contextValue, indexContextValue },
        {},
        { results },
        {},
        { query: '' }
      );
      expect(props.items).toEqual([
        {
          value: 'wat',
          label: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);

      const transformItems = jest.fn(() => ['items']);
      props = connect.getProvidedProps(
        { attribute: 'ok', transformItems, contextValue, indexContextValue },
        {},
        { results }
      );
      expect(transformItems.mock.calls[0][0]).toEqual([
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
      expect(props.items).toEqual(['items']);
    });

    it('if an item is equal to the currentRefinement, its value should be an empty string', () => {
      const results = {
        second: {
          getFacetValues: jest.fn(() => []),
          getFacetByName: () => true,
        },
      };
      results.second.getFacetValues.mockImplementation(() => [
        {
          name: 'wat',
          escapedValue: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);

      props = connect.getProvidedProps(
        { attribute: 'ok', contextValue, indexContextValue },
        { indices: { second: { menu: { ok: 'wat' } } } },
        { results }
      );

      expect(props.items).toEqual([
        {
          value: '',
          label: 'wat',
          isRefined: true,
          count: 20,
        },
      ]);
    });

    it("calling refine updates the widget's search state", () => {
      let nextState = connect.refine(
        { attribute: 'ok', contextValue, indexContextValue },
        {
          indices: {
            second: { otherKey: 'val', menu: { ok: 'wat', otherKey: 'val' } },
          },
        },
        'yep'
      );
      expect(nextState).toEqual({
        indices: {
          second: {
            page: 1,
            otherKey: 'val',
            menu: { ok: 'yep', otherKey: 'val' },
          },
        },
      });

      nextState = connect.refine(
        {
          attribute: 'ok',
          contextValue,
          indexContextValue: { targetedIndex: 'second' },
        },
        {
          indices: {
            first: { otherKey: 'val', menu: { ok: 'wat', otherKey: 'val' } },
          },
        },
        'yep'
      );
      expect(nextState).toEqual({
        indices: {
          first: { otherKey: 'val', menu: { ok: 'wat', otherKey: 'val' } },
          second: { page: 1, menu: { ok: 'yep' } },
        },
      });
    });

    it('correctly applies its state to search parameters', () => {
      const initSP = new SearchParameters();

      params = connect.getSearchParameters(
        initSP,
        {
          attribute: 'ok',
          limit: 1,
          contextValue,
          indexContextValue,
        },
        { indices: { second: { menu: { ok: 'wat' } } } }
      );
      expect(params).toEqual(
        initSP
          .addDisjunctiveFacet('ok')
          .addDisjunctiveFacetRefinement('ok', 'wat')
          .setQueryParameter('maxValuesPerFacet', 1)
      );
    });

    describe('getMetaData', () => {
      it('registers its filter in metadata', () => {
        const metadata = connect.getMetadata(
          { attribute: 'wot', contextValue, indexContextValue },
          { indices: { second: { menu: { wot: 'wat' } } } }
        );
        expect(metadata).toEqual({
          id: 'wot',
          index: 'second',
          items: [
            {
              label: 'wot: wat',
              attribute: 'wot',
              currentRefinement: 'wat',
              // Ignore clear, we test it later
              value: metadata.items[0].value,
            },
          ],
        });
      });

      it('registers escaped metadata', () => {
        const metadata = connect.getMetadata(
          { attribute: 'wot', contextValue, indexContextValue },
          { indices: { second: { menu: { wot: '\\-wat' } } } }
        );
        expect(metadata).toEqual({
          id: 'wot',
          index: 'second',
          items: [
            {
              label: 'wot: -wat',
              attribute: 'wot',
              currentRefinement: '\\-wat',
              // Ignore clear, we test it later
              value: metadata.items[0].value,
            },
          ],
        });
      });

      it('items value function should clear it from the search state', () => {
        const metadata = connect.getMetadata(
          { attribute: 'one', contextValue, indexContextValue },
          { indices: { second: { menu: { one: 'one', two: 'two' } } } }
        );

        const searchState = metadata.items[0].value({
          indices: { second: { menu: { one: 'one', two: 'two' } } },
        });

        expect(searchState).toEqual({
          indices: { second: { page: 1, menu: { one: '', two: 'two' } } },
        });
      });

      it('should return the right searchState when clean up', () => {
        let searchState = connect.cleanUp(
          { attribute: 'name', contextValue, indexContextValue },
          {
            indices: {
              first: {
                random: { untouched: 'yes' },
              },
              second: {
                menu: { name: 'searchState', name2: 'searchState2' },
                another: { searchState: 'searchState' },
              },
            },
          }
        );

        expect(searchState).toEqual({
          indices: {
            first: {
              random: { untouched: 'yes' },
            },
            second: {
              another: {
                searchState: 'searchState',
              },
              menu: {
                name2: 'searchState2',
              },
            },
          },
        });

        searchState = connect.cleanUp(
          { attribute: 'name2', contextValue, indexContextValue },
          searchState
        );
        expect(searchState).toEqual({
          indices: {
            first: {
              random: { untouched: 'yes' },
            },
            second: { another: { searchState: 'searchState' }, menu: {} },
          },
        });
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
