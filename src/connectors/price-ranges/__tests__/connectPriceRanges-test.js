import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const { SearchResults, SearchParameters } = jsHelper;

import connectPriceRanges from '../connectPriceRanges.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectPriceRanges', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectPriceRanges(rendering);

    const attributeName = 'price';
    const widget = makeWidget({
      attributeName,
    });

    // does not have a getConfiguration method
    const config = widget.getConfiguration();
    expect(config).toEqual({ facets: [attributeName] });

    const helper = jsHelper(fakeClient, '', config);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering.callCount).toBe(1);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const { items } = rendering.lastCall.args[0];
      expect(items).toEqual([]);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ test: 'oneTime' }],
          facets: { price: { 10: 1, 20: 1, 30: 1 } },
        facets_stats: { // eslint-disable-line
            price: {
              avg: 20,
              max: 30,
              min: 10,
              sum: 60,
            },
          },
          nbHits: 1,
          nbPages: 1,
          page: 0,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.callCount).toBe(2);
      const isFirstRendering = rendering.lastCall.args[1];
      expect(isFirstRendering).toBe(false);

      // should provide good values for the first rendering
      const { items, widgetParams } = rendering.lastCall.args[0];
      expect(items).toEqual([
        { to: 10, url: '#' },
        { from: 10, to: 13, url: '#' },
        { from: 13, to: 16, url: '#' },
        { from: 16, to: 19, url: '#' },
        { from: 19, to: 22, url: '#' },
        { from: 22, to: 25, url: '#' },
        { from: 25, to: 28, url: '#' },
        { from: 28, url: '#' },
      ]);
      expect(widgetParams).toEqual({
        attributeName,
      });
    }
  });

  it('Provides a function to update the refinements at each step', () => {
    const rendering = sinon.stub();
    const makeWidget = connectPriceRanges(rendering);

    const attributeName = 'price';
    const widget = makeWidget({
      attributeName,
    });

    const helper = jsHelper(fakeClient, '', widget.getConfiguration());
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      // first rendering
      expect(helper.getNumericRefinement('price', '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement('price', '<=')).toEqual(undefined);
      const renderOptions = rendering.lastCall.args[0];
      const { refine } = renderOptions;
      refine({ from: 10, to: 30 });
      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      expect(helper.search.callCount).toBe(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ test: 'oneTime' }],
          facets: { price: { 10: 1, 20: 1, 30: 1 } },
        facets_stats: { // eslint-disable-line
            price: {
              avg: 20,
              max: 30,
              min: 10,
              sum: 60,
            },
          },
          nbHits: 1,
          nbPages: 1,
          page: 0,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Second rendering
      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      const renderOptions = rendering.lastCall.args[0];
      const { refine } = renderOptions;
      refine({ from: 40, to: 50 });
      expect(helper.getNumericRefinement('price', '>=')).toEqual([40]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([50]);
      expect(helper.search.callCount).toBe(2);
    }
  });

  describe('routing', () => {
    const getInitializedWidget = () => {
      const rendering = jest.fn();
      const makeWidget = connectPriceRanges(rendering);
      const widget = makeWidget({
        attributeName: 'price',
      });

      const config = widget.getConfiguration({}, {});
      const helper = jsHelper(fakeClient, '', config);
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
        refine({ from: 10, to: 20 });
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should not override other values in the same namespace', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine({ from: 10, to: 20 });

        const uiStateBefore = {
          priceRanges: {
            'price-2': '10:20',
          },
        };

        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });

        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should return the same instance if the value is already in the UI state', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine({ from: 10, to: 20 });

        const uiStateBefore = {
          priceRanges: {
            price: '10:20',
          },
        };

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
        // The user presses back (browser), the url contains no parameters
        const uiState = {};
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the same empty parameters should yield the same object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should return the same SP if the value from the UI state is the same', () => {
        const [widget, helper, refine] = getInitializedWidget();
        // The user presses back (browser), the url contains min and max
        const uiState = {
          priceRanges: '10:20',
        };
        // The current search has the same parameters
        refine({ from: 10, to: 20 });
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the same non empty parameters should yield the same object
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });

      test('should add the refinements according to the UI state provided (min and max)', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), the URL contains both min and max
        const uiState = {
          priceRanges: {
            price: '20:40',
          },
        };
        // The current state is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the new parameters should set two numeric refinements
        expect(searchParametersAfter).toMatchSnapshot();
      });

      test('should add the refinements according to the UI state provided (only max)', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), the URL contains a max
        const uiState = {
          priceRanges: {
            price: ':50',
          },
        };
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the new parameters should set one refinement
        expect(searchParametersAfter).toMatchSnapshot();
      });

      test('should add the refinements according to the UI state provided (only min)', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), the url contains a min
        const uiState = {
          priceRanges: {
            price: '10:',
          },
        };
        // the current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the new parameter should set one refinement
        expect(searchParametersAfter).toMatchSnapshot();
      });
    });
  });
});
