/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';
import {createRenderer} from 'react-addons-test-utils';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import refinementList from '../refinement-list';
import Template from '../../../components/Template.js';

const helpers = require('../../../lib/helpers')('en-US');

describe('refinementList()', () => {
  let autoHideContainer;
  let container;
  let headerFooter;
  let options;
  let widget;
  let ReactDOM;
  let renderer = createRenderer();

  jsdom({useEach: true});

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
      return widget.render({results, helper, templatesConfig, state, createURL});
    }

    beforeEach(() => {
      options = {container, attributeName: 'attributeName'};
      results = {getFacetValues: sinon.stub().returns(['foo', 'bar'])};
      state = {toggleRefinement: sinon.spy()};
      createURL = sinon.spy();
    });

    it('formats counts', () => {
      const props = {
        templatesConfig: {helpers},
        templates: require('../defaultTemplates')
      };
      renderer.render(<Template data={{count: 1000}} {...props} templateKey="item" />);
      let out = renderer.getRenderOutput();
      expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: '<label class="">\n <input type="checkbox" class="" value="" />\n <span class="">1,000</span>\n</label>'}} />);
    });

    context('cssClasses', () => {
      it('should call the component with the correct classes', () => {
        // Given
        let cssClasses = {
          root: 'root',
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
        expect(actual.root).toBe('ais-refinement-list root');
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
        results.getFacetValues = sinon.stub().returns(['foo', 'bar']);

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

      // When
      widget.toggleRefinement(helper, 'attributeName', 'facetValue');

      // Then
      expect(helper.toggleRefinement.calledWith('attributeName', 'facetValue'));

      // Then
    });
    it('should start a search on refinement', () => {
      // Given
      widget = refinementList(options);

      // When
      widget.toggleRefinement(helper, 'attributeName', 'facetValue');

      // Then
      expect(helper.search.called);

      // Then
    });
  });
});
