import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { TAG_PLACEHOLDER } from '../../../lib/escape-highlight';

import connectInfiniteHits from '../connectInfiniteHits';

import { Client } from '../../../types';

jest.mock('../../../lib/utils/hits-absolute-position', () => ({
  addAbsolutePosition: hits => hits,
}));

describe('connectInfiniteHits', () => {
  const defaultInitOptions = {
    instantSearchInstance: {
      helper: null,
      widgets: [],
    },
    templatesConfig: {},
    createURL: () => '#',
  };

  const defaultRenderOptions = {
    instantSearchInstance: {
      helper: null,
      widgets: [],
    },
    templatesConfig: {},
    searchMetadata: { isSearchStalled: false },
    createURL: () => '#',
  };

  it('throws without render function', () => {
    expect(() => {
      // @ts-ignore: test connectInfiniteHits with invalid parameters
      connectInfiniteHits()({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/infinite-hits/js/#connector"
`);
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({
      escapeHTML: true,
    });

    expect(widget.getConfiguration!()).toEqual({
      highlightPreTag: TAG_PLACEHOLDER.highlightPreTag,
      highlightPostTag: TAG_PLACEHOLDER.highlightPostTag,
    });

    // test if widget is not rendered yet at this point
    expect(rendering).toHaveBeenCalledTimes(0);

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering).toHaveBeenCalledTimes(1);
    // test if isFirstRendering is true during init
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [],
        showPrevious: expect.any(Function),
        showMore: expect.any(Function),
        results: undefined,
        isFirstPage: true,
        isLastPage: true,
        instantSearchInstance: {
          helper: null,
          widgets: [],
        },
        widgetParams: {
          escapeHTML: true,
        },
      }),
      true
    );

    widget.render!({
      ...defaultRenderOptions,
      results: new SearchResults(helper.state, [
        {
          hits: [],
        },
      ]),
      state: helper.state,
      helper,
    });

    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [],
        showPrevious: expect.any(Function),
        showMore: expect.any(Function),
        results: expect.any(Object),
        isFirstPage: true,
        isLastPage: false,
        instantSearchInstance: {
          helper: null,
          widgets: [],
        },
        widgetParams: {
          escapeHTML: true,
        },
      }),
      false
    );
  });

  it('sets the default configuration', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({});

    expect(widget.getConfiguration!()).toEqual({
      highlightPreTag: TAG_PLACEHOLDER.highlightPreTag,
      highlightPostTag: TAG_PLACEHOLDER.highlightPostTag,
    });
  });

  it('Provides the hits and accumulates results on next page', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({});

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.hits).toEqual([]);
    expect(firstRenderingOptions.results).toBe(undefined);

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render!({
      ...defaultRenderOptions,
      results,
      state: helper.state,
      helper,
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { showMore } = secondRenderingOptions;
    expect(secondRenderingOptions.hits).toEqual(hits);
    expect(secondRenderingOptions.results).toEqual(results);
    showMore();
    expect(helper.search).toHaveBeenCalledTimes(1);

    // the results should accumulate if there is an increment in page
    const otherHits = [{ fake: 'data 2' }, { sample: 'infos 2' }];
    const otherResults = new SearchResults(helper.state, [
      {
        hits: otherHits,
      },
    ]);
    widget.render!({
      ...defaultRenderOptions,
      results: otherResults,
      state: helper.state,
      helper,
    });

    const thirdRenderingOptions = rendering.mock.calls[2][0];
    expect(thirdRenderingOptions.hits).toEqual([...hits, ...otherHits]);
    expect(thirdRenderingOptions.results).toEqual(otherResults);
  });

  it('Provides the hits and prepends results on previous page', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({});

    const helper = jsHelper({} as Client, '', {});
    helper.setPage(1);
    helper.search = jest.fn();
    helper.emit = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.hits).toEqual([]);
    expect(firstRenderingOptions.results).toBe(undefined);

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [
      {
        hits,
      },
    ]);
    widget.render!({
      ...defaultRenderOptions,
      results,
      state: helper.state,
      helper,
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { showPrevious } = secondRenderingOptions;
    expect(secondRenderingOptions.hits).toEqual(hits);
    expect(secondRenderingOptions.results).toEqual(results);
    showPrevious();
    expect(helper.state.page).toBe(0);
    expect(helper.emit).not.toHaveBeenCalled();
    expect(helper.search).toHaveBeenCalledTimes(1);

    // the results should be prepended if there is an decrement in page
    const previousHits = [{ fake: 'data 2' }, { sample: 'infos 2' }];
    const previousResults = new SearchResults(helper.state, [
      {
        hits: previousHits,
      },
    ]);
    widget.render!({
      ...defaultRenderOptions,
      results: previousResults,
      state: helper.state,
      helper,
    });

    const thirdRenderingOptions = rendering.mock.calls[2][0];
    expect(thirdRenderingOptions.hits).toEqual([...previousHits, ...hits]);
    expect(thirdRenderingOptions.results).toEqual(previousResults);
  });

  it('Provides the hits and flush hists cache on query changes', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({});

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.hits).toEqual([]);
    expect(firstRenderingOptions.results).toBe(undefined);

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render!({
      ...defaultRenderOptions,
      results,
      state: helper.state,
      helper,
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.hits).toEqual(hits);
    expect(secondRenderingOptions.results).toEqual(results);

    helper.setQuery('data');

    // If the query changes, the hits cache should be flushed
    const otherHits = [{ fake: 'data 2' }, { sample: 'infos 2' }];
    const otherResults = new SearchResults(helper.state, [{ hits: otherHits }]);
    widget.render!({
      ...defaultRenderOptions,
      results: otherResults,
      state: helper.state,
      helper,
    });
    const thirdRenderingOptions = rendering.mock.calls[2][0];
    expect(thirdRenderingOptions.hits).toEqual(otherHits);
    expect(thirdRenderingOptions.results).toEqual(otherResults);
  });

  it('escape highlight properties if requested', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({ escapeHTML: true });

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.hits).toEqual([]);
    expect(firstRenderingOptions.results).toBe(undefined);

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${
              TAG_PLACEHOLDER.highlightPostTag
            }</script>`,
          },
        },
      },
    ];

    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render!({
      ...defaultRenderOptions,
      results,
      state: helper.state,
      helper,
    });

    const escapedHits = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
          },
        },
      },
    ];

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.hits).toEqual(escapedHits);
    expect(secondRenderingOptions.results).toEqual(results);
  });

  it('transform items if requested', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({
      transformItems: items => items.map(() => ({ name: 'transformed' })),
    });

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.hits).toEqual([]);
    expect(firstRenderingOptions.results).toBe(undefined);

    const hits = [
      {
        name: 'name 1',
      },
      {
        name: 'name 2',
      },
    ];

    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render!({
      ...defaultRenderOptions,
      results,
      state: helper.state,
      helper,
    });

    const transformedHits = [
      {
        name: 'transformed',
      },
      {
        name: 'transformed',
      },
    ];

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.hits).toEqual(transformedHits);
    expect(secondRenderingOptions.results).toEqual(results);
  });

  it('transform items after escaping', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({
      transformItems: items =>
        items.map(item => ({
          ...item,
          _highlightResult: {
            name: {
              value: item._highlightResult.name.value.toUpperCase(),
            },
          },
        })),
      escapeHTML: true,
    });

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    const hits = [
      {
        name: 'hello',
        _highlightResult: {
          name: {
            value: `he${TAG_PLACEHOLDER.highlightPreTag}llo${
              TAG_PLACEHOLDER.highlightPostTag
            }`,
          },
        },
      },
      {
        name: 'halloween',
        _highlightResult: {
          name: {
            value: `ha${TAG_PLACEHOLDER.highlightPreTag}llo${
              TAG_PLACEHOLDER.highlightPostTag
            }ween`,
          },
        },
      },
    ];

    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render!({
      ...defaultRenderOptions,
      results,
      state: helper.state,
      helper,
    });

    expect(rendering).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: [
          {
            name: 'hello',
            _highlightResult: {
              name: {
                value: 'HE<MARK>LLO</MARK>',
              },
            },
          },
          {
            name: 'halloween',
            _highlightResult: {
              name: {
                value: 'HA<MARK>LLO</MARK>WEEN',
              },
            },
          },
        ],
        results,
      }),
      expect.anything()
    );
  });

  it('adds queryID if provided to results', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({});

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    const hits = [
      {
        name: 'name 1',
      },
      {
        name: 'name 2',
      },
    ];

    const results = new SearchResults(helper.state, [
      { hits, queryID: 'theQueryID' },
    ]);
    widget.render!({
      ...defaultRenderOptions,
      results,
      state: helper.state,
      helper,
    });

    expect(rendering).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: [
          {
            name: 'name 1',
            __queryID: 'theQueryID',
          },
          {
            name: 'name 2',
            __queryID: 'theQueryID',
          },
        ],
      }),
      false
    );
  });

  it('does not render the same page twice', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({});

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    widget.render!({
      ...defaultRenderOptions,
      results: new SearchResults(helper.state, [
        {
          hits: [{ objectID: 'a' }],
          page: 0,
          nbPages: 4,
        },
      ]),
      state: helper.state,
      helper,
    });

    helper.setPage(1);

    widget.render!({
      ...defaultRenderOptions,
      results: new SearchResults(helper.state, [
        {
          hits: [{ objectID: 'b' }],
          page: 1,
          nbPages: 4,
        },
      ]),
      state: helper.state,
      helper,
    });

    expect(rendering).toHaveBeenCalledTimes(3);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [{ objectID: 'a' }, { objectID: 'b' }],
      }),
      false
    );

    widget.render!({
      ...defaultRenderOptions,
      results: new SearchResults(helper.state, [
        {
          hits: [{ objectID: 'b' }],
          page: 1,
          nbPages: 4,
        },
      ]),
      state: helper.state,
      helper,
    });

    expect(rendering).toHaveBeenCalledTimes(4);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [{ objectID: 'a' }, { objectID: 'b' }],
      }),
      false
    );
  });

  describe('routing', () => {
    describe('getWidgetState', () => {
      it('should give back the object unmodified if the default value is selected', () => {
        const rendering = jest.fn();
        const makeWidget = connectInfiniteHits(rendering);
        const widget = makeWidget({ showPrevious: true });

        const helper = jsHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });

        const uiStateBefore = { page: 1 };
        const uiStateAfter = widget.getWidgetState!(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });

      it('should add an entry equal to the refinement', () => {
        const rendering = jest.fn();
        const makeWidget = connectInfiniteHits(rendering);
        const widget = makeWidget({ showPrevious: true });

        const helper = jsHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });

        const { showMore } = rendering.mock.calls[0][0];

        showMore();

        const uiStateBefore = { page: 1 };
        const uiStateAfter = widget.getWidgetState!(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      it('should give back the object unmodified if showPrevious is disabled', () => {
        const rendering = jest.fn();
        const makeWidget = connectInfiniteHits(rendering);
        const widget = makeWidget({ showPrevious: false });

        const helper = jsHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });

        const { showMore } = rendering.mock.calls[0][0];

        showMore();

        const uiStateBefore = { page: 1 };
        const uiStateAfter = widget.getWidgetState!(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });
    });

    describe('getWidgetSearchParameters', () => {
      it('should return the same SP if there are no refinements in the UI state', () => {
        const rendering = jest.fn();
        const makeWidget = connectInfiniteHits(rendering);
        const widget = makeWidget({ showPrevious: true });

        const helper = jsHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!({
          ...defaultInitOptions,
          state: helper.state,
          helper,
        });

        // The user presses back (browser), and the URL contains no parameters
        const uiState = {};
        // The current state is empty (and page is set to 0 by default)
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters!(
          searchParametersBefore,
          { uiState }
        );
        // Applying the same values should not return a new object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      it('should enforce the default value if no value is in the UI State', () => {
        const rendering = jest.fn();
        const makeWidget = connectInfiniteHits(rendering);
        const widget = makeWidget({ showPrevious: true });

        const helper = jsHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });

        const { showMore } = rendering.mock.calls[0][0];

        // The user presses back (browser), and the URL contains no parameters
        const uiState = {};
        // The current state is set to next page
        showMore();
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters!(
          searchParametersBefore,
          {
            uiState,
          }
        );
        // Applying an empty state, should force back to page 0
        expect(searchParametersAfter).toMatchSnapshot();
        expect(searchParametersAfter.page).toBeUndefined();
      });

      it('should add the refinements according to the UI state provided', () => {
        (global as any).window = { location: { pathname: null } };
        const rendering = jest.fn();
        const makeWidget = connectInfiniteHits(rendering);
        const widget = makeWidget({ showPrevious: true });

        const helper = jsHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });

        const { showMore } = rendering.mock.calls[0][0];

        // The user presses back (browser), and the URL contains some parameters
        const uiState = {
          page: 2,
        };
        // The current state is set to next page
        showMore();
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters!(
          searchParametersBefore,
          {
            uiState,
          }
        );
        // Applying a state with new parameters should apply them on the search
        expect(searchParametersAfter).toMatchSnapshot();
        expect(searchParametersAfter.page).toBe(1);
      });
    });

    it('should return the same SP if showPrevious is disabled', () => {
      (global as any).window = { location: { pathname: null } };
      const rendering = jest.fn();
      const makeWidget = connectInfiniteHits(rendering);
      const widget = makeWidget({ showPrevious: false });

      const helper = jsHelper({} as Client, '', {});
      helper.search = jest.fn();

      widget.init!({
        ...defaultInitOptions,
        helper,
        state: helper.state,
      });

      const { showMore } = rendering.mock.calls[0][0];

      // The user presses back (browser), and the URL contains some parameters
      const uiState = {
        page: 4,
      };
      // The current state is set to next page
      showMore();
      const searchParametersBefore = SearchParameters.make(helper.state);
      const searchParametersAfter = widget.getWidgetSearchParameters!(
        searchParametersBefore,
        {
          uiState,
        }
      );
      expect(searchParametersAfter).toBe(searchParametersBefore);
    });
  });
});
