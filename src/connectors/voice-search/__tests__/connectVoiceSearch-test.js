import jsHelper from 'algoliasearch-helper';
import connectVoiceSearch from '../connectVoiceSearch';

jest.mock('../../../lib/voiceSearchHelper', () => {
  return ({ onStateChange, onQueryChange }) => {
    return {
      getState: () => {},
      isSupportedBrowser: () => true,
      isListening: () => false,
      toggleListening: () => {},
      // ⬇️ for test
      changeState: () => onStateChange(),
      changeQuery: query => onQueryChange(query),
    };
  };
});

function defaultSetup() {
  const renderFn = jest.fn();
  const unmountFn = jest.fn();
  const makeWidget = connectVoiceSearch(renderFn, unmountFn);
  const widget = makeWidget();
  const helper = jsHelper({});

  return {
    renderFn,
    unmountFn,
    widget,
    helper,
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

  describe('lifecycle', () => {
    it('calls renderFn during init and render', () => {
      const { renderFn, widget, helper } = defaultSetup();
      widget.init({ helper });
      expect(renderFn).toHaveBeenCalled();
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

    it('calls unmount on dispose', () => {
      const { unmountFn, widget, helper } = defaultSetup();
      widget.init({ helper });
      widget.dispose({ helper, state: helper.getState() });
      expect(unmountFn).toHaveBeenCalledTimes(1);
    });
  });

  it('render triggered when state changes', () => {
    const { renderFn, widget, helper } = defaultSetup();
    widget.init({ helper });
    expect(renderFn).toHaveBeenCalled();
    widget._voiceSearchHelper.changeState();
    expect(renderFn).toHaveBeenCalledTimes(2);
    widget._voiceSearchHelper.changeState();
    expect(renderFn).toHaveBeenCalledTimes(3);
  });

  it('setQuery and search when query changes', () => {
    const { widget, helper } = defaultSetup();
    jest.spyOn(helper, 'setQuery');
    helper.search = jest.fn();
    widget.init({ helper });
    widget._voiceSearchHelper.changeQuery('foo');
    expect(helper.setQuery).toHaveBeenCalledTimes(1);
    expect(helper.setQuery).toHaveBeenCalledWith('foo');
    expect(helper.search).toHaveBeenCalledTimes(1);
  });
});
