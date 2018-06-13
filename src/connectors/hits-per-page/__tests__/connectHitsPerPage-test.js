import sinon from 'sinon';
import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;
const SearchParameters = jsHelper.SearchParameters;

import connectHitsPerPage from '../connectHitsPerPage.js';

describe('connectHitsPerPage', () => {
  it('should throw when there is two default items defined', () => {
    expect(() => {
      connectHitsPerPage(() => {})({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 10, label: '10 items per page', default: true },
        ],
      });
    }).toThrow(/^\[Error\]/);
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPage(rendering);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
      ],
    });

    expect(typeof widget.getConfiguration).toEqual('function');
    expect(widget.getConfiguration()).toEqual({});

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper({}, '', {
      hitsPerPage: 3,
    });
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
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
      ],
    });

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);
    expect(rendering.lastCall.args[0].widgetParams).toEqual({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
      ],
    });
  });

  it('Configures the search with the default hitsPerPage provided', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPage(rendering);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page', default: true },
      ],
    });

    expect(widget.getConfiguration()).toEqual({
      hitsPerPage: 10,
    });
  });

  it('Does not configures the search when there is no default value', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPage(rendering);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
      ],
    });

    expect(widget.getConfiguration()).toEqual({});
  });

  it('Provide a function to change the current hits per page, and provide the current value', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPage(rendering);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
        { value: 11, label: '' },
      ],
    });

    const helper = jsHelper({}, '', {
      hitsPerPage: 11,
    });
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const { refine } = firstRenderingOptions;
    expect(helper.getQueryParameter('hitsPerPage')).toBe(11);
    refine(3);
    expect(helper.getQueryParameter('hitsPerPage')).toBe(3);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    const { refine: renderSetValue } = secondRenderingOptions;
    expect(helper.getQueryParameter('hitsPerPage')).toBe(3);
    renderSetValue(10);
    expect(helper.getQueryParameter('hitsPerPage')).toBe(10);

    expect(helper.search.callCount).toBe(2);
  });

  it('provides the current hitsPerPage value', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPage(rendering);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
        { value: 7, label: '' },
      ],
    });

    const helper = jsHelper({}, '', {
      hitsPerPage: 7,
    });
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.items).toMatchSnapshot();
    firstRenderingOptions.refine(3);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.items).toMatchSnapshot();
  });

  it('adds an option for the unselecting values, when the current hitsPerPage is defined elsewhere', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHitsPerPage(rendering);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
      ],
    });

    const helper = jsHelper({}, '', {
      hitsPerPage: 7,
    });
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.items).toHaveLength(3);
    firstRenderingOptions.refine(firstRenderingOptions.items[0].value);
    expect(helper.getQueryParameter('hitsPerPage')).not.toBeDefined();

    // Reset the hitsPerPage to an actual value
    helper.setQueryParameter('hitsPerPage', 7);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.items).toHaveLength(3);
    secondRenderingOptions.refine(secondRenderingOptions.items[0].value);
    expect(helper.getQueryParameter('hitsPerPage')).not.toBeDefined();
  });

  describe('routing', () => {
    const getInitializedWidget = () => {
      const rendering = jest.fn();
      const makeWidget = connectHitsPerPage(rendering);
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 10, label: '10 items per page' },
        ],
      });

      const helper = jsHelper({}, '', widget.getConfiguration({}));
      helper.search = sinon.stub();

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
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });

      test('should not add an entry when the default value is selected', () => {
        const [widget, helper] = getInitializedWidget();
        helper.setQueryParameter('hitsPerPage', 3);
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toBe(uiStateBefore);
      });

      test('should add an entry equal to the refinement', () => {
        const [widget, helper] = getInitializedWidget();
        helper.setQueryParameter('hitsPerPage', 10);
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should give back the object unmodified if refinements are already set', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          hitsPerPage: 10,
        };
        helper.setQueryParameter('hitsPerPage', 10);
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
        // The URL contains nothing
        const uiState = {};
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the empty UI state should not create a new object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should add the refinements according to the UI state provided', () => {
        const [widget, helper] = getInitializedWidget();
        // The URL contains some values for the widget
        const uiState = {
          hitsPerPage: 10,
        };
        // Current the search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the UI state should add the new configuration
        expect(searchParametersAfter).toMatchSnapshot();
      });
    });
  });
});
