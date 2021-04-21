import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { warning } from '../../../lib/utils';
import connectHierarchicalMenu from '../connectHierarchicalMenu';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';

describe('connectHierarchicalMenu', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectHierarchicalMenu()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/#connector"
`);
    });

    it('throws without attributes', () => {
      expect(() => {
        // @ts-expect-error
        connectHierarchicalMenu(() => {})({ attributes: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/#connector"
`);
    });

    it('throws with empty attributes', () => {
      expect(() => {
        connectHierarchicalMenu(() => {})({ attributes: [] });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/#connector"
`);
    });

    it('throws with non-array attributes', () => {
      expect(() => {
        // @ts-expect-error
        connectHierarchicalMenu(() => {})({ attributes: 'attributes' });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customHierarchicalMenu = connectHierarchicalMenu(render, unmount);
      const widget = customHierarchicalMenu({ attributes: ['category'] });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.hierarchicalMenu',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),

          getWidgetUiState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectHierarchicalMenu(rendering);
    const widget = makeWidget({
      attributes: ['category', 'sub_category'],
    });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    expect(config).toEqual(
      new SearchParameters({
        hierarchicalFacets: [
          {
            attributes: ['category', 'sub_category'],
            name: 'category',
            rootPath: null,
            separator: ' > ',
            // @ts-ignore `showParentLevel` is missing in the SearchParameters.HierarchicalFacet declaration
            showParentLevel: true,
          },
        ],
        hierarchicalFacetsRefinements: {
          category: [],
        },
        maxValuesPerFacet: 10,
      })
    );

    // test if widget is not rendered yet at this point
    expect(rendering).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering).toHaveBeenCalledTimes(1);
    // test if isFirstRendering is true during init
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        widgetParams: { attributes: ['category', 'sub_category'] },
      }),
      true
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({}),
        ]),
        state: helper.state,
        helper,
      })
    );

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        widgetParams: { attributes: ['category', 'sub_category'] },
      }),
      false
    );
  });

  it('Provide a function to clear the refinements at each step', () => {
    const rendering = jest.fn();
    const makeWidget = connectHierarchicalMenu(rendering);
    const widget = makeWidget({
      attributes: ['category', 'sub_category'],
    });

    const helper = algoliasearchHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
    );
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'value');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine } = firstRenderingOptions;
    refine('value');
    expect(helper.hasRefinements('category')).toBe(false);
    refine('value');
    expect(helper.hasRefinements('category')).toBe(true);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({}),
          createSingleSearchResponse({}),
        ]),
        state: helper.state,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { refine: renderToggleRefinement } = secondRenderingOptions;
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(false);
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(true);
  });

  it('provides the correct facet values', () => {
    const rendering = jest.fn();
    const makeWidget = connectHierarchicalMenu(rendering);
    const widget = makeWidget({
      attributes: ['category', 'subCategory'],
    });

    const helper = algoliasearchHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
    );
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    // During the first rendering there are no facet values
    // The function get an empty array so that it doesn't break
    // over null-ish values.
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [],
      }),
      expect.anything()
    );

    widget.render!(
      createRenderOptions({
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
        state: helper.state,
        helper,
      })
    );

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          {
            label: 'Decoration',
            value: 'Decoration',
            count: 880,
            exhaustive: true,
            isRefined: true,
            data: [
              {
                label: 'Candle holders & candles',
                value: 'Decoration > Candle holders & candles',
                count: 193,
                exhaustive: true,
                isRefined: false,
                data: null,
              },
              {
                label: 'Frames & pictures',
                value: 'Decoration > Frames & pictures',
                count: 173,
                exhaustive: true,
                isRefined: false,
                data: null,
              },
            ],
          },
          {
            label: 'Outdoor',
            value: 'Outdoor',
            count: 47,
            exhaustive: true,
            isRefined: false,
            data: null,
          },
        ],
      }),
      expect.anything()
    );
  });

  it('provides the correct transformed facet values', () => {
    const rendering = jest.fn();
    const makeWidget = connectHierarchicalMenu(rendering);
    const widget = makeWidget({
      attributes: ['category', 'subCategory'],
      transformItems: items =>
        items.map(item => ({
          ...item,
          label: 'transformed',
        })),
    });

    const helper = algoliasearchHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
    );
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({ items: [] }),
      expect.anything()
    );

    widget.render!(
      createRenderOptions({
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
        state: helper.state,
        helper,
      })
    );

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({ label: 'transformed' }),
          expect.objectContaining({ label: 'transformed' }),
        ],
      }),
      expect.anything()
    );
  });

  describe('dispose', () => {
    it('does not throw without the unmount function', () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);
      const widget = makeWidget({
        attributes: ['category'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        '',
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );
      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('unsets maxValuesPerFacet fully', () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);
      const indexName = '';
      const widget = makeWidget({
        attributes: ['category'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        indexName,
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      expect(
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).toEqual(new SearchParameters({ index: indexName }));
    });

    it('unsets refinement', () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);
      const indexName = '';
      const widget = makeWidget({
        attributes: ['category'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        indexName,
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      const firstRenderingOptions = rendering.mock.calls[0][0];
      const { refine } = firstRenderingOptions;
      refine('zombo.com');

      expect(helper.state.hierarchicalFacetsRefinements).toEqual({
        category: ['zombo.com'],
      });

      expect(
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).toEqual(new SearchParameters({ index: indexName }));
    });
  });

  describe('getRenderState', () => {
    test('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createHierarchicalMenu = connectHierarchicalMenu(
        renderFn,
        unmountFn
      );
      const hierarchicalMenu = createHierarchicalMenu({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        hierarchicalMenu.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      const renderState = {
        hierarchicalMenu: {
          anotherCategory: {
            items: [],
            refine: () => {},
            canRefine: false,
            createURL: () => '',
            sendEvent: () => {},
            widgetParams: {
              attributes: ['anotherCategory', 'anotherSubCategory'],
            },
            isShowingMore: false,
            toggleShowMore: () => {},
            canToggleShowMore: false,
          },
        },
      };

      expect(
        hierarchicalMenu.getRenderState(
          renderState,
          createInitOptions({ helper })
        ).hierarchicalMenu
      ).toEqual({
        anotherCategory: renderState.hierarchicalMenu.anotherCategory,
        category: {
          items: [],
          refine: expect.any(Function),
          canRefine: false,
          createURL: expect.any(Function),
          sendEvent: expect.any(Function),
          widgetParams: { attributes: ['category', 'subCategory'] },
          isShowingMore: false,
          toggleShowMore: expect.any(Function),
          canToggleShowMore: false,
        },
      });
    });

    test('returns the render state with results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createHierarchicalMenu = connectHierarchicalMenu(
        renderFn,
        unmountFn
      );
      const hierarchicalMenu = createHierarchicalMenu({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        hierarchicalMenu.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      hierarchicalMenu.init!(createInitOptions({ helper }));

      expect(
        hierarchicalMenu.getRenderState(
          {},
          createRenderOptions({
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
          })
        ).hierarchicalMenu!.category
      ).toEqual({
        items: [
          {
            count: 880,
            data: null,
            exhaustive: true,
            isRefined: false,
            label: 'Decoration',
            value: 'Decoration',
          },
        ],
        refine: expect.any(Function),
        canRefine: true,
        createURL: expect.any(Function),
        sendEvent: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
        isShowingMore: false,
        toggleShowMore: expect.any(Function),
        canToggleShowMore: false,
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createHierarchicalMenu = connectHierarchicalMenu(
        renderFn,
        unmountFn
      );
      const hierarchicalMenu = createHierarchicalMenu({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        hierarchicalMenu.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      const initOptions = createInitOptions({
        state: helper.state,
        helper,
      });

      expect(hierarchicalMenu.getWidgetRenderState(initOptions)).toEqual({
        items: [],
        refine: expect.any(Function),
        canRefine: false,
        sendEvent: expect.any(Function),
        createURL: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
        isShowingMore: false,
        toggleShowMore: expect.any(Function),
        canToggleShowMore: false,
      });
    });

    test('returns the widget render state with results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createHierarchicalMenu = connectHierarchicalMenu(
        renderFn,
        unmountFn
      );
      const hierarchicalMenu = createHierarchicalMenu({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        hierarchicalMenu.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      hierarchicalMenu.init!(createInitOptions({ helper }));

      expect(
        hierarchicalMenu.getWidgetRenderState(
          createRenderOptions({
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
          })
        )
      ).toEqual({
        items: [
          {
            count: 880,
            data: null,
            exhaustive: true,
            isRefined: false,
            label: 'Decoration',
            value: 'Decoration',
          },
        ],
        refine: expect.any(Function),
        canRefine: true,
        sendEvent: expect.any(Function),
        createURL: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
        isShowingMore: false,
        toggleShowMore: expect.any(Function),
        canToggleShowMore: false,
      });
    });
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` empty', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
      });

      const actual = widget.getWidgetUiState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a refinement', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'categoriesLvl0',
            attributes: ['categoriesLvl0', 'categoriesLvl1'],
            separator: ' > ',
            rootPath: null,
            // @ts-ignore `showParentLevel` is missing in the SearchParameters.HierarchicalFacet declaration
            showParentLevel: true,
          },
        ],
        hierarchicalFacetsRefinements: {
          categoriesLvl0: ['TopLevel > SubLevel'],
        },
      });

      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
      });

      const actual = widget.getWidgetUiState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        hierarchicalMenu: {
          categoriesLvl0: ['TopLevel', 'SubLevel'],
        },
      });
    });

    test('returns the `uiState` without namespace overridden', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'categoriesLvl0',
            attributes: ['categoriesLvl0', 'categoriesLvl1'],
            separator: ' > ',
            rootPath: null,
            // @ts-ignore `showParentLevel` is missing in the SearchParameters.HierarchicalFacet declaration
            showParentLevel: true,
          },
        ],
        hierarchicalFacetsRefinements: {
          categoriesLvl0: ['TopLevelCategories > SubLevelCategories'],
        },
      });

      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
      });

      const actual = widget.getWidgetUiState!(
        {
          hierarchicalMenu: {
            countryLvl0: ['TopLevelCountry', 'SubLevelCountry'],
          },
        },
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        hierarchicalMenu: {
          categoriesLvl0: ['TopLevelCategories', 'SubLevelCategories'],
          countryLvl0: ['TopLevelCountry', 'SubLevelCountry'],
        },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    beforeEach(() => {
      warning.cache = {};
    });

    test('returns the `SearchParameters` with the default value', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'categoriesLvl0',
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
          separator: ' > ',
          rootPath: null,
          showParentLevel: true,
        },
      ]);

      expect(actual.hierarchicalFacetsRefinements).toEqual({
        categoriesLvl0: [],
      });
    });

    test('returns the `SearchParameters` with the default value without the previous refinement', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'categoriesLvl0',
            attributes: ['categoriesLvl0', 'categoriesLvl1'],
            separator: ' > ',
            rootPath: null,
          },
        ],
        hierarchicalFacetsRefinements: {
          categoriesLvl0: ['TopLevel > SubLevel'],
        },
      });

      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'categoriesLvl0',
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
          separator: ' > ',
          rootPath: null,
          showParentLevel: true,
        },
      ]);

      expect(actual.hierarchicalFacetsRefinements).toEqual({
        categoriesLvl0: [],
      });
    });

    test('returns the `SearchParameters` with the value from `uiState`', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          hierarchicalMenu: {
            categoriesLvl0: ['TopLevel', 'SubLevel'],
          },
        },
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'categoriesLvl0',
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
          separator: ' > ',
          rootPath: null,
          showParentLevel: true,
        },
      ]);

      expect(actual.hierarchicalFacetsRefinements).toEqual({
        categoriesLvl0: ['TopLevel > SubLevel'],
      });
    });

    test('returns the `SearchParameters` with the value from `uiState` without the previous refinement', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'categoriesLvl0',
            attributes: ['categoriesLvl0', 'categoriesLvl1'],
            separator: ' > ',
            rootPath: null,
          },
        ],
        hierarchicalFacetsRefinements: {
          categoriesLvl0: ['AnotherTopLevel > AnotherSubLevel'],
        },
      });

      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          hierarchicalMenu: {
            categoriesLvl0: ['TopLevel', 'SubLevel'],
          },
        },
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'categoriesLvl0',
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
          separator: ' > ',
          rootPath: null,
          showParentLevel: true,
        },
      ]);

      expect(actual.hierarchicalFacetsRefinements).toEqual({
        categoriesLvl0: ['TopLevel > SubLevel'],
      });
    });

    test('returns the `SearchParameters` with a custom `separator`', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
        separator: ' / ',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets[0].separator).toBe(' / ');
    });

    test('returns the `SearchParameters` with a custom `rootPath`', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
        rootPath: 'TopLevel > SubLevel',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets[0].rootPath).toBe('TopLevel > SubLevel');
    });

    test('returns the `SearchParameters` with a custom `showParentLevel`', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['categoriesLvl0', 'categoriesLvl1'],
        showParentLevel: true,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      // @ts-ignore `showParentLevel` is missing in the SearchParameters.HierarchicalFacet declaration
      expect(actual.hierarchicalFacets[0].showParentLevel).toBe(true);
    });

    it('warns with the same `hierarchicalFacets` already defined with different `attributes`', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'sub_category', 'sub_sub_category'],
            separator: ' > ',
            rootPath: null,
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
      });

      expect(() =>
        widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        })
      ).toWarnDev();
    });

    it('warns with the same `hierarchicalFacets` already defined with different `separator`', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'sub_category'],
            separator: ' > ',
            rootPath: null,
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
        separator: ' / ',
      });

      expect(() =>
        widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        })
      ).toWarnDev();
    });

    it('warns with the same `hierarchicalFacets` already defined with different `rootPath`', () => {
      const render = () => {};
      const makeWidget = connectHierarchicalMenu(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'sub_category'],
            separator: ' > ',
            rootPath: 'TopLevel > SubLevel',
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
        rootPath: 'TopLevel',
      });

      expect(() =>
        widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        })
      ).toWarnDev();
    });

    describe('with `maxValuesPerFacet`', () => {
      test('returns the `SearchParameters` with default `limit`', () => {
        const render = () => {};
        const makeWidget = connectHierarchicalMenu(render);
        const helper = algoliasearchHelper(createSearchClient(), '');
        const widget = makeWidget({
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(10);
      });

      test('returns the `SearchParameters` with provided `limit`', () => {
        const render = () => {};
        const makeWidget = connectHierarchicalMenu(render);
        const helper = algoliasearchHelper(createSearchClient(), '');
        const widget = makeWidget({
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
          limit: 5,
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(5);
      });

      test('returns the `SearchParameters` with default `showMoreLimit`', () => {
        const render = () => {};
        const makeWidget = connectHierarchicalMenu(render);
        const helper = algoliasearchHelper(createSearchClient(), '');
        const widget = makeWidget({
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
          showMore: true,
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(20);
      });

      test('returns the `SearchParameters` with provided `showMoreLimit`', () => {
        const render = () => {};
        const makeWidget = connectHierarchicalMenu(render);
        const helper = algoliasearchHelper(createSearchClient(), '');
        const widget = makeWidget({
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
          showMore: true,
          showMoreLimit: 15,
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(15);
      });

      test('returns the `SearchParameters` with the previous value if higher than `limit`/`showMoreLimit`', () => {
        const render = () => {};
        const makeWidget = connectHierarchicalMenu(render);
        const helper = algoliasearchHelper(createSearchClient(), '', {
          maxValuesPerFacet: 100,
        });

        const widget = makeWidget({
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(100);
      });

      test('returns the `SearchParameters` with `limit`/`showMoreLimit` if higher than previous value', () => {
        const render = () => {};
        const makeWidget = connectHierarchicalMenu(render);
        const helper = algoliasearchHelper(createSearchClient(), '', {
          maxValuesPerFacet: 100,
        });

        const widget = makeWidget({
          attributes: ['categoriesLvl0', 'categoriesLvl1'],
          limit: 110,
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(110);
      });
    });
  });

  describe('show more', () => {
    it('can toggle the limits based on the default showMoreLimit value', () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);
      const widget = makeWidget({
        attributes: ['category'],
        limit: 2,
        showMore: true,
      });

      const helper = algoliasearchHelper(
        createSearchClient(),
        '',
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              facets: {
                category: {
                  a: 880,
                  b: 880,
                  c: 880,
                  d: 880,
                },
              },
            }),
            createSingleSearchResponse({
              facets: {
                category: {
                  a: 880,
                  b: 880,
                  c: 880,
                  d: 880,
                },
              },
            }),
          ]),
          state: helper.state,
          helper,
        })
      );

      const { toggleShowMore } = rendering.mock.calls[1][0];

      expect(rendering).toHaveBeenLastCalledWith(
        expect.objectContaining({
          items: [
            {
              label: 'a',
              value: 'a',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
            {
              label: 'b',
              value: 'b',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
          ],
        }),
        expect.anything()
      );

      toggleShowMore();

      expect(rendering).toHaveBeenLastCalledWith(
        expect.objectContaining({
          items: [
            {
              label: 'a',
              value: 'a',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
            {
              label: 'b',
              value: 'b',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
            {
              label: 'c',
              value: 'c',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
            {
              label: 'd',
              value: 'd',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
          ],
        }),
        expect.anything()
      );
    });

    it('can toggle the limits based on showMoreLimit', () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);
      const widget = makeWidget({
        attributes: ['category'],
        limit: 2,
        showMore: true,
        showMoreLimit: 3,
      });

      const helper = algoliasearchHelper(
        createSearchClient(),
        '',
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              facets: {
                category: {
                  a: 880,
                  b: 880,
                  c: 880,
                  d: 880,
                },
              },
            }),
            createSingleSearchResponse({
              facets: {
                category: {
                  a: 880,
                  b: 880,
                  c: 880,
                  d: 880,
                },
              },
            }),
          ]),
          state: helper.state,
          helper,
        })
      );

      const { toggleShowMore } = rendering.mock.calls[1][0];

      expect(rendering).toHaveBeenLastCalledWith(
        expect.objectContaining({
          items: [
            {
              label: 'a',
              value: 'a',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
            {
              label: 'b',
              value: 'b',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
          ],
        }),
        expect.anything()
      );

      toggleShowMore();

      expect(rendering).toHaveBeenLastCalledWith(
        expect.objectContaining({
          items: [
            {
              label: 'a',
              value: 'a',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
            {
              label: 'b',
              value: 'b',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
            {
              label: 'c',
              value: 'c',
              count: 880,
              exhaustive: true,
              isRefined: false,
              data: null,
            },
          ],
        }),
        expect.anything()
      );
    });
  });

  describe('insights', () => {
    it('sends event when a facet is added', () => {
      const rendering = jest.fn();
      const instantSearchInstance = createInstantSearch();
      const makeWidget = connectHierarchicalMenu(rendering);
      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
      });

      const helper = algoliasearchHelper(
        createSearchClient(),
        '',
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
          instantSearchInstance,
        })
      );

      const firstRenderingOptions = rendering.mock.calls[0][0];
      const { refine } = firstRenderingOptions;
      refine('value');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'category',
        eventType: 'click',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Filter Applied',
          filters: ['category:value'],
          index: '',
        },
        widgetType: 'ais.hierarchicalMenu',
      });
    });
  });
});
