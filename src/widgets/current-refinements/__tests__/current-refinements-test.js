import { render } from 'preact-compat';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import currentRefinements from '../current-refinements';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('currentRefinements()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('usage', () => {
    it('throws usage when no options provided', () => {
      expect(currentRefinements.bind(null, {})).toThrowErrorMatchingSnapshot();
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

    describe('options.templates', () => {
      it('does not throw with an empty object', () => {
        expect(
          currentRefinements.bind(null, {
            container: document.createElement('div'),
            templates: {},
          })
        ).not.toThrow();
      });

      it('does not throw with a string template', () => {
        expect(
          currentRefinements.bind(null, {
            container: document.createElement('div'),
            templates: {
              item: 'string template',
            },
          })
        ).not.toThrow();
      });

      it('does not throw with a function template', () => {
        expect(
          currentRefinements.bind(null, {
            container: document.createElement('div'),
            templates: {
              item: () => 'function template',
            },
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

  describe('getConfiguration()', () => {
    it('configures nothing', () => {
      const widget = currentRefinements({
        container: document.createElement('div'),
      });
      expect(widget.getConfiguration).toEqual(undefined);
    });
  });

  describe('render()', () => {
    let client;
    let helper;

    beforeEach(() => {
      client = algoliasearch('APP_ID', 'API_KEY');
      helper = algoliasearchHelper(client, 'index_name', {
        facets: ['facet', 'facetExclude', 'numericFacet', 'extraFacet'],
        disjunctiveFacets: ['disjunctiveFacet', 'numericDisjunctiveFacet'],
        hierarchicalFacets: [
          {
            name: 'hierarchicalFacet',
            attributes: ['hierarchicalFacet-val1', 'hierarchicalFacet-val2'],
            separator: ' > ',
          },
        ],
      });

      render.mockClear();
    });

    it('should render twice <CurrentRefinements ... />', () => {
      const container = document.createElement('div');
      const widget = currentRefinements({
        container,
      });

      helper.addFacetRefinement('facet', 'facet-val1');

      widget.init({
        helper,
        createURL: () => '#cleared',
        instantSearchInstance: {},
      });

      const renderParameters = {
        results: {
          facets: [
            {
              name: 'facet',
              data: {
                'facet-val1': 1,
              },
            },
          ],
        },
        helper,
        state: helper.state,
        createURL: () => '#cleared',
        instantSearchInstance: {},
      };

      widget.render(renderParameters);
      widget.render(renderParameters);

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[0][0]).toMatchSnapshot();
      expect(render.mock.calls[0][1]).toBe(container);
      expect(render.mock.calls[1][0]).toMatchSnapshot();
      expect(render.mock.calls[1][1]).toBe(container);
    });

    describe('options.container', () => {
      it('should render with a string container', () => {
        const container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        const widget = currentRefinements({
          container: '#container',
        });

        widget.init({
          helper,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });
        widget.render({
          results: {},
          helper,
          state: helper.state,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });

        expect(render).toHaveBeenCalledTimes(1);
        expect(render.mock.calls[0][0]).toMatchSnapshot();
        expect(render.mock.calls[0][1]).toBe(container);
      });

      it('should render with a HTMLElement container', () => {
        const container = document.createElement('div');
        const widget = currentRefinements({
          container,
        });

        widget.init({
          helper,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });
        widget.render({
          results: {},
          helper,
          state: helper.state,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });

        expect(render).toHaveBeenCalledTimes(1);
        expect(render.mock.calls[0][0]).toMatchSnapshot();
        expect(render.mock.calls[0][1]).toBe(container);
      });
    });

    describe('options.includedAttributes', () => {
      it('should only include the specified attributes', () => {
        const widget = currentRefinements({
          container: document.createElement('div'),
          includedAttributes: ['disjunctiveFacet'],
        });

        helper
          .addDisjunctiveFacetRefinement(
            'disjunctiveFacet',
            'disjunctiveFacet-val1'
          )
          .addDisjunctiveFacetRefinement(
            'disjunctiveFacet',
            'disjunctiveFacet-val2'
          )
          // Add some unused refinements to make sure they're ignored
          .addFacetRefinement('facet', 'facet-val1')
          .addFacetRefinement('facet', 'facet-val2')
          .addFacetRefinement('extraFacet', 'extraFacet-val1')
          .addFacetRefinement('extraFacet', 'extraFacet-val2');

        widget.init({
          helper,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });
        widget.render({
          results: {
            facets: [
              {
                name: 'facet',
                exhaustive: true,
                data: {
                  'facet-val1': 1,
                  'facet-val2': 2,
                },
              },
              {
                name: 'extraFacet',
                exhaustive: true,
                data: {
                  'extraFacet-val1': 42,
                  'extraFacet-val2': 42,
                },
              },
            ],
            disjunctiveFacets: [
              {
                name: 'disjunctiveFacet',
                exhaustive: true,
                data: {
                  'disjunctiveFacet-val1': 3,
                  'disjunctiveFacet-val2': 4,
                },
              },
            ],
          },
          helper,
          state: helper.state,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });

        const renderedItems = render.mock.calls[0][0].props.items;
        expect(renderedItems).toHaveLength(1);

        const [item] = renderedItems;
        expect(item.attribute).toBe('disjunctiveFacet');
        expect(item.refinements).toHaveLength(2);
      });

      it('should ignore all attributes when empty array', () => {
        const widget = currentRefinements({
          container: document.createElement('div'),
          includedAttributes: [],
        });

        helper
          .addDisjunctiveFacetRefinement(
            'disjunctiveFacet',
            'disjunctiveFacet-val1'
          )
          .addDisjunctiveFacetRefinement(
            'disjunctiveFacet',
            'disjunctiveFacet-val2'
          )
          .addFacetRefinement('extraFacet', 'extraFacet-val1')
          .addFacetRefinement('extraFacet', 'extraFacet-val2');

        widget.init({
          helper,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });
        widget.render({
          results: {
            facets: [
              {
                name: 'extraFacet',
                exhaustive: true,
                data: {
                  'extraFacet-val1': 42,
                  'extraFacet-val2': 42,
                },
              },
            ],
            disjunctiveFacets: [
              {
                name: 'disjunctiveFacet',
                exhaustive: true,
                data: {
                  'disjunctiveFacet-val1': 3,
                  'disjunctiveFacet-val2': 4,
                },
              },
            ],
          },
          helper,
          state: helper.state,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });

        const renderedItems = render.mock.calls[0][0].props.items;
        expect(renderedItems).toHaveLength(0);
      });
    });

    describe('options.excludedAttributes', () => {});

    describe('options.transformItems', () => {
      it('should transform passed items', () => {
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

        helper
          .addFacetRefinement('facet', 'facet-val1')
          .addFacetRefinement('facet', 'facet-val2')
          .addFacetRefinement('extraFacet', 'facet-val1')
          .addFacetRefinement('extraFacet', 'facet-val2')
          .addDisjunctiveFacetRefinement(
            'disjunctiveFacet',
            'disjunctiveFacet-val1'
          )
          .addDisjunctiveFacetRefinement(
            'disjunctiveFacet',
            'disjunctiveFacet-val2'
          );

        widget.init({
          helper,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });
        widget.render({
          results: {
            facets: [
              {
                name: 'facet',
                exhaustive: true,
                data: {
                  'facet-val1': 1,
                  'facet-val2': 2,
                },
              },
              {
                name: 'extraFacet',
                exhaustive: true,
                data: {
                  'extraFacet-val1': 42,
                  'extraFacet-val2': 42,
                },
              },
            ],
            disjunctiveFacets: [
              {
                name: 'disjunctiveFacet',
                exhaustive: true,
                data: {
                  'disjunctiveFacet-val1': 3,
                  'disjunctiveFacet-val2': 4,
                },
              },
            ],
          },
          helper,
          state: helper.state,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });

        const renderedItems = render.mock.calls[0][0].props.items;

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
        const widget = currentRefinements({
          container: document.createElement('div'),
          cssClasses: {
            root: 'customRoot',
          },
        });

        widget.init({
          helper,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });
        widget.render({
          results: {},
          helper,
          state: helper.state,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });

        expect(render.mock.calls[0][0].props.cssClasses.root).toContain(
          'customRoot'
        );
      });

      it('should work with an array', () => {
        const widget = currentRefinements({
          container: document.createElement('div'),
          cssClasses: {
            root: ['customRoot1', 'customRoot2'],
          },
        });

        widget.init({
          helper,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });
        widget.render({
          results: {},
          helper,
          state: helper.state,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });

        expect(render.mock.calls[0][0].props.cssClasses.root).toContain(
          'customRoot1'
        );

        expect(render.mock.calls[0][0].props.cssClasses.root).toContain(
          'customRoot2'
        );
      });
    });

    describe('DOM output', () => {
      it('renders correctly', () => {
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
            query: 'query',
          },
        });

        helper
          .addFacetRefinement('facet', 'facet-val1')
          .addFacetRefinement('facet', 'facet-val2')
          .addFacetRefinement('extraFacet', 'extraFacet-val1')
          .addFacetExclusion('facetExclude', 'facetExclude-val1')
          .addFacetExclusion('facetExclude', 'facetExclude-val2')
          .addDisjunctiveFacetRefinement(
            'disjunctiveFacet',
            'disjunctiveFacet-val1'
          )
          .addDisjunctiveFacetRefinement(
            'disjunctiveFacet',
            'disjunctiveFacet-val2'
          )
          .toggleFacetRefinement(
            'hierarchicalFacet',
            'hierarchicalFacet-val1 > hierarchicalFacet-val2'
          )
          .addNumericRefinement('numericFacet', '>=', 1)
          .addNumericRefinement('numericFacet', '<=', 2)
          .addNumericRefinement('numericDisjunctiveFacet', '>=', 3)
          .addNumericRefinement('numericDisjunctiveFacet', '<=', 4)
          .addTag('tag1')
          .addTag('tag2');

        widget.init({
          helper,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });
        widget.render({
          results: {
            facets: [
              {
                name: 'facet',
                exhaustive: true,
                data: {
                  'facet-val1': 1,
                  'facet-val2': 2,
                  'facet-val3': 42,
                },
              },
              {
                name: 'extraFacet',
                exhaustive: true,
                data: {
                  'extraFacet-val1': 42,
                  'extraFacet-val2': 42,
                },
              },
            ],
            disjunctiveFacets: [
              {
                name: 'disjunctiveFacet',
                exhaustive: true,
                data: {
                  'disjunctiveFacet-val1': 3,
                  'disjunctiveFacet-val2': 4,
                  'disjunctiveFacet-val3': 42,
                },
              },
            ],
            hierarchicalFacets: [
              {
                name: 'hierarchicalFacet',
                data: [
                  {
                    name: 'hierarchicalFacet-val1',
                    count: 5,
                    exhaustive: true,
                    data: [
                      {
                        name: 'hierarchicalFacet-val2',
                        count: 6,
                        exhaustive: true,
                      },
                    ],
                  },
                  {
                    name: 'hierarchicalFacet-val2',
                    count: 42,
                    exhaustive: true,
                  },
                ],
              },
            ],
          },
          helper,
          state: helper.state,
          createURL: () => '#cleared',
          instantSearchInstance: {},
        });

        expect(render.mock.calls[0][0]).toMatchSnapshot();
      });
    });
  });
});
