import { SearchParameters } from 'algoliasearch-helper';
import connect, { QueryRulesProps } from '../connectQueryRules';

jest.mock('../../core/createConnector', () => (connector: any) => connector);

describe('connectQueryRules', () => {
  const defaultProps: QueryRulesProps = {
    transformItems: items => items,
    trackedFilters: {},
    transformRuleContexts: ruleContexts => ruleContexts,
  };

  describe('single index', () => {
    const indexName = 'index';
    const context = { context: { ais: { mainTargetedIndex: indexName } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const getSearchParameters = connect.getSearchParameters.bind(context);

    describe('default', () => {
      it('without userData provides the correct props to the component', () => {
        const props: QueryRulesProps = {
          ...defaultProps,
        };
        const searchState = {};
        const searchResults = {
          results: { [indexName]: { userData: undefined } },
        };

        expect(getProvidedProps(props, searchState, searchResults)).toEqual({
          items: [],
          canRefine: false,
        });
      });

      it('with userData provides the correct props to the component', () => {
        const props: QueryRulesProps = {
          ...defaultProps,
        };
        const searchState = {};
        const searchResults = {
          results: {
            [indexName]: { userData: [{ banner: 'image.png' }] },
          },
        };

        expect(getProvidedProps(props, searchState, searchResults)).toEqual({
          items: [{ banner: 'image.png' }],
          canRefine: true,
        });
      });
    });

    describe('transformItems', () => {
      it('transforms items before passing the props to the component', () => {
        const transformItemsSpy = jest.fn(() => [
          { banner: 'image-transformed.png' },
        ]);
        const props: QueryRulesProps = {
          ...defaultProps,
          transformItems: transformItemsSpy,
        };
        const searchState = {};
        const searchResults = {
          results: {
            [indexName]: { userData: [{ banner: 'image.png' }] },
          },
        };

        expect(getProvidedProps(props, searchState, searchResults)).toEqual({
          items: [{ banner: 'image-transformed.png' }],
          canRefine: true,
        });
        expect(transformItemsSpy).toHaveBeenCalledTimes(1);
        expect(transformItemsSpy).toHaveBeenCalledWith([
          { banner: 'image.png' },
        ]);
      });
    });

    describe('trackedFilters', () => {
      it('does not set ruleContexts without search state and trackedFilters', () => {
        const props: QueryRulesProps = {
          ...defaultProps,
        };
        const searchState = {};
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(searchParameters.ruleContexts).toEqual(undefined);
      });

      it('does not set ruleContexts with search state but without tracked filters', () => {
        const props: QueryRulesProps = {
          ...defaultProps,
        };
        const searchState = {
          range: {
            price: {
              min: 20,
              max: 3000,
            },
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(searchParameters.ruleContexts).toEqual(undefined);
      });

      it('does not reset initial ruleContexts with trackedFilters', () => {
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            price: values => values,
          },
        };
        const searchState = {};
        const searchParameters = getSearchParameters(
          SearchParameters.make({
            ruleContexts: ['initial-rule'],
          }),
          props,
          searchState
        );

        expect(searchParameters.ruleContexts).toEqual(['initial-rule']);
      });

      it('sets ruleContexts based on range', () => {
        const priceSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            price: priceSpy,
          },
        };
        const searchState = {
          range: {
            price: {
              min: 20,
              max: 3000,
            },
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(priceSpy).toHaveBeenCalledTimes(1);
        expect(priceSpy).toHaveBeenCalledWith([20, 3000]);
        expect(searchParameters.ruleContexts).toEqual([
          'ais-price-20',
          'ais-price-3000',
        ]);
      });

      it('sets ruleContexts based on refinementList', () => {
        const fruitSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            fruit: fruitSpy,
          },
        };
        const searchState = {
          refinementList: {
            fruit: ['lemon', 'orange'],
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(fruitSpy).toHaveBeenCalledTimes(1);
        expect(fruitSpy).toHaveBeenCalledWith(['lemon', 'orange']);
        expect(searchParameters.ruleContexts).toEqual([
          'ais-fruit-lemon',
          'ais-fruit-orange',
        ]);
      });

      it('sets ruleContexts based on hierarchicalMenu', () => {
        const productsSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            products: productsSpy,
          },
        };
        const searchState = {
          hierarchicalMenu: {
            products: 'Laptops > Surface',
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(productsSpy).toHaveBeenCalledTimes(1);
        expect(productsSpy).toHaveBeenCalledWith(['Laptops > Surface']);
        expect(searchParameters.ruleContexts).toEqual([
          'ais-products-Laptops_Surface',
        ]);
      });

      it('sets ruleContexts based on menu', () => {
        const brandsSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            brands: brandsSpy,
          },
        };
        const searchState = {
          menu: {
            brands: 'Sony',
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(brandsSpy).toHaveBeenCalledTimes(1);
        expect(brandsSpy).toHaveBeenCalledWith(['Sony']);
        expect(searchParameters.ruleContexts).toEqual(['ais-brands-Sony']);
      });

      it('sets ruleContexts based on multiRange', () => {
        const rankSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            rank: rankSpy,
          },
        };
        const searchState = {
          multiRange: {
            rank: '2:5',
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(rankSpy).toHaveBeenCalledTimes(1);
        expect(rankSpy).toHaveBeenCalledWith(['2', '5']);
        expect(searchParameters.ruleContexts).toEqual([
          'ais-rank-2',
          'ais-rank-5',
        ]);
      });

      it('sets ruleContexts based on toggle', () => {
        const freeShippingSpy = jest.fn(values => values);
        const availableInStockSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            freeShipping: freeShippingSpy,
            availableInStock: availableInStockSpy,
          },
        };
        const searchState = {
          toggle: {
            freeShipping: true,
            availableInStock: false,
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(freeShippingSpy).toHaveBeenCalledTimes(1);
        expect(freeShippingSpy).toHaveBeenCalledWith([true]);
        expect(availableInStockSpy).toHaveBeenCalledTimes(1);
        expect(availableInStockSpy).toHaveBeenCalledWith([false]);
        expect(searchParameters.ruleContexts).toEqual([
          'ais-freeShipping-true',
          'ais-availableInStock-false',
        ]);
      });

      it('escapes all rule contexts before passing them to search parameters', () => {
        const brandSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            brand: brandSpy,
          },
        };
        const searchState = {
          refinementList: {
            brand: ['Insignia™', '© Apple'],
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(brandSpy).toHaveBeenCalledTimes(1);
        expect(brandSpy).toHaveBeenCalledWith(['Insignia™', '© Apple']);
        expect(searchParameters.ruleContexts).toEqual([
          'ais-brand-Insignia_',
          'ais-brand-_Apple',
        ]);
      });

      it('slices and warns in development when more than 10 rule contexts are applied', () => {
        // We need to simulate being in development mode and to mock the global console object
        // in this test to assert that development warnings are displayed correctly.
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        const warnSpy = jest
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

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

        const brandSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            brand: brandSpy,
          },
        };
        const searchState = {
          refinementList: {
            brand: brandFacetRefinements,
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy)
          .toHaveBeenCalledWith(`The maximum number of \`ruleContexts\` is 10. They have been sliced to that limit.
Consider using \`transformRuleContexts\` to minimize the number of rules sent to Algolia.`);

        expect(brandSpy).toHaveBeenCalledTimes(1);
        expect(brandSpy).toHaveBeenCalledWith([
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
        ]);
        expect(searchParameters.ruleContexts).toEqual([
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

        process.env.NODE_ENV = originalNodeEnv;
        warnSpy.mockRestore();
      });
    });

    describe('transformRuleContexts', () => {
      it('transform rule contexts before adding them to search parameters', () => {
        const priceSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            price: priceSpy,
          },
          transformRuleContexts: rules =>
            rules.map(rule => rule.replace('ais-', 'transformed-')),
        };
        const searchState = {
          range: {
            price: {
              min: 20,
              max: 3000,
            },
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(priceSpy).toHaveBeenCalledTimes(1);
        expect(priceSpy).toHaveBeenCalledWith([20, 3000]);
        expect(searchParameters.ruleContexts).toEqual([
          'transformed-price-20',
          'transformed-price-3000',
        ]);
      });
    });
  });

  describe('multi index', () => {
    const firstIndexName = 'firstIndex';
    const secondIndexName = 'secondIndex';
    const context = {
      context: {
        ais: { mainTargetedIndex: firstIndexName },
        multiIndexContext: { targetedIndex: secondIndexName },
      },
    };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const getSearchParameters = connect.getSearchParameters.bind(context);

    it('without userData provides the correct props to the component', () => {
      const props: QueryRulesProps = {
        ...defaultProps,
      };
      const searchState = {};
      const searchResults = {
        results: { [secondIndexName]: { userData: undefined } },
      };

      expect(getProvidedProps(props, searchState, searchResults)).toEqual({
        items: [],
        canRefine: false,
      });
    });

    it('with userData provides the correct props to the component', () => {
      const props: QueryRulesProps = {
        ...defaultProps,
      };
      const searchState = {};
      const searchResults = {
        results: {
          [secondIndexName]: { userData: [{ banner: 'image.png' }] },
        },
      };

      expect(getProvidedProps(props, searchState, searchResults)).toEqual({
        items: [{ banner: 'image.png' }],
        canRefine: true,
      });
    });

    describe('transformItems', () => {
      it('transforms items before passing the props to the component', () => {
        const transformItemsSpy = jest.fn(() => [
          { banner: 'image-transformed.png' },
        ]);
        const props: QueryRulesProps = {
          ...defaultProps,
          transformItems: transformItemsSpy,
        };
        const searchState = {};
        const searchResults = {
          results: {
            [secondIndexName]: { userData: [{ banner: 'image.png' }] },
          },
        };
        expect(getProvidedProps(props, searchState, searchResults)).toEqual({
          items: [{ banner: 'image-transformed.png' }],
          canRefine: true,
        });
        expect(transformItemsSpy).toHaveBeenCalledTimes(1);
        expect(transformItemsSpy).toHaveBeenCalledWith([
          { banner: 'image.png' },
        ]);
      });
    });

    describe('trackedFilters', () => {
      it('does not set ruleContexts without search state and trackedFilters', () => {
        const props: QueryRulesProps = {
          ...defaultProps,
        };
        const searchState = {};
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(searchParameters.ruleContexts).toEqual(undefined);
      });

      it('does not set ruleContexts with search state but without tracked filters', () => {
        const props: QueryRulesProps = {
          ...defaultProps,
        };
        const searchState = {
          indices: {
            [secondIndexName]: {
              range: {
                price: {
                  min: 20,
                  max: 3000,
                },
              },
            },
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(searchParameters.ruleContexts).toEqual(undefined);
      });

      it('sets ruleContexts based on range', () => {
        const priceSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            price: priceSpy,
          },
        };
        const searchState = {
          indices: {
            [secondIndexName]: {
              range: {
                price: {
                  min: 20,
                  max: 3000,
                },
              },
            },
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(priceSpy).toHaveBeenCalledTimes(1);
        expect(priceSpy).toHaveBeenCalledWith([20, 3000]);
        expect(searchParameters.ruleContexts).toEqual([
          'ais-price-20',
          'ais-price-3000',
        ]);
      });
    });

    describe('transformRuleContexts', () => {
      it('transform rule contexts before adding them to search parameters', () => {
        const priceSpy = jest.fn(values => values);
        const props: QueryRulesProps = {
          ...defaultProps,
          trackedFilters: {
            price: priceSpy,
          },
          transformRuleContexts: rules =>
            rules.map(rule => rule.replace('ais-', 'transformed-')),
        };
        const searchState = {
          indices: {
            [secondIndexName]: {
              range: {
                price: {
                  min: 20,
                  max: 3000,
                },
              },
            },
          },
        };
        const searchParameters = getSearchParameters(
          new SearchParameters(),
          props,
          searchState
        );

        expect(priceSpy).toHaveBeenCalledTimes(1);
        expect(priceSpy).toHaveBeenCalledWith([20, 3000]);
        expect(searchParameters.ruleContexts).toEqual([
          'transformed-price-20',
          'transformed-price-3000',
        ]);
      });
    });
  });
});
