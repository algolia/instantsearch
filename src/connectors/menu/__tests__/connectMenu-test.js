import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import connectMenu from '../connectMenu';

describe('connectMenu', () => {
  let rendering;
  let makeWidget;

  beforeEach(() => {
    rendering = jest.fn();
    makeWidget = connectMenu(rendering);
  });

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectMenu()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/menu/js/#connector"
`);
    });

    it('throws when showMoreLimit is equal to limit', () => {
      expect(() => {
        connectMenu(() => {})({
          attribute: 'attribute',
          limit: 20,
          showMore: true,
          showMoreLimit: 20,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`showMoreLimit\` option must be greater than \`limit\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/menu/js/#connector"
`);
    });

    it('throws when showMoreLimit is lower than limit', () => {
      expect(() => {
        connectMenu(() => {})({
          attribute: 'attribute',
          limit: 20,
          showMore: true,
          showMoreLimit: 10,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`showMoreLimit\` option must be greater than \`limit\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/menu/js/#connector"
`);
    });
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customMenu = connectMenu(render, unmount);
    const widget = customMenu({ attribute: 'facet' });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.menu',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
        getConfiguration: expect.any(Function),
        getWidgetState: expect.any(Function),
        getWidgetSearchParameters: expect.any(Function),
      })
    );
  });

  describe('options configuring the helper', () => {
    it('`attribute`', () => {
      const widget = makeWidget({
        attribute: 'myFacet',
      });

      expect(widget.getConfiguration(new SearchParameters({}))).toEqual(
        new SearchParameters({
          hierarchicalFacets: [
            {
              name: 'myFacet',
              attributes: ['myFacet'],
            },
          ],
          maxValuesPerFacet: 10,
        })
      );
    });

    it('`limit`', () => {
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 20,
      });

      expect(widget.getConfiguration(new SearchParameters({}))).toEqual(
        new SearchParameters({
          hierarchicalFacets: [
            {
              name: 'myFacet',
              attributes: ['myFacet'],
            },
          ],
          maxValuesPerFacet: 20,
        })
      );
    });
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const widget = makeWidget({
      attribute: 'myFacet',
      limit: 9,
    });

    const config = widget.getConfiguration(new SearchParameters({}));
    expect(config).toEqual(
      new SearchParameters({
        hierarchicalFacets: [
          {
            name: 'myFacet',
            attributes: ['myFacet'],
          },
        ],
        maxValuesPerFacet: 9,
      })
    );

    // test if widget is not rendered yet at this point
    expect(rendering).toHaveBeenCalledTimes(0);

    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering).toHaveBeenCalledTimes(1);
    // test if isFirstRendering is true during init
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        canRefine: false,
        widgetParams: {
          attribute: 'myFacet',
          limit: 9,
        },
      }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        canRefine: false,
        widgetParams: {
          attribute: 'myFacet',
          limit: 9,
        },
      }),
      false
    );
  });

  it('Provide a function to clear the refinements at each step', () => {
    const widget = makeWidget({
      attribute: 'category',
    });

    const helper = jsHelper(
      {},
      '',
      widget.getConfiguration(new SearchParameters({}))
    );
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'value');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine } = firstRenderingOptions;
    refine('value');
    expect(helper.hasRefinements('category')).toBe(false);
    refine('value');
    expect(helper.hasRefinements('category')).toBe(true);

    widget.render({
      results: new SearchResults(helper.state, [{}, {}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { refine: renderRefine } = secondRenderingOptions;
    renderRefine('value');
    expect(helper.hasRefinements('category')).toBe(false);
    renderRefine('value');
    expect(helper.hasRefinements('category')).toBe(true);
  });

  it('provides the correct facet values', () => {
    const widget = makeWidget({
      attribute: 'category',
    });

    const helper = jsHelper(
      {},
      '',
      widget.getConfiguration(new SearchParameters({}))
    );
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    // During the first rendering there are no facet values
    // The function get an empty array so that it doesn't break
    // over null-ish values.
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({ items: [] }),
      expect.anything()
    );

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              Decoration: 880,
            },
          },
        },
        {
          facets: {
            category: {
              Decoration: 880,
              Outdoor: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          {
            label: 'Decoration',
            value: 'Decoration',
            count: 880,
            isRefined: true,
            data: null,
          },
          {
            label: 'Outdoor',
            value: 'Outdoor',
            count: 47,
            isRefined: false,
            data: null,
          },
        ],
      }),
      expect.anything()
    );
  });

  it('returns empty items if the facet is not declared', () => {
    const widget = makeWidget({
      attribute: 'category',
    });

    // note that the helper is called with empty search parameters
    // which means this can only happen in a stale search situation
    // when this widget gets mounted
    const helper = jsHelper({}, '', {});

    widget.render({
      results: new SearchResults(helper.state, [
        createSingleSearchResponse({
          hits: [],
          facets: {
            category: {
              Decoration: 880,
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
    });

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({ items: [] }),
      false
    );
  });

  it('provides the correct transformed facet values', () => {
    const widget = makeWidget({
      attribute: 'category',
      transformItems: items =>
        items.map(item => ({
          ...item,
          label: 'transformed',
        })),
    });

    const helper = jsHelper(
      {},
      '',
      widget.getConfiguration(new SearchParameters({}))
    );
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
    });

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [],
      }),
      expect.anything()
    );

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              Decoration: 880,
            },
          },
        },
        {
          facets: {
            category: {
              Decoration: 880,
              Outdoor: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
    });

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

  it('does not throw without the unmount function', () => {
    const widget = connectMenu(() => {})({
      attribute: 'category',
    });
    const helper = jsHelper(
      {},
      '',
      widget.getConfiguration(new SearchParameters({}))
    );
    expect(() => widget.dispose({ helper, state: helper.state })).not.toThrow();
  });

  describe('showMore', () => {
    it('should set `maxValuesPerFacet` by default', () => {
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 10,
        showMore: true,
      });

      expect(widget.getConfiguration(new SearchParameters({}))).toEqual(
        new SearchParameters({
          hierarchicalFacets: [
            {
              name: 'myFacet',
              attributes: ['myFacet'],
            },
          ],
          maxValuesPerFacet: 20,
        })
      );
    });

    it('should provide `showMoreLimit` as `maxValuesPerFacet`', () => {
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 10,
        showMore: true,
        showMoreLimit: 30,
      });

      expect(widget.getConfiguration(new SearchParameters({}))).toEqual(
        new SearchParameters({
          hierarchicalFacets: [
            {
              name: 'myFacet',
              attributes: ['myFacet'],
            },
          ],
          maxValuesPerFacet: 30,
        })
      );
    });

    it('should initialize with `isShowingMore === false`', () => {
      // Given
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 10,
        showMore: true,
        showMoreLimit: 20,
      });

      // When
      const config = widget.getConfiguration(new SearchParameters({}));
      const helper = jsHelper({}, '', config);
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      expect(rendering).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isShowingMore: false,
        }),
        expect.anything()
      );
    });

    it('should toggle `isShowingMore` when `toggleShowMore` is called', () => {
      // Given
      const widget = makeWidget({
        attribute: 'category',
        limit: 1,
        showMore: true,
        showMoreLimit: 2,
      });

      // When
      const config = widget.getConfiguration(new SearchParameters({}));
      const helper = jsHelper({}, '', config);

      helper.search = jest.fn();
      helper.toggleRefinement('category', 'Decoration');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      widget.render({
        results: new SearchResults(helper.state, [
          {
            hits: [],
            facets: {
              category: {
                Decoration: 880,
              },
            },
          },
          {
            facets: {
              category: {
                Decoration: 880,
                Outdoor: 47,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      // Then
      const firstRenderingOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(firstRenderingOptions.isShowingMore).toBe(false);
      expect(firstRenderingOptions.items).toHaveLength(1);
      expect(firstRenderingOptions.canToggleShowMore).toBe(true);

      // When
      firstRenderingOptions.toggleShowMore();

      // Then
      const secondRenderingOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(secondRenderingOptions.isShowingMore).toBe(true);
      expect(secondRenderingOptions.items).toHaveLength(2);
      expect(firstRenderingOptions.canToggleShowMore).toBe(true);
    });

    it('should set canToggleShowMore to false when there are not enough items', () => {
      // Given
      const widget = makeWidget({
        attribute: 'category',
        limit: 1,
        showMore: true,
        showMoreLimit: 2,
      });

      // When
      const config = widget.getConfiguration(new SearchParameters({}));
      const helper = jsHelper({}, '', config);

      helper.search = jest.fn();
      helper.toggleRefinement('category', 'Decoration');

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      widget.render({
        results: new SearchResults(helper.state, [
          {
            hits: [],
            facets: {
              category: {
                Decoration: 880,
              },
            },
          },
          {
            facets: {
              category: {
                Decoration: 880,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const firstRenderingOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(firstRenderingOptions.items).toHaveLength(1);
      expect(firstRenderingOptions.canToggleShowMore).toBe(false);
    });
  });

  describe('routing', () => {
    const getInitializedWidget = () => {
      const rendering2 = jest.fn();
      const makeWidget2 = connectMenu(rendering2);
      const widget = makeWidget2({
        attribute: 'category',
      });

      const helper = jsHelper(
        {},
        '',
        widget.getConfiguration(new SearchParameters({}))
      );
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      const { refine } = rendering2.mock.calls[0][0];

      return [widget, helper, refine];
    };

    describe('getWidgetState', () => {
      test('should give back the object unmodified if there are no refinements', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });

      test('should add an entry equal to the refinement', () => {
        const [widget, helper] = getInitializedWidget();
        helper.toggleRefinement('category', 'pants');
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toEqual({
          menu: {
            category: 'pants',
          },
        });
      });

      test('should not override other values in the same namespace', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          menu: {
            othercategory: 'not-pants',
          },
        };
        helper.toggleRefinement('category', 'pants');
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toEqual({
          menu: {
            category: 'pants',
            othercategory: 'not-pants',
          },
        });
      });

      test('should give back the object unmodified if refinements are already set', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          menu: {
            category: 'pants',
          },
        };
        helper.toggleRefinement('category', 'pants');
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });
    });

    describe('getWidgetSearchParameters', () => {
      test('should return the same SP if there are no refinements in the UI state', () => {
        const [widget, helper] = getInitializedWidget();
        // User presses back in the browser and there are no parameters
        const uiState = {};
        // The current state is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying no parameters should return the same
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should add the refinements according to the UI state provided', () => {
        const [widget, helper] = getInitializedWidget();
        // The URL contains some menu parameters
        const uiState = {
          menu: {
            category: 'pants',
          },
        };
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );

        // It should apply the new parameters on the search
        expect(searchParametersAfter).toEqual(
          new SearchParameters({
            hierarchicalFacets: [
              {
                attributes: ['category'],
                name: 'category',
              },
            ],
            hierarchicalFacetsRefinements: {
              category: ['pants'],
            },
            maxValuesPerFacet: 10,
            index: helper.state.index,
          })
        );
      });
    });
  });

  describe('dispose', () => {
    it('removes hierarchical refinements', () => {
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 10,
        showMore: true,
      });
      const indexName = 'instant_search';

      const helper = jsHelper(
        {},
        indexName,
        widget.getConfiguration(new SearchParameters({}))
      );
      helper.search = jest.fn();

      expect(helper.state).toEqual(
        new SearchParameters({
          hierarchicalFacets: [
            {
              attributes: ['myFacet'],
              name: 'myFacet',
            },
          ],
          maxValuesPerFacet: 20,
          index: indexName,
        })
      );

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      widget.render({
        results: new SearchResults(helper.state, [
          {
            hits: [],
            facets: {
              myFacet: {
                Decoration: 880,
              },
            },
          },
          {
            facets: {
              myFacet: {
                Decoration: 880,
                Outdoor: 47,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const { refine } = rendering.mock.calls[0][0];

      refine('Decoration');

      expect(helper.state).toEqual(
        new SearchParameters({
          hierarchicalFacets: [
            {
              attributes: ['myFacet'],
              name: 'myFacet',
            },
          ],
          hierarchicalFacetsRefinements: {
            myFacet: ['Decoration'],
          },
          index: indexName,
          maxValuesPerFacet: 20,
        })
      );

      const newState = widget.dispose({ state: helper.state });

      expect(newState).toEqual(
        new SearchParameters({
          index: indexName,
        })
      );
    });

    it('leaves empty state intact', () => {
      const state = new SearchParameters({});
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 10,
        showMore: true,
      });
      const newState = widget.dispose({ state });

      expect(newState).toEqual(new SearchParameters({}));
    });
  });
});
