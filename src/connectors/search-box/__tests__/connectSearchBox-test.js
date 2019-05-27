import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectSearchBox from '../connectSearchBox';

describe('connectSearchBox', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectSearchBox()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/search-box/js/#connector"
`);
    });
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const widget = makeWidget({
      foo: 'bar',
    });

    expect(widget.getConfiguration).toBe(undefined);

    const helper = algoliasearchHelper({});
    helper.search = () => {};

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: '',
        widgetParams: { foo: 'bar' },
      }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
      searchMetadata: { isSearchStalled: false },
    });

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: '',
        widgetParams: { foo: 'bar' },
      }),
      false
    );
  });

  it('Provides a function to update the refinements at each step', () => {
    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const widget = makeWidget();

    const helper = algoliasearchHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      const { refine, query } = renderFn.mock.calls[0][0];
      expect(helper.state.query).toBeUndefined();
      expect(query).toBe('');
      refine('bip');
      expect(helper.state.query).toBe('bip');
      expect(helper.search).toHaveBeenCalledTimes(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
      searchMetadata: { isSearchStalled: false },
    });

    {
      const { refine, query } = renderFn.mock.calls[1][0];
      expect(helper.state.query).toBe('bip');
      expect(query).toBe('bip');
      refine('bop');
      expect(helper.state.query).toBe('bop');
      expect(helper.search).toHaveBeenCalledTimes(2);
    }
  });

  it('provides a function to clear the query and perform new search', () => {
    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const widget = makeWidget();

    const helper = algoliasearchHelper({}, '', {
      query: 'bup',
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      expect(helper.state.query).toBe('bup');
      const { refine, clear } = renderFn.mock.calls[0][0];
      clear(); // triggers a search
      expect(helper.state.query).toBe('');
      expect(helper.search).toHaveBeenCalledTimes(1);
      refine('bip'); // triggers a search
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
      searchMetadata: { isSearchStalled: false },
    });

    {
      expect(helper.state.query).toBe('bip');
      const { clear } = renderFn.mock.calls[1][0];
      clear();
      expect(helper.state.query).toBe('');
      expect(helper.search).toHaveBeenCalledTimes(3);
    }
  });

  it('queryHook parameter let the dev control the behavior of the search', () => {
    let letSearchThrough = false;
    const queryHook = jest.fn((q, search) => {
      if (letSearchThrough) search(q);
    });

    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const widget = makeWidget({
      queryHook,
    });

    const helper = algoliasearchHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      const { refine } = renderFn.mock.calls[0][0];

      refine('bip');
      expect(queryHook).toHaveBeenCalledTimes(1);
      expect(helper.state.query).toBeUndefined();
      expect(helper.search).not.toHaveBeenCalled();

      letSearchThrough = true;

      refine('bip');
      expect(queryHook).toHaveBeenCalledTimes(2);
      expect(helper.state.query).toBe('bip');
      expect(helper.search).toHaveBeenCalledTimes(1);
    }

    letSearchThrough = false;

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
      searchMetadata: { isSearchStalled: false },
    });

    {
      const { refine } = renderFn.mock.calls[1][0];

      refine('bop');
      expect(queryHook).toHaveBeenCalledTimes(3);
      expect(helper.state.query).toBe('bip');
      expect(helper.search).toHaveBeenCalledTimes(1);

      letSearchThrough = true;
      refine('bop');
      expect(queryHook).toHaveBeenCalledTimes(4);
      expect(helper.state.query).toBe('bop');
      expect(helper.search).toHaveBeenCalledTimes(2);
    }
  });

  it('should always provide the same refine() and clear() function reference', () => {
    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const widget = makeWidget();

    const helper = algoliasearchHelper({});
    helper.search = () => {};

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
      searchMetadata: { isSearchStalled: false },
    });

    const firstRenderOptions = renderFn.mock.calls[0][0];

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
      searchMetadata: { isSearchStalled: false },
    });

    const secondRenderOptions = renderFn.mock.calls[1][0];

    expect(firstRenderOptions.clear).toBe(secondRenderOptions.clear);
    expect(firstRenderOptions.refine).toBe(secondRenderOptions.refine);
  });

  it('should clear on init as well', () => {
    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const widget = makeWidget();

    const helper = algoliasearchHelper({});
    helper.search = jest.fn();
    helper.setQuery('foobar');

    expect(helper.state.query).toBe('foobar');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const { clear } = renderFn.mock.calls[0][0];
    clear();

    expect(helper.state.query).toBe('');
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectSearchBox(renderFn, unmountFn);
      const widget = makeWidget();

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const makeWidget = connectSearchBox(renderFn);
      const widget = makeWidget();

      expect(() =>
        widget.dispose({ helper, state: helper.state })
      ).not.toThrow();
    });

    it('removes the `query` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper({}, '', {
        query: 'Apple',
      });

      const renderFn = () => {};
      const makeWidget = connectSearchBox(renderFn);
      const widget = makeWidget();

      expect(helper.state.query).toBe('Apple');

      const nextState = widget.dispose({ helper, state: helper.state });

      expect(nextState.query).toBeUndefined();
    });
  });

  describe('routing', () => {
    const getInitializedWidget = (config = {}) => {
      const renderFn = jest.fn();
      const makeWidget = connectSearchBox(renderFn);
      const widget = makeWidget({
        ...config,
      });

      const initialConfig = {};
      const helper = algoliasearchHelper({}, '', initialConfig);
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      const { refine } = renderFn.mock.calls[0][0];

      return [widget, helper, refine];
    };

    describe('getWidgetState', () => {
      test('should give back the object unmodified if the default value is selected', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });
        expect(uiStateAfter).toBe(uiStateBefore);
      });

      test('should add an entry equal to the refinement', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine('some query');
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });
        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should give back the same instance if the value is alreay in the uiState', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine('query');
        const uiStateBefore = widget.getWidgetState(
          {},
          {
            searchParameters: helper.state,
            helper,
          }
        );
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });
        expect(uiStateAfter).toBe(uiStateBefore);
      });
    });

    describe('getWidgetSearchParameters', () => {
      test('should return the same SP if no value is in the UI state', () => {
        const [widget, helper] = getInitializedWidget();
        const uiState = {};
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should add the refinements according to the UI state provided', () => {
        const [widget, helper] = getInitializedWidget();
        const uiState = {
          query: 'some search',
        };
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toMatchSnapshot();
      });

      test('should enforce the default value if no value is the ui state', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine('previous search');
        const uiState = {};
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toMatchSnapshot();
      });
    });
  });
});
