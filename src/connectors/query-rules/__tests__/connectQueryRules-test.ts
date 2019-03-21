import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import connectQueryRules, {
  QueryRulesWidgetFactory,
} from '../connectQueryRules';

describe('connectQueryRules', () => {
  let renderFn = jest.fn();
  let unmountFn = jest.fn();
  let makeWidget: QueryRulesWidgetFactory<{}>;

  const createFakeHelper = (state = {}) => {
    const client = {};
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
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rules/js/#connector"
`);
    });

    test('does not throw without unmount function', () => {
      expect(() => {
        connectQueryRules(() => {})({});
      }).not.toThrow();
    });

    //     test('throws with a non-functon tracked filter', () => {
    //       expect(() => {
    //         makeWidget({
    //           // @ts-ignore
    //           trackedFilters: {
    //             brand: ['Samsung'],
    //           },
    //         });
    //       }).toThrowErrorMatchingInlineSnapshot(`
    // "'The \\"brand\\" filter value in the \`trackedFilters\` option expects a function.

    // See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rules/js/#connector"
    // `);
    //     });
  });

  describe('lifecycle', () => {
    test('calls the render function on init', () => {
      const helper = createFakeHelper();
      const widget = makeWidget({});

      widget.init({ helper, state: helper.state, instantSearchInstance: {} });

      const [renderingParameters, isFirstRender] = renderFn.mock.calls[0];

      expect(isFirstRender).toBe(true);

      const {
        userData,
        instantSearchInstance,
        widgetParams,
      } = renderingParameters;

      expect(userData).toEqual([]);
      expect(instantSearchInstance).toEqual({});
      expect(widgetParams).toEqual({});
    });

    test('calls the render function on render', () => {
      const helper = createFakeHelper();
      const widget = makeWidget({});

      widget.init({ helper, state: helper.state, instantSearchInstance: {} });
      widget.render({
        helper,
        results: new SearchResults(helper.getState(), [{ hits: [] }]),
        instantSearchInstance: {},
      });

      {
        const [renderingParameters, isFirstRender] = renderFn.mock.calls[1];

        expect(isFirstRender).toBe(false);

        const {
          userData,
          instantSearchInstance,
          widgetParams,
        } = renderingParameters;

        expect(userData).toEqual([]);
        expect(instantSearchInstance).toEqual({});
        expect(widgetParams).toEqual({});
      }

      widget.render({
        helper,
        results: new SearchResults(helper.getState(), [
          { hits: [], userData: [{ banner: 'image.png' }] },
        ]),
        instantSearchInstance: {},
      });

      {
        const [renderingParameters, isFirstRender] = renderFn.mock.calls[2];

        expect(isFirstRender).toBe(false);

        const {
          userData,
          instantSearchInstance,
          widgetParams,
        } = renderingParameters;

        expect(userData).toEqual([{ banner: 'image.png' }]);
        expect(instantSearchInstance).toEqual({});
        expect(widgetParams).toEqual({});
      }
    });

    test('calls the unmount function on dispose', () => {
      const helper = createFakeHelper();
      const widget = makeWidget({});

      widget.init({ helper, state: helper.state, instantSearchInstance: {} });
      widget.dispose({ state: helper.getState() });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('options', () => {
    describe('transformItems', () => {
      test('is applied to userData', () => {
        const helper = createFakeHelper();
        const widget = makeWidget({
          transformItems: items => items[0],
        });

        widget.init({ helper, state: helper.state, instantSearchInstance: {} });
        widget.render({
          helper,
          results: new SearchResults(helper.getState(), [
            {
              hits: [],
              userData: [{ banner: 'image1.png' }, { banner: 'image2.png' }],
            },
          ]),
          instantSearchInstance: {},
        });

        const [renderingParameters] = renderFn.mock.calls[1];

        const { userData } = renderingParameters;

        expect(userData).toEqual({ banner: 'image1.png' });
      });
    });

    //     describe('trackedFilters', () => {
    //       test('adds all ruleContexts to search parameters from facets and numeric refinements', () => {
    //         const brandFilterSpy = jest.fn(values => values);
    //         const priceFilterSpy = jest.fn(values => values);
    //         const helper = createFakeHelper();
    //         const widget = makeWidget({
    //           trackedFilters: {
    //             brand: brandFilterSpy,
    //             price: priceFilterSpy,
    //           },
    //         });

    //         widget.init({ helper, state: helper.state, instantSearchInstance: {} });

    //         // There's no results yet, so no `ruleContexts` should be set.
    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([]);
    //         expect(brandFilterSpy).toHaveBeenCalledTimes(1);
    //         expect(brandFilterSpy).toHaveBeenCalledWith([]);
    //         expect(priceFilterSpy).toHaveBeenCalledTimes(1);
    //         expect(priceFilterSpy).toHaveBeenCalledWith([]);

    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [
    //             {},
    //             {
    //               facets: {
    //                 brand: {
    //                   Samsung: 100,
    //                   Apple: 100,
    //                 },
    //               },
    //             },
    //           ]),
    //           instantSearchInstance: {},
    //         });

    //         // There are some results with the facets that we track in the
    //         // widget but the query parameters are not set in the helper.
    //         // Therefore, no `ruleContexts` should be set.
    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([]);
    //         expect(brandFilterSpy).toHaveBeenCalledTimes(2);
    //         expect(brandFilterSpy).toHaveBeenCalledWith([]);
    //         expect(priceFilterSpy).toHaveBeenCalledTimes(2);
    //         expect(priceFilterSpy).toHaveBeenCalledWith([]);

    //         helper.setQueryParameter('disjunctiveFacets', ['brand']);
    //         helper.setQueryParameter('disjunctiveFacetsRefinements', {
    //           brand: ['Samsung', 'Apple'],
    //         });
    //         helper.setQueryParameter('numericRefinements', {
    //           price: {
    //             '<=': [500, 400],
    //             '>=': [100],
    //           },
    //         });

    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [
    //             {},
    //             {
    //               facets: {
    //                 brand: {
    //                   Samsung: 100,
    //                   Apple: 100,
    //                 },
    //               },
    //             },
    //           ]),
    //           instantSearchInstance: {},
    //         });

    //         // The search state contains the facets that we track,
    //         // therefore the `ruleContexts` should finally be set.
    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([
    //           'ais-brand-Samsung',
    //           'ais-brand-Apple',
    //           'ais-price-500',
    //           'ais-price-400',
    //           'ais-price-100',
    //         ]);
    //         expect(brandFilterSpy).toHaveBeenCalledTimes(3);
    //         expect(brandFilterSpy).toHaveBeenCalledWith(['Samsung', 'Apple']);
    //         expect(priceFilterSpy).toHaveBeenCalledTimes(3);
    //         expect(priceFilterSpy).toHaveBeenCalledWith([500, 400, 100]);
    //       });

    //       test('can filter trackedFilters with facets refinements', () => {
    //         const brandFilterSpy = jest.fn(() => ['Samsung']);
    //         const helper = createFakeHelper();
    //         const widget = makeWidget({
    //           trackedFilters: {
    //             brand: brandFilterSpy,
    //           },
    //         });

    //         widget.init({ helper, state: helper.state, instantSearchInstance: {} });

    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([]);
    //         expect(brandFilterSpy).toHaveBeenCalledTimes(1);
    //         expect(brandFilterSpy).toHaveBeenCalledWith([]);

    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [
    //             {},
    //             {
    //               facets: {
    //                 brand: {
    //                   Samsung: 100,
    //                   Apple: 100,
    //                 },
    //               },
    //             },
    //           ]),
    //           instantSearchInstance: {},
    //         });

    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([]);
    //         expect(brandFilterSpy).toHaveBeenCalledTimes(2);
    //         expect(brandFilterSpy).toHaveBeenCalledWith([]);

    //         helper.setQueryParameter('disjunctiveFacets', ['brand']);
    //         helper.setQueryParameter('disjunctiveFacetsRefinements', {
    //           brand: ['Samsung', 'Apple'],
    //         });

    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [
    //             {},
    //             {
    //               facets: {
    //                 brand: {
    //                   Samsung: 100,
    //                   Apple: 100,
    //                 },
    //               },
    //             },
    //           ]),
    //           instantSearchInstance: {},
    //         });

    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([
    //           'ais-brand-Samsung',
    //         ]);
    //         expect(brandFilterSpy).toHaveBeenCalledTimes(3);
    //         expect(brandFilterSpy).toHaveBeenCalledWith(['Samsung', 'Apple']);
    //       });

    //       test('can filter tracked filters from numeric refinements', () => {
    //         const priceFilterSpy = jest.fn(() => [500]);
    //         const helper = createFakeHelper();
    //         const widget = makeWidget({
    //           trackedFilters: {
    //             price: priceFilterSpy,
    //           },
    //         });

    //         widget.init({ helper, state: helper.state, instantSearchInstance: {} });

    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([]);
    //         expect(priceFilterSpy).toHaveBeenCalledTimes(1);
    //         expect(priceFilterSpy).toHaveBeenCalledWith([]);

    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [{}, {}]),
    //           instantSearchInstance: {},
    //         });

    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([]);
    //         expect(priceFilterSpy).toHaveBeenCalledTimes(2);
    //         expect(priceFilterSpy).toHaveBeenCalledWith([]);

    //         helper.setQueryParameter('numericRefinements', {
    //           price: {
    //             '<=': [500, 400],
    //             '>=': [100],
    //           },
    //         });

    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [{}, {}]),
    //           instantSearchInstance: {},
    //         });

    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([
    //           'ais-price-500',
    //         ]);
    //         expect(priceFilterSpy).toHaveBeenCalledTimes(3);
    //         expect(priceFilterSpy).toHaveBeenCalledWith([500, 400, 100]);
    //       });

    //       test('escapes all ruleContexts before passing them to search parameters', () => {
    //         const helper = createFakeHelper({
    //           disjunctiveFacets: ['brand'],
    //           disjunctiveFacetsRefinements: {
    //             brand: ['Insignia™', '© Apple'],
    //           },
    //         });
    //         const widget = makeWidget({
    //           trackedFilters: {
    //             brand: values => values,
    //           },
    //         });

    //         widget.init({ helper, state: helper.state, instantSearchInstance: {} });
    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [
    //             {},
    //             {
    //               facets: {
    //                 brand: {
    //                   'Insignia™': 100,
    //                   Apple: 100,
    //                 },
    //               },
    //             },
    //           ]),
    //           instantSearchInstance: {},
    //         });

    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([
    //           'ais-brand-Insignia_',
    //           'ais-brand-_Apple',
    //         ]);
    //       });

    //       test('slices and warns when more than 10 ruleContexts are applied', () => {
    //         const brandFacetRefinements = [
    //           'Insignia',
    //           'Canon',
    //           'Dynex',
    //           'LG',
    //           'Metra',
    //           'Sony',
    //           'HP',
    //           'Apple',
    //           'Samsung',
    //           'Speck',
    //           'PNY',
    //         ];

    //         expect(brandFacetRefinements).toHaveLength(11);

    //         const helper = createFakeHelper({
    //           disjunctiveFacets: ['brand'],
    //           disjunctiveFacetsRefinements: {
    //             brand: brandFacetRefinements,
    //           },
    //         });
    //         const widget = makeWidget({
    //           trackedFilters: {
    //             brand: values => values,
    //           },
    //         });

    //         expect(() => {
    //           widget.init({
    //             helper,
    //             state: helper.state,
    //             instantSearchInstance: {},
    //           });
    //         })
    //           .toWarnDev(`[InstantSearch.js]: The maximum number of \`ruleContexts\` is 10. They have been sliced to that limit.
    // Consider using \`transformRuleContexts\` to minimize the number of rules sent to Algolia.`);

    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [
    //             {},
    //             {
    //               facets: {
    //                 brand: {
    //                   Insignia: 100,
    //                   Canon: 100,
    //                   Dynex: 100,
    //                   LG: 100,
    //                   Metra: 100,
    //                   Sony: 100,
    //                   HP: 100,
    //                   Apple: 100,
    //                   Samsung: 100,
    //                   Speck: 100,
    //                   PNY: 100,
    //                 },
    //               },
    //             },
    //           ]),
    //           instantSearchInstance: {},
    //         });

    //         expect(helper.getQueryParameter('ruleContexts')).toHaveLength(10);
    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([
    //           'ais-brand-Insignia',
    //           'ais-brand-Canon',
    //           'ais-brand-Dynex',
    //           'ais-brand-LG',
    //           'ais-brand-Metra',
    //           'ais-brand-Sony',
    //           'ais-brand-HP',
    //           'ais-brand-Apple',
    //           'ais-brand-Samsung',
    //           'ais-brand-Speck',
    //         ]);
    //       });

    //       test('reinitializes the rule contexts on dispose', () => {
    //         const helper = createFakeHelper({
    //           disjunctiveFacets: ['brand'],
    //           disjunctiveFacetsRefinements: {
    //             brand: ['Samsung', 'Apple'],
    //           },
    //           ruleContexts: ['initial-rule'],
    //         });
    //         const widget = makeWidget({
    //           trackedFilters: {
    //             brand: values => values,
    //           },
    //         });

    //         widget.init({ helper, state: helper.state, instantSearchInstance: {} });
    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [
    //             {},
    //             {
    //               facets: {
    //                 brand: {
    //                   Samsung: 100,
    //                   Apple: 100,
    //                 },
    //               },
    //             },
    //           ]),
    //           instantSearchInstance: {},
    //         });

    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([
    //           'initial-rule',
    //           'ais-brand-Samsung',
    //           'ais-brand-Apple',
    //         ]);

    //         const nextState = widget.dispose({ state: helper.getState() });

    //         expect(nextState.ruleContexts).toEqual(['initial-rule']);
    //       });
    //     });

    //     describe('transformRuleContexts', () => {
    //       test('transform all rule contexts before passing them to search parameters', () => {
    //         const helper = createFakeHelper({
    //           disjunctiveFacets: ['brand'],
    //           disjunctiveFacetsRefinements: {
    //             brand: ['Samsung', 'Apple'],
    //           },
    //         });
    //         const widget = makeWidget({
    //           trackedFilters: {
    //             brand: values => values,
    //           },
    //           transformRuleContexts: rules =>
    //             rules.map(rule => rule.replace('ais-', '')),
    //         });

    //         widget.init({ helper, state: helper.state, instantSearchInstance: {} });
    //         widget.render({
    //           helper,
    //           results: new SearchResults(helper.getState(), [
    //             {},
    //             {
    //               facets: {
    //                 brand: {
    //                   Samsung: 100,
    //                   Apple: 100,
    //                 },
    //               },
    //             },
    //           ]),
    //           instantSearchInstance: {},
    //         });

    //         expect(helper.getQueryParameter('ruleContexts')).toEqual([
    //           'brand-Samsung',
    //           'brand-Apple',
    //         ]);
    //       });
    //     });
  });
});
