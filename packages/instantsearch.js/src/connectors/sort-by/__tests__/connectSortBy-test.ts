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

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import { index } from '../../../widgets';
import connectSortBy from '../connectSortBy';

import type { SortByRenderState } from '../connectSortBy';

describe('connectSortBy', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectSortBy()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/#connector"
`);
    });

    it('throws without items', () => {
      expect(() => {
        // @ts-expect-error
        connectSortBy(() => {})({ items: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`items\` option expects an array of objects.

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/#connector"
`);
    });

    it('throws with non-array items', () => {
      expect(() => {
        // @ts-expect-error
        connectSortBy(() => {})({ items: 'items' });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`items\` option expects an array of objects.

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customSortBy = connectSortBy(render, unmount);
      const widget = customSortBy({ items: [] });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.sortBy',
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
    const makeWidget = connectSortBy(rendering);
    const instantSearchInstance = createInstantSearch({
      indexName: 'defaultIndex',
    });

    const items = [
      { label: 'Sort products by relevance', value: 'relevance' },
      { label: 'Sort products by price', value: 'priceASC' },
    ];
    const widget = makeWidget({ items });

    const helper = algoliasearchHelper(createSearchClient(), items[0].value);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        instantSearchInstance,
      })
    );

    // should call the rendering once with isFirstRendering to true
    expect(rendering).toHaveBeenCalledTimes(1);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: helper.state.index,
        widgetParams: { items },
        options: [
          { label: 'Sort products by relevance', value: 'relevance' },
          { label: 'Sort products by price', value: 'priceASC' },
        ],
      }),
      true
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

    // Should call the rendering a second time, with isFirstRendering to false
    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: helper.state.index,
        widgetParams: { items },
        options: [
          { label: 'Sort products by relevance', value: 'relevance' },
          { label: 'Sort products by price', value: 'priceASC' },
        ],
      }),
      false
    );
  });

  it('does not throw without the unmount function', () => {
    const rendering = jest.fn();
    const makeWidget = connectSortBy(rendering);
    const items = [
      { label: 'Sort products by relevance', value: 'relevance' },
      { label: 'Sort products by price', value: 'priceASC' },
    ];
    const widget = makeWidget({ items });
    const helper = algoliasearchHelper(createSearchClient(), items[0].value);

    expect(() =>
      widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
    ).not.toThrow();
  });

  it('Renders with transformed items', () => {
    const rendering = jest.fn();
    const makeWidget = connectSortBy(rendering);
    const instantSearchInstance = createInstantSearch({
      indexName: 'defaultIndex',
    });

    const items = [
      { label: 'Sort products by relevance', value: 'relevance' },
      { label: 'Sort products by price', value: 'priceASC' },
    ];
    const widget = makeWidget({
      items,
      transformItems: (allItems) =>
        allItems.map((item) => ({ ...item, label: 'transformed' })),
    });

    const helper = algoliasearchHelper(createSearchClient(), items[0].value);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        instantSearchInstance,
      })
    );

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: [
          { label: 'transformed', value: 'relevance' },
          { label: 'transformed', value: 'priceASC' },
        ],
      }),
      expect.anything()
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        helper,
        state: helper.state,
        instantSearchInstance,
      })
    );

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: [
          { label: 'transformed', value: 'relevance' },
          { label: 'transformed', value: 'priceASC' },
        ],
      }),
      expect.anything()
    );
  });

  it('Provides search results within transformItems', () => {
    const transformItems = jest.fn((items) => items);
    const makeWidget = connectSortBy(() => {});
    const widget = makeWidget({
      items: [{ label: 'Sort products by relevance', value: 'relevance' }],
      transformItems,
    });

    const helper = algoliasearchHelper(createSearchClient(), '');
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse(),
    ]);

    widget.init!(createInitOptions({ helper, state: helper.state }));
    widget.render!(
      createRenderOptions({
        results,
        helper,
        state: helper.state,
      })
    );

    expect(transformItems).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ results })
    );
  });

  it('Provides a function to update the index at each step', () => {
    const rendering = jest.fn();
    const makeWidget = connectSortBy(rendering);
    const instantSearchInstance = createInstantSearch({
      indexName: 'defaultIndex',
    });

    const items = [
      { label: 'Sort products by relevance', value: 'relevance' },
      { label: 'Sort products by price', value: 'priceASC' },
    ];
    const widget = makeWidget({
      items,
    });

    const helper = algoliasearchHelper(createSearchClient(), items[0].value);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        instantSearchInstance,
      })
    );

    {
      // first rendering
      expect(helper.state.index).toBe(items[0].value);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, currentRefinement } = renderOptions;
      expect(currentRefinement).toBe(helper.state.index);
      refine('bip');
      expect(helper.state.index).toBe('bip');
      expect(helper.search).toHaveBeenCalledTimes(1);
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

    {
      // Second rendering
      expect(helper.state.index).toBe('bip');
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, currentRefinement } = renderOptions;
      expect(currentRefinement).toBe('bip');
      refine('bop');
      expect(helper.state.index).toBe('bop');
      expect(helper.search).toHaveBeenCalledTimes(2);
    }
  });

  describe('getRenderState', () => {
    test('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createSortBy = connectSortBy(renderFn, unmountFn);
      const sortBy = createSortBy({
        items: [
          { label: 'default', value: 'index_default' },
          { label: 'asc', value: 'index_asc' },
          { label: 'desc', value: 'index_desc' },
        ],
      });
      const helper = algoliasearchHelper(
        createSearchClient(),
        'index_default',
        {
          index: 'index_default',
        }
      );

      const renderState1 = sortBy.getRenderState(
        {},
        createInitOptions({ helper })
      );

      expect(renderState1.sortBy).toEqual({
        currentRefinement: 'index_default',
        refine: expect.any(Function),
        hasNoResults: true,
        canRefine: false,
        options: [
          { label: 'default', value: 'index_default' },
          { label: 'asc', value: 'index_asc' },
          { label: 'desc', value: 'index_desc' },
        ],
        widgetParams: {
          items: [
            { label: 'default', value: 'index_default' },
            { label: 'asc', value: 'index_asc' },
            { label: 'desc', value: 'index_desc' },
          ],
        },
      });

      sortBy.init!(createInitOptions({ helper }));
      sortBy
        .getWidgetRenderState(createInitOptions({ helper }))
        .refine('index_desc');

      const renderState2 = sortBy.getRenderState(
        {},
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [
                { brand: 'samsung', objectID: '1' },
                { brand: 'apple', objectID: '2' },
                { brand: 'sony', objectID: '3' },
              ],
              hitsPerPage: 1,
            }),
          ]),
        })
      );

      expect(renderState2.sortBy).toEqual({
        currentRefinement: 'index_desc',
        refine: expect.any(Function),
        hasNoResults: false,
        canRefine: true,
        options: [
          { label: 'default', value: 'index_default' },
          { label: 'asc', value: 'index_asc' },
          { label: 'desc', value: 'index_desc' },
        ],
        widgetParams: {
          items: [
            { label: 'default', value: 'index_default' },
            { label: 'asc', value: 'index_asc' },
            { label: 'desc', value: 'index_desc' },
          ],
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createSortBy = connectSortBy(renderFn, unmountFn);
      const sortBy = createSortBy({
        items: [
          { label: 'default', value: 'index_default' },
          { label: 'asc', value: 'index_asc' },
          { label: 'desc', value: 'index_desc' },
        ],
      });
      const helper = algoliasearchHelper(createSearchClient(), 'index_desc', {
        index: 'index_desc',
      });

      const renderState1 = sortBy.getWidgetRenderState(
        createInitOptions({ helper })
      );

      expect(renderState1).toEqual({
        currentRefinement: 'index_desc',
        refine: expect.any(Function),
        hasNoResults: true,
        canRefine: false,
        options: [
          { label: 'default', value: 'index_default' },
          { label: 'asc', value: 'index_asc' },
          { label: 'desc', value: 'index_desc' },
        ],
        widgetParams: {
          items: [
            { label: 'default', value: 'index_default' },
            { label: 'asc', value: 'index_asc' },
            { label: 'desc', value: 'index_desc' },
          ],
        },
      });

      sortBy.init!(createInitOptions({ helper }));
      sortBy
        .getWidgetRenderState(createInitOptions({ helper }))
        .refine('index_default');

      const renderState2 = sortBy.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [
                { brand: 'samsung', objectID: '1' },
                { brand: 'apple', objectID: '2' },
              ],
              hitsPerPage: 20,
            }),
          ]),
        })
      );

      expect(renderState2).toEqual({
        currentRefinement: 'index_default',
        refine: expect.any(Function),
        hasNoResults: false,
        canRefine: true,
        options: [
          { label: 'default', value: 'index_default' },
          { label: 'asc', value: 'index_asc' },
          { label: 'desc', value: 'index_desc' },
        ],
        widgetParams: {
          items: [
            { label: 'default', value: 'index_default' },
            { label: 'asc', value: 'index_asc' },
            { label: 'desc', value: 'index_desc' },
          ],
        },
      });
    });

    test('canRefine is false if there are results but no item to chose from', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createSortBy = connectSortBy(renderFn, unmountFn);
      const sortBy = createSortBy({
        items: [],
      });
      const helper = algoliasearchHelper(createSearchClient(), 'index_desc', {
        index: 'index_desc',
      });

      const renderState = sortBy.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [
                { brand: 'samsung', objectID: '1' },
                { brand: 'apple', objectID: '2' },
              ],
              hitsPerPage: 20,
            }),
          ]),
        })
      );

      expect(renderState.canRefine).toBe(false);
    });
  });

  describe('options', () => {
    describe('items', () => {
      test('uses the helper index by default', () => {
        const renderFn = jest.fn();
        const customSortBy = connectSortBy(renderFn);
        const instantSearchInstance = createInstantSearch({
          indexName: 'indexName',
        });
        const helper = algoliasearchHelper(
          createSearchClient(),
          'index_featured'
        );
        helper.search = jest.fn();

        const items = [
          { label: 'Featured', value: 'index_featured' },
          { label: 'Price asc.', value: 'index_price_asc' },
          { label: 'Price desc.', value: 'index_price_desc' },
        ];
        const widget = customSortBy({ items });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        expect(renderFn).toHaveBeenCalledTimes(1);
        const [renderOptions] = renderFn.mock.calls[0];

        expect(renderOptions.currentRefinement).toBe('index_featured');
      });

      test('warns and falls back to the helper index if not present in the items', () => {
        const renderFn = jest.fn();
        const customSortBy = connectSortBy(renderFn);
        const instantSearchInstance = createInstantSearch({
          indexName: 'indexName',
        });
        const helper = algoliasearchHelper(
          createSearchClient(),
          'index_initial'
        );
        helper.search = jest.fn();

        const items = [
          { label: 'Featured', value: 'index_featured' },
          { label: 'Price asc.', value: 'index_price_asc' },
          { label: 'Price desc.', value: 'index_price_desc' },
        ];
        const widget = customSortBy({ items });

        expect(() => {
          widget.init!(
            createInitOptions({
              helper,
              state: helper.state,
              instantSearchInstance,
            })
          );
        }).toWarnDev(
          '[InstantSearch.js]: The index named "index_initial" is not listed in the `items` of `sortBy`.'
        );

        expect(renderFn).toHaveBeenCalledTimes(1);
        const [firstRenderOptions] = renderFn.mock.calls[0];

        expect(firstRenderOptions.currentRefinement).toBe('index_initial');
      });
    });
  });

  describe('routing', () => {
    const getInitializedWidget = (config = {}) => {
      const rendering = jest.fn<any, [SortByRenderState, boolean]>();
      const makeWidget = connectSortBy(rendering);
      const instantSearchInstance = createInstantSearch({
        indexName: 'relevance',
      });

      const widget = makeWidget({
        items: [
          { label: 'Sort products by relevance', value: 'relevance' },
          { label: 'Sort products by price', value: 'priceASC' },
          { label: 'Sort products by magic', value: 'other' },
        ],
        ...config,
      });

      const helper = algoliasearchHelper(createSearchClient(), 'relevance');
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
          instantSearchInstance,
        })
      );

      const { refine } = rendering.mock.calls[0][0];

      return [widget, helper, refine] as const;
    };

    describe('getWidgetUiState', () => {
      test('should return the same `uiState` when the default value is selected', () => {
        const [widget, helper] = getInitializedWidget();

        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetUiState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toEqual(uiStateBefore);
      });

      test('should add an entry on refine', () => {
        const [widget, helper, refine] = getInitializedWidget();

        refine('priceASC');

        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetUiState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toEqual({
          sortBy: 'priceASC',
        });
      });

      test('should return the same `uiState` when the value is already present', () => {
        const [widget, helper, refine] = getInitializedWidget();

        refine('priceASC');

        const uiStateBefore = widget.getWidgetUiState(
          {},
          {
            searchParameters: helper.state,
            helper,
          }
        );
        const uiStateAfter = widget.getWidgetUiState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toEqual(uiStateBefore);
      });

      test('should remove refinement if new refinement is the initial index', () => {
        const [widget, helper] = getInitializedWidget();

        expect(helper.state.index).toBe('relevance');

        expect(
          widget.getWidgetUiState(
            {
              sortBy: 'relevance',
            },
            {
              searchParameters: helper.state,
              helper,
            }
          )
        ).toEqual({
          sortBy: undefined,
        });
      });

      test('should use the top-level `indexName` for the initial index', () => {
        const render = jest.fn();
        const makeWidget = connectSortBy(render);
        const instantSearchInstance = createInstantSearch({
          indexName: 'initialIndexName',
        });

        const widget = makeWidget({
          items: [
            { label: 'Sort products', value: 'initialIndexName' },
            { label: 'Sort products by price', value: 'indexNamePrice' },
          ],
        });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'initialIndexName'
        );
        helper.search = jest.fn();

        // Simulate an URLSync
        helper.setQueryParameter('index', 'indexNamePrice');

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const actual = widget.getWidgetUiState(
          {},
          {
            searchParameters: helper.state,
            helper,
          }
        );

        expect(actual).toEqual({
          sortBy: 'indexNamePrice',
        });
      });

      test('should return the same `uiState` when the default value from a parent index is selected', () => {
        const parent = index({ indexName: 'indexNameParent' });
        const render = jest.fn();
        const makeWidget = connectSortBy(render);
        const instantSearchInstance = createInstantSearch({
          indexName: 'initialIndexName',
        });

        const widget = makeWidget({
          items: [
            { label: 'Sort products', value: 'initialIndexName' },
            {
              label: 'Sort products by parent',
              value: 'indexNameParent',
            },
          ],
        });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'indexNameParent'
        );

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
            parent,
          })
        );

        const actual = widget.getWidgetUiState(
          {},
          {
            searchParameters: helper.state,
            helper,
          }
        );

        expect(actual).toEqual({});
      });
    });

    describe('getWidgetSearchParameters', () => {
      test('should return the same SP if no value is in the UI state', () => {
        const [widget, helper] = getInitializedWidget();

        const uiState = {};
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );

        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should add the refinements according to the UI state provided', () => {
        const [widget, helper] = getInitializedWidget();
        const newIndexName = 'other';
        const uiState = {
          sortBy: newIndexName,
        };

        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );

        expect(searchParametersAfter).toEqual(
          new SearchParameters({
            index: newIndexName,
          })
        );
      });

      test('should return the initial index on empty UiState with widget initialized', () => {
        const [widget, helper, refine] = getInitializedWidget();

        refine('other');

        const uiState = {};
        const searchParametersBefore = new SearchParameters(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );

        expect(searchParametersAfter).toEqual(
          new SearchParameters({
            // note that this isn't the refined value, but the default
            index: 'relevance',
          })
        );
      });

      test('should return the current index on empty UiState without widget initialized', () => {
        const sortBy = connectSortBy(() => {});
        const widget = sortBy({
          items: [
            { label: 'Sort products by relevance', value: 'relevance' },
            { label: 'Sort products by price', value: 'priceASC' },
            { label: 'Sort products by magic', value: 'other' },
          ],
        });

        const actual = widget.getWidgetSearchParameters(
          new SearchParameters({
            index: 'relevance',
          }),
          {
            uiState: {},
          }
        );

        expect(actual).toEqual(
          new SearchParameters({
            index: 'relevance',
          })
        );
      });
    });
  });

  describe('Sorting Strategies (Composition Mode)', () => {
    describe('Validation', () => {
      it('throws when item has both value and strategy', () => {
        expect(() => {
          connectSortBy(() => {})({
            items: [
              { value: 'index1', strategy: 'strategy1', label: 'Test' } as any,
            ],
          });
        }).toThrowErrorMatchingInlineSnapshot(`
"Item at index 0 cannot have both "value" and "strategy" properties.

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/#connector"
`);
      });

      it('throws when item has neither value nor strategy', () => {
        expect(() => {
          connectSortBy(() => {})({
            items: [{ label: 'Test' } as any],
          });
        }).toThrowErrorMatchingInlineSnapshot(`
"Item at index 0 must have either a "value" or "strategy" property.

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/#connector"
`);
      });

      it('throws when strategy name conflicts with index value', () => {
        expect(() => {
          connectSortBy(() => {})({
            items: [
              { value: 'products', label: 'Products' },
              { strategy: 'products', label: 'Products Strategy' },
            ],
          });
        }).toThrowErrorMatchingInlineSnapshot(`
"Strategy "products" conflicts with an existing index value. Index values and strategy names must be unique.

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/#connector"
`);
      });

      it('throws when strategies are used without composition mode', () => {
        const rendering = jest.fn();
        const makeWidget = connectSortBy(rendering);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });

        const items = [{ strategy: 'price_asc', label: 'Price Ascending' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'defaultIndex'
        );

        expect(() => {
          widget.init!(
            createInitOptions({
              helper,
              state: helper.state,
              instantSearchInstance,
            })
          );
        }).toThrowErrorMatchingInlineSnapshot(`
"Sorting strategies can only be used in composition mode. Please provide a "compositionID" to your InstantSearch instance.

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/#connector"
`);
      });

      it('does not throw when strategies are used with composition mode', () => {
        const rendering = jest.fn();
        const makeWidget = connectSortBy(rendering);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ strategy: 'price_asc', label: 'Price Ascending' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );

        expect(() => {
          widget.init!(
            createInitOptions({
              helper,
              state: helper.state,
              instantSearchInstance,
            })
          );
        }).not.toThrow();
      });
    });

    describe('Normalization', () => {
      it('normalizes strategy items to have value property in options', () => {
        const rendering = jest.fn();
        const makeWidget = connectSortBy(rendering);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [
          { strategy: 'relevance', label: 'Most Relevant' },
          { strategy: 'price_asc', label: 'Price: Low to High' },
        ];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );
        helper.search = jest.fn();

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        expect(rendering).toHaveBeenLastCalledWith(
          expect.objectContaining({
            options: [
              { value: 'relevance', label: 'Most Relevant' },
              { value: 'price_asc', label: 'Price: Low to High' },
            ],
          }),
          true
        );
      });

      it('normalizes mixed index and strategy items', () => {
        const rendering = jest.fn();
        const makeWidget = connectSortBy(rendering);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [
          { value: 'products', label: 'Default' },
          { strategy: 'price_asc', label: 'Price: Low to High' },
        ];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );
        helper.search = jest.fn();

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        expect(rendering).toHaveBeenLastCalledWith(
          expect.objectContaining({
            options: [
              { value: 'products', label: 'Default' },
              { value: 'price_asc', label: 'Price: Low to High' },
            ],
          }),
          true
        );
      });
    });

    describe('Refine functionality', () => {
      it('calls setQueryParameter with sortBy for strategy items', () => {
        const rendering = jest.fn();
        const makeWidget = connectSortBy(rendering);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ strategy: 'price_asc', label: 'Price: Low to High' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );
        helper.search = jest.fn();
        helper.setQueryParameter = jest.fn(() => helper);

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const { refine } = rendering.mock.calls[0][0];
        refine('price_asc');

        expect(helper.setQueryParameter).toHaveBeenCalledWith(
          'sortBy',
          'price_asc'
        );
        expect(helper.search).toHaveBeenCalled();
      });

      it('calls setIndex for index items', () => {
        const rendering = jest.fn();
        const makeWidget = connectSortBy(rendering);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ value: 'products_asc', label: 'Products ASC' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );
        helper.search = jest.fn();
        helper.setIndex = jest.fn(() => helper);

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const { refine } = rendering.mock.calls[0][0];
        refine('products_asc');

        expect(helper.setIndex).toHaveBeenCalledWith('products_asc');
        expect(helper.search).toHaveBeenCalled();
      });

      it('handles mixed items correctly in refine', () => {
        const rendering = jest.fn();
        const makeWidget = connectSortBy(rendering);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [
          { value: 'products', label: 'Default' },
          { strategy: 'price_asc', label: 'Price: Low to High' },
        ];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );
        helper.search = jest.fn();
        helper.setIndex = jest.fn(() => helper);
        helper.setQueryParameter = jest.fn(() => helper);

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const { refine } = rendering.mock.calls[0][0];

        // Refine with index
        refine('products');
        expect(helper.setIndex).toHaveBeenCalledWith('products');
        expect(helper.setQueryParameter).not.toHaveBeenCalled();

        helper.setIndex = jest.fn(() => helper);
        helper.setQueryParameter = jest.fn(() => helper);

        // Refine with strategy
        refine('price_asc');
        expect(helper.setQueryParameter).toHaveBeenCalledWith(
          'sortBy',
          'price_asc'
        );
        expect(helper.setIndex).not.toHaveBeenCalled();
      });
    });

    describe('Current refinement', () => {
      it('reads currentRefinement from state.sortBy in composition mode', () => {
        const rendering = jest.fn();
        const makeWidget = connectSortBy(rendering);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ strategy: 'price_asc', label: 'Price: Low to High' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );
        const state = helper.state.setQueryParameter(
          'sortBy' as any,
          'price_asc'
        );

        widget.render!(
          createRenderOptions({
            results: new SearchResults(state, [createSingleSearchResponse()]),
            state,
            helper,
            instantSearchInstance,
          })
        );

        expect(rendering).toHaveBeenLastCalledWith(
          expect.objectContaining({
            currentRefinement: 'price_asc',
          }),
          false
        );
      });

      it('reads currentRefinement from state.index when sortBy not set', () => {
        const rendering = jest.fn();
        const makeWidget = connectSortBy(rendering);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ value: 'products', label: 'Products' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );

        widget.render!(
          createRenderOptions({
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
            ]),
            state: helper.state,
            helper,
            instantSearchInstance,
          })
        );

        expect(rendering).toHaveBeenLastCalledWith(
          expect.objectContaining({
            currentRefinement: 'my-composition',
          }),
          false
        );
      });
    });

    describe('UI State', () => {
      it('sets sortBy in uiState from state.sortBy in composition mode', () => {
        const makeWidget = connectSortBy(() => {});
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ strategy: 'price_asc', label: 'Price: Low to High' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const state = helper.state.setQueryParameter(
          'sortBy' as any,
          'price_asc'
        );
        const uiState = widget.getWidgetUiState(
          {},
          {
            searchParameters: state,
            helper,
          }
        );

        expect(uiState).toEqual({
          sortBy: 'price_asc',
        });
      });

      it('does not set sortBy in uiState when it matches initialValue', () => {
        const makeWidget = connectSortBy(() => {});
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ strategy: 'price_asc', label: 'Price: Low to High' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const uiState = widget.getWidgetUiState(
          {},
          {
            searchParameters: helper.state,
            helper,
          }
        );

        expect(uiState).toEqual({});
      });
    });

    describe('Search Parameters', () => {
      it('sets sortBy parameter for strategy items', () => {
        const makeWidget = connectSortBy(() => {});
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ strategy: 'price_asc', label: 'Price: Low to High' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const newState = widget.getWidgetSearchParameters(helper.state, {
          uiState: { sortBy: 'price_asc' },
        }) as any;

        expect(newState.sortBy).toBe('price_asc');
      });

      it('sets index parameter for index items', () => {
        const makeWidget = connectSortBy(() => {});
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ value: 'products_asc', label: 'Products ASC' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const newState = widget.getWidgetSearchParameters(helper.state, {
          uiState: { sortBy: 'products_asc' },
        }) as any;

        expect(newState.index).toBe('products_asc');
        expect(newState.sortBy).toBeUndefined();
      });
    });

    describe('Dispose', () => {
      it('clears sortBy parameter on dispose in composition mode', () => {
        const unmount = jest.fn();
        const makeWidget = connectSortBy(() => {}, unmount);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ strategy: 'price_asc', label: 'Price: Low to High' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const stateWithSortBy = helper.state.setQueryParameter(
          'sortBy' as any,
          'price_asc'
        );

        const newState = widget.dispose!(
          createDisposeOptions({ helper, state: stateWithSortBy })
        ) as any;

        expect(newState.sortBy).toBeUndefined();
        expect(unmount).toHaveBeenCalled();
      });

      it('restores initial index on dispose', () => {
        const unmount = jest.fn();
        const makeWidget = connectSortBy(() => {}, unmount);
        const instantSearchInstance = createInstantSearch({
          indexName: 'defaultIndex',
        });
        instantSearchInstance.compositionID = 'my-composition';

        const items = [{ value: 'products_desc', label: 'Products DESC' }];
        const widget = makeWidget({ items });

        const helper = algoliasearchHelper(
          createSearchClient(),
          'my-composition'
        );

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const stateWithDifferentIndex = helper.state.setIndex('products_desc');

        const newState = widget.dispose!(
          createDisposeOptions({ helper, state: stateWithDifferentIndex })
        ) as any;

        expect(newState.index).toBe('my-composition');
        expect(unmount).toHaveBeenCalled();
      });
    });
  });
});
