import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const { SearchResults, SearchParameters } = jsHelper;

import connectSortBySelector from '../connectSortBySelector.js';
import instantSearch from '../../../lib/main.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectSortBySelector', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectSortBySelector(rendering);
    const instantSearchInstance = instantSearch({
      apiKey: '',
      appId: '',
      indexName: 'defaultIndex',
      createAlgoliaClient: () => fakeClient,
    });

    const indices = [
      { label: 'Sort products by relevance', name: 'relevance' },
      { label: 'Sort products by price', name: 'priceASC' },
    ];
    const widget = makeWidget({ indices });

    expect(widget.getConfiguration).toBe(undefined);

    const helper = jsHelper(fakeClient, indices[0].name);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
      instantSearchInstance,
    });

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering.callCount).toBe(1);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const {
        currentRefinement,
        options,
        widgetParams,
      } = rendering.lastCall.args[0];
      expect(currentRefinement).toBe(helper.state.index);
      expect(widgetParams).toEqual({ indices });
      expect(options).toEqual([
        { label: 'Sort products by relevance', value: 'relevance' },
        { label: 'Sort products by price', value: 'priceASC' },
      ]);
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.callCount).toBe(2);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const { currentRefinement, options } = rendering.lastCall.args[0];
      expect(currentRefinement).toBe(helper.state.index);
      expect(options).toEqual([
        { label: 'Sort products by relevance', value: 'relevance' },
        { label: 'Sort products by price', value: 'priceASC' },
      ]);
    }
  });

  it('Provides a function to update the index at each step', () => {
    const rendering = sinon.stub();
    const makeWidget = connectSortBySelector(rendering);
    const instantSearchInstance = instantSearch({
      apiKey: '',
      appId: '',
      indexName: 'defaultIndex',
      createAlgoliaClient: () => fakeClient,
    });

    const indices = [
      { label: 'Sort products by relevance', name: 'relevance' },
      { label: 'Sort products by price', name: 'priceASC' },
    ];
    const widget = makeWidget({
      indices,
    });

    const helper = jsHelper(fakeClient, indices[0].name);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
      instantSearchInstance,
    });

    {
      // first rendering
      expect(helper.state.index).toBe(indices[0].name);
      const renderOptions = rendering.lastCall.args[0];
      const { refine, currentRefinement } = renderOptions;
      expect(currentRefinement).toBe(helper.state.index);
      refine('bip');
      expect(helper.state.index).toBe('bip');
      expect(helper.search.callCount).toBe(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Second rendering
      expect(helper.state.index).toBe('bip');
      const renderOptions = rendering.lastCall.args[0];
      const { refine, currentRefinement } = renderOptions;
      expect(currentRefinement).toBe('bip');
      refine('bop');
      expect(helper.state.index).toBe('bop');
      expect(helper.search.callCount).toBe(2);
    }
  });

  describe('routing', () => {
    const getInitializedWidget = (config = {}) => {
      const rendering = jest.fn();
      const makeWidget = connectSortBySelector(rendering);
      const instantSearchInstance = instantSearch({
        apiKey: '',
        appId: '',
        indexName: 'relevance',
        createAlgoliaClient: () => fakeClient,
      });
      const indices = [
        { label: 'Sort products by relevance', name: 'relevance' },
        { label: 'Sort products by price', name: 'priceASC' },
        { label: 'Sort products by magic', name: 'other' },
      ];

      const widget = makeWidget({
        indices,
        ...config,
      });

      const initialConfig = {};
      const helper = jsHelper(fakeClient, 'relevance', initialConfig);
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
        onHistoryChange: () => {},
        instantSearchInstance,
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
        refine('priceASC');
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });
        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should give back the object unmodified if the value is already in the ui state', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine('priceASC');
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
      test('should return the same SP if no value is in the UI state', () => {
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
          sortBy: 'other',
        };
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toMatchSnapshot();
      });

      test('should enforce the default value', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine('other');
        const uiState = {};
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
