/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'jsdom-global';
import {createRenderer} from 'react-addons-test-utils';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import refinementList from '../refinement-list.js';
import Template from '../../../components/Template.js';
import createHelpers from '../../../lib/createHelpers.js';
import defaultTemplates from '../defaultTemplates.js';

describe('refinementList()', () => {
  let autoHideContainer;
  let container;
  let headerFooter;
  let options;
  let widget;
  let ReactDOM;
  let renderer = createRenderer();
  const helpers = createHelpers('en-US');

  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  beforeEach(() => {
    container = document.createElement('div');

    ReactDOM = {render: sinon.spy()};
    refinementList.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = sinon.stub().returnsArg(0);
    refinementList.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = sinon.stub().returnsArg(0);
    refinementList.__Rewire__('headerFooterHOC', headerFooter);
  });

  context('instanciated with wrong parameters', () => {
    it('should fail if no attributeName', () => {
      // Given
      options = {container, attributeName: undefined};

      // Then
      expect(() => {
        // When
        refinementList(options);
      }).toThrow(/^Usage:/);
    });
    it('should fail if no container', () => {
      // Given
      options = {container: undefined, attributeName: 'foo'};

      // Then
      expect(() => {
        // When
        refinementList(options);
      }).toThrow(/^Usage:/);
    });
  });

  context('autoHideContainer', () => {
    beforeEach(() => {
      options = {container, attributeName: 'attributeName'};
    });
    it('should be called if autoHideContainer set to true', () => {
      // Given
      options.autoHideContainer = true;

      // When
      refinementList(options);

      // Then
      expect(autoHideContainer.called).toBe(true);
    });
    it('should not be called if autoHideContainer set to false', () => {
      // Given
      options.autoHideContainer = false;

      // When
      refinementList(options);

      // Then
      expect(autoHideContainer.called).toBe(false);
    });
  });

  context('operator', () => {
    beforeEach(() => {
      options = {container, attributeName: 'attributeName'};
    });
    it('should accept [and, or, AND, OR]', () => {
      expect(() => {
        refinementList({...options, operator: 'or'});
      }).toNotThrow();

      expect(() => {
        refinementList({...options, operator: 'OR'});
      }).toNotThrow();

      expect(() => {
        refinementList({...options, operator: 'and'});
      }).toNotThrow();

      expect(() => {
        refinementList({...options, operator: 'AND'});
      }).toNotThrow();
    });
    it('should throw an error on any other value', () => {
      expect(() => {
        refinementList({...options, operator: 'foo'});
      }).toThrow(/^Usage:/);
    });
  });

  context('getConfiguration', () => {
    let configuration;
    beforeEach(() => {
      options = {container, attributeName: 'attributeName'};
    });
    it('should add a facet for AND operator', () => {
      // Given
      options.operator = 'AND';
      widget = refinementList(options);
      configuration = {};

      // When
      let actual = widget.getConfiguration(configuration);

      // Then
      expect(actual.facets).toInclude('attributeName');
    });
    it('should add disjunctiveFacet for OR operator', () => {
      // Given
      options.operator = 'OR';
      widget = refinementList(options);
      configuration = {};

      // When
      let actual = widget.getConfiguration(configuration);

      // Then
      expect(actual.disjunctiveFacets).toInclude('attributeName');
    });
    it('should set the maxValuePerFacet to the specified limit if higher', () => {
      // Given
      options.limit = 1000;
      widget = refinementList(options);
      configuration = {maxValuesPerFacet: 100};

      // When
      let actual = widget.getConfiguration(configuration);

      // Then
      expect(actual.maxValuesPerFacet).toBe(1000);
    });
    it('should keep the maxValuePerFacet if higher than the one specified', () => {
      // Given
      options.limit = 100;
      widget = refinementList(options);
      configuration = {maxValuesPerFacet: 1000};

      // When
      let actual = widget.getConfiguration(configuration);

      // Then
      expect(actual.maxValuesPerFacet).toBe(1000);
    });
  });

  context('render', () => {
    let results;
    let helper;
    let state;
    let templatesConfig;
    let createURL;

    function renderWidget(userOptions) {
      widget = refinementList({...options, ...userOptions});
      widget.init({helper, createURL});
      return widget.render({results, helper, templatesConfig, state});
    }

    beforeEach(() => {
      options = {container, attributeName: 'attributeName'};
      results = {getFacetValues: sinon.stub().returns([{name: 'foo'}, {name: 'bar'}])};
      state = {toggleRefinement: sinon.spy()};
      createURL = () => '#';
    });

    it('formats counts', () => {
      const props = {
        templatesConfig: {helpers},
        templates: defaultTemplates
      };
      renderer.render(<Template data={{count: 1000}} {...props} templateKey="item" />);
      let out = renderer.getRenderOutput();
      expect(out).toEqualJSX(<div dangerouslySetInnerHTML={{__html: '<label class="">\n <input type="checkbox" class="" value="" />\n <span class="">1,000</span>\n</label>'}} />);
    });

    context('cssClasses', () => {
      it('should call the component with the correct classes', () => {
        // Given
        let cssClasses = {
          root: ['root', 'cx'],
          header: 'header',
          body: 'body',
          footer: 'footer',
          list: 'list',
          item: 'item',
          active: 'active',
          label: 'label',
          checkbox: 'checkbox',
          count: 'count'
        };

        // When
        renderWidget({cssClasses});
        let actual = ReactDOM.render.firstCall.args[0].props.cssClasses;

        // Then
        expect(actual.root).toBe('ais-refinement-list root cx');
        expect(actual.header).toBe('ais-refinement-list--header header');
        expect(actual.body).toBe('ais-refinement-list--body body');
        expect(actual.footer).toBe('ais-refinement-list--footer footer');
        expect(actual.list).toBe('ais-refinement-list--list list');
        expect(actual.item).toBe('ais-refinement-list--item item');
        expect(actual.active).toBe('ais-refinement-list--item__active active');
        expect(actual.label).toBe('ais-refinement-list--label label');
        expect(actual.checkbox).toBe('ais-refinement-list--checkbox checkbox');
        expect(actual.count).toBe('ais-refinement-list--count count');
      });
    });

    context('autoHideContainer', () => {
      it('should set shouldAutoHideContainer to false if there are facetValues', () => {
        // Given
        results.getFacetValues = sinon.stub().returns([{name: 'foo'}, {name: 'bar'}]);

        // When
        renderWidget();
        let actual = ReactDOM.render.firstCall.args[0].props.shouldAutoHideContainer;

        // Then
        expect(actual).toBe(false);
      });
      it('should set shouldAutoHideContainer to true if no facet values', () => {
        // Given
        results.getFacetValues = sinon.stub().returns([]);

        // When
        renderWidget();
        let actual = ReactDOM.render.firstCall.args[0].props.shouldAutoHideContainer;

        // Then
        expect(actual).toBe(true);
      });
    });

    describe('header', () => {
      it('should pass the refined count to the header data', () => {
        // Given
        let facetValues = [{
          name: 'foo',
          isRefined: true
        }, {
          name: 'bar',
          isRefined: true
        }, {
          name: 'baz',
          isRefined: false
        }];
        results.getFacetValues = sinon.stub().returns(facetValues);

        // When
        renderWidget();
        let props = ReactDOM.render.firstCall.args[0].props;

        // Then
        expect(props.headerFooterData.header.refinedFacetsCount).toEqual(2);
      });

      it('should dynamically update the header template on subsequent renders', () => {
        // Given
        let widgetOptions = {container, attributeName: 'type'};
        let initOptions = {helper, createURL};
        let facetValues = [{
          name: 'foo',
          isRefined: true
        }, {
          name: 'bar',
          isRefined: false
        }];
        results.getFacetValues = sinon.stub().returns(facetValues);
        let renderOptions = {results, helper, templatesConfig, state};

        // When
        widget = refinementList(widgetOptions);
        widget.init(initOptions);
        widget.render(renderOptions);

        // Then
        let props = ReactDOM.render.firstCall.args[0].props;
        expect(props.headerFooterData.header.refinedFacetsCount).toEqual(1);

        // When... second render call
        facetValues[1].isRefined = true;
        widget.render(renderOptions);

        // Then
        props = ReactDOM.render.secondCall.args[0].props;
        expect(props.headerFooterData.header.refinedFacetsCount).toEqual(2);
      });
    });
  });

  context('toggleRefinement', () => {
    let helper;
    beforeEach(() => {
      options = {container, attributeName: 'attributeName'};
      helper = {
        toggleRefinement: sinon.stub().returnsThis(),
        search: sinon.spy()
      };
    });

    it('should do a refinement on the selected facet', () => {
      // Given
      widget = refinementList(options);
      widget.init({helper});

      // When
      widget.toggleRefinement(helper, 'attributeName', 'facetValue');

      // Then
      expect(helper.toggleRefinement.calledWith('attributeName', 'facetValue'));
    });
    it('should start a search on refinement', () => {
      // Given
      widget = refinementList(options);
      widget.init({helper});

      // When
      widget.toggleRefinement(helper, 'attributeName', 'facetValue');

      // Then
      expect(helper.search.called);
    });
  });

  context('show more', () => {
    it('should return a configuration with the highest limit value (default value)', () => {
      const opts = {container, attributeName: 'attributeName', limit: 1, showMore: {}};
      const wdgt = refinementList(opts);
      const partialConfig = wdgt.getConfiguration({});
      expect(partialConfig.maxValuesPerFacet).toBe(100);
    });

    it('should return a configuration with the highest limit value (custom value)', () => {
      const opts = {container, attributeName: 'attributeName', limit: 1, showMore: {limit: 99}};
      const wdgt = refinementList(opts);
      const partialConfig = wdgt.getConfiguration({});
      expect(partialConfig.maxValuesPerFacet).toBe(opts.showMore.limit);
    });

    it('should not accept a show more limit that is < limit', () => {
      const opts = {container, attributeName: 'attributeName', limit: 100, showMore: {limit: 1}};
      expect(() => refinementList(opts)).toThrow();
    });
  });
});
