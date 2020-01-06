import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectRange from '../connectRange';

describe('connectRange', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectRange()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/range-input/js/#connector, https://www.algolia.com/doc/api-reference/widgets/range-slider/js/#connector"
`);
    });

    it('throws without attribute', () => {
      expect(() => {
        connectRange(() => {})({ attribute: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attribute\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/range-input/js/#connector, https://www.algolia.com/doc/api-reference/widgets/range-slider/js/#connector"
`);
    });

    it('throws with `max` lower than `min`', () => {
      expect(() => {
        connectRange(() => {})({ attribute: 'price', min: 100, max: 50 });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`max\` option can't be lower than \`min\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/range-input/js/#connector, https://www.algolia.com/doc/api-reference/widgets/range-slider/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customRange = connectRange(render, unmount);
      const widget = customRange({ attribute: 'facet' });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.range',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),

          getWidgetState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectRange(rendering);

    const attribute = 'price';
    const widget = makeWidget({
      attribute,
    });

    const config = widget.getWidgetSearchParameters(new SearchParameters(), {
      uiState: {},
    });
    expect(config).toEqual(
      new SearchParameters({
        numericRefinements: { price: {} },
        disjunctiveFacets: [attribute],
      })
    );

    const helper = jsHelper({}, '', config);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering).toHaveBeenCalledTimes(1);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const { range, start, widgetParams } = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ][0];
      expect(range).toEqual({ min: 0, max: 0 });
      expect(start).toEqual([-Infinity, Infinity]);
      expect(widgetParams).toEqual({
        attribute,
        precision: 0,
      });
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ test: 'oneTime' }],
          facets: { price: { 10: 1, 20: 1, 30: 1 } },
          // eslint-disable-next-line @typescript-eslint/camelcase
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
      expect(rendering).toHaveBeenCalledTimes(2);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(false);

      // should provide good values for the first rendering
      const { range, start, widgetParams } = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ][0];
      expect(range).toEqual({ min: 10, max: 30 });
      expect(start).toEqual([-Infinity, Infinity]);
      expect(widgetParams).toEqual({
        attribute,
        precision: 0,
      });
    }
  });

  it('Accepts some user bounds', () => {
    const makeWidget = connectRange(() => {});

    const attribute = 'price';

    expect(
      makeWidget({
        attribute,
        min: 0,
      }).getWidgetSearchParameters(new SearchParameters(), { uiState: {} })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: [attribute],
        numericRefinements: {
          [attribute]: { '>=': [0] },
        },
      })
    );

    expect(
      makeWidget({
        attribute,
        max: 100,
      }).getWidgetSearchParameters(new SearchParameters(), { uiState: {} })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: [attribute],
        numericRefinements: {
          [attribute]: { '<=': [100] },
        },
      })
    );

    expect(
      makeWidget({
        attribute,
        min: 0,
        max: 100,
      }).getWidgetSearchParameters(new SearchParameters(), { uiState: {} })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: [attribute],
        numericRefinements: {
          [attribute]: {
            '>=': [0],
            '<=': [100],
          },
        },
      })
    );
  });

  it('Provides a function to update the refinements at each step', () => {
    const rendering = jest.fn();
    const makeWidget = connectRange(rendering);

    const attribute = 'price';
    const widget = makeWidget({
      attribute,
    });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters(), { uiState: {} })
    );
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      // first rendering
      expect(helper.getNumericRefinement('price', '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement('price', '<=')).toEqual(undefined);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine } = renderOptions;
      refine([10, 30]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      expect(helper.search).toHaveBeenCalledTimes(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ test: 'oneTime' }],
          facets: { price: { 10: 1, 20: 1, 30: 1 } },
          // eslint-disable-next-line @typescript-eslint/camelcase
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
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine } = renderOptions;
      refine([23, 27]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([23]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([27]);
      expect(helper.search).toHaveBeenCalledTimes(2);
    }
  });

  it('should add numeric refinement when refining min boundary without previous configuration', () => {
    const rendering = jest.fn();
    const makeWidget = connectRange(rendering);

    const attribute = 'price';
    const widget = makeWidget({ attribute, min: 0, max: 500 });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters(), { uiState: {} })
    );
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      // first rendering
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([500]);

      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine } = renderOptions;
      refine([10, 30]);

      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      expect(helper.search).toHaveBeenCalledTimes(1);

      refine([0, undefined]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([500]);
    }
  });

  it('should add numeric refinement when refining min boundary with previous configuration', () => {
    const rendering = jest.fn();
    const makeWidget = connectRange(rendering);

    const attribute = 'price';
    const widget = makeWidget({ attribute, min: 0, max: 500 });
    const configuration = widget.getWidgetSearchParameters(
      new SearchParameters({
        indexName: 'movie',
      }),
      { uiState: {} }
    );

    const helper = jsHelper({}, '', configuration);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      // first rendering
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([500]);

      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine } = renderOptions;
      refine([10, 30]);

      expect(helper.getNumericRefinement('price', '>=')).toEqual([10]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([30]);
      expect(helper.search).toHaveBeenCalledTimes(1);

      refine([0, undefined]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([500]);
    }
  });

  it('should refine on boundaries when no min/max defined', () => {
    const rendering = jest.fn();
    const makeWidget = connectRange(rendering);

    const attribute = 'price';
    const widget = makeWidget({ attribute });

    const helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters(), { uiState: {} })
    );
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      expect(helper.getNumericRefinement('price', '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement('price', '<=')).toEqual(undefined);

      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine } = renderOptions;

      refine([undefined, 100]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([100]);
      expect(helper.search).toHaveBeenCalledTimes(1);

      refine([0, undefined]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([]);
      expect(helper.search).toHaveBeenCalledTimes(2);

      refine([0, 100]);
      expect(helper.getNumericRefinement('price', '>=')).toEqual([0]);
      expect(helper.getNumericRefinement('price', '<=')).toEqual([100]);
      expect(helper.search).toHaveBeenCalledTimes(3);
    }
  });

  describe('_getCurrentRange', () => {
    const attribute = 'price';
    const rendering = () => {};

    it('expect to return default range', () => {
      const stats = {};
      const widget = connectRange(rendering)({
        attribute,
      });

      const expectation = { min: 0, max: 0 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return range from bounds', () => {
      const stats = { min: 10, max: 500 };
      const widget = connectRange(rendering)({
        attribute,
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
        attribute,
      });

      const expectation = { min: 10, max: 500 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values when precision is 0', () => {
      const stats = { min: 1.79, max: 499.99 };
      const widget = connectRange(rendering)({
        attribute,
        precision: 0,
      });

      const expectation = { min: 1, max: 500 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values when precision is 1', () => {
      const stats = { min: 1.12345, max: 499.56789 };
      const widget = connectRange(rendering)({
        attribute,
        precision: 1,
      });

      const expectation = { min: 1.1, max: 499.6 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values when precision is 2', () => {
      const stats = { min: 1.12345, max: 499.56789 };
      const widget = connectRange(rendering)({
        attribute,
        precision: 2,
      });

      const expectation = { min: 1.12, max: 499.57 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });

    it('expect to return rounded range values when precision is 3', () => {
      const stats = { min: 1.12345, max: 499.56789 };
      const widget = connectRange(rendering)({
        attribute,
        precision: 3,
      });

      const expectation = { min: 1.123, max: 499.568 };
      const actual = widget._getCurrentRange(stats);

      expect(actual).toEqual(expectation);
    });
  });

  describe('_getCurrentRefinement', () => {
    const attribute = 'price';
    const rendering = () => {};
    const createHelper = () => jsHelper({});

    it('expect to return default refinement', () => {
      const widget = connectRange(rendering)({ attribute });
      const helper = createHelper();

      const expectation = [-Infinity, Infinity];
      const actual = widget._getCurrentRefinement(helper);

      expect(actual).toEqual(expectation);
    });

    it('expect to return refinement from helper', () => {
      const widget = connectRange(rendering)({ attribute });
      const helper = createHelper();

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 100);

      const expectation = [10, 100];
      const actual = widget._getCurrentRefinement(helper);

      expect(actual).toEqual(expectation);
    });

    it('expect to return float refinement values', () => {
      const widget = connectRange(rendering)({ attribute });
      const helper = createHelper();

      helper.addNumericRefinement(attribute, '>=', 10.9);
      helper.addNumericRefinement(attribute, '<=', 99.1);

      const expectation = [10.9, 99.1];
      const actual = widget._getCurrentRefinement(helper);

      expect(actual).toEqual(expectation);
    });
  });

  describe('_refine', () => {
    const attribute = 'price';
    const rendering = () => {};
    const createHelper = () => {
      const helper = jsHelper({});
      helper.search = jest.fn();
      jest.spyOn(helper, 'removeNumericRefinement');
      return helper;
    };

    it('expect to refine when range are not set', () => {
      const range = {};
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attribute,
      });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).toHaveBeenCalledWith(attribute);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine when values are in range', () => {
      const range = { min: 0, max: 500 };
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).toHaveBeenCalledWith(attribute);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine when values are parsable integer', () => {
      const range = { min: 0, max: 500 };
      const values = ['10', '490'];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine when values are parsable float', () => {
      const range = { min: 0, max: 500 };
      const values = ['10.50', '490.50'];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([11]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([491]);
      expect(helper.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine min when user bounds are set and value is at range bound', () => {
      const range = { min: 10, max: 500 };
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attribute,
        min: 10,
      });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine max when user bounds are set and value is at range bound', () => {
      const range = { min: 0, max: 490 };
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attribute,
        max: 490,
      });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when value is undefined', () => {
      const range = { min: 0, max: 500 };
      const values = [undefined, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).toHaveBeenCalledWith(attribute);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when value is undefined', () => {
      const range = { min: 0, max: 500 };
      const values = [10, undefined];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([]);
      expect(helper.removeNumericRefinement).toHaveBeenCalledWith(attribute);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when value is empty string', () => {
      const range = { min: 0, max: 500 };
      const values = ['', 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).toHaveBeenCalledWith(attribute);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when value is empty string', () => {
      const range = { min: 0, max: 500 };
      const values = [10, ''];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([]);
      expect(helper.removeNumericRefinement).toHaveBeenCalledWith(attribute);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when user bounds are not set and value is at bounds', () => {
      const range = { min: 0, max: 500 };
      const values = [0, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.addNumericRefinement(attribute, '>=', 10);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).toHaveBeenCalledWith(attribute);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when user bounds are not set and value is at bounds', () => {
      const range = { min: 0, max: 500 };
      const values = [10, 500];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.addNumericRefinement(attribute, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([]);
      expect(helper.removeNumericRefinement).toHaveBeenCalledWith(attribute);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when user bounds are set and value is nullable', () => {
      const range = { min: 0, max: 500 };
      const values = [undefined, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attribute,
        min: 10,
      });

      helper.addNumericRefinement(attribute, '>=', 20);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when user bounds are set and value is nullable', () => {
      const range = { min: 0, max: 500 };
      const values = [10, undefined];
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attribute,
        max: 250,
      });

      helper.addNumericRefinement(attribute, '>=', 240);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([250]);
      expect(helper.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it("expect to not refine when min it's out of range", () => {
      const range = { min: 10, max: 500 };
      const values = [0, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual(undefined);
      expect(helper.removeNumericRefinement).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine when max it's out of range", () => {
      const range = { min: 0, max: 490 };
      const values = [10, 500];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual(undefined);
      expect(helper.removeNumericRefinement).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine when values don't have changed from empty state", () => {
      const range = { min: 0, max: 500 };
      const values = [undefined, undefined];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual(undefined);
      expect(helper.removeNumericRefinement).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine when values don't have changed from non empty state", () => {
      const range = { min: 0, max: 500 };
      const values = [10, 490];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.removeNumericRefinement).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it('expect to not refine when values are invalid', () => {
      const range = { min: 0, max: 500 };
      const values = ['ADASA', 'FFDSFQS'];
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      widget._refine(helper, range)(values);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual(undefined);
      expect(helper.removeNumericRefinement).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('does not throw without the unmount function', () => {
      const rendering = () => {};
      const makeWidget = connectRange(rendering);
      const attribute = 'price';
      const widget = makeWidget({ attribute });
      const helper = jsHelper(
        {},
        '',
        widget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        })
      );
      expect(() =>
        widget.dispose({ helper, state: helper.state })
      ).not.toThrow();
    });

    it('removes empty refinement', () => {
      const rendering = () => {};
      const makeWidget = connectRange(rendering);
      const attribute = 'price';
      const indexName = '';
      const widget = makeWidget({ attribute });
      const helper = jsHelper(
        {},
        indexName,
        widget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        })
      );

      const newState = widget.dispose({ helper, state: helper.state });

      expect(newState).toEqual(new SearchParameters({ index: indexName }));
    });

    it('removes active refinement', () => {
      const rendering = jest.fn();
      const makeWidget = connectRange(rendering);
      const attribute = 'price';
      const indexName = '';
      const widget = makeWidget({ attribute });
      const helper = jsHelper(
        {},
        indexName,
        widget.getWidgetSearchParameters(new SearchParameters(), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init({
        helper,
        state: helper.state,
        createURL: () => '#',
      });

      const renderOptions = rendering.mock.calls[0][0];
      const { refine } = renderOptions;

      refine([100, 1000]);

      expect(helper.state).toEqual(
        new SearchParameters({
          index: indexName,
          disjunctiveFacets: ['price'],
          numericRefinements: {
            price: {
              '<=': [1000],
              '>=': [100],
            },
          },
        })
      );

      const newState = widget.dispose({ helper, state: helper.state });

      expect(newState).toEqual(new SearchParameters({ index: indexName }));
    });
  });
});

describe('getWidgetState', () => {
  test('returns the `uiState` empty', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName');
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetState(
      {},
      {
        searchParameters: helper.state,
      }
    );

    expect(actual).toEqual({});
  });

  test('returns the `uiState` empty with empty refinements', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '>=': [],
          '<=': [],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetState(
      {},
      {
        searchParameters: helper.state,
      }
    );

    expect(actual).toEqual({});
  });

  test('returns the `uiState` with a lower refinement', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '>=': [100],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetState(
      {},
      {
        searchParameters: helper.state,
      }
    );

    expect(actual).toEqual({
      range: {
        price: '100:',
      },
    });
  });

  test('returns the `uiState` with an upper refinement', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '<=': [1000],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetState(
      {},
      {
        searchParameters: helper.state,
      }
    );

    expect(actual).toEqual({
      range: {
        price: ':1000',
      },
    });
  });

  test('returns the `uiState` with a lower and upper refinement', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '<=': [1000],
          '>=': [100],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetState(
      {},
      {
        searchParameters: helper.state,
      }
    );

    expect(actual).toEqual({
      range: {
        price: '100:1000',
      },
    });
  });

  test('returns the `uiState` with an empty upper refinement', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '>=': [100],
          '<=': [],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetState(
      {},
      {
        searchParameters: helper.state,
      }
    );

    expect(actual).toEqual({
      range: {
        price: '100:',
      },
    });
  });

  test('returns the `uiState` with an empty lower refinement', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '>=': [],
          '<=': [1000],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetState(
      {},
      {
        searchParameters: helper.state,
      }
    );

    expect(actual).toEqual({
      range: {
        price: ':1000',
      },
    });
  });

  test('returns the `uiState` without namespace overridden', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '<=': [1000],
          '>=': [100],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetState(
      {
        range: {
          age: '16:',
        },
      },
      {
        searchParameters: helper.state,
      }
    );

    expect(actual).toEqual({
      range: {
        age: '16:',
        price: '100:1000',
      },
    });
  });
});

describe('getWidgetSearchParameters', () => {
  test('returns the `SearchParameters` with the default value without the previous refinement', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '<=': [1000],
          '>=': [100],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetSearchParameters(helper.state, {
      uiState: {},
    });

    expect(actual.disjunctiveFacets).toEqual(['price']);
    expect(actual.numericRefinements).toEqual({
      price: {},
    });
  });

  test('returns the `SearchParameters` without overriding previous disjunctive facets', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      disjunctiveFacets: ['price', 'brand'],
      numericRefinements: {
        price: {
          '<=': [1000],
          '>=': [100],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetSearchParameters(helper.state, {
      uiState: {},
    });

    expect(actual.disjunctiveFacets).toEqual(['price', 'brand']);
    expect(actual.numericRefinements).toEqual({
      price: {},
    });
  });

  test('returns the `SearchParameters` with the value from `uiState`', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName');
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetSearchParameters(helper.state, {
      uiState: {
        range: {
          price: '100:1000',
        },
      },
    });

    expect(actual.disjunctiveFacets).toEqual(['price']);
    expect(actual.numericRefinements).toEqual({
      price: {
        '<=': [1000],
        '>=': [100],
      },
    });
  });

  test('returns the `SearchParameters` with only the min value from `uiState`', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName');
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetSearchParameters(helper.state, {
      uiState: {
        range: {
          price: '100:',
        },
      },
    });

    expect(actual.disjunctiveFacets).toEqual(['price']);
    expect(actual.numericRefinements).toEqual({
      price: {
        '>=': [100],
      },
    });
  });

  test('returns the `SearchParameters` with only the max value from `uiState`', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName');
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetSearchParameters(helper.state, {
      uiState: {
        range: {
          price: ':1000',
        },
      },
    });

    expect(actual.disjunctiveFacets).toEqual(['price']);
    expect(actual.numericRefinements).toEqual({
      price: {
        '<=': [1000],
      },
    });
  });

  test('returns the default `SearchParameters` with an undefined value from `uiState`', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName');
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetSearchParameters(helper.state, {
      uiState: {
        range: {},
      },
    });

    expect(actual.disjunctiveFacets).toEqual(['price']);
    expect(actual.numericRefinements).toEqual({
      price: {},
    });
  });

  test('returns the default `SearchParameters` with non-number values from `uiState`', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName');
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetSearchParameters(helper.state, {
      uiState: {
        range: {
          price: 'min:max',
        },
      },
    });

    expect(actual.disjunctiveFacets).toEqual(['price']);
    expect(actual.numericRefinements).toEqual({
      price: {},
    });
  });

  test('returns the default `SearchParameters` with a malformatted value from `uiState`', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName');
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetSearchParameters(helper.state, {
      uiState: {
        range: {
          price: 'wrong-format',
        },
      },
    });

    expect(actual.disjunctiveFacets).toEqual(['price']);
    expect(actual.numericRefinements).toEqual({
      price: {},
    });
  });

  test('returns the `SearchParameters` with the other numeric refinements from `SearchParameters`', () => {
    const render = jest.fn();
    const makeWidget = connectRange(render);
    const helper = jsHelper({}, 'indexName', {
      numericRefinements: {
        age: {
          '>=': [16],
        },
      },
    });
    const widget = makeWidget({
      attribute: 'price',
    });

    const actual = widget.getWidgetSearchParameters(helper.state, {
      uiState: {
        range: {
          price: '100:1000',
        },
      },
    });

    expect(actual.disjunctiveFacets).toEqual(['price']);
    expect(actual.numericRefinements).toEqual({
      age: {
        '>=': [16],
      },
      price: {
        '<=': [1000],
        '>=': [100],
      },
    });
  });

  const attribute = 'price';
  const rendering = () => {};

  it('expect to return default configuration', () => {
    const widget = connectRange(rendering)({
      attribute,
    });

    const actual = widget.getWidgetSearchParameters(new SearchParameters(), {
      uiState: {},
    });

    expect(actual).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['price'],
        numericRefinements: {
          price: {},
        },
      })
    );
  });

  it('expect to return default configuration if previous one has already numeric refinements', () => {
    const widget = connectRange(rendering)({
      attribute,
      max: 500,
    });

    const actual = widget.getWidgetSearchParameters(
      new SearchParameters({
        numericRefinements: {
          price: {
            '<=': [500],
          },
        },
      }),
      { uiState: {} }
    );

    expect(actual).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['price'],
        numericRefinements: {
          price: {
            '<=': [500],
          },
        },
      })
    );
  });

  it('expect to return configuration with min numeric refinement', () => {
    const widget = connectRange(rendering)({
      attribute,
      min: 10,
    });

    const expectation = new SearchParameters({
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '>=': [10],
        },
      },
    });

    const actual = widget.getWidgetSearchParameters(new SearchParameters(), {
      uiState: {},
    });

    expect(actual).toEqual(expectation);
  });

  it('expect to return configuration with max numeric refinement', () => {
    const widget = connectRange(rendering)({
      attribute,
      max: 10,
    });

    const expectation = new SearchParameters({
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '<=': [10],
        },
      },
    });

    const actual = widget.getWidgetSearchParameters(new SearchParameters(), {
      uiState: {},
    });

    expect(actual).toEqual(expectation);
  });

  it('expect to return configuration with both numeric refinements', () => {
    const widget = connectRange(rendering)({
      attribute,
      min: 10,
      max: 500,
    });

    const expectation = new SearchParameters({
      disjunctiveFacets: ['price'],
      numericRefinements: {
        price: {
          '>=': [10],
          '<=': [500],
        },
      },
    });

    const actual = widget.getWidgetSearchParameters(new SearchParameters(), {
      uiState: {},
    });

    expect(actual).toEqual(expectation);
  });
});
