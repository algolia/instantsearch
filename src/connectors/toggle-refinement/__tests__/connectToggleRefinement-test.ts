import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectToggleRefinement from '../connectToggleRefinement';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';

describe('connectToggleRefinement', () => {
  const createInitializedWidget = () => {
    const rendering = jest.fn();
    const instantSearchInstance = createInstantSearch();
    const makeWidget = connectToggleRefinement(rendering);

    const attribute = 'isShippingFree';
    const widget = makeWidget({
      attribute,
    });

    const helper = jsHelper(createSearchClient(), '', {
      disjunctiveFacets: ['isShippingFree'],
      disjunctiveFacetsRefinements: {
        isShippingFree: ['false'],
      },
    });

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        instantSearchInstance,
      })
    );

    return { rendering, helper, instantSearchInstance, widget };
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectToggleRefinement()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/toggle-refinement/js/#connector"
`);
    });

    it('throws without attribute option', () => {
      expect(() => {
        // @ts-expect-error
        connectToggleRefinement(() => {})({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attribute\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/toggle-refinement/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customToggleRefinement = connectToggleRefinement(render, unmount);
      const widget = customToggleRefinement({ attribute: 'facet' });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.toggleRefinement',
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
    const makeWidget = connectToggleRefinement(rendering);

    const attribute = 'isShippingFree';
    const widget = makeWidget({
      attribute,
    });

    const config = widget.getWidgetSearchParameters(new SearchParameters({}), {
      uiState: {},
    });
    expect(config).toEqual(
      new SearchParameters({
        disjunctiveFacets: [attribute],
        disjunctiveFacetsRefinements: {
          [attribute]: [],
        },
      })
    );

    const helper = jsHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering).toHaveBeenCalledTimes(1);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const { value, widgetParams } = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ][0];
      expect(value).toEqual({
        name: 'isShippingFree',
        count: null,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          isRefined: false,
          count: 0,
        },
      });

      expect(widgetParams).toEqual({
        attribute,
      });
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              isShippingFree: {
                true: 45,
                false: 40,
              },
            },
            nbHits: 85,
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering).toHaveBeenCalledTimes(2);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const { value } = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ][0];
      expect(value).toEqual({
        name: 'isShippingFree',
        count: 45,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 45,
        },
        offFacetValue: {
          isRefined: false,
          count: 85,
        },
      });
    }
  });

  it('Renders during init and render with array value', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectToggleRefinement(rendering);

    const attribute = 'whatever';
    const widget = makeWidget({
      attribute,
      on: ['a', 'b'],
      off: ['c'],
    });

    const config = widget.getWidgetSearchParameters(new SearchParameters({}), {
      uiState: {},
    });
    expect(config).toEqual(
      new SearchParameters({
        disjunctiveFacets: [attribute],
        disjunctiveFacetsRefinements: {
          [attribute]: ['c'],
        },
      })
    );

    const helper = jsHelper(createSearchClient(), '', config);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
      })
    );

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering).toHaveBeenCalledTimes(1);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const { value, widgetParams } = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ][0];
      expect(value).toEqual({
        name: 'whatever',
        count: null,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          isRefined: true,
          count: 0,
        },
      });

      expect(widgetParams).toEqual({
        attribute,
        on: ['a', 'b'],
        off: ['c'],
      });
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              whatever: {
                a: 45,
                b: 20,
                c: 20,
              },
            },
            nbHits: 85,
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering).toHaveBeenCalledTimes(2);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const { value } = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ][0];
      expect(value).toEqual({
        name: 'whatever',
        count: 65,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 65,
        },
        offFacetValue: {
          isRefined: true,
          count: 20,
        },
      });
    }
  });

  it('does not throw without the unmount function', () => {
    const rendering = () => {};
    const makeWidget = connectToggleRefinement(rendering);
    const attribute = 'isShippingFree';
    const widget = makeWidget({
      attribute,
    });
    const config = widget.getWidgetSearchParameters(new SearchParameters({}), {
      uiState: {},
    });
    const helper = jsHelper(createSearchClient(), '', config);
    expect(() =>
      widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
    ).not.toThrow();
  });

  it('Provides a function to add/remove a facet value', () => {
    const rendering = jest.fn();
    const makeWidget = connectToggleRefinement(rendering);

    const attribute = 'isShippingFree';
    const widget = makeWidget({
      attribute,
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
        instantSearchInstance: createInstantSearch(),
      })
    );

    {
      // first rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: 'isShippingFree',
        count: null,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          isRefined: false,
          count: 0,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
      refine({ isRefined: !value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([]);
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              isShippingFree: {
                true: 45,
                false: 40,
              },
            },
            nbHits: 85,
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    {
      // Second rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: 'isShippingFree',
        count: 45,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 45,
        },
        offFacetValue: {
          isRefined: false,
          count: 85,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              isShippingFree: {
                true: 45,
              },
            },
            nbHits: 85,
          }),
          createSingleSearchResponse({
            facets: {
              isShippingFree: {
                true: 45,
                false: 40,
              },
            },
            nbHits: 85,
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    {
      // Third rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: 'isShippingFree',
        count: 85,
        isRefined: true,
        onFacetValue: {
          isRefined: true,
          count: 45,
        },
        offFacetValue: {
          isRefined: false,
          count: 85,
        },
      });
      refine(value);
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([]);
    }
  });

  it('Provides a function to toggle between two values', () => {
    const rendering = jest.fn();
    const makeWidget = connectToggleRefinement(rendering);

    const attribute = 'isShippingFree';
    const widget = makeWidget({
      attribute,
      on: 'true',
      off: 'false',
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: () => '#',
        instantSearchInstance: createInstantSearch(),
      })
    );

    {
      // first rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'false',
      ]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;

      expect(value).toEqual({
        name: 'isShippingFree',
        count: null,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 0,
        },
        offFacetValue: {
          isRefined: true,
          count: 0,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
      refine({ isRefined: !value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'false',
      ]);
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              isShippingFree: {
                false: 40,
              },
            },
            nbHits: 40,
          }),
          createSingleSearchResponse({
            facets: {
              isShippingFree: {
                true: 45,
                false: 40,
              },
            },
            nbHits: 85,
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    {
      // Second rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'false',
      ]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        // the value is the one that is not selected
        name: 'isShippingFree',
        count: 45,
        isRefined: false,
        onFacetValue: {
          isRefined: false,
          count: 45,
        },
        offFacetValue: {
          isRefined: true,
          count: 40,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
    }

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              isShippingFree: {
                true: 45,
              },
            },
            nbHits: 85,
          }),
          createSingleSearchResponse({
            facets: {
              isShippingFree: {
                true: 45,
                false: 40,
              },
            },
            nbHits: 85,
          }),
        ]),
        state: helper.state,
        helper,
        createURL: () => '#',
      })
    );

    {
      // Third rendering
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'true',
      ]);
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine, value } = renderOptions;
      expect(value).toEqual({
        name: 'isShippingFree',
        count: 40,
        isRefined: true,
        onFacetValue: {
          isRefined: true,
          count: 45,
        },
        offFacetValue: {
          isRefined: false,
          count: 40,
        },
      });
      refine({ isRefined: value.isRefined });
      expect(helper.state.disjunctiveFacetsRefinements[attribute]).toEqual([
        'false',
      ]);
    }
  });

  it('sets user-provided "off" value by default (falsy)', () => {
    const makeWidget = connectToggleRefinement(() => {});
    const widget = makeWidget({
      attribute: 'whatever',
      off: false,
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    widget.init!(createInitOptions({ helper, state: helper.state }));

    expect(helper.state.disjunctiveFacetsRefinements).toEqual(
      expect.objectContaining({
        whatever: ['false'],
      })
    );
  });

  it('sets user-provided "off" value by default (truthy)', () => {
    const makeWidget = connectToggleRefinement(() => {});
    const widget = makeWidget({
      attribute: 'whatever',
      off: true,
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    widget.init!(createInitOptions({ helper, state: helper.state }));

    expect(helper.state.disjunctiveFacetsRefinements).toEqual(
      expect.objectContaining({
        whatever: ['true'],
      })
    );
  });

  it('sets user-provided "off" value by default (array)', () => {
    const makeWidget = connectToggleRefinement(() => {});
    const widget = makeWidget({
      attribute: 'whatever',
      off: ['a', 'b'],
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    widget.init!(createInitOptions({ helper, state: helper.state }));

    expect(helper.state.disjunctiveFacetsRefinements).toEqual(
      expect.objectContaining({
        whatever: ['a', 'b'],
      })
    );
  });

  it('sets user-provided "on" value on refine (falsy)', () => {
    let caughtRefine;
    const makeWidget = connectToggleRefinement(({ refine }) => {
      caughtRefine = refine;
    });
    const widget = makeWidget({
      attribute: 'whatever',
      on: false,
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(helper.state.disjunctiveFacetsRefinements).toEqual({
      whatever: [],
    });

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              whatever: {
                true: 45,
                false: 40,
              },
            },
            nbHits: 85,
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    // toggle the value
    caughtRefine();

    expect(helper.state.disjunctiveFacetsRefinements).toEqual(
      expect.objectContaining({
        whatever: ['false'],
      })
    );
  });

  it('sets user-provided "on" value on refine (array)', () => {
    let caughtRefine;
    const makeWidget = connectToggleRefinement(({ refine }) => {
      caughtRefine = refine;
    });
    const widget = makeWidget({
      attribute: 'whatever',
      on: ['a', 'b'],
    });

    const helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        instantSearchInstance: createInstantSearch(),
      })
    );

    expect(helper.state.disjunctiveFacetsRefinements).toEqual({
      whatever: [],
    });

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              whatever: {
                a: 45,
                b: 20,
                c: 20,
              },
            },
            nbHits: 85,
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    // toggle the value
    caughtRefine();

    expect(helper.state.disjunctiveFacetsRefinements).toEqual(
      expect.objectContaining({
        whatever: ['a', 'b'],
      })
    );
  });

  describe('dispose', () => {
    test('calls the unmount function', () => {
      const render = jest.fn();
      const unmount = jest.fn();
      const makeWidget = connectToggleRefinement(render, unmount);
      const helper = jsHelper(createSearchClient(), '', {});
      helper.search = jest.fn();

      const attribute = 'freeShipping';
      const widget = makeWidget({
        attribute,
      });

      widget.dispose!(createDisposeOptions({ state: helper.state }));

      expect(unmount).toHaveBeenCalledTimes(1);
    });

    test('resets the state', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const indexName = 'indexName';
      const helper = jsHelper(createSearchClient(), indexName, {
        disjunctiveFacets: ['freeShipping'],
        disjunctiveFacetsRefinements: {
          freeShipping: ['true'],
        },
      });
      helper.search = jest.fn();

      const attribute = 'freeShipping';
      const widget = makeWidget({
        attribute,
      });

      expect(helper.state).toEqual(
        new SearchParameters({
          index: indexName,
          disjunctiveFacets: ['freeShipping'],
          disjunctiveFacetsRefinements: {
            freeShipping: ['true'],
          },
        })
      );

      const nextState = widget.dispose!(
        createDisposeOptions({ state: helper.state })
      );

      expect(nextState).toEqual(
        new SearchParameters({
          index: indexName,
        })
      );
    });
  });

  describe('getRenderState', () => {
    test('returns the render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createToggleRefinement = connectToggleRefinement(
        renderFn,
        unmountFn
      );
      const toggleRefinement = createToggleRefinement({
        attribute: 'isShippingFree',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['isShippingFree'],
        disjunctiveFacetsRefinements: {
          isShippingFree: ['false'],
        },
      });

      const renderState = toggleRefinement.getRenderState(
        {},
        createInitOptions({ state: helper.state, helper })
      );

      expect(renderState.toggleRefinement).toEqual({
        isShippingFree: {
          createURL: expect.any(Function),
          canRefine: false,
          refine: expect.any(Function),
          sendEvent: expect.any(Function),
          value: {
            count: null,
            isRefined: false,
            name: 'isShippingFree',
            offFacetValue: {
              count: 0,
              isRefined: false,
            },
            onFacetValue: {
              count: 0,
              isRefined: false,
            },
          },
          widgetParams: {
            attribute: 'isShippingFree',
          },
        },
      });
    });

    test('returns the render state with results', () => {
      const { widget, helper } = createInitializedWidget();

      const renderState = widget.getRenderState(
        {},
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              facets: {
                isShippingFree: {
                  true: 45,
                  false: 40,
                },
              },
              nbHits: 85,
            }),
          ]),
        })
      );

      expect(renderState.toggleRefinement).toEqual({
        isShippingFree: {
          createURL: expect.any(Function),
          canRefine: true,
          refine: expect.any(Function),
          sendEvent: expect.any(Function),
          value: {
            count: 45,
            isRefined: false,
            name: 'isShippingFree',
            offFacetValue: {
              count: 85,
              isRefined: false,
            },
            onFacetValue: {
              count: 45,
              isRefined: false,
            },
          },
          widgetParams: {
            attribute: 'isShippingFree',
          },
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createToggleRefinement = connectToggleRefinement(
        renderFn,
        unmountFn
      );
      const toggleRefinement = createToggleRefinement({
        attribute: 'isShippingFree',
      });
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['isShippingFree'],
        disjunctiveFacetsRefinements: {
          isShippingFree: ['true'],
        },
      });

      const renderState = toggleRefinement.getWidgetRenderState(
        createInitOptions({ state: helper.state, helper })
      );

      expect(renderState).toEqual({
        createURL: expect.any(Function),
        canRefine: false,
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        value: {
          count: null,
          isRefined: true,
          name: 'isShippingFree',
          offFacetValue: {
            count: 0,
            isRefined: false,
          },
          onFacetValue: {
            count: 0,
            isRefined: true,
          },
        },
        widgetParams: {
          attribute: 'isShippingFree',
        },
      });
    });

    test('returns the widget render state with results', () => {
      const { widget, helper } = createInitializedWidget();

      const renderState = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              facets: {
                isShippingFree: {
                  true: 345,
                  false: 940,
                },
              },
              nbHits: 1285,
            }),
          ]),
        })
      );

      expect(renderState).toEqual({
        createURL: expect.any(Function),
        canRefine: true,
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        value: {
          count: 345,
          isRefined: false,
          name: 'isShippingFree',
          offFacetValue: {
            count: 1285,
            isRefined: false,
          },
          onFacetValue: {
            count: 345,
            isRefined: false,
          },
        },
        widgetParams: {
          attribute: 'isShippingFree',
        },
      });
    });
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` empty', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'isShippingFree',
      });

      const actual = widget.getWidgetUiState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a refinement', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['freeShipping'],
        disjunctiveFacetsRefinements: {
          freeShipping: ['true'],
        },
      });
      const widget = makeWidget({
        attribute: 'freeShipping',
      });

      const actual = widget.getWidgetUiState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        toggle: {
          freeShipping: true,
        },
      });
    });

    test('returns the `uiState` without namespace overridden', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['freeShipping'],
        disjunctiveFacetsRefinements: {
          freeShipping: ['true'],
        },
      });
      const widget = makeWidget({
        attribute: 'freeShipping',
      });

      const actual = widget.getWidgetUiState(
        {
          toggle: {
            discount: true,
          },
        },
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        toggle: {
          discount: true,
          freeShipping: true,
        },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('returns the `SearchParameters` with the default value without the previous refinement', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), '', {
        disjunctiveFacets: ['freeShipping'],
        disjunctiveFacetsRefinements: {
          freeShipping: ['true'],
        },
      });
      const widget = makeWidget({
        attribute: 'freeShipping',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual.disjunctiveFacets).toEqual(['freeShipping']);
      expect(actual.disjunctiveFacetsRefinements).toEqual({
        freeShipping: [],
      });
    });

    test('returns the `SearchParameters` without overriding the disjunctive facets', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), '', {
        disjunctiveFacets: ['freeShipping', 'onSale'],
        disjunctiveFacetsRefinements: {
          freeShipping: ['true'],
        },
      });
      const widget = makeWidget({
        attribute: 'freeShipping',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual.disjunctiveFacets).toEqual(['freeShipping', 'onSale']);
      expect(actual.disjunctiveFacetsRefinements).toEqual({
        freeShipping: [],
      });
    });

    test('returns the `SearchParameters` without overriding the other refinements', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), '', {
        disjunctiveFacets: ['freeShipping', 'onSale'],
        disjunctiveFacetsRefinements: {
          freeShipping: ['true'],
          onSale: ['true'],
        },
      });
      const widget = makeWidget({
        attribute: 'freeShipping',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual.disjunctiveFacets).toEqual(['freeShipping', 'onSale']);
      expect(actual.disjunctiveFacetsRefinements).toEqual({
        onSale: ['true'],
        freeShipping: [],
      });
    });

    test('returns the `SearchParameters` with the value from `uiState`', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'freeShipping',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          toggle: {
            freeShipping: true,
          },
        },
      });

      expect(actual.disjunctiveFacets).toEqual(['freeShipping']);
      expect(actual.disjunctiveFacetsRefinements).toEqual({
        freeShipping: ['true'],
      });
    });

    test('returns the `SearchParameters` with the `off` value when `uiState` is empty', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'freeShipping',
        on: 'free-shipping',
        off: 'paid-shipping',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual.disjunctiveFacets).toEqual(['freeShipping']);
      expect(actual.disjunctiveFacetsRefinements).toEqual({
        freeShipping: ['paid-shipping'],
      });
    });

    test('returns the `SearchParameters` with the `on` value when the `uiState` is `true`', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'freeShipping',
        on: 'free-shipping',
        off: 'paid-shipping',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          toggle: {
            freeShipping: true,
          },
        },
      });

      expect(actual.disjunctiveFacets).toEqual(['freeShipping']);
      expect(actual.disjunctiveFacetsRefinements).toEqual({
        freeShipping: ['free-shipping'],
      });
    });

    test('returns the `SearchParameters` with the `off` value when the `uiState` is `false`', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        attribute: 'freeShipping',
        on: 'free-shipping',
        off: 'paid-shipping',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          toggle: {
            freeShipping: false,
          },
        },
      });

      expect(actual.disjunctiveFacets).toEqual(['freeShipping']);
      expect(actual.disjunctiveFacetsRefinements).toEqual({
        freeShipping: ['paid-shipping'],
      });
    });

    test('returns the `SearchParameters` with the value from `uiState` without the previous refinement', () => {
      const render = jest.fn();
      const makeWidget = connectToggleRefinement(render);
      const helper = jsHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: ['freeShipping'],
        disjunctiveFacetsRefinements: {
          freeShipping: ['false'],
        },
      });
      const widget = makeWidget({
        attribute: 'freeShipping',
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          toggle: {
            freeShipping: true,
          },
        },
      });

      expect(actual.disjunctiveFacets).toEqual(['freeShipping']);
      expect(actual.disjunctiveFacetsRefinements).toEqual({
        freeShipping: ['true'],
      });
    });
  });

  describe('insights', () => {
    it('sends event when a facet is added', () => {
      const { rendering, instantSearchInstance } = createInitializedWidget();
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine } = renderOptions;
      refine({ isRefined: false });
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'isShippingFree',
        eventType: 'click',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Filter Applied',
          filters: ['isShippingFree:true'],
          index: '',
        },
        widgetType: 'ais.toggleRefinement',
      });
    });

    it('does not send event when a facet is removed', () => {
      const { rendering, instantSearchInstance } = createInitializedWidget();
      const renderOptions =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      const { refine } = renderOptions;
      refine({ isRefined: false });
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );

      refine({ isRefined: true });
      // still the same
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
    });
  });
});
