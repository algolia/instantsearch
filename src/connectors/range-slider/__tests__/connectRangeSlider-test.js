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

  describe('getConfiguration', () => {
    const attributeName = 'price';
    const rendering = () => {};

    it('expect to return default configuration', () => {
      const currentConfiguration = {};
      const widget = connectRangeSlider(rendering)({
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

      const widget = connectRangeSlider(rendering)({
        attributeName,
        max: 500,
      });

      const expectation = { disjunctiveFacets: ['price'] };
      const actual = widget.getConfiguration(currentConfiguration);

      expect(actual).toEqual(expectation);
    });

    it('expect to return configuration with added numeric refinements', () => {
      const currentConfiguration = {};
      const widget = connectRangeSlider(rendering)({
        attributeName,
        max: 500,
      });

      const expectation = {
        disjunctiveFacets: ['price'],
        numericRefinements: {
          price: {
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
      const widget = connectRangeSlider(rendering)({
        attributeName,
      });

      const expectation = { min: 0, max: 0 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return range from bounds', () => {
      const stats = { min: 10, max: 500 };
      const widget = connectRangeSlider(rendering)({
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
      const widget = connectRangeSlider(rendering)({
        attributeName,
      });

      const expectation = { min: 10, max: 500 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values', () => {
      const stats = { min: 1.79, max: 499.99 };
      const widget = connectRangeSlider(rendering)({
        attributeName,
      });

      const expectation = { min: 1, max: 500 };
      const actual = widget._getCurrentRange(stats);

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

  describe('_refine', () => {
    const attributeName = 'price';
    const rendering = () => {};

    it('expect to refine min and max from empty state', () => {
      const values = [0, 500];
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        getNumericRefinement: jest.fn(() => []),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '>=',
        0
      );

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '<=',
        500
      );

      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine min and max from non empty state', () => {
      const values = [20, 480];
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        getNumericRefinement: jest.fn(
          (_, operation) => (operation === '>=' ? 0 : 500)
        ),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '>=',
        20
      );

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '<=',
        480
      );

      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine min from empty state', () => {
      const values = [0, null];
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        getNumericRefinement: jest.fn(() => []),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '>=',
        0
      );

      expect(helper.addNumericRefinement).not.toHaveBeenCalledWith(
        attributeName,
        '<=',
        expect.any(Number)
      );

      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine min from non empty state', () => {
      const values = [20, 500];
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        getNumericRefinement: jest.fn(
          (_, operation) => (operation === '>=' ? 0 : 500)
        ),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '>=',
        20
      );

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '<=',
        500
      );

      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine min when it is equal to bounds', () => {
      const values = [20, 500];
      const widget = connectRangeSlider(rendering)({
        attributeName,
        min: 20,
      });

      const helper = {
        getNumericRefinement: jest.fn(
          (_, operation) => (operation === '>=' ? 50 : 500)
        ),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '>=',
        20
      );

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '<=',
        500
      );

      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine max from empty state', () => {
      const values = [null, 250];
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        getNumericRefinement: jest.fn(() => []),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).not.toHaveBeenCalledWith(
        attributeName,
        '>=',
        expect.any(Number)
      );

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '<=',
        250
      );

      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine max from non empty state', () => {
      const values = [0, 250];
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        getNumericRefinement: jest.fn(
          (_, operation) => (operation === '>=' ? 0 : 500)
        ),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '>=',
        0
      );

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '<=',
        250
      );

      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine max when it is equal to bounds', () => {
      const values = [20, 450];
      const widget = connectRangeSlider(rendering)({
        attributeName,
        max: 450,
      });

      const helper = {
        getNumericRefinement: jest.fn(
          (_, operation) => (operation === '>=' ? 20 : 500)
        ),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '>=',
        20
      );

      expect(helper.addNumericRefinement).toHaveBeenCalledWith(
        attributeName,
        '<=',
        450
      );

      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it("expect to not refine when both min and max aren't changed", () => {
      const values = [0, 500];
      const widget = connectRangeSlider(rendering)({ attributeName });
      const helper = {
        getNumericRefinement: jest.fn(
          (_, operation) => (operation === '>=' ? 0 : 500)
        ),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).not.toHaveBeenCalledWith();
      expect(helper.addNumericRefinement).not.toHaveBeenCalledWith();
      expect(helper.clearRefinements).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine min when it's out of bounds", () => {
      const values = [0, 500];
      const widget = connectRangeSlider(rendering)({
        attributeName,
        min: 50,
      });

      const helper = {
        getNumericRefinement: jest.fn(
          (_, operation) => (operation === '>=' ? 50 : 500)
        ),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).not.toHaveBeenCalledWith();
      expect(helper.addNumericRefinement).not.toHaveBeenCalledWith();
      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it("expect to not refine max when it's out of bounds", () => {
      const values = [0, 480];
      const widget = connectRangeSlider(rendering)({
        attributeName,
        max: 450,
      });

      const helper = {
        getNumericRefinement: jest.fn(
          (_, operation) => (operation === '>=' ? 0 : 450)
        ),
        addNumericRefinement: jest.fn(),
        clearRefinements: jest.fn(),
        search: jest.fn(),
      };

      widget._refine(helper)(values);

      expect(helper.addNumericRefinement).not.toHaveBeenCalledWith();
      expect(helper.addNumericRefinement).not.toHaveBeenCalledWith();
      expect(helper.clearRefinements).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });
  });
});
