/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import toggle from '../toggle';
import RefinementList from '../../../components/RefinementList';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('toggle()', () => {
  jsdom();

  context('bad usage', () => {
    it('throws when no container', () => {
      expect(() => {
        toggle();
      }).toThrow(/Container must be `string` or `HTMLElement`/);
    });

    it('throws when no facetName', () => {
      expect(() => {
        toggle({container: document.createElement('div')});
      }).toThrow(/Usage: /);
    });

    it('throws when no label', () => {
      expect(() => {
        toggle({container: document.createElement('div'), facetName: 'Hello'});
      }).toThrow(/Usage: /);
    });
  });

  context('good usage', () => {
    var ReactDOM;
    var autoHide;
    var headerFooter;
    var container;
    var widget;
    var facetName;
    var label;

    beforeEach(() => {
      ReactDOM = {render: sinon.spy()};
      autoHide = sinon.stub().returns(RefinementList);
      headerFooter = sinon.stub().returns(RefinementList);

      toggle.__Rewire__('ReactDOM', ReactDOM);
      toggle.__Rewire__('autoHide', autoHide);
      toggle.__Rewire__('headerFooter', headerFooter);

      container = document.createElement('div');
      label = 'Hello, ';
      facetName = 'world!';
    });

    it('configures hitsPerPage', () => {
      widget = toggle({container, facetName, label});
      expect(widget.getConfiguration()).toEqual({facets: ['world!']});
    });

    it('uses autoHide() and headerFooter()', () => {
      widget = toggle({container, facetName, label});
      expect(autoHide.calledOnce).toBe(true);
      expect(headerFooter.calledOnce).toBe(true);
      expect(headerFooter.calledBefore(autoHide)).toBe(true);
    });

    context('render', () => {
      var templateProps;
      var results;
      var helper;
      var props;

      beforeEach(() => {
        templateProps = {
          templatesConfig: undefined,
          templates: require('../defaultTemplates'),
          useCustomCompileOptions: {header: false, item: false, footer: false},
          transformData: undefined
        };
        helper = {
          hasRefinements: sinon.stub().returns(false),
          removeFacetRefinement: sinon.spy(),
          addFacetRefinement: sinon.spy(),
          search: sinon.spy()
        };
        props = {
          cssClasses: {
            root: 'ais-toggle',
            header: 'ais-toggle--header',
            body: 'ais-toggle--body',
            footer: 'ais-toggle--footer',
            list: 'ais-toggle--list',
            item: 'ais-toggle--item',
            active: 'ais-toggle--item__active',
            label: 'ais-toggle--label',
            checkbox: 'ais-toggle--checkbox',
            count: 'ais-toggle--count'
          },
          hideWhenNoResults: true,
          templateProps,
          toggleRefinement: function() {},
          createURL: () => '#'
        };
      });

      it('calls ReactDOM.render', () => {
        results = {
          hits: [{Hello: ', world!'}],
          getFacetValues: sinon.stub().returns([{name: 'true', count: 2}, {name: 'false', count: 1}])
        };
        widget = toggle({container, facetName, label});
        widget.render({results, helper});
        expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
        expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
      });

      it('with facet values', () => {
        results = {
          hits: [{Hello: ', world!'}],
          getFacetValues: sinon.stub().returns([{name: 'true', count: 2}, {name: 'false', count: 1}])
        };
        widget = toggle({container, facetName, label});
        widget.render({results, helper});

        props = {
          facetValues: [{count: 1, isRefined: false, name: label}],
          hasResults: true,
          ...props
        };

        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<RefinementList {...props} />);
      });

      it('without facet values', () => {
        results = {
          hits: [],
          getFacetValues: sinon.stub().returns([])
        };
        widget = toggle({container, facetName, label});
        widget.render({results, helper});

        props = {
          facetValues: [{name: label, isRefined: false, count: null}],
          hasResults: false,
          ...props
        };

        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<RefinementList {...props} />);
      });

      it('when refined', () => {
        helper = {
          hasRefinements: sinon.stub().returns(true)
        };
        results = {
          hits: [{Hello: ', world!'}],
          getFacetValues: sinon.stub().returns([{name: 'true', count: 2}, {name: 'false', count: 1}])
        };
        widget = toggle({container, facetName, label});
        widget.render({results, helper});

        props = {
          facetValues: [{count: 2, isRefined: true, name: label}],
          hasResults: true,
          ...props
        };

        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<RefinementList {...props} />);
      });

      it('using props.toggleRefinement', () => {
        results = {
          hits: [{Hello: ', world!'}],
          getFacetValues: sinon.stub().returns([{name: 'true', count: 2}, {name: 'false', count: 1}])
        };
        widget = toggle({container, facetName, label});
        widget.render({results, helper});
        var toggleRefinement = ReactDOM.render.firstCall.args[0].props.toggleRefinement;
        expect(toggleRefinement).toBeA('function');
        toggleRefinement();
        expect(helper.addFacetRefinement.calledOnce).toBe(true);
        expect(helper.addFacetRefinement.calledWithExactly(facetName, true));
        helper.hasRefinements = sinon.stub().returns(true);
        ReactDOM.render.reset();
        widget.render({results, helper});
        toggleRefinement = ReactDOM.render.firstCall.args[0].props.toggleRefinement;
        toggleRefinement();
        expect(helper.removeFacetRefinement.calledOnce).toBe(true);
        expect(helper.removeFacetRefinement.calledWithExactly(facetName, true));
      });
    });

    afterEach(() => {
      toggle.__ResetDependency__('ReactDOM');
      toggle.__ResetDependency__('autoHide');
      toggle.__ResetDependency__('headerFooter');
    });
  });
});
