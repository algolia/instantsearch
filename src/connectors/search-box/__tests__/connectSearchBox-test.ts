import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectSearchBox from '../connectSearchBox';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { InstantSearch } from '../../../types';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

describe('connectSearchBox', () => {
  const getInitializedWidget = (config = {}) => {
    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const widget = makeWidget({
      ...config,
    });

    const initialConfig = {};
    const helper = algoliasearchHelper(createSearchClient(), '', initialConfig);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const { refine } = renderFn.mock.calls[0][0];

    return [widget, helper, refine];
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectSearchBox()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/search-box/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customSearchBox = connectSearchBox(render, unmount);
      const widget = customSearchBox({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.searchBox',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
          getRenderState: expect.any(Function),
          getWidgetRenderState: expect.any(Function),
          getWidgetUiState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const queryHook = jest.fn();
    const widget = makeWidget({
      queryHook,
    });

    const helper = algoliasearchHelper(createSearchClient(), '');
    helper.search = () => helper;

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: '',
        widgetParams: { queryHook },
      }),
      true
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: '',
        widgetParams: { queryHook },
      }),
      false
    );
  });

  it('Provides a function to update the refinements at each step', () => {
    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    {
      const { refine, query } = renderFn.mock.calls[0][0];
      expect(helper.state.query).toBeUndefined();
      expect(query).toBe('');
      refine('bip');
      expect(helper.state.query).toBe('bip');
      expect(helper.search).toHaveBeenCalledTimes(1);
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '', {
      query: 'bup',
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    {
      expect(helper.state.query).toBe('bup');
      const { refine, clear } = renderFn.mock.calls[0][0];
      clear(); // triggers a search
      expect(helper.state.query).toBe('');
      expect(helper.search).toHaveBeenCalledTimes(1);
      refine('bip'); // triggers a search
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const helper = algoliasearchHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

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

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

  // eslint-disable-next-line jest/no-done-callback
  it('provides the same `refine` and `clear` function references', done => {
    const initRenderState: Record<string, any> = {};
    const createSearchBox = connectSearchBox(
      ({ refine, clear }, isFirstRender) => {
        if (isFirstRender) {
          initRenderState.refine = refine;
          initRenderState.clear = clear;
        } else {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(refine).toBe(initRenderState.refine);
          // eslint-disable-next-line jest/no-conditional-expect
          expect(clear).toBe(initRenderState.clear);
          done();
        }
      }
    );
    const search = new InstantSearch({
      searchClient: createSearchClient(),
      indexName: 'indexName',
    });

    search.addWidgets([createSearchBox({})]);
    search.start();
  });

  it('should clear on init as well', () => {
    const renderFn = jest.fn();
    const makeWidget = connectSearchBox(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '');
    helper.search = jest.fn();
    helper.setQuery('foobar');

    expect(helper.state.query).toBe('foobar');

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const { clear } = renderFn.mock.calls[0][0];
    clear();

    expect(helper.state.query).toBe('');
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  describe('getRenderState', () => {
    test('returns the render state with default render options', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const queryHook = jest.fn();
      const createSearchBox = connectSearchBox(renderFn, unmountFn);
      const searchBox = createSearchBox({
        queryHook,
      });

      const renderState1 = searchBox.getRenderState({}, createInitOptions());

      expect(renderState1.searchBox).toEqual({
        clear: expect.any(Function),
        isSearchStalled: false,
        query: '',
        refine: expect.any(Function),
        widgetParams: { queryHook },
      });

      searchBox.init!(createInitOptions());

      const renderState2 = searchBox.getRenderState({}, createRenderOptions());

      expect(renderState2.searchBox).toEqual({
        clear: renderState1.searchBox!.clear,
        isSearchStalled: false,
        query: '',
        refine: renderState1.searchBox!.refine,
        widgetParams: {
          queryHook,
        },
      });
    });

    test('returns the render state with a query', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createSearchBox = connectSearchBox(renderFn, unmountFn);
      const searchBox = createSearchBox({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        query: 'query',
      });

      searchBox.init!(createInitOptions());

      const renderState = searchBox.getRenderState(
        {},
        createRenderOptions({ helper })
      );

      expect(renderState.searchBox).toEqual({
        clear: expect.any(Function),
        isSearchStalled: false,
        query: 'query',
        refine: expect.any(Function),
        widgetParams: {},
      });
    });

    test('returns the render state with stalled search', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createSearchBox = connectSearchBox(renderFn, unmountFn);
      const searchBox = createSearchBox({});

      searchBox.init!(createInitOptions());

      const renderState = searchBox.getRenderState(
        {},
        createRenderOptions({ searchMetadata: { isSearchStalled: true } })
      );

      expect(renderState.searchBox).toEqual({
        clear: expect.any(Function),
        isSearchStalled: true,
        query: '',
        refine: expect.any(Function),
        widgetParams: {},
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state with default render options', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const queryHook = jest.fn();
      const createSearchBox = connectSearchBox(renderFn, unmountFn);
      const searchBox = createSearchBox({
        queryHook,
      });

      const renderState1 = searchBox.getWidgetRenderState(createInitOptions());

      expect(renderState1).toEqual({
        clear: expect.any(Function),
        isSearchStalled: false,
        query: '',
        refine: expect.any(Function),
        widgetParams: { queryHook },
      });

      searchBox.init!(createInitOptions());
      const renderState2 = searchBox.getWidgetRenderState(
        createRenderOptions()
      );
      expect(renderState2).toEqual({
        clear: renderState2.clear,
        isSearchStalled: false,
        query: '',
        refine: expect.any(Function),
        widgetParams: {
          queryHook,
        },
      });

      searchBox.render!(createRenderOptions());
      const renderState3 = searchBox.getWidgetRenderState(
        createRenderOptions()
      );
      expect(renderState3.clear).toBe(renderState2.clear);
    });

    test('returns the widget render state with a query', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createSearchBox = connectSearchBox(renderFn, unmountFn);
      const searchBox = createSearchBox({});
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        query: 'query',
      });

      searchBox.init!(createInitOptions());

      const renderState = searchBox.getWidgetRenderState(
        createRenderOptions({ helper })
      );

      expect(renderState).toEqual({
        clear: expect.any(Function),
        isSearchStalled: false,
        query: 'query',
        refine: expect.any(Function),
        widgetParams: {},
      });
    });

    test('returns the widget render state with stalled search', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createSearchBox = connectSearchBox(renderFn, unmountFn);
      const searchBox = createSearchBox({});

      searchBox.init!(createInitOptions());

      const renderState = searchBox.getWidgetRenderState(
        createRenderOptions({ searchMetadata: { isSearchStalled: true } })
      );

      expect(renderState).toEqual({
        clear: expect.any(Function),
        isSearchStalled: true,
        query: '',
        refine: expect.any(Function),
        widgetParams: {},
      });
    });
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectSearchBox(renderFn, unmountFn);
      const widget = makeWidget({});

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const makeWidget = connectSearchBox(renderFn);
      const widget = makeWidget({});

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('removes the `query` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper(createSearchClient(), '', {
        query: 'Apple',
      });

      const renderFn = () => {};
      const makeWidget = connectSearchBox(renderFn);
      const widget = makeWidget({});

      expect(helper.state.query).toBe('Apple');

      const nextState = widget.dispose!(
        createDisposeOptions({
          helper,
          state: helper.state,
        })
      ) as SearchParameters;

      expect(nextState.query).toBeUndefined();
    });
  });

  describe('getWidgetUiState', () => {
    test('should give back the object unmodified if the default value is selected', () => {
      const [widget, helper] = getInitializedWidget();
      const uiStateBefore = {};
      const uiStateAfter = widget.getWidgetUiState(uiStateBefore, {
        searchParameters: helper.state,
        helper,
      });
      expect(uiStateAfter).toBe(uiStateBefore);
    });

    test('should add an entry equal to the refinement', () => {
      const [widget, helper, refine] = getInitializedWidget();
      refine('some query');
      const uiStateBefore = {};
      const uiStateAfter = widget.getWidgetUiState(uiStateBefore, {
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
      const uiStateBefore = widget.getWidgetUiState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );
      const uiStateAfter = widget.getWidgetUiState(uiStateBefore, {
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
      const [widget, helper] = getInitializedWidget();

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

    test('overrides the `SearchParameters` with the default value', () => {
      const [widget, helper] = getInitializedWidget();

      helper.setQuery('samba dancing for pros');

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
          query: 'samba dancing for pros',
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
});
