import { render } from 'preact-compat';
import algoliasearchHelper, {
  AlgoliaSearchHelper,
  SearchResults,
} from 'algoliasearch-helper';
import currentRefinements from '../current-refinements';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

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
    it('throws without container', () => {
      expect(() => {
        currentRefinements({
          // @ts-ignore wrong options
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

  describe('getConfiguration()', () => {
    it('configures nothing', () => {
      const widget = currentRefinements({
        container: document.createElement('div'),
      });
      expect(widget.getConfiguration).toEqual(undefined);
    });
  });

  describe('render()', () => {
    let helper: AlgoliaSearchHelper;

    beforeEach(() => {
      helper = algoliasearchHelper(createSearchClient(), 'index_name', {
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

      widget.init!(
        createInitOptions({
          helper,
        })
      );

      const renderParameters = {
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            facets: {
              facet: {
                'facet-val1': 1,
              },
            },
          }),
        ]),
        helper,
        state: helper.state,
      };

      widget.render!(createRenderOptions(renderParameters));
      widget.render!(createRenderOptions(renderParameters));

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

        expect(render).toHaveBeenCalledTimes(1);
        expect(render.mock.calls[0][0]).toMatchSnapshot();
        expect(render.mock.calls[0][1]).toBe(container);
      });

      it('should render with a HTMLElement container', () => {
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

        widget.init!(
          createInitOptions({
            helper,
          })
        );
        widget.render!(
          createRenderOptions({
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
            helper,
            state: helper.state,
          })
        );

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

        widget.init!(
          createInitOptions({
            helper,
          })
        );
        widget.render!(
          createRenderOptions({
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({
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
                // @ts-ignore wrong types for `disjunctiveFacets`
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
              }),
            ]),
            helper,
            state: helper.state,
          })
        );

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

        widget.init!(
          createInitOptions({
            helper,
          })
        );
        widget.render!(
          createRenderOptions({
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
            helper,
            state: helper.state,
          })
        );

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
          },
        });

        helper
          .addFacetRefinement('facet', 'facet-val1')
          .addFacetRefinement('facet', 'facet-val2')
          .addFacetRefinement('extraFacet', 'extraFacet-val1')
          .addFacetRefinement('extraFacet', 'extraFacet-val2')
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

        widget.init!(
          createInitOptions({
            helper,
          })
        );

        widget.render!(
          createRenderOptions({
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({
                facets: {
                  facet: {
                    'facet-val1': 100,
                    'facet-val2': 200,
                  },
                  extraFacet: {
                    'extraFacet-val1': 100,
                    'extraFacet-val2': 200,
                  },
                  facetExclude: {
                    'facetExclude-val1': 300,
                    'facetExclude-val2': 400,
                  },
                  disjunctiveFacet: {
                    'disjunctiveFacet-val1': 300,
                    'disjunctiveFacet-val2': 400,
                  },
                  hierarchicalFacet: {
                    'hierarchicalFacet-val1': 500,
                    'hierarchicalFacet-val2': 500,
                    'hierarchicalFacet-val1 > hierarchicalFacet-val2': 500,
                  },
                },
              }),
            ]),
            helper,
            state: helper.state,
          })
        );

        expect(render.mock.calls[0][0]).toMatchSnapshot();
      });
    });
  });
});
