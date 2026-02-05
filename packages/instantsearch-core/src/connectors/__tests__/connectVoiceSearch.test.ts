/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from 'instantsearch-core/test/createWidget';

import { connectSearchBox, connectVoiceSearch, instantsearch } from '../..';

import type {
  VoiceSearchHelperParams,
  VoiceSearchHelper,
} from '../../lib/voiceSearchHelper/types';

jest.mock('../../lib/voiceSearchHelper', () => {
  const createVoiceHelper = ({
    onStateChange,
    onQueryChange,
  }: VoiceSearchHelperParams): VoiceSearchHelper & {
    changeState: () => void;
    changeQuery: (query: string) => void;
  } => {
    let isListening = false;

    const helper = {
      getState: () => {},
      isBrowserSupported: () => true,
      isListening: () => isListening,
      startListening: () => {
        isListening = !isListening;
      },
      dispose: jest.fn(),
    } as unknown as VoiceSearchHelper;

    return {
      ...helper,
      // ⬇️ for test
      changeState: () => onStateChange(),
      changeQuery: (query: string) => onQueryChange(query),
    };
  };
  return createVoiceHelper;
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
    it('calls unmount function', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const widget = connectVoiceSearch(render, unmount)({});

      widget.dispose!(createDisposeOptions());

      expect(unmount).toHaveBeenCalled();
    });

    it('does not throw without the unmount function', () => {
      const render = () => {};
      const widget = connectVoiceSearch(render)({});
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

      widget.dispose!(createDisposeOptions({}));

      expect((widget as any)._voiceSearchHelper.dispose).toHaveBeenCalledTimes(
        1
      );
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
          // @ts-ignore we send optionalWords as a string
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
          // @ts-ignore we send optionalWords as a string
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
          // @ts-ignore we send optionalWords as a string
          optionalWords: 'query',
          queryLanguages: undefined,
          index: '',
          query: 'query',
          distinct: true,
        })
      );
    });
  });

  describe('interaction with searchbox', () => {
    it('sets voice parameters only for voice queries', async () => {
      const searchClient = createSearchClient();
      const search = instantsearch({ searchClient, indexName: 'indexName' });
      search.start();

      const voice = connectVoiceSearch(() => {})({
        additionalQueryParameters: () => ({ exactOnSingleWordQuery: 'word' }),
      });
      const searchBox = connectSearchBox(() => {})({});
      search.addWidgets([voice, searchBox]);

      await wait(100);
      expect(search.client.search).toHaveBeenCalledTimes(1);
      expect(search.client.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: { query: '' },
        },
      ]);

      search.renderState.indexName.searchBox?.refine('query');

      await wait(100);
      expect(search.client.search).toHaveBeenCalledTimes(2);
      expect(search.client.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: { query: 'query' },
        },
      ]);

      // not testing the browser API here
      (voice as any)._refine('voice query');

      await wait(100);
      expect(search.client.search).toHaveBeenCalledTimes(3);
      expect(search.client.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: {
            query: 'voice query',
            ignorePlurals: true,
            removeStopWords: true,
            optionalWords: 'voice query',
            exactOnSingleWordQuery: 'word',
          },
        },
      ]);

      search.removeWidgets([voice]);

      await wait(100);
      expect(search.client.search).toHaveBeenCalledTimes(4);
      expect(search.client.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: { query: 'voice query' },
        },
      ]);
    });
  });
});
