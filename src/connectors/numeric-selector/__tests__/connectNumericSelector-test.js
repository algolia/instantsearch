import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';

import connectNumericSelector from '../connectNumericSelector.js';

describe('connectNumericSelector', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      { name: '10', value: 10 },
      { name: '20', value: 20 },
      { name: '30', value: 30 },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      options: listOptions,
    });

    const config = widget.getConfiguration({}, {});
    expect(config).toEqual({
      numericRefinements: {
        numerics: {
          '=': [listOptions[0].value],
        },
      },
    });

    // test if widget is not rendered yet at this point
    expect(rendering).not.toHaveBeenCalled();

    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering).toHaveBeenCalledTimes(1);
    // test if isFirstRendering is true during init
    expect(rendering).toHaveBeenLastCalledWith(expect.any(Object), true);

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.currentRefinement).toBe(listOptions[0].value);
    expect(firstRenderingOptions.widgetParams).toEqual({
      attribute: 'numerics',
      options: listOptions,
    });

    widget.render({
      results: new SearchResults(helper.state, [{ nbHits: 0 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(expect.any(Object), false);

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.currentRefinement).toBe(listOptions[0].value);
    expect(secondRenderingOptions.widgetParams).toEqual({
      attribute: 'numerics',
      options: listOptions,
    });
  });

  it('Renders during init and render with transformed items', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      { name: '10', value: 10 },
      { name: '20', value: 20 },
      { name: '30', value: 30 },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      options: listOptions,
      transformItems: items =>
        items.map(item => ({ ...item, label: 'transformed' })),
    });

    const config = widget.getConfiguration({}, {});

    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.options).toEqual([
      { name: '10', value: 10, label: 'transformed' },
      { name: '20', value: 20, label: 'transformed' },
      { name: '30', value: 30, label: 'transformed' },
    ]);

    widget.render({
      results: new SearchResults(helper.state, [{ nbHits: 0 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.options).toEqual([
      { name: '10', value: 10, label: 'transformed' },
      { name: '20', value: 20, label: 'transformed' },
      { name: '30', value: 30, label: 'transformed' },
    ]);
  });

  it('Reads the default value from the URL if possible', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      { name: '10', value: 10 },
      { name: '20', value: 20 },
      { name: '30', value: 30 },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      options: listOptions,
    });

    expect(widget.getConfiguration({}, {})).toEqual({
      numericRefinements: {
        numerics: {
          '=': [listOptions[0].value],
        },
      },
    });

    expect(
      widget.getConfiguration(
        {},
        {
          numericRefinements: {
            numerics: {
              '=': [30],
            },
          },
        }
      )
    ).toEqual({
      numericRefinements: {
        numerics: {
          '=': [30],
        },
      },
    });
  });

  it('Provide a function to update the refinements at each step', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      { name: '10', value: 10 },
      { name: '20', value: 20 },
      { name: '30', value: 30 },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      options: listOptions,
    });

    const config = widget.getConfiguration({}, {});
    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine } = firstRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [10],
    });
    refine(listOptions[1].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [20],
    });
    refine(listOptions[2].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [30],
    });
    refine(listOptions[0].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [10],
    });

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { refine: renderSetValue } = secondRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [10],
    });
    renderSetValue(listOptions[1].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [20],
    });
    renderSetValue(listOptions[2].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [30],
    });
    renderSetValue(listOptions[0].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [10],
    });
  });

  it('provides isRefined for the currently selected value', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      { name: '10', value: 10 },
      { name: '20', value: 20 },
      { name: '30', value: 30 },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      options: listOptions,
    });

    const config = widget.getConfiguration({}, {});
    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    let refine = rendering.mock.calls[0][0].refine;

    listOptions.forEach((_, i) => {
      // we loop with 1 increment because the first value is selected by default
      const currentOption = listOptions[(i + 1) % listOptions.length];
      refine(currentOption.name);

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      // The current option should be the one selected
      // First we copy and set the default added values
      const expectedResult = currentOption.value;

      const renderingParameters = rendering.mock.calls[1 + i][0];
      expect(renderingParameters.currentRefinement).toEqual(expectedResult);

      refine = renderingParameters.refine;
    });
  });

  it('The refine function can unselect with `undefined` and "undefined"', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      { name: '' },
      { name: '10', value: 10 },
      { name: '20', value: 20 },
      { name: '30', value: 30 },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      options: listOptions,
    });

    const config = widget.getConfiguration({}, {});
    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine } = firstRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
    refine(listOptions[1].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [10],
    });
    refine(listOptions[0].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const { refine: refineBis } = secondRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
    refineBis(listOptions[1].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [10],
    });
    refineBis(listOptions[0].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
  });

  describe('routing', () => {
    const getInitializedWidget = () => {
      const rendering = jest.fn();
      const makeWidget = connectNumericSelector(rendering);
      const listOptions = [
        { name: '10', value: 10 },
        { name: '20', value: 20 },
        { name: '30', value: 30 },
      ];
      const widget = makeWidget({
        attribute: 'numerics',
        options: listOptions,
      });

      const config = widget.getConfiguration({}, {});
      const helper = jsHelper({}, '', config);
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
      });

      const { refine } = rendering.mock.calls[0][0];

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
        refine(20);
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should not override other values in the same namespace', () => {
        const [widget, helper, refine] = getInitializedWidget();
        const uiStateBefore = {
          numericSelector: {
            'numerics-2': '36',
          },
        };

        refine(20);

        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should give back the object unmodified if refinements are already set', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          numericSelector: {
            numerics: 20,
          },
        };
        helper.addNumericRefinement('numerics', '=', 20);
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });
    });

    describe('getWidgetSearchParameters', () => {
      test('should enforce the default value if there are no refinements in the UI state', () => {
        const [widget, helper] = getInitializedWidget();
        // User presses back (browser) and the URL contains nothing
        const uiState = {};
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // The default parameters should be applied
        expect(searchParametersAfter).toMatchSnapshot();
      });

      test('should return the same SP if the value is the same in both UI State and SP', () => {
        const [widget, helper, refine] = getInitializedWidget();
        // User presses back (browser) and the URL contains some refinements
        const uiState = {
          numericSelector: {
            numerics: 30,
          },
        };
        // The current state has the same parameters
        refine(30);
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the same parameters should not return a new object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should add the refinements according to the UI state provided', () => {
        const [widget, helper] = getInitializedWidget();
        // User presses back (browser) and the URL contains some refinements
        const uiState = {
          numericSelector: {
            numerics: 20,
          },
        };
        // The current state is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // The new parameters should be applies
        expect(searchParametersAfter).toMatchSnapshot();
      });
    });
  });
});
