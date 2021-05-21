import jsHelper, {
  SearchResults,
  SearchParameters,
  AlgoliaSearchHelper,
} from 'algoliasearch-helper';
import connectRange from '../connectRange';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import instantsearch from '../../../lib/main';

function createFacetStatsResults({
  helper,
  attribute,
  min,
  max,
}: {
  helper: AlgoliaSearchHelper;
  attribute: string;
  min: number;
  max: number;
}): SearchResults {
  return new SearchResults(helper.state, [
    createSingleSearchResponse({
      facets: { [attribute]: { [min]: 10000, [max]: 1 } },
      facets_stats: {
        [attribute]: {
          min,
          max,
          avg: min,
          sum: max,
        },
      },
    }),
  ]);
}

describe('connectRange', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-ignore
        connectRange()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/range-input/js/#connector, https://www.algolia.com/doc/api-reference/widgets/range-slider/js/#connector"
`);
    });

    it('throws without attribute', () => {
      expect(() => {
        // @ts-ignore
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

          getWidgetUiState: expect.any(Function),
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

    const config = widget.getWidgetSearchParameters!(new SearchParameters(), {
      uiState: {},
    });
    expect(config).toEqual(
      new SearchParameters({
        numericRefinements: { price: {} },
        disjunctiveFacets: [attribute],
      })
    );

    const helper = jsHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

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

    widget.render!(
      createRenderOptions({
        results: createFacetStatsResults({
          min: 10,
          max: 30,
          helper,
          attribute: 'price',
        }),
        helper,
      })
    );

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
      }).getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
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
      }).getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
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
      }).getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

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

    widget.render!(
      createRenderOptions({
        results: createFacetStatsResults({
          min: 10,
          max: 30,
          helper,
          attribute: 'price',
        }),
        state: helper.state,
        helper,
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
    );
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

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
    const configuration = widget.getWidgetSearchParameters!(
      new SearchParameters({
        index: 'movie',
      }),
      { uiState: {} }
    );

    const helper = jsHelper(createSearchClient(), '', configuration);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        instantSearchInstance: createInstantSearch(),
      })
    );

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
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
      })
    );

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

  describe('range', () => {
    const attribute = 'price';
    const rendering = () => {};

    it('expect to return default range', () => {
      const widget = connectRange(rendering)({
        attribute,
      });

      const { range } = widget.getWidgetRenderState(createInitOptions());

      expect(range).toEqual({ min: 0, max: 0 });
    });

    it('expect to return range from bounds', () => {
      const widget = connectRange(rendering)({
        attribute,
        min: 20,
        max: 250,
      });

      const helper = jsHelper(createSearchClient(), '');

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { range } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 10,
            max: 500,
          }),
        })
      );

      expect(range).toEqual({ min: 20, max: 250 });
    });

    it('expect to return range from stats', () => {
      const widget = connectRange(rendering)({
        attribute,
      });
      const helper = jsHelper(createSearchClient(), '');

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { range } = widget.getWidgetRenderState(
        createRenderOptions({
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 10,
            max: 500,
          }),
        })
      );

      expect(range).toEqual({ min: 10, max: 500 });
    });

    it('expect to return rounded range values when precision is 0', () => {
      const widget = connectRange(rendering)({
        attribute,
        precision: 0,
      });
      const helper = jsHelper(createSearchClient(), '');

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { range } = widget.getWidgetRenderState(
        createRenderOptions({
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 1.79,
            max: 499.99,
          }),
        })
      );

      expect(range).toEqual({ min: 1, max: 500 });
    });

    it('expect to return rounded range values when precision is 1', () => {
      const widget = connectRange(rendering)({
        attribute,
        precision: 1,
      });
      const helper = jsHelper(createSearchClient(), '');

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { range } = widget.getWidgetRenderState(
        createRenderOptions({
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 1.12345,
            max: 499.56789,
          }),
        })
      );

      expect(range).toEqual({ min: 1.1, max: 499.6 });
    });

    it('expect to return rounded range values when precision is 2', () => {
      const widget = connectRange(rendering)({
        attribute,
        precision: 2,
      });
      const helper = jsHelper(createSearchClient(), '');

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { range } = widget.getWidgetRenderState(
        createRenderOptions({
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 1.12345,
            max: 499.56789,
          }),
        })
      );

      expect(range).toEqual({ min: 1.12, max: 499.57 });
    });

    it('expect to return rounded range values when precision is 3', () => {
      const widget = connectRange(rendering)({
        attribute,
        precision: 3,
      });
      const helper = jsHelper(createSearchClient(), '');

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { range } = widget.getWidgetRenderState(
        createRenderOptions({
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 1.12345,
            max: 499.56789,
          }),
        })
      );

      expect(range).toEqual({ min: 1.123, max: 499.568 });
    });
  });

  describe('start', () => {
    const attribute = 'price';
    const rendering = () => {};
    const createHelper = () => jsHelper(createSearchClient(), '');

    it('expect to return default refinement', () => {
      const widget = connectRange(rendering)({ attribute });
      const helper = createHelper();

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { start } = widget.getWidgetRenderState(
        createRenderOptions({
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      expect(start).toEqual([-Infinity, Infinity]);
    });

    it('expect to return refinement from helper', () => {
      const widget = connectRange(rendering)({ attribute });
      const helper = createHelper();

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );
      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 100);

      const { start } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      expect(start).toEqual([10, 100]);
    });

    it('expect to return float refinement values', () => {
      const widget = connectRange(rendering)({ attribute });
      const helper = createHelper();

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );
      helper.addNumericRefinement(attribute, '>=', 10.9);
      helper.addNumericRefinement(attribute, '<=', 99.1);

      const { start } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      expect(start).toEqual([10.9, 99.1]);
    });
  });

  describe('refine', () => {
    const attribute = 'price';
    const rendering = () => {};
    const createHelper = () => {
      const helper = jsHelper(createSearchClient(), '');
      helper.search = jest.fn();
      jest.spyOn(helper.state, 'removeNumericRefinement');
      return helper;
    };

    it('resets the page', () => {
      const helper = createHelper();
      helper.setPage(5);
      const widget = connectRange(rendering)({
        attribute,
      });

      const { refine } = widget.getWidgetRenderState(
        createInitOptions({ helper })
      );

      refine([10, 490]);

      expect(helper.state.page).toBe(0);
    });

    it('expect to refine when range are not set', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attribute,
      });

      const { refine } = widget.getWidgetRenderState(
        createInitOptions({ helper })
      );

      refine([10, 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalledWith(
        attribute
      );
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine when values are in range', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            min: 0,
            max: 500,
            helper,
            attribute,
          }),
        })
      );

      refine([10, 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalledWith(
        attribute
      );
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine when values are parsable integer', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            min: 0,
            max: 500,
            helper,
            attribute: 'price',
          }),
        })
      );

      // @ts-ignore
      refine(['10', '490']);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine when values are parsable float', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            min: 0,
            max: 500,
            helper,
            attribute: 'price',
          }),
        })
      );

      // @ts-ignore
      refine(['10.50', '490.50']);

      // min is rounded down, max rounded up
      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([491]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine min when user bounds are set and value is at range bound', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute, min: 10 });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            min: 10,
            max: 500,
            helper,
            attribute: 'price',
          }),
        })
      );

      refine([10, 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to refine max when user bounds are set and value is at range bound', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attribute,
        max: 490,
      });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            min: 0,
            max: 490,
            helper,
            attribute: 'price',
          }),
        })
      );

      refine([10, 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when value is undefined', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      refine([undefined, 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalledWith(
        attribute
      );
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when value is undefined', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      refine([10, undefined]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalledWith(
        attribute
      );
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when value is empty string', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      // @ts-ignore
      refine(['', 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalledWith(
        attribute
      );
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when value is empty string', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      // @ts-ignore
      refine([10, '']);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalledWith(
        attribute
      );
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when user bounds are not set and value is at bounds', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      helper.addNumericRefinement(attribute, '>=', 10);

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      refine([0, 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalledWith(
        attribute
      );
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when user bounds are not set and value is at bounds', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      helper.addNumericRefinement(attribute, '<=', 490);

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      refine([10, 500]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalledWith(
        attribute
      );
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset min refinement when user bounds are set and value is nullable', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attribute,
        min: 10,
      });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      helper.addNumericRefinement(attribute, '>=', 20);

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      refine([undefined, 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to reset max refinement when user bounds are set and value is nullable', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({
        attribute,
        max: 250,
      });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      helper.addNumericRefinement(attribute, '>=', 240);

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      refine([10, undefined]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([250]);
      expect(helper.state.removeNumericRefinement).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it("expect to not refine when min it's out of range", () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 10,
            max: 500,
          }),
        })
      );

      refine([0, 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual(undefined);
      expect(helper.state.removeNumericRefinement).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine when max it's out of range", () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 490,
          }),
        })
      );

      refine([10, 500]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual(undefined);
      expect(helper.state.removeNumericRefinement).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine when values don't have changed from empty state", () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      refine([undefined, undefined]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual(undefined);
      expect(helper.state.removeNumericRefinement).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it("expect to not refine when values don't have changed from non empty state", () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });

      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      helper.addNumericRefinement(attribute, '>=', 10);
      helper.addNumericRefinement(attribute, '<=', 490);

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      refine([10, 490]);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual([10]);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual([490]);
      expect(helper.state.removeNumericRefinement).not.toHaveBeenCalled();
      expect(helper.search).not.toHaveBeenCalled();
    });

    it('expect to not refine when values are invalid', () => {
      const helper = createHelper();
      const widget = connectRange(rendering)({ attribute });
      helper.setState(
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} })
      );

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: createFacetStatsResults({
            helper,
            attribute,
            min: 0,
            max: 500,
          }),
        })
      );

      // @ts-ignore
      refine(['ADASA', 'FFDSFQS']);

      expect(helper.getNumericRefinement(attribute, '>=')).toEqual(undefined);
      expect(helper.getNumericRefinement(attribute, '<=')).toEqual(undefined);
      expect(helper.state.removeNumericRefinement).not.toHaveBeenCalled();
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
        createSearchClient(),
        '',
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );
      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('removes empty refinement', () => {
      const rendering = () => {};
      const makeWidget = connectRange(rendering);
      const attribute = 'price';
      const indexName = '';
      const widget = makeWidget({ attribute });
      const helper = jsHelper(
        createSearchClient(),
        indexName,
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );

      const newState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      );

      expect(newState).toEqual(new SearchParameters({ index: indexName }));
    });

    it('removes active refinement', () => {
      const rendering = jest.fn();
      const makeWidget = connectRange(rendering);
      const attribute = 'price';
      const indexName = '';
      const widget = makeWidget({ attribute });
      const helper = jsHelper(
        createSearchClient(),
        indexName,
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          helper,
        })
      );

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

      const newState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      );

      expect(newState).toEqual(new SearchParameters({ index: indexName }));
    });
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` empty', () => {
      const render = jest.fn();
      const makeWidget = connectRange(render);
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'price',
      });

      const actual = widget.getWidgetUiState!(
        {},
        {
          helper,
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` empty with empty refinements', () => {
      const render = jest.fn();
      const makeWidget = connectRange(render);
      const helper = jsHelper(createSearchClient(), 'indexName', {
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

      const actual = widget.getWidgetUiState!(
        {},
        {
          helper,
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a lower refinement', () => {
      const render = jest.fn();
      const makeWidget = connectRange(render);
      const helper = jsHelper(createSearchClient(), 'indexName', {
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

      const actual = widget.getWidgetUiState!(
        {},
        {
          helper,
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
      const helper = jsHelper(createSearchClient(), 'indexName', {
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

      const actual = widget.getWidgetUiState!(
        {},
        {
          helper,
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
      const helper = jsHelper(createSearchClient(), 'indexName', {
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

      const actual = widget.getWidgetUiState!(
        {},
        {
          helper,
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
      const helper = jsHelper(createSearchClient(), 'indexName', {
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

      const actual = widget.getWidgetUiState!(
        {},
        {
          helper,
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
      const helper = jsHelper(createSearchClient(), 'indexName', {
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

      const actual = widget.getWidgetUiState!(
        {},
        {
          helper,
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
      const helper = jsHelper(createSearchClient(), 'indexName', {
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

      const actual = widget.getWidgetUiState!(
        {
          range: {
            age: '16:',
          },
        },
        {
          helper,
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

  describe('getRenderState', () => {
    it('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRange = connectRange(renderFn, unmountFn);
      const rangeWidget = createRange({
        attribute: 'price',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['price'],
        numericRefinements: {
          price: {
            '<=': [1000],
            '>=': [0],
          },
        },
      });

      const renderState1 = rangeWidget.getRenderState(
        {},
        createInitOptions({ state: helper.state, helper })
      );

      expect(renderState1.range).toEqual({
        price: {
          format: {
            from: expect.any(Function),
            to: expect.any(Function),
          },
          range: {
            max: 0,
            min: 0,
          },
          canRefine: false,
          refine: expect.any(Function),
          sendEvent: expect.any(Function),
          start: [0, 1000],
          widgetParams: {
            attribute: 'price',
            precision: 0,
          },
        },
      });

      const renderState2 = rangeWidget.getRenderState(
        {},
        createRenderOptions({
          helper,
          state: helper.state,
          results: createFacetStatsResults({
            min: 10,
            max: 30,
            helper,
            attribute: 'price',
          }),
        })
      );

      expect(renderState2.range).toEqual({
        price: {
          format: {
            from: expect.any(Function),
            to: expect.any(Function),
          },
          range: {
            min: 10,
            max: 30,
          },
          canRefine: true,
          refine: expect.any(Function),
          sendEvent: expect.any(Function),
          start: [0, 1000],
          widgetParams: {
            attribute: 'price',
            precision: 0,
          },
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRange = connectRange(renderFn, unmountFn);
      const rangeWidget = createRange({
        attribute: 'price',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['price'],
        numericRefinements: {
          price: {
            '<=': [1000],
            '>=': [0],
          },
        },
      });

      const renderState1 = rangeWidget.getWidgetRenderState(
        createInitOptions({ state: helper.state, helper })
      );

      expect(renderState1).toEqual({
        format: {
          from: expect.any(Function),
          to: expect.any(Function),
        },
        range: {
          max: 0,
          min: 0,
        },
        canRefine: false,
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        start: [0, 1000],
        widgetParams: {
          attribute: 'price',
          precision: 0,
        },
      });

      const renderState2 = rangeWidget.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results: createFacetStatsResults({
            min: 10,
            max: 30,
            helper,
            attribute: 'price',
          }),
        })
      );

      expect(renderState2).toEqual({
        format: {
          from: expect.any(Function),
          to: expect.any(Function),
        },
        range: {
          max: 30,
          min: 10,
        },
        canRefine: true,
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        start: [0, 1000],
        widgetParams: {
          attribute: 'price',
          precision: 0,
        },
      });
    });

    it('canRefine returns false when the result range is empty', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createRange = connectRange(renderFn, unmountFn);
      const rangeWidget = createRange({
        attribute: 'price',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['price'],
      });

      const renderState = rangeWidget.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results: createFacetStatsResults({
            min: 1000,
            max: 1000,
            helper,
            attribute: 'price',
          }),
        })
      );

      expect(renderState).toEqual({
        format: {
          from: expect.any(Function),
          to: expect.any(Function),
        },
        range: {
          max: 1000,
          min: 1000,
        },
        canRefine: false,
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        start: [-Infinity, Infinity],
        widgetParams: {
          attribute: 'price',
          precision: 0,
        },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('returns the `SearchParameters` with the default value without the previous refinement', () => {
      const render = jest.fn();
      const makeWidget = connectRange(render);
      const helper = jsHelper(createSearchClient(), 'indexName', {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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
      const helper = jsHelper(createSearchClient(), 'indexName', {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'price',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'price',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'price',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'price',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'price',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

    test('returns the default `SearchParameters` with a malformed value from `uiState`', () => {
      const render = jest.fn();
      const makeWidget = connectRange(render);
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'price',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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
      const helper = jsHelper(createSearchClient(), 'indexName', {
        numericRefinements: {
          age: {
            '>=': [16],
          },
        },
      });
      const widget = makeWidget({
        attribute: 'price',
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

    test('returns the `SearchParameters` with the correct price range', () => {
      const render = jest.fn();
      const makeWidget = connectRange(render);
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['price'],
      });
      const widget = makeWidget({
        attribute: 'price',
        min: 0,
        max: 500,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          range: {
            price: '0:400',
          },
        },
      });

      expect(actual.numericRefinements.price['>=']).toEqual([0]);
      expect(actual.numericRefinements.price['<=']).toEqual([400]);
    });

    test('ignores min or max from uiState if they are out of bound', () => {
      const render = jest.fn();
      const makeWidget = connectRange(render);
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['price'],
      });
      const widget = makeWidget({
        attribute: 'price',
        min: 0,
        max: 500,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          range: {
            price: '-20:600',
          },
        },
      });

      expect(actual.numericRefinements.price['>=']).toEqual([0]);
      expect(actual.numericRefinements.price['<=']).toEqual([500]);
    });

    const attribute = 'price';

    it('expect to return default configuration', () => {
      const rendering = jest.fn();
      const widget = connectRange(rendering)({
        attribute,
      });

      const actual = widget.getWidgetSearchParameters!(new SearchParameters(), {
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
      const rendering = jest.fn();
      const widget = connectRange(rendering)({
        attribute,
        max: 500,
      });

      const actual = widget.getWidgetSearchParameters!(
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
      const rendering = jest.fn();
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

      const actual = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {},
      });

      expect(actual).toEqual(expectation);
    });

    it('expect to return configuration with max numeric refinement', () => {
      const rendering = jest.fn();
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

      const actual = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {},
      });

      expect(actual).toEqual(expectation);
    });

    it('expect to return configuration with both numeric refinements', () => {
      const rendering = jest.fn();
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

      const actual = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {},
      });

      expect(actual).toEqual(expectation);
    });

    it('passes the correct range set by initialUiState', () => {
      const searchClient = createSearchClient();
      const search = instantsearch({
        indexName: 'test-index',
        searchClient,
        initialUiState: {
          'test-index': {
            range: {
              price: '100:200',
            },
          },
        },
      });
      const renderer = jest.fn();
      const customRangeInput = connectRange(renderer);

      search.addWidgets([
        customRangeInput({
          attribute: 'price',
          min: 0,
          max: 500,
        }),
      ]);
      search.start();

      expect(renderer).toHaveBeenCalledWith(
        expect.objectContaining({
          start: [100, 200],
        }),
        true
      );
    });
  });

  describe('insights', () => {
    const attribute = 'price';

    it('sends event when a facet is added at each step', () => {
      const rendering = jest.fn();
      const makeWidget = connectRange(rendering);
      const widget = makeWidget({
        attribute,
      });

      const instantSearchInstance = createInstantSearch();
      const helper = jsHelper(
        createSearchClient(),
        '',
        widget.getWidgetSearchParameters!(new SearchParameters(), {
          uiState: {},
        })
      );
      helper.search = jest.fn();

      widget.init!(
        createInitOptions({
          instantSearchInstance,
          helper,
        })
      );

      {
        // first rendering
        const renderOptions =
          rendering.mock.calls[rendering.mock.calls.length - 1][0];
        const { refine } = renderOptions;
        refine([10, 30]);
        expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
          1
        );
        expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
          attribute: 'price',
          eventType: 'click',
          insightsMethod: 'clickedFilters',
          payload: {
            eventName: 'Filter Applied',
            filters: ['price>=10', 'price<=30'],
            index: '',
          },
          widgetType: 'ais.range',
        });
      }

      widget.render!(
        createRenderOptions({
          results: createFacetStatsResults({
            min: 10,
            max: 30,
            helper,
            attribute: 'price',
          }),
          state: helper.state,
          helper,
          instantSearchInstance,
        })
      );

      {
        // Second rendering
        const renderOptions =
          rendering.mock.calls[rendering.mock.calls.length - 1][0];
        const { refine } = renderOptions;
        refine([23, 27]);
        expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
          2
        );
        expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
          attribute: 'price',
          eventType: 'click',
          insightsMethod: 'clickedFilters',
          payload: {
            eventName: 'Filter Applied',
            filters: ['price>=23', 'price<=27'],
            index: '',
          },
          widgetType: 'ais.range',
        });
      }
    });
  });
});
