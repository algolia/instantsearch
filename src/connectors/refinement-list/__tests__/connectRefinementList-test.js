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
    expect(connectRefinementList).toThrow(/Usage:/);

    expect(() =>
      connectRefinementList({
        operator: 'and',
      })
    ).toThrow(/Usage:/);

    expect(() => connectRefinementList(() => {})()).toThrow(/Usage:/);

    expect(() =>
      connectRefinementList(() => {})({
        operator: 'and',
      })
    ).toThrow(/Usage:/);

    expect(() =>
      connectRefinementList(() => {})({
        attribute: 'company',
        operator: 'YUP',
      })
    ).toThrow(/Usage:/);

    expect(() =>
      connectRefinementList(() => {})({
        attribute: 'company',
        limit: 10,
        showMore: true,
        showMoreLimit: 10,
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"\`showMoreLimit\` should be greater than \`limit\`."`
    );

    expect(() =>
      connectRefinementList(() => {})({
        attribute: 'company',
        limit: 10,
        showMore: true,
        showMoreLimit: 5,
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"\`showMoreLimit\` should be greater than \`limit\`."`
    );
  });

  describe('options configuring the helper', () => {
    it('`attribute`', () => {
      const { makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attribute: 'myFacet',
      });

      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['myFacet'],
        maxValuesPerFacet: 10,
      });
    });

    it('`limit`', () => {
      const { makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 20,
      });

      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['myFacet'],
        maxValuesPerFacet: 20,
      });

      expect(widget.getConfiguration({ maxValuesPerFacet: 100 })).toEqual(
        {
          disjunctiveFacets: ['myFacet'],
          maxValuesPerFacet: 100,
        },
        'Can read the previous maxValuesPerFacet value'
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

      const helper = jsHelper({}, '', widget.getConfiguration({}));
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
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

      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['myFacet'],
        maxValuesPerFacet: 30,
      });

      expect(widget.getConfiguration({ maxValuesPerFacet: 100 })).toEqual({
        disjunctiveFacets: ['myFacet'],
        maxValuesPerFacet: 100,
      });
    });

    it('`showMoreLimit` without `showMore` does not set anything', () => {
      const { rendering, makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attribute: 'myFacet',
        limit: 20,
        showMoreLimit: 30,
      });

      const helper = jsHelper({}, '', widget.getConfiguration({}));
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
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

      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['myFacet'],
        maxValuesPerFacet: 20,
      });
    });

    it('`operator="and"`', () => {
      const { makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attribute: 'myFacet',
        operator: 'and',
      });

      expect(widget.getConfiguration()).toEqual({
        facets: ['myFacet'],
        maxValuesPerFacet: 10,
      });
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

    const config = widget.getConfiguration({});
    expect(config).toEqual({
      disjunctiveFacets: ['myFacet'],
      maxValuesPerFacet: 9,
    });

    // test if widget is not rendered yet at this point
    expect(rendering).not.toHaveBeenCalled();

    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering).toHaveBeenCalledTimes(1);
    // test if isFirstRendering is true during init
    expect(rendering).lastCalledWith(expect.any(Object), true);

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
    expect(rendering).lastCalledWith(expect.any(Object), false);

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.canRefine).toBe(false);
    expect(secondRenderingOptions.widgetParams).toEqual({
      attribute: 'myFacet',
      limit: 9,
    });
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
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

  it('Provide a function to clear the refinements at each step', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
    });

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'value');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
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

  it('If there are too few items then canToggleShowMore is false', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 3,
      showMore: true,
      showMoreLimit: 10,
    });

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
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

    expect(rendering).lastCalledWith(
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
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

    expect(rendering).lastCalledWith(
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
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

    expect(rendering).lastCalledWith(
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

  it('hasExhaustiveItems indicates if the items provided are exhaustive - without other widgets making the maxValuesPerFacet bigger', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
    });

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
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
      ...widget.getConfiguration({}),
      maxValuesPerFacet: 3,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
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
      onHistoryChange: () => {},
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

    const helper = jsHelper({}, '', widget.getConfiguration({}));
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
      onHistoryChange: () => {},
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
      ...widget.getConfiguration({}),
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
      onHistoryChange: () => {},
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
      ...widget.getConfiguration({}),
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
            highlighted: `Salvador ${TAG_PLACEHOLDER.highlightPreTag}Da${
              TAG_PLACEHOLDER.highlightPostTag
            }li`,
            value: 'Salvador Dali',
          },
          {
            count: 9,
            highlighted: `${TAG_PLACEHOLDER.highlightPreTag}Da${
              TAG_PLACEHOLDER.highlightPostTag
            }vidoff`,
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
      onHistoryChange: () => {},
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

  describe('routing', () => {
    const getInitializedWidget = (config = {}) => {
      const rendering = jest.fn();
      const makeWidget = connectRefinementList(rendering);

      const widget = makeWidget({
        attribute: 'facetAttribute',
        ...config,
      });

      const initialConfig = widget.getConfiguration({}, {});
      const helper = jsHelper({}, '', initialConfig);
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      const { refine } = rendering.mock.calls[0][0];

      return [widget, helper, refine];
    };

    describe('getWidgetState', () => {
      test('should give back the object unmodified if the default value is selected', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });
        expect(uiStateAfter).toBe(uiStateBefore);
      });

      test('should add an entry equal to the refinement', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine('value');
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });
        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should not override other values in the same namespace', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine('value');
        const uiStateBefore = {
          refinementList: {
            otherFacetAttribute: ['val'],
          },
        };
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });
        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should return the same instance if the value is already in the UI state', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine('value');
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
        expect(uiStateAfter).toBe(uiStateBefore);
      });
    });

    describe('getWidgetSearchParameters', () => {
      test('should return the same SP if no value is in the UI state', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), the url is empty
        const uiState = {};
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying nothing on an empty search should return the same object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should add the refinements according to the UI state provided (operator "or")', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), the URL contains a diskunctive refinement
        const uiState = {
          refinementList: {
            facetAttribute: ['value or'],
          },
        };
        // The current search is emtpy
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the refinement should yield a new state with a disjunctive refinement
        expect(searchParametersAfter).toMatchSnapshot();
      });

      test('should add the refinements according to the UI state provided (operator "and")', () => {
        const [widget, helper] = getInitializedWidget({
          operator: 'and',
        });
        // The user presses back (browser), and there is one value
        const uiState = {
          refinementList: {
            facetAttribute: ['value and'],
          },
        };
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the refinement should yield a new state with a conjunctive refinement
        expect(searchParametersAfter).toMatchSnapshot();
      });
    });
  });
});
