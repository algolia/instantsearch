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

function getInitializedWidget() {
  const helper = algoliasearchHelper({}, '');

  const renderFn = () => {};
  const makeWidget = connectVoiceSearch(renderFn);
  const widget = makeWidget({});

  helper.search = () => {};
  widget.init({ helper });

  return {
    renderFn,
    widget,
    helper,
    refine: query => widget._refine(query),
  };
}

describe('connectVoiceSearch', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectVoiceSearch()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/voice-search/js/#connector"
`);
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
    it('returns the same state if query is an empty string', () => {
      const { widget, helper, refine } = getInitializedWidget();
      const uiStateBefore = { foo: 'bar' };
      refine('');
      const uiStateAfter = widget.getWidgetState(uiStateBefore, {
        searchParameters: helper.state,
      });
      expect(uiStateAfter).toBe(uiStateBefore);
    });

    it('returns the same state if query is same', () => {
      const { widget, helper, refine } = getInitializedWidget();
      refine('myQuery');
      const uiStateBefore = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
        }
      );
      const uiStateAfter = widget.getWidgetState(uiStateBefore, {
        searchParameters: helper.state,
      });
      expect(uiStateAfter).toBe(uiStateBefore);
    });

    it('returns new state with query after refine', () => {
      const { widget, helper, refine } = getInitializedWidget();
      const uiStateBefore = { foo: 'bar' };
      refine('myQuery');
      const uiStateAfter = widget.getWidgetState(uiStateBefore, {
        searchParameters: helper.state,
      });
      expect(uiStateAfter).toEqual({
        foo: 'bar',
        query: 'myQuery',
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('should return the same SearchParameters if no value is in the UI state', () => {
      const { widget, helper } = getInitializedWidget();
      const uiState = {};
      const searchParametersBefore = SearchParameters.make(helper.state);
      const searchParametersAfter = widget.getWidgetSearchParameters(
        searchParametersBefore,
        { uiState }
      );
      expect(searchParametersAfter).toBe(searchParametersBefore);
    });

    it('should add the refinement according to the UI state provided', () => {
      const { widget, helper } = getInitializedWidget();
      const uiState = {
        query: 'my search',
      };
      const searchParametersBefore = SearchParameters.make(helper.state);
      const searchParametersAfter = widget.getWidgetSearchParameters(
        searchParametersBefore,
        { uiState }
      );
      expect(searchParametersAfter.query).toEqual(uiState.query);
    });

    it('should enforce the default value if the ui state is empty', () => {
      const { widget, helper, refine } = getInitializedWidget();
      refine('previous search');
      const uiState = {};
      const searchParametersBefore = SearchParameters.make(helper.state);
      const searchParametersAfter = widget.getWidgetSearchParameters(
        searchParametersBefore,
        { uiState }
      );
      expect(searchParametersAfter.query).toBeUndefined();
    });
  });
});
