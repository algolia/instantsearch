import algoliasearchHelper from 'algoliasearch-helper';
const SearchResults = algoliasearchHelper.SearchResults;
import { tagConfig } from '../../../lib/escape-highlight.js';

import connectRefinementList from '../connectRefinementList.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectRefinementList', () => {
  const createWidgetFactory = () => {
    const rendering = jest.fn();
    const makeWidget = connectRefinementList(rendering);
    return { rendering, makeWidget };
  };

  it('throws on bad usage', () => {
    expect(connectRefinementList).toThrow();

    expect(() =>
      connectRefinementList({
        operator: 'and',
      })
    ).toThrow();

    expect(() => connectRefinementList(() => {})()).toThrow();

    expect(() =>
      connectRefinementList(() => {})({
        operator: 'and',
      })
    ).toThrow();

    expect(() =>
      connectRefinementList(() => {})({
        attributeName: 'company',
        operator: 'YUP',
      })
    ).toThrow();
  });

  describe('options configuring the helper', () => {
    it('`attributeName`', () => {
      const { makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attributeName: 'myFacet',
      });

      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['myFacet'],
        maxValuesPerFacet: 10,
      });
    });

    it('`limit`', () => {
      const { makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attributeName: 'myFacet',
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

    it('`operator="and"`', () => {
      const { makeWidget } = createWidgetFactory();
      const widget = makeWidget({
        attributeName: 'myFacet',
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
      attributeName: 'myFacet',
      limit: 9,
    });

    const config = widget.getConfiguration({});
    expect(config).toEqual({
      disjunctiveFacets: ['myFacet'],
      maxValuesPerFacet: 9,
    });

    // test if widget is not rendered yet at this point
    expect(rendering).not.toHaveBeenCalled();

    const helper = algoliasearchHelper(fakeClient, '', config);
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
      attributeName: 'myFacet',
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
      attributeName: 'myFacet',
      limit: 9,
    });
  });

  it('Provide a function to clear the refinements at each step', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attributeName: 'category',
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
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
      attributeName: 'category',
      limit: 3,
      showMoreLimit: 10,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
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
      attributeName: 'category',
      limit: 1,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
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
      attributeName: 'category',
      limit: 2,
      showMoreLimit: 10,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
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
      attributeName: 'category',
      limit: 1,
      showMoreLimit: 10,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
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
      attributeName: 'category',
      limit: 1,
      showMoreLimit: 3,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
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
      attributeName: 'category',
      limit: 2,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
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
      attributeName: 'category',
      limit: 2,
    });

    const helper = algoliasearchHelper(fakeClient, '', {
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
      attributeName: 'category',
      limit: 2,
    });

    const helper = algoliasearchHelper(
      fakeClient,
      '',
      widget.getConfiguration({})
    );
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        exhaustiveFacetsCount: true,
        facetHits: [
          {
            count: 33,
            highlighted: 'Salvador <em>Da</em>li',
            value: 'Salvador Dali',
          },
          {
            count: 9,
            highlighted: '<em>Da</em>vidoff',
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
      highlightPreTag: undefined,
      highlightPostTag: undefined,
    });

    return Promise.resolve().then(() => {
      expect(rendering).toHaveBeenCalledTimes(3);
      expect(rendering.mock.calls[2][0].items).toEqual([
        {
          count: 33,
          highlighted: 'Salvador <em>Da</em>li',
          label: 'Salvador Dali',
          value: 'Salvador Dali',
        },
        {
          count: 9,
          highlighted: '<em>Da</em>vidoff',
          label: 'Davidoff',
          value: 'Davidoff',
        },
      ]);
    });
  });

  it('can search in facet values, and reset pre post tags if needed', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attributeName: 'category',
      limit: 2,
    });

    const helper = algoliasearchHelper(fakeClient, '', {
      ...widget.getConfiguration({}),
      // Here we simulate that another widget has set some highlight tags
      ...tagConfig,
    });
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        exhaustiveFacetsCount: true,
        facetHits: [
          {
            count: 33,
            highlighted: 'Salvador <em>Da</em>li',
            value: 'Salvador Dali',
          },
          {
            count: 9,
            highlighted: '<em>Da</em>vidoff',
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
      highlightPreTag: undefined,
      highlightPostTag: undefined,
    });

    return Promise.resolve().then(() => {
      expect(rendering).toHaveBeenCalledTimes(3);
      expect(rendering.mock.calls[2][0].items).toEqual([
        {
          count: 33,
          highlighted: 'Salvador <em>Da</em>li',
          label: 'Salvador Dali',
          value: 'Salvador Dali',
        },
        {
          count: 9,
          highlighted: '<em>Da</em>vidoff',
          label: 'Davidoff',
          value: 'Davidoff',
        },
      ]);
    });
  });

  it('can search in facet values, and set post and pre tags if escapeFacetValues is true', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attributeName: 'category',
      limit: 2,
      escapeFacetValues: true,
    });

    const helper = algoliasearchHelper(fakeClient, '', {
      ...widget.getConfiguration({}),
      // Here we simulate that another widget has set some highlight tags
      ...tagConfig,
    });
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        exhaustiveFacetsCount: true,
        facetHits: [
          {
            count: 33,
            highlighted: `Salvador ${tagConfig.highlightPreTag}Da${
              tagConfig.highlightPostTag
            }li`,
            value: 'Salvador Dali',
          },
          {
            count: 9,
            highlighted: `${tagConfig.highlightPreTag}Da${
              tagConfig.highlightPostTag
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
    expect(paramOverride).toEqual(tagConfig);

    return Promise.resolve().then(() => {
      expect(rendering).toHaveBeenCalledTimes(3);
      expect(rendering.mock.calls[2][0].items).toEqual([
        {
          count: 33,
          highlighted: 'Salvador <em>Da</em>li',
          label: 'Salvador Dali',
          value: 'Salvador Dali',
        },
        {
          count: 9,
          highlighted: '<em>Da</em>vidoff',
          label: 'Davidoff',
          value: 'Davidoff',
        },
      ]);
    });
  });
});
