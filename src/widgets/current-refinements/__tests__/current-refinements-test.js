import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import { prepareTemplateProps } from '../../../lib/utils';
import currentRefinements from '../current-refinements';
import defaultTemplates from '../defaultTemplates';

describe('currentRefinements()', () => {
  const cssClasses = {
    root: 'root',
    list: 'list',
    item: 'item',
    label: 'label',
    category: 'category',
    categoryLabel: 'categoryLabel',
    delete: 'delete',
    reset: 'reset',
  };

  beforeEach(() => {
    document.body.innerHTML = '';
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

      // it.skip('does not throw with a function template', () => {
      //   parameters.includedAttributes = [
      //     { name: 'attr1' },
      //     { name: 'attr2', template: () => 'CUSTOM TEMPLATE' },
      //   ];
      //   expect(boundWidget).not.toThrow();
      // });
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
            css: {},
          })
        ).not.toThrow();
      });

      it('does not throw with string class', () => {
        expect(
          currentRefinements.bind(null, {
            container: document.createElement('div'),
            css: {
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
    let ReactDOM;
    let parameters;
    let client;
    let helper;
    let initParameters;
    let renderParameters;
    let defaultRefinements;
    let expectedProps;

    // function setRefinementsInExpectedProps() {
    //   expectedProps.refinements = refinements;
    // }

    beforeEach(() => {
      ReactDOM = { render: jest.fn() };
      currentRefinements.__Rewire__('render', ReactDOM.render);

      // parameters = {
      //   container: document.createElement('div'),
      //   includedAttributes: [
      //     'facet',
      //     'facetExclude',
      //     'disjunctiveFacet',
      //     'hierarchicalFacet',
      //     'numericFacet',
      //     'numericDisjunctiveFacet',
      //     '_tags',
      //   ],
      //   templates: {
      //     item: 'item',
      //   },
      //   cssClasses: {
      //     root: 'root',
      //     list: 'list',
      //     item: 'item',
      //     label: 'label',
      //     category: 'category',
      //     categoryLabel: 'categoryLabel',
      //     delete: 'delete',
      //     reset: 'reset',
      //   },
      // };

      client = algoliasearch('APP_ID', 'API_KEY');
      helper = algoliasearchHelper(client, 'index_name', {
        facets: ['facet', 'facetExclude', 'numericFacet', 'extraFacet'],
        disjunctiveFacets: ['disjunctiveFacet', 'numericDisjunctiveFacet'],
        hierarchicalFacets: [
          {
            name: 'hierarchicalFacet',
            attributes: ['hierarchicalFacet.lvl0', 'hierarchicalFacet.lvl1'],
            separator: ' > ',
          },
        ],
      });
      helper
        .toggleRefinement('facet', 'facet-val1')
        .toggleRefinement('facet', 'facet-val2')
        .toggleRefinement('extraFacet', 'extraFacet-val1')
        .toggleFacetExclusion('facetExclude', 'facetExclude-val1')
        .toggleFacetExclusion('facetExclude', 'facetExclude-val2')
        .toggleRefinement('disjunctiveFacet', 'disjunctiveFacet-val1')
        .toggleRefinement('disjunctiveFacet', 'disjunctiveFacet-val2')
        .toggleRefinement(
          'hierarchicalFacet',
          'hierarchicalFacet-val1 > hierarchicalFacet-val2'
        )
        .addNumericRefinement('numericFacet', '>=', 1)
        .addNumericRefinement('numericFacet', '<=', 2)
        .addNumericRefinement('numericDisjunctiveFacet', '>=', 3)
        .addNumericRefinement('numericDisjunctiveFacet', '<=', 4)
        .toggleTag('tag1')
        .toggleTag('tag2');

      const createURL = () => '#cleared';

      initParameters = {
        helper,
        createURL,
        instantSearchInstance: {
          templatesConfig: { randomAttributeNeverUsed: 'value' },
        },
      };

      renderParameters = {
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
                  // Here to confirm we're taking the right nested one
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
        templatesConfig: { randomAttributeNeverUsed: 'value' },
      };

      defaultRefinements = [
        {
          type: 'facet',
          attribute: 'facet',
          label: 'facet-val1',
          value: 'facet-val1',
          count: 1,
          exhaustive: true,
          refine: () => {},
        },
        {
          type: 'facet',
          attribute: 'facet',
          label: 'facet-val2',
          value: 'facet-val2',
          count: 2,
          exhaustive: true,
          refine: () => {},
        },
        {
          type: 'exclude',
          attribute: 'facetExclude',
          label: 'facetExclude-val1',
          value: 'facetExclude-val1',
          exclude: true,
          refine: () => {},
        },
        {
          type: 'exclude',
          attribute: 'facetExclude',
          label: 'facetExclude-val2',
          value: 'facetExclude-val2',
          exclude: true,
          refine: () => {},
        },
        {
          type: 'disjunctive',
          attribute: 'disjunctiveFacet',
          label: 'disjunctiveFacet-val1',
          value: 'disjunctiveFacet-val1',
          count: 3,
          exhaustive: true,
          refine: () => {},
        },
        {
          type: 'disjunctive',
          attribute: 'disjunctiveFacet',
          label: 'disjunctiveFacet-val2',
          value: 'disjunctiveFacet-val2',
          count: 4,
          exhaustive: true,
          refine: () => {},
        },
        {
          type: 'hierarchical',
          attribute: 'hierarchicalFacet',
          label: 'hierarchicalFacet-val2',
          value: 'hierarchicalFacet-val2',
          count: 6,
          exhaustive: true,
          refine: () => {},
        },
        {
          type: 'numeric',
          attribute: 'numericFacet',
          label: '1',
          value: '1',
          numericValue: 1,
          operator: '>=',
          refine: () => {},
        },
        {
          type: 'numeric',
          attribute: 'numericFacet',
          label: '2',
          value: '2',
          numericValue: 2,
          operator: '<=',
          refine: () => {},
        },
        {
          type: 'numeric',
          attribute: 'numericDisjunctiveFacet',
          label: '3',
          value: '3',
          numericValue: 3,
          operator: '>=',
          refine: () => {},
        },
        {
          type: 'numeric',
          attribute: 'numericDisjunctiveFacet',
          label: '4',
          value: '4',
          numericValue: 4,
          operator: '<=',
          refine: () => {},
        },
        {
          type: 'tag',
          attribute: '_tags',
          label: 'tag1',
          value: 'tag1',
          refine: () => {},
        },
        {
          type: 'tag',
          attribute: '_tags',
          label: 'tag2',
          value: 'tag2',
          refine: () => {},
        },
      ];

      // expectedProps = {
      //   attributes: {
      //     facet: { name: 'facet' },
      //     facetExclude: { name: 'facetExclude' },
      //     disjunctiveFacet: { name: 'disjunctiveFacet' },
      //     hierarchicalFacet: { name: 'hierarchicalFacet' },
      //     numericFacet: { name: 'numericFacet' },
      //     numericDisjunctiveFacet: { name: 'numericDisjunctiveFacet' },
      //     _tags: { name: '_tags' },
      //   },
      //   cssClasses: {
      //     root: 'root',
      //     list: 'list',
      //     item: 'item',
      //     label: 'label',
      //     category: 'category',
      //     categoryLabel: 'categoryLabel',
      //     delete: 'delete',
      //     reset: 'reset',
      //   },
      //   templateProps: prepareTemplateProps({
      //     defaultTemplates,
      //     templatesConfig: { randomAttributeNeverUsed: 'value' },
      //     templates: {
      //       item: 'ITEM',
      //     },
      //   }),
      // };
      // setRefinementsInExpectedProps();
    });

    it('should render twice <CurrentRefinements ... />', () => {
      const widget = currentRefinements({
        container: document.createElement('div'),
      });
      widget.init(initParameters);
      widget.render(renderParameters);
      widget.render(renderParameters);

      expect(ReactDOM.render).toHaveBeenCalledTimes(2);
      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      expect(ReactDOM.render.mock.calls[0][1]).toBe(parameters.container);
      expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
      expect(ReactDOM.render.mock.calls[1][1]).toBe(parameters.container);
    });

    describe('options.container', () => {
      it('should render with a string container', () => {
        const container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        const widget = currentRefinements({
          container: '#container',
        });

        widget.init(initParameters);
        widget.render(renderParameters);

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
        expect(ReactDOM.render.mock.calls[0][1]).toBe(container);
      });

      it('should render with a HTMLElement container', () => {
        const container = document.createElement('div');

        const widget = currentRefinements({
          container,
        });

        widget.init(initParameters);
        widget.render(renderParameters);

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
        expect(ReactDOM.render.mock.calls[0][1]).toBe(container);
      });
    });

    describe('options.includedAttributes', () => {
      it('should default to false', () => {
        const rawRefinements = [
          ...defaultRefinements,
          {
            type: 'facet',
            attribute: 'extraFacet',
            label: 'extraFacet-val1',
            value: 'extraFacet-val1',
            count: 42,
            exhaustive: true,
            refine: () => {},
          },
        ];

        const firstRefinements = rawRefinements.filter(
          refinement =>
            ['facet', 'facetExclude', 'disjunctiveFacet'].indexOf(
              refinement.attribute
            ) !== -1
        );
        const otherRefinements = rawRefinements.filter(
          refinement =>
            ['facet', 'facetExclude', 'disjunctiveFacet'].indexOf(
              refinement.attribute
            ) === -1
        );

        const widget = currentRefinements({
          container: document.createElement('div'),
          includedAttributes: ['facet', 'facetExclude', 'disjunctiveFacet'],
        });

        widget.init(initParameters);
        widget.render(renderParameters);

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render).toHaveBeenCalledWith(
          expect.objectContaining({
            refinements: [
              ...firstRefinements,
              ...rawRefinements,
              ...otherRefinements,
            ],
          })
        );
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('options.templates', () => {
      it('should pass it in templateProps', () => {
        const widget = currentRefinements({
          container: document.createElement('div'),
          templates: {
            item: 'item',
          },
        });

        widget.init(initParameters);
        widget.render(renderParameters);

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render).toHaveBeenCalledWith(
          expect.objectContaining({
            template: {
              item: 'item',
            },
          })
        );
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('options.transformItems', () => {
      it('should transform passed items', () => {
        const widget = currentRefinements({
          container: document.createElement('div'),
          transformItems: items =>
            items.map(item => ({ ...item, transformed: true })),
        });

        widget.init(initParameters);
        widget.render(renderParameters);

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
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

        widget.init(initParameters);
        widget.render(renderParameters);

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(
          ReactDOM.render.mock.calls[0][0].props.cssClasses.root
        ).toContain('customRoot');
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });

      it('should work with an array', () => {
        const widget = currentRefinements({
          container: document.createElement('div'),
          cssClasses: {
            root: ['customRoot1', 'customRoot2'],
          },
        });

        widget.init(initParameters);
        widget.render(renderParameters);

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(
          ReactDOM.render.mock.calls[0][0].props.cssClasses.root
        ).toContain('customRoot1');
        expect(
          ReactDOM.render.mock.calls[0][0].props.cssClasses.root
        ).toContain('customRoot2');
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('with included attributes', () => {
      it('should sort the refinements according to their order', () => {
        const rawRefinements = [
          {
            type: 'facet',
            attribute: 'extraFacet',
            label: 'extraFacet-val1',
            value: 'extraFacet-val1',
            count: 42,
            exhaustive: true,
            refine: () => {},
          },
          ...defaultRefinements,
        ];

        const firstRefinements = rawRefinements.filter(
          refinement => refinement.attribute === 'disjunctiveFacet'
        );
        const secondRefinements = rawRefinements.filter(
          refinement => refinement.attribute === 'facetExclude'
        );
        const otherRefinements = rawRefinements.filter(
          refinement =>
            !['disjunctiveFacet', 'facetExclude'].includes(refinement.attribute)
        );

        const widget = currentRefinements({
          container: document.createElement('div'),
          includedAttributes: ['disjunctiveFacet', 'facetExclude'],
        });

        widget.init(initParameters);
        widget.render(renderParameters);

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0].props.refinements).toEqual([
          ...firstRefinements,
          ...secondRefinements,
          ...otherRefinements,
        ]);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('with excludedAttributes', () => {
      it('should ignore excluded attributes', () => {
        const widget = currentRefinements({
          container: document.createElement('div'),
          includedAttributes: ['disjunctiveFacet', 'facetExclude'],
          excludedAttributes: ['facetExclude'],
        });

        widget.init(initParameters);
        widget.render(renderParameters);

        expect(ReactDOM.render.mock.calls[0][0].props.refinements).toEqual([
          {
            attribute: 'disjunctiveFacet',
          },
        ]);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    afterEach(() => {
      currentRefinements.__ResetDependency__('render');
    });
  });
});
