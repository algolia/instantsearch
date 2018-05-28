import sinon from 'sinon';
import map from 'lodash/map';
import filter from 'lodash/filter';
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
        attributes: [],
        onlyListedAttributes: false,
        clearAll: 'after',
        templates: {},
        transformData: {
          item: data => data,
        },
        autoHideContainer: false,
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

      it('throws usage if not defined', () => {
        delete parameters.container;
        expect(boundWidget).toThrow(/Usage/);
      });

      it('throws usage with another type than string or HTMLElement', () => {
        parameters.container = true;
        expect(boundWidget).toThrow(/Usage/);
      });
    });

    describe('options.attributes', () => {
      it("doesn't throw usage if not defined", () => {
        delete parameters.attributes;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage if attributes is an empty array", () => {
        parameters.attributes = [];
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with name, label, template and transformData", () => {
        parameters.attributes = [
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
            transformData: data => {
              data.name = 'newname';
              return data;
            },
          },
        ];
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with a function template", () => {
        parameters.attributes = [
          { name: 'attr1' },
          { name: 'attr2', template: () => 'CUSTOM TEMPLATE' },
        ];
        expect(boundWidget).not.toThrow();
      });

      it("throws usage if attributes isn't an array", () => {
        parameters.attributes = 'a string';
        expect(boundWidget).toThrow(/Usage/);
      });

      it("throws usage if attributes doesn't contain only objects", () => {
        parameters.attributes = [{ name: 'test' }, 'string'];
        expect(boundWidget).toThrow(/Usage/);
      });

      it('throws usage if attributes contains an object without name', () => {
        parameters.attributes = [{ name: 'test' }, { label: '' }];
        expect(boundWidget).toThrow(/Usage/);
      });

      it('throws usage if attributes contains an object with a not string name', () => {
        parameters.attributes = [{ name: 'test' }, { name: true }];
        expect(boundWidget).toThrow(/Usage/);
      });

      it('throws usage if attributes contains an object with a not string label', () => {
        parameters.attributes = [{ name: 'test' }, { label: true }];
        expect(boundWidget).toThrow(/Usage/);
      });

      it('throws usage if attributes contains an object with a not string or function template', () => {
        parameters.attributes = [{ name: 'test' }, { template: true }];
        expect(boundWidget).toThrow(/Usage/);
      });

      it('throws usage if attributes contains an object with a not function transformData', () => {
        parameters.attributes = [{ name: 'test' }, { transformData: true }];
        expect(boundWidget).toThrow(/Usage/);
      });
    });

    describe('options.onlyListedAttributes', () => {
      it("doesn't throw usage if not defined", () => {
        delete parameters.onlyListedAttributes;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage if true", () => {
        parameters.onlyListedAttributes = true;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage if false", () => {
        parameters.onlyListedAttributes = false;
        expect(boundWidget).not.toThrow();
      });

      it('throws usage if not boolean', () => {
        parameters.onlyListedAttributes = 'truthy value';
        expect(boundWidget).toThrow(/Usage/);
      });
    });

    describe('options.clearAll', () => {
      it("doesn't throw usage if not defined", () => {
        delete parameters.clearAll;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage if false", () => {
        parameters.clearAll = false;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage if 'before'", () => {
        parameters.clearAll = 'before';
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage if 'after'", () => {
        parameters.clearAll = 'after';
        expect(boundWidget).not.toThrow();
      });

      it("throws usage if not one of [false, 'before', 'after']", () => {
        parameters.clearAll = 'truthy value';
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

      it("doesn't throw usage with all keys", () => {
        parameters.templates = {
          header: 'HEADER TEMPLATE',
          item: 'ITEM TEMPLATE',
          clearAll: 'CLEAR ALL TEMPLATE',
          footer: 'FOOTER TEMPLATE',
        };
        expect(boundWidget).not.toThrow();
      });

      it('throws usage with template being something else than an object', () => {
        parameters.templates = true;
        expect(boundWidget).toThrow(/Usage/);
      });

      it("throws usage if one of the template keys doesn't exist", () => {
        parameters.templates = {
          header: 'HEADER TEMPLATE',
          notExistingKey: 'NOT EXISTING KEY TEMPLATE',
        };
        expect(boundWidget).toThrow(/Usage/);
      });

      it('throws usage if a template is not a string or a function', () => {
        parameters.templates = {
          item: true,
        };
        expect(boundWidget).toThrow(/Usage/);
      });
    });

    describe('options.transformData', () => {
      it("doesn't throw usage if not defined", () => {
        delete parameters.transformData;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with a function", () => {
        parameters.transformData = data => data;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with an object of functions", () => {
        parameters.transformData = {
          item: data => data,
        };
        expect(boundWidget).not.toThrow();
      });

      it('throws usage if not a function', () => {
        parameters.transformData = true;
        expect(boundWidget).toThrow();
      });
    });

    describe('options.autoHideContainer', () => {
      it("doesn't throw usage if not defined", () => {
        delete parameters.autoHideContainer;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with true", () => {
        parameters.autoHideContainer = true;
        expect(boundWidget).not.toThrow();
      });

      it("doesn't throw usage with false", () => {
        parameters.autoHideContainer = false;
        expect(boundWidget).not.toThrow();
      });

      it('throws usage if not boolean', () => {
        parameters.autoHideContainer = 'truthy value';
        expect(boundWidget).toThrow(/Usage/);
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

      it("doesn't throw usage with all keys", () => {
        parameters.cssClasses = {
          root: 'root-class',
          header: 'header-class',
          body: 'body-class',
          clearAll: 'clear-all-class',
          list: 'list-class',
          item: 'item-class',
          link: 'link-class',
          count: 'count-class',
          footer: 'footer-class',
        };
        expect(boundWidget).not.toThrow();
      });

      it('throws usage with cssClasses being something else than an object', () => {
        parameters.cssClasses = 'truthy value';
        expect(boundWidget).toThrow(/Usage/);
      });

      it("throws usage if one of the cssClasses keys doesn't exist", () => {
        parameters.cssClasses = {
          notExistingKey: 'not-existing-class',
        };
        expect(boundWidget).toThrow(/Usage/);
      });

      it('throws usage if one of the cssClasses values is not a string', () => {
        parameters.cssClasses = {
          item: true,
        };
        expect(boundWidget).toThrow(/Usage/);
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
      expectedProps.clearRefinementClicks = map(refinements, () => () => {});
      expectedProps.clearRefinementURLs = map(refinements, () => '#cleared');
    }

    beforeEach(() => {
      ReactDOM = { render: sinon.spy() };
      currentRefinedValues.__Rewire__('render', ReactDOM.render);

      parameters = {
        container: document.createElement('div'),
        attributes: [
          { name: 'facet' },
          { name: 'facetExclude' },
          { name: 'disjunctiveFacet' },
          { name: 'hierarchicalFacet' },
          { name: 'numericFacet' },
          { name: 'numericDisjunctiveFacet' },
          { name: '_tags' },
        ],
        onlyListedAttributes: true,
        clearAll: 'after',
        templates: {
          header: 'HEADER',
          item: 'ITEM',
          clearAll: 'CLEAR ALL',
          footer: 'FOOTER',
        },
        autoHideContainer: false,
        cssClasses: {
          root: 'root-css-class',
          header: 'header-css-class',
          body: 'body-css-class',
          clearAll: 'clear-all-css-class',
          list: 'list-css-class',
          item: 'item-css-class',
          link: 'link-css-class',
          count: 'count-css-class',
          footer: 'footer-css-class',
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
        // eslint-disable-next-line max-len
        {
          type: 'disjunctive',
          attributeName: 'disjunctiveFacet',
          name: 'disjunctiveFacet-val1',
          count: 3,
          exhaustive: true,
        },
        // eslint-disable-next-line max-len
        {
          type: 'disjunctive',
          attributeName: 'disjunctiveFacet',
          name: 'disjunctiveFacet-val2',
          count: 4,
          exhaustive: true,
        },
        // eslint-disable-next-line max-len
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
        clearAllClick: () => {},
        collapsible: false,
        clearAllPosition: 'after',
        clearAllURL: '#cleared',
        cssClasses: {
          root: 'ais-current-refined-values root-css-class',
          header: 'ais-current-refined-values--header header-css-class',
          body: 'ais-current-refined-values--body body-css-class',
          clearAll: 'ais-current-refined-values--clear-all clear-all-css-class',
          list: 'ais-current-refined-values--list list-css-class',
          item: 'ais-current-refined-values--item item-css-class',
          link: 'ais-current-refined-values--link link-css-class',
          count: 'ais-current-refined-values--count count-css-class',
          footer: 'ais-current-refined-values--footer footer-css-class',
        },
        shouldAutoHideContainer: false,
        templateProps: prepareTemplateProps({
          defaultTemplates,
          templatesConfig: { randomAttributeNeverUsed: 'value' },
          templates: {
            header: 'HEADER',
            item: 'ITEM',
            clearAll: 'CLEAR ALL',
            footer: 'FOOTER',
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

      expect(ReactDOM.render.callCount).toBe(2);
      expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
      expect(ReactDOM.render.firstCall.args[1]).toBe(parameters.container);
      expect(ReactDOM.render.secondCall.args[0]).toMatchSnapshot();
      expect(ReactDOM.render.secondCall.args[1]).toBe(parameters.container);
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
        expect(ReactDOM.render.calledOnce).toBe(true);
        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        expect(ReactDOM.render.firstCall.args[1]).toBe(element);
      });

      it('should render with a HTMLElement container', () => {
        const element = document.createElement('div');

        parameters.container = element;

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);
        expect(ReactDOM.render.calledOnce).toBe(true);
        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        expect(ReactDOM.render.firstCall.args[1]).toBe(element);
      });
    });

    describe('options.attributes', () => {
      describe('with options.onlyListedAttributes === true', () => {
        beforeEach(() => {
          parameters.onlyListedAttributes = true;
        });

        it('should render all attributes with not defined attributes', () => {
          delete parameters.attributes;

          refinements.splice(0, 0, {
            type: 'facet',
            attributeName: 'extraFacet',
            name: 'extraFacet-val1',
            count: 42,
            exhaustive: true,
          });

          const widget = currentRefinedValues(parameters);
          widget.init(initParameters);
          widget.render(renderParameters);

          setRefinementsInExpectedProps();
          expectedProps.attributes = {};

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });

        it('should render all attributes with an empty array', () => {
          parameters.attributes = [];

          refinements.splice(0, 0, {
            type: 'facet',
            attributeName: 'extraFacet',
            name: 'extraFacet-val1',
            count: 42,
            exhaustive: true,
          });

          const widget = currentRefinedValues(parameters);
          widget.init(initParameters);
          widget.render(renderParameters);

          setRefinementsInExpectedProps();
          expectedProps.attributes = {};

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });

        it('should render and pass all attributes defined in each objects', () => {
          parameters.attributes = [
            {
              name: 'facet',
            },
            {
              name: 'facetExclude',
              label: 'Facet exclude',
            },
            {
              name: 'disjunctiveFacet',
              transformData: data => {
                data.name = 'newname';
                return data;
              },
            },
          ];

          refinements = filter(
            refinements,
            refinement =>
              ['facet', 'facetExclude', 'disjunctiveFacet'].indexOf(
                refinement.attributeName
              ) !== -1
          );

          const widget = currentRefinedValues(parameters);
          widget.init(initParameters);
          widget.render(renderParameters);

          setRefinementsInExpectedProps();
          expectedProps.attributes = {
            facet: {
              name: 'facet',
            },
            facetExclude: {
              name: 'facetExclude',
              label: 'Facet exclude',
            },
            disjunctiveFacet: {
              name: 'disjunctiveFacet',
              transformData: data => {
                data.name = 'newname';
                return data;
              },
            },
          };

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });
      });

      describe('with options.onlyListedAttributes === false', () => {
        beforeEach(() => {
          parameters.onlyListedAttributes = false;
        });

        it('should render all attributes with not defined attributes', () => {
          delete parameters.attributes;

          refinements.splice(0, 0, {
            type: 'facet',
            attributeName: 'extraFacet',
            name: 'extraFacet-val1',
            count: 42,
            exhaustive: true,
          });

          const widget = currentRefinedValues(parameters);
          widget.init(initParameters);
          widget.render(renderParameters);

          setRefinementsInExpectedProps();
          expectedProps.attributes = {};

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });

        it('should render all attributes with an empty array', () => {
          parameters.attributes = [];

          refinements.splice(0, 0, {
            type: 'facet',
            attributeName: 'extraFacet',
            name: 'extraFacet-val1',
            count: 42,
            exhaustive: true,
          });

          const widget = currentRefinedValues(parameters);
          widget.init(initParameters);
          widget.render(renderParameters);

          setRefinementsInExpectedProps();
          expectedProps.attributes = {};

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });

        it('should render and pass all attributes defined in each objects', () => {
          parameters.attributes = [
            {
              name: 'facet',
            },
            {
              name: 'facetExclude',
              label: 'Facet exclude',
            },
            {
              name: 'disjunctiveFacet',
              transformData: data => {
                data.name = 'newname';
                return data;
              },
            },
          ];

          refinements.splice(0, 0, {
            type: 'facet',
            attributeName: 'extraFacet',
            name: 'extraFacet-val1',
            count: 42,
            exhaustive: true,
          });
          const firstRefinements = filter(
            refinements,
            refinement =>
              ['facet', 'facetExclude', 'disjunctiveFacet'].indexOf(
                refinement.attributeName
              ) !== -1
          );
          const otherRefinements = filter(
            refinements,
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
          expectedProps.attributes = {
            facet: {
              name: 'facet',
            },
            facetExclude: {
              name: 'facetExclude',
              label: 'Facet exclude',
            },
            disjunctiveFacet: {
              name: 'disjunctiveFacet',
              transformData: data => {
                data.name = 'newname';
                return data;
              },
            },
          };

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });
      });

      describe('with options.onlyListedAttributes not defined', () => {
        beforeEach(() => {
          delete parameters.onlyListedAttributes;
        });

        it('should default to false', () => {
          parameters.attributes = [
            {
              name: 'facet',
            },
            {
              name: 'facetExclude',
              label: 'Facet exclude',
            },
            {
              name: 'disjunctiveFacet',
              transformData: data => {
                data.name = 'newname';
                return data;
              },
            },
          ];

          refinements.splice(0, 0, {
            type: 'facet',
            attributeName: 'extraFacet',
            name: 'extraFacet-val1',
            count: 42,
            exhaustive: true,
          });
          const firstRefinements = filter(
            refinements,
            refinement =>
              ['facet', 'facetExclude', 'disjunctiveFacet'].indexOf(
                refinement.attributeName
              ) !== -1
          );
          const otherRefinements = filter(
            refinements,
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
          expectedProps.attributes = {
            facet: {
              name: 'facet',
            },
            facetExclude: {
              name: 'facetExclude',
              label: 'Facet exclude',
            },
            disjunctiveFacet: {
              name: 'disjunctiveFacet',
              transformData: data => {
                data.name = 'newname';
                return data;
              },
            },
          };

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });
      });
    });

    describe('options.clearAll', () => {
      it('should pass it as clearAllPosition', () => {
        parameters.clearAll = 'before';

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        expectedProps.clearAllPosition = 'before';

        expect(ReactDOM.render.calledOnce).toBe(true);
        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
      });
    });

    describe('options.templates', () => {
      it('should pass it in templateProps', () => {
        parameters.templates.item = 'MY CUSTOM TEMPLATE';

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        expectedProps.templateProps.templates.item = 'MY CUSTOM TEMPLATE';

        expect(ReactDOM.render.calledOnce).toBe(true);
        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
      });
    });

    describe('options.autoHideContainer', () => {
      describe('without refinements', () => {
        beforeEach(() => {
          helper.clearRefinements().clearTags();
          renderParameters.state = helper.state;

          expectedProps.refinements = [];
          expectedProps.clearRefinementClicks = [];
          expectedProps.clearRefinementURLs = [];
          expectedProps.shouldAutoHideContainer = true;
        });

        it('shouldAutoHideContainer should be true with autoHideContainer = true', () => {
          parameters.autoHideContainer = true;

          const widget = currentRefinedValues(parameters);
          widget.init(initParameters);
          widget.render(renderParameters);

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });

        it('shouldAutoHideContainer should be false with autoHideContainer = false', () => {
          parameters.autoHideContainer = false;

          const widget = currentRefinedValues(parameters);
          widget.init(initParameters); // eslint-disable-next-line max-len

          widget.render(renderParameters);

          expectedProps.shouldAutoHideContainer = false;

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });
      });

      describe('with refinements', () => {
        it('shouldAutoHideContainer should be false with autoHideContainer = true', () => {
          parameters.autoHideContainer = true;

          const widget = currentRefinedValues(parameters);
          widget.init(initParameters);
          widget.render(renderParameters);

          expectedProps.shouldAutoHideContainer = false;

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });

        it('shouldAutoHideContainer should be false with autoHideContainer = false', () => {
          parameters.autoHideContainer = false;

          const widget = currentRefinedValues(parameters);
          widget.init(initParameters);
          widget.render(renderParameters);

          expectedProps.shouldAutoHideContainer = false;

          expect(ReactDOM.render.calledOnce).toBe(true);
          expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
        });
      });
    });

    describe('options.cssClasses', () => {
      it('should be passed in the cssClasses', () => {
        parameters.cssClasses.body = 'custom-passed-body';

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        expectedProps.cssClasses.body =
          'ais-current-refined-values--body custom-passed-body';

        expect(ReactDOM.render.calledOnce).toBe(true);
        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
      });

      it('should work with an array', () => {
        parameters.cssClasses.body = ['custom-body', 'custom-body-2'];

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        expectedProps.cssClasses.body =
          'ais-current-refined-values--body custom-body custom-body-2';

        expect(ReactDOM.render.calledOnce).toBe(true);
        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
      });
    });

    describe('with attributes', () => {
      it('should sort the refinements according to their order', () => {
        parameters.attributes = [
          { name: 'disjunctiveFacet' },
          { name: 'facetExclude' },
        ];
        parameters.onlyListedAttributes = false;

        refinements.splice(0, 0, {
          type: 'facet',
          attributeName: 'extraFacet',
          name: 'extraFacet-val1',
          count: 42,
          exhaustive: true,
        });
        const firstRefinements = filter(refinements, {
          attributeName: 'disjunctiveFacet',
        });
        const secondRefinements = filter(refinements, {
          attributeName: 'facetExclude',
        });
        const otherRefinements = filter(
          refinements,
          refinement =>
            ['disjunctiveFacet', 'facetExclude'].indexOf(
              refinement.attributeName
            ) === -1
        );
        refinements = []
          .concat(firstRefinements)
          .concat(secondRefinements)
          .concat(otherRefinements);

        const widget = currentRefinedValues(parameters);
        widget.init(initParameters);
        widget.render(renderParameters);

        setRefinementsInExpectedProps();
        expectedProps.attributes = {
          disjunctiveFacet: { name: 'disjunctiveFacet' },
          facetExclude: { name: 'facetExclude' },
        };

        expect(ReactDOM.render.calledOnce).toBe(true);
        expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
      });
    });

    afterEach(() => {
      currentRefinedValues.__ResetDependency__('render');
    });
  });
});
