import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectNumericSelector from '../connectNumericSelector.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectNumericSelector', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      {name: '10', value: 10},
      {name: '20', value: 20},
      {name: '30', value: 30},
    ];
    const widget = makeWidget({
      container,
      attributeName: 'numerics',
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
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper(fakeClient, '', config);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering.callCount).toBe(1);
    // test if isFirstRendering is true during init
    expect(rendering.lastCall.args[1]).toBe(true);

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.currentValue).toBe(listOptions[0].value);
    expect(firstRenderingOptions.widgetParams).toEqual({
      container,
      attributeName: 'numerics',
      options: listOptions,
    });

    widget.render({
      results: new SearchResults(helper.state, [{nbHits: 0}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.currentValue).toBe(listOptions[0].value);
    expect(secondRenderingOptions.widgetParams).toEqual({
      container,
      attributeName: 'numerics',
      options: listOptions,
    });
  });

  it('Reads the default value from the URL if possible', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      {name: '10', value: 10},
      {name: '20', value: 20},
      {name: '30', value: 30},
    ];
    const widget = makeWidget({
      container,
      attributeName: 'numerics',
      options: listOptions,
    });

    expect(widget.getConfiguration({}, {})).toEqual({
      numericRefinements: {
        numerics: {
          '=': [listOptions[0].value],
        },
      },
    });

    expect(widget.getConfiguration({}, {
      numericRefinements: {
        numerics: {
          '=': [30],
        },
      },
    })).toEqual({
      numericRefinements: {
        numerics: {
          '=': [30],
        },
      },
    });
  });

  it('Provide a function to update the refinements at each step', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      {name: '10', value: 10},
      {name: '20', value: 20},
      {name: '30', value: 30},
    ];
    const widget = makeWidget({
      container,
      attributeName: 'numerics',
      options: listOptions,
    });

    const config = widget.getConfiguration({}, {});
    const helper = jsHelper(fakeClient, '', config);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const {setValue} = firstRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [10]});
    setValue(listOptions[1].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [20]});
    setValue(listOptions[2].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [30]});
    setValue(listOptions[0].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [10]});

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    const {setValue: renderSetValue} = secondRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [10]});
    renderSetValue(listOptions[1].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [20]});
    renderSetValue(listOptions[2].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [30]});
    renderSetValue(listOptions[0].name);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({'=': [10]});
  });

  it('provides isRefined for the currently selected value', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectNumericSelector(rendering);
    const listOptions = [
      {name: '10', value: 10},
      {name: '20', value: 20},
      {name: '30', value: 30},
    ];
    const widget = makeWidget({
      container,
      attributeName: 'numerics',
      options: listOptions,
    });

    const config = widget.getConfiguration({}, {});
    const helper = jsHelper(fakeClient, '', config);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    let setValue = rendering.lastCall.args[0].setValue;

    listOptions.forEach((_, i) => {
      // we loop with 1 increment because the first value is selected by default
      const currentOption = listOptions[(i + 1) % listOptions.length];
      setValue(currentOption.name);

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      // The current option should be the one selected
      // First we copy and set the default added values
      const expectedResult = currentOption.value;

      const renderingParameters = rendering.lastCall.args[0];
      expect(renderingParameters.currentValue).toEqual(expectedResult);

      setValue = renderingParameters.setValue;
    });
  });
});
