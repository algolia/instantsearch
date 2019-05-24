import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';

import connectPagination from '../connectPagination';

describe('connectPagination', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectPagination()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/pagination/js/#connector"
`);
    });
  });

  it('connectPagination - Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectPagination(renderFn);
    const widget = makeWidget({
      foo: 'bar',
    });

    expect(widget.getConfiguration).toBe(undefined);

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      expect(renderFn).toHaveBeenCalledTimes(1);
      const isFirstRendering =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(true);

      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(renderOptions.currentRefinement).toBe(0);
      expect(renderOptions.nbHits).toBe(0);
      expect(renderOptions.nbPages).toBe(0);
      expect(renderOptions.widgetParams).toEqual({
        foo: 'bar',
      });
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ test: 'oneTime' }],
          nbHits: 1,
          nbPages: 1,
          page: 0,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      expect(renderFn).toHaveBeenCalledTimes(2);
      const isFirstRendering =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(false);

      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(renderOptions.currentRefinement).toBe(0);
      expect(renderOptions.nbHits).toBe(1);
      expect(renderOptions.nbPages).toBe(1);
    }
  });

  it('Provides a function to update the refinements at each step', () => {
    const renderFn = jest.fn();
    const makeWidget = connectPagination(renderFn);
    const widget = makeWidget();

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { refine } = renderOptions;
      refine(2);
      expect(helper.state.page).toBe(2);
      expect(helper.search).toHaveBeenCalledTimes(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          nbPages: 250,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { refine } = renderOptions;
      refine(7);
      expect(helper.state.page).toBe(7);
      expect(helper.search).toHaveBeenCalledTimes(2);
    }
  });

  it('Provides the pages to render (default)', () => {
    const renderFn = jest.fn();
    const makeWidget = connectPagination(renderFn);
    const widget = makeWidget();

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // page 0
    widget.render({
      results: new SearchResults(helper.state, [{ nbPages: 50 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([0, 1, 2, 3, 4, 5, 6]);
    }

    helper.setPage(5);

    widget.render({
      results: new SearchResults(helper.state, [{ nbPages: 50 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([2, 3, 4, 5, 6, 7, 8]);
    }

    // Last page
    helper.setPage(49);

    widget.render({
      results: new SearchResults(helper.state, [{ nbPages: 50 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([43, 44, 45, 46, 47, 48, 49]);
    }
  });

  it('Provides the pages to render (extra padding)', () => {
    const renderFn = jest.fn();
    const makeWidget = connectPagination(renderFn);
    const widget = makeWidget({
      padding: 5,
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    widget.render({
      results: new SearchResults(helper.state, [{ nbPages: 50 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    helper.setPage(5);

    widget.render({
      results: new SearchResults(helper.state, [{ nbPages: 50 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    // Last page
    helper.setPage(49);
    widget.render({
      results: new SearchResults(helper.state, [{ nbPages: 50 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]);
    }
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectPagination(renderFn, unmountFn);
      const widget = makeWidget();

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose();

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('routing', () => {
    const getInitializedWidget = () => {
      const renderFn = jest.fn();
      const makeWidget = connectPagination(renderFn);
      const widget = makeWidget({});

      const helper = jsHelper({}, '');
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
        refine(4);
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should give back the object unmodified if refinements are already set', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine(4);
        const uiStateBefore = {
          page: 5,
        };
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });
    });

    describe('getWidgetSearchParameters', () => {
      test('should return the same SP if there are no refinements in the UI state', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), and the URL contains no parameters
        const uiState = {};
        // The current state is empty (and page is set to 0 by default)
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the same values should not return a new object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should enforce the default value if no value is in the UI State', () => {
        const [widget, helper, refine] = getInitializedWidget();
        // The user presses back (browser), and the URL contains no parameters
        const uiState = {};
        // The current state is set to page 4
        refine(4);
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying an empty state, should force back to page 0
        expect(searchParametersAfter).toMatchSnapshot();
        expect(searchParametersAfter.page).toBeUndefined();
      });

      test('should add the refinements according to the UI state provided', () => {
        const [widget, helper, refine] = getInitializedWidget();
        // The user presses back (browser), and the URL contains some parameters
        const uiState = {
          page: 2,
        };
        // The current search is set to page 10
        refine(10);
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying a state with new parameters should apply them on the search
        expect(searchParametersAfter).toMatchSnapshot();
        expect(searchParametersAfter.page).toBe(1);
      });
    });
  });
});
