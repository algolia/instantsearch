import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { TAG_PLACEHOLDER } from '../../../lib/escape-highlight';
import connectRefinementList from '../connectRefinementList';

describe('connectRefinementList', () => {
  const createWidgetFactory = () => {
    const rendering = jest.fn();
    const makeWidget = connectRefinementList(rendering);
    return { rendering, makeWidget };
  };

  it('throws on bad usage', () => {
    expect(connectRefinementList).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/#connector"
`);

    expect(() =>
      connectRefinementList({
        operator: 'and',
      })
    ).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Object).

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/#connector"
`);

    expect(() => connectRefinementList(() => {})())
      .toThrowErrorMatchingInlineSnapshot(`
"The \`attribute\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/#connector"
`);

    expect(() =>
      connectRefinementList(() => {})({
        operator: 'and',
      })
    ).toThrowErrorMatchingInlineSnapshot(`
"The \`attribute\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/#connector"
`);

    expect(() =>
      connectRefinementList(() => {})({
        attribute: 'company',
        operator: 'YUP',
      })
    ).toThrowErrorMatchingInlineSnapshot(`
"The \`operator\` must one of: \`\\"and\\"\`, \`\\"or\\"\` (got \\"YUP\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/#connector"
`);

    expect(() =>
      connectRefinementList(() => {})({
        attribute: 'company',
        limit: 10,
        showMore: true,
        showMoreLimit: 10,
      })
    ).toThrowErrorMatchingInlineSnapshot(`
"\`showMoreLimit\` should be greater than \`limit\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/#connector"
`);

    expect(() =>
      connectRefinementList(() => {})({
        attribute: 'company',
        limit: 10,
        showMore: true,
        showMoreLimit: 5,
      })
    ).toThrowErrorMatchingInlineSnapshot(`
"\`showMoreLimit\` should be greater than \`limit\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/#connector"
`);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customRefinementList = connectRefinementList(render, unmount);
    const widget = customRefinementList({ attribute: 'facet' });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.refinementList',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),

        getWidgetState: expect.any(Function),
        getWidgetSearchParameters: expect.any(Function),
      })
    );
  });

  describe('options configuring the helper', () => {
    it('`attribute`', () => {
      const { makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attribute: 'myFacet',
      });

      expect(
        widget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        })
      ).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['myFacet'],
          disjunctiveFacetsRefinements: { myFacet: [] },
          maxValuesPerFacet: 10,
        })
      );
    });

    it('`limit`', () => {
      const { makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 20,
      });

      expect(
        widget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        })
      ).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['myFacet'],
          disjunctiveFacetsRefinements: { myFacet: [] },
          maxValuesPerFacet: 20,
        })
      );

      expect(
        widget.getWidgetSearchParameters(
          new SearchParameters({ maxValuesPerFacet: 100 }),
          { uiState: {} }
        )
      ).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['myFacet'],
          disjunctiveFacetsRefinements: { myFacet: [] },
          maxValuesPerFacet: 100,
        })
      );
    });

    it('`showMoreLimit`', () => {
      const { rendering, makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 20,
        showMore: true,
        showMoreLimit: 30,
      });

      const helper = jsHelper(
        {},
        '',
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        })
      );
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
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          },
          {
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const secondRenderingOptions = rendering.mock.calls[1][0];
      secondRenderingOptions.toggleShowMore();

      expect(
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        })
      ).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['myFacet'],
          disjunctiveFacetsRefinements: { myFacet: [] },
          maxValuesPerFacet: 30,
        })
      );

      expect(
        widget.getWidgetSearchParameters(
          new SearchParameters({ maxValuesPerFacet: 100 }),
          { uiState: {} }
        )
      ).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['myFacet'],
          disjunctiveFacetsRefinements: { myFacet: [] },
          maxValuesPerFacet: 100,
        })
      );
    });

    it('`showMoreLimit` without `showMore` does not set anything', () => {
      const { rendering, makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 20,
        showMoreLimit: 30,
      });

      const helper = jsHelper(
        {},
        '',
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        })
      );
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
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          },
          {
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      const secondRenderingOptions = rendering.mock.calls[1][0];
      secondRenderingOptions.toggleShowMore();

      expect(
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        })
      ).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['myFacet'],
          disjunctiveFacetsRefinements: { myFacet: [] },
          maxValuesPerFacet: 20,
        })
      );
    });

    it('`operator="and"`', () => {
      const { makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attribute: 'myFacet',
        operator: 'and',
      });

      expect(
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        })
      ).toEqual(
        new SearchParameters({
          facets: ['myFacet'],
          facetsRefinements: { myFacet: [] },
          maxValuesPerFacet: 10,
        })
      );
    });
  });

  it('Renders during init and render', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const widget = makeWidget({
      attribute: 'myFacet',
      limit: 9,
    });

    const config = widget.getWidgetSearchParameters(new SearchParameters({}), {
      uiState: {},
    });
    expect(config).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['myFacet'],
        disjunctiveFacetsRefinements: { myFacet: [] },
        maxValuesPerFacet: 9,
      })
    );

    // test if widget is not rendered yet at this point
    expect(rendering).not.toHaveBeenCalled();

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
    expect(rendering).toHaveBeenLastCalledWith(expect.any(Object), true);

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.canRefine).toBe(false);
    expect(firstRenderingOptions.widgetParams).toEqual({
      attribute: 'myFacet',
      limit: 9,
    });

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(expect.any(Object), false);

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.canRefine).toBe(false);
    expect(secondRenderingOptions.widgetParams).toEqual({
      attribute: 'myFacet',
      limit: 9,
    });
  });

  it('can render before getWidgetSearchParameters', () => {
    const { makeWidget, rendering } = createWidgetFactory();

    const widget = makeWidget({
      attribute: 'myFacet',
      limit: 9,
    });

    const helper = jsHelper({}, '');

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [],
      }),
      false
    );
  });

  it('transforms items if requested', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      transformItems: items =>
        items.map(item => ({
          ...item,
          label: 'transformed',
          value: 'transformed',
          highlighted: 'transformed',
        })),
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items).toEqual([
      expect.objectContaining({
        label: 'transformed',
        value: 'transformed',
        highlighted: 'transformed',
      }),
      expect.objectContaining({
        label: 'transformed',
        value: 'transformed',
        highlighted: 'transformed',
      }),
    ]);
  });

  it('Provide a function to clear the refinements at each step (or)', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
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
    expect(helper.state.disjunctiveFacetsRefinements.category).toHaveLength(0);
    refine('value');
    expect(helper.state.disjunctiveFacetsRefinements.category).toHaveLength(1);

    widget.render({
      results: new SearchResults(helper.state, [{}, {}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { refine: renderToggleRefinement } = secondRenderingOptions;
    renderToggleRefinement('value');
    expect(helper.state.disjunctiveFacetsRefinements.category).toHaveLength(0);
    renderToggleRefinement('value');
    expect(helper.state.disjunctiveFacetsRefinements.category).toHaveLength(1);
  });

  it('Provide a function to clear the refinements at each step (and)', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      operator: 'and',
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
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
    expect(helper.state.facetsRefinements.category).toHaveLength(0);
    refine('value');
    expect(helper.state.facetsRefinements.category).toHaveLength(1);

    widget.render({
      results: new SearchResults(helper.state, [{}, {}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { refine: renderToggleRefinement } = secondRenderingOptions;
    renderToggleRefinement('value');
    expect(helper.state.facetsRefinements.category).toHaveLength(0);
    renderToggleRefinement('value');
    expect(helper.state.facetsRefinements.category).toHaveLength(1);
  });

  it('If there are too few items then canToggleShowMore is false', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 3,
      showMore: true,
      showMoreLimit: 10,
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
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
              c1: 880,
              c2: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.canToggleShowMore).toBe(false);
  });

  it('If there are no showMoreLimit specified, canToggleShowMore is false', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 1,
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
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
              c1: 880,
              c2: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
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
        canToggleShowMore: false,
      }),
      false
    );
  });

  it('If there are same amount of items then canToggleShowMore is false', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
      showMore: true,
      showMoreLimit: 10,
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
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
              c1: 880,
              c2: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
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
        canToggleShowMore: false,
      }),
      false
    );
  });

  it('If there are enough items then canToggleShowMore is true', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 1,
      showMore: true,
      showMoreLimit: 10,
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
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
              c1: 880,
              c2: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.canToggleShowMore).toBe(true);

    // toggleShowMore will set the state of the show more to true
    // therefore it's always possible to go back and show less items
    secondRenderingOptions.toggleShowMore();

    const thirdRenderingOptions = rendering.mock.calls[2][0];
    expect(thirdRenderingOptions.canToggleShowMore).toBe(true);
  });

  it('Show more should toggle between two limits', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 1,
      showMore: true,
      showMoreLimit: 3,
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
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
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
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
        canToggleShowMore: true,
        items: [
          {
            label: 'c1',
            value: 'c1',
            highlighted: 'c1',
            count: 880,
            isRefined: false,
          },
        ],
      }),
      false
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    // toggleShowMore does a new render
    secondRenderingOptions.toggleShowMore();

    const thirdRenderingOptions = rendering.mock.calls[2][0];
    expect(thirdRenderingOptions.items).toEqual([
      {
        label: 'c1',
        value: 'c1',
        highlighted: 'c1',
        count: 880,
        isRefined: false,
      },
      {
        label: 'c3',
        value: 'c3',
        highlighted: 'c3',
        count: 880,
        isRefined: false,
      },
      {
        label: 'c2',
        value: 'c2',
        highlighted: 'c2',
        count: 47,
        isRefined: false,
      },
    ]);
  });

  it('show more should toggle between two limits after search', async () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const limit = 1;
    const showMoreLimit = 2;
    const widget = makeWidget({
      attribute: 'category',
      limit,
      showMore: true,
      showMoreLimit,
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        facetHits: [],
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
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const renderingOptions2 = rendering.mock.calls[1][0];
    expect(renderingOptions2.items).toHaveLength(1);

    // `searchForItems` triggers a new render
    renderingOptions2.searchForItems('query triggering no results');
    await Promise.resolve();

    expect(helper.searchForFacetValues).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      limit,
      expect.anything()
    );

    expect(rendering).toHaveBeenCalledTimes(3);
    const renderingOptions3 = rendering.mock.calls[2][0];

    // `searchForItems` triggers a new render
    renderingOptions3.searchForItems('');
    await Promise.resolve();

    expect(rendering).toHaveBeenCalledTimes(4);
    const renderingOptions4 = rendering.mock.calls[3][0];
    expect(renderingOptions4.toggleShowMore).toBeDefined();

    // `toggleShowMore` triggers a new render
    renderingOptions4.toggleShowMore();

    expect(rendering).toHaveBeenCalledTimes(5);
    const renderingOptions5 = rendering.mock.calls[4][0];
    expect(renderingOptions5.items).toHaveLength(2);

    renderingOptions5.searchForItems('new search');
    expect(helper.searchForFacetValues).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      showMoreLimit,
      expect.anything()
    );
  });

  it('Toggle show more should be enabled when refinement list is expanded and number of facet is above limit and below showMoreLimit', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 1,
      showMore: true,
      showMoreLimit: 3,
    });

    const helper = jsHelper({}, '', {
      ...widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      }),
      maxValuesPerFacet: 10,
    });
    helper.search = jest.fn();

    // 1st rendering: initialization
    widget.init({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
      ]),
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // 2nd rendering: with 4 results (collapsed refinement list with limit < showMoreLimit < facets)
    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];

    expect(secondRenderingOptions.canToggleShowMore).toEqual(true);

    // 3rd rendering: expand refinement list
    secondRenderingOptions.toggleShowMore();

    // 4th rendering: with 2 results (expanded refinement list with limit < facets < showMoreLimit)
    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const forthRenderingOptions = rendering.mock.calls[3][0];

    expect(forthRenderingOptions.canToggleShowMore).toEqual(true);
  });

  it('Toggle show more should be disabled when refinement list is expanded and number of facet is below limit', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
      showMore: true,
      showMoreLimit: 3,
    });

    const helper = jsHelper({}, '', {
      ...widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      }),
      maxValuesPerFacet: 10,
    });
    helper.search = jest.fn();

    // 1st rendering: initialization
    widget.init({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
      ]),
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // 2nd rendering: with 4 results (collapsed refinement list with limit < showMoreLimit < facets)
    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 47,
              c3: 880,
              c4: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];

    expect(secondRenderingOptions.canToggleShowMore).toEqual(true);

    // 3rd rendering: expand refinement list
    secondRenderingOptions.toggleShowMore();

    // 4th rendering: with 1 result (expanded refinement list with facets < limit < showMoreLimit)
    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const forthRenderingOptions = rendering.mock.calls[3][0];

    expect(forthRenderingOptions.canToggleShowMore).toEqual(false);
  });

  it('hasExhaustiveItems indicates if the items provided are exhaustive - without other widgets making the maxValuesPerFacet bigger', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(rendering.mock.calls[0][0].hasExhaustiveItems).toEqual(true);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 880,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 880,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // this one is `false` because we're not sure that what we asked is the actual number of facet values
    expect(rendering.mock.calls[1][0].hasExhaustiveItems).toEqual(false);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 34,
              c3: 440,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 34,
              c3: 440,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.mock.calls[2][0].hasExhaustiveItems).toEqual(false);
  });

  it('hasExhaustiveItems indicates if the items provided are exhaustive - with an other widgets making the maxValuesPerFacet bigger', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
    });

    const helper = jsHelper({}, '', {
      ...widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      }),
      maxValuesPerFacet: 3,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(rendering.mock.calls[0][0].hasExhaustiveItems).toEqual(true);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 880,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 880,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.mock.calls[1][0].hasExhaustiveItems).toEqual(true);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 34,
              c3: 440,
              c4: 440,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 34,
              c3: 440,
              c4: 440,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering.mock.calls[2][0].hasExhaustiveItems).toEqual(false);
  });

  it('can search in facet values', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
      escapeFacetValues: false,
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        exhaustiveFacetsCount: true,
        facetHits: [
          {
            count: 33,
            highlighted: 'Salvador <mark>Da</mark>li',
            value: 'Salvador Dali',
          },
          {
            count: 9,
            highlighted: '<mark>Da</mark>vidoff',
            value: 'Davidoff',
          },
        ],
        processingTimeMS: 1,
      })
    );

    // Simulate the lifecycle
    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });
    expect(rendering).toHaveBeenCalledTimes(1);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
              c2: 880,
              c3: 880,
              c4: 880,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
              c2: 880,
              c3: 880,
              c4: 880,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });
    expect(rendering).toHaveBeenCalledTimes(2);
    // Simulation end

    const search = rendering.mock.calls[1][0].searchForItems;
    search('da');

    const [
      sffvFacet,
      sffvQuery,
      maxNbItems,
      paramOverride,
    ] = helper.searchForFacetValues.mock.calls[0];

    expect(sffvQuery).toBe('da');
    expect(sffvFacet).toBe('category');
    expect(maxNbItems).toBe(2);
    expect(paramOverride).toEqual({
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return Promise.resolve().then(() => {
      expect(rendering).toHaveBeenCalledTimes(3);
      expect(rendering.mock.calls[2][0].items).toEqual([
        {
          count: 33,
          highlighted: 'Salvador <mark>Da</mark>li',
          label: 'Salvador Dali',
          value: 'Salvador Dali',
        },
        {
          count: 9,
          highlighted: '<mark>Da</mark>vidoff',
          label: 'Davidoff',
          value: 'Davidoff',
        },
      ]);
    });
  });

  it('can search in facet values with transformed items', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
      escapeFacetValues: false,
      transformItems: items =>
        items.map(item => ({
          ...item,
          label: 'transformed',
          value: 'transformed',
          highlighted: 'transformed',
        })),
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        exhaustiveFacetsCount: true,
        facetHits: [
          {
            count: 33,
            highlighted: 'will be transformed',
            value: 'will be transformed',
          },
          {
            count: 9,
            highlighted: 'will be transformed',
            value: 'will be transformed',
          },
        ],
        processingTimeMS: 1,
      })
    );

    // Simulate the lifecycle
    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });
    expect(rendering).toHaveBeenCalledTimes(1);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });
    expect(rendering).toHaveBeenCalledTimes(2);
    // Simulation end

    const search = rendering.mock.calls[1][0].searchForItems;
    search('transfo');

    const [
      sffvFacet,
      sffvQuery,
      maxNbItems,
      paramOverride,
    ] = helper.searchForFacetValues.mock.calls[0];

    expect(sffvQuery).toBe('transfo');
    expect(sffvFacet).toBe('category');
    expect(maxNbItems).toBe(2);
    expect(paramOverride).toEqual({
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return Promise.resolve().then(() => {
      expect(rendering).toHaveBeenCalledTimes(3);
      expect(rendering.mock.calls[2][0].items).toEqual([
        expect.objectContaining({
          highlighted: 'transformed',
          label: 'transformed',
          value: 'transformed',
        }),
        expect.objectContaining({
          highlighted: 'transformed',
          label: 'transformed',
          value: 'transformed',
        }),
      ]);
    });
  });

  it('can search in facet values, and reset pre post tags if needed', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
      escapeFacetValues: false,
    });

    const helper = jsHelper({}, '', {
      ...widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      }),
      // Here we simulate that another widget has set some highlight tags
      ...TAG_PLACEHOLDER,
    });
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        exhaustiveFacetsCount: true,
        facetHits: [
          {
            count: 33,
            highlighted: 'Salvador <mark>Da</mark>li',
            value: 'Salvador Dali',
          },
          {
            count: 9,
            highlighted: '<mark>Da</mark>vidoff',
            value: 'Davidoff',
          },
        ],
        processingTimeMS: 1,
      })
    );

    // Simulate the lifecycle
    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });
    expect(rendering).toHaveBeenCalledTimes(1);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });
    expect(rendering).toHaveBeenCalledTimes(2);
    // Simulation end

    const search = rendering.mock.calls[1][0].searchForItems;
    search('da');

    const [
      sffvFacet,
      sffvQuery,
      maxNbItems,
      paramOverride,
    ] = helper.searchForFacetValues.mock.calls[0];

    expect(sffvQuery).toBe('da');
    expect(sffvFacet).toBe('category');
    expect(maxNbItems).toBe(2);
    expect(paramOverride).toEqual({
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return Promise.resolve().then(() => {
      expect(rendering).toHaveBeenCalledTimes(3);
      expect(rendering.mock.calls[2][0].items).toEqual([
        {
          count: 33,
          highlighted: 'Salvador <mark>Da</mark>li',
          label: 'Salvador Dali',
          value: 'Salvador Dali',
        },
        {
          count: 9,
          highlighted: '<mark>Da</mark>vidoff',
          label: 'Davidoff',
          value: 'Davidoff',
        },
      ]);
    });
  });

  it('can search in facet values, and set post and pre tags by default', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
      escapeFacetValues: true,
    });

    const helper = jsHelper({}, '', {
      ...widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      }),
      // Here we simulate that another widget has set some highlight tags
      ...TAG_PLACEHOLDER,
    });
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        exhaustiveFacetsCount: true,
        facetHits: [
          {
            count: 33,
            highlighted: `Salvador ${TAG_PLACEHOLDER.highlightPreTag}Da${TAG_PLACEHOLDER.highlightPostTag}li`,
            value: 'Salvador Dali',
          },
          {
            count: 9,
            highlighted: `${TAG_PLACEHOLDER.highlightPreTag}Da${TAG_PLACEHOLDER.highlightPostTag}vidoff`,
            value: 'Davidoff',
          },
        ],
        processingTimeMS: 1,
      })
    );

    // Simulate the lifecycle
    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });
    expect(rendering).toHaveBeenCalledTimes(1);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              c1: 880,
            },
          },
        },
        {
          facets: {
            category: {
              c1: 880,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });
    expect(rendering).toHaveBeenCalledTimes(2);
    // Simulation end

    const search = rendering.mock.calls[1][0].searchForItems;
    search('da');

    const [
      sffvFacet,
      sffvQuery,
      maxNbItems,
      paramOverride,
    ] = helper.searchForFacetValues.mock.calls[0];

    expect(sffvQuery).toBe('da');
    expect(sffvFacet).toBe('category');
    expect(maxNbItems).toBe(2);
    expect(paramOverride).toEqual(TAG_PLACEHOLDER);

    return Promise.resolve().then(() => {
      expect(rendering).toHaveBeenCalledTimes(3);
      expect(rendering.mock.calls[2][0].items).toEqual([
        {
          count: 33,
          highlighted: 'Salvador <mark>Da</mark>li',
          label: 'Salvador Dali',
          value: 'Salvador Dali',
        },
        {
          count: 9,
          highlighted: '<mark>Da</mark>vidoff',
          label: 'Davidoff',
          value: 'Davidoff',
        },
      ]);
    });
  });

  it('does not throw without the unmount function', () => {
    const rendering = () => {};
    const makeWidget = connectRefinementList(rendering);
    const widget = makeWidget({
      attribute: 'myFacet',
    });
    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );

    expect(() => widget.dispose({ helper, state: helper.state })).not.toThrow();
  });

  describe('dispose', () => {
    it('removes refinements completely on dispose (and)', () => {
      const rendering = jest.fn();
      const makeWidget = connectRefinementList(rendering);

      const widget = makeWidget({
        attribute: 'category',
        operator: 'and',
      });

      const indexName = 'my-index';
      const helper = jsHelper(
        {},
        indexName,
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        })
      );
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
                c1: 880,
                c2: 47,
              },
            },
          },
          {
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
      });

      const { refine } = rendering.mock.calls[0][0];

      expect(helper.state).toEqual(
        new SearchParameters({
          facets: ['category'],
          facetsRefinements: {
            category: [],
          },
          index: indexName,
          maxValuesPerFacet: 10,
        })
      );

      refine('zimbo');

      expect(helper.state).toEqual(
        new SearchParameters({
          facets: ['category'],
          facetsRefinements: {
            category: ['zimbo'],
          },
          index: indexName,
          maxValuesPerFacet: 10,
        })
      );

      const newState = widget.dispose({
        state: helper.state,
      });

      expect(newState).toEqual(
        new SearchParameters({
          index: indexName,
        })
      );
    });

    it('removes refinements completely on dispose (or)', () => {
      const rendering = jest.fn();
      const makeWidget = connectRefinementList(rendering);

      const widget = makeWidget({
        attribute: 'category',
        operator: 'or',
      });

      const indexName = 'my-index';
      const helper = jsHelper(
        {},
        indexName,
        widget.getWidgetSearchParameters(new SearchParameters({}), {
          uiState: {},
        })
      );
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
                c1: 880,
                c2: 47,
              },
            },
          },
          {
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          },
        ]),
        state: helper.state,
        helper,
      });

      const { refine } = rendering.mock.calls[0][0];

      expect(helper.state).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['category'],
          disjunctiveFacetsRefinements: {
            category: [],
          },
          index: indexName,
          maxValuesPerFacet: 10,
        })
      );

      refine('zimbo');

      expect(helper.state).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['category'],
          disjunctiveFacetsRefinements: {
            category: ['zimbo'],
          },
          index: indexName,
          maxValuesPerFacet: 10,
        })
      );

      const newState = widget.dispose({
        state: helper.state,
      });

      expect(newState).toEqual(
        new SearchParameters({
          index: indexName,
        })
      );
    });
  });

  describe('getWidgetState', () => {
    test('returns the `uiState` empty', () => {
      const render = () => {};
      const makeWidget = connectRefinementList(render);
      const helper = jsHelper({}, '');
      const widget = makeWidget({
        attribute: 'brand',
      });

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a refinement', () => {
      const render = () => {};
      const makeWidget = connectRefinementList(render);
      const helper = jsHelper({}, '', {
        disjunctiveFacets: ['brand'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple', 'Microsoft'],
        },
      });

      const widget = makeWidget({
        attribute: 'brand',
      });

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({
        refinementList: {
          brand: ['Apple', 'Microsoft'],
        },
      });
    });

    test('returns the `uiState` without namespace overridden', () => {
      const render = () => {};
      const makeWidget = connectRefinementList(render);
      const helper = jsHelper({}, '', {
        disjunctiveFacets: ['brand'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple', 'Microsoft'],
        },
      });

      const widget = makeWidget({
        attribute: 'brand',
      });

      const actual = widget.getWidgetState(
        {
          refinementList: {
            categories: ['Phone', 'Tablet'],
          },
        },
        {
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({
        refinementList: {
          categories: ['Phone', 'Tablet'],
          brand: ['Apple', 'Microsoft'],
        },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    describe('with `maxValuesPerFacet`', () => {
      test('returns the `SearchParameters` with default `limit`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '');
        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(10);
      });

      test('returns the `SearchParameters` with provided `limit`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '');
        const widget = makeWidget({
          attribute: 'brand',
          limit: 5,
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(5);
      });

      test('returns the `SearchParameters` with default `showMoreLimit`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '');
        const widget = makeWidget({
          attribute: 'brand',
          showMore: true,
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(20);
      });

      test('returns the `SearchParameters` with provided `showMoreLimit`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '');
        const widget = makeWidget({
          attribute: 'brand',
          showMore: true,
          showMoreLimit: 15,
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(15);
      });

      test('returns the `SearchParameters` with the previous value if higher than `limit`/`showMoreLimit`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '', {
          maxValuesPerFacet: 100,
        });

        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(100);
      });

      test('returns the `SearchParameters` with `limit`/`showMoreLimit` if higher than previous value', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '', {
          maxValuesPerFacet: 100,
        });

        const widget = makeWidget({
          attribute: 'brand',
          limit: 110,
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(110);
      });
    });

    describe('with conjunctive facet', () => {
      test('returns the `SearchParameters` with the default value', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '');
        const widget = makeWidget({
          attribute: 'brand',
          operator: 'and',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.facets).toEqual(['brand']);
        expect(actual.facetsRefinements).toEqual({
          brand: [],
        });
      });

      test('returns the `SearchParameters` with the default value without the previous refinement', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '', {
          facets: ['brand'],
          facetsRefinements: {
            brand: ['Apple', 'Samsung'],
          },
        });

        const widget = makeWidget({
          attribute: 'brand',
          operator: 'and',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.facets).toEqual(['brand']);
        expect(actual.facetsRefinements).toEqual({
          brand: [],
        });
      });

      test('returns the `SearchParameters` with the value from `uiState`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '');
        const widget = makeWidget({
          attribute: 'brand',
          operator: 'and',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
            },
          },
        });

        expect(actual.facets).toEqual(['brand']);
        expect(actual.facetsRefinements).toEqual({
          brand: ['Apple', 'Samsung'],
        });
      });

      test('returns the `SearchParameters` with the value from `uiState` without the previous refinement', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '', {
          facets: ['brand'],
          facetsRefinements: {
            brand: ['Microsoft'],
          },
        });

        const widget = makeWidget({
          attribute: 'brand',
          operator: 'and',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
            },
          },
        });

        expect(actual.facets).toEqual(['brand']);
        expect(actual.facetsRefinements).toEqual({
          brand: ['Apple', 'Samsung'],
        });
      });
    });

    describe('with disjunctive facet', () => {
      test('returns the `SearchParameters` with the default value', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '');
        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.disjunctiveFacets).toEqual(['brand']);
        expect(actual.disjunctiveFacetsRefinements).toEqual({
          brand: [],
        });
      });

      test('returns the `SearchParameters` with the default value without the previous refinement', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '', {
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Apple', 'Samsung'],
          },
        });

        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });

        expect(actual.disjunctiveFacets).toEqual(['brand']);
        expect(actual.disjunctiveFacetsRefinements).toEqual({
          brand: [],
        });
      });

      test('returns the `SearchParameters` with the value from `uiState`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '');
        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
            },
          },
        });

        expect(actual.disjunctiveFacets).toEqual(['brand']);
        expect(actual.disjunctiveFacetsRefinements).toEqual({
          brand: ['Apple', 'Samsung'],
        });
      });

      test('returns the `SearchParameters` with the value from `uiState` without the previous refinement', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper({}, '', {
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Microsoft'],
          },
        });

        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters(helper.state, {
          uiState: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
            },
          },
        });

        expect(actual.disjunctiveFacets).toEqual(['brand']);
        expect(actual.disjunctiveFacetsRefinements).toEqual({
          brand: ['Apple', 'Samsung'],
        });
      });
    });
  });
});
