import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectHierarchicalMenu from '../connectHierarchicalMenu';

describe('connectHierarchicalMenu', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectHierarchicalMenu()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/#connector"
`);
    });

    it('throws without attributes', () => {
      expect(() => {
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
        connectHierarchicalMenu(() => {})({ attributes: 'attributes' });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attributes\` option expects an array of strings.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/#connector"
`);
    });
  });

  describe('getConfiguration', () => {
    it('It should compute getConfiguration() correctly', () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);

      const widget = makeWidget({ attributes: ['category', 'sub_category'] });

      // when there is no hierarchicalFacets into current configuration
      {
        const config = widget.getConfiguration({});
        expect(config).toEqual({
          hierarchicalFacets: [
            {
              attributes: ['category', 'sub_category'],
              name: 'category',
              rootPath: null,
              separator: ' > ',
              showParentLevel: true,
            },
          ],
          maxValuesPerFacet: 10,
        });
      }

      // when there is an identical hierarchicalFacets into current configuration
      expect(() => {
        const config = widget.getConfiguration({
          hierarchicalFacets: [{ name: 'category' }],
        });

        expect(config).toEqual({});
      }).toWarnDev();

      // when there is already a different hierarchicalFacets into current configuration
      {
        const config = widget.getConfiguration({
          hierarchicalFacets: [{ name: 'foo' }],
        });
        expect(config).toEqual({
          hierarchicalFacets: [
            {
              attributes: ['category', 'sub_category'],
              name: 'category',
              rootPath: null,
              separator: ' > ',
              showParentLevel: true,
            },
          ],
          maxValuesPerFacet: 10,
        });
      }
    });

    it('sets the correct limit with showMore', () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
        showMore: true,
        limit: 3,
        showMoreLimit: 100,
      });

      // when there is no other limit set
      {
        const config = widget.getConfiguration({});
        expect(config).toEqual({
          hierarchicalFacets: [
            {
              attributes: ['category', 'sub_category'],
              name: 'category',
              rootPath: null,
              separator: ' > ',
              showParentLevel: true,
            },
          ],
          maxValuesPerFacet: 100,
        });
      }

      // when there is a bigger already limit set
      {
        const config = widget.getConfiguration({
          maxValuesPerFacet: 101,
        });
        expect(config).toEqual({
          hierarchicalFacets: [
            {
              attributes: ['category', 'sub_category'],
              name: 'category',
              rootPath: null,
              separator: ' > ',
              showParentLevel: true,
            },
          ],
          maxValuesPerFacet: 101,
        });
      }
    });

    it('sets the correct custom limit', () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);

      const widget = makeWidget({
        attributes: ['category', 'sub_category'],
        limit: 3,
        showMore: true,
        showMoreLimit: 6,
      });

      // when there is no other limit set
      {
        const config = widget.getConfiguration({});
        expect(config).toEqual({
          hierarchicalFacets: [
            {
              attributes: ['category', 'sub_category'],
              name: 'category',
              rootPath: null,
              separator: ' > ',
              showParentLevel: true,
            },
          ],
          maxValuesPerFacet: 6,
        });
      }

      // when there is a bigger already limit set
      {
        const config = widget.getConfiguration({
          maxValuesPerFacet: 101,
        });
        expect(config).toEqual({
          hierarchicalFacets: [
            {
              attributes: ['category', 'sub_category'],
              name: 'category',
              rootPath: null,
              separator: ' > ',
              showParentLevel: true,
            },
          ],
          maxValuesPerFacet: 101,
        });
      }
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

    const config = widget.getConfiguration({});
    expect(config).toEqual({
      hierarchicalFacets: [
        {
          attributes: ['category', 'sub_category'],
          name: 'category',
          rootPath: null,
          separator: ' > ',
          showParentLevel: true,
        },
      ],
      maxValuesPerFacet: 10,
    });

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
        widgetParams: { attributes: ['category', 'sub_category'] },
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
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
            subCategory: {
              'Decoration > Candle holders & candles': 193,
              'Decoration > Frames & pictures': 173,
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
            data: [
              {
                label: 'Candle holders & candles',
                value: 'Decoration > Candle holders & candles',
                count: 193,
                isRefined: false,
                data: null,
              },
              {
                label: 'Frames & pictures',
                value: 'Decoration > Frames & pictures',
                count: 173,
                isRefined: false,
                data: null,
              },
            ],
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
    });

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
            subCategory: {
              'Decoration > Candle holders & candles': 193,
              'Decoration > Frames & pictures': 173,
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

  describe('routing', () => {
    const getInitializedWidget = () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);
      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
      });

      const helper = jsHelper({}, '', widget.getConfiguration({}));
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      const { refine } = rendering.mock.calls[0][0];

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
        helper.toggleRefinement('category', 'path');
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should not overide other entries in the same namespace', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          hierarchicalMenu: {
            otherCategory: ['path'],
          },
        };
        helper.toggleRefinement('category', 'path');
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should give back the object unmodified if refinements are already set', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          hierarchicalMenu: {
            category: ['path'],
          },
        };
        helper.toggleRefinement('category', 'path');
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
        // User presses back in the browser and the URL state contains no parameters
        const uiState = {};
        // The current state is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying an empty UI state should not change the object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should add the refinements according to the UI state provided', () => {
        const [widget, helper] = getInitializedWidget();
        // User presses back in the browser, and the URL contains the following:
        const uiState = {
          hierarchicalMenu: {
            category: ['path'],
          },
        };
        // The current state is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        // The state after the UI is applied on it
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toMatchSnapshot();
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

      const helper = jsHelper({}, '', widget.getConfiguration({}));
      helper.search = jest.fn();

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
                a: 880,
                b: 880,
                c: 880,
                d: 880,
              },
            },
          },
          {
            facets: {
              category: {
                a: 880,
                b: 880,
                c: 880,
                d: 880,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const { toggleShowMore } = rendering.mock.calls[1][0];

      expect(rendering).toHaveBeenLastCalledWith(
        expect.objectContaining({
          items: [
            {
              label: 'a',
              value: 'a',
              count: 880,
              isRefined: false,
              data: null,
            },
            {
              label: 'b',
              value: 'b',
              count: 880,
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
              isRefined: false,
              data: null,
            },
            {
              label: 'b',
              value: 'b',
              count: 880,
              isRefined: false,
              data: null,
            },
            {
              label: 'c',
              value: 'c',
              count: 880,
              isRefined: false,
              data: null,
            },
            {
              label: 'd',
              value: 'd',
              count: 880,
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

      const helper = jsHelper({}, '', widget.getConfiguration({}));
      helper.search = jest.fn();

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
                a: 880,
                b: 880,
                c: 880,
                d: 880,
              },
            },
          },
          {
            facets: {
              category: {
                a: 880,
                b: 880,
                c: 880,
                d: 880,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const { toggleShowMore } = rendering.mock.calls[1][0];

      expect(rendering).toHaveBeenLastCalledWith(
        expect.objectContaining({
          items: [
            {
              label: 'a',
              value: 'a',
              count: 880,
              isRefined: false,
              data: null,
            },
            {
              label: 'b',
              value: 'b',
              count: 880,
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
              isRefined: false,
              data: null,
            },
            {
              label: 'b',
              value: 'b',
              count: 880,
              isRefined: false,
              data: null,
            },
            {
              label: 'c',
              value: 'c',
              count: 880,
              isRefined: false,
              data: null,
            },
          ],
        }),
        expect.anything()
      );
    });
  });
});
