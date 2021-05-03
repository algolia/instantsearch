import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { TAG_PLACEHOLDER } from '../../../lib/utils';
import connectRefinementList from '../connectRefinementList';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { castToJestMock } from '../../../../test/utils/castToJestMock';

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
      } as any)
    ).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Object).

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/#connector"
`);

    // @ts-ignore
    expect(() => connectRefinementList(() => {})())
      .toThrowErrorMatchingInlineSnapshot(`
"The \`attribute\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/#connector"
`);

    expect(() =>
      // @ts-ignore
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
        // @ts-ignore
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

        getWidgetUiState: expect.any(Function),
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
        widget.getWidgetSearchParameters!(new SearchParameters(), {
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
        widget.getWidgetSearchParameters!(new SearchParameters(), {
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
        widget.getWidgetSearchParameters!(
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
        createSearchClient(),
        '',
        widget.getWidgetSearchParameters!(new SearchParameters({}), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
          createURL: () => '#',
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              facets: {
                category: {
                  c1: 880,
                  c2: 47,
                  c3: 880,
                  c4: 47,
                },
              },
            }),
            createSingleSearchResponse({
              facets: {
                category: {
                  c1: 880,
                  c2: 47,
                  c3: 880,
                  c4: 47,
                },
              },
            }),
          ]),
          state: helper.state,
          helper,
          createURL: () => '#',
        })
      );

      const secondRenderingOptions = rendering.mock.calls[1][0];
      secondRenderingOptions.toggleShowMore();

      expect(
        widget.getWidgetSearchParameters!(new SearchParameters({}), {
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
        widget.getWidgetSearchParameters!(
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
        createSearchClient(),
        '',
        widget.getWidgetSearchParameters!(new SearchParameters({}), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
          createURL: () => '#',
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              facets: {
                category: {
                  c1: 880,
                  c2: 47,
                  c3: 880,
                  c4: 47,
                },
              },
            }),
            createSingleSearchResponse({
              facets: {
                category: {
                  c1: 880,
                  c2: 47,
                  c3: 880,
                  c4: 47,
                },
              },
            }),
          ]),
          state: helper.state,
          helper,
          createURL: () => '#',
        })
      );

      const secondRenderingOptions = rendering.mock.calls[1][0];
      secondRenderingOptions.toggleShowMore();

      expect(
        widget.getWidgetSearchParameters!(new SearchParameters({}), {
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
        widget.getWidgetSearchParameters!(new SearchParameters({}), {
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

    const config = widget.getWidgetSearchParameters!(new SearchParameters({}), {
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

    const helper = jsHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

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

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({}),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({}),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
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
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
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
    const instantSearchInstance = createInstantSearch();
    const widget = makeWidget({
      attribute: 'category',
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'value');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
        instantSearchInstance,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine } = firstRenderingOptions;
    refine('value');
    expect(helper.state.disjunctiveFacetsRefinements.category).toHaveLength(0);
    refine('value');
    expect(helper.state.disjunctiveFacetsRefinements.category).toHaveLength(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { refine: renderToggleRefinement } = secondRenderingOptions;
    renderToggleRefinement('value');
    expect(helper.state.disjunctiveFacetsRefinements.category).toHaveLength(0);
    renderToggleRefinement('value');
    expect(helper.state.disjunctiveFacetsRefinements.category).toHaveLength(1);
  });

  it('Provide a function to clear the refinements at each step (and)', () => {
    const instantSearchInstance = createInstantSearch();
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      operator: 'and',
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    helper.toggleRefinement('category', 'value');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
        instantSearchInstance,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine } = firstRenderingOptions;
    refine('value');
    expect(helper.state.facetsRefinements.category).toHaveLength(0);
    refine('value');
    expect(helper.state.facetsRefinements.category).toHaveLength(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        facetHits: [],
      })
    );

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    const renderingOptions2 = rendering.mock.calls[1][0];
    expect(renderingOptions2).toEqual({
      createURL: expect.any(Function),
      items: [
        {
          count: 880,
          highlighted: 'c1',
          isRefined: false,
          label: 'c1',
          value: 'c1',
        },
      ],
      refine: expect.any(Function),
      searchForItems: expect.any(Function),
      isFromSearch: false,
      canRefine: true,
      widgetParams: {
        attribute: 'category',
        limit: 1,
        showMore: true,
        showMoreLimit: 2,
      },
      isShowingMore: false,
      canToggleShowMore: true,
      toggleShowMore: expect.any(Function),
      hasExhaustiveItems: false,
      sendEvent: expect.any(Function),
      instantSearchInstance: expect.any(Object),
    });

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
    expect(renderingOptions3).toEqual({
      createURL: expect.any(Function),
      items: [],
      refine: expect.any(Function),
      searchForItems: expect.any(Function),
      isFromSearch: true,
      canRefine: true,
      widgetParams: {
        attribute: 'category',
        limit: 1,
        showMore: true,
        showMoreLimit: 2,
      },
      isShowingMore: false,
      canToggleShowMore: false,
      toggleShowMore: expect.any(Function),
      hasExhaustiveItems: false,
      sendEvent: expect.any(Function),
      instantSearchInstance: expect.any(Object),
    });

    // `searchForItems` triggers a new render
    renderingOptions3.searchForItems('');
    await Promise.resolve();

    expect(rendering).toHaveBeenCalledTimes(4);
    const renderingOptions4 = rendering.mock.calls[3][0];
    expect(renderingOptions4).toEqual({
      createURL: expect.any(Function),
      items: [
        {
          count: 880,
          highlighted: 'c1',
          isRefined: false,
          label: 'c1',
          value: 'c1',
        },
      ],
      refine: expect.any(Function),
      searchForItems: expect.any(Function),
      isFromSearch: false,
      canRefine: true,
      widgetParams: {
        attribute: 'category',
        limit: 1,
        showMore: true,
        showMoreLimit: 2,
      },
      isShowingMore: false,
      canToggleShowMore: true,
      toggleShowMore: expect.any(Function),
      hasExhaustiveItems: false,
      sendEvent: expect.any(Function),
      instantSearchInstance: expect.any(Object),
    });

    // `toggleShowMore` triggers a new render
    renderingOptions4.toggleShowMore();

    expect(rendering).toHaveBeenCalledTimes(5);
    const renderingOptions5 = rendering.mock.calls[4][0];
    expect(renderingOptions5).toEqual({
      createURL: expect.any(Function),
      items: [
        {
          count: 880,
          highlighted: 'c1',
          isRefined: false,
          label: 'c1',
          value: 'c1',
        },
        {
          count: 880,
          highlighted: 'c3',
          isRefined: false,
          label: 'c3',
          value: 'c3',
        },
      ],
      refine: expect.any(Function),
      searchForItems: expect.any(Function),
      isFromSearch: false,
      canRefine: true,
      widgetParams: {
        attribute: 'category',
        limit: 1,
        showMore: true,
        showMoreLimit: 2,
      },
      isShowingMore: true,
      canToggleShowMore: true,
      toggleShowMore: expect.any(Function),
      hasExhaustiveItems: false,
      sendEvent: expect.any(Function),
      instantSearchInstance: expect.any(Object),
    });

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

    const helper = jsHelper(createSearchClient(), '', {
      ...widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      }),
      maxValuesPerFacet: 10,
    });
    helper.search = jest.fn();

    // 1st rendering: initialization
    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    // 2nd rendering: with 4 results (collapsed refinement list with limit < showMoreLimit < facets)
    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];

    expect(secondRenderingOptions.canToggleShowMore).toEqual(true);

    // 3rd rendering: expand refinement list
    secondRenderingOptions.toggleShowMore();

    // 4th rendering: with 2 results (expanded refinement list with limit < facets < showMoreLimit)
    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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

    const helper = jsHelper(createSearchClient(), '', {
      ...widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      }),
      maxValuesPerFacet: 10,
    });
    helper.search = jest.fn();

    // 1st rendering: initialization
    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    // 2nd rendering: with 4 results (collapsed refinement list with limit < showMoreLimit < facets)
    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 47,
                c3: 880,
                c4: 47,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];

    expect(secondRenderingOptions.canToggleShowMore).toEqual(true);

    // 3rd rendering: expand refinement list
    secondRenderingOptions.toggleShowMore();

    // 4th rendering: with 1 result (expanded refinement list with facets < limit < showMoreLimit)
    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    expect(rendering.mock.calls[0][0].hasExhaustiveItems).toEqual(true);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 880,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 880,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    // this one is `false` because we're not sure that what we asked is the actual number of facet values
    expect(rendering.mock.calls[1][0].hasExhaustiveItems).toEqual(false);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 34,
                c3: 440,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 34,
                c3: 440,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    expect(rendering.mock.calls[2][0].hasExhaustiveItems).toEqual(false);
  });

  it('hasExhaustiveItems indicates if the items provided are exhaustive - with an other widgets making the maxValuesPerFacet bigger', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 2,
    });

    const helper = jsHelper(createSearchClient(), '', {
      ...widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      }),
      maxValuesPerFacet: 3,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    expect(rendering.mock.calls[0][0].hasExhaustiveItems).toEqual(true);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 880,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 880,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    expect(rendering.mock.calls[1][0].hasExhaustiveItems).toEqual(true);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 34,
                c3: 440,
                c4: 440,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 34,
                c3: 440,
                c4: 440,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
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
    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );
    expect(rendering).toHaveBeenCalledTimes(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
                c2: 880,
                c3: 880,
                c4: 880,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
                c2: 880,
                c3: 880,
                c4: 880,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );
    expect(rendering).toHaveBeenCalledTimes(2);
    // Simulation end

    const search = rendering.mock.calls[1][0].searchForItems;
    search('da');

    const [sffvFacet, sffvQuery, maxNbItems, paramOverride] = castToJestMock(
      helper.searchForFacetValues
    ).mock.calls[0];

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

  it('caps the search in facet values to 100 facet hits', () => {
    const { makeWidget, rendering } = createWidgetFactory();
    const widget = makeWidget({
      attribute: 'category',
      limit: 50,
      showMoreLimit: 1000,
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();
    helper.searchForFacetValues = jest.fn().mockReturnValue(
      Promise.resolve({
        exhaustiveFacetsCount: true,
        facetHits: [],
        processingTimeMS: 1,
      })
    );

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    const { toggleShowMore } = rendering.mock.calls[1][0];
    toggleShowMore();

    const { searchForItems } = rendering.mock.calls[2][0];
    searchForItems('query');

    const maxNbItems = castToJestMock(helper.searchForFacetValues).mock
      .calls[0][2];

    expect(maxNbItems).toBe(100);
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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
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
    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );
    expect(rendering).toHaveBeenCalledTimes(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );
    expect(rendering).toHaveBeenCalledTimes(2);
    // Simulation end

    const search = rendering.mock.calls[1][0].searchForItems;
    search('transfo');

    const [sffvFacet, sffvQuery, maxNbItems, paramOverride] = castToJestMock(
      helper.searchForFacetValues
    ).mock.calls[0];

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

    const helper = jsHelper(createSearchClient(), '', {
      ...widget.getWidgetSearchParameters!(new SearchParameters({}), {
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
    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );
    expect(rendering).toHaveBeenCalledTimes(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );
    expect(rendering).toHaveBeenCalledTimes(2);
    // Simulation end

    const search = rendering.mock.calls[1][0].searchForItems;
    search('da');

    const [sffvFacet, sffvQuery, maxNbItems, paramOverride] = castToJestMock(
      helper.searchForFacetValues
    ).mock.calls[0];

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

    const helper = jsHelper(createSearchClient(), '', {
      ...widget.getWidgetSearchParameters!(new SearchParameters({}), {
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
    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );
    expect(rendering).toHaveBeenCalledTimes(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
          createSingleSearchResponse({
            facets: {
              category: {
                c1: 880,
              },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );
    expect(rendering).toHaveBeenCalledTimes(2);
    // Simulation end

    const search = rendering.mock.calls[1][0].searchForItems;
    search('da');

    const [sffvFacet, sffvQuery, maxNbItems, paramOverride] = castToJestMock(
      helper.searchForFacetValues
    ).mock.calls[0];

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );

    expect(() =>
      widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
    ).not.toThrow();
  });

  describe('dispose', () => {
    it('removes refinements completely on dispose (and)', () => {
      const rendering = jest.fn();
      const makeWidget = connectRefinementList(rendering);
      const instantSearchInstance = createInstantSearch();

      const widget = makeWidget({
        attribute: 'category',
        operator: 'and',
      });

      const indexName = 'my-index';
      const helper = jsHelper(
        createSearchClient(),
        indexName,
        widget.getWidgetSearchParameters!(new SearchParameters({}), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
          createURL: () => '#',
          instantSearchInstance,
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              facets: {
                category: {
                  c1: 880,
                  c2: 47,
                },
              },
            }),
            createSingleSearchResponse({
              facets: {
                category: {
                  c1: 880,
                  c2: 47,
                },
              },
            }),
          ]),
          state: helper.state,
          helper,
        })
      );

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

      const newState = widget.dispose!(
        createDisposeOptions({
          state: helper.state,
          helper,
        })
      );

      expect(newState).toEqual(
        new SearchParameters({
          index: indexName,
        })
      );
    });

    it('removes refinements completely on dispose (or)', () => {
      const rendering = jest.fn();
      const makeWidget = connectRefinementList(rendering);
      const instantSearchInstance = createInstantSearch();

      const widget = makeWidget({
        attribute: 'category',
        operator: 'or',
      });

      const indexName = 'my-index';
      const helper = jsHelper(
        createSearchClient(),
        indexName,
        widget.getWidgetSearchParameters!(new SearchParameters({}), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
          createURL: () => '#',
          instantSearchInstance,
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              facets: {
                category: {
                  c1: 880,
                  c2: 47,
                },
              },
            }),
            createSingleSearchResponse({
              facets: {
                category: {
                  c1: 880,
                  c2: 47,
                },
              },
            }),
          ]),
          state: helper.state,
          helper,
        })
      );

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

      const newState = widget.dispose!(
        createDisposeOptions({
          state: helper.state,
          helper,
        })
      );

      expect(newState).toEqual(
        new SearchParameters({
          index: indexName,
        })
      );
    });
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` empty', () => {
      const render = () => {};
      const makeWidget = connectRefinementList(render);
      const helper = jsHelper(createSearchClient(), '');
      const widget = makeWidget({
        attribute: 'brand',
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
      const makeWidget = connectRefinementList(render);
      const helper = jsHelper(createSearchClient(), '', {
        disjunctiveFacets: ['brand'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple', 'Microsoft'],
        },
      });

      const widget = makeWidget({
        attribute: 'brand',
      });

      const actual = widget.getWidgetUiState!(
        {},
        {
          searchParameters: helper.state,
          helper,
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
      const helper = jsHelper(createSearchClient(), '', {
        disjunctiveFacets: ['brand'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple', 'Microsoft'],
        },
      });

      const widget = makeWidget({
        attribute: 'brand',
      });

      const actual = widget.getWidgetUiState!(
        {
          refinementList: {
            categories: ['Phone', 'Tablet'],
          },
        },
        {
          searchParameters: helper.state,
          helper,
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

  describe('getRenderState', () => {
    it('returns the render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRefinementList = connectRefinementList(renderFn, unmountFn);
      const refinementListWidget = createRefinementList({ attribute: 'brand' });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['brand'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple', 'Microsoft'],
        },
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = refinementListWidget.getRenderState({}, initOptions);

      expect(renderState1.refinementList).toEqual({
        brand: {
          canRefine: false,
          canToggleShowMore: false,
          createURL: expect.any(Function),
          hasExhaustiveItems: true,
          isFromSearch: false,
          isShowingMore: false,
          items: [],
          refine: expect.any(Function),
          searchForItems: expect.any(Function),
          toggleShowMore: expect.any(Function),
          sendEvent: expect.any(Function),
          widgetParams: {
            attribute: 'brand',
          },
        },
      });
    });

    it('returns the render state with results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRefinementList = connectRefinementList(renderFn, unmountFn);
      const refinementListWidget = createRefinementList({ attribute: 'brand' });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['brand'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple', 'Microsoft'],
        },
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = refinementListWidget.getRenderState({}, initOptions);

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({
          hits: [],
          facets: {
            brand: {
              Apple: 88,
              Microsoft: 66,
              Samsung: 44,
            },
          },
        }),
      ]);

      const renderOptions = createRenderOptions({
        helper,
        state: helper.state,
        results,
      });

      const renderState2 = refinementListWidget.getRenderState(
        {},
        renderOptions
      );

      expect(renderState2.refinementList).toEqual({
        brand: {
          canRefine: true,
          canToggleShowMore: false,
          createURL: expect.any(Function),
          hasExhaustiveItems: true,
          isFromSearch: false,
          isShowingMore: false,
          items: [
            {
              count: 88,
              highlighted: 'Apple',
              isRefined: true,
              label: 'Apple',
              value: 'Apple',
            },
            {
              count: 66,
              highlighted: 'Microsoft',
              isRefined: true,
              label: 'Microsoft',
              value: 'Microsoft',
            },
            {
              count: 44,
              highlighted: 'Samsung',
              isRefined: false,
              label: 'Samsung',
              value: 'Samsung',
            },
          ],
          refine: renderState1.refinementList!.brand.refine,
          searchForItems: expect.any(Function),
          sendEvent: expect.any(Function),
          toggleShowMore: renderState1.refinementList!.brand.toggleShowMore,
          widgetParams: {
            attribute: 'brand',
          },
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRefinementList = connectRefinementList(renderFn, unmountFn);
      const refinementListWidget = createRefinementList({ attribute: 'brand' });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['brand'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple', 'Microsoft'],
        },
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = refinementListWidget.getWidgetRenderState(
        initOptions
      );

      expect(renderState1).toEqual({
        canRefine: false,
        canToggleShowMore: false,
        createURL: expect.any(Function),
        hasExhaustiveItems: true,
        isFromSearch: false,
        isShowingMore: false,
        items: [],
        refine: expect.any(Function),
        searchForItems: expect.any(Function),
        toggleShowMore: expect.any(Function),
        sendEvent: expect.any(Function),
        widgetParams: {
          attribute: 'brand',
        },
      });
    });

    it('returns the widget render state with results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRefinementList = connectRefinementList(renderFn, unmountFn);
      const refinementListWidget = createRefinementList({ attribute: 'brand' });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['brand'],
        disjunctiveFacetsRefinements: {
          brand: ['Apple', 'Microsoft'],
        },
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = refinementListWidget.getWidgetRenderState(
        initOptions
      );

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({
          hits: [],
          facets: {
            brand: {
              Apple: 88,
              Microsoft: 66,
              Samsung: 44,
            },
          },
        }),
      ]);

      const renderOptions = createRenderOptions({
        helper,
        state: helper.state,
        results,
      });

      const renderState2 = refinementListWidget.getWidgetRenderState(
        renderOptions
      );

      expect(renderState2).toEqual(
        expect.objectContaining({
          canRefine: true,
          canToggleShowMore: false,
          createURL: expect.any(Function),
          hasExhaustiveItems: true,
          isFromSearch: false,
          isShowingMore: false,
          items: [
            {
              count: 88,
              highlighted: 'Apple',
              isRefined: true,
              label: 'Apple',
              value: 'Apple',
            },
            {
              count: 66,
              highlighted: 'Microsoft',
              isRefined: true,
              label: 'Microsoft',
              value: 'Microsoft',
            },
            {
              count: 44,
              highlighted: 'Samsung',
              isRefined: false,
              label: 'Samsung',
              value: 'Samsung',
            },
          ],
          refine: renderState1.refine,
          searchForItems: expect.any(Function),
          toggleShowMore: renderState1.toggleShowMore,
          widgetParams: {
            attribute: 'brand',
          },
        })
      );
    });
  });

  describe('getWidgetSearchParameters', () => {
    describe('with `maxValuesPerFacet`', () => {
      test('returns the `SearchParameters` with default `limit`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper(createSearchClient(), '');
        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(10);
      });

      test('returns the `SearchParameters` with provided `limit`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper(createSearchClient(), '');
        const widget = makeWidget({
          attribute: 'brand',
          limit: 5,
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(5);
      });

      test('returns the `SearchParameters` with default `showMoreLimit`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper(createSearchClient(), '');
        const widget = makeWidget({
          attribute: 'brand',
          showMore: true,
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(20);
      });

      test('returns the `SearchParameters` with provided `showMoreLimit`', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper(createSearchClient(), '');
        const widget = makeWidget({
          attribute: 'brand',
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
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper(createSearchClient(), '', {
          maxValuesPerFacet: 100,
        });

        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(100);
      });

      test('returns the `SearchParameters` with `limit`/`showMoreLimit` if higher than previous value', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper(createSearchClient(), '', {
          maxValuesPerFacet: 100,
        });

        const widget = makeWidget({
          attribute: 'brand',
          limit: 110,
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
          uiState: {},
        });

        expect(actual.maxValuesPerFacet).toBe(110);
      });
    });

    describe('with conjunctive facet', () => {
      test('returns the `SearchParameters` with the default value', () => {
        const render = () => {};
        const makeWidget = connectRefinementList(render);
        const helper = jsHelper(createSearchClient(), '');
        const widget = makeWidget({
          attribute: 'brand',
          operator: 'and',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
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
        const helper = jsHelper(createSearchClient(), '', {
          facets: ['brand'],
          facetsRefinements: {
            brand: ['Apple', 'Samsung'],
          },
        });

        const widget = makeWidget({
          attribute: 'brand',
          operator: 'and',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
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
        const helper = jsHelper(createSearchClient(), '');
        const widget = makeWidget({
          attribute: 'brand',
          operator: 'and',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
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
        const helper = jsHelper(createSearchClient(), '', {
          facets: ['brand'],
          facetsRefinements: {
            brand: ['Microsoft'],
          },
        });

        const widget = makeWidget({
          attribute: 'brand',
          operator: 'and',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
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
        const helper = jsHelper(createSearchClient(), '');
        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
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
        const helper = jsHelper(createSearchClient(), '', {
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Apple', 'Samsung'],
          },
        });

        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
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
        const helper = jsHelper(createSearchClient(), '');
        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
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
        const helper = jsHelper(createSearchClient(), '', {
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Microsoft'],
          },
        });

        const widget = makeWidget({
          attribute: 'brand',
        });

        const actual = widget.getWidgetSearchParameters!(helper.state, {
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

  describe('insights', () => {
    const createInitializedWidget = () => {
      const factoryResult = createWidgetFactory();
      const makeWidget = factoryResult.makeWidget;
      const rendering = factoryResult.rendering;
      const instantSearchInstance = createInstantSearch();
      const widget = makeWidget({
        attribute: 'category',
      });

      const helper = jsHelper(
        createSearchClient(),
        '',
        widget.getWidgetSearchParameters!(new SearchParameters({}), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
          createURL: () => '#',
          instantSearchInstance,
        })
      );

      return {
        rendering,
        instantSearchInstance,
      };
    };

    it('sends event when a facet is added', () => {
      const { rendering, instantSearchInstance } = createInitializedWidget();
      const firstRenderingOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
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
        widgetType: 'ais.refinementList',
      });
    });

    it('does not send event when a facet is removed', () => {
      const { rendering, instantSearchInstance } = createInitializedWidget();
      const firstRenderingOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine } = firstRenderingOptions;
      refine('value');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );

      refine('value');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      ); // still the same
    });
  });
});
