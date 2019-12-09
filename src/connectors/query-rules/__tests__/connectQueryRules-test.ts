import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
  AlgoliaSearchHelper as Helper,
} from 'algoliasearch-helper';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import connectQueryRules, {
  QueryRulesWidgetFactory,
} from '../connectQueryRules';

describe('connectQueryRules', () => {
  let renderFn = jest.fn();
  let unmountFn = jest.fn();
  let makeWidget: QueryRulesWidgetFactory<{}>;

  const createFakeHelper = (state = {}): Helper => {
    const client = createSearchClient();
    const indexName = '';
    const helper = algoliasearchHelper(client, indexName, state);

    helper.search = jest.fn();

    return helper;
  };

  beforeEach(() => {
    renderFn = jest.fn();
    unmountFn = jest.fn();
    makeWidget = connectQueryRules(renderFn, unmountFn);
  });

  describe('usage', () => {
    test('throws without render function', () => {
      expect(() => {
        // @ts-ignore
        connectQueryRules()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rules/js/#connector"
`);
    });

    test('does not throw without unmount function', () => {
      expect(() => {
        connectQueryRules(() => {})({});
      }).not.toThrow();
    });

    test('throws with a non-functon tracked filter', () => {
      expect(() => {
        makeWidget({
          // @ts-ignore
          trackedFilters: {
            brand: ['Samsung'],
          },
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"'The \\"brand\\" filter value in the \`trackedFilters\` option expects a function.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rules/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customQueryRules = connectQueryRules(render, unmount);
      const widget = customQueryRules({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.queryRules',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('lifecycle', () => {
    test('calls the render function on init', () => {
      const helper = createFakeHelper();
      const widget = makeWidget({});
      const instantSearchInstance = createInstantSearch();
      const initOptions = createInitOptions({
        instantSearchInstance,
        state: helper.state,
        helper,
      });

      widget.init!(initOptions);

      const [renderingParameters, isFirstRender] = renderFn.mock.calls[0];

      expect(isFirstRender).toBe(true);

      const {
        instantSearchInstance: localInstantSearchInstance,
        items,
        widgetParams,
      } = renderingParameters;

      expect(items).toEqual([]);
      expect(localInstantSearchInstance).toEqual(instantSearchInstance);
      expect(widgetParams).toEqual({});
    });

    test('calls the render function on render', () => {
      const helper = createFakeHelper();
      const widget = makeWidget({});
      const instantSearchInstance = createInstantSearch();
      const initOptions = createInitOptions({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.init!(initOptions);

      widget.render!(
        createRenderOptions({
          helper,
          instantSearchInstance,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
        })
      );

      {
        const [renderingParameters, isFirstRender] = renderFn.mock.calls[1];

        expect(isFirstRender).toBe(false);

        const {
          instantSearchInstance: localInstantSearchInstance,
          items,
          widgetParams,
        } = renderingParameters;

        expect(items).toEqual([]);
        expect(localInstantSearchInstance).toEqual(instantSearchInstance);
        expect(widgetParams).toEqual({});
      }

      widget.render!(
        createRenderOptions({
          helper,
          instantSearchInstance,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({ userData: [{ banner: 'image.png' }] }),
          ]),
        })
      );

      {
        const [renderingParameters, isFirstRender] = renderFn.mock.calls[2];

        expect(isFirstRender).toBe(false);

        const {
          instantSearchInstance: localInstantSearchInstance,
          items,
          widgetParams,
        } = renderingParameters;

        expect(items).toEqual([{ banner: 'image.png' }]);
        expect(localInstantSearchInstance).toEqual(instantSearchInstance);
        expect(widgetParams).toEqual({});
      }
    });

    test('calls the unmount function on dispose', () => {
      const helper = createFakeHelper();
      const widget = makeWidget({});

      widget.init!(
        createInitOptions({
          helper,
          state: helper.state,
        })
      );

      widget.dispose!({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    test('does not throw without the unmount function', () => {
      const helper = createFakeHelper();
      const rendering = () => {};
      const createWidget = connectQueryRules(rendering);
      const widget = createWidget({});

      widget.init!(
        createInitOptions({
          state: helper.state,
          helper,
        })
      );

      expect(() =>
        widget.dispose!({ helper, state: helper.state })
      ).not.toThrow();
    });
  });

  describe('options', () => {
    describe('transformItems', () => {
      test('is applied to items', () => {
        const helper = createFakeHelper();
        const widget = makeWidget({
          transformItems: customItems => customItems[0],
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({
                userData: [{ banner: 'image1.png' }, { banner: 'image2.png' }],
              }),
            ]),
          })
        );

        const [renderingParameters] = renderFn.mock.calls[1];

        const { items } = renderingParameters;

        expect(items).toEqual({ banner: 'image1.png' });
      });
    });

    describe('trackedFilters', () => {
      test('adds ruleContexts to search parameters from initial facet and numeric refinements', () => {
        const helper = createFakeHelper({
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Samsung', 'Apple'],
          },
          numericRefinements: {
            price: {
              '<=': [500, 400],
              '>=': [100],
            },
          },
        });
        const brandFilterSpy = jest.fn(values => values);
        const priceFilterSpy = jest.fn(values => values);
        const widget = makeWidget({
          trackedFilters: {
            brand: brandFilterSpy,
            price: priceFilterSpy,
          },
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        // Query parameters are initially set in the helper.
        // Therefore, `ruleContexts` should be set.
        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'ais-brand-Samsung',
          'ais-brand-Apple',
          'ais-price-500',
          'ais-price-400',
          'ais-price-100',
        ]);
        expect(brandFilterSpy).toHaveBeenCalledTimes(1);
        expect(brandFilterSpy).toHaveBeenCalledWith(['Samsung', 'Apple']);
        expect(priceFilterSpy).toHaveBeenCalledTimes(1);
        expect(priceFilterSpy).toHaveBeenCalledWith([500, 400, 100]);
      });

      test('adds ruleContexts to search parameters if transformRuleContexts is provided', () => {
        const helper = createFakeHelper({
          disjunctiveFacets: ['brand'],
        });
        const brandFilterSpy = jest.fn(values => values);
        const widget = makeWidget({
          trackedFilters: {
            brand: brandFilterSpy,
          },
          transformRuleContexts: () => ['overriden-rule'],
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'overriden-rule',
        ]);
        expect(brandFilterSpy).toHaveBeenCalledTimes(1);
        expect(brandFilterSpy).toHaveBeenCalledWith([]);
      });

      test('adds all ruleContexts to search parameters from dynamically added facet and numeric refinements', () => {
        const helper = createFakeHelper({
          disjunctiveFacets: ['brand'],
        });
        const brandFilterSpy = jest.fn(values => values);
        const priceFilterSpy = jest.fn(values => values);
        const widget = makeWidget({
          trackedFilters: {
            brand: brandFilterSpy,
            price: priceFilterSpy,
          },
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        // There's no results yet, so no `ruleContexts` should be set.
        expect((helper.state as SearchParameters).ruleContexts).toEqual(
          undefined
        );
        expect(brandFilterSpy).toHaveBeenCalledTimes(0);
        expect(priceFilterSpy).toHaveBeenCalledTimes(0);

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse({
                facets: {
                  brand: {
                    Samsung: 100,
                    Apple: 100,
                  },
                },
              }),
            ]),
          })
        );

        // There are some results with the facets that we track in the
        // widget but the query parameters are not set in the helper.
        // Therefore, no `ruleContexts` should be set.
        expect((helper.state as SearchParameters).ruleContexts).toEqual(
          undefined
        );
        expect(brandFilterSpy).toHaveBeenCalledTimes(0);
        expect(priceFilterSpy).toHaveBeenCalledTimes(0);

        // Updating the helper state in a single method call
        // calls the tracked filters only once.
        helper.setState({
          disjunctiveFacetsRefinements: {
            brand: ['Samsung', 'Apple'],
          },
          numericRefinements: {
            price: {
              '<=': [500, 400],
              '>=': [100],
            },
          },
        });

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse({
                facets: {
                  brand: {
                    Samsung: 100,
                    Apple: 100,
                  },
                },
              }),
            ]),
          })
        );

        // The search state contains the facets that we track,
        // therefore the `ruleContexts` should finally be set.
        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'ais-brand-Samsung',
          'ais-brand-Apple',
          'ais-price-500',
          'ais-price-400',
          'ais-price-100',
        ]);
        expect(brandFilterSpy).toHaveBeenCalledTimes(1);
        expect(brandFilterSpy).toHaveBeenCalledWith(['Samsung', 'Apple']);
        expect(priceFilterSpy).toHaveBeenCalledTimes(1);
        expect(priceFilterSpy).toHaveBeenCalledWith([500, 400, 100]);
      });

      test('can filter trackedFilters with facets refinements', () => {
        const helper = createFakeHelper({
          disjunctiveFacets: ['brand'],
        });
        const brandFilterSpy = jest.fn(() => ['Samsung']);
        const widget = makeWidget({
          trackedFilters: {
            brand: brandFilterSpy,
          },
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual(
          undefined
        );
        expect(brandFilterSpy).toHaveBeenCalledTimes(0);

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse({
                facets: {
                  brand: {
                    Samsung: 100,
                    Apple: 100,
                  },
                },
              }),
            ]),
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual(
          undefined
        );
        expect(brandFilterSpy).toHaveBeenCalledTimes(0);

        helper.setState({
          disjunctiveFacetsRefinements: {
            brand: ['Samsung', 'Apple'],
          },
        });

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse({
                facets: {
                  brand: {
                    Samsung: 100,
                    Apple: 100,
                  },
                },
              }),
            ]),
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'ais-brand-Samsung',
        ]);
        expect(brandFilterSpy).toHaveBeenCalledTimes(1);
        expect(brandFilterSpy).toHaveBeenCalledWith(['Samsung', 'Apple']);
      });

      test('can filter tracked filters from numeric refinements', () => {
        const helper = createFakeHelper();
        const priceFilterSpy = jest.fn(() => [500]);
        const widget = makeWidget({
          trackedFilters: {
            price: priceFilterSpy,
          },
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual(
          undefined
        );
        expect(priceFilterSpy).toHaveBeenCalledTimes(0);

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse(),
            ]),
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual(
          undefined
        );
        expect(priceFilterSpy).toHaveBeenCalledTimes(0);

        helper.setState({
          numericRefinements: {
            price: {
              '<=': [500, 400],
              '>=': [100],
            },
          },
        });

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse(),
            ]),
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'ais-price-500',
        ]);
        expect(priceFilterSpy).toHaveBeenCalledTimes(1);
        expect(priceFilterSpy).toHaveBeenCalledWith([500, 400, 100]);
      });

      test('escapes all ruleContexts before passing them to search parameters', () => {
        const helper = createFakeHelper({
          disjunctiveFacets: ['brand'],
        });
        const widget = makeWidget({
          trackedFilters: {
            brand: values => values,
          },
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        helper.setState({
          disjunctiveFacetsRefinements: {
            brand: ['Insignia™', '© Apple'],
          },
        });

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse({
                facets: {
                  brand: {
                    'Insignia™': 100,
                    '© Apple': 100,
                  },
                },
              }),
            ]),
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'ais-brand-Insignia_',
          'ais-brand-_Apple',
        ]);
      });

      test('slices and warns when more than 10 ruleContexts are applied', () => {
        const brandFacetRefinements = [
          'Insignia',
          'Canon',
          'Dynex',
          'LG',
          'Metra',
          'Sony',
          'HP',
          'Apple',
          'Samsung',
          'Speck',
          'PNY',
        ];

        expect(brandFacetRefinements).toHaveLength(11);

        const helper = createFakeHelper({
          disjunctiveFacets: ['brand'],
        });
        const widget = makeWidget({
          trackedFilters: {
            brand: values => values,
          },
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        expect(() => {
          helper.setState({
            disjunctiveFacetsRefinements: {
              brand: brandFacetRefinements,
            },
          });
        })
          .toWarnDev(`[InstantSearch.js]: The maximum number of \`ruleContexts\` is 10. They have been sliced to that limit.
Consider using \`transformRuleContexts\` to minimize the number of rules sent to Algolia.`);

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse({
                facets: {
                  brand: {
                    Insignia: 100,
                    Canon: 100,
                    Dynex: 100,
                    LG: 100,
                    Metra: 100,
                    Sony: 100,
                    HP: 100,
                    Apple: 100,
                    Samsung: 100,
                    Speck: 100,
                    PNY: 100,
                  },
                },
              }),
            ]),
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toHaveLength(
          10
        );
        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'ais-brand-Insignia',
          'ais-brand-Canon',
          'ais-brand-Dynex',
          'ais-brand-LG',
          'ais-brand-Metra',
          'ais-brand-Sony',
          'ais-brand-HP',
          'ais-brand-Apple',
          'ais-brand-Samsung',
          'ais-brand-Speck',
        ]);
      });

      test('reinitializes the rule contexts on dispose', () => {
        const helper = createFakeHelper({
          disjunctiveFacets: ['brand'],
          ruleContexts: ['initial-rule'],
        });
        const widget = makeWidget({
          trackedFilters: {
            brand: values => values,
          },
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        helper.setState({
          disjunctiveFacetsRefinements: {
            brand: ['Samsung', 'Apple'],
          },
        });

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse({
                facets: {
                  brand: {
                    Samsung: 100,
                    Apple: 100,
                  },
                },
              }),
            ]),
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'initial-rule',
          'ais-brand-Samsung',
          'ais-brand-Apple',
        ]);

        const nextState = widget.dispose!({ helper, state: helper.state });

        expect((nextState as SearchParameters).ruleContexts).toEqual([
          'initial-rule',
        ]);
      });

      test('stops tracking filters after dispose', () => {
        const helper = createFakeHelper({
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Samsung'],
          },
        });
        const brandFilterSpy = jest.fn(values => values);
        const widget = makeWidget({
          trackedFilters: {
            brand: brandFilterSpy,
          },
        });

        expect((helper.state as SearchParameters).ruleContexts).toEqual(
          undefined
        );

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'ais-brand-Samsung',
        ]);
        expect(brandFilterSpy).toHaveBeenCalledTimes(1);
        expect(brandFilterSpy).toHaveBeenCalledWith(['Samsung']);

        widget.dispose!({ helper, state: helper.state });

        helper.setState({
          disjunctiveFacetsRefinements: {
            brand: ['Samsung', 'Apple'],
          },
        });

        expect((helper.state as SearchParameters).ruleContexts).toEqual(
          undefined
        );
        expect(brandFilterSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('transformRuleContexts', () => {
      test('transform all rule contexts before passing them to search parameters, except the initial ones', () => {
        const helper = createFakeHelper({
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Samsung', 'Apple'],
          },
          ruleContexts: ['initial-rule'],
        });
        const transformRuleContextsSpy = jest.fn((rules: string[]) =>
          rules.map(rule => rule.replace('ais-', 'transformed-'))
        );
        const widget = makeWidget({
          trackedFilters: {
            brand: values => values,
          },
          transformRuleContexts: transformRuleContextsSpy,
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse(),
              createSingleSearchResponse({
                facets: {
                  brand: {
                    Samsung: 100,
                    Apple: 100,
                  },
                },
              }),
            ]),
          })
        );

        expect(transformRuleContextsSpy).toHaveBeenCalledTimes(1);
        expect(transformRuleContextsSpy).toHaveBeenCalledWith([
          'initial-rule',
          'ais-brand-Samsung',
          'ais-brand-Apple',
        ]);
        expect((helper.state as SearchParameters).ruleContexts).toEqual([
          'initial-rule',
          'transformed-brand-Samsung',
          'transformed-brand-Apple',
        ]);
      });
    });
  });
});
