import algoliasearchHelper, {
  AlgoliaSearchHelper,
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectCurrentRefinements, {
  CurrentRefinementsConnectorParamsItem,
} from '../connectCurrentRefinements';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

describe('connectCurrentRefinements', () => {
  describe('Usage', () => {
    it('throws if given both `includedAttributes` and `excludedAttributes`', () => {
      const customCurrentRefinements = connectCurrentRefinements(() => {});

      expect(() => {
        customCurrentRefinements({
          includedAttributes: ['query'],
          excludedAttributes: ['brand'],
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The options \`includedAttributes\` and \`excludedAttributes\` cannot be used together.

See documentation: https://www.algolia.com/doc/api-reference/widgets/current-refinements/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customCurrentRefinements = connectCurrentRefinements(
        render,
        unmount
      );

      const widget = customCurrentRefinements({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.currentRefinements',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('Lifecycle', () => {
    it('renders during init and render', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {});
      helper.search = jest.fn();
      // test that the dummyRendering is called with the isFirstRendering
      // flag set accordingly
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);
      const widget = customCurrentRefinements({
        includedAttributes: ['query'],
      });

      // test if widget is not rendered yet at this point
      expect(rendering).toHaveBeenCalledTimes(0);

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      // test that rendering has been called during init with isFirstRendering = true
      expect(rendering).toHaveBeenCalledTimes(1);
      // test if isFirstRendering is true during init
      expect(rendering.mock.calls[0][1]).toBe(true);

      const firstRenderingOptions = rendering.mock.calls[0][0];
      expect(firstRenderingOptions.items).toEqual([]);
      expect(firstRenderingOptions.refine).toBeInstanceOf(Function);
      expect(firstRenderingOptions.createURL).toBeInstanceOf(Function);
      expect(firstRenderingOptions.widgetParams).toEqual({
        includedAttributes: ['query'],
      });

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          state: helper.state,
          helper,
          createURL: () => '#',
        })
      );

      // test that rendering has been called during init with isFirstRendering = false
      expect(rendering).toHaveBeenCalledTimes(2);
      expect(rendering.mock.calls[1][1]).toBe(false);

      const secondRenderingOptions = rendering.mock.calls[0][0];

      expect(secondRenderingOptions.items).toEqual([]);
      expect(secondRenderingOptions.refine).toBeInstanceOf(Function);
      expect(secondRenderingOptions.createURL).toBeInstanceOf(Function);
      expect(secondRenderingOptions.widgetParams).toEqual({
        includedAttributes: ['query'],
      });
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {});
      const rendering = () => {};
      const customCurrentRefinements = connectCurrentRefinements(rendering);
      const widget = customCurrentRefinements({});

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    describe('getRenderState', () => {
      test('returns the render state', () => {
        const renderFn = jest.fn();
        const unmountFn = jest.fn();
        const createCurrentRefinements = connectCurrentRefinements(
          renderFn,
          unmountFn
        );
        const configure = createCurrentRefinements({});

        const renderState = configure.getRenderState({}, createInitOptions());

        expect(renderState.currentRefinements).toEqual({
          items: [],
          canRefine: false,
          refine: expect.any(Function),
          createURL: expect.any(Function),
          widgetParams: {},
        });
      });

      test('returns the render state with scoped results', () => {
        const renderFn = jest.fn();
        const unmountFn = jest.fn();
        const createCurrentRefinements = connectCurrentRefinements(
          renderFn,
          unmountFn
        );
        const configure = createCurrentRefinements({});
        const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
          index: 'indexName',
          hierarchicalFacets: [
            {
              name: 'category',
              attributes: ['category', 'subCategory'],
              separator: ' > ',
            },
          ],
        });

        configure.init!(createInitOptions());

        helper.toggleRefinement('category', 'Decoration');

        const renderState = configure.getRenderState(
          {},
          createRenderOptions({
            helper,
            scopedResults: [
              {
                indexId: 'indexName',
                helper,
                results: new SearchResults(helper.state, [
                  createSingleSearchResponse({
                    hits: [],
                    facets: {
                      category: {
                        Decoration: 880,
                      },
                      subCategory: {
                        'Decoration > Candle holders & candles': 193,
                        'Decoration > Frames & pictures': 173,
                      },
                    },
                  }),
                  createSingleSearchResponse({
                    facets: {
                      category: {
                        Decoration: 880,
                        Outdoor: 47,
                      },
                    },
                  }),
                ]),
              },
            ],
          })
        );

        expect(renderState.currentRefinements).toEqual({
          items: [
            {
              attribute: 'category',
              indexName: 'indexName',
              label: 'category',
              refine: expect.any(Function),
              refinements: [
                {
                  attribute: 'category',
                  count: 880,
                  exhaustive: true,
                  label: 'Decoration',
                  type: 'hierarchical',
                  value: 'Decoration',
                },
              ],
            },
          ],
          canRefine: true,
          refine: expect.any(Function),
          createURL: expect.any(Function),
          widgetParams: {},
        });
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createCurrentRefinements = connectCurrentRefinements(
        renderFn,
        unmountFn
      );
      const configure = createCurrentRefinements({});

      const renderState = configure.getWidgetRenderState(createInitOptions());

      expect(renderState).toEqual({
        items: [],
        canRefine: false,
        refine: expect.any(Function),
        createURL: expect.any(Function),
        widgetParams: {},
      });
    });

    test('returns the widget render state with scoped results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createCurrentRefinements = connectCurrentRefinements(
        renderFn,
        unmountFn
      );
      const configure = createCurrentRefinements({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'subCategory'],
            separator: ' > ',
          },
        ],
      });

      configure.init!(createInitOptions());

      helper.toggleRefinement('category', 'Decoration');

      const renderState = configure.getWidgetRenderState(
        createRenderOptions({
          helper,
          scopedResults: [
            {
              indexId: 'indexName',
              helper,
              results: new SearchResults(helper.state, [
                createSingleSearchResponse({
                  hits: [],
                  facets: {
                    category: {
                      Decoration: 880,
                    },
                    subCategory: {
                      'Decoration > Candle holders & candles': 193,
                      'Decoration > Frames & pictures': 173,
                    },
                  },
                }),
                createSingleSearchResponse({
                  facets: {
                    category: {
                      Decoration: 880,
                      Outdoor: 47,
                    },
                  },
                }),
              ]),
            },
          ],
        })
      );

      expect(renderState).toEqual({
        items: [
          {
            attribute: 'category',
            indexName: 'indexName',
            label: 'category',
            refine: expect.any(Function),
            refinements: [
              {
                attribute: 'category',
                count: 880,
                exhaustive: true,
                label: 'Decoration',
                type: 'hierarchical',
                value: 'Decoration',
              },
            ],
          },
        ],
        canRefine: true,
        refine: expect.any(Function),
        createURL: expect.any(Function),
        widgetParams: {},
      });
    });
  });

  describe('Widget options', () => {
    let helper: AlgoliaSearchHelper;

    beforeEach(() => {
      helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facets: ['facet1', 'facet2', 'facet3'],
      });
      helper.search = jest.fn();
    });

    it('includes all attributes by default except the query', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({});

      helper
        .addFacetRefinement('facet1', 'facetValue1')
        .addFacetRefinement('facet2', 'facetValue2')
        .addFacetRefinement('facet3', 'facetValue3')
        .setQuery('query');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );
      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          state: helper.state,
          helper,
          createURL: () => '#',
        })
      );

      expect(rendering.mock.calls[0][0].items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            attribute: 'facet1',
          }),
          expect.objectContaining({
            attribute: 'facet2',
          }),
          expect.objectContaining({
            attribute: 'facet3',
          }),
        ])
      );
      expect(rendering.mock.calls[0][0].items).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            attribute: 'query',
          }),
        ])
      );
    });

    it('includes only the `includedAttributes`', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        includedAttributes: ['facet1', 'query'],
      });

      helper
        .addFacetRefinement('facet1', 'facetValue1')
        .addFacetRefinement('facet2', 'facetValue2')
        .setQuery('query');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );
      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          state: helper.state,
          helper,
        })
      );

      expect(rendering.mock.calls[0][0].items).toEqual([
        expect.objectContaining({
          attribute: 'facet1',
        }),
        expect.objectContaining({
          attribute: 'query',
        }),
      ]);
    });

    it('does not include query if empty', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        includedAttributes: ['query'],
      });

      helper.setQuery('');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );
      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          state: helper.state,
          helper,
        })
      );

      expect(rendering.mock.calls[0][0].items).toEqual([]);
    });

    it('does not include query if whitespaces', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        includedAttributes: ['query'],
      });

      helper.setQuery(' ');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );
      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          state: helper.state,
          helper,
        })
      );

      expect(rendering.mock.calls[0][0].items).toEqual([]);
    });

    it('excludes the `excludedAttributes` (and overrides the default ["query"])', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        excludedAttributes: ['facet2'],
      });

      helper
        .addFacetRefinement('facet1', 'facetValue1')
        .addFacetRefinement('facet2', 'facetValue2')
        .setQuery('query');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );
      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          state: helper.state,
          helper,
        })
      );

      expect(rendering.mock.calls[0][0].items).toEqual([
        expect.objectContaining({
          attribute: 'facet1',
        }),
        expect.objectContaining({
          attribute: 'query',
        }),
      ]);
    });

    it('transformItems is applied', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        transformItems: items =>
          items.map(item => ({
            ...item,
            transformed: true,
          })),
      });

      helper
        .addFacetRefinement('facet1', 'facetValue1')
        .addFacetRefinement('facet2', 'facetValue2')
        .addFacetRefinement('facet3', 'facetValue3');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[0][0].items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            attribute: 'facet1',
            transformed: true,
          }),
          expect.objectContaining({
            attribute: 'facet2',
            transformed: true,
          }),
          expect.objectContaining({
            attribute: 'facet3',
            transformed: true,
          }),
        ])
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          state: helper.state,
          helper,
        })
      );

      expect(rendering.mock.calls[0][0].items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            attribute: 'facet1',
            transformed: true,
          }),
          expect.objectContaining({
            attribute: 'facet2',
            transformed: true,
          }),
          expect.objectContaining({
            attribute: 'facet3',
            transformed: true,
          }),
        ])
      );
    });

    it('sort numeric refinements by numeric value', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);

      const widget = customCurrentRefinements({
        includedAttributes: ['price'],
      });

      // If sorted alphabetically, "≤ 500" is lower than "≥" so 500 should appear before 100.
      // However, we want 100 to appear before 500.
      helper
        .addNumericRefinement('price', '<=', 500)
        .addNumericRefinement('price', '>=', 100);

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          state: helper.state,
          helper,
        })
      );

      expect(rendering.mock.calls[0][0].items).toEqual([
        expect.objectContaining({
          attribute: 'price',
          refinements: [
            {
              attribute: 'price',
              label: '≥ 100',
              operator: '>=',
              type: 'numeric',
              value: 100,
            },
            {
              attribute: 'price',
              label: '≤ 500',
              operator: '<=',
              type: 'numeric',
              value: 500,
            },
          ],
        }),
      ]);
    });
  });

  describe('Rendering options', () => {
    let helper: AlgoliaSearchHelper;

    beforeEach(() => {
      helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facets: ['facet1', 'facet2', 'facet3'],
      });
      helper.search = jest.fn();
    });

    it('provides the items', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);
      const widget = customCurrentRefinements({});

      helper.addFacetRefinement('facet1', 'facetValue');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      const firstRenderingOptions = rendering.mock.calls[0][0];
      expect(firstRenderingOptions.items).toEqual([
        {
          indexName: 'indexName',
          attribute: 'facet1',
          label: 'facet1',
          refinements: [
            {
              attribute: 'facet1',
              label: 'facetValue',
              type: 'facet',
              value: 'facetValue',
            },
          ],
          refine: expect.any(Function),
        },
      ]);

      helper
        .addFacetRefinement('facet1', 'facetValue')
        .addFacetRefinement('facet2', 'facetValue');

      widget.render!(
        createRenderOptions({
          scopedResults: [
            {
              indexId: 'firstIndex',
              helper,
              results: new SearchResults(helper.state, [
                createSingleSearchResponse({
                  index: 'firstIndex',
                }),
              ]),
            },
          ],
          state: helper.state,
          helper,
        })
      );

      const secondRenderingOptions = rendering.mock.calls[1][0];
      const items: CurrentRefinementsConnectorParamsItem[] =
        secondRenderingOptions.items;

      expect(items).toHaveLength(2);
      expect(items).toEqual([
        {
          indexName: 'indexName',
          attribute: 'facet1',
          label: 'facet1',
          refinements: [
            {
              attribute: 'facet1',
              label: 'facetValue',
              type: 'facet',
              value: 'facetValue',
            },
          ],
          refine: expect.any(Function),
        },
        {
          indexName: 'indexName',
          attribute: 'facet2',
          label: 'facet2',
          refinements: [
            {
              attribute: 'facet2',
              label: 'facetValue',
              type: 'facet',
              value: 'facetValue',
            },
          ],
          refine: expect.any(Function),
        },
      ]);

      expect(helper.state).toEqual(
        new SearchParameters({
          index: 'indexName',
          facets: ['facet1', 'facet2', 'facet3'],
          facetsRefinements: { facet1: ['facetValue'], facet2: ['facetValue'] },
        })
      );

      items[0].refine({
        attribute: 'facet1',
        label: 'facetValue',
        type: 'facet',
        value: 'facetValue',
      });

      expect(helper.state).toEqual(
        new SearchParameters({
          index: 'indexName',
          facets: ['facet1', 'facet2', 'facet3'],
          facetsRefinements: { facet1: [], facet2: ['facetValue'] },
        })
      );
    });

    it('provides the items from multiple scoped results', () => {
      const rendering = jest.fn();
      const customCurrentRefinements = connectCurrentRefinements(rendering);
      const widget = customCurrentRefinements({});

      helper.addFacetRefinement('facet1', 'facetValue');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      helper
        .addFacetRefinement('facet1', 'facetValue')
        .addFacetRefinement('facet2', 'facetValue');

      widget.render!(
        createRenderOptions({
          scopedResults: [
            {
              indexId: 'firstIndex',
              helper,
              results: new SearchResults(helper.state, [
                createSingleSearchResponse({
                  index: 'firstIndex',
                }),
              ]),
            },
            {
              indexId: 'secondIndex',
              helper,
              results: new SearchResults(helper.state, [
                createSingleSearchResponse({
                  index: 'secondIndex',
                }),
              ]),
            },
          ],
          state: helper.state,
          helper,
        })
      );

      const secondRenderingOptions = rendering.mock.calls[1][0];
      const items: CurrentRefinementsConnectorParamsItem[] =
        secondRenderingOptions.items;
      expect(items).toHaveLength(4);
      expect(items).toEqual([
        {
          indexName: 'indexName',
          attribute: 'facet1',
          label: 'facet1',
          refinements: [
            {
              attribute: 'facet1',
              label: 'facetValue',
              type: 'facet',
              value: 'facetValue',
            },
          ],
          refine: expect.any(Function),
        },
        {
          indexName: 'indexName',
          attribute: 'facet2',
          label: 'facet2',
          refinements: [
            {
              attribute: 'facet2',
              label: 'facetValue',
              type: 'facet',
              value: 'facetValue',
            },
          ],
          refine: expect.any(Function),
        },
        {
          indexName: 'indexName',
          attribute: 'facet1',
          label: 'facet1',
          refinements: [
            {
              attribute: 'facet1',
              label: 'facetValue',
              type: 'facet',
              value: 'facetValue',
            },
          ],
          refine: expect.any(Function),
        },
        {
          indexName: 'indexName',
          attribute: 'facet2',
          label: 'facet2',
          refinements: [
            {
              attribute: 'facet2',
              label: 'facetValue',
              type: 'facet',
              value: 'facetValue',
            },
          ],
          refine: expect.any(Function),
        },
      ]);
    });
  });
});
