import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import connectClearRefinements from '../connectClearRefinements';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { createSearchClient } from '../../../../test/mock/createSearchClient';

describe('connectClearRefinements', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-ignore
        connectClearRefinements()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/clear-refinements/js/#connector"
`);
    });

    it('throws with both `includedAttributes` and `excludedAttributes`', () => {
      const customClearRefinements = connectClearRefinements(() => {});

      expect(() => {
        customClearRefinements({
          includedAttributes: ['query'],
          excludedAttributes: ['brand'],
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The options \`includedAttributes\` and \`excludedAttributes\` cannot be used together.

See documentation: https://www.algolia.com/doc/api-reference/widgets/clear-refinements/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customClearRefinements = connectClearRefinements(render, unmount);
      const widget = customClearRefinements({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.clearRefinements',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('Lifecycle', () => {
    it('renders during init and render', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      helper.search = () => helper;
      const rendering = jest.fn();
      const makeWidget = connectClearRefinements<{ foo: string }>(rendering);
      const widget = makeWidget({
        foo: 'bar', // dummy param to test `widgetParams`
      });

      // test if widget is not rendered yet at this point
      expect(rendering).toHaveBeenCalledTimes(0);

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      // test that rendering has been called during init with isFirstRendering = true
      expect(rendering).toHaveBeenCalledTimes(1);

      const [
        firstRenderingOptions,
        isFirstRenderAtInit,
      ] = rendering.mock.calls[0];

      expect(isFirstRenderAtInit).toBe(true);
      expect(firstRenderingOptions.createURL).toBeInstanceOf(Function);
      expect(firstRenderingOptions.refine).toBeInstanceOf(Function);
      expect(firstRenderingOptions.canRefine).toBe(false);
      expect(firstRenderingOptions.hasRefinements).toBe(false);
      expect(firstRenderingOptions.widgetParams).toEqual({
        foo: 'bar', // dummy param to test `widgetParams`
      });

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      // test that rendering has been called during init with isFirstRendering = false
      expect(rendering).toHaveBeenCalledTimes(2);

      const [
        secondRenderingOptions,
        isFirstRenderAtRender,
      ] = rendering.mock.calls[1];

      expect(isFirstRenderAtRender).toBe(false);
      expect(secondRenderingOptions.createURL).toBeInstanceOf(Function);
      expect(secondRenderingOptions.refine).toBeInstanceOf(Function);
      expect(secondRenderingOptions.hasRefinements).toBe(false);
      expect(secondRenderingOptions.canRefine).toBe(false);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      const rendering = () => {};
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({});

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    describe('getRenderState', () => {
      test('returns the render state', () => {
        const renderFn = jest.fn();
        const unmountFn = jest.fn();
        const createClearRefinements = connectClearRefinements(
          renderFn,
          unmountFn
        );
        const clearRefinements = createClearRefinements({});
        const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
          index: 'indexName',
          hierarchicalFacets: [
            {
              name: 'category',
              attributes: ['category', 'subCategory'],
              separator: ' > ',
            },
          ],
        });

        const renderState1 = clearRefinements.getRenderState(
          {},
          createInitOptions()
        );

        expect(renderState1.clearRefinements).toEqual({
          hasRefinements: false,
          canRefine: false,
          createURL: expect.any(Function),
          refine: expect.any(Function),
          widgetParams: {},
        });

        clearRefinements.init!(createInitOptions());

        helper.toggleRefinement('category', 'Decoration');

        const renderState2 = clearRefinements.getRenderState(
          {},
          createRenderOptions({
            helper,
            scopedResults: [
              {
                indexId: 'indexName',
                helper,
                results: new SearchResults(helper.state, [
                  createSingleSearchResponse({
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
                  }),
                  createSingleSearchResponse({
                    facets: {
                      category: {
                        Decoration: 880,
                        Outdoor: 47,
                      },
                    },
                  }),
                ]),
              },
            ],
          })
        );

        expect(renderState2.clearRefinements).toEqual({
          hasRefinements: true,
          canRefine: true,
          createURL: expect.any(Function),
          refine: expect.any(Function),
          widgetParams: {},
        });
      });
    });

    describe('getWidgetRenderState', () => {
      test('returns the widget render state', () => {
        const renderFn = jest.fn();
        const unmountFn = jest.fn();
        const createClearRefinements = connectClearRefinements(
          renderFn,
          unmountFn
        );
        const clearRefinements = createClearRefinements({});
        const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
          index: 'indexName',
          hierarchicalFacets: [
            {
              name: 'category',
              attributes: ['category', 'subCategory'],
              separator: ' > ',
            },
          ],
        });

        const renderState1 = clearRefinements.getWidgetRenderState(
          createInitOptions()
        );

        expect(renderState1).toEqual({
          hasRefinements: false,
          canRefine: false,
          createURL: expect.any(Function),
          refine: expect.any(Function),
          widgetParams: {},
        });

        clearRefinements.init!(createInitOptions());

        helper.toggleRefinement('category', 'Decoration');

        const renderState2 = clearRefinements.getWidgetRenderState(
          createRenderOptions({
            helper,
            scopedResults: [
              {
                indexId: 'indexName',
                helper,
                results: new SearchResults(helper.state, [
                  createSingleSearchResponse({
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
                  }),
                  createSingleSearchResponse({
                    facets: {
                      category: {
                        Decoration: 880,
                        Outdoor: 47,
                      },
                    },
                  }),
                ]),
              },
            ],
          })
        );

        expect(renderState2).toEqual({
          hasRefinements: true,
          canRefine: true,
          createURL: expect.any(Function),
          refine: expect.any(Function),
          widgetParams: {},
        });
      });
    });
  });

  describe('Instance options', () => {
    it('provides a function to clear the refinements', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facets: ['myFacet'],
      });
      helper.search = () => helper;
      helper.setQuery('not empty');
      helper.toggleRefinement('myFacet', 'myValue');

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({});

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[0][0].refine).toBeInstanceOf(Function);

      helper.toggleRefinement('myFacet', 'someOtherValue');

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      expect(helper.hasRefinements('myFacet')).toBe(true);
      expect(helper.state.query).toBe('not empty');

      const refine = rendering.mock.calls[1][0].refine;
      refine();

      expect(helper.hasRefinements('myFacet')).toBe(false);
      expect(helper.state.query).toBe('not empty');
    });

    it('provides a function to clear the refinements and the query', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facets: ['myFacet'],
      });
      helper.search = () => helper;
      helper.setQuery('a query');
      helper.toggleRefinement('myFacet', 'myValue');

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({ excludedAttributes: [] });

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[0][0].refine).toBeInstanceOf(Function);

      helper.toggleRefinement('myFacet', 'someOtherValue');
      helper.setQuery('another query');

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      expect(helper.hasRefinements('myFacet')).toBe(true);
      expect(helper.state.query).toBe('another query');

      const refine = rendering.mock.calls[1][0].refine;
      refine();

      expect(helper.hasRefinements('myFacet')).toBe(false);
      expect(helper.state.query).toBe('');
    });

    it('provides the same `refine` and `createURL` function references during the lifecycle', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      helper.search = () => helper;

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({});

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      const [firstRender, secondRender, thirdRender] = rendering.mock.calls;

      expect(secondRender[0].refine).toBe(firstRender[0].refine);
      expect(thirdRender[0].refine).toBe(secondRender[0].refine);

      expect(secondRender[0].createURL).toBe(firstRender[0].createURL);
      expect(thirdRender[0].createURL).toBe(secondRender[0].createURL);
    });

    it('gets refinements from results', () => {
      const helper = algoliasearchHelper(createSearchClient(), '', {
        facets: ['aFacet'],
      });
      helper.toggleRefinement('aFacet', 'some value');
      helper.search = () => helper;

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({});

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[0][0].hasRefinements).toBe(false);
      expect(rendering.mock.calls[0][0].canRefine).toBe(false);

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[1][0].hasRefinements).toBe(true);
      expect(rendering.mock.calls[1][0].canRefine).toBe(true);
    });

    it('with query not excluded and not empty has refinements', () => {
      // test if the values sent to the rendering function
      // are consistent with the search state
      const helper = algoliasearchHelper(createSearchClient(), '', {
        facets: ['aFacet'],
      });
      helper.setQuery('no empty');
      helper.search = () => helper;

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        excludedAttributes: [],
      });

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[0][0].hasRefinements).toBe(false);
      expect(rendering.mock.calls[0][0].canRefine).toBe(false);

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[1][0].hasRefinements).toBe(true);
      expect(rendering.mock.calls[1][0].canRefine).toBe(true);
    });

    it('with query not excluded and empty has no refinements', () => {
      const helper = algoliasearchHelper(createSearchClient(), '', {
        facets: ['aFacet'],
      });
      helper.search = () => helper;

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        excludedAttributes: [],
      });

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[0][0].hasRefinements).toBe(false);
      expect(rendering.mock.calls[0][0].canRefine).toBe(false);

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
      expect(rendering.mock.calls[1][0].canRefine).toBe(false);
    });

    it('without includedAttributes or excludedAttributes and with a query has no refinements', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName');
      helper.setQuery('not empty');
      helper.search = () => helper;

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({});

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[0][0].hasRefinements).toBe(false);
      expect(rendering.mock.calls[0][0].canRefine).toBe(false);

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      expect(rendering.mock.calls[1][0].hasRefinements).toBe(false);
      expect(rendering.mock.calls[1][0].canRefine).toBe(false);
    });

    it('includes only includedAttributes', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facets: ['facet1', 'facet2'],
      });
      helper.search = () => helper;

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({ includedAttributes: ['facet1'] });

      helper
        .toggleRefinement('facet1', 'value')
        .toggleRefinement('facet2', 'value')
        .setQuery('not empty');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(helper.hasRefinements('facet1')).toBe(true);
      expect(helper.hasRefinements('facet2')).toBe(true);

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      const refine = rendering.mock.calls[1][0].refine;
      refine();

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      expect(helper.hasRefinements('facet1')).toBe(false);
      expect(helper.hasRefinements('facet2')).toBe(true);
      expect(rendering.mock.calls[2][0].hasRefinements).toBe(false);
      expect(rendering.mock.calls[2][0].canRefine).toBe(false);
    });

    it('includes only includedAttributes (with query)', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facets: ['facet1'],
      });
      helper.search = () => helper;

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({ includedAttributes: ['facet1', 'query'] });

      helper.toggleRefinement('facet1', 'value').setQuery('not empty');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(helper.hasRefinements('facet1')).toBe(true);
      expect(helper.state.query).toBe('not empty');

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      const refine = rendering.mock.calls[1][0].refine;
      refine();

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      expect(helper.hasRefinements('facet1')).toBe(false);
      expect(helper.state.query).toBe('');
      expect(rendering.mock.calls[2][0].hasRefinements).toBe(false);
      expect(rendering.mock.calls[2][0].canRefine).toBe(false);
    });

    it('excludes excludedAttributes', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facets: ['facet1', 'facet2'],
      });
      helper.search = () => helper;

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        excludedAttributes: ['facet2'],
      });

      helper
        .toggleRefinement('facet1', 'value')
        .toggleRefinement('facet2', 'value');

      {
        helper.setQuery('not empty');

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        expect(helper.hasRefinements('facet1')).toBe(true);
        expect(helper.hasRefinements('facet2')).toBe(true);

        widget.render!(
          createRenderOptions({
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
            ]),
            helper,
            state: helper.state,
          })
        );

        const refine = rendering.mock.calls[1][0].refine;
        refine();

        expect(helper.hasRefinements('facet1')).toBe(false);
        expect(helper.hasRefinements('facet2')).toBe(true);

        expect(rendering.mock.calls[1][0].hasRefinements).toBe(true);
        expect(rendering.mock.calls[1][0].canRefine).toBe(true);
      }

      {
        // facet has not been cleared and it is still refined with value
        helper.setQuery('not empty');

        widget.render!(
          createRenderOptions({
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
            ]),
            helper,
            state: helper.state,
          })
        );

        expect(helper.hasRefinements('facet1')).toBe(false);
        expect(helper.hasRefinements('facet2')).toBe(true);

        const refine = rendering.mock.calls[2][0].refine;
        refine();

        widget.render!(
          createRenderOptions({
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
            ]),
            helper,
            state: helper.state,
          })
        );

        expect(helper.hasRefinements('facet1')).toBe(false);
        expect(helper.hasRefinements('facet2')).toBe(true);
      }
    });

    it('transformItems is called', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        facets: ['facet1', 'facet2', 'facet3'],
      });
      helper.search = () => helper;

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({
        includedAttributes: ['facet2', 'facet3', 'query'],
        transformItems: items =>
          items.filter(
            attribute => attribute === 'query' || attribute === 'facet3'
          ),
      });

      helper
        .toggleRefinement('facet1', 'value')
        .toggleRefinement('facet2', 'value')
        .toggleRefinement('facet3', 'value')
        .setQuery('not empty');

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      expect(helper.hasRefinements('facet1')).toBe(true);
      expect(helper.hasRefinements('facet2')).toBe(true);
      expect(helper.hasRefinements('facet3')).toBe(true);
      expect(helper.state.query).toBe('not empty');

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      const refine = rendering.mock.calls[1][0].refine;
      refine();

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      expect(helper.hasRefinements('facet1')).toBe(true);
      expect(helper.hasRefinements('facet2')).toBe(true);
      expect(helper.hasRefinements('facet3')).toBe(false);
      expect(helper.state.query).toBe('');
      expect(rendering.mock.calls[2][0].hasRefinements).toBe(false);
      expect(rendering.mock.calls[2][0].canRefine).toBe(false);
    });

    describe('createURL', () => {
      it('consistent with the list of excludedAttributes', () => {
        const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
          facets: ['facet', 'otherFacet'],
        });
        helper.search = () => helper;

        const rendering = jest.fn();
        const makeWidget = connectClearRefinements(rendering);
        const widget = makeWidget({
          excludedAttributes: ['facet'],
        });

        helper.toggleRefinement('facet', 'value');
        helper.toggleRefinement('otherFacet', 'value');

        {
          helper.setQuery('not empty');

          widget.init!(
            createInitOptions({
              helper,
              state: helper.state,
            })
          );

          widget.render!(
            createRenderOptions({
              results: new SearchResults(helper.state, [
                createSingleSearchResponse(),
              ]),
              helper,
              state: helper.state,
              createURL: state => JSON.stringify(state),
            })
          );

          const { createURL, refine } = rendering.mock.calls[1][0];

          // The state represented by the URL should be equal to a state
          // after refining.
          const createURLState = JSON.parse(createURL());
          refine();
          const stateAfterRefine = helper.state;

          expect(createURLState).toEqual(stateAfterRefine);
        }

        {
          widget.render!(
            createRenderOptions({
              results: new SearchResults(helper.state, [
                createSingleSearchResponse(),
              ]),
              helper,
              state: helper.state,
              createURL: state => JSON.stringify(state),
            })
          );

          const { createURL, refine } = rendering.mock.calls[2][0];

          const createURLState = JSON.parse(createURL());
          refine();
          const stateAfterRefine = helper.state;

          expect(createURLState).toEqual(stateAfterRefine);
        }
      });
    });

    it('reset the page to 0', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {});
      helper.search = () => helper;
      helper.setQuery('not empty');

      const rendering = jest.fn();
      const makeWidget = connectClearRefinements(rendering);
      const widget = makeWidget({});

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          helper,
          state: helper.state,
        })
      );

      const refine = rendering.mock.calls[1][0].refine;

      helper.setPage(2);
      refine();

      expect(helper.state.page).toBe(0);
    });
  });
});
