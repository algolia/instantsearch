/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';

import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import { warning } from '../../../lib/utils';
import connectBreadcrumb from '../connectBreadcrumb';

describe('connectBreadcrumb', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectBreadcrumb()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/#connector"
`);
    });

    it('throws with undefined `attributes`', () => {
      expect(() => {
        connectBreadcrumb(() => {})({
          // @ts-expect-error
          attributes: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/#connector"
`);
    });

    it('throws with empty `attributes`', () => {
      expect(() => {
        connectBreadcrumb(() => {})({
          attributes: [],
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/#connector"
`);
    });
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customBreadcrumb = connectBreadcrumb(render, unmount);
    const widget = customBreadcrumb({ attributes: ['category'] });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.breadcrumb',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  describe('getRenderState', () => {
    test('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createBreadcrumb = connectBreadcrumb(renderFn, unmountFn);
      const breadcrumb = createBreadcrumb({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        breadcrumb.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      helper.toggleFacetRefinement('category', 'Decoration');

      const renderState1 = breadcrumb.getRenderState(
        {
          breadcrumb: {
            anotherCategory: {
              canRefine: false,
              createURL: () => '',
              items: [],
              refine: () => {},
              widgetParams: { attributes: ['anotherCategory'] },
            },
          },
        },
        createInitOptions({ helper })
      );

      expect(renderState1.breadcrumb).toEqual({
        anotherCategory: {
          canRefine: false,
          createURL: expect.any(Function),
          items: [],
          refine: expect.any(Function),
          widgetParams: { attributes: ['anotherCategory'] },
        },
        category: {
          canRefine: false,
          createURL: expect.any(Function),
          items: [],
          refine: expect.any(Function),
          widgetParams: { attributes: ['category', 'subCategory'] },
        },
      });

      breadcrumb.init!(createInitOptions({ helper }));

      const renderState2 = breadcrumb.getRenderState(
        {
          breadcrumb: {
            anotherCategory: {
              canRefine: false,
              createURL: () => '',
              items: [],
              refine: () => {},
              widgetParams: { attributes: ['anotherCategory'] },
            },
          },
        },
        createRenderOptions({
          helper,
          state: helper.state,
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
      );

      expect(renderState2.breadcrumb).toEqual({
        anotherCategory: {
          canRefine: false,
          createURL: expect.any(Function),
          items: [],
          refine: expect.any(Function),
          widgetParams: { attributes: ['anotherCategory'] },
        },
        category: {
          canRefine: true,
          createURL: expect.any(Function),
          items: [{ label: 'Decoration', value: null }],
          refine: expect.any(Function),
          widgetParams: { attributes: ['category', 'subCategory'] },
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createBreadcrumb = connectBreadcrumb(renderFn, unmountFn);
      const breadcrumb = createBreadcrumb({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        breadcrumb.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      helper.toggleFacetRefinement('category', 'Decoration');

      const renderState1 = breadcrumb.getWidgetRenderState(
        createInitOptions({ helper })
      );

      expect(renderState1).toEqual({
        canRefine: false,
        createURL: expect.any(Function),
        items: [],
        refine: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
      });

      breadcrumb.init!(createInitOptions({ helper }));

      const renderState2 = breadcrumb.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
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
      );

      expect(renderState2).toEqual({
        canRefine: true,
        createURL: expect.any(Function),
        items: [{ label: 'Decoration', value: null }],
        refine: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
      });
    });

    it('returns an empty array of items if no hierarchicalFacets exist', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createBreadcrumb = connectBreadcrumb(renderFn, unmountFn);
      const breadcrumb = createBreadcrumb({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');

      const results = new algoliasearchHelper.SearchResults(helper.state, [
        {
          query: helper.state.query ?? '',
          page: helper.state.page ?? 0,
          hitsPerPage: helper.state.hitsPerPage ?? 20,
          hits: [],
          nbHits: 0,
          nbPages: 0,
          params: '',
          exhaustiveNbHits: true,
          exhaustiveFacetsCount: true,
          processingTimeMS: 0,
          index: helper.state.index,
        },
      ]);

      const renderState = breadcrumb.getWidgetRenderState(
        createRenderOptions({
          helper,
          results,
          state: results._state,
        })
      );

      expect(renderState).toEqual({
        canRefine: false,
        createURL: expect.any(Function),
        items: [],
        refine: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
      });
    });

    it('returns an empty array of items if no hierarchicalFacets result exist', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createBreadcrumb = connectBreadcrumb(renderFn, unmountFn);
      const breadcrumb = createBreadcrumb({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        breadcrumb.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      const results = new algoliasearchHelper.SearchResults(
        new SearchParameters({ index: helper.state.index }),
        [
          {
            query: helper.state.query ?? '',
            page: helper.state.page ?? 0,
            hitsPerPage: helper.state.hitsPerPage ?? 20,
            hits: [],
            nbHits: 0,
            nbPages: 0,
            params: '',
            exhaustiveNbHits: true,
            exhaustiveFacetsCount: true,
            processingTimeMS: 0,
            index: helper.state.index,
          },
        ]
      );

      const renderState = breadcrumb.getWidgetRenderState(
        createRenderOptions({
          helper,
          results,
          state: helper.state,
        })
      );

      expect(renderState).toEqual({
        canRefine: false,
        createURL: expect.any(Function),
        items: [],
        refine: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
      });
    });

    it('returns an empty array of items if only non-hierarchicalFacets result exist', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createBreadcrumb = connectBreadcrumb(renderFn, unmountFn);
      const breadcrumb = createBreadcrumb({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'indexName',
        breadcrumb.getWidgetSearchParameters!(
          new SearchParameters({
            hierarchicalFacets: [
              {
                attributes: ['country'],
                name: 'country',
              },
            ],
          }),
          {
            uiState: {},
          }
        )
      );

      helper.toggleFacetRefinement('country', 'country');

      const renderState1 = breadcrumb.getWidgetRenderState(
        createInitOptions({ helper })
      );

      expect(renderState1).toEqual({
        canRefine: false,
        createURL: expect.any(Function),
        items: [],
        refine: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
      });

      helper.toggleFacetRefinement('category', 'Decoration');

      const renderState2 = breadcrumb.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
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
      );

      expect(renderState2).toEqual({
        canRefine: true,
        createURL: expect.any(Function),
        items: [{ label: 'Decoration', value: null }],
        refine: expect.any(Function),
        widgetParams: { attributes: ['category', 'subCategory'] },
      });
    });

    test('refine method called with null does not mutate the current helper state if no hierarchicalFacets exist', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createBreadcrumb = connectBreadcrumb(renderFn, unmountFn);
      const breadcrumb = createBreadcrumb({
        attributes: ['category', 'subCategory'],
      });
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');

      const renderState = breadcrumb.getWidgetRenderState(
        createInitOptions({ helper })
      );

      renderState.refine(null);

      expect(helper.state).toEqual({
        facets: [],
        disjunctiveFacets: [],
        hierarchicalFacets: [],
        facetsRefinements: {},
        facetsExcludes: {},
        disjunctiveFacetsRefinements: {},
        numericRefinements: {},
        tagRefinements: [],
        hierarchicalFacetsRefinements: {},
        index: 'indexName',
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    beforeEach(() => {
      warning.cache = {};
    });

    it('returns the `SearchParameters` with default value', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'category',
          attributes: ['category', 'subCategory'],
          rootPath: null,
          separator: ' > ',
        },
      ]);
    });

    it('returns the `SearchParameters` with default a custom `separator`', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
        separator: ' / ',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'category',
          attributes: ['category', 'subCategory'],
          rootPath: null,
          separator: ' / ',
        },
      ]);
    });

    it('returns the `SearchParameters` with default a custom `rootPath`', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '');
      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
        rootPath: 'TopLevel > SubLevel',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'category',
          attributes: ['category', 'subCategory'],
          rootPath: 'TopLevel > SubLevel',
          separator: ' > ',
        },
      ]);
    });

    it('returns the `SearchParameters` with another `hierarchicalFacets` already defined', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'country',
            attributes: ['country', 'sub_country'],
            separator: ' > ',
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'country',
          attributes: ['country', 'sub_country'],
          separator: ' > ',
        },
        {
          name: 'category',
          attributes: ['category', 'subCategory'],
          separator: ' > ',
          rootPath: null,
        },
      ]);
    });

    it('returns the `SearchParameters` with the same `hierarchicalFacets` already defined', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'subCategory'],
            separator: ' > ',
            rootPath: null,
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hierarchicalFacets).toEqual([
        {
          name: 'category',
          attributes: ['category', 'subCategory'],
          separator: ' > ',
          rootPath: null,
        },
      ]);
    });

    it('warns with the same `hierarchicalFacets` already defined with different `attributes`', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'subCategory', 'subSubCategory'],
            separator: ' > ',
            rootPath: null,
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
      });

      expect(() =>
        widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        })
      ).toWarnDev();
    });

    it('warns with the same `hierarchicalFacets` already defined with different `separator`', () => {
      const render = () => {};
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'subCategory'],
            separator: ' > ',
            rootPath: null,
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
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
      const makeWidget = connectBreadcrumb(render);
      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacets: [
          {
            name: 'category',
            attributes: ['category', 'subCategory'],
            separator: ' > ',
            rootPath: 'TopLevel > SubLevel',
          },
        ],
      });

      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
        rootPath: 'TopLevel',
      });

      expect(() =>
        widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        })
      ).toWarnDev();
    });
  });

  it('Renders during init and render', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'subCategory'] });

    const config = widget.getWidgetSearchParameters!(new SearchParameters({}), {
      uiState: {},
    });
    expect(config).toEqual(
      new SearchParameters({
        hierarchicalFacets: [
          {
            attributes: ['category', 'subCategory'],
            name: 'category',
            rootPath: null,
            separator: ' > ',
          },
        ],
        hierarchicalFacetsRefinements: {
          category: [],
        },
      })
    );

    // Verify that the widget has not been rendered yet at this point
    expect(rendering.mock.calls).toHaveLength(0);

    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    // Verify that rendering has been called upon init with isFirstRendering = true
    expect(rendering.mock.calls).toHaveLength(1);
    expect(rendering.mock.calls[0][0].widgetParams).toEqual({
      attributes: ['category', 'subCategory'],
    });
    expect(rendering.mock.calls[0][1]).toBe(true);

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

    // Verify that rendering has been called upon render with isFirstRendering = false
    expect(rendering.mock.calls).toHaveLength(2);
    expect(rendering.mock.calls[1][0].widgetParams).toEqual({
      attributes: ['category', 'subCategory'],
    });
    expect(rendering.mock.calls[1][1]).toBe(false);
  });

  it('provides the correct facet values', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'subCategory'] });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    helper.toggleFacetRefinement('category', 'Decoration');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

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

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([
      { label: 'Decoration', value: null },
    ]);
  });

  it('provides escaped facet values', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'subCategory'] });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    helper.toggleFacetRefinement('category', '-20 degrees > -20°C');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                discounts: 880,
                '-20 degrees': 15,
              },
              subCategory: {
                '-20 degrees > -20°C': 193,
                '-20 degrees > cold': 173,
                'discounts > -50%': 193,
                'discounts > FREE!!8!': 173,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                discounts: 880,
                '-20 degrees': 15,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([
      { label: '-20 degrees', value: '\\-20 degrees > -20°C' },
      { label: '-20°C', value: null },
    ]);
  });

  it('provides items from an empty results', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({
      attributes: ['category', 'subCategory'],
    });

    const config = widget.getWidgetSearchParameters!(new SearchParameters({}), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);

    helper.search = jest.fn();

    helper.toggleFacetRefinement('category', 'Decoration');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {},
          }),
          createSingleSearchResponse({
            hits: [],
            facets: {},
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([]);
  });

  it('provides the correct facet values when transformed', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({
      attributes: ['category', 'subCategory'],
      transformItems: (items) =>
        items.map((item) => ({ ...item, label: 'transformed' })),
    });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    helper.toggleFacetRefinement('category', 'Decoration');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

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

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([
      expect.objectContaining({ label: 'transformed' }),
    ]);
  });

  it('provides search results within transformItems', () => {
    const transformItems = jest.fn((items) => items);
    const makeWidget = connectBreadcrumb(() => {});
    const widget = makeWidget({
      attributes: ['category'],
      transformItems,
    });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse(),
    ]);

    widget.init!(createInitOptions({ helper, state: helper.state }));
    widget.render!(
      createRenderOptions({
        results,
        state: helper.state,
        helper,
      })
    );

    expect(transformItems).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ results })
    );
  });

  it('returns the correct URL', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'subCategory'] });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: (arg) =>
          typeof arg === 'function'
            ? JSON.stringify(arg({}))
            : JSON.stringify(arg),
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

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
        createURL: (arg) =>
          typeof arg === 'function'
            ? JSON.stringify(arg({}))
            : JSON.stringify(arg),
      })
    );
    const createURL = rendering.mock.calls[1][0].createURL;
    expect(helper.state.hierarchicalFacetsRefinements).toEqual({
      category: [],
    });
    const stateForURL = JSON.parse(
      createURL('Decoration > Candle holders & candles')
    );
    expect(stateForURL.hierarchicalMenu).toEqual({
      category: ['Decoration', 'Candle holders & candles'],
    });
  });

  it('returns the correct URL version with 3 levels', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({
      attributes: [
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ],
    });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: (arg) =>
          typeof arg === 'function'
            ? JSON.stringify(arg({}))
            : JSON.stringify(arg),
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    helper.toggleFacetRefinement(
      'hierarchicalCategories.lvl0',
      'Cameras & Camcorders > Digital Cameras > Digital SLR Cameras'
    );
    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            page: 0,
            nbPages: 57,
            index: 'instant_search',
            processingTimeMS: 1,
            nbHits: 170,
            query: '',
            hitsPerPage: 3,
            params:
              'query=&hitsPerPage=3&page=0&facets=%5B%22hierarchicalCategories.lvl0%22%2C%22hierarchicalCategories.lvl1%22%2C%22hierarchicalCategories.lvl2%22%5D&tagFilters=&facetFilters=%5B%5B%22hierarchicalCategories.lvl1%3ACameras%20%26%20Camcorders%20%3E%20Digital%20Cameras%22%5D%5D',
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            facets: {
              'hierarchicalCategories.lvl1': {
                'Cameras & Camcorders > Digital Cameras': 170,
              },
              'hierarchicalCategories.lvl2': {
                'Cameras & Camcorders > Digital Cameras > Digital SLR Cameras': 44,
                'Cameras & Camcorders > Digital Cameras > Mirrorless Cameras': 29,
                'Cameras & Camcorders > Digital Cameras > Point & Shoot Cameras': 84,
              },
              'hierarchicalCategories.lvl0': {
                'Cameras & Camcorders': 170,
              },
            },
          }),
          createSingleSearchResponse({
            exhaustiveFacetsCount: true,
            params:
              'query=&hitsPerPage=1&page=0&attributesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&tagFilters=&facets=%5B%22hierarchicalCategories.lvl0%22%2C%22hierarchicalCategories.lvl1%22%5D&facetFilters=%5B%5B%22hierarchicalCategories.lvl0%3ACameras%20%26%20Camcorders%22%5D%5D',
            facets: {
              'hierarchicalCategories.lvl0': {
                'Cameras & Camcorders': 1369,
              },
              'hierarchicalCategories.lvl1': {
                'Cameras & Camcorders > Camcorders': 50,
                'Cameras & Camcorders > Memory Cards': 113,
                'Cameras & Camcorders > Trail Cameras': 5,
                'Cameras & Camcorders > Microscopes': 5,
                'Cameras & Camcorders > Spotting Scopes': 5,
                'Cameras & Camcorders > Telescopes': 15,
                'Cameras & Camcorders > Monoculars': 5,
                'Cameras & Camcorders > Digital Cameras': 170,
                'Cameras & Camcorders > P&S Adapters & Chargers': 1,
                'Cameras & Camcorders > Binoculars': 20,
                'Cameras & Camcorders > Camcorder Accessories': 173,
                'Cameras & Camcorders > Digital Camera Accessories': 804,
              },
            },
            exhaustiveNbHits: true,
            hitsPerPage: 1,
            index: 'instant_search',
            processingTimeMS: 1,
            nbPages: 1000,
            nbHits: 1369,
            query: '',
            page: 0,
            hits: [],
          }),
          createSingleSearchResponse({
            params:
              'query=&hitsPerPage=1&page=0&attributesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&tagFilters=&facets=%5B%22hierarchicalCategories.lvl0%22%5D',
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            facets: {
              'hierarchicalCategories.lvl0': {
                Audio: 1570,
                'Computers & Tablets': 3563,
                'Movies & Music': 18,
                Paper: 65,
                'MP Pending': 3,
                'Cameras & Camcorders': 1369,
                'Cell Phones': 3291,
                Appliances: 4306,
                'Custom Parts': 2,
                'Health, Fitness & Beauty': 923,
                'Video Games': 505,
                'Office & School Supplies': 617,
                'Entertainment Gift Cards': 46,
                'Musical Instruments': 312,
                'MP Exclusives': 1,
                'Toys, Games & Drones': 285,
                'Name Brands': 101,
                'Batteries & Power': 7,
                'Star Wars': 1,
                'Geek Squad': 2,
                'DC Comics': 1,
                'Scanners, Faxes & Copiers': 46,
                'Furniture & Decor': 91,
                'Household Essentials': 148,
                'Car Electronics & GPS': 1208,
                'Magnolia Home Theater': 33,
                Housewares: 255,
                'Smart Home': 405,
                'Beverage & Wine Coolers': 1,
                'TV & Home Theater': 1201,
                'Avengers: Age of Ultron': 1,
                Exclusives: 1,
                'Gift Ideas': 2,
                'Carfi Instore Only': 4,
                'Office Electronics': 328,
                'Office Furniture & Storage': 152,
                'Wearable Technology': 271,
                'In-Store Only': 2,
                'Telephones & Communication': 194,
              },
            },
            hitsPerPage: 1,
            nbPages: 1000,
            processingTimeMS: 1,
            index: 'instant_search',
            query: '',
            nbHits: 21469,
            hits: [],
            page: 0,
          }),
        ]),
        state: helper.state,
        helper,
        createURL: (arg) =>
          typeof arg === 'function'
            ? JSON.stringify(arg({}))
            : JSON.stringify(arg),
      })
    );
    const { createURL, items } = rendering.mock.calls[1][0];
    const secondItemValue = items[1].value;

    const stateForURL = JSON.parse(createURL(secondItemValue));

    expect(stateForURL.hierarchicalMenu).toEqual({
      'hierarchicalCategories.lvl0': [
        'Cameras & Camcorders',
        'Digital Cameras',
      ],
    });
    const stateForHome = JSON.parse(createURL(null));
    expect(stateForHome.hierarchicalMenu).toEqual(undefined);
  });

  it('toggles the refine function when passed the special value null', () => {
    const rendering = jest.fn();
    const makeWidget = connectBreadcrumb(rendering);
    const widget = makeWidget({ attributes: ['category', 'subCategory'] });

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    const helper = algoliasearchHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    helper.toggleFacetRefinement('category', 'Decoration');

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
    const refine = rendering.mock.calls[1][0].refine;
    expect(helper.getHierarchicalFacetBreadcrumb('category')).toEqual([
      'Decoration',
    ]);
    refine(null);
    expect(helper.getHierarchicalFacetBreadcrumb('category')).toEqual([]);
  });

  describe('dispose', () => {
    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const makeWidget = connectBreadcrumb(renderFn);
      const widget = makeWidget({ attributes: ['category'] });

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('does not remove refinement', () => {
      const renderFn = () => {};
      const makeWidget = connectBreadcrumb(renderFn);
      const widget = makeWidget({ attributes: ['category'] });

      const helper = algoliasearchHelper(createSearchClient(), '', {
        hierarchicalFacetsRefinements: {
          category: ['boxes'],
        },
      });
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      const newState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      );

      expect(newState).toBeUndefined();
    });
  });
});
