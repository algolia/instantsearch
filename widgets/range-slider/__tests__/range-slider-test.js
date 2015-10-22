/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('rangeSlider()', () => {
  jsdom({useEach: true});

  var ReactDOM;
  var container;
  var widget;
  var results;
  var helper;

  var autoHideContainer;
  var headerFooter;
  var Slider;
  var rangeSlider;

  beforeEach(() => {
    rangeSlider = require('../range-slider');
    Slider = require('../../../components/Slider/Slider');
    ReactDOM = {render: sinon.spy()};
    rangeSlider.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = sinon.stub().returns(Slider);
    rangeSlider.__Rewire__('autoHideContainer', autoHideContainer);
    headerFooter = sinon.stub().returns(Slider);
    rangeSlider.__Rewire__('headerFooter', headerFooter);

    container = document.createElement('div');
    widget = rangeSlider({container, facetName: 'aFacetName'});
    results = {
      getFacetStats: sinon.stub().returns({
        min: 1.99,
        max: 4999.98,
        avg: 243.349,
        sum: 2433490.0
      })
    };
    helper = {
      state: {
        getNumericRefinement: sinon.stub().returns([])
      },
      addNumericRefinement: sinon.spy(),
      clearRefinements: sinon.spy(),
      search: sinon.spy()
    };
  });

  it('configures the disjunctiveFacets', () => {
    expect(widget.getConfiguration()).toEqual({disjunctiveFacets: ['aFacetName']});
  });

  it('calls ReactDOM.render(<Slider props />, container)', () => {
    widget.render({results, helper});
    expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
    expect(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
    expect(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
    <Slider
      cssClasses={{body: null, root: null}}
      hasResults={true}
      hideContainerWhenNoResults={true}
      onChange={() => {}}
      range={{max: 4999.98, min: 1.99}}
      start={[-Infinity, Infinity]}
      templateProps={{
        templates: {footer: '', header: ''},
        templatesConfig: undefined,
        transformData: undefined,
        useCustomCompileOptions: {footer: false, header: false}
      }}
      tooltips={true}
    />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
  });

  it('doesn\'t call the refinement functions if not refined', () => {
    widget.render({results, helper});
    expect(helper.state.getNumericRefinement.calledTwice).toBe(true, 'getNumericRefinement called once');
    expect(helper.clearRefinements.called).toBe(false, 'clearRefinements never called');
    expect(helper.addNumericRefinement.called).toBe(false, 'addNumericRefinement never called');
    expect(helper.search.called).toBe(false, 'search never called');
  });

  it('calls the refinement functions if refined with min+1', () => {
    var stats = results.getFacetStats();
    widget._refine(helper, stats, [stats.min + 1, stats.max]);
    expect(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.addNumericRefinement.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.addNumericRefinement.getCall(0).args).toEqual(['aFacetName', '>=', stats.min + 1]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls the refinement functions if refined with max-1', () => {
    var stats = results.getFacetStats();
    widget._refine(helper, stats, [stats.min, stats.max - 1]);
    expect(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    expect(helper.addNumericRefinement.getCall(0).args).toEqual(['aFacetName', '<=', stats.max - 1]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls the refinement functions if refined with min+1 and max-1', () => {
    var stats = results.getFacetStats();
    widget._refine(helper, stats, [stats.min + 1, stats.max - 1]);
    expect(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.addNumericRefinement.calledTwice).toBe(true, 'addNumericRefinement called twice');
    expect(helper.addNumericRefinement.getCall(0).args).toEqual(['aFacetName', '>=', stats.min + 1]);
    expect(helper.addNumericRefinement.getCall(1).args).toEqual(['aFacetName', '<=', stats.max - 1]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  afterEach(() => {
    rangeSlider.__ResetDependency__('ReactDOM');
    rangeSlider.__ResetDependency__('autoHideContainer');
    rangeSlider.__ResetDependency__('headerFooter');
  });
});
