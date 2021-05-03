import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import connectVoiceSearch from '../connectVoiceSearch';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';

jest.mock('../../../lib/voiceSearchHelper', () => {
  return ({ onStateChange, onQueryChange }) => {
    let isListening = false;
    return {
      getState: () => {},
      isBrowserSupported: () => true,
      isListening: () => isListening,
      startListening: () => {
        isListening = !isListening;
      },
      dispose: jest.fn(),
      // ⬇️ for test
      changeState: () => onStateChange(),
      changeQuery: query => onQueryChange(query),
    };
  };
});

function getInitializedWidget({ widgetParams = {} } = {}) {
  const helper = algoliasearchHelper(createSearchClient(), '');

  const renderFn = () => {};
  const makeWidget = connectVoiceSearch(renderFn);
  const widget = makeWidget(widgetParams);

  widget.init!(createInitOptions({ helper }));

  return {
    renderFn,
    widget,
    helper,
    refine: (widget as any)._refine,
  };
}

describe('connectVoiceSearch', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectVoiceSearch()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/voice-search/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customVoiceSearch = connectVoiceSearch(render, unmount);
      const widget = customVoiceSearch({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.voiceSearch',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),

          getWidgetUiState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });

    it('creates custom voice helper', () => {
      const voiceHelper = {
        isBrowserSupported: () => true,
        dispose: () => {},
        getState: () => ({
          isSpeechFinal: true,
          status: 'askingPermission',
          transcript: '',
        }),
        isListening: () => true,
        toggleListening: () => {},
      };

      const { widget } = getInitializedWidget({
        widgetParams: {
          createVoiceSearchHelper: () => voiceHelper,
        },
      });

      expect((widget as any)._voiceSearchHelper).toBe(voiceHelper);
    });
  });

  it('calls renderFn during init and render', () => {
    const helper = algoliasearchHelper(createSearchClient(), '');

    const renderFn = jest.fn();
    const makeWidget = connectVoiceSearch(renderFn);
    const widget = makeWidget({});

    widget.init!(createInitOptions({ helper }));

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({}),
      true
    );

    widget.render!(
      createRenderOptions({
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({}),
      false
    );
  });

  it('triggers render when state changes', () => {
    const helper = algoliasearchHelper(createSearchClient(), '');

    const renderFn = jest.fn();
    const makeWidget = connectVoiceSearch(renderFn);
    const widget = makeWidget({});

    widget.init!(createInitOptions({ helper }));

    expect(renderFn).toHaveBeenCalledTimes(1);

    (widget as any)._voiceSearchHelper.changeState();

    expect(renderFn).toHaveBeenCalledTimes(2);

    (widget as any)._voiceSearchHelper.changeState();

    expect(renderFn).toHaveBeenCalledTimes(3);
  });

  it('setQuery and search when query changes', () => {
    const helper = algoliasearchHelper(createSearchClient(), '');

    const renderFn = jest.fn();
    const makeWidget = connectVoiceSearch(renderFn);
    const widget = makeWidget({});

    jest.spyOn(helper, 'setQuery');

    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    (widget as any)._voiceSearchHelper.changeQuery('foo');

    expect(helper.setQuery).toHaveBeenCalledTimes(1);
    expect(helper.setQuery).toHaveBeenCalledWith('foo');
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectVoiceSearch(renderFn, unmountFn);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const renderFn = () => {};
      const makeWidget = connectVoiceSearch(renderFn);
      const widget = makeWidget({});

      widget.init!(createInitOptions());

      expect(() => widget.dispose!(createDisposeOptions())).not.toThrow();
    });

    it('removes event listeners on the voice helper', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const makeWidget = connectVoiceSearch(renderFn);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect((widget as any)._voiceSearchHelper.dispose).toHaveBeenCalledTimes(
        0
      );

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect((widget as any)._voiceSearchHelper.dispose).toHaveBeenCalledTimes(
        1
      );
    });

    it('removes the `query` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper(createSearchClient(), '', {
        query: 'Apple',
      });

      const renderFn = () => {};
      const makeWidget = connectVoiceSearch(renderFn);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(helper.state.query).toBe('Apple');

      const nextState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      ) as SearchParameters;

      expect(nextState.query).toBeUndefined();
    });
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` empty', () => {
      const { widget, helper } = getInitializedWidget();

      const actual = widget.getWidgetUiState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a refinement', () => {
      const { widget, helper } = getInitializedWidget();

      helper.setQueryParameter('query', 'Apple');

      const actual = widget.getWidgetUiState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        query: 'Apple',
      });
    });
  });

  describe('getRenderState', () => {
    it('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createVoiceSearch = connectVoiceSearch(renderFn, unmountFn);
      const voiceSearchWidget = createVoiceSearch({});
      const helper = algoliasearchHelper(createSearchClient(), '');

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState = voiceSearchWidget.getRenderState({}, initOptions);

      expect(renderState.voiceSearch).toEqual({
        isBrowserSupported: true,
        isListening: false,
        toggleListening: expect.any(Function),
        voiceListeningState: undefined,
        widgetParams: {},
      });
    });

    it('returns the render state with a custom voice helper', () => {
      const voiceHelper = {
        isBrowserSupported: () => true,
        dispose: () => {},
        getState: () => ({
          isSpeechFinal: true,
          status: 'askingPermission' as const,
          transcript: '',
        }),
        isListening: () => true,
        startListening: () => {},
        stopListening: () => {},
      };

      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createVoiceSearch = connectVoiceSearch(renderFn, unmountFn);
      const voiceSearchWidget = createVoiceSearch({
        createVoiceSearchHelper: () => voiceHelper,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState = voiceSearchWidget.getRenderState({}, initOptions);

      expect(renderState.voiceSearch).toEqual({
        isBrowserSupported: true,
        isListening: true,
        toggleListening: expect.any(Function),
        voiceListeningState: {
          isSpeechFinal: true,
          status: 'askingPermission',
          transcript: '',
        },
        widgetParams: {
          createVoiceSearchHelper: expect.any(Function),
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createVoiceSearch = connectVoiceSearch(renderFn, unmountFn);
      const voiceSearchWidget = createVoiceSearch({});
      const helper = algoliasearchHelper(createSearchClient(), '');

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState = voiceSearchWidget.getWidgetRenderState(initOptions);

      expect(renderState).toEqual({
        isBrowserSupported: true,
        isListening: false,
        toggleListening: expect.any(Function),
        voiceListeningState: undefined,
        widgetParams: {},
      });
    });

    it('returns the render state with a custom voice helper', () => {
      const voiceHelper = {
        isBrowserSupported: () => true,
        dispose: () => {},
        getState: () => ({
          isSpeechFinal: true,
          status: 'askingPermission' as const,
          transcript: '',
        }),
        isListening: () => true,
        startListening: () => {},
        stopListening: () => {},
      };

      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createVoiceSearch = connectVoiceSearch(renderFn, unmountFn);
      const voiceSearchWidget = createVoiceSearch({
        createVoiceSearchHelper: () => voiceHelper,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState = voiceSearchWidget.getWidgetRenderState(initOptions);

      expect(renderState).toEqual({
        isBrowserSupported: true,
        isListening: true,
        toggleListening: expect.any(Function),
        voiceListeningState: {
          isSpeechFinal: true,
          status: 'askingPermission',
          transcript: '',
        },
        widgetParams: {
          createVoiceSearchHelper: expect.any(Function),
        },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('returns the `SearchParameters` with the value from `uiState`', () => {
      const { widget, helper } = getInitializedWidget();

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
        })
      );

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          query: 'Apple',
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: 'Apple',
        })
      );
    });

    test('returns the `SearchParameters` with the default value', () => {
      const { widget, helper } = getInitializedWidget();

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
        })
      );

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: '',
        })
      );
    });
  });

  describe('additional search parameters', () => {
    it('applies default search parameters if given', () => {
      const { helper, refine } = getInitializedWidget({
        widgetParams: {
          additionalQueryParameters: () => {},
        },
      });

      refine('query');
      expect(helper.state).toEqual(
        new SearchParameters({
          ignorePlurals: true,
          removeStopWords: true,
          optionalWords: 'query',
          queryLanguages: undefined,
          index: '',
          query: 'query',
        })
      );
    });

    it('applies queryLanguages if language given', () => {
      const { helper, refine } = getInitializedWidget({
        widgetParams: {
          language: 'en-US',
          additionalQueryParameters: () => {},
        },
      });

      refine('query');
      expect(helper.state).toEqual(
        new SearchParameters({
          queryLanguages: ['en'],
          // regular
          removeStopWords: true,
          optionalWords: 'query',
          ignorePlurals: true,
          query: 'query',
          index: '',
        })
      );
    });

    it('applies additional parameters if language given', () => {
      const { helper, refine } = getInitializedWidget({
        widgetParams: {
          additionalQueryParameters: () => ({
            distinct: true,
          }),
        },
      });

      refine('query');
      expect(helper.state).toEqual(
        new SearchParameters({
          ignorePlurals: true,
          removeStopWords: true,
          optionalWords: 'query',
          queryLanguages: undefined,
          index: '',
          query: 'query',
          distinct: true,
        })
      );
    });

    it('removes additional parameters when disposed', () => {
      const { widget, helper, refine } = getInitializedWidget({
        widgetParams: {
          additionalQueryParameters: () => {},
        },
      });

      refine('query');
      const newState = widget.dispose!(
        createDisposeOptions({ state: helper.state })
      );
      expect(newState).toEqual(
        new SearchParameters({
          ignorePlurals: undefined,
          removeStopWords: undefined,
          optionalWords: undefined,
          queryLanguages: undefined,
          index: '',
        })
      );
    });

    it('removes additional parameters and extra parameters when disposed', () => {
      const { widget, helper, refine } = getInitializedWidget({
        widgetParams: {
          additionalQueryParameters: () => ({
            distinct: true,
          }),
        },
      });

      refine('query');
      const newState = widget.dispose!(
        createDisposeOptions({ state: helper.state })
      );
      expect(newState).toEqual(
        new SearchParameters({
          ignorePlurals: undefined,
          removeStopWords: undefined,
          optionalWords: undefined,
          queryLanguages: undefined,
          index: '',
        })
      );
    });
  });
});
