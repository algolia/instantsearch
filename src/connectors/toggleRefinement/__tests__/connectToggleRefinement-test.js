import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectToggleRefinement from '../connectToggleRefinement';

describe('connectToggleRefinement', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectToggleRefinement()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/toggle-refinement/js/#connector"
`);
    });

    it('throws without attribute option', () => {
      expect(() => {
        connectToggleRefinement(() => {})({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attribute\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/toggle-refinement/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customToggleRefinement = connectToggleRefinement(render, unmount);
      const widget = customToggleRefinement({ attribute: 'facet' });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.toggleRefinement',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
          getConfiguration: expect.any(Function),
          getWidgetState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectToggleRefinement(rendering);

    const attribute = 'isShippingFree';
    const widget = makeWidget({
      attribute,
    });

    const config = widget.getConfiguration();
    expect(config).toEqual({
      disjunctiveFacets: [attribute],
    });

    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering).toHaveBeenCalledTimes(1);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const { value, widgetParams } = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ][0];
      expect(value).toEqual({
        name: 'isShippingFree',
        count: null,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          isRefined: false,
          count: 0,
        },
      });

      expect(widgetParams).toEqual({
        attribute,
      });
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
              true: 45,
              false: 40,
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering).toHaveBeenCalledTimes(2);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const { value } = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ][0];
      expect(value).toEqual({
        name: 'isShippingFree',
        count: 45,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 45,
        },
        offFacetValue: {
          isRefined: false,
          count: 85,
        },
      });
    }
  });

  it('Provides a function to add/remove a facet value', () => {
    const rendering = jest.fn();
    const makeWidget = connectToggleRefinement(rendering);

    const attribute = 'isShippingFree';
    const widget = makeWidget({
      attribute,
    });

    const helper = jsHelper({}, '', widget.getConfiguration());
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      // first rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual(
        undefined
      );
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: 'isShippingFree',
        count: null,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          isRefined: false,
          count: 0,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
      refine({ isRefined: !value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([]);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
              true: 45,
              false: 40,
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Second rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: 'isShippingFree',
        count: 45,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 45,
        },
        offFacetValue: {
          isRefined: false,
          count: 85,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
              true: 45,
            },
          },
          nbHits: 85,
        },
        {
          facets: {
            isShippingFree: {
              true: 45,
              false: 40,
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Third rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: 'isShippingFree',
        count: 85,
        isRefined: true,
        onFacetValue: {
          isRefined: true,
          count: 45,
        },
        offFacetValue: {
          isRefined: false,
          count: 85,
        },
      });
      refine(value);
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([]);
    }
  });

  it('Provides a function to toggle between two values', () => {
    const rendering = jest.fn();
    const makeWidget = connectToggleRefinement(rendering);

    const attribute = 'isShippingFree';
    const widget = makeWidget({
      attribute,
      on: 'true',
      off: 'false',
    });

    const helper = jsHelper({}, '', widget.getConfiguration());
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      // first rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'false',
      ]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;

      expect(value).toEqual({
        name: 'isShippingFree',
        count: null,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          isRefined: true,
          count: 0,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
      refine({ isRefined: !value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'false',
      ]);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
              false: 40,
            },
          },
          nbHits: 40,
        },
        {
          facets: {
            isShippingFree: {
              true: 45,
              false: 40,
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Second rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'false',
      ]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        // the value is the one that is not selected
        name: 'isShippingFree',
        count: 45,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 45,
        },
        offFacetValue: {
          isRefined: true,
          count: 40,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            isShippingFree: {
              true: 45,
            },
          },
          nbHits: 85,
        },
        {
          facets: {
            isShippingFree: {
              true: 45,
              false: 40,
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Third rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: 'isShippingFree',
        count: 40,
        isRefined: true,
        onFacetValue: {
          isRefined: true,
          count: 45,
        },
        offFacetValue: {
          isRefined: false,
          count: 40,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'false',
      ]);
    }
  });

  it('sets user-provided "off" value by default (falsy)', () => {
    const makeWidget = connectToggleRefinement(() => {});
    const widget = makeWidget({
      attribute: 'whatever',
      off: false,
    });

    const helper = jsHelper({}, '', widget.getConfiguration());
    widget.init({ helper, state: helper.state });

    expect(helper.state.disjunctiveFacetsRefinements).toEqual(
      expect.objectContaining({
        whatever: ['false'],
      })
    );
  });

  it('sets user-provided "off" value by default (truthy)', () => {
    const makeWidget = connectToggleRefinement(() => {});
    const widget = makeWidget({
      attribute: 'whatever',
      off: true,
    });

    const helper = jsHelper({}, '', widget.getConfiguration());
    widget.init({ helper, state: helper.state });

    expect(helper.state.disjunctiveFacetsRefinements).toEqual(
      expect.objectContaining({
        whatever: ['true'],
      })
    );
  });

  it('sets user-provided "on" value on refine (falsy)', () => {
    let caughtRefine;
    const makeWidget = connectToggleRefinement(({ refine }) => {
      caughtRefine = refine;
    });
    const widget = makeWidget({
      attribute: 'whatever',
      on: false,
    });

    const helper = jsHelper({ search() {} }, '', widget.getConfiguration());
    helper.search = jest.fn();

    widget.init({ helper, state: helper.state });

    expect(helper.state.disjunctiveFacetsRefinements).toEqual({});

    widget.render({
      results: new SearchResults(helper.state, [
        {
          facets: {
            whatever: {
              true: 45,
              false: 40,
            },
          },
          nbHits: 85,
        },
      ]),
      state: helper.state,
      helper,
    });

    // toggle the value
    caughtRefine();

    expect(helper.state.disjunctiveFacetsRefinements).toEqual(
      expect.objectContaining({
        whatever: ['false'],
      })
    );
  });

  describe('routing', () => {
    const getInitializedWidget = (config = {}) => {
      const rendering = jest.fn();
      const makeWidget = connectToggleRefinement(rendering);

      const attribute = 'isShippingFree';
      const widget = makeWidget({
        attribute,
        ...config,
      });

      const initialConfig = widget.getConfiguration({});
      const helper = jsHelper({}, '', initialConfig);
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      const { refine } = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ][0];

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
        refine({ isRefined: false }); // refinement is based on the previous value (the one passed)
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });
        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should return the same UI state if the value if the refinement is the same', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine({ isRefined: false });
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
      test('should return the same SP if no value is in the UI state (one value)', () => {
        const [widget, helper] = getInitializedWidget();
        const uiState = {};
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should enforce the default value if no value is in the UI state (two values)', () => {
        const [widget, helper] = getInitializedWidget({
          on: 'free-shipping',
          off: 'paid-shipping',
        });
        const uiState = {};
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should remove the refinement (one value)', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine({ isRefined: false });
        const uiState = {};
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toMatchSnapshot();
      });

      test('should update the SP base on the UI state (two values)', () => {
        const [widget, helper, refine] = getInitializedWidget({
          on: 'free-shipping',
          off: 'paid-shipping',
        });
        refine({ isRefined: false });
        const uiState = {};
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toMatchSnapshot();
      });

      test('should update the SP base on the UI state - toggled (two values)', () => {
        const [widget, helper] = getInitializedWidget({
          on: 'free-shipping',
          off: 'paid-shipping',
        });
        const uiState = {
          toggle: {
            isShippingFree: true,
          },
        };
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
