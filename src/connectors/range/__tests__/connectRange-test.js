import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const { SearchResults, SearchParameters } = jsHelper;

import connectRange from '../connectRange.js';

const fakeClient = { addAlgoliaAgent: () => {} };

describe('connectRange', () => {
  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectRange(rendering);

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
        precision: 2,
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
      const { range, start, widgetParams } = rendering.lastCall.args[0];
      expect(range).toEqual({ min: 10, max: 30 });
      expect(start).toEqual([-Infinity, Infinity]);
      expect(widgetParams).toEqual({
        attributeName,
        precision: 2,
      });
    }
  });

  it('Accepts some user bounds', () => {
    const makeWidget = connectRange(() => {});

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
    const makeWidget = connectRange(rendering);

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

  it('should add numeric refinement when refining min boundary without previous configuration', () => {
    const rendering = sinon.stub();
    const makeWidget = connectRange(rendering);

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
      expect(helper.getNumericRefinement('price', '<=')).toEqual([500]);
    }
  });

  it('should add numeric refinement when refining min boundary with previous configuration', () => {
    const rendering = sinon.stub();
    const makeWidget = connectRange(rendering);

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
      expect(helper.getNumericRefinement('price', '<=')).toEqual([500]);
    }
  });

  it('should refine on boundaries when no min/max defined', () => {
    const rendering = sinon.stub();
    const makeWidget = connectRange(rendering);

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

  describe('getConfiguration', () => {
    const attributeName = 'price';
    const rendering = () => {};

    it('expect to return default configuration', () => {
      const currentConfiguration = {};
      const widget = connectRange(rendering)({
        attributeName,
      });

      const expectation = { disjunctiveFacets: ['price'] };
      const actual = widget.getConfiguration(currentConfiguration);

      expect(actual).toEqual(expectation);
    });

    it('expect to return default configuration if previous one has already numeric refinements', () => {
      const currentConfiguration = {
        numericRefinements: {
          price: {
            '<=': [500],
          },
        },
      };

      const widget = connectRange(rendering)({
        attributeName,
        max: 500,
      });

      const expectation = { disjunctiveFacets: ['price'] };
      const actual = widget.getConfiguration(currentConfiguration);

      expect(actual).toEqual(expectation);
    });

    it('expect to return default configuration if the given min bound are greater than max bound', () => {
      const currentConfiguration = {};
      const widget = connectRange(rendering)({
        attributeName,
        min: 1000,
        max: 500,
      });

      const expectation = { disjunctiveFacets: ['price'] };
      const actual = widget.getConfiguration(currentConfiguration);

      expect(actual).toEqual(expectation);
    });

    it('expect to return configuration with min numeric refinement', () => {
      const currentConfiguration = {};
      const widget = connectRange(rendering)({
        attributeName,
        min: 10,
      });

      const expectation = {
        disjunctiveFacets: ['price'],
        numericRefinements: {
          price: {
            '>=': [10],
          },
        },
      };

      const actual = widget.getConfiguration(currentConfiguration);

      expect(actual).toEqual(expectation);
    });

    it('expect to return configuration with max numeric refinement', () => {
      const currentConfiguration = {};
      const widget = connectRange(rendering)({
        attributeName,
        max: 10,
      });

      const expectation = {
        disjunctiveFacets: ['price'],
        numericRefinements: {
          price: {
            '<=': [10],
          },
        },
      };

      const actual = widget.getConfiguration(currentConfiguration);

      expect(actual).toEqual(expectation);
    });

    it('expect to return configuration with both numeric refinements', () => {
      const currentConfiguration = {};
      const widget = connectRange(rendering)({
        attributeName,
        min: 10,
        max: 500,
      });

      const expectation = {
        disjunctiveFacets: ['price'],
        numericRefinements: {
          price: {
            '>=': [10],
            '<=': [500],
          },
        },
      };

      const actual = widget.getConfiguration(currentConfiguration);

      expect(actual).toEqual(expectation);
    });
  });

  describe('_getCurrentRange', () => {
    const attributeName = 'price';
    const rendering = () => {};

    it('expect to return default range', () => {
      const stats = {};
      const widget = connectRange(rendering)({
        attributeName,
      });

      const expectation = { min: 0, max: 0 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return range from bounds', () => {
      const stats = { min: 10, max: 500 };
      const widget = connectRange(rendering)({
        attributeName,
        min: 20,
        max: 250,
      });

      const expectation = { min: 20, max: 250 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return range from stats', () => {
      const stats = { min: 10, max: 500 };
      const widget = connectRange(rendering)({
        attributeName,
      });

      const expectation = { min: 10, max: 500 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values when precision is 0', () => {
      const stats = { min: 1.79, max: 499.99 };
      const widget = connectRange(rendering)({
        attributeName,
        precision: 0,
      });

      const expectation = { min: 1, max: 500 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values when precision is 1', () => {
      const stats = { min: 1.12345, max: 499.56789 };
      const widget = connectRange(rendering)({
        attributeName,
        precision: 1,
      });

      const expectation = { min: 1.1, max: 499.6 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values when precision is 2', () => {
      const stats = { min: 1.12345, max: 499.56789 };
      const widget = connectRange(rendering)({
        attributeName,
        precision: 2,
      });

      const expectation = { min: 1.12, max: 499.57 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values when precision is 3', () => {
      const stats = { min: 1.12345, max: 499.56789 };
      const widget = connectRange(rendering)({
        attributeName,
        precision: 3,
      });

      const expectation = { min: 1.123, max: 499.568 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });
  });

  describe('_getCurrentRefinement', () => {
    const attributeName = 'price';
    const rendering = () => {};
    const createHelper = () => jsHelper(fakeClient);

    it('expect to return default refinement', () => {
      const widget = connectRange(rendering)({ attributeName });
      const helper = createHelper();

      const expectation = [-Infinity, Infinity];
      const actual = widget._getCurrentRefinement(helper);

      expect(actual).toEqual(expectation);
    });

    it('expect to return refinement from helper', () => {
      const widget = connectRange(rendering)({ attributeName });
      const helper = createHelper();

      helper.addNumericRefinement(attributeName, '>=', 10);
      helper.addNumericRefinement(attributeName, '<=', 100);

      const expectation = [10, 100];
      const actual = widget._getCurrentRefinement(helper);

      expect(actual).toEqual(expectation);
    });

    it('expect to return float refinement values', () => {
      const widget = connectRange(rendering)({ attributeName });
      const helper = createHelper();

      helper.addNumericRefinement(attributeName, '>=', 10.9);
      helper.addNumericRefinement(attributeName, '<=', 99.1);

      const expectation = [10.9, 99.1];
      const actual = widget._getCurrentRefinement(helper);

      expect(actual).toEqual(expectation);
    });
  });

  describe('_refine', () => {
    const attributeName = 'price';
    const rendering = () => {};
    const createHelper = () => {
      const helper = jsHelper(fakeClient);
      helper.search = jest.fn();
      const initialClearRefinements = helper.clearRefinements;
      helper.clearRefinements = jest.fn((...args) =>
        initialClearRefinements.apply(helper, args)
      );

      return helper;
    };

    it('expect to refine when range are not set', () => {
      const range = {};
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attributeName,
      });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).toHaveBeenCalledWith(attributeName);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine when values are in range', () => {
      const range = { min: 0, max: 500 };
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).toHaveBeenCalledWith(attributeName);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine when values are parsable integer', () => {
      const range = { min: 0, max: 500 };
      const values = ['10', '490'];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine when values are parsable float', () => {
      const range = { min: 0, max: 500 };
      const values = ['10.50', '490.50'];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10.5]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490.5]);
      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine min when user bounds are set and value is at range bound', () => {
      const range = { min: 10, max: 500 };
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attributeName,
        min: 10,
      });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine max when user bounds are set and value is at range bound', () => {
      const range = { min: 0, max: 490 };
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attributeName,
        max: 490,
      });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when value is undefined', () => {
      const range = { min: 0, max: 500 };
      const values = [undefined, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      helper.addNumericRefinement(attributeName, '>=', 10);
      helper.addNumericRefinement(attributeName, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual(
        undefined
      );
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).toHaveBeenCalledWith(attributeName);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when value is undefined', () => {
      const range = { min: 0, max: 500 };
      const values = [10, undefined];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      helper.addNumericRefinement(attributeName, '>=', 10);
      helper.addNumericRefinement(attributeName, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual(
        undefined
      );
      expect(helper.clearRefinements).toHaveBeenCalledWith(attributeName);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when value is empty string', () => {
      const range = { min: 0, max: 500 };
      const values = ['', 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      helper.addNumericRefinement(attributeName, '>=', 10);
      helper.addNumericRefinement(attributeName, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual(
        undefined
      );
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).toHaveBeenCalledWith(attributeName);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when value is empty string', () => {
      const range = { min: 0, max: 500 };
      const values = [10, ''];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      helper.addNumericRefinement(attributeName, '>=', 10);
      helper.addNumericRefinement(attributeName, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual(
        undefined
      );
      expect(helper.clearRefinements).toHaveBeenCalledWith(attributeName);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when user bounds are not set and value is at bounds', () => {
      const range = { min: 0, max: 500 };
      const values = [0, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      helper.addNumericRefinement(attributeName, '>=', 10);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual(
        undefined
      );
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).toHaveBeenCalledWith(attributeName);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when user bounds are not set and value is at bounds', () => {
      const range = { min: 0, max: 500 };
      const values = [10, 500];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      helper.addNumericRefinement(attributeName, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual(
        undefined
      );
      expect(helper.clearRefinements).toHaveBeenCalledWith(attributeName);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when user bounds are set and value is nullable', () => {
      const range = { min: 0, max: 500 };
      const values = [undefined, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attributeName,
        min: 10,
      });

      helper.addNumericRefinement(attributeName, '>=', 20);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when user bounds are set and value is nullable', () => {
      const range = { min: 0, max: 500 };
      const values = [10, undefined];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attributeName,
        max: 250,
      });

      helper.addNumericRefinement(attributeName, '>=', 240);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([250]);
      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it("expect to not refine when min it's out of range", () => {
      const range = { min: 10, max: 500 };
      const values = [0, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual(
        undefined
      );
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual(
        undefined
      );
      expect(helper.clearRefinements).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine when max it's out of range", () => {
      const range = { min: 0, max: 490 };
      const values = [10, 500];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual(
        undefined
      );
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual(
        undefined
      );
      expect(helper.clearRefinements).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine when values don't have changed from empty state", () => {
      const range = { min: 0, max: 500 };
      const values = [undefined, undefined];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual(
        undefined
      );
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual(
        undefined
      );
      expect(helper.clearRefinements).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine when values don't have changed from non empty state", () => {
      const range = { min: 0, max: 500 };
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      helper.addNumericRefinement(attributeName, '>=', 10);
      helper.addNumericRefinement(attributeName, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual([490]);
      expect(helper.clearRefinements).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it('expect to not refine when values are invalid', () => {
      const range = { min: 0, max: 500 };
      const values = ['ADASA', 'FFDSFQS'];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attributeName });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attributeName, '>=')).toEqual(
        undefined
      );
      expect(helper.getNumericRefinement(attributeName, '<=')).toEqual(
        undefined
      );
      expect(helper.clearRefinements).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });
  });

  describe('routing', () => {
    const getInitializedWidget = () => {
      const rendering = jest.fn();
      const makeWidget = connectRange(rendering);
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
        refine([20, 30]);
        const uiStateBefore = {};
        const uiStateAfter = widget.getWidgetState(uiStateBefore, {
          searchParameters: helper.state,
          helper,
        });
        expect(uiStateAfter).toMatchSnapshot();
      });

      test('should not override other values in the same namespace', () => {
        const [widget, helper, refine] = getInitializedWidget();
        refine([10, 20]);
        const uiStateBefore = {
          range: {
            'price-2': '15:20',
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
        refine([10, 20]);
        const uiStateBefore = {
          range: {
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
        // The user presses back (browser), and the URL is empty
        const uiState = {};
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying empty parameters on an empty should return the same search parameters
        expect(searchParametersAfter).toBe(searchParametersBefore);
      });
      test('should add the refinements according to the UI state provided (min and max)', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), and the URL contains a min and a max
        const uiState = {
          range: {
            price: '20:40',
          },
        };
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the new parameter should set the min and the max
        expect(searchParametersAfter).toMatchSnapshot();
      });
      test('should add the refinements according to the UI state provided (only max)', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), and the URL is empty
        const uiState = {
          range: {
            price: ':30',
          },
        };
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the new parameter should set the max
        expect(searchParametersAfter).toMatchSnapshot();
      });
      test('should add the refinements according to the UI state provided (only min)', () => {
        const [widget, helper] = getInitializedWidget();
        // The user presses back (browser), and the URL is empty
        const uiState = {
          range: {
            price: '10:',
          },
        };
        // The current search is empty
        const searchParametersBefore = SearchParameters.make(helper.state);
        const searchParametersAfter = widget.getWidgetSearchParameters(
          searchParametersBefore,
          { uiState }
        );
        // Applying the new parameter should set the min
        expect(searchParametersAfter).toMatchSnapshot();
      });
    });
  });
});
