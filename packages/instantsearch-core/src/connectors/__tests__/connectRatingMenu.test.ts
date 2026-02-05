/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { createInstantSearch } from 'instantsearch-core/test/createInstantSearch';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from 'instantsearch-core/test/createWidget';

import { connectRatingMenu } from '../..';

describe('connectRatingMenu', () => {
  const getInitializedWidget = (config = {}, unmount = () => {}) => {
    const rendering = jest.fn();
    const makeWidget = connectRatingMenu(rendering, unmount);
    const instantSearchInstance = createInstantSearch();

    const attribute = 'grade';
    const widget = makeWidget({
      attribute,
      ...config,
    });

    const initialConfig = widget.getWidgetSearchParameters(
      new SearchParameters({}),
      { uiState: {} }
    );
    const helper = jsHelper(createSearchClient(), '', initialConfig);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
        instantSearchInstance,
      })
    );

    const { refine } = rendering.mock.calls[0][0];

    return { widget, helper, refine, rendering, instantSearchInstance };
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectRatingMenu()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/rating-menu/js/#connector"
`);
    });

    it('throws without attribute', () => {
      expect(() => {
        // @ts-expect-error
        connectRatingMenu(() => {})({ attribute: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attribute\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/rating-menu/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customRatingMenu = connectRatingMenu(render, unmount);
      const widget = customRatingMenu({ attribute: 'facet' });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.ratingMenu',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
          getWidgetUiState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });
  });

  it('Renders during init and render', () => {
    const attribute = 'grade';
    const { widget, helper, rendering } = getInitializedWidget({ attribute });

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering).toHaveBeenCalledTimes(1);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const { items, widgetParams } =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(items).toEqual([]);
      expect(widgetParams).toEqual({ attribute });
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              [attribute]: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
            },
          }),
          createSingleSearchResponse({}),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering).toHaveBeenCalledTimes(2);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const { items } =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(items).toEqual([
        {
          count: 1000,
          isRefined: false,
          label: '4',
          name: '4',
          value: '4',
          stars: [true, true, true, true, false],
        },
        {
          count: 1050,
          isRefined: false,
          label: '3',
          name: '3',
          value: '3',
          stars: [true, true, true, false, false],
        },
        {
          count: 1070,
          isRefined: false,
          label: '2',
          name: '2',
          value: '2',
          stars: [true, true, false, false, false],
        },
        {
          count: 1080,
          isRefined: false,
          label: '1',
          name: '1',
          value: '1',
          stars: [true, false, false, false, false],
        },
      ]);
    }
  });

  it('Provides a function to update the index at each step', () => {
    const attribute = 'swag';
    const { rendering, helper, widget, refine } = getInitializedWidget({
      attribute,
    });

    // first rendering
    expect(helper.state.getNumericRefinements(attribute)).toEqual({});
    refine('3');
    expect(helper.state.getNumericRefinements(attribute)).toEqual({
      '<=': [5],
      '>=': [3],
    });
    expect(helper.search).toHaveBeenCalledTimes(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              [attribute]: { 3: 50, 4: 900, 5: 100 },
            },
          }),
          createSingleSearchResponse({
            facets: {
              [attribute]: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    {
      // Second rendering
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { items } = renderOptions;
      expect(items).toEqual([
        {
          count: 1000,
          isRefined: false,
          label: '4',
          name: '4',
          value: '4',
          stars: [true, true, true, true, false],
        },
        {
          count: 1050,
          isRefined: true,
          label: '3',
          name: '3',
          value: '3',
          stars: [true, true, true, false, false],
        },
        {
          count: 1070,
          isRefined: false,
          label: '2',
          name: '2',
          value: '2',
          stars: [true, true, false, false, false],
        },
        {
          count: 1080,
          isRefined: false,
          label: '1',
          name: '1',
          value: '1',
          stars: [true, false, false, false, false],
        },
      ]);
      expect(helper.state.getNumericRefinements(attribute)).toEqual({
        '<=': [5],
        '>=': [3],
      });
      refine('4');
      expect(helper.state.getNumericRefinements(attribute)).toEqual({
        '<=': [5],
        '>=': [4],
      });
      expect(helper.search).toHaveBeenCalledTimes(2);
    }
  });

  it('empties the refinements if called with the same value', () => {
    const attribute = 'swag';
    const { helper, widget, refine } = getInitializedWidget({
      attribute,
    });

    // First rendering
    expect(helper.state.getNumericRefinements(attribute)).toEqual({});
    refine('3');
    expect(helper.state.getNumericRefinements(attribute)).toEqual({
      '<=': [5],
      '>=': [3],
    });
    expect(helper.search).toHaveBeenCalledTimes(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              [attribute]: { 3: 50, 4: 900, 5: 100 },
            },
          }),
          createSingleSearchResponse({
            facets: {
              [attribute]: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
            },
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    // Second rendering
    expect(helper.state.getNumericRefinements(attribute)).toEqual({
      '<=': [5],
      '>=': [3],
    });
    refine('3');
    expect(helper.state.getNumericRefinements(attribute)).toEqual({
      '<=': [],
      '>=': [],
    });
    expect(helper.state.numericRefinements).toEqual({
      [attribute]: { '<=': [], '>=': [] },
    });
    expect(helper.search).toHaveBeenCalledTimes(2);
  });

  describe('dispose', () => {
    it('calls unmount function', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const widget = connectRatingMenu(render, unmount)({ attribute: 's' });

      widget.dispose!(createDisposeOptions());

      expect(unmount).toHaveBeenCalled();
    });

    it('does not throw without the unmount function', () => {
      const render = () => {};
      const widget = connectRatingMenu(render)({ attribute: 's' });
      expect(() => widget.dispose!(createDisposeOptions())).not.toThrow();
    });
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` empty', () => {
      const render = () => {};
      const makeWidget = connectRatingMenu(render);
      const helper = jsHelper(createSearchClient(), '');
      const widget = makeWidget({
        attribute: 'grade',
      });

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
      const render = () => {};
      const makeWidget = connectRatingMenu(render);
      const helper = jsHelper(createSearchClient(), '', {
        disjunctiveFacets: ['grade'],
        numericRefinements: {
          grade: {
            '>=': [2],
          },
        },
      });

      const widget = makeWidget({
        attribute: 'grade',
      });

      const actual = widget.getWidgetUiState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        ratingMenu: {
          grade: 2,
        },
      });
    });

    test('returns the `uiState` without namespace overridden', () => {
      const render = () => {};
      const makeWidget = connectRatingMenu(render);
      const helper = jsHelper(createSearchClient(), '', {
        disjunctiveFacets: ['grade'],
        numericRefinements: {
          grade: {
            '>=': [2],
          },
        },
      });

      const widget = makeWidget({
        attribute: 'grade',
      });

      const actual = widget.getWidgetUiState(
        {
          ratingMenu: {
            rating: 4,
          },
        },
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        ratingMenu: {
          grade: 2,
          rating: 4,
        },
      });
    });
  });

  describe('getRenderState', () => {
    it('returns the render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRatingMenu = connectRatingMenu(renderFn, unmountFn);
      const ratingMenuWidget = createRatingMenu({
        attribute: 'grade',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['grade'],
        numericRefinements: {
          grade: {
            '>=': [2],
          },
        },
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = ratingMenuWidget.getRenderState({}, initOptions);

      expect(renderState1.ratingMenu).toEqual({
        grade: {
          items: [],
          createURL: expect.any(Function),
          canRefine: false,
          refine: expect.any(Function),
          sendEvent: expect.any(Function),
          widgetParams: {
            attribute: 'grade',
          },
        },
      });
    });

    it('returns the render state with results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRatingMenu = connectRatingMenu(renderFn, unmountFn);
      const ratingMenuWidget = createRatingMenu({
        attribute: 'grade',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['grade'],
        numericRefinements: {
          grade: {
            '>=': [2],
          },
        },
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = ratingMenuWidget.getRenderState({}, initOptions);

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({
          facets: {
            grade: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
          },
        }),
      ]);

      const renderOptions = createRenderOptions({
        helper,
        state: helper.state,
        results,
      });

      const renderState2 = ratingMenuWidget.getRenderState({}, renderOptions);

      expect(renderState2.ratingMenu).toEqual({
        grade: {
          items: [
            {
              count: 1000,
              isRefined: false,
              label: '4',
              name: '4',
              stars: [true, true, true, true, false],
              value: '4',
            },
            {
              count: 1050,
              isRefined: false,
              label: '3',
              name: '3',
              stars: [true, true, true, false, false],
              value: '3',
            },
            {
              count: 1070,
              isRefined: true,
              label: '2',
              name: '2',
              stars: [true, true, false, false, false],
              value: '2',
            },
            {
              count: 1080,
              isRefined: false,
              label: '1',
              name: '1',
              stars: [true, false, false, false, false],
              value: '1',
            },
          ],
          createURL: expect.any(Function),
          canRefine: true,
          refine: expect.any(Function),
          sendEvent: renderState1.ratingMenu.grade.sendEvent,
          widgetParams: {
            attribute: 'grade',
          },
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRatingMenu = connectRatingMenu(renderFn, unmountFn);
      const ratingMenuWidget = createRatingMenu({
        attribute: 'grade',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['grade'],
        numericRefinements: {
          grade: {
            '>=': [2],
          },
        },
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = ratingMenuWidget.getWidgetRenderState(initOptions);

      expect(renderState1).toEqual({
        items: [],
        createURL: expect.any(Function),
        canRefine: false,
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        widgetParams: {
          attribute: 'grade',
        },
      });
    });

    it('returns the widget render state with results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRatingMenu = connectRatingMenu(renderFn, unmountFn);
      const ratingMenuWidget = createRatingMenu({
        attribute: 'grade',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['grade'],
        numericRefinements: {
          grade: {
            '>=': [2],
          },
        },
      });

      const initOptions = createInitOptions({ state: helper.state, helper });

      const renderState1 = ratingMenuWidget.getWidgetRenderState(initOptions);

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({
          facets: {
            grade: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
          },
        }),
      ]);

      const renderOptions = createRenderOptions({
        helper,
        state: helper.state,
        results,
      });

      const renderState2 = ratingMenuWidget.getWidgetRenderState(renderOptions);

      expect(renderState2).toEqual({
        items: [
          {
            count: 1000,
            isRefined: false,
            label: '4',
            name: '4',
            stars: [true, true, true, true, false],
            value: '4',
          },
          {
            count: 1050,
            isRefined: false,
            label: '3',
            name: '3',
            stars: [true, true, true, false, false],
            value: '3',
          },
          {
            count: 1070,
            isRefined: true,
            label: '2',
            name: '2',
            stars: [true, true, false, false, false],
            value: '2',
          },
          {
            count: 1080,
            isRefined: false,
            label: '1',
            name: '1',
            stars: [true, false, false, false, false],
            value: '1',
          },
        ],
        createURL: expect.any(Function),
        canRefine: true,
        refine: expect.any(Function),
        sendEvent: renderState1.sendEvent,
        widgetParams: {
          attribute: 'grade',
        },
      });
    });

    it('returns the widget render state with no items without throwing an error', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRatingMenu = connectRatingMenu(renderFn, unmountFn);
      const ratingMenuWidget = createRatingMenu({
        attribute: 'grade',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: [],
      });

      const initOptions = createInitOptions({ state: helper.state, helper });
      const renderState1 = ratingMenuWidget.getWidgetRenderState(initOptions);

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({
          facets: { grade: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 } },
        }),
      ]);

      const renderOptions = createRenderOptions({
        helper,
        state: helper.state,
        results,
      });
      const renderState2 = ratingMenuWidget.getWidgetRenderState(renderOptions);

      expect(renderState2).toEqual({
        items: [],
        createURL: expect.any(Function),
        canRefine: false,
        refine: expect.any(Function),
        sendEvent: renderState1.sendEvent,
        widgetParams: {
          attribute: 'grade',
        },
      });
    });

    describe('canRefine', () => {
      it('returns `true` if there are no results but a refinement is applied and total facet count is higher than 0', () => {
        const renderFn = jest.fn();
        const unmountFn = jest.fn();
        const createRatingMenu = connectRatingMenu(renderFn, unmountFn);
        const ratingMenuWidget = createRatingMenu({
          attribute: 'grade',
        });
        const helper = jsHelper(createSearchClient(), 'indexName', {
          disjunctiveFacets: ['grade'],
          numericRefinements: {
            grade: {
              '>=': [2],
            },
          },
        });

        const results = new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              grade: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
            },
          }),
        ]);

        const renderOptions = createRenderOptions({
          helper,
          state: helper.state,
          results,
        });

        const renderState =
          ratingMenuWidget.getWidgetRenderState(renderOptions);

        expect(renderState.canRefine).toBe(true);
      });

      it('returns `false`  if there are no results and no refinement is applied', () => {
        const renderFn = jest.fn();
        const unmountFn = jest.fn();
        const createRatingMenu = connectRatingMenu(renderFn, unmountFn);
        const ratingMenuWidget = createRatingMenu({
          attribute: 'grade',
        });
        const helper = jsHelper(createSearchClient(), 'indexName', {
          disjunctiveFacets: ['grade'],
        });

        const results = new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              grade: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
            },
          }),
        ]);

        const renderOptions = createRenderOptions({
          helper,
          state: helper.state,
          results,
        });

        const renderState =
          ratingMenuWidget.getWidgetRenderState(renderOptions);

        expect(renderState.canRefine).toBe(false);
      });

      it('returns `false` if there are no results and a refinement is applied but total facet count is 0', () => {
        const renderFn = jest.fn();
        const unmountFn = jest.fn();
        const createRatingMenu = connectRatingMenu(renderFn, unmountFn);
        const ratingMenuWidget = createRatingMenu({
          attribute: 'grade',
        });
        const helper = jsHelper(createSearchClient(), 'indexName', {
          disjunctiveFacets: ['grade'],
        });

        const results = new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              grade: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            },
          }),
        ]);

        const renderOptions = createRenderOptions({
          helper,
          state: helper.state,
          results,
        });

        const renderState =
          ratingMenuWidget.getWidgetRenderState(renderOptions);

        expect(renderState.canRefine).toBe(false);
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('returns the `SearchParameters` with the default value', () => {
      const render = () => {};
      const makeWidget = connectRatingMenu(render);
      const helper = jsHelper(createSearchClient(), '');
      const widget = makeWidget({
        attribute: 'grade',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          disjunctiveFacets: ['grade'],
          numericRefinements: {
            grade: {},
          },
        })
      );
    });

    test('returns the `SearchParameters` without the previous value', () => {
      const render = () => {};
      const makeWidget = connectRatingMenu(render);
      const helper = jsHelper(createSearchClient(), '', {
        numericRefinements: {
          grade: {
            '>=': [2],
          },
        },
      });

      const widget = makeWidget({
        attribute: 'grade',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          disjunctiveFacets: ['grade'],
          numericRefinements: {
            grade: {},
          },
        })
      );
    });

    test('returns the `SearchParameters` with the value from `uiState`', () => {
      const render = () => {};
      const makeWidget = connectRatingMenu(render);
      const helper = jsHelper(createSearchClient(), '');
      const widget = makeWidget({
        attribute: 'grade',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          ratingMenu: {
            grade: 3,
          },
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          disjunctiveFacets: ['grade'],
          numericRefinements: {
            grade: {
              '<=': [5],
              '>=': [3],
            },
          },
        })
      );
    });

    test('returns the `SearchParameters` with the value from `uiState` without the previous refinement', () => {
      const render = () => {};
      const makeWidget = connectRatingMenu(render);
      const helper = jsHelper(createSearchClient(), '', {
        disjunctiveFacets: ['grade'],
        numericRefinements: {
          grade: {
            '>=': [1],
          },
        },
      });

      const widget = makeWidget({
        attribute: 'grade',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          ratingMenu: {
            grade: 3,
          },
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          disjunctiveFacets: ['grade'],
          numericRefinements: {
            grade: {
              '<=': [5],
              '>=': [3],
            },
          },
        })
      );
    });
  });

  describe('insights', () => {
    it('sends event when a facet is added', () => {
      const attribute = 'swag';
      const { refine, instantSearchInstance } = getInitializedWidget({
        attribute,
      });

      refine('3');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'swag',
        eventType: 'click',
        eventModifier: 'internal',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Filter Applied',
          filters: ['swag>=3'],
          index: '',
        },
        widgetType: 'ais.ratingMenu',
      });
    });

    it('does not send event when a facet is removed', () => {
      const attribute = 'swag';
      const { refine, instantSearchInstance } = getInitializedWidget({
        attribute,
      });

      refine('3');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );

      refine('3');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      ); // still the same

      refine('4');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        2
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'swag',
        eventType: 'click',
        eventModifier: 'internal',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Filter Applied',
          filters: ['swag>=4'],
          index: '',
        },
        widgetType: 'ais.ratingMenu',
      });
    });
  });
});
