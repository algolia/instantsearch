import { SearchResults, SearchParameters } from 'algoliasearch-helper';

import connect from '../connectHierarchicalMenu';

jest.mock('../../core/createConnector', () => (x) => x);

describe('connectHierarchicalMenu', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    it('provides the correct props to the component', () => {
      const results = {
        getFacetValues: jest.fn(),
        getFacetByName: () => true,
        hits: [],
      };

      results.getFacetValues.mockImplementationOnce(() => ({}));
      let props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue },
        { hierarchicalMenu: { ok: 'wat' } },
        { results }
      );

      expect(props).toEqual({
        canRefine: false,
        currentRefinement: 'wat',
        items: [],
      });

      props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue },
        {},
        {}
      );
      expect(props).toEqual({
        canRefine: false,
        currentRefinement: null,
        items: [],
      });

      results.getFacetValues.mockClear();
      results.getFacetValues.mockImplementation(() => ({
        data: [
          {
            name: 'wat',
            path: 'wat',
            escapedValue: 'wat',
            count: 20,
            data: [
              {
                name: 'wot',
                path: 'wat > wot',
                escapedValue: 'wat > wot',
                count: 15,
              },
              {
                name: 'wut',
                path: 'wat > wut',
                escapedValue: 'wat > wut',
                count: 5,
              },
            ],
          },
          {
            name: 'oy',
            path: 'oy',
            escapedValue: 'oy',
            count: 10,
          },
        ],
      }));
      props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue },
        {},
        { results }
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

      props = connect.getProvidedProps(
        { attributes: ['ok'], limit: 1, contextValue },
        {},
        { results }
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

      props = connect.getProvidedProps(
        {
          attributes: ['ok'],
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
      props = connect.getProvidedProps(
        { attributes: ['ok'], transformItems, contextValue },
        {},
        { results }
      );
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

    it('facetValues results uses facetOrdering by default', () => {
      const props = {
        ...connect.defaultProps,
        attributes: ['lvl0', 'lvl1'],
        contextValue,
      };
      const searchState = { hierarchicalMenu: { lvl0: 'wat' } };
      const state = connect.getSearchParameters(
        new SearchParameters(),
        props,
        searchState
      );
      const results = new SearchResults(state, [
        {
          hits: [],
          renderingContent: {
            facetOrdering: {
              values: {
                lvl0: {
                  order: ['wat'],
                },
                lvl1: {
                  order: ['wat > wut'],
                },
              },
            },
          },
          facets: {
            lvl0: {
              wat: 20,
              oy: 10,
            },
            lvl1: {
              'wat > wot': 15,
              'wat > wut': 5,
            },
          },
        },
      ]);

      const providedProps = connect.getProvidedProps(props, searchState, {
        results,
      });
      expect(providedProps.items).toEqual([
        {
          label: 'wat',
          value: undefined,
          count: 20,
          isRefined: true,
          items: [
            {
              label: 'wut',
              value: 'wat > wut',
              count: 5,
              isRefined: false,
              items: null,
            },
            {
              label: 'wot',
              value: 'wat > wot',
              count: 15,
              isRefined: false,
              items: null,
            },
          ],
        },
        {
          label: 'oy',
          value: 'oy',
          count: 10,
          isRefined: false,
          items: null,
        },
      ]);
    });

    it('facetValues results does not use facetOrdering if disabled', () => {
      const props = {
        attributes: ['lvl0', 'lvl1'],
        facetOrdering: false,
        contextValue,
      };
      const searchState = { hierarchicalMenu: { lvl0: 'wat' } };
      const state = connect.getSearchParameters(
        new SearchParameters(),
        props,
        searchState
      );
      const results = new SearchResults(state, [
        {
          hits: [],
          renderingContent: {
            facetOrdering: {
              values: {
                lvl0: {
                  order: ['wat'],
                },
                lvl1: {
                  order: ['wat > wut'],
                },
              },
            },
          },
          facets: {
            lvl0: {
              wat: 20,
              oy: 10,
            },
            lvl1: {
              'wat > wot': 15,
              'wat > wut': 5,
            },
          },
        },
      ]);

      const providedProps = connect.getProvidedProps(props, searchState, {
        results,
      });
      expect(providedProps.items).toEqual([
        {
          label: 'oy',
          value: 'oy',
          count: 10,
          isRefined: false,
          items: null,
        },
        {
          label: 'wat',
          value: undefined,
          count: 20,
          isRefined: true,
          items: [
            // default ordering: alphabetical
            {
              label: 'wot',
              value: 'wat > wot',
              count: 15,
              isRefined: false,
              items: null,
            },
            {
              label: 'wut',
              value: 'wat > wut',
              count: 5,
              isRefined: false,
              items: null,
            },
          ],
        },
      ]);
    });

    it('shows the effect of showMoreLimit when there is no transformItems', () => {
      const results = {
        getFacetValues: jest.fn(),
        getFacetByName: () => true,
        hits: [],
      };
      results.getFacetValues.mockImplementation(() => ({
        data: [
          {
            name: 'wat',
            path: 'wat',
            escapedValue: 'wat',
            count: 20,
            data: [
              {
                name: 'wot',
                path: 'wat > wot',
                escapedValue: 'wat > wot',
                count: 15,
              },
              {
                name: 'wut',
                path: 'wat > wut',
                escapedValue: 'wat > wut',
                count: 3,
              },
              {
                name: 'wit',
                path: 'wat > wit',
                escapedValue: 'wat > wit',
                count: 5,
              },
            ],
          },
          {
            name: 'oy',
            path: 'oy',
            escapedValue: 'oy',
            count: 10,
          },
          {
            name: 'ay',
            path: 'ay',
            escapedValue: 'ay',
            count: 3,
          },
        ],
      }));

      const props = connect.getProvidedProps(
        {
          attributes: ['ok'],
          showMore: true,
          limit: 0,
          showMoreLimit: 2,
          contextValue,
        },
        {},
        { results }
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
            {
              label: 'wut',
              value: 'wat > wut',
              count: 3,
            },
          ],
        },
        {
          label: 'oy',
          value: 'oy',
          count: 10,
        },
      ]);
    });

    it('applies limit after transforming items', () => {
      const results = {
        getFacetValues: jest.fn(),
        getFacetByName: () => true,
        hits: [],
      };
      results.getFacetValues.mockClear();
      results.getFacetValues.mockImplementation(() => ({
        data: [
          {
            name: 'wat',
            path: 'wat',
            escapedValue: 'wat',
            count: 20,
            data: [
              {
                name: 'wot',
                path: 'wat > wot',
                escapedValue: 'wat > wot',
                count: 15,
              },
              {
                name: 'wut',
                path: 'wat > wut',
                escapedValue: 'wat > wut',
                count: 3,
              },
              {
                name: 'wit',
                path: 'wat > wit',
                escapedValue: 'wat > wit',
                count: 5,
              },
            ],
          },
          {
            name: 'oy',
            path: 'oy',
            escapedValue: 'oy',
            count: 10,
          },
          {
            name: 'ay',
            path: 'ay',
            escapedValue: 'ay',
            count: 3,
          },
        ],
      }));
      let props = connect.getProvidedProps(
        {
          attributes: ['ok'],
          showMore: true,
          limit: 0,
          showMoreLimit: 3,
          contextValue,
        },
        {},
        { results }
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
            {
              label: 'wut',
              value: 'wat > wut',
              count: 3,
            },
            {
              label: 'wit',
              value: 'wat > wit',
              count: 5,
            },
          ],
        },
        {
          label: 'oy',
          value: 'oy',
          count: 10,
        },
        {
          label: 'ay',
          value: 'ay',
          count: 3,
        },
      ]);

      function compareItem(a, b) {
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        return 0;
      }
      const transformItems = jest.fn((items) => items.sort(compareItem));
      props = connect.getProvidedProps(
        { attributes: ['ok'], transformItems, contextValue },
        {},
        { results }
      );
      expect(transformItems.mock.calls[0][0]).toEqual([
        {
          label: 'ay',
          value: 'ay',
          count: 3,
        },
        {
          label: 'oy',
          value: 'oy',
          count: 10,
        },
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
              count: 3,
            },
            {
              label: 'wit',
              value: 'wat > wit',
              count: 5,
            },
          ],
        },
      ]);
      props = connect.getProvidedProps(
        {
          attributes: ['ok'],
          transformItems,
          showMore: true,
          limit: 0,
          showMoreLimit: 2,
          contextValue,
        },
        {},
        { results }
      );
      expect(props.items).toEqual([
        {
          label: 'ay',
          value: 'ay',
          count: 3,
        },
        {
          label: 'oy',
          value: 'oy',
          count: 10,
        },
      ]);
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = connect.refine(
        { attributes: ['ok'], contextValue },
        { otherKey: 'val', hierarchicalMenu: { otherKey: 'val' } },
        'yep'
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 1,
        hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
      });
    });

    it("increases maxValuesPerFacet when it isn't big enough", () => {
      const initSP = new SearchParameters({ maxValuesPerFacet: 100 });

      let params = connect.getSearchParameters(
        initSP,
        {
          attributes: ['attribute'],
          limit: 101,
          contextValue,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(101);

      params = connect.getSearchParameters(
        initSP,
        {
          attributes: ['attribute'],
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
          attributes: ['attribute'],
          limit: 99,
          contextValue,
        },
        {}
      );
      expect(params.maxValuesPerFacet).toBe(100);

      params = connect.getSearchParameters(
        initSP,
        {
          attributes: ['attribute'],
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

      const params = connect.getSearchParameters(
        initSP,
        {
          attributes: ['ATTRIBUTE'],
          separator: 'SEPARATOR',
          rootPath: 'ROOT_PATH',
          showParentLevel: true,
          limit: 1,
          contextValue,
        },
        { hierarchicalMenu: { ATTRIBUTE: 'ok' } }
      );
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

    describe('getMetaData', () => {
      it('registers its id in metadata', () => {
        const metadata = connect.getMetadata(
          { attributes: ['ok'], contextValue },
          {}
        );
        expect(metadata).toEqual({ items: [], index: 'index', id: 'ok' });
      });

      it('registers its filter in metadata', () => {
        const metadata = connect.getMetadata(
          { attributes: ['ok'], contextValue },
          { hierarchicalMenu: { ok: 'wat' } }
        );
        expect(metadata).toEqual({
          id: 'ok',
          index: 'index',
          items: [
            {
              label: 'ok: wat',
              attribute: 'ok',
              currentRefinement: 'wat',
              // Ignore clear, we test it later
              value: metadata.items[0].value,
            },
          ],
        });
      });

      it('registers escaped filter in metadata', () => {
        const metadata = connect.getMetadata(
          { attributes: ['ok'], contextValue },
          { hierarchicalMenu: { ok: '\\-wat' } }
        );
        expect(metadata).toEqual({
          id: 'ok',
          index: 'index',
          items: [
            {
              label: 'ok: -wat',
              attribute: 'ok',
              currentRefinement: '\\-wat',
              value: metadata.items[0].value,
            },
          ],
        });
      });

      it('items value function should clear it from the search state', () => {
        const metadata = connect.getMetadata(
          { attributes: ['one'], contextValue },
          { hierarchicalMenu: { one: 'one', two: 'two' } }
        );

        const searchState = metadata.items[0].value({
          hierarchicalMenu: { one: 'one', two: 'two' },
        });

        expect(searchState).toEqual({
          page: 1,
          hierarchicalMenu: { one: '', two: 'two' },
        });
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = connect.cleanUp(
        { attributes: ['name'], contextValue },
        {
          hierarchicalMenu: { name: 'searchState', name2: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        hierarchicalMenu: { name2: 'searchState' },
        another: { searchState: 'searchState' },
      });

      searchState = connect.cleanUp(
        { attributes: ['name2'], contextValue },
        searchState
      );
      expect(searchState).toEqual({
        another: { searchState: 'searchState' },
        hierarchicalMenu: {},
      });
    });

    it('computes canRefine based on the length of the transformed items list', () => {
      const transformItems = () => [];
      const results = {
        getFacetValues: () => ({ data: [{ id: 'test' }] }),
        getFacetByName: () => true,
        hits: [],
      };

      const props = connect.getProvidedProps(
        { attributes: ['ok'], transformItems, contextValue },
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
          getFacetValues: jest.fn(),
          getFacetByName: () => true,
        },
      };

      results.second.getFacetValues.mockImplementationOnce(() => ({}));
      let props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue, indexContextValue },
        { indices: { second: { hierarchicalMenu: { ok: 'wat' } } } },
        { results }
      );
      expect(props).toEqual({
        canRefine: false,
        currentRefinement: 'wat',
        items: [],
      });

      props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue, indexContextValue },
        {},
        {}
      );
      expect(props).toEqual({
        canRefine: false,
        currentRefinement: null,
        items: [],
      });

      results.second.getFacetValues.mockClear();
      results.second.getFacetValues.mockImplementation(() => ({
        data: [
          {
            name: 'wat',
            path: 'wat',
            escapedValue: 'wat',
            count: 20,
            data: [
              {
                name: 'wot',
                path: 'wat > wot',
                escapedValue: 'wat > wot',
                count: 15,
              },
              {
                name: 'wut',
                path: 'wat > wut',
                escapedValue: 'wat > wut',
                count: 5,
              },
            ],
          },
          {
            name: 'oy',
            path: 'oy',
            escapedValue: 'oy',
            count: 10,
          },
        ],
      }));
      props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue, indexContextValue },
        {},
        { results }
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

      props = connect.getProvidedProps(
        { attributes: ['ok'], limit: 1, contextValue, indexContextValue },
        {},
        { results }
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

      props = connect.getProvidedProps(
        {
          attributes: ['ok'],
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
      props = connect.getProvidedProps(
        { attributes: ['ok'], transformItems, contextValue, indexContextValue },
        {},
        { results }
      );
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

    it("calling refine updates the widget's search state", () => {
      let nextState = connect.refine(
        { attributes: ['ok'], contextValue, indexContextValue },
        {
          indices: {
            first: { otherKey: 'val1', hierarchicalMenu: { otherKey: 'val1' } },
            second: { otherKey: 'val', hierarchicalMenu: { otherKey: 'val' } },
          },
        },
        'yep'
      );

      expect(nextState).toEqual({
        indices: {
          first: {
            otherKey: 'val1',
            hierarchicalMenu: { otherKey: 'val1' },
          },
          second: {
            otherKey: 'val',
            page: 1,
            hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
          },
        },
      });

      nextState = connect.refine(
        {
          attributes: ['ok'],
          contextValue: { mainTargetedIndex: 'first' },
          indexContextValue: { targetedIndex: 'second' },
        },
        {
          indices: {
            first: {
              otherKey: 'val',
              hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
            },
          },
        },
        'yep'
      );

      expect(nextState).toEqual({
        indices: {
          first: {
            otherKey: 'val',
            hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
          },
          second: { page: 1, hierarchicalMenu: { ok: 'yep' } },
        },
      });
    });

    it('correctly applies its state to search parameters', () => {
      const initSP = new SearchParameters();

      const params = connect.getSearchParameters(
        initSP,
        {
          attributes: ['ATTRIBUTE'],
          separator: 'SEPARATOR',
          rootPath: 'ROOT_PATH',
          showParentLevel: true,
          limit: 1,
          contextValue,
          indexContextValue,
        },
        {
          indices: {
            second: { otherKey: 'val', hierarchicalMenu: { ATTRIBUTE: 'ok' } },
          },
        }
      );
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

    it('registers its filter in metadata', () => {
      const metadata = connect.getMetadata(
        { attributes: ['ok'], contextValue, indexContextValue },
        { indices: { second: { hierarchicalMenu: { ok: 'wat' } } } }
      );
      expect(metadata).toEqual({
        id: 'ok',
        index: 'second',
        items: [
          {
            label: 'ok: wat',
            attribute: 'ok',
            currentRefinement: 'wat',
            // Ignore clear, we test it later
            value: metadata.items[0].value,
          },
        ],
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = connect.getMetadata(
        { attributes: ['one'], contextValue, indexContextValue },
        {
          indices: { second: { hierarchicalMenu: { one: 'one', two: 'two' } } },
        }
      );

      const searchState = metadata.items[0].value({
        indices: { second: { hierarchicalMenu: { one: 'one', two: 'two' } } },
      });

      expect(searchState).toEqual({
        indices: {
          second: { page: 1, hierarchicalMenu: { one: '', two: 'two' } },
        },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = connect.cleanUp(
        { attributes: ['one'], contextValue, indexContextValue },
        {
          indices: {
            second: {
              hierarchicalMenu: { one: 'one', two: 'two' },
              another: { searchState: 'searchState' },
            },
          },
        }
      );
      expect(searchState).toEqual({
        indices: {
          second: {
            hierarchicalMenu: { two: 'two' },
            another: { searchState: 'searchState' },
          },
        },
      });

      searchState = connect.cleanUp(
        { attributes: ['two'], contextValue, indexContextValue },
        searchState
      );
      expect(searchState).toEqual({
        indices: {
          second: {
            another: { searchState: 'searchState' },
            hierarchicalMenu: {},
          },
        },
      });
    });
  });
});
