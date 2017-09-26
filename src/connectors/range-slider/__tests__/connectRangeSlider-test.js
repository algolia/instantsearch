import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectRangeSlider from '../connectRangeSlider.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectRangeSlider', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectRangeSlider(rendering);

    const attributeName = 'price';
    const widget = makeWidget({
      attributeName,
    });

    const config = widget.getConfiguration();
    expect(config).toEqual({
      disjunctiveFacets: [attributeName],
    });

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
      const { range, start, widgetParams } = rendering.lastCall.args[0];
      expect(range).toEqual({ min: 0, max: 0 });
      expect(start).toEqual([-Infinity, Infinity]);
      expect(widgetParams).toEqual({
        attributeName,
      });
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ test: 'oneTime' }],
          facets: { price: { 10: 1, 20: 1, 30: 1 } },
          // eslint-disable-next-line camelcase
          facets_stats: {
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
      const { range, start } = rendering.lastCall.args[0];
      expect(range).toEqual({ min: 10, max: 30 });
      expect(start).toEqual([-Infinity, Infinity]);
    }
  });

  it('Accepts some user bounds', () => {
    const makeWidget = connectRangeSlider(() => {});

    const attributeName = 'price';

    expect(makeWidget({ attributeName, min: 0 }).getConfiguration()).toEqual({
      disjunctiveFacets: [attributeName],
      numericRefinements: {
        [attributeName]: { '>=': [0] },
      },
    });

    expect(makeWidget({ attributeName, max: 100 }).getConfiguration()).toEqual({
      disjunctiveFacets: [attributeName],
      numericRefinements: {
        [attributeName]: { '<=': [100] },
      },
    });

    expect(
      makeWidget({ attributeName, min: 0, max: 100 }).getConfiguration()
    ).toEqual({
      disjunctiveFacets: [attributeName],
      numericRefinements: {
        [attributeName]: {
          '>=': [0],
          '<=': [100],
        },
      },
    });
  });

  it('Provides a function to update the refinements at each step', () => {
    const rendering = sinon.stub();
    const makeWidget = connectRangeSlider(rendering);

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
      refine([10, 30]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      expect(helper.search.callCount).toBe(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ test: 'oneTime' }],
          facets: { price: { 10: 1, 20: 1, 30: 1 } },
          // eslint-disable-next-line camelcase
          facets_stats: {
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
        {},
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
      refine([23, 27]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([23]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([27]);
      expect(helper.search.callCount).toBe(2);
    }
  });

  it('should add numeric refinement when refining min boundary without previous configuation', () => {
    const rendering = sinon.stub();
    const makeWidget = connectRangeSlider(rendering);

    const attributeName = 'price';
    const widget = makeWidget({ attributeName, min: 0, max: 500 });

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
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([500]);

      const renderOptions = rendering.lastCall.args[0];
      const { refine } = renderOptions;
      refine([10, 30]);

      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      expect(helper.search.callCount).toBe(1);

      refine([0, undefined]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual(undefined);
    }
  });

  it('should add numeric refinement when refining min boundary with previous configuration', () => {
    const rendering = sinon.stub();
    const makeWidget = connectRangeSlider(rendering);

    const attributeName = 'price';
    const widget = makeWidget({ attributeName, min: 0, max: 500 });
    const configuration = widget.getConfiguration({
      indexName: 'movie',
    });

    const helper = jsHelper(fakeClient, '', configuration);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      // first rendering
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([500]);

      const renderOptions = rendering.lastCall.args[0];
      const { refine } = renderOptions;
      refine([10, 30]);

      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      expect(helper.search.callCount).toBe(1);

      refine([0, undefined]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual(undefined);
    }
  });

  it('should refine on boundaries when no min/max defined', () => {
    const rendering = sinon.stub();
    const makeWidget = connectRangeSlider(rendering);

    const attributeName = 'price';
    const widget = makeWidget({ attributeName });

    const helper = jsHelper(fakeClient, '', widget.getConfiguration());
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    {
      expect(helper.getNumericRefinement('price', '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement('price', '<=')).toEqual(undefined);

      const renderOptions = rendering.lastCall.args[0];
      const { refine } = renderOptions;

      refine([undefined, 100]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([100]);
      expect(helper.search.callCount).toBe(1);

      refine([0, undefined]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual(undefined);
      expect(helper.search.callCount).toBe(2);

      refine([0, 100]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([100]);
      expect(helper.search.callCount).toBe(3);
    }
  });

  describe('_getCurrentRange', () => {
    const attributeName = 'price';
    const rendering = () => {};

    it('expect to return default range', () => {
      const bounds = {};
      const stats = {};
      const widget = connectRangeSlider(rendering)({
        attributeName,
      });

      const expectation = { min: 0, max: 0 };
      const actual = widget._getCurrentRange(bounds, stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return range from stats', () => {
      const bounds = {};
      const stats = { min: 10, max: 500 };
      const widget = connectRangeSlider(rendering)({
        attributeName,
      });

      const expectation = { min: 10, max: 500 };
      const actual = widget._getCurrentRange(bounds, stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return range from bounds', () => {
      const bounds = { min: 20, max: 250 };
      const stats = { min: 10, max: 500 };
      const widget = connectRangeSlider(rendering)({
        attributeName,
      });

      const expectation = { min: 20, max: 250 };
      const actual = widget._getCurrentRange(bounds, stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values', () => {
      const bounds = {};
      const stats = { min: 1.79, max: 499.99 };
      const widget = connectRangeSlider(rendering)({
        attributeName,
      });

      const expectation = { min: 1, max: 500 };
      const actual = widget._getCurrentRange(bounds, stats);

      expect(actual).toEqual(expectation);
    });
  });

  describe('_getCurrentRefinement', () => {
    const attributeName = 'price';
    const rendering = () => {};

    it('expect to return default refinement', () => {
      const stats = {};
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        state: {
          getNumericRefinement: jest.fn(() => []),
        },
      };

      const expectation = { min: -Infinity, max: Infinity };
      const actual = widget._getCurrentRefinement(helper, stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return refinement from stats', () => {
      const stats = { min: 10, max: 500 };
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        state: {
          getNumericRefinement: jest.fn(() => []),
        },
      };

      const expectation = { min: 10, max: 500 };
      const actual = widget._getCurrentRefinement(helper, stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return refinement from helper', () => {
      const stats = {};
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        state: {
          getNumericRefinement: jest.fn(
            (_, operation) => (operation === '>=' ? [10] : [100])
          ),
        },
      };

      const expectation = { min: 10, max: 100 };
      const actual = widget._getCurrentRefinement(helper, stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded refinement values', () => {
      const stats = { min: 1.79, max: 499.99 };
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        state: {
          getNumericRefinement: jest.fn(() => []),
        },
      };

      const expectation = { min: 1, max: 500 };
      const actual = widget._getCurrentRefinement(helper, stats);

      expect(actual).toEqual(expectation);
    });
  });
});
