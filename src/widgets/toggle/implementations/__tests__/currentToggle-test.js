/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';

import {createRenderer} from 'react-addons-test-utils';

import currentToggle from '../currentToggle.js';
import defaultTemplates from '../../defaultTemplates.js';
import Template from '../../../../components/Template';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import createHelpers from '../../../../lib/createHelpers.js';

describe('currentToggle()', () => {
  const helpers = createHelpers('en-US');
  const renderer = createRenderer();

  context('good usage', () => {
    let ReactDOM;
    let containerNode;
    let widget;
    let attributeName;
    let label;
    let userValues;
    let RefinementList;
    let collapsible;
    let cssClasses;

    beforeEach(() => {
      ReactDOM = {render: sinon.spy()};

      currentToggle.__Rewire__('ReactDOM', ReactDOM);

      containerNode = document.createElement('div');
      label = 'Hello, ';
      attributeName = 'world!';
      cssClasses = {};
      collapsible = false;
      userValues = {on: true, off: undefined};
      RefinementList = () => <div></div>;
      widget = currentToggle({containerNode, attributeName, label});
    });

    it('configures disjunctiveFacets', () => {
      expect(widget.getConfiguration()).toEqual({disjunctiveFacets: ['world!']});
    });

    context('render', () => {
      let templateProps;
      let results;
      let helper;
      let state;
      let props;
      let createURL;

      beforeEach(() => {
        templateProps = {
          templatesConfig: undefined,
          templates: defaultTemplates,
          useCustomCompileOptions: {header: false, item: false, footer: false},
          transformData: undefined
        };
        helper = {
          state: {
            isDisjunctiveFacetRefined: sinon.stub().returns(false)
          },
          removeDisjunctiveFacetRefinement: sinon.spy(),
          addDisjunctiveFacetRefinement: sinon.spy(),
          search: sinon.spy()
        };
        state = {
          removeDisjunctiveFacetRefinement: sinon.spy(),
          addDisjunctiveFacetRefinement: sinon.spy(),
          isDisjunctiveFacetRefined: sinon.stub().returns(false)
        };
        props = {
          cssClasses: {},
          collapsible: false,
          templateProps,
          createURL() {},
          toggleRefinement() {}
        };
        createURL = () => '#';
        widget.init({state});
      });

      it('calls twice ReactDOM.render', () => {
        results = {
          hits: [{Hello: ', world!'}],
          nbHits: 1,
          getFacetValues: sinon.stub().returns([{name: 'true', count: 2}, {name: 'false', count: 1}])
        };
        widget = currentToggle({containerNode, attributeName, label, userValues});
        widget.getConfiguration();
        widget.render({results, helper, state, createURL});
        widget.render({results, helper, state, createURL});
        expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
        expect(ReactDOM.render.firstCall.args[1]).toEqual(containerNode);
        expect(ReactDOM.render.secondCall.args[1]).toEqual(containerNode);
      });

      it('formats counts', () => {
        templateProps.templatesConfig = {helpers};
        renderer.render(<Template data={{count: 1000}} {...templateProps} templateKey="item" />);
        const out = renderer.getRenderOutput();
        // eslint-disable-next-line max-len
        expect(out).toEqualJSX(<div dangerouslySetInnerHTML={{__html: '<label class="">\n <input type="checkbox" class="" value="" />\n <span class="">1,000</span>\n</label>'}} />);
      });

      it('understands cssClasses', () => {
        results = {
          hits: [{Hello: ', world!'}],
          nbHits: 1,
          getFacetValues: sinon.stub().returns([
            {name: 'true', count: 2, isRefined: false},
            {name: 'false', count: 1, isRefined: false}
          ])
        };
        props.cssClasses.root = 'test';
        props = {
          facetValues: [{
            count: 2,
            isRefined: false,
            name: label,
            offFacetValue: {count: 1, name: 'Hello, ', isRefined: false},
            onFacetValue: {count: 2, name: 'Hello, ', isRefined: false}
          }],
          shouldAutoHideContainer: false,
          ...props
        };
        cssClasses = {root: 'test'};
        widget = currentToggle({
          containerNode,
          attributeName,
          label,
          cssClasses,
          userValues,
          RefinementList,
          collapsible
        });
        widget.getConfiguration();
        widget.init({state, helper});
        widget.render({results, helper, state, createURL});
        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<RefinementList {...props} />);
      });

      it('with facet values', () => {
        results = {
          hits: [{Hello: ', world!'}],
          nbHits: 1,
          getFacetValues: sinon.stub().returns([
            {name: 'true', count: 2, isRefined: false},
            {name: 'false', count: 1, isRefined: false}
          ])
        };
        widget = currentToggle({
          containerNode,
          attributeName,
          label,
          cssClasses,
          userValues,
          RefinementList,
          collapsible
        });
        widget.getConfiguration();
        widget.init({state, helper});
        widget.render({results, helper, state, createURL});
        widget.render({results, helper, state, createURL});

        props = {
          facetValues: [{
            count: 2,
            isRefined:
            false,
            name: label,
            offFacetValue: {count: 1, name: 'Hello, ', isRefined: false},
            onFacetValue: {count: 2, name: 'Hello, ', isRefined: false}
          }],
          shouldAutoHideContainer: false,
          ...props
        };

        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<RefinementList {...props} />);
        expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<RefinementList {...props} />);
      });

      it('without facet values', () => {
        results = {
          hits: [],
          nbHits: 0,
          getFacetValues: sinon.stub().returns([])
        };
        widget = currentToggle({
          containerNode,
          attributeName,
          label,
          cssClasses,
          userValues,
          RefinementList,
          collapsible
        });
        widget.getConfiguration();
        widget.init({state, helper});
        widget.render({results, helper, state, createURL});
        widget.render({results, helper, state, createURL});

        props = {
          facetValues: [{
            name: label,
            isRefined: false,
            count: null,
            onFacetValue: {name: label, isRefined: false, count: null},
            offFacetValue: {name: label, isRefined: false, count: 0}
          }],
          shouldAutoHideContainer: true,
          ...props
        };

        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<RefinementList {...props} />);
        expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<RefinementList {...props} />);
      });

      it('when refined', () => {
        helper = {
          state: {
            isDisjunctiveFacetRefined: sinon.stub().returns(true)
          }
        };
        results = {
          hits: [{Hello: ', world!'}],
          nbHits: 1,
          getFacetValues: sinon.stub().returns([
            {name: 'true', count: 2, isRefined: true},
            {name: 'false', count: 1, isRefined: false}
          ])
        };
        widget = currentToggle({
          containerNode,
          attributeName,
          label,
          cssClasses,
          userValues,
          RefinementList,
          collapsible
        });
        widget.getConfiguration();
        widget.init({state, helper});
        widget.render({results, helper, state, createURL});
        widget.render({results, helper, state, createURL});

        props = {
          facetValues: [{
            count: 1,
            isRefined: true,
            name: label,
            onFacetValue: {name: label, isRefined: true, count: 2},
            offFacetValue: {name: label, isRefined: false, count: 1}
          }],
          shouldAutoHideContainer: false,
          ...props
        };

        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<RefinementList {...props} />);
        expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<RefinementList {...props} />);
      });

      it('using props.toggleRefinement', () => {
        results = {
          hits: [{Hello: ', world!'}],
          nbHits: 1,
          getFacetValues: sinon.stub().returns([{name: 'true', count: 2}, {name: 'false', count: 1}])
        };
        widget = currentToggle({
          containerNode,
          attributeName,
          label,
          cssClasses,
          userValues,
          RefinementList,
          collapsible
        });
        widget.getConfiguration();
        widget.init({state, helper});
        widget.render({results, helper, state, createURL});
        const toggleRefinement = ReactDOM.render.firstCall.args[0].props.toggleRefinement;
        expect(toggleRefinement).toBeA('function');
        toggleRefinement();
        expect(helper.addDisjunctiveFacetRefinement.calledOnce).toBe(true);
        expect(helper.addDisjunctiveFacetRefinement.calledWithExactly(attributeName, true));
        helper.hasRefinements = sinon.stub().returns(true);
      });
    });

    context('toggleRefinement', () => {
      let helper;

      function toggleOn() {
        widget.toggleRefinement(helper, 'facetValueToRefine', false);
      }
      function toggleOff() {
        widget.toggleRefinement(helper, 'facetValueToRefine', true);
      }

      beforeEach(() => {
        helper = {
          removeDisjunctiveFacetRefinement: sinon.spy(),
          addDisjunctiveFacetRefinement: sinon.spy(),
          search: sinon.spy()
        };
      });

      context('default values', () => {
        it('toggle on should add filter to true', () => {
          // Given
          widget = currentToggle({containerNode, attributeName, label, userValues});
          widget.getConfiguration();

          // When
          toggleOn();

          // Then
          expect(helper.addDisjunctiveFacetRefinement.calledWith(attributeName, true)).toBe(true);
          expect(helper.removeDisjunctiveFacetRefinement.called).toBe(false);
        });
        it('toggle off should remove all filters', () => {
          // Given
          widget = currentToggle({containerNode, attributeName, label, userValues});
          widget.getConfiguration();

          // When
          toggleOff();

          // Then
          expect(helper.removeDisjunctiveFacetRefinement.calledWith(attributeName, true)).toBe(true);
          expect(helper.addDisjunctiveFacetRefinement.called).toBe(false);
        });
      });
      context('specific values', () => {
        it('toggle on should change the refined value', () => {
          // Given
          userValues = {on: 'on', off: 'off'};
          widget = currentToggle({containerNode, attributeName, label, userValues, hasAnOffValue: true});
          widget.getConfiguration();

          // When
          toggleOn();

          // Then
          expect(helper.removeDisjunctiveFacetRefinement.calledWith(attributeName, 'off')).toBe(true);
          expect(helper.addDisjunctiveFacetRefinement.calledWith(attributeName, 'on')).toBe(true);
        });
        it('toggle off should change the refined value', () => {
          // Given
          userValues = {on: 'on', off: 'off'};
          widget = currentToggle({containerNode, attributeName, label, userValues, hasAnOffValue: true});
          widget.getConfiguration();

          // When
          toggleOff();

          // Then
          expect(helper.removeDisjunctiveFacetRefinement.calledWith(attributeName, 'on')).toBe(true);
          expect(helper.addDisjunctiveFacetRefinement.calledWith(attributeName, 'off')).toBe(true);
        });
      });
    });

    context('custom off value', () => {
      it('should add a refinement for custom off value on init', () => {
        // Given
        userValues = {on: 'on', off: 'off'};
        widget = currentToggle({containerNode, attributeName, label, hasAnOffValue: true, userValues});
        widget.getConfiguration();
        const state = {
          isDisjunctiveFacetRefined: sinon.stub().returns(false)
        };
        const helper = {
          addDisjunctiveFacetRefinement: sinon.spy()
        };

        // When
        widget.init({state, helper});

        // Then
        expect(helper.addDisjunctiveFacetRefinement.calledWith(attributeName, 'off')).toBe(true);
      });
      it('should not add a refinement for custom off value on init if already checked', () => {
        // Given
        userValues = {on: 'on', off: 'off'};
        widget = currentToggle({containerNode, attributeName, label, userValues, hasAnOffValue: true});
        widget.getConfiguration();
        const state = {
          isDisjunctiveFacetRefined: sinon.stub().returns(true)
        };
        const helper = {
          addDisjunctiveFacetRefinement: sinon.spy()
        };

        // When
        widget.init({state, helper});

        // Then
        expect(helper.addDisjunctiveFacetRefinement.called).toBe(false);
      });
      it('should not add a refinement for no custom off value on init', () => {
        // Given
        widget = currentToggle({containerNode, attributeName, label, hasAnOffValue: false, userValues});
        widget.getConfiguration();
        const state = {};
        const helper = {
          addDisjunctiveFacetRefinement: sinon.spy()
        };

        // When
        widget.init({state, helper});

        // Then
        expect(helper.addDisjunctiveFacetRefinement.called).toBe(false);
      });
    });

    afterEach(() => {
      currentToggle.__ResetDependency__('ReactDOM');
    });
  });
});
