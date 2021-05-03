import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';

import connectPagination, {
  PaginationConnectorParams,
  PaginationRenderState,
} from '../connectPagination';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

describe('connectPagination', () => {
  const getInitializedWidget = (
    widgetParams: PaginationConnectorParams = {}
  ) => {
    const renderFn = jest.fn<any, [PaginationRenderState, boolean]>();
    const makeWidget = connectPagination(renderFn);
    const widget = makeWidget(widgetParams);

    const helper = algoliasearchHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    const { refine } = renderFn.mock.calls[0][0];

    return [widget, helper, refine] as const;
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-ignore
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

          getWidgetUiState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });
  });

  it('connectPagination - Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectPagination(renderFn);
    const widget = makeWidget({
      // @ts-ignore
      foo: 'bar',
    });

    const helper = algoliasearchHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

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

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [{ objectID: '', test: 'oneTime' }],
            nbHits: 1,
            nbPages: 1,
            page: 0,
          }),
        ]),
        helper,
        createURL: () => '#',
      })
    );

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
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
      })
    );

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { refine } = renderOptions;
      refine(2);
      expect(helper.state.page).toBe(2);
      expect(helper.search).toHaveBeenCalledTimes(1);
    }

    widget.render!(
      createRenderOptions({
        helper,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            nbPages: 250,
          }),
        ]),
      })
    );

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
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    // page 0
    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ nbPages: 50 }),
        ]),
        helper,
      })
    );

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([0, 1, 2, 3, 4, 5, 6]);
    }

    helper.setPage(5);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ nbPages: 50 }),
        ]),
        helper,
      })
    );

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([2, 3, 4, 5, 6, 7, 8]);
    }

    // Last page
    helper.setPage(49);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ nbPages: 50 }),
        ]),
        helper,
      })
    );

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

    const helper = algoliasearchHelper(createSearchClient(), '');

    widget.init!(createInitOptions({ helper }));

    widget.render!(
      createRenderOptions({
        helper,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ nbPages: 50 }),
        ]),
      })
    );

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    helper.setPage(5);

    widget.render!(
      createRenderOptions({
        helper,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ nbPages: 50 }),
        ]),
      })
    );

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    // Last page
    helper.setPage(49);

    widget.render!(
      createRenderOptions({
        helper,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ nbPages: 50 }),
        ]),
      })
    );

    {
      const renderOptions =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      const { pages } = renderOptions;
      expect(pages).toEqual([39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]);
    }
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectPagination(renderFn, unmountFn);
      const widget = makeWidget({});

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), '');

      const renderFn = () => {};
      const makeWidget = connectPagination(renderFn);
      const widget = makeWidget({});

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('removes the `page` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper(createSearchClient(), '', {
        page: 5,
      });

      const renderFn = () => {};
      const makeWidget = connectPagination(renderFn);
      const widget = makeWidget({});

      expect(helper.state.page).toBe(5);

      const nextState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      );

      // error used for typescript
      if (!nextState) {
        throw new Error('expect state to be returned');
      }

      expect(nextState.page).toBeUndefined();
    });
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` empty', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetUiState!(
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

      const actual = widget.getWidgetUiState!(
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

  describe('getWidgetRenderState', () => {
    it('gives default values for init', () => {
      const [widget] = getInitializedWidget();

      expect(widget.getWidgetRenderState(createInitOptions())).toEqual({
        currentRefinement: 0,
        isFirstPage: true,
        isLastPage: true,
        nbHits: 0,
        nbPages: 0,
        pages: [],
        createURL: expect.any(Function),
        refine: expect.any(Function),
        canRefine: false,
        widgetParams: {},
      });
    });

    it('passes widgetParams', () => {
      const [widget] = getInitializedWidget({ padding: 5 });

      expect(widget.getWidgetRenderState(createInitOptions())).toEqual({
        currentRefinement: 0,
        isFirstPage: true,
        isLastPage: true,
        nbHits: 0,
        nbPages: 0,
        pages: [],
        createURL: expect.any(Function),
        refine: expect.any(Function),
        canRefine: false,
        widgetParams: { padding: 5 },
      });
    });

    it('gives values with a result', () => {
      const [widget] = getInitializedWidget({ padding: 5 });

      expect(
        widget.getWidgetRenderState(
          createRenderOptions({
            results: new SearchResults(new SearchParameters(), [
              createSingleSearchResponse({
                nbHits: 2000,
              }),
            ]),
          })
        )
      ).toEqual({
        currentRefinement: 0,
        isFirstPage: true,
        isLastPage: false,
        nbHits: 2000,
        nbPages: 100,
        pages: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        createURL: expect.any(Function),
        refine: expect.any(Function),
        canRefine: true,
        widgetParams: { padding: 5 },
      });
    });

    it('gives values with a result at middle page', () => {
      const [widget] = getInitializedWidget({ padding: 5 });

      const helper = algoliasearchHelper(createSearchClient(), '', {
        page: 20,
      });

      expect(
        widget.getWidgetRenderState(
          createRenderOptions({
            helper,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({
                nbHits: 2000,
                page: 20,
              }),
            ]),
          })
        )
      ).toEqual({
        currentRefinement: 20,
        isFirstPage: false,
        isLastPage: false,
        nbHits: 2000,
        nbPages: 100,
        pages: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
        createURL: expect.any(Function),
        refine: expect.any(Function),
        canRefine: true,
        widgetParams: { padding: 5 },
      });
    });

    it('gives values with a result at last page', () => {
      const [widget] = getInitializedWidget({ padding: 5 });

      const helper = algoliasearchHelper(createSearchClient(), '', {
        page: 99,
      });

      expect(
        widget.getWidgetRenderState(
          createRenderOptions({
            helper,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({
                nbHits: 2000,
                page: 99,
              }),
            ]),
          })
        )
      ).toEqual({
        currentRefinement: 99,
        isFirstPage: false,
        isLastPage: true,
        nbHits: 2000,
        nbPages: 100,
        pages: [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
        createURL: expect.any(Function),
        refine: expect.any(Function),
        canRefine: true,
        widgetParams: { padding: 5 },
      });
    });

    it('gives the same `refine` reference on multiple calls', () => {
      const [widget] = getInitializedWidget();

      const refine1 = widget.getWidgetRenderState(createInitOptions()).refine;
      const refine2 = widget.getWidgetRenderState(createInitOptions()).refine;

      expect(refine2).toBe(refine1);
    });

    it('gives `canRefine` as false for a single page', () => {
      const [widget] = getInitializedWidget();

      const { canRefine } = widget.getWidgetRenderState(
        createRenderOptions({
          results: new SearchResults(new SearchParameters(), [
            createSingleSearchResponse({ nbPages: 1 }),
          ]),
        })
      );

      expect(canRefine).toBe(false);
    });

    it('gives `canRefine` as true for a multiple pages', () => {
      const [widget] = getInitializedWidget();

      const { canRefine } = widget.getWidgetRenderState(
        createRenderOptions({
          results: new SearchResults(new SearchParameters(), [
            createSingleSearchResponse({ nbPages: 2 }),
          ]),
        })
      );

      expect(canRefine).toBe(true);
    });
  });

  describe('getRenderState', () => {
    it('merges state', () => {
      const [widget] = getInitializedWidget({ padding: 5 });

      const helper = algoliasearchHelper(createSearchClient(), '', {
        page: 20,
      });

      expect(
        widget.getRenderState(
          {
            hierarchicalMenu: {},
            // @ts-ignore
            pagination: {},
          },
          createRenderOptions({
            helper,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({
                nbHits: 2000,
                page: 20,
              }),
            ]),
          })
        )
      ).toEqual({
        hierarchicalMenu: {},
        pagination: {
          currentRefinement: 20,
          isFirstPage: false,
          isLastPage: false,
          nbHits: 2000,
          nbPages: 100,
          pages: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
          createURL: expect.any(Function),
          refine: expect.any(Function),
          canRefine: true,
          widgetParams: { padding: 5 },
        },
      });
    });
  });
});
