import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import { prepareTemplateProps } from '../../../lib/utils';
import currentRefinedValues from '../current-refined-values';
import defaultTemplates from '../defaultTemplates';

describe('currentRefinedValues()', () => {
  describe('types checking', () => {
    let boundWidget;
    let parameters;

    beforeEach(() => {
      parameters = {
        container: document.createElement('div'),
        templates: {},
        cssClasses: {},
      };
      boundWidget = currentRefinedValues.bind(null, parameters);
    });

    describe('options.container', () => {
      it("doesn't throw usage with a string", () => {
        const element = document.createElement('div');
        element.id = 'testid2';
        document.body.appendChild(element);
        parameters.container = '#testid2';
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with a HTMLElement", () => {
        parameters.container = document.createElement('div');
        expect(boundWidget).not.toThrow();
      });
    });

    describe('options.includedAttributes', () => {
      it("doesn't throw usage if not defined", () => {
        delete parameters.includedAttributes;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage if includedAttributes is an empty array", () => {
        parameters.includedAttributes = [];
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with name, label and template", () => {
        parameters.includedAttributes = [
          {
            name: 'attr1',
          },
          {
            name: 'attr2',
            label: 'Attr 2',
          },
          {
            name: 'attr3',
            template: 'SPECIFIC TEMPLATE',
          },
          {
            name: 'attr4',
          },
        ];
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with a function template", () => {
        parameters.includedAttributes = [
          { name: 'attr1' },
          { name: 'attr2', template: () => 'CUSTOM TEMPLATE' },
        ];
        expect(boundWidget).not.toThrow();
      });

      it("throws usage if attributes isn't an array", () => {
        parameters.includedAttributes = 'a string';
        expect(boundWidget).toThrow(/Usage/);
      });

      it('throws usage if attributes contains an object without name', () => {
        parameters.includedAttributes = [{ name: 'test' }, { label: '' }];
        expect(boundWidget).toThrow(/Usage/);
      });
    });

    describe('options.templates', () => {
      it("doesn't throw usage if not defined", () => {
        delete parameters.templates;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with an empty object", () => {
        parameters.templates = {};
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with a string template", () => {
        parameters.templates = {
          item: 'STRING TEMPLATE',
        };
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with a function template", () => {
        parameters.templates = {
          item: () => 'ITEM TEMPLATE',
        };
        expect(boundWidget).not.toThrow();
      });
    });

    describe('options.cssClasses', () => {
      it("doesn't throw usage if not defined", () => {
        delete parameters.cssClasses;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with an empty object", () => {
        parameters.cssClasses = {};
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with string class", () => {
        parameters.cssClasses = {
          item: 'item-class',
        };
        expect(boundWidget).not.toThrow();
      });
    });
  });

  describe('getConfiguration()', () => {
    it('configures nothing', () => {
      const widget = currentRefinedValues({
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
    let refinements;
    let expectedProps;

    function setRefinementsInExpectedProps() {
      expectedProps.refinements = refinements;
      expectedProps.clearRefinementClicks = refinements.map(() => () => {});
      expectedProps.clearRefinementURLs = refinements.map(() => '#cleared');
    }

    beforeEach(() => {
      ReactDOM = { render: jest.fn() };
      currentRefinedValues.__Rewire__('render', ReactDOM.render);

      parameters = {
        container: document.createElement('div'),
        includedAttributes: [
          { name: 'facet' },
          { name: 'facetExclude' },
          { name: 'disjunctiveFacet' },
          { name: 'hierarchicalFacet' },
          { name: 'numericFacet' },
          { name: 'numericDisjunctiveFacet' },
          { name: '_tags' },
        ],
        templates: {
          item: 'ITEM',
        },
        cssClasses: {
          root: 'root',
          list: 'list',
          item: 'item',
          label: 'label',
          category: 'category',
          categoryLabel: 'categoryLabel',
          delete: 'delete',
          reset: 'reset',
        },
      };

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
        createURL,
      };

      refinements = [
        {
          type: 'facet',
          attributeName: 'facet',
          name: 'facet-val1',
          count: 1,
          exhaustive: true,
        },
        {
          type: 'facet',
          attributeName: 'facet',
          name: 'facet-val2',
          count: 2,
          exhaustive: true,
        },
        {
          type: 'exclude',
          attributeName: 'facetExclude',
          name: 'facetExclude-val1',
          exclude: true,
        },
        {
          type: 'exclude',
          attributeName: 'facetExclude',
          name: 'facetExclude-val2',
          exclude: true,
        },
        {
          type: 'disjunctive',
          attributeName: 'disjunctiveFacet',
          name: 'disjunctiveFacet-val1',
          count: 3,
          exhaustive: true,
        },
        {
          type: 'disjunctive',
          attributeName: 'disjunctiveFacet',
          name: 'disjunctiveFacet-val2',
          count: 4,
          exhaustive: true,
        },
        {
          type: 'hierarchical',
          attributeName: 'hierarchicalFacet',
          name: 'hierarchicalFacet-val2',
          count: 6,
          exhaustive: true,
        },
        {
          type: 'numeric',
          attributeName: 'numericFacet',
          name: '1',
          numericValue: 1,
          operator: '>=',
        },
        {
          type: 'numeric',
          attributeName: 'numericFacet',
          name: '2',
          numericValue: 2,
          operator: '<=',
        },
        {
          type: 'numeric',
          attributeName: 'numericDisjunctiveFacet',
          name: '3',
          numericValue: 3,
          operator: '>=',
        },
        {
          type: 'numeric',
          attributeName: 'numericDisjunctiveFacet',
          name: '4',
          numericValue: 4,
          operator: '<=',
        },
        { type: 'tag', attributeName: '_tags', name: 'tag1' },
        { type: 'tag', attributeName: '_tags', name: 'tag2' },
      ];

      expectedProps = {
        attributes: {
          facet: { name: 'facet' },
          facetExclude: { name: 'facetExclude' },
          disjunctiveFacet: { name: 'disjunctiveFacet' },
          hierarchicalFacet: { name: 'hierarchicalFacet' },
          numericFacet: { name: 'numericFacet' },
          numericDisjunctiveFacet: { name: 'numericDisjunctiveFacet' },
          _tags: { name: '_tags' },
        },
        cssClasses: {
          root: 'root',
          list: 'list',
          item: 'item',
          label: 'label',
          category: 'category',
          categoryLabel: 'categoryLabel',
          delete: 'delete',
          reset: 'reset',
        },
        templateProps: prepareTemplateProps({
          defaultTemplates,
          templatesConfig: { randomAttributeNeverUsed: 'value' },
          templates: {
            item: 'ITEM',
          },
        }),
      };
      setRefinementsInExpectedProps();
    });

    it('should render twice <CurrentRefinedValues ... />', () => {
      const widget = currentRefinedValues(parameters);
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
        const element = document.createElement('div');
        element.id = 'testid';
        document.body.appendChild(element);

        parameters.container = '#testid';

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);
        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
        expect(ReactDOM.render.mock.calls[0][1]).toBe(element);
      });

      it('should render with a HTMLElement container', () => {
        const element = document.createElement('div');

        parameters.container = element;

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);
        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
        expect(ReactDOM.render.mock.calls[0][1]).toBe(element);
      });
    });

    describe('options.includedAttributes', () => {
      it('should default to false', () => {
        parameters.includedAttributes = [
          {
            name: 'facet',
          },
          {
            name: 'facetExclude',
            label: 'Facet exclude',
          },
          {
            name: 'disjunctiveFacet',
          },
        ];

        refinements.splice(0, 0, {
          type: 'facet',
          attributeName: 'extraFacet',
          name: 'extraFacet-val1',
          count: 42,
          exhaustive: true,
        });
        const firstRefinements = refinements.filter(
          refinement =>
            ['facet', 'facetExclude', 'disjunctiveFacet'].indexOf(
              refinement.attributeName
            ) !== -1
        );
        const otherRefinements = refinements.filter(
          refinement =>
            ['facet', 'facetExclude', 'disjunctiveFacet'].indexOf(
              refinement.attributeName
            ) === -1
        );
        refinements = [].concat(firstRefinements).concat(otherRefinements);

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        setRefinementsInExpectedProps();
        expectedProps.includedAttributes = {
          facet: {
            name: 'facet',
          },
          facetExclude: {
            name: 'facetExclude',
            label: 'Facet exclude',
          },
          disjunctiveFacet: {
            name: 'disjunctiveFacet',
          },
        };

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('options.templates', () => {
      it('should pass it in templateProps', () => {
        parameters.templates.item = 'MY CUSTOM TEMPLATE';

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        expectedProps.templateProps.templates.item = 'MY CUSTOM TEMPLATE';

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('options.transformItems', () => {
      it('should transform passed items', () => {
        const widget = currentRefinedValues({
          ...parameters,
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
        parameters.cssClasses.root = 'custom-root';

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        expectedProps.cssClasses.root =
          'ais-current-refined-values--root custom-root';

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });

      it('should work with an array', () => {
        parameters.cssClasses.root = ['custom-root', 'custom-root-2'];

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        expectedProps.cssClasses.root =
          'ais-current-refined-values--root custom-root custom-root-2';

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('with included attributes', () => {
      it('should sort the refinements according to their order', () => {
        parameters.includedAttributes = [
          { name: 'disjunctiveFacet' },
          { name: 'facetExclude' },
        ];

        refinements.splice(0, 0, {
          type: 'facet',
          attributeName: 'extraFacet',
          name: 'extraFacet-val1',
          count: 42,
          exhaustive: true,
        });
        const firstRefinements = refinements.filter(
          refinement => refinement.attributeName === 'disjunctiveFacet'
        );
        const secondRefinements = refinements.filter(
          refinement => refinement.attributeName === 'facetExclude'
        );
        const otherRefinements = refinements.filter(
          refinement =>
            !['disjunctiveFacet', 'facetExclude'].includes(
              refinement.attributeName
            )
        );

        refinements = []
          .concat(firstRefinements)
          .concat(secondRefinements)
          .concat(otherRefinements);

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        setRefinementsInExpectedProps();
        expectedProps.includedAttributes = {
          disjunctiveFacet: { name: 'disjunctiveFacet' },
          facetExclude: { name: 'facetExclude' },
        };

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('with excludedAttributes', () => {
      it('should ignore excluded attributes', () => {
        parameters.includedAttributes = [
          { name: 'disjunctiveFacet' },
          { name: 'facetExclude' },
        ];
        parameters.excludedAttributes = ['facetExclude'];

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        setRefinementsInExpectedProps();
        expectedProps.attributes = {
          disjunctiveFacet: { name: 'disjunctiveFacet' },
        };

        expect(ReactDOM.render.mock.calls[0][0].props.attributes).toEqual({
          disjunctiveFacet: { name: 'disjunctiveFacet' },
        });

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0].props.attributes).toEqual({
          disjunctiveFacet: { name: 'disjunctiveFacet' },
        });
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    afterEach(() => {
      currentRefinedValues.__ResetDependency__('render');
    });
  });
});
