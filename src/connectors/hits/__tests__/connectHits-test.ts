import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { TAG_PLACEHOLDER, deserializePayload } from '../../../lib/utils';
import connectHits from '../connectHits';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { EscapedHits, HitAttributeHighlightResult } from '../../../types';

jest.mock('../../../lib/utils/hits-absolute-position', () => ({
  // The real implementation creates a new array instance, which can cause bugs,
  // especially with the __escaped mark, we thus make sure the mock also has the
  // same behavior regarding the array.
  addAbsolutePosition: hits => hits.map(x => x),
}));

describe('connectHits', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-ignore
      connectHits()({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits/js/#connector"
`);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customHits = connectHits(render, unmount);
    const widget = customHits({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.hits',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    // test if widget is not rendered yet at this point
    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { escapeHTML: true } }),
      true
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ hits: [] }),
        ]),
        state: helper.state,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { escapeHTML: true } }),
      false
    );
  });

  it('Provides the hits and the whole results', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [],
        results: undefined,
      }),
      expect.anything()
    );

    const hits = [
      { objectID: '1', fake: 'data' },
      { objectID: '2', sample: 'infos' },
    ];

    ((hits as unknown) as EscapedHits).__escaped = true;

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

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits,
        results,
      }),
      expect.anything()
    );
  });

  it('escape highlight properties if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [],
        results: undefined,
      }),
      expect.anything()
    );

    const hits = [
      {
        objectID: '1',
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${TAG_PLACEHOLDER.highlightPostTag}</script>`,
            matchLevel: 'partial',
            matchedWords: ['foobar'],
          },
        },
      },
    ];

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse(createSingleSearchResponse({ hits })),
    ]);
    widget.render!(
      createRenderOptions({
        results,
        state: helper.state,
        helper,
      })
    );

    const expectedHits = [
      {
        objectID: '1',
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
            matchLevel: 'partial',
            matchedWords: ['foobar'],
          },
        },
      },
    ];

    ((expectedHits as unknown) as EscapedHits).__escaped = true;

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: expectedHits,
        results,
      }),
      expect.anything()
    );
  });

  it('transform items if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({
      transformItems: items =>
        items.map(item => ({ ...item, name: 'transformed' })),
    });

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(renderFn).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ hits: [], results: undefined }),
      expect.anything()
    );

    const hits = [
      { objectID: '1', name: 'name 1' },
      { objectID: '2', name: 'name 2' },
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

    const expectedHits = [
      { objectID: '1', name: 'transformed' },
      { objectID: '2', name: 'transformed' },
    ];
    ((expectedHits as unknown) as EscapedHits).__escaped = true;

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: expectedHits,
        results,
      }),
      expect.anything()
    );
  });

  it('adds queryID if provided to results', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const hits = [
      { objectID: '1', name: 'name 1' },
      { objectID: '2', name: 'name 2' },
    ];

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits, queryID: 'theQueryID' }),
    ]);
    widget.render!(
      createRenderOptions({
        results,
        state: helper.state,
        helper,
      })
    );

    const expectedHits = [
      { objectID: '1', name: 'name 1', __queryID: 'theQueryID' },
      { objectID: '2', name: 'name 2', __queryID: 'theQueryID' },
    ];

    ((expectedHits as unknown) as EscapedHits).__escaped = true;

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: expectedHits,
      }),
      expect.anything()
    );
  });

  it('transform items after escaping', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHits(renderFn);
    const widget = makeWidget({
      transformItems: items =>
        items.map(item => {
          const highlightResult = item._highlightResult!
            .name as HitAttributeHighlightResult;

          return {
            ...item,
            _highlightResult: {
              name: {
                ...highlightResult,
                value: (item._highlightResult!
                  .name as HitAttributeHighlightResult).value.toUpperCase(),
              },
            },
          };
        }),
      escapeHTML: true,
    });

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const hits = [
      {
        objectID: '1',
        name: 'hello',
        _highlightResult: {
          name: {
            matchLevel: 'full' as const,
            matchedWords: [],
            value: `he${TAG_PLACEHOLDER.highlightPreTag}llo${TAG_PLACEHOLDER.highlightPostTag}`,
          },
        },
      },
      {
        objectID: '2',
        name: 'halloween',
        _highlightResult: {
          name: {
            matchLevel: 'full' as const,
            matchedWords: [],
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
        results,
        state: helper.state,
        helper,
      })
    );

    const expectedHits = [
      {
        objectID: '1',
        name: 'hello',
        _highlightResult: {
          name: {
            matchLevel: 'full',
            matchedWords: [],
            value: 'HE<MARK>LLO</MARK>',
          },
        },
      },
      {
        objectID: '2',
        name: 'halloween',
        _highlightResult: {
          name: {
            matchLevel: 'full',
            matchedWords: [],
            value: 'HA<MARK>LLO</MARK>WEEN',
          },
        },
      },
    ];

    ((expectedHits as unknown) as EscapedHits).__escaped = true;

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: expectedHits,
        results,
      }),
      expect.anything()
    );
  });

  it('keeps the __escaped mark', () => {
    const rendering = jest.fn();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({
        hits: [{ objectID: '1', whatever: 'i like kittens' }],
      }),
    ]);

    widget.render!(
      createRenderOptions({
        results,
        state: helper.state,
        helper,
      })
    );

    expect(((results.hits as unknown) as EscapedHits).__escaped).toBe(true);
  });

  describe('getRenderState', () => {
    it('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createHits = connectHits(renderFn, unmountFn);
      const hitsWidget = createHits({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const renderState1 = hitsWidget.getRenderState(
        {},
        createInitOptions({ state: helper.state, helper })
      );

      expect(renderState1.hits).toEqual({
        hits: [],
        sendEvent: expect.any(Function),
        bindEvent: expect.any(Function),
        results: undefined,
        widgetParams: {},
      });

      const hits = [
        { objectID: '1', name: 'name 1' },
        { objectID: '2', name: 'name 2' },
      ];

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({ hits, queryID: 'theQueryID' }),
      ]);

      const renderState2 = hitsWidget.getRenderState(
        {},
        createRenderOptions({
          helper,
          state: helper.state,
          results,
        })
      );

      const expectedHits = [
        { objectID: '1', name: 'name 1', __queryID: 'theQueryID' },
        { objectID: '2', name: 'name 2', __queryID: 'theQueryID' },
      ];

      ((expectedHits as unknown) as EscapedHits).__escaped = true;

      expect(renderState2.hits).toEqual({
        hits: expectedHits,
        sendEvent: renderState1.hits!.sendEvent,
        bindEvent: renderState1.hits!.bindEvent,
        results,
        widgetParams: {},
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createHits = connectHits(renderFn, unmountFn);
      const hitsWidget = createHits({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const renderState1 = hitsWidget.getWidgetRenderState(
        createInitOptions({ state: helper.state, helper })
      );

      expect(renderState1).toEqual({
        hits: [],
        sendEvent: expect.any(Function),
        bindEvent: expect.any(Function),
        results: undefined,
        widgetParams: {},
      });

      const hits = [
        { objectID: '1', name: 'name 1' },
        { objectID: '2', name: 'name 2' },
      ];

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({ hits, queryID: 'theQueryID' }),
      ]);

      const renderState2 = hitsWidget.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results,
        })
      );

      const expectedHits = [
        { objectID: '1', name: 'name 1', __queryID: 'theQueryID' },
        { objectID: '2', name: 'name 2', __queryID: 'theQueryID' },
      ];

      ((expectedHits as unknown) as EscapedHits).__escaped = true;

      expect(renderState2).toEqual({
        hits: expectedHits,
        sendEvent: renderState1.sendEvent,
        bindEvent: renderState2.bindEvent,
        results,
        widgetParams: {},
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('adds the TAG_PLACEHOLDER to the `SearchParameters`', () => {
      const render = () => {};
      const makeWidget = connectHits(render);
      const widget = makeWidget({});

      const actual = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {},
      });

      expect(actual).toEqual(new SearchParameters(TAG_PLACEHOLDER));
    });

    it('does not add the TAG_PLACEHOLDER to the `SearchParameters` with `escapeHTML` disabled', () => {
      const render = () => {};
      const makeWidget = connectHits(render);
      const widget = makeWidget({
        escapeHTML: false,
      });

      const actual = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {},
      });

      expect(actual).toEqual(new SearchParameters());
    });
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectHits(renderFn, unmountFn);
      const widget = makeWidget({});

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const makeWidget = connectHits(renderFn);
      const widget = makeWidget({});

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('removes the TAG_PLACEHOLDER from the `SearchParameters`', () => {
      const helper = algoliasearchHelper(createSearchClient(), '', {
        ...TAG_PLACEHOLDER,
      });

      const renderFn = () => {};
      const makeWidget = connectHits(renderFn);
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
      const helper = algoliasearchHelper(createSearchClient(), '', {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      const renderFn = () => {};
      const makeWidget = connectHits(renderFn);
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
  });

  describe('insights', () => {
    const createRenderedWidget = () => {
      const renderFn = jest.fn();
      const makeWidget = connectHits(renderFn);
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
            widgetType: 'ais.hits',
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
            widgetType: 'ais.hits',
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
            widgetType: 'ais.hits',
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
            widgetType: 'ais.hits',
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
            widgetType: 'ais.hits',
          });
        });
      });
    });
  });
});
