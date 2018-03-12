import sinon from 'sinon';
import jsHelper from 'algoliasearch-helper';
const {SearchResults, SearchParameters} = jsHelper;

import connectNumericRefinementList from '../connectNumericRefinementList.js';

const fakeClient = { addAlgoliaAgent: () => {} };

const encodeValue = (start, end) =>
  window.encodeURI(JSON.stringify({ start, end }));
const mapOptionsToItems = ({ start, end, name: label }) => ({
  label,
  value: encodeValue(start, end),
  isRefined: false,
});

describe('connectNumericRefinementList', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectNumericRefinementList(rendering);
    const widget = makeWidget({
      attributeName: 'numerics',
      options: [
        { name: 'below 10', end: 10 },
        { name: '10 - 20', start: 10, end: 20 },
        { name: 'more than 20', start: 20 },
      ],
    });

    expect(widget.getConfiguration).toBe(undefined);

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper(fakeClient);
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
    expect(rendering.lastCall.args[0].widgetParams).toEqual({
      attributeName: 'numerics',
      options: [
        { name: 'below 10', end: 10 },
        { name: '10 - 20', start: 10, end: 20 },
        { name: 'more than 20', start: 20 },
      ],
    });

    widget.render({
      results: new SearchResults(helper.state, [{ nbHits: 0 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);
    expect(rendering.lastCall.args[0].widgetParams).toEqual({
      attributeName: 'numerics',
      options: [
        { name: 'below 10', end: 10 },
        { name: '10 - 20', start: 10, end: 20 },
        { name: 'more than 20', start: 20 },
      ],
    });
  });

  it('Provide a function to update the refinements at each step', () => {
    const rendering = sinon.stub();
    const makeWidget = connectNumericRefinementList(rendering);
    const widget = makeWidget({
      attributeName: 'numerics',
      options: [
        { name: 'below 10', end: 10 },
        { name: '10 - 20', start: 10, end: 20 },
        { name: 'more than 20', start: 20 },
        { name: '42', start: 42, end: 42 },
        { name: 'void' },
      ],
    });

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const { refine, items } = firstRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
    refine(items[0].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [10],
    });
    refine(items[1].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '>=': [10],
      '<=': [20],
    });
    refine(items[2].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '>=': [20],
    });
    refine(items[3].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [42],
    });
    refine(items[4].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    const {
      refine: renderToggleRefinement,
      items: renderFacetValues,
    } = secondRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
    renderToggleRefinement(renderFacetValues[0].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [10],
    });
    renderToggleRefinement(renderFacetValues[1].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '>=': [10],
      '<=': [20],
    });
    renderToggleRefinement(renderFacetValues[2].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '>=': [20],
    });
    renderToggleRefinement(renderFacetValues[3].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '=': [42],
    });
    renderToggleRefinement(renderFacetValues[4].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
  });

  it('provides the correct facet values', () => {
    const rendering = sinon.stub();
    const makeWidget = connectNumericRefinementList(rendering);
    const widget = makeWidget({
      attributeName: 'numerics',
      options: [
        { name: 'below 10', end: 10 },
        { name: '10 - 20', start: 10, end: 20 },
        { name: 'more than 20', start: 20 },
      ],
    });

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.items).toEqual([
      {
        label: 'below 10',
        value: encodeValue(undefined, 10),
        isRefined: false,
      },
      { label: '10 - 20', value: encodeValue(10, 20), isRefined: false },
      { label: 'more than 20', value: encodeValue(20), isRefined: false },
    ]);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.items).toEqual([
      {
        label: 'below 10',
        value: encodeValue(undefined, 10),
        isRefined: false,
      },
      { label: '10 - 20', value: encodeValue(10, 20), isRefined: false },
      { label: 'more than 20', value: encodeValue(20), isRefined: false },
    ]);
  });

  it('provides isRefined for the currently selected value', () => {
    const rendering = sinon.stub();
    const makeWidget = connectNumericRefinementList(rendering);
    const listOptions = [
      { name: 'below 10', end: 10 },
      { name: '10 - 20', start: 10, end: 20 },
      { name: 'more than 20', start: 20 },
      { name: '42', start: 42, end: 42 },
      { name: 'void' },
    ];
    const widget = makeWidget({
      attributeName: 'numerics',
      options: listOptions,
    });

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    let refine = rendering.lastCall.args[0].refine;

    listOptions.forEach((option, i) => {
      refine(encodeValue(option.start, option.end));

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      // The current option should be the one selected
      // First we copy and set the default added values
      const expectedResults = [...listOptions].map(mapOptionsToItems);

      // Then we modify the isRefined value of the one that is supposed to be refined
      expectedResults[i].isRefined = true;

      const renderingParameters = rendering.lastCall.args[0];
      expect(renderingParameters.items).toEqual(expectedResults);

      refine = renderingParameters.refine;
    });
  });

  it('when the state is cleared, the "no value" value should be refined', () => {
    const rendering = sinon.stub();
    const makeWidget = connectNumericRefinementList(rendering);
    const listOptions = [
      { name: 'below 10', end: 10 },
      { name: '10 - 20', start: 10, end: 20 },
      { name: 'more than 20', start: 20 },
      { name: '42', start: 42, end: 42 },
      { name: 'void' },
    ];
    const widget = makeWidget({
      attributeName: 'numerics',
      options: listOptions,
    });

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const refine = rendering.lastCall.args[0].refine;
    // a user selects a value in the refinement list
    refine(encodeValue(listOptions[0].start, listOptions[0].end));

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // No option should be selected
    const expectedResults0 = [...listOptions].map(mapOptionsToItems);
    expectedResults0[0].isRefined = true;

    const renderingParameters0 = rendering.lastCall.args[0];
    expect(renderingParameters0.items).toEqual(expectedResults0);

    // All the refinements are cleared by a third party
    helper.removeNumericRefinement('numerics');

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // No option should be selected
    const expectedResults1 = [...listOptions].map(mapOptionsToItems);
    expectedResults1[4].isRefined = true;

    const renderingParameters1 = rendering.lastCall.args[0];
    expect(renderingParameters1.items).toEqual(expectedResults1);
  });

  it('should set `isRefined: true` after calling `refine(item)`', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericRefinementList(rendering);
    const listOptions = [
      { name: 'below 10', end: 10 },
      { name: '10 - 20', start: 10, end: 20 },
      { name: 'more than 20', start: 20 },
      { name: '42', start: 42, end: 42 },
      { name: 'void' },
    ];
    const widget = makeWidget({
      attributeName: 'numerics',
      options: listOptions,
    });

    const helper = jsHelper(fakeClient);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items[0].isRefined).toBe(false);

    // a user selects a value in the refinement list
    firstRenderingOptions.refine(
      encodeValue(listOptions[0].start, listOptions[0].end)
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items[0].isRefined).toBe(true);
  });

  it('should reset page on refine()', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericRefinementList(rendering);

    const widget = makeWidget({
      attributeName: 'numerics',
      options: [
        { name: 'below 10', end: 10 },
        { name: '10 - 20', start: 10, end: 20 },
        { name: 'more than 20', start: 20 },
        { name: '42', start: 42, end: 42 },
        { name: 'void' },
      ],
    });

    const helper = jsHelper(fakeClient);
    helper.search = sinon.stub();
    helper.setPage(2);

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    expect(helper.state.page).toBe(2);

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine, items } = firstRenderingOptions;

    refine(items[0].value);

    expect(helper.state.page).toBe(0);
  });

  describe('routing', () => {
    const getInitializedWidget = () => {
      const rendering = jest.fn();
      const makeWidget = connectNumericRefinementList(rendering);
      const widget = makeWidget({
        attributeName: 'numerics',
        options: [
          { name: 'below 10', end: 10 },
          { name: '10 - 20', start: 10, end: 20 },
          { name: 'more than 20', start: 20 },
        ],
      });

      const helper = jsHelper(
        { addAlgoliaAgent: () => {} },
        ''
      );
      helper.search = () => {};

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
      test('should give back the object unmodified if there are no refinements', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          state: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });

      test('should add an entry equal to the refinement', () => {
        const [widget, helper] = getInitializedWidget();
        helper.addNumericRefinement('numerics', '>=', 10);
        helper.addNumericRefinement('numerics', '<=', 20);
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          state: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should not override other values in the same namespace', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          numericRefinementList: {
            'numerics-2': ['27:36']
          }
        };
        helper.addNumericRefinement('numerics', '>=', 10);
        helper.addNumericRefinement('numerics', '<=', 20);
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          state: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should give back the object unmodified if refinements are already set', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          numericRefinementList: {
            numerics: '10:20',
          },
        };
        helper.addNumericRefinement('numerics', '>=', 10);
        helper.addNumericRefinement('numerics', '<=', 20);
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          state: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });
    });

    describe('getWidgetSearchParameters', () => {
      test('should return the same SP if there are no refinements in the UI state', () => {
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
          numericRefinementList: {
            numerics: '10:20',
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
