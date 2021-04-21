import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { SearchClient, HitAttributeHighlightResult } from '../../../types';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { TAG_PLACEHOLDER, deserializePayload } from '../../../lib/utils';
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

        getWidgetUiState: expect.any(Function),
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

    const helper = algoliasearchHelper({} as SearchClient, '', {});
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

    const helper = algoliasearchHelper({} as SearchClient, '', {});
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
      { fake: 'data', objectID: '1' },
      { sample: 'infos', objectID: '2' },
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

    const secondRenderOptions = renderFn.mock.calls[1][0];
    const { showMore } = secondRenderOptions;
    expect(secondRenderOptions.hits).toEqual(hits);
    expect(secondRenderOptions.results).toEqual(results);
    showMore();
    expect(helper.search).toHaveBeenCalledTimes(1);

    // the results should accumulate if there is an increment in page
    const otherHits = [
      { fake: 'data 2', objectID: '1' },
      { sample: 'infos 2', objectID: '2' },
    ];
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

    const helper = algoliasearchHelper({} as SearchClient, '', {});
    helper.setPage(1);
    helper.search = jest.fn();
    (helper as any).searchWithoutTriggeringOnStateChange = jest.fn();
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

    const hits = [
      { fake: 'data', objectID: '1' },
      { sample: 'infos', objectID: '2' },
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

    const secondRenderOptions = renderFn.mock.calls[1][0];
    const { showPrevious } = secondRenderOptions;
    expect(secondRenderOptions.hits).toEqual(hits);
    expect(secondRenderOptions.results).toEqual(results);
    showPrevious();
    expect(helper.state.page).toBe(0);
    expect(helper.emit).not.toHaveBeenCalled();
    expect(helper.search).toHaveBeenCalledTimes(0);
    expect(
      (helper as any).searchWithoutTriggeringOnStateChange
    ).toHaveBeenCalledTimes(1);

    // the results should be prepended if there is an decrement in page
    const previousHits = [
      { fake: 'data 2', objectID: '1' },
      { sample: 'infos 2', objectID: '2' },
    ];
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

  it('Renders previous page after showing next page', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.setPage(4);
    helper.overrideStateWithoutTriggeringChangeEvent = jest.fn(() => helper);
    helper.searchWithoutTriggeringOnStateChange = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const { showMore, showPrevious } = widget.getWidgetRenderState(
      createRenderOptions({
        state: helper.state,
        helper,
      })
    );
    showMore();
    expect(helper.state.page).toBe(5);

    showPrevious();
    expect(
      helper.overrideStateWithoutTriggeringChangeEvent
    ).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }));
  });

  it('Provides the hits and flush hists cache on query changes', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({} as SearchClient, '', {});
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
      { fake: 'data', objectID: '1' },
      { sample: 'infos', objectID: '2' },
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

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.hits).toEqual(hits);
    expect(secondRenderOptions.results).toEqual(results);

    helper.setQuery('data');

    // If the query changes, the hits cache should be flushed
    const otherHits = [
      { fake: 'data 2', objectID: '1' },
      { sample: 'infos 2', objectID: '2' },
    ];
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

  it('sets isLastPage to true when all pages are cached', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({});
    const helper = algoliasearchHelper({} as SearchClient, '', {
      hitsPerPage: 1,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [{ objectID: '1' }],
            page: 0,
            nbPages: 3,
          }),
        ]),
        helper,
      })
    );

    renderFn.mock.calls[1][0].showMore();
    widget.render!(
      createRenderOptions({
        state: helper.state,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [{ objectID: '1' }, { objectID: '2' }],
            page: 1,
            nbPages: 3,
          }),
        ]),
        helper,
      })
    );
    expect(helper.state.page).toEqual(1);

    renderFn.mock.calls[2][0].showMore();
    widget.render!(
      createRenderOptions({
        state: helper.state,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
            page: 2,
            nbPages: 3,
          }),
        ]),
        helper,
      })
    );
    expect(helper.state.page).toEqual(2);

    helper.setPage(0);
    widget.render!(
      createRenderOptions({
        state: helper.state,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [{ objectID: '1' }],
            page: 0,
            nbPages: 3,
          }),
        ]),
        helper,
      })
    );
    expect(helper.state.page).toEqual(0);

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isLastPage: true,
      }),
      false
    );
  });

  it('escape highlight properties if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteHits(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    const helper = algoliasearchHelper({} as SearchClient, '', {});
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
        foobar: '<script>foobar</script>',
        _highlightResult: {
          foobar: {
            matchLevel: 'full' as const,
            matchedWords: [],
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${TAG_PLACEHOLDER.highlightPostTag}</script>`,
          },
        },
        objectID: '1',
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
        foobar: '<script>foobar</script>',
        _highlightResult: {
          foobar: {
            matchLevel: 'full',
            matchedWords: [],
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
          },
        },
        objectID: '1',
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
      transformItems: items => {
        return items.map(item => ({ ...item, name: 'transformed' }));
      },
    });

    const helper = algoliasearchHelper({} as SearchClient, '', {});
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
        objectID: '1',
      },
      {
        name: 'name 2',
        objectID: '2',
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
        objectID: '1',
        name: 'transformed',
      },
      {
        objectID: '2',
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
        items.map(item => {
          const name = item._highlightResult!
            .name as HitAttributeHighlightResult;

          name.value = name.value.toUpperCase();

          return item;
        }),
      escapeHTML: true,
    });

    const helper = algoliasearchHelper({} as SearchClient, '', {});
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
            matchLevel: 'full' as const,
            matchedWords: [],
            value: `he${TAG_PLACEHOLDER.highlightPreTag}llo${TAG_PLACEHOLDER.highlightPostTag}`,
          },
        },
        objectID: '1',
      },
      {
        name: 'halloween',
        _highlightResult: {
          name: {
            matchLevel: 'full' as const,
            matchedWords: [],
            value: `ha${TAG_PLACEHOLDER.highlightPreTag}llo${TAG_PLACEHOLDER.highlightPostTag}ween`,
          },
        },
        objectID: '2',
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
                matchLevel: 'full',
                matchedWords: [],
                value: 'HE<MARK>LLO</MARK>',
              },
            },
            objectID: '1',
          },
          {
            name: 'halloween',
            _highlightResult: {
              name: {
                matchLevel: 'full',
                matchedWords: [],
                value: 'HA<MARK>LLO</MARK>WEEN',
              },
            },
            objectID: '2',
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

    const helper = algoliasearchHelper({} as SearchClient, '', {});
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
        objectID: '1',
      },
      {
        name: 'name 2',
        objectID: '2',
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
            objectID: '1',
            __queryID: 'theQueryID',
          },
          {
            name: 'name 2',
            objectID: '2',
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

    const helper = algoliasearchHelper({} as SearchClient, '', {});
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

    const helper = algoliasearchHelper({} as SearchClient, '', {});
    helper.search = jest.fn();

    createInitOptions();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({
        hits: [{ whatever: 'i like kittens', objectID: '1' }],
      }),
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
      const helper = algoliasearchHelper({} as SearchClient, '', {});

      const renderFn = (): void => {};
      const unmountFn = jest.fn();
      const makeWidget = connectInfiniteHits(renderFn, unmountFn);
      const widget = makeWidget({});

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper({} as SearchClient, '', {});

      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('removes the TAG_PLACEHOLDER from the `SearchParameters`', () => {
      const helper = algoliasearchHelper({} as SearchClient, '', {
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

      const nextState = widget.dispose!(
        createDisposeOptions({
          helper,
          state: helper.state,
        })
      ) as SearchParameters;

      expect(nextState.highlightPreTag).toBeUndefined();
      expect(nextState.highlightPostTag).toBeUndefined();
    });

    it('does not remove the TAG_PLACEHOLDER from the `SearchParameters` with `escapeHTML` disabled', () => {
      const helper = algoliasearchHelper({} as SearchClient, '', {
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

      const nextState = widget.dispose!(
        createDisposeOptions({
          helper,
          state: helper.state,
        })
      ) as SearchParameters;

      expect(nextState.highlightPreTag).toBe('<mark>');
      expect(nextState.highlightPostTag).toBe('</mark>');
    });

    it('removes the `page` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper({} as SearchClient, '', {
        page: 5,
      });

      const renderFn = (): void => {};
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      expect(helper.state.page).toBe(5);

      const nextState = widget.dispose!(
        createDisposeOptions({
          helper,
          state: helper.state,
        })
      ) as SearchParameters;

      expect(nextState.page).toBeUndefined();
    });
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` with `page` when `showPrevious` not given', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        page: 1,
      });
      const widget = makeWidget({});

      const actual = widget.getWidgetUiState!(
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

    test('returns the `uiState` without `page` on first page', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        page: 0,
      });
      const widget = makeWidget({
        showPrevious: true,
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

    test('returns the `uiState` containing `page` with `showPrevious` option', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteHits(render);
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        page: 1,
      });
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetUiState!(
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

      const actual = widget.getWidgetUiState!(
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

  describe('getRenderState', () => {
    it('returns the render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createInfiniteHits = connectInfiniteHits(renderFn, unmountFn);
      const infiniteHitsWidget = createInfiniteHits({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = infiniteHitsWidget.getRenderState({}, initOptions);

      expect(renderState1.infiniteHits).toEqual({
        hits: [],
        currentPageHits: [],
        sendEvent: expect.any(Function),
        bindEvent: expect.any(Function),
        isFirstPage: true,
        isLastPage: true,
        results: undefined,
        showMore: expect.any(Function),
        showPrevious: expect.any(Function),
        widgetParams: {},
      });
    });

    it('returns the render state with results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createInfiniteHits = connectInfiniteHits(renderFn, unmountFn);
      const infiniteHitsWidget = createInfiniteHits({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = infiniteHitsWidget.getRenderState({}, initOptions);

      const hits = [
        { objectID: '1', name: 'name 1' },
        { objectID: '2', name: 'name 2' },
      ];

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({ hits, queryID: 'theQueryID' }),
      ]);

      const renderOptions = createRenderOptions({
        helper,
        state: helper.state,
        results,
      });

      const renderState2 = infiniteHitsWidget.getRenderState({}, renderOptions);

      const expectedHits = [
        { objectID: '1', name: 'name 1', __queryID: 'theQueryID' },
        { objectID: '2', name: 'name 2', __queryID: 'theQueryID' },
      ];

      const expectedCurrentPageHits = [
        {
          __queryID: 'theQueryID',
          name: 'name 1',
          objectID: '1',
        },
        {
          __queryID: 'theQueryID',
          name: 'name 2',
          objectID: '2',
        },
      ];
      (expectedCurrentPageHits as any).__escaped = true;

      expect(renderState2.infiniteHits).toEqual({
        hits: expectedHits,
        currentPageHits: expectedCurrentPageHits,
        sendEvent: renderState1.infiniteHits!.sendEvent,
        bindEvent: renderState1.infiniteHits!.bindEvent,
        isFirstPage: true,
        isLastPage: true,
        results,
        showMore: renderState1.infiniteHits!.showMore,
        showPrevious: renderState1.infiniteHits!.showPrevious,
        widgetParams: {},
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createInfiniteHits = connectInfiniteHits(renderFn, unmountFn);
      const infiniteHitsWidget = createInfiniteHits({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = infiniteHitsWidget.getWidgetRenderState(initOptions);

      expect(renderState1).toEqual({
        hits: [],
        currentPageHits: [],
        sendEvent: expect.any(Function),
        bindEvent: expect.any(Function),
        isFirstPage: true,
        isLastPage: true,
        results: undefined,
        showMore: expect.any(Function),
        showPrevious: expect.any(Function),
        widgetParams: {},
      });
    });

    it('returns the widget render state with results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createInfiniteHits = connectInfiniteHits(renderFn, unmountFn);
      const infiniteHitsWidget = createInfiniteHits({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = infiniteHitsWidget.getWidgetRenderState(initOptions);

      const hits = [
        { objectID: '1', name: 'name 1' },
        { objectID: '2', name: 'name 2' },
      ];

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({ hits, queryID: 'theQueryID' }),
      ]);

      const renderOptions = createRenderOptions({
        helper,
        state: helper.state,
        results,
      });

      const renderState2 = infiniteHitsWidget.getWidgetRenderState(
        renderOptions
      );

      const expectedHits = [
        { objectID: '1', name: 'name 1', __queryID: 'theQueryID' },
        { objectID: '2', name: 'name 2', __queryID: 'theQueryID' },
      ];

      const expectedCurrentPageHits = [
        {
          __queryID: 'theQueryID',
          name: 'name 1',
          objectID: '1',
        },
        {
          __queryID: 'theQueryID',
          name: 'name 2',
          objectID: '2',
        },
      ];
      (expectedCurrentPageHits as any).__escaped = true;

      expect(renderState2).toEqual({
        hits: expectedHits,
        currentPageHits: expectedCurrentPageHits,
        sendEvent: renderState1.sendEvent,
        bindEvent: renderState1.bindEvent,
        isFirstPage: true,
        isLastPage: true,
        results,
        showMore: renderState1.showMore,
        showPrevious: renderState1.showPrevious,
        widgetParams: {},
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

  describe('insights', () => {
    const createRenderedWidget = () => {
      const renderFn = jest.fn();
      const makeWidget = connectInfiniteHits(renderFn);
      const widget = makeWidget({});

      const helper = algoliasearchHelper(createSearchClient(), '', {});
      helper.search = jest.fn();

      const initOptions = createInitOptions({
        helper,
        state: helper.state,
      });
      const instantSearchInstance = initOptions.instantSearchInstance;
      widget.init!(initOptions);

      const hits = [
        {
          objectID: '1',
          fake: 'data',
          __queryID: 'test-query-id',
          __position: 0,
        },
        {
          objectID: '2',
          sample: 'infos',
          __queryID: 'test-query-id',
          __position: 1,
        },
      ];

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({ hits }),
      ]);
      widget.render!(
        createRenderOptions({
          results,
          state: helper.state,
          helper,
        })
      );

      return { instantSearchInstance, renderFn, hits };
    };

    describe('insights', () => {
      describe('sendEvent', () => {
        it('sends view event when hits are rendered', () => {
          const { instantSearchInstance } = createRenderedWidget();
          expect(
            instantSearchInstance.sendEventToInsights
          ).toHaveBeenCalledTimes(1);
          expect(
            instantSearchInstance.sendEventToInsights
          ).toHaveBeenCalledWith({
            eventType: 'view',
            hits: [
              {
                __position: 0,
                __queryID: 'test-query-id',
                fake: 'data',
                objectID: '1',
              },
              {
                __position: 1,
                __queryID: 'test-query-id',
                objectID: '2',
                sample: 'infos',
              },
            ],
            insightsMethod: 'viewedObjectIDs',
            payload: {
              eventName: 'Hits Viewed',
              index: '',
              objectIDs: ['1', '2'],
            },
            widgetType: 'ais.infiniteHits',
          });
        });

        it('sends click event', () => {
          const {
            instantSearchInstance,
            renderFn,
            hits,
          } = createRenderedWidget();
          expect(
            instantSearchInstance.sendEventToInsights
          ).toHaveBeenCalledTimes(1); // view event by render

          const { sendEvent } = renderFn.mock.calls[
            renderFn.mock.calls.length - 1
          ][0];
          sendEvent('click', hits[0], 'Product Added');
          expect(
            instantSearchInstance.sendEventToInsights
          ).toHaveBeenCalledTimes(2);
          expect(
            instantSearchInstance.sendEventToInsights
          ).toHaveBeenCalledWith({
            eventType: 'click',
            hits: [
              {
                __position: 0,
                __queryID: 'test-query-id',
                fake: 'data',
                objectID: '1',
              },
            ],
            insightsMethod: 'clickedObjectIDsAfterSearch',
            payload: {
              eventName: 'Product Added',
              index: '',
              objectIDs: ['1'],
              positions: [0],
              queryID: 'test-query-id',
            },
            widgetType: 'ais.infiniteHits',
          });
        });

        it('sends conversion event', () => {
          const {
            instantSearchInstance,
            renderFn,
            hits,
          } = createRenderedWidget();
          expect(
            instantSearchInstance.sendEventToInsights
          ).toHaveBeenCalledTimes(1); // view event by render

          const { sendEvent } = renderFn.mock.calls[
            renderFn.mock.calls.length - 1
          ][0];
          sendEvent('conversion', hits[1], 'Product Ordered');
          expect(
            instantSearchInstance.sendEventToInsights
          ).toHaveBeenCalledTimes(2);
          expect(
            instantSearchInstance.sendEventToInsights
          ).toHaveBeenCalledWith({
            eventType: 'conversion',
            hits: [
              {
                __position: 1,
                __queryID: 'test-query-id',
                objectID: '2',
                sample: 'infos',
              },
            ],
            insightsMethod: 'convertedObjectIDsAfterSearch',
            payload: {
              eventName: 'Product Ordered',
              index: '',
              objectIDs: ['2'],
              queryID: 'test-query-id',
            },
            widgetType: 'ais.infiniteHits',
          });
        });
      });

      describe('bindEvent', () => {
        it('returns a payload for click event', () => {
          const { renderFn, hits } = createRenderedWidget();
          const { bindEvent } = renderFn.mock.calls[
            renderFn.mock.calls.length - 1
          ][0];
          const payload = bindEvent('click', hits[0], 'Product Added');
          expect(payload.startsWith('data-insights-event=')).toBe(true);
          expect(
            deserializePayload(payload.substr('data-insights-event='.length))
          ).toEqual({
            eventType: 'click',
            hits: [
              {
                __position: 0,
                __queryID: 'test-query-id',
                fake: 'data',
                objectID: '1',
              },
            ],
            insightsMethod: 'clickedObjectIDsAfterSearch',
            payload: {
              eventName: 'Product Added',
              index: '',
              objectIDs: ['1'],
              positions: [0],
              queryID: 'test-query-id',
            },
            widgetType: 'ais.infiniteHits',
          });
        });

        it('returns a payload for conversion event', () => {
          const { renderFn, hits } = createRenderedWidget();
          const { bindEvent } = renderFn.mock.calls[
            renderFn.mock.calls.length - 1
          ][0];
          const payload = bindEvent('conversion', hits[1], 'Product Ordered');
          expect(payload.startsWith('data-insights-event=')).toBe(true);
          expect(
            deserializePayload(payload.substr('data-insights-event='.length))
          ).toEqual({
            eventType: 'conversion',
            hits: [
              {
                __position: 1,
                __queryID: 'test-query-id',
                objectID: '2',
                sample: 'infos',
              },
            ],
            insightsMethod: 'convertedObjectIDsAfterSearch',
            payload: {
              eventName: 'Product Ordered',
              index: '',
              objectIDs: ['2'],
              queryID: 'test-query-id',
            },
            widgetType: 'ais.infiniteHits',
          });
        });
      });
    });
  });
});
