import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';

import connectSortBy from '../connectSortBy';
import index from '../../../widgets/index/index';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';

describe('connectSortBy', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectSortBy()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/#connector"
`);
    });

    it('throws without items', () => {
      expect(() => {
        connectSortBy(() => {})({ items: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`items\` option expects an array of objects.

See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/#connector"
`);
    });

    it('throws with non-array items', () => {
      expect(() => {
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
          getWidgetState: expect.any(Function),
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

    const helper = algoliasearchHelper({}, items[0].value);
    helper.search = jest.fn();

    widget.init(
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

    widget.render(
      createRenderOptions({
        results: new SearchResults(helper.state, [{}]),
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
    const helper = algoliasearchHelper({}, items[0].value);

    expect(() => widget.dispose({ helper, state: helper.state })).not.toThrow();
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
      transformItems: allItems =>
        allItems.map(item => ({ ...item, label: 'transformed' })),
    });

    const helper = algoliasearchHelper({}, items[0].value);
    helper.search = jest.fn();

    widget.init(
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

    widget.render(
      createRenderOptions({
        results: new SearchResults(helper.state, [{}]),
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

    const helper = algoliasearchHelper({}, items[0].value);
    helper.search = jest.fn();

    widget.init(
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

    widget.render(
      createRenderOptions({
        results: new SearchResults(helper.state, [{}]),
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

  describe('options', () => {
    describe('items', () => {
      test('uses the helper index by default', () => {
        const renderFn = jest.fn();
        const customSortBy = connectSortBy(renderFn);
        const instantSearchInstance = createInstantSearch({
          indexName: '',
        });
        const helper = algoliasearchHelper({}, 'index_featured');
        helper.search = jest.fn();

        const items = [
          { label: 'Featured', value: 'index_featured' },
          { label: 'Price asc.', value: 'index_price_asc' },
          { label: 'Price desc.', value: 'index_price_desc' },
        ];
        const widget = customSortBy({ items });

        widget.init(
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
          indexName: '',
        });
        const helper = algoliasearchHelper({}, 'index_initial');
        helper.search = jest.fn();

        const items = [
          { label: 'Featured', value: 'index_featured' },
          { label: 'Price asc.', value: 'index_price_asc' },
          { label: 'Price desc.', value: 'index_price_desc' },
        ];
        const widget = customSortBy({ items });

        expect(() => {
          widget.init(
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
      const rendering = jest.fn();
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

      const helper = algoliasearchHelper({}, 'relevance');
      helper.search = jest.fn();

      widget.init(
        createInitOptions({
          helper,
          state: helper.state,
          instantSearchInstance,
        })
      );

      const { refine } = rendering.mock.calls[0][0];

      return [widget, helper, refine];
    };

    describe('getWidgetState', () => {
      test('should return the same `uiState` when the default value is selected', () => {
        const [widget, helper] = getInitializedWidget();

        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toEqual(uiStateBefore);
      });

      test('should add an entry on refine', () => {
        const [widget, helper, refine] = getInitializedWidget();

        refine('priceASC');

        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
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

        const uiStateBefore = widget.getWidgetState(
          {},
          {
            searchParameters: helper.state,
            helper,
          }
        );
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toEqual(uiStateBefore);
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

        widget.init(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
          })
        );

        const actual = widget.getWidgetState(
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
        helper.search = jest.fn();

        widget.init(
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance,
            parent,
          })
        );

        const actual = widget.getWidgetState(
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
});
