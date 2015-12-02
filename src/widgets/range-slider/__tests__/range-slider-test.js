/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import AlgoliasearchHelper from 'algoliasearch-helper';

describe('rangeSlider call', () => {
  jsdom({useEach: true});
  const rangeSlider = require('../range-slider.js');

  it('throws an exception when no container', () => {
    const attributeName = '';
    expect(rangeSlider.bind(null, {attributeName})).toThrow(/^Usage:/);
  });

  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(rangeSlider.bind(null, {container})).toThrow(/^Usage:/);
  });
});

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
    rangeSlider = require('../range-slider.js');
    Slider = require('../../../components/Slider/Slider.js');
    ReactDOM = {render: sinon.spy()};
    rangeSlider.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = sinon.stub().returns(Slider);
    rangeSlider.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = sinon.stub().returns(Slider);
    rangeSlider.__Rewire__('headerFooterHOC', headerFooter);

    container = document.createElement('div');
    widget = rangeSlider({container, attributeName: 'aNumAttr'});

    helper = new AlgoliasearchHelper(
      {search: function() {}},
      'indexName',
      {disjunctiveFacets: ['aNumAttr']}
    );
    sinon.spy(helper, 'addNumericRefinement');
    sinon.spy(helper, 'clearRefinements');
    sinon.spy(helper, 'search');
  });

  context('without result', () => {
    beforeEach(() => {
      results = {};
    });

    it('calls ReactDOM.render(<Slider props />, container)', () => {
      widget.render({results, helper});

      let props = {
        cssClasses: {body: null, root: null},
        onChange: () => {},
        pips: true,
        range: {max: 0, min: 0},
        shouldAutoHideContainer: true,
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

      expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
      expect(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
      expect(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Slider {...props} />);
    });
  });

  context('when rangestats min === stats max', () => {
    beforeEach(() => {
      results = {
        disjunctiveFacets: [{
          name: 'aNumAttr',
          data: {
            65: 1
          },
          exhaustive: true,
          stats: {
            min: 65,
            max: 65,
            avg: 65,
            sum: 65
          }
        }]
      };
    });

    it('should shouldAutoHideContainer', () => {
      widget.render({results, helper});

      let props = {
        cssClasses: {body: null, root: null},
        onChange: () => {},
        pips: true,
        range: {max: 65, min: 65},
        shouldAutoHideContainer: true,
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

      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Slider {...props} />);
    });
  });

  context('with results', () => {
    beforeEach(() => {
      results = {
        disjunctiveFacets: [{
          name: 'aNumAttr',
          data: {
            19.99: 610,
            39.99: 593,
            29.99: 488,
            49.99: 486,
            99.99: 430,
            14.99: 376,
            59.99: 323,
            34.99: 286,
            79.99: 282,
            9.99: 277,
            599.99: 105,
            999.99: 104,
            799.99: 96,
            899.99: 88,
            699.99: 84,
            1099.99: 53,
            1199.99: 49,
            649.99: 48,
            1299.99: 46,
            749.99: 34
          },
          exhaustive: true,
          stats: {
            min: 1.99,
            max: 4999.98,
            avg: 243.349,
            sum: 2433490
          }
        }]
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
      let state0 = helper.state;
      widget.render({results, helper});
      let state1 = helper.state;
      expect(state1).toEqual(state0);
      expect(helper.search.called).toBe(false, 'search never called');
    });

    it('calls the refinement functions if refined with min+1', () => {
      let stats = results.disjunctiveFacets[0].stats;
      let targetValue = Math.floor(stats.min) + 1;

      let state0 = helper.state;
      widget._refine(helper, stats, [targetValue, stats.max]);
      let state1 = helper.state;

      expect(helper.search.calledOnce).toBe(true, 'search called once');
      expect(state1).toEqual(state0.addNumericRefinement('aNumAttr', '>=', targetValue));
    });

    it('calls the refinement functions if refined with max-1', () => {
      let stats = results.disjunctiveFacets[0].stats;
      let targetValue = Math.ceil(stats.max) - 1;

      let state0 = helper.state;
      widget._refine(helper, stats, [stats.min, targetValue]);
      let state1 = helper.state;

      expect(helper.search.calledOnce).toBe(true, 'search called once');
      expect(state1).toEqual(state0.addNumericRefinement('aNumAttr', '<=', targetValue));
    });

    it('calls the refinement functions if refined with min+1 and max-1', () => {
      let stats = results.disjunctiveFacets[0].stats;
      let targetValue = [Math.floor(stats.min) + 1, Math.ceil(stats.max) - 1];

      let state0 = helper.state;
      widget._refine(helper, stats, targetValue);
      let state1 = helper.state;

      let expectedState = state0.
      addNumericRefinement('aNumAttr', '>=', targetValue[0]).
      addNumericRefinement('aNumAttr', '<=', targetValue[1]);

      expect(state1).toEqual(expectedState);
      expect(helper.search.calledOnce).toBe(true, 'search called once');
    });
  });

  afterEach(() => {
    rangeSlider.__ResetDependency__('ReactDOM');
    rangeSlider.__ResetDependency__('autoHideContainerHOC');
    rangeSlider.__ResetDependency__('headerFooterHOC');
  });
});
