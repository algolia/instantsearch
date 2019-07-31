import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { Client } from 'algoliasearch';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { TAG_PLACEHOLDER } from '../../../lib/escape-highlight';
import connectInfiniteHits from '../connectInfiniteHits';

jest.mock('../../../lib/utils/hits-absolute-position', () => ({
  // The real implementation creates a new array instance, which can cause bugs,
  // especially with the __escaped mark, we thus make sure the mock also has the
  // same behavior regarding the array.
  addAbsolutePosition: hits => hits.map(x => x),
}));

describe('connectInfiniteHits', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-ignore: test connectInfiniteHits with invalid parameters
      connectInfiniteHits()({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/infinite-hits/js/#connector"
`);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customInfiniteHits = connectInfiniteHits(render, unmount);
    const widget = customInfiniteHits({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.infiniteHits',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
        getConfiguration: expect.any(Function),
        getWidgetState: expect.any(Function),
        getWidgetSearchParameters: expect.any(Function),
      })
    );
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const instantSearchInstance = createInstantSearch();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({
      escapeHTML: true,
    });

    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        instantSearchInstance,
        state: helper.state,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        instantSearchInstance,
        hits: [],
        showPrevious: expect.any(Function),
        showMore: expect.any(Function),
        results: undefined,
        isFirstPage: true,
        isLastPage: true,
        widgetParams: {
          escapeHTML: true,
        },
      }),
      true
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ hits: [] }),
        ]),
        state: helper.state,
        instantSearchInstance,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        instantSearchInstance,
        hits: [],
        showPrevious: expect.any(Function),
        showMore: expect.any(Function),
        results: expect.any(Object),
        isFirstPage: true,
        isLastPage: true,
        widgetParams: {
          escapeHTML: true,
        },
      }),
      false
    );
  });

  it('Provides the hits and accumulates results on next page', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.hits).toEqual([]);
    expect(firstRenderOptions.results).toBe(undefined);

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderOptions = renderFn.mock.calls[1][0];
    const { showMore } = secondRenderOptions;
    expect(secondRenderOptions.hits).toEqual(hits);
    expect(secondRenderOptions.results).toEqual(results);
    showMore();
    expect(helper.search).toHaveBeenCalledTimes(1);

    // the results should accumulate if there is an increment in page
    const otherHits = [{ fake: 'data 2' }, { sample: 'infos 2' }];
    const otherResults = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits: otherHits }),
    ]);

    widget.render!(
      createRenderOptions({
        results: otherResults,
        state: helper.state,
        helper,
      })
    );

    const thirdRenderOptions = renderFn.mock.calls[2][0];
    expect(thirdRenderOptions.hits).toEqual([...hits, ...otherHits]);
    expect(thirdRenderOptions.results).toEqual(otherResults);
  });

  it('Provides the hits and prepends results on previous page', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.setPage(1);
    helper.search = jest.fn();
    helper.emit = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.hits).toEqual([]);
    expect(firstRenderOptions.results).toBe(undefined);

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderOptions = renderFn.mock.calls[1][0];
    const { showPrevious } = secondRenderOptions;
    expect(secondRenderOptions.hits).toEqual(hits);
    expect(secondRenderOptions.results).toEqual(results);
    showPrevious();
    expect(helper.state.page).toBe(0);
    expect(helper.emit).not.toHaveBeenCalled();
    expect(helper.search).toHaveBeenCalledTimes(1);

    // the results should be prepended if there is an decrement in page
    const previousHits = [{ fake: 'data 2' }, { sample: 'infos 2' }];
    const previousResults = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits: previousHits }),
    ]);

    widget.render!(
      createRenderOptions({
        results: previousResults,
        state: helper.state,
        helper,
      })
    );

    const thirdRenderOptions = renderFn.mock.calls[2][0];
    expect(thirdRenderOptions.hits).toEqual([...previousHits, ...hits]);
    expect(thirdRenderOptions.results).toEqual(previousResults);
  });

  it('Provides the hits and flush hists cache on query changes', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.hits).toEqual([]);
    expect(firstRenderOptions.results).toBe(undefined);

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.hits).toEqual(hits);
    expect(secondRenderOptions.results).toEqual(results);

    helper.setQuery('data');

    // If the query changes, the hits cache should be flushed
    const otherHits = [{ fake: 'data 2' }, { sample: 'infos 2' }];
    const otherResults = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits: otherHits }),
    ]);

    widget.render!(
      createRenderOptions({
        results: otherResults,
        state: helper.state,
        helper,
      })
    );

    const thirdRenderOptions = renderFn.mock.calls[2][0];
    expect(thirdRenderOptions.hits).toEqual(otherHits);
    expect(thirdRenderOptions.results).toEqual(otherResults);
  });

  it('escape highlight properties if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.hits).toEqual([]);
    expect(firstRenderOptions.results).toBe(undefined);

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${TAG_PLACEHOLDER.highlightPostTag}</script>`,
          },
        },
      },
    ];

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const escapedHits = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
          },
        },
      },
    ];

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.hits).toEqual(escapedHits);
    expect(secondRenderOptions.results).toEqual(results);
  });

  it('keeps the __escaped mark', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits: [{ whatever: 'i like kittens' }] }),
    ]);
    widget.render!(
      createRenderOptions({
        results,
        state: helper.state,
        helper,
      })
    );

    expect((results.hits as any).__escaped).toBe(true);
  });

  it('transform items if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({
      transformItems: items => items.map(() => ({ name: 'transformed' })),
    });

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.hits).toEqual([]);
    expect(firstRenderOptions.results).toBe(undefined);

    const hits = [
      {
        name: 'name 1',
      },
      {
        name: 'name 2',
      },
    ];

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const transformedHits = [
      {
        name: 'transformed',
      },
      {
        name: 'transformed',
      },
    ];

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.hits).toEqual(transformedHits);
    expect(secondRenderOptions.results).toEqual(results);
  });

  it('transform items after escaping', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
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

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const hits = [
      {
        name: 'hello',
        _highlightResult: {
          name: {
            value: `he${TAG_PLACEHOLDER.highlightPreTag}llo${TAG_PLACEHOLDER.highlightPostTag}`,
          },
        },
      },
      {
        name: 'halloween',
        _highlightResult: {
          name: {
            value: `ha${TAG_PLACEHOLDER.highlightPreTag}llo${TAG_PLACEHOLDER.highlightPostTag}ween`,
          },
        },
      },
    ];

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    expect(renderFn).toHaveBeenNthCalledWith(
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
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const hits = [
      {
        name: 'name 1',
      },
      {
        name: 'name 2',
      },
    ];

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits, queryID: 'theQueryID' }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    expect(renderFn).toHaveBeenNthCalledWith(
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
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [{ objectID: 'a' }],
            page: 0,
            nbPages: 4,
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    helper.setPage(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [{ objectID: 'b' }],
            page: 1,
            nbPages: 4,
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(3);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [{ objectID: 'a' }, { objectID: 'b' }],
      }),
      false
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [{ objectID: 'b' }],
            page: 1,
            nbPages: 4,
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(4);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [{ objectID: 'a' }, { objectID: 'b' }],
      }),
      false
    );
  });

  describe('getConfiguration', () => {
    it('returns `SearchParameters`', () => {
      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      expect(widget.getConfiguration!(new SearchParameters())).toBeInstanceOf(
        SearchParameters
      );
    });

    it('adds a `page` to the `SearchParameters`', () => {
      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      expect(widget.getConfiguration!(new SearchParameters()).page).toEqual(0);
    });

    it('supports previous `page` from the `SearchParameters`', () => {
      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      expect(
        widget.getConfiguration!(new SearchParameters({ page: 0 })).page
      ).toEqual(0);

      expect(
        widget.getConfiguration!(new SearchParameters({ page: 6 })).page
      ).toEqual(6);
    });

    it('adds the TAG_PLACEHOLDER to the `SearchParameters`', () => {
      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      const nextConfiguration = widget.getConfiguration!(
        new SearchParameters()
      );

      expect(nextConfiguration.highlightPreTag).toBe(
        TAG_PLACEHOLDER.highlightPreTag
      );

      expect(nextConfiguration.highlightPostTag).toBe(
        TAG_PLACEHOLDER.highlightPostTag
      );
    });

    it('does not add the TAG_PLACEHOLDER to the `SearchParameters` with `escapeHTML` disabled', () => {
      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({
        escapeHTML: false,
      });

      const nextConfiguration = widget.getConfiguration!(
        new SearchParameters()
      );

      expect(nextConfiguration.highlightPreTag).toBeUndefined();
      expect(nextConfiguration.highlightPostTag).toBeUndefined();
    });

    it('keeps the __escaped mark', () => {
      const rendering = jest.fn();
      const makeWidget = connectInfiniteHits(rendering);
      const widget = makeWidget({});

      const helper = algoliasearchHelper({} as Client, '', {});
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({ hits: [{ whatever: 'i like kittens' }] }),
      ]);
      widget.render!(
        createRenderOptions({
          results,
          state: helper.state,
          helper,
        })
      );

      expect((results.hits as any).__escaped).toBe(true);
    });
  });

  describe('dispose', () => {
    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper({} as Client, '', {});
      const rendering = () => {};
      const makeWidget = connectInfiniteHits(rendering);
      const widget = makeWidget({});
      expect(() =>
        widget.dispose!({ helper, state: helper.state })
      ).not.toThrow();
    });

    it('calls the unmount function', () => {
      const helper = algoliasearchHelper({} as Client, '', {});

      const renderFn = (): void => {};
      const unmountFn = jest.fn();
      const makeWidget = connectInfiniteHits(renderFn, unmountFn);
      const widget = makeWidget({});

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose!({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('removes the TAG_PLACEHOLDER from the `SearchParameters`', () => {
      const helper = algoliasearchHelper({} as Client, '', {
        ...TAG_PLACEHOLDER,
      });

      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      expect(helper.state.highlightPreTag).toBe(
        TAG_PLACEHOLDER.highlightPreTag
      );

      expect(helper.state.highlightPostTag).toBe(
        TAG_PLACEHOLDER.highlightPostTag
      );

      const nextState = widget.dispose!({
        helper,
        state: helper.state,
      }) as SearchParameters;

      expect(nextState.highlightPreTag).toBeUndefined();
      expect(nextState.highlightPostTag).toBeUndefined();
    });

    it('does not remove the TAG_PLACEHOLDER from the `SearchParameters` with `escapeHTML` disabled', () => {
      const helper = algoliasearchHelper({} as Client, '', {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({
        escapeHTML: false,
      });

      expect(helper.state.highlightPreTag).toBe('<mark>');
      expect(helper.state.highlightPostTag).toBe('</mark>');

      const nextState = widget.dispose!({
        helper,
        state: helper.state,
      }) as SearchParameters;

      expect(nextState.highlightPreTag).toBe('<mark>');
      expect(nextState.highlightPostTag).toBe('</mark>');
    });

    it('removes the `page` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper({} as Client, '', {
        page: 5,
      });

      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      expect(helper.state.page).toBe(5);

      const nextState = widget.dispose!({
        helper,
        state: helper.state,
      }) as SearchParameters;

      expect(nextState.page).toBeUndefined();
    });
  });

  describe('routing', () => {
    describe('getWidgetState', () => {
      it('should give back the object unmodified if the default value is selected', () => {
        const renderFn = jest.fn();
        const makeWidget = connectInfiniteHits(renderFn);
        const widget = makeWidget({ showPrevious: true });

        const helper = algoliasearchHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!(
          createInitOptions({
            state: helper.state,
            helper,
          })
        );

        const uiStateBefore = { page: 1 };
        const uiStateAfter = widget.getWidgetState!(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });

      it('should add an entry equal to the refinement', () => {
        const renderFn = jest.fn();
        const makeWidget = connectInfiniteHits(renderFn);
        const widget = makeWidget({ showPrevious: true });

        const helper = algoliasearchHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!(
          createInitOptions({
            state: helper.state,
            helper,
          })
        );

        const { showMore } = renderFn.mock.calls[0][0];

        showMore();

        const uiStateBefore = { page: 1 };
        const uiStateAfter = widget.getWidgetState!(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      it('should give back the object unmodified if showPrevious is disabled', () => {
        const renderFn = jest.fn();
        const makeWidget = connectInfiniteHits(renderFn);
        const widget = makeWidget({ showPrevious: false });

        const helper = algoliasearchHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!(
          createInitOptions({
            state: helper.state,
            helper,
          })
        );

        const { showMore } = renderFn.mock.calls[0][0];

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
        const renderFn = jest.fn();
        const makeWidget = connectInfiniteHits(renderFn);
        const widget = makeWidget({ showPrevious: true });

        const helper = algoliasearchHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!(
          createInitOptions({
            state: helper.state,
            helper,
          })
        );

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
        const renderFn = jest.fn();
        const makeWidget = connectInfiniteHits(renderFn);
        const widget = makeWidget({ showPrevious: true });

        const helper = algoliasearchHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!(
          createInitOptions({
            state: helper.state,
            helper,
          })
        );

        const { showMore } = renderFn.mock.calls[0][0];

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
        const renderFn = jest.fn();
        const makeWidget = connectInfiniteHits(renderFn);
        const widget = makeWidget({ showPrevious: true });

        const helper = algoliasearchHelper({} as Client, '', {});
        helper.search = jest.fn();

        widget.init!(
          createInitOptions({
            state: helper.state,
            helper,
          })
        );

        const { showMore } = renderFn.mock.calls[0][0];

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
      const renderFn = jest.fn();
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({ showPrevious: false });

      const helper = algoliasearchHelper({} as Client, '', {});
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          state: helper.state,
          helper,
        })
      );

      const { showMore } = renderFn.mock.calls[0][0];

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
