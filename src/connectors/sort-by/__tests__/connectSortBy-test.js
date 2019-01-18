import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';

import connectSortBy from '../connectSortBy';
import instantSearch from '../../../lib/main';

describe('connectSortBy', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectSortBy(rendering);
    const instantSearchInstance = instantSearch({
      indexName: 'defaultIndex',
      searchClient: { search() {} },
    });

    const items = [
      { label: 'Sort products by relevance', value: 'relevance' },
      { label: 'Sort products by price', value: 'priceASC' },
    ];
    const widget = makeWidget({ items });

    expect(widget.getConfiguration).toBe(undefined);

    const helper = jsHelper({}, items[0].value);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
      instantSearchInstance,
    });

    // should call the rendering once with isFirstRendering to true
    expect(rendering).toHaveBeenCalledTimes(1);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: helper.state.index,
        widgetParams: { items },
        options: [
          { label: 'Sort products by relevance', value: 'relevance' },
          { label: 'Sort products by price', value: 'priceASC' },
        ],
      }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // Should call the rendering a second time, with isFirstRendering to false
    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: helper.state.index,
        widgetParams: { items },
        options: [
          { label: 'Sort products by relevance', value: 'relevance' },
          { label: 'Sort products by price', value: 'priceASC' },
        ],
      }),
      false
    );
  });

  it('Renders with transformed items', () => {
    const rendering = jest.fn();
    const makeWidget = connectSortBy(rendering);
    const instantSearchInstance = instantSearch({
      indexName: 'defaultIndex',
      searchClient: { search() {} },
    });

    const items = [
      { label: 'Sort products by relevance', value: 'relevance' },
      { label: 'Sort products by price', value: 'priceASC' },
    ];
    const widget = makeWidget({
      items,
      transformItems: allItems =>
        allItems.map(item => ({ ...item, label: 'transformed' })),
    });

    const helper = jsHelper({}, items[0].value);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      instantSearchInstance,
    });

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: [
          { label: 'transformed', value: 'relevance' },
          { label: 'transformed', value: 'priceASC' },
        ],
      }),
      expect.anything()
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      helper,
      state: helper.state,
      instantSearchInstance,
    });

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: [
          { label: 'transformed', value: 'relevance' },
          { label: 'transformed', value: 'priceASC' },
        ],
      }),
      expect.anything()
    );
  });

  it('Provides a function to update the index at each step', () => {
    const rendering = jest.fn();
    const makeWidget = connectSortBy(rendering);
    const instantSearchInstance = instantSearch({
      indexName: 'defaultIndex',
      searchClient: { search() {} },
    });

    const items = [
      { label: 'Sort products by relevance', value: 'relevance' },
      { label: 'Sort products by price', value: 'priceASC' },
    ];
    const widget = makeWidget({
      items,
    });

    const helper = jsHelper({}, items[0].value);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
      instantSearchInstance,
    });

    {
      // first rendering
      expect(helper.state.index).toBe(items[0].value);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, currentRefinement } = renderOptions;
      expect(currentRefinement).toBe(helper.state.index);
      refine('bip');
      expect(helper.state.index).toBe('bip');
      expect(helper.search).toHaveBeenCalledTimes(1);
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
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, currentRefinement } = renderOptions;
      expect(currentRefinement).toBe('bip');
      refine('bop');
      expect(helper.state.index).toBe('bop');
      expect(helper.search).toHaveBeenCalledTimes(2);
    }
  });

  describe('routing', () => {
    const getInitializedWidget = (config = {}) => {
      const rendering = jest.fn();
      const makeWidget = connectSortBy(rendering);
      const instantSearchInstance = instantSearch({
        indexName: 'relevance',
        searchClient: { search() {} },
      });
      const items = [
        { label: 'Sort products by relevance', value: 'relevance' },
        { label: 'Sort products by price', value: 'priceASC' },
        { label: 'Sort products by magic', value: 'other' },
      ];

      const widget = makeWidget({
        items,
        ...config,
      });

      const initialConfig = {};
      const helper = jsHelper({}, 'relevance', initialConfig);
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
