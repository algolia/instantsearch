import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import {
  createInitOptions,
  createRenderOptions,
  createDisposeOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import connectAutocomplete, {
  AutocompleteRenderState,
} from '../connectAutocomplete';
import { TAG_PLACEHOLDER } from '../../../lib/utils';
import { SearchClient } from '../../../types';

describe('connectAutocomplete', () => {
  const getInitializedWidget = (config = {}) => {
    const renderFn = jest.fn<any, [AutocompleteRenderState, boolean]>();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({
      ...config,
    });

    const initialConfig = {};
    const helper = algoliasearchHelper({} as SearchClient, '', initialConfig);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const { refine } = renderFn.mock.calls[0][0];

    return [widget, helper, refine] as const;
  };

  it('throws without render function', () => {
    expect(() => {
      // @ts-ignore
      connectAutocomplete();
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/autocomplete/js/#connector"
`);
  });

  it('warns when using the outdated `indices` option', () => {
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);

    const trigger = () => {
      makeWidget({
        // @ts-ignore outdated `indices` option
        indices: [
          { label: 'Products', value: 'products' },
          { label: 'Services', value: 'services' },
        ],
      });
    };

    expect(trigger)
      .toWarnDev(`[InstantSearch.js]: The option \`indices\` has been removed from the Autocomplete connector.

The indices to target are now inferred from the widgets tree.

An alternative would be:

const autocomplete = connectAutocomplete(renderer);

search.addWidgets([
  index({ indexName: 'products' }),
  index({ indexName: 'services' }),
  autocomplete()
]);`);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customAutocomplete = connectAutocomplete(render, unmount);
    const widget = customAutocomplete({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.autocomplete',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('renders during init and render', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({});

    expect(render).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: '',
        indices: [],
        refine: expect.any(Function),
        instantSearchInstance: expect.any(Object),
        widgetParams: expect.any(Object),
      }),
      true
    );

    widget.render!(createRenderOptions());

    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: '',
        indices: expect.any(Array),
        refine: expect.any(Function),
        instantSearchInstance: expect.any(Object),
        widgetParams: expect.any(Object),
      }),
      false
    );
  });

  it('consumes the correct indices', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({ escapeHTML: false });

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    expect(render).toHaveBeenCalledTimes(1);

    const firstRenderOptions = render.mock.calls[0][0];

    expect(firstRenderOptions.indices).toHaveLength(0);

    const firstIndexHits = [{ name: 'Hit 1', objectID: '1' }];
    const secondIndexHits = [
      { name: 'Hit 1', objectID: '1' },
      { name: 'Hit 2', objectID: '2' },
    ];
    const scopedResults = [
      {
        indexId: 'indexId0',
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            index: 'indexName0',
            hits: firstIndexHits,
          }),
        ]),
        helper,
      },
      {
        indexId: 'indexId1',
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            index: 'indexName1',
            hits: secondIndexHits,
          }),
        ]),
        helper,
      },
    ];

    widget.render!(createRenderOptions({ helper, scopedResults }));

    const secondRenderOptions = render.mock.calls[1][0];

    expect(render).toHaveBeenCalledTimes(2);
    expect(secondRenderOptions.indices).toHaveLength(2);
    expect(secondRenderOptions.indices[0].indexId).toEqual('indexId0');
    expect(secondRenderOptions.indices[0].indexName).toEqual('indexName0');
    expect(secondRenderOptions.indices[0].hits).toEqual(firstIndexHits);
    expect(secondRenderOptions.indices[0].results.index).toEqual('indexName0');
    expect(secondRenderOptions.indices[0].results.hits).toEqual(firstIndexHits);
    expect(secondRenderOptions.indices[1].indexId).toEqual('indexId1');
    expect(secondRenderOptions.indices[1].indexName).toEqual('indexName1');
    expect(secondRenderOptions.indices[1].hits).toEqual(secondIndexHits);
    expect(secondRenderOptions.indices[1].results.index).toEqual('indexName1');
    expect(secondRenderOptions.indices[1].results.hits).toEqual(
      secondIndexHits
    );
  });

  it('sets a query and triggers search on `refine`', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({});

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    const { refine } = render.mock.calls[0][0];
    refine('foo');

    expect(helper.search).toHaveBeenCalledTimes(1);
    expect(helper.state.query).toBe('foo');
  });

  it('with escapeHTML should escape the hits and the results', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({ escapeHTML: true });

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${TAG_PLACEHOLDER.highlightPostTag}</script>`,
          },
        },
        objectID: '1',
      },
    ];

    const escapedHits = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
          },
        },
        objectID: '1',
      },
    ];

    (escapedHits as any).__escaped = true;

    widget.init!(createInitOptions({ helper }));

    widget.render!(
      createRenderOptions({
        scopedResults: [
          {
            indexId: 'index0',
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({ hits }),
            ]),
            helper,
          },
        ],
        state: helper.state,
        helper,
      })
    );

    const rendering = render.mock.calls[1][0];

    expect(rendering.indices[0].hits).toEqual(escapedHits);
    expect(rendering.indices[0].results.hits).toEqual(escapedHits);
  });

  it('without escapeHTML should not escape the hits', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({ escapeHTML: false });

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${TAG_PLACEHOLDER.highlightPostTag}</script>`,
          },
        },
        objectID: '1',
      },
    ];

    widget.init!(createInitOptions({ helper }));

    widget.render!(
      createRenderOptions({
        scopedResults: [
          {
            indexId: 'index0',
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({ hits }),
            ]),
            helper,
          },
        ],
        state: helper.state,
        helper,
      })
    );

    const rendering = render.mock.calls[1][0];

    expect(rendering.indices[0].hits).toEqual(hits);
    expect(rendering.indices[0].results.hits).toEqual(hits);
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '');

      const render = jest.fn();
      const unmount = jest.fn();
      const makeWidget = connectAutocomplete(render, unmount);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(unmount).toHaveBeenCalledTimes(0);

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect(unmount).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '');

      const render = jest.fn();
      const makeWidget = connectAutocomplete(render);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('removes the `query` from the `SearchParameters`', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '', {
        query: 'Apple',
      });

      const render = jest.fn();
      const makeWidget = connectAutocomplete(render);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(helper.state.query).toBe('Apple');

      const nextState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      ) as SearchParameters;

      expect(nextState.query).toBeUndefined();
    });

    it('removes the TAG_PLACEHOLDER from the `SearchParameters`', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '', {
        ...TAG_PLACEHOLDER,
      });

      const render = jest.fn();
      const makeWidget = connectAutocomplete(render);
      const widget = makeWidget({});

      expect(helper.state.highlightPreTag).toBe(
        TAG_PLACEHOLDER.highlightPreTag
      );

      expect(helper.state.highlightPostTag).toBe(
        TAG_PLACEHOLDER.highlightPostTag
      );

      widget.init!(createInitOptions({ helper }));

      const nextState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      ) as SearchParameters;

      expect(nextState.highlightPreTag).toBeUndefined();
      expect(nextState.highlightPostTag).toBeUndefined();
    });

    it('does not remove the TAG_PLACEHOLDER from the `SearchParameters` with `escapeHTML` disabled', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '', {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      const render = jest.fn();
      const makeWidget = connectAutocomplete(render);
      const widget = makeWidget({
        escapeHTML: false,
      });

      expect(helper.state.highlightPreTag).toBe('<mark>');
      expect(helper.state.highlightPostTag).toBe('</mark>');

      widget.init!(createInitOptions({ helper }));

      const nextState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      ) as SearchParameters;

      expect(nextState.highlightPreTag).toBe('<mark>');
      expect(nextState.highlightPostTag).toBe('</mark>');
    });
  });

  describe('getRenderState', () => {
    test('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createAutocomplete = connectAutocomplete(renderFn, unmountFn);
      const autocomplete = createAutocomplete({});

      const renderState1 = autocomplete.getRenderState({}, createInitOptions());

      expect(renderState1.autocomplete).toEqual({
        currentRefinement: '',
        indices: [],
        refine: expect.any(Function),
        widgetParams: {},
      });

      autocomplete.init!(createInitOptions());

      const renderState2 = autocomplete.getRenderState(
        {},
        createRenderOptions()
      );

      expect(renderState2.autocomplete).toEqual({
        currentRefinement: '',
        indices: expect.any(Array),
        refine: expect.any(Function),
        widgetParams: {},
      });
    });

    test('returns the render state with a query', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createAutocomplete = connectAutocomplete(renderFn, unmountFn);
      const autocomplete = createAutocomplete({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        query: 'query',
      });

      autocomplete.init!(createInitOptions());

      const renderState = autocomplete.getRenderState(
        {},
        createRenderOptions({ helper })
      );

      expect(renderState.autocomplete).toEqual({
        currentRefinement: 'query',
        indices: expect.any(Array),
        refine: expect.any(Function),
        widgetParams: {},
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createAutocomplete = connectAutocomplete(renderFn, unmountFn);
      const autocomplete = createAutocomplete({});

      const renderState1 = autocomplete.getWidgetRenderState(
        createInitOptions()
      );

      expect(renderState1).toEqual({
        currentRefinement: '',
        indices: [],
        refine: expect.any(Function),
        widgetParams: {},
      });

      autocomplete.init!(createInitOptions());

      const renderState2 = autocomplete.getWidgetRenderState(
        createRenderOptions()
      );

      expect(renderState2).toEqual({
        currentRefinement: '',
        indices: expect.any(Array),
        refine: expect.any(Function),
        widgetParams: {},
      });
    });

    test('returns the widget render state with a query', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createAutocomplete = connectAutocomplete(renderFn, unmountFn);
      const autocomplete = createAutocomplete({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        query: 'query',
      });

      autocomplete.init!(createInitOptions());

      const renderState = autocomplete.getWidgetRenderState(
        createRenderOptions({ helper })
      );

      const hits = [];
      // @ts-ignore-next-line
      hits.__escaped = true;

      expect(renderState).toEqual({
        currentRefinement: 'query',
        indices: [
          expect.objectContaining({
            results: expect.objectContaining({
              hits,
            }),
            sendEvent: expect.any(Function),
          }),
        ],
        refine: expect.any(Function),
        widgetParams: {},
      });
    });
  });

  describe('getWidgetUiState', () => {
    test('should give back the object unmodified if the default value is selected', () => {
      const [widget, helper] = getInitializedWidget();
      const uiStateBefore = {};
      const uiStateAfter = widget.getWidgetUiState!(uiStateBefore, {
        searchParameters: helper.state,
        helper,
      });
      expect(uiStateAfter).toBe(uiStateBefore);
    });

    test('should add an entry equal to the refinement', () => {
      const [widget, helper, refine] = getInitializedWidget();
      refine('some query');
      const uiStateBefore = {};
      const uiStateAfter = widget.getWidgetUiState!(uiStateBefore, {
        searchParameters: helper.state,
        helper,
      });
      expect(uiStateAfter).toEqual({
        query: 'some query',
      });
    });

    test('should give back the same instance if the value is already in the uiState', () => {
      const [widget, helper, refine] = getInitializedWidget();
      refine('query');
      const uiStateBefore = widget.getWidgetUiState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );
      const uiStateAfter = widget.getWidgetUiState!(uiStateBefore, {
        searchParameters: helper.state,
        helper,
      });
      expect(uiStateAfter).toBe(uiStateBefore);
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('returns the `SearchParameters` with the value from `uiState`', () => {
      const [widget, helper] = getInitializedWidget();

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
        })
      );

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          query: 'Apple',
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: 'Apple',
          ...TAG_PLACEHOLDER,
        })
      );
    });

    test('returns the `SearchParameters` with the default value', () => {
      const [widget, helper] = getInitializedWidget();

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
        })
      );

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: '',
          ...TAG_PLACEHOLDER,
        })
      );
    });

    test('does not add highlight tags if escapeHTML is false', () => {
      const [widget, helper] = getInitializedWidget({
        escapeHTML: false,
      });

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
        })
      );

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: '',
        })
      );
    });

    test('overrides query from search parameters', () => {
      const [widget, helper] = getInitializedWidget();

      helper.setQuery('Zeppelin manufacturer');

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
          query: 'Zeppelin manufacturer',
        })
      );

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: '',
          ...TAG_PLACEHOLDER,
        })
      );
    });
  });

  describe('insights', () => {
    const createRenderedWidget = () => {
      const searchClient = createSearchClient();
      const render = jest.fn();
      const makeWidget = connectAutocomplete(render);
      const widget = makeWidget({ escapeHTML: false });

      const helper = algoliasearchHelper(searchClient, '', {});
      helper.search = jest.fn();

      const initOptions = createInitOptions({ helper });
      const instantSearchInstance = initOptions.instantSearchInstance;
      widget.init!(initOptions);

      const firstIndexHits = [
        {
          name: 'Hit 1-1',
          objectID: '1-1',
          __queryID: 'test-query-id',
          __position: 0,
        },
      ];
      const secondIndexHits = [
        {
          name: 'Hit 2-1',
          objectID: '2-1',
          __queryID: 'test-query-id',
          __position: 0,
        },
        {
          name: 'Hit 2-2',
          objectID: '2-2',
          __queryID: 'test-query-id',
          __position: 1,
        },
      ];

      const scopedResults = [
        {
          indexId: 'indexId0',
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              index: 'indexName0',
              hits: firstIndexHits,
            }),
          ]),
          helper,
        },
        {
          indexId: 'indexId1',
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              index: 'indexName1',
              hits: secondIndexHits,
            }),
          ]),
          helper,
        },
      ];

      widget.render!(
        createRenderOptions({ instantSearchInstance, helper, scopedResults })
      );

      const sendEventToInsights = instantSearchInstance.sendEventToInsights as jest.Mock;

      return {
        instantSearchInstance,
        sendEventToInsights,
        render,
        firstIndexHits,
        secondIndexHits,
      };
    };

    it('sends view event when hits are rendered', () => {
      const { sendEventToInsights } = createRenderedWidget();
      expect(sendEventToInsights).toHaveBeenCalledTimes(2);
      expect(sendEventToInsights.mock.calls[0][0]).toEqual({
        eventType: 'view',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            name: 'Hit 1-1',
            objectID: '1-1',
          },
        ],
        insightsMethod: 'viewedObjectIDs',
        payload: {
          eventName: 'Hits Viewed',
          index: 'indexName0',
          objectIDs: ['1-1'],
        },
        widgetType: 'ais.autocomplete',
      });
      expect(sendEventToInsights.mock.calls[1][0]).toEqual({
        eventType: 'view',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            name: 'Hit 2-1',
            objectID: '2-1',
          },
          {
            __position: 1,
            __queryID: 'test-query-id',
            name: 'Hit 2-2',
            objectID: '2-2',
          },
        ],
        insightsMethod: 'viewedObjectIDs',
        payload: {
          eventName: 'Hits Viewed',
          index: 'indexName1',
          objectIDs: ['2-1', '2-2'],
        },
        widgetType: 'ais.autocomplete',
      });
    });

    it('sends click event', () => {
      const {
        sendEventToInsights,
        render,
        secondIndexHits,
      } = createRenderedWidget();
      expect(sendEventToInsights).toHaveBeenCalledTimes(2); // two view events for each index by render

      const { indices } = render.mock.calls[render.mock.calls.length - 1][0];
      indices[1].sendEvent('click', secondIndexHits[0], 'Product Added');
      expect(sendEventToInsights).toHaveBeenCalledTimes(3);
      expect(sendEventToInsights.mock.calls[2][0]).toEqual({
        eventType: 'click',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            name: 'Hit 2-1',
            objectID: '2-1',
          },
        ],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Added',
          index: 'indexName1',
          objectIDs: ['2-1'],
          positions: [0],
          queryID: 'test-query-id',
        },
        widgetType: 'ais.autocomplete',
      });
    });

    it('sends conversion event', () => {
      const {
        sendEventToInsights,
        render,
        firstIndexHits,
      } = createRenderedWidget();
      expect(sendEventToInsights).toHaveBeenCalledTimes(2); // two view events for each index by render

      const { indices } = render.mock.calls[render.mock.calls.length - 1][0];
      indices[0].sendEvent('conversion', firstIndexHits[0], 'Product Ordered');
      expect(sendEventToInsights).toHaveBeenCalledTimes(3);
      expect(sendEventToInsights.mock.calls[2][0]).toEqual({
        eventType: 'conversion',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            name: 'Hit 1-1',
            objectID: '1-1',
          },
        ],
        insightsMethod: 'convertedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Ordered',
          index: 'indexName0',
          objectIDs: ['1-1'],
          queryID: 'test-query-id',
        },
        widgetType: 'ais.autocomplete',
      });
    });
  });
});
