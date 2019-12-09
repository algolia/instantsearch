import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';

import connectPagination from '../connectPagination';

describe('connectPagination', () => {
  const getInitializedWidget = () => {
    const renderFn = jest.fn();
    const makeWidget = connectPagination(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper({}, '');
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const { refine } = renderFn.mock.calls[0][0];

    return [widget, helper, refine];
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectPagination()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/pagination/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customPagination = connectPagination(render, unmount);
      const widget = customPagination({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.pagination',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),

          getWidgetState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });
  });

  it('connectPagination - Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectPagination(renderFn);
    const widget = makeWidget({
      foo: 'bar',
    });

    const helper = algoliasearchHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
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

    const helper = algoliasearchHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
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

    const helper = algoliasearchHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
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

    const helper = algoliasearchHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
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
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectPagination(renderFn, unmountFn);
      const widget = makeWidget();

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const makeWidget = connectPagination(renderFn);
      const widget = makeWidget();

      expect(() =>
        widget.dispose({ helper, state: helper.state })
      ).not.toThrow();
    });

    it('removes the `page` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper({}, '', {
        page: 5,
      });

      const renderFn = () => {};
      const makeWidget = connectPagination(renderFn);
      const widget = makeWidget();

      expect(helper.state.page).toBe(5);

      const nextState = widget.dispose({ helper, state: helper.state });

      expect(nextState.page).toBeUndefined();
    });
  });

  describe('getWidgetState', () => {
    test('returns the `uiState` empty', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a refinement', () => {
      const [widget, helper] = getInitializedWidget();

      helper.setQueryParameter('page', 4);

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        page: 5, // page + 1
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('returns the `SearchParameters` with the value from `uiState`', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          page: 5,
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          page: 4, // uiState.page - 1
        })
      );
    });

    test('returns the `SearchParameters` with the default value', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          page: 0,
        })
      );
    });

    test('overrides original `SearchParameters` with the default value', () => {
      const [widget, helper] = getInitializedWidget();

      helper.setPage(200);
      expect(helper.state.page).toBe(200);

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          page: 0,
        })
      );
    });
  });
});
