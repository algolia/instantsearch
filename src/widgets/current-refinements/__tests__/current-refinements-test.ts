import { render as preactRender, VNode } from 'preact';
import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import currentRefinements from '../current-refinements';
import { CurrentRefinementsProps } from '../../../components/CurrentRefinements/CurrentRefinements';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { castToJestMock } from '../../../../test/utils/castToJestMock';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('currentRefinements()', () => {
  beforeEach(() => {
    render.mockClear();
  });

  describe('usage', () => {
    it('throws without container', () => {
      expect(() => {
        currentRefinements({
          // @ts-expect-error
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/current-refinements/js/"
`);
    });
  });

  describe('types checking', () => {
    describe('options.container', () => {
      it('does not throw with a string', () => {
        const container = document.createElement('div');
        container.id = 'container';
        document.body.append(container);

        expect(
          currentRefinements.bind(null, {
            container: '#container',
          })
        ).not.toThrow();
      });

      it('does not throw with a HTMLElement', () => {
        expect(
          currentRefinements.bind(null, {
            container: document.createElement('div'),
          })
        ).not.toThrow();
      });
    });

    describe('options.includedAttributes', () => {
      it('does not throw with array of strings', () => {
        expect(
          currentRefinements.bind(null, {
            container: document.createElement('div'),
            includedAttributes: ['attr1', 'attr2', 'attr3', 'attr14'],
          })
        ).not.toThrow();
      });
    });

    describe('options.cssClasses', () => {
      it('does not throw with an empty object', () => {
        expect(
          currentRefinements.bind(null, {
            container: document.createElement('div'),
            cssClasses: {},
          })
        ).not.toThrow();
      });

      it('does not throw with string class', () => {
        expect(
          currentRefinements.bind(null, {
            container: document.createElement('div'),
            cssClasses: {
              item: 'itemClass',
            },
          })
        ).not.toThrow();
      });
    });
  });

  describe('render()', () => {
    it('should render twice <CurrentRefinements ... />', () => {
      const helper = algoliasearchHelper(createSearchClient(), 'index_name', {
        facets: ['facet'],
        facetsRefinements: {
          facet: ['facet-val1'],
        },
      });
      const container = document.createElement('div');
      const widget = currentRefinements({
        container,
      });

      widget.init!(
        createInitOptions({
          helper,
        })
      );

      const renderParameters = {
        scopedResults: [
          {
            indexId: 'index_name',
            helper,
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({
                facets: {
                  facet: {
                    'facet-val1': 1,
                    'facet-val2': 2,
                  },
                  extraFacet: {
                    'extraFacet-val1': 42,
                    'extraFacet-val2': 42,
                  },
                },
              }),
            ]),
          },
        ],
        helper,
        state: helper.state,
      };

      widget.render!(createRenderOptions(renderParameters));
      widget.render!(createRenderOptions(renderParameters));

      const firstRender = render.mock.calls[0][0] as VNode<
        CurrentRefinementsProps
      >;
      const secondRender = render.mock.calls[1][0] as VNode<
        CurrentRefinementsProps
      >;
      const firstContainer = render.mock.calls[0][1];
      const secondContainer = render.mock.calls[1][1];

      expect(render).toHaveBeenCalledTimes(2);
      expect(firstRender.props).toMatchSnapshot();
      expect(firstContainer).toBe(container);
      expect(secondRender.props).toMatchSnapshot();
      expect(secondContainer).toBe(container);
    });

    describe('options.container', () => {
      it('should render with a HTMLElement container', () => {
        const helper = algoliasearchHelper(createSearchClient(), 'index_name');
        const container = document.createElement('div');
        const widget = currentRefinements({
          container,
        });

        widget.init!(
          createInitOptions({
            helper,
          })
        );
        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock.calls[0][0] as VNode<
          CurrentRefinementsProps
        >;

        expect(render).toHaveBeenCalledTimes(1);
        expect(firstRender.props).toMatchSnapshot();
        expect(render.mock.calls[0][1]).toBe(container);
      });
    });

    describe('options.includedAttributes', () => {
      it('should only include the specified attributes', () => {
        const helper = algoliasearchHelper(createSearchClient(), 'index_name', {
          facets: ['facet', 'extraFacet'],
          disjunctiveFacets: ['disjunctiveFacet'],
          facetsRefinements: {
            facet: ['facet-val1', 'facet-val2'],
            extraFacet: ['extraFacet-val1', 'extraFacet-val2'],
          },
          disjunctiveFacetsRefinements: {
            disjunctiveFacet: [
              'disjunctiveFacet-val1',
              'disjunctiveFacet-val2',
            ],
          },
        });
        const widget = currentRefinements({
          container: document.createElement('div'),
          includedAttributes: ['disjunctiveFacet'],
        });

        widget.init!(
          createInitOptions({
            helper,
          })
        );
        widget.render!(
          createRenderOptions({
            scopedResults: [
              {
                indexId: 'index_name',
                helper,
                results: new SearchResults(helper.state, [
                  createSingleSearchResponse({
                    facets: {
                      facet: {
                        'facet-val1': 1,
                        'facet-val2': 2,
                      },
                      extraFacet: {
                        'extraFacet-val1': 42,
                        'extraFacet-val2': 42,
                      },
                      disjunctiveFacet: {
                        'disjunctiveFacet-val1': 3,
                        'disjunctiveFacet-val2': 4,
                      },
                    },
                  }),
                ]),
              },
            ],
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock.calls[0][0] as VNode<
          CurrentRefinementsProps
        >;
        const {
          items: renderedItems,
        } = firstRender.props as CurrentRefinementsProps;

        expect(renderedItems).toHaveLength(1);

        const [item] = renderedItems;
        expect(item.attribute).toBe('disjunctiveFacet');
        expect(item.refinements).toHaveLength(2);
      });

      it('should ignore all attributes when empty refinements', () => {
        const helper = algoliasearchHelper(createSearchClient(), 'index_name', {
          facets: ['facet', 'extraFacet'],
          disjunctiveFacets: ['disjunctiveFacet'],
          facetsRefinements: {
            facet: [],
            extraFacet: ['extraFacet-val1', 'extraFacet-val2'],
          },
          disjunctiveFacetsRefinements: {
            disjunctiveFacet: [
              'disjunctiveFacet-val1',
              'disjunctiveFacet-val2',
            ],
          },
        });
        const widget = currentRefinements({
          container: document.createElement('div'),
          includedAttributes: [],
        });

        widget.init!(
          createInitOptions({
            helper,
          })
        );
        widget.render!(
          createRenderOptions({
            scopedResults: [
              {
                indexId: 'index_name',
                helper,
                results: new SearchResults(helper.state, [
                  createSingleSearchResponse({
                    facets: {
                      extraFacet: {
                        'extraFacet-val1': 42,
                        'extraFacet-val2': 42,
                      },
                      disjunctiveFacet: {
                        'disjunctiveFacet-val1': 3,
                        'disjunctiveFacet-val2': 4,
                      },
                    },
                  }),
                ]),
              },
            ],
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock.calls[0][0] as VNode<
          CurrentRefinementsProps
        >;
        const {
          items: renderedItems,
        } = firstRender.props as CurrentRefinementsProps;

        expect(renderedItems).toHaveLength(0);
      });
    });

    describe('options.excludedAttributes', () => {});

    describe('options.transformItems', () => {
      it('should transform passed items', () => {
        const helper = algoliasearchHelper(createSearchClient(), 'index_name', {
          facets: ['facet', 'extraFacet'],
          disjunctiveFacets: ['disjunctiveFacet'],
          facetsRefinements: {
            facet: ['facet-val1', 'facet-val2'],
            extraFacet: ['extraFacet-val1', 'extraFacet-val2'],
          },
          disjunctiveFacetsRefinements: {
            disjunctiveFacet: [
              'disjunctiveFacet-val1',
              'disjunctiveFacet-val2',
            ],
          },
        });
        const widget = currentRefinements({
          container: document.createElement('div'),
          transformItems: items =>
            items.map(refinementItems => ({
              ...refinementItems,
              refinements: refinementItems.refinements.map(item => ({
                ...item,
                transformed: true,
              })),
            })),
        });

        widget.init!(
          createInitOptions({
            helper,
          })
        );
        widget.render!(
          createRenderOptions({
            scopedResults: [
              {
                indexId: 'index_name',
                helper,
                results: new SearchResults(helper.state, [
                  createSingleSearchResponse({
                    facets: {
                      facet: {
                        'facet-val1': 1,
                        'facet-val2': 2,
                      },
                      extraFacet: {
                        'extraFacet-val1': 42,
                        'extraFacet-val2': 42,
                      },
                      disjunctiveFacet: {
                        'disjunctiveFacet-val1': 3,
                        'disjunctiveFacet-val2': 4,
                      },
                    },
                  }),
                ]),
              },
            ],
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock.calls[0][0] as VNode<
          CurrentRefinementsProps
        >;
        // @TODO: expose a way to transform the item type using transformItems
        const renderedItems = (firstRender.props as CurrentRefinementsProps)
          .items as Array<
          CurrentRefinementsProps['items'][number] & {
            refinements: Array<
              CurrentRefinementsProps['items'][number]['refinements'][number] & {
                transformed: boolean;
              }
            >;
          }
        >;

        expect(renderedItems[0].refinements[0].transformed).toBe(true);
        expect(renderedItems[0].refinements[1].transformed).toBe(true);

        expect(renderedItems[1].refinements[0].transformed).toBe(true);
        expect(renderedItems[1].refinements[1].transformed).toBe(true);

        expect(renderedItems[2].refinements[0].transformed).toBe(true);
        expect(renderedItems[2].refinements[1].transformed).toBe(true);
      });
    });

    describe('options.cssClasses', () => {
      it('should be passed in the cssClasses', () => {
        const helper = algoliasearchHelper(createSearchClient(), 'index_name');
        const widget = currentRefinements({
          container: document.createElement('div'),
          cssClasses: {
            root: 'customRoot',
          },
        });

        widget.init!(
          createInitOptions({
            helper,
          })
        );
        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock.calls[0][0] as VNode<
          CurrentRefinementsProps
        >;
        const props = firstRender.props as CurrentRefinementsProps;

        expect(props.cssClasses.root).toContain('customRoot');
      });

      it('should work with an array', () => {
        const helper = algoliasearchHelper(createSearchClient(), 'index_name');
        const widget = currentRefinements({
          container: document.createElement('div'),
          cssClasses: {
            root: ['customRoot1', 'customRoot2'],
          },
        });

        widget.init!(
          createInitOptions({
            helper,
          })
        );
        widget.render!(
          createRenderOptions({
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock.calls[0][0] as VNode<
          CurrentRefinementsProps
        >;
        const props = firstRender.props as CurrentRefinementsProps;

        expect(props.cssClasses.root).toContain('customRoot1');

        expect(props.cssClasses.root).toContain('customRoot2');
      });
    });

    describe('DOM output', () => {
      it('renders correctly', () => {
        const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
          facets: ['facet', 'facetExclude'],
          disjunctiveFacets: ['rating', 'brand'],
          hierarchicalFacets: [
            {
              name: 'hierarchicalCategories.lvl0',
              attributes: [
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ],
              separator: ' > ',
            },
          ],
          facetsRefinements: {
            facet: ['facetAttribute'],
          },
          facetsExcludes: {
            facetExclude: ['facetExcludeAttribute'],
          },
          disjunctiveFacetsRefinements: {
            rating: ['4', '5'],
            brand: ['Samsung', 'Apple'],
          },
          numericRefinements: { price: { '>=': [100], '<=': [500] } },
          tagRefinements: ['tag1', 'tag2'],
          hierarchicalFacetsRefinements: {
            'hierarchicalCategories.lvl0': ['Cell Phones'],
          },
        });
        const widget = currentRefinements({
          container: document.createElement('div'),
          cssClasses: {
            root: 'root',
            list: 'list',
            item: 'item',
            label: 'label',
            category: 'category',
            categoryLabel: 'categoryLabel',
            delete: 'delete',
          },
        });

        widget.init!(
          createInitOptions({
            helper,
          })
        );

        widget.render!(
          createRenderOptions({
            scopedResults: [
              {
                indexId: 'index_name',
                helper,
                results: new SearchResults(helper.state, [
                  createSingleSearchResponse({
                    facets: {
                      'hierarchicalCategories.lvl0': {
                        'Cell Phones': 3291,
                      },
                      'hierarchicalCategories.lvl1': {
                        'Cell Phones > All Cell Phones with Plans': 126,
                        'Cell Phones > Cell Phone Accessories': 2836,
                        'Cell Phones > Mobile Broadband': 1,
                        'Cell Phones > Prepaid Phones': 55,
                        'Cell Phones > Refurbished Phones': 27,
                        'Cell Phones > Samsung Galaxy': 8,
                        'Cell Phones > Unlocked Cell Phones': 198,
                        'Cell Phones > iPhone': 35,
                      },
                    },
                  }),
                  createSingleSearchResponse({
                    facets: {
                      'hierarchicalCategories.lvl0': {
                        Appliances: 4306,
                        Audio: 1570,
                        'Cameras & Camcorders': 1369,
                        'Car Electronics & GPS': 1208,
                        'Cell Phones': 3291,
                        'Computers & Tablets': 3563,
                        'Health, Fitness & Beauty': 923,
                        'Office & School Supplies': 617,
                        'TV & Home Theater': 1201,
                        'Video Games': 505,
                      },
                    },
                  }),
                ]),
              },
            ],
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock.calls[0][0] as VNode;

        expect(firstRender.props).toMatchSnapshot();
      });
    });
  });
});
