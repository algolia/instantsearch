/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('rangeSlider()', () => {
  jsdom({useEach: true});

  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;

  let autoHideContainer;
  let headerFooter;
  let Slider;
  let rangeSlider;

  beforeEach(() => {
    rangeSlider = require('../range-slider');
    Slider = require('../../../components/Slider/Slider');
    ReactDOM = {render: sinon.spy()};
    rangeSlider.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = sinon.stub().returns(Slider);
    rangeSlider.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = sinon.stub().returns(Slider);
    rangeSlider.__Rewire__('headerFooterHOC', headerFooter);

    container = document.createElement('div');
    widget = rangeSlider({container, attributeName: 'aNumAttr'});
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
    expect(widget.getConfiguration()).toEqual({disjunctiveFacets: ['aNumAttr']});
  });

  it('calls twice ReactDOM.render(<Slider props />, container)', () => {
    widget.render({results, helper});
    widget.render({results, helper});

    let props = {
      cssClasses: {body: null, root: null},
      onChange: () => {},
      pips: true,
      range: {max: 5000, min: 1},
      shouldAutoHideContainer: false,
      start: [-Infinity, Infinity],
      step: 1,
      templateProps: {
        templates: {footer: '', header: ''},
        templatesConfig: undefined,
        transformData: undefined,
        useCustomCompileOptions: {footer: false, header: false}
      },
      tooltips: true
    };

    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
    expect(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Slider {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Slider {...props} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('doesn\'t call the refinement functions if not refined', () => {
    widget.render({results, helper});
    expect(helper.state.getNumericRefinement.calledTwice).toBe(true, 'getNumericRefinement called once');
    expect(helper.clearRefinements.called).toBe(false, 'clearRefinements never called');
    expect(helper.addNumericRefinement.called).toBe(false, 'addNumericRefinement never called');
    expect(helper.search.called).toBe(false, 'search never called');
  });

  it('calls the refinement functions if refined with min+1', () => {
    let stats = results.getFacetStats();
    widget._refine(helper, stats, [stats.min + 1, stats.max]);
    expect(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.addNumericRefinement.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.addNumericRefinement.getCall(0).args).toEqual(['aNumAttr', '>=', stats.min + 1]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls the refinement functions if refined with max-1', () => {
    let stats = results.getFacetStats();
    widget._refine(helper, stats, [stats.min, stats.max - 1]);
    expect(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    expect(helper.addNumericRefinement.getCall(0).args).toEqual(['aNumAttr', '<=', stats.max - 1]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls the refinement functions if refined with min+1 and max-1', () => {
    let stats = results.getFacetStats();
    widget._refine(helper, stats, [stats.min + 1, stats.max - 1]);
    expect(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.addNumericRefinement.calledTwice).toBe(true, 'addNumericRefinement called twice');
    expect(helper.addNumericRefinement.getCall(0).args).toEqual(['aNumAttr', '>=', stats.min + 1]);
    expect(helper.addNumericRefinement.getCall(1).args).toEqual(['aNumAttr', '<=', stats.max - 1]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  afterEach(() => {
    rangeSlider.__ResetDependency__('ReactDOM');
    rangeSlider.__ResetDependency__('autoHideContainerHOC');
    rangeSlider.__ResetDependency__('headerFooterHOC');
  });
});
