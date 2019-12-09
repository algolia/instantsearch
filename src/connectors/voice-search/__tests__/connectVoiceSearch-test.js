import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import connectVoiceSearch from '../connectVoiceSearch';

jest.mock('../../../lib/voiceSearchHelper', () => {
  return ({ onStateChange, onQueryChange }) => {
    return {
      getState: () => {},
      isBrowserSupported: () => true,
      isListening: () => false,
      toggleListening: () => {},
      dispose: jest.fn(),
      // ⬇️ for test
      changeState: () => onStateChange(),
      changeQuery: query => onQueryChange(query),
    };
  };
});

function getInitializedWidget({ widgetParams = {} } = {}) {
  const helper = algoliasearchHelper({}, '');

  const renderFn = () => {};
  const makeWidget = connectVoiceSearch(renderFn);
  const widget = makeWidget(widgetParams);

  helper.search = () => {};
  widget.init({ helper });

  return {
    renderFn,
    widget,
    helper,
    refine: widget._refine,
  };
}

describe('connectVoiceSearch', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
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

          getWidgetState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });
  });

  it('calls renderFn during init and render', () => {
    const helper = algoliasearchHelper({}, '');

    const renderFn = jest.fn();
    const makeWidget = connectVoiceSearch(renderFn);
    const widget = makeWidget({});

    widget.init({ helper });

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({}),
      true
    );

    widget.render({
      helper,
    });

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({}),
      false
    );
  });

  it('triggers render when state changes', () => {
    const helper = algoliasearchHelper({}, '');

    const renderFn = jest.fn();
    const makeWidget = connectVoiceSearch(renderFn);
    const widget = makeWidget({});

    widget.init({ helper });

    expect(renderFn).toHaveBeenCalledTimes(1);

    widget._voiceSearchHelper.changeState();

    expect(renderFn).toHaveBeenCalledTimes(2);

    widget._voiceSearchHelper.changeState();

    expect(renderFn).toHaveBeenCalledTimes(3);
  });

  it('setQuery and search when query changes', () => {
    const helper = algoliasearchHelper({}, '');

    const renderFn = jest.fn();
    const makeWidget = connectVoiceSearch(renderFn);
    const widget = makeWidget({});

    jest.spyOn(helper, 'setQuery');

    helper.search = jest.fn();

    widget.init({ helper });

    widget._voiceSearchHelper.changeQuery('foo');

    expect(helper.setQuery).toHaveBeenCalledTimes(1);
    expect(helper.setQuery).toHaveBeenCalledWith('foo');
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectVoiceSearch(renderFn, unmountFn);
      const widget = makeWidget({});

      widget.init({ helper });

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const makeWidget = connectVoiceSearch(renderFn);
      const widget = makeWidget({});

      widget.init({ helper });

      expect(() =>
        widget.dispose({ helper, state: helper.state })
      ).not.toThrow();
    });

    it('removes event listeners on the voice helper', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const makeWidget = connectVoiceSearch(renderFn);
      const widget = makeWidget({});

      widget.init({ helper });

      expect(widget._voiceSearchHelper.dispose).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(widget._voiceSearchHelper.dispose).toHaveBeenCalledTimes(1);
    });

    it('removes the `query` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper({}, '', {
        query: 'Apple',
      });

      const renderFn = () => {};
      const makeWidget = connectVoiceSearch(renderFn);
      const widget = makeWidget({});

      widget.init({ helper });

      expect(helper.state.query).toBe('Apple');

      const nextState = widget.dispose({ helper, state: helper.state });

      expect(nextState.query).toBeUndefined();
    });
  });

  describe('getWidgetState', () => {
    test('returns the `uiState` empty', () => {
      const { widget, helper } = getInitializedWidget();

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a refinement', () => {
      const { widget, helper } = getInitializedWidget();

      helper.setQueryParameter('query', 'Apple');

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({
        query: 'Apple',
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
      const newState = widget.dispose({ state: helper.state });
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
      const newState = widget.dispose({ state: helper.state });
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
