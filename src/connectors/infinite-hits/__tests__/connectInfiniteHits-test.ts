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
import { createSearchClient } from '../../../../test/mock/createSearchClient';

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
"The render function is not valid (received type Undefined).

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

  it('keeps the __escaped mark', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHits(rendering);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    createInitOptions();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits: [{ whatever: 'i like kittens' }] }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    expect((results.hits as any).__escaped).toBe(true);
  });

  describe('dispose', () => {
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

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper({} as Client, '', {});

      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      expect(() =>
        widget.dispose!({ helper, state: helper.state })
      ).not.toThrow();
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

  describe('getWidgetState', () => {
    test('returns the `uiState` empty without `showPrevious` option', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        page: 1,
      });
      const widget = makeWidget({});

      const actual = widget.getWidgetState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` empty with `showPrevious` option on first page', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        page: 0,
      });
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` containing `page` with `showPrevious` option', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        page: 1,
      });
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        page: 2,
      });
    });

    test('returns the `uiState` containing a page number incremented by one with `showPrevious` option and `page` search parameter', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        page: 3,
      });
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        page: 4,
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('return default Search Parameters with highlighted tags by default', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({});

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.highlightPreTag).toEqual(TAG_PLACEHOLDER.highlightPreTag);
      expect(actual.highlightPostTag).toEqual(TAG_PLACEHOLDER.highlightPostTag);
    });

    test('return Search Parameters with highlighted tags with `escapeHTML`', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        escapeHTML: true,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.highlightPreTag).toEqual(TAG_PLACEHOLDER.highlightPreTag);
      expect(actual.highlightPostTag).toEqual(TAG_PLACEHOLDER.highlightPostTag);
    });

    test('return Search Parameters without highlighted tags when `escapeHTML` is `false`', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        escapeHTML: false,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.highlightPreTag).toBeUndefined();
      expect(actual.highlightPostTag).toBeUndefined();
    });

    test('return Search Parameters with resetted page when `showPrevious` without `page` in the UI state', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.page).toEqual(0);
    });

    test('return Search Parameters with resetted page when `showPrevious` and `page` is 0 in the UI state', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          page: 0,
        },
      });

      expect(actual.page).toEqual(0);
    });

    test('return Search Parameters with page decreased when `showPrevious` and `page` in the UI state', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          page: 3,
        },
      });

      expect(actual.page).toEqual(2);
    });
  });
});
