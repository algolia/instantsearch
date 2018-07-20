import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;
const SearchParameters = jsHelper.SearchParameters;

import connectHierarchicalMenu from '../connectHierarchicalMenu.js';

describe('connectHierarchicalMenu', () => {
  it('It should compute getConfiguration() correctly', () => {
    const rendering = jest.fn();
    const makeWidget = connectHierarchicalMenu(rendering);

    const widget = makeWidget({ attributes: ['category', 'sub_category'] });

    // when there is no hierarchicalFacets into current configuration
    {
      const config = widget.getConfiguration({});
      expect(config).toEqual({
        hierarchicalFacets: [
          {
            attributes: ['category', 'sub_category'],
            name: 'category',
            rootPath: null,
            separator: ' > ',
            showParentLevel: true,
          },
        ],
        maxValuesPerFacet: 10,
      });
    }

    // when there is an identical hierarchicalFacets into current configuration
    {
      const spy = jest.spyOn(global.console, 'warn');
      const config = widget.getConfiguration({
        hierarchicalFacets: [{ name: 'category' }],
      });
      expect(config).toEqual({});
      expect(spy).toHaveBeenCalled();
      spy.mockReset();
      spy.mockRestore();
    }

    // when there is already a different hierarchicalFacets into current configuration
    {
      const config = widget.getConfiguration({
        hierarchicalFacets: [{ name: 'foo' }],
      });
      expect(config).toEqual({
        hierarchicalFacets: [
          {
            attributes: ['category', 'sub_category'],
            name: 'category',
            rootPath: null,
            separator: ' > ',
            showParentLevel: true,
          },
        ],
        maxValuesPerFacet: 10,
      });
    }
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectHierarchicalMenu(rendering);
    const widget = makeWidget({
      attributes: ['category', 'sub_category'],
    });

    const config = widget.getConfiguration({});
    expect(config).toEqual({
      hierarchicalFacets: [
        {
          attributes: ['category', 'sub_category'],
          name: 'category',
          rootPath: null,
          separator: ' > ',
          showParentLevel: true,
        },
      ],
      maxValuesPerFacet: 10,
    });

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper({}, '', config);
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
      attributes: ['category', 'sub_category'],
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
      attributes: ['category', 'sub_category'],
    });
  });

  it('Provide a function to clear the refinements at each step', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHierarchicalMenu(rendering);
    const widget = makeWidget({
      attributes: ['category', 'sub_category'],
    });

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = sinon.stub();

    helper.toggleRefinement('category', 'value');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    const { refine } = firstRenderingOptions;
    refine('value');
    expect(helper.hasRefinements('category')).toBe(false);
    refine('value');
    expect(helper.hasRefinements('category')).toBe(true);

    widget.render({
      results: new SearchResults(helper.state, [{}, {}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    const { refine: renderToggleRefinement } = secondRenderingOptions;
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(false);
    renderToggleRefinement('value');
    expect(helper.hasRefinements('category')).toBe(true);
  });

  it('provides the correct facet values', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHierarchicalMenu(rendering);
    const widget = makeWidget({
      attributes: ['category', 'subCategory'],
    });

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = sinon.stub();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    // During the first rendering there are no facet values
    // The function get an empty array so that it doesn't break
    // over null-ish values.
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              Decoration: 880,
            },
            subCategory: {
              'Decoration > Candle holders & candles': 193,
              'Decoration > Frames & pictures': 173,
            },
          },
        },
        {
          facets: {
            category: {
              Decoration: 880,
              Outdoor: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.items).toEqual([
      {
        label: 'Decoration',
        value: 'Decoration',
        count: 880,
        isRefined: true,
        data: [
          {
            label: 'Candle holders & candles',
            value: 'Decoration > Candle holders & candles',
            count: 193,
            isRefined: false,
            data: null,
          },
          {
            label: 'Frames & pictures',
            value: 'Decoration > Frames & pictures',
            count: 173,
            isRefined: false,
            data: null,
          },
        ],
      },
      {
        label: 'Outdoor',
        value: 'Outdoor',
        count: 47,
        isRefined: false,
        data: null,
      },
    ]);
  });

  it('provides the correct transformed facet values', () => {
    const rendering = sinon.stub();
    const makeWidget = connectHierarchicalMenu(rendering);
    const widget = makeWidget({
      attributes: ['category', 'subCategory'],
      transformItems: items =>
        items.map(item => ({
          ...item,
          label: 'transformed',
        })),
    });

    const helper = jsHelper({}, '', widget.getConfiguration({}));
    helper.search = sinon.stub();

    helper.toggleRefinement('category', 'Decoration');

    widget.init({
      helper,
      state: helper.state,
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.items).toEqual([]);

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [],
          facets: {
            category: {
              Decoration: 880,
            },
            subCategory: {
              'Decoration > Candle holders & candles': 193,
              'Decoration > Frames & pictures': 173,
            },
          },
        },
        {
          facets: {
            category: {
              Decoration: 880,
              Outdoor: 47,
            },
          },
        },
      ]),
      state: helper.state,
      helper,
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.items).toEqual([
      expect.objectContaining({ label: 'transformed' }),
      expect.objectContaining({ label: 'transformed' }),
    ]);
  });

  describe('routing', () => {
    const getInitializedWidget = () => {
      const rendering = jest.fn();
      const makeWidget = connectHierarchicalMenu(rendering);
      const widget = makeWidget({
        attributes: ['category', 'subCategory'],
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

      test('should add an entry equal to the refinement', () => {
        const [widget, helper] = getInitializedWidget();
        helper.toggleRefinement('category', 'path');
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should not overide other entries in the same namespace', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          hierarchicalMenu: {
            otherCategory: ['path'],
          },
        };
        helper.toggleRefinement('category', 'path');
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should give back the object unmodified if refinements are already set', () => {
        const [widget, helper] = getInitializedWidget();
        const uiStateBefore = {
          hierarchicalMenu: {
            category: ['path'],
          },
        };
        helper.toggleRefinement('category', 'path');
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
        // User presses back in the browser and the URL state contains no parameters
        const uiState = {};
        // The current state is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying an empty UI state should not change the object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should add the refinements according to the UI state provided', () => {
        const [widget, helper] = getInitializedWidget();
        // User presses back in the browser, and the URL contains the following:
        const uiState = {
          hierarchicalMenu: {
            category: ['path'],
          },
        };
        // The current state is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        // The state after the UI is applied on it
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        expect(searchParametersAfter).toMatchSnapshot();
      });
    });
  });
});
