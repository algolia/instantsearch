/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'jsdom-global';
import expectJSX from 'expect-jsx';
import rangeSlider from '../range-slider.js';
import Slider from '../../../components/Slider/Slider.js';
import AlgoliasearchHelper from 'algoliasearch-helper';

expect.extend(expectJSX);

describe('rangeSlider call', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

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
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;

  let autoHideContainer;
  let headerFooter;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    rangeSlider.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = sinon.stub().returns(Slider);
    rangeSlider.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = sinon.stub().returns(Slider);
    rangeSlider.__Rewire__('headerFooterHOC', headerFooter);

    container = document.createElement('div');

    helper = new AlgoliasearchHelper(
      {search: function() {}},
      'indexName',
      {disjunctiveFacets: ['aNumAttr']}
    );
    sinon.spy(helper, 'addNumericRefinement');
    sinon.spy(helper, 'clearRefinements');
    sinon.spy(helper, 'search');
  });

  context('min option', () => {
    it('refines when no previous configuration', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', min: 100});
      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['aNumAttr'],
        numericRefinements: {aNumAttr: {'>=': [100]}}
      });
    });

    it('does not refine when previous configuration', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', min: 100});
      expect(widget.getConfiguration({numericRefinements: {aNumAttr: {}}})).toEqual({
        disjunctiveFacets: ['aNumAttr']
      });
    });

    it('works along with max option', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', min: 100, max: 200});
      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['aNumAttr'],
        numericRefinements: {aNumAttr: {'>=': [100], '<=': [200]}}
      });
    });

    it('sets the right ranges', () => {
      results = {};
      widget = rangeSlider({container, attributeName: 'aNumAttr', min: 100, max: 200});
      helper.setState(widget.getConfiguration());
      widget.init({helper});
      widget.render({results, helper});
      let props = {
        cssClasses: {
          root: 'ais-range-slider',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer'
        },
        collapsible: false,
        onChange: () => {},
        pips: true,
        range: {max: 200, min: 100},
        shouldAutoHideContainer: false,
        start: [100, 200],
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

  context('max option', () => {
    it('refines when no previous configuration', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', max: 100});
      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['aNumAttr'],
        numericRefinements: {aNumAttr: {'<=': [100]}}
      });
    });

    it('does not refine when previous configuration', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', max: 100});
      expect(widget.getConfiguration({numericRefinements: {aNumAttr: {}}})).toEqual({
        disjunctiveFacets: ['aNumAttr']
      });
    });
  });

  context('without result', () => {
    beforeEach(() => {
      results = {};
      widget = rangeSlider({container, attributeName: 'aNumAttr', cssClasses: {root: ['root', 'cx']}});
      widget.init({helper});
    });

    it('calls ReactDOM.render(<Slider props />, container)', () => {
      widget.render({results, helper});

      let props = {
        cssClasses: {
          root: 'ais-range-slider root cx',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer'
        },
        collapsible: false,
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
      widget = rangeSlider({container, attributeName: 'aNumAttr', cssClasses: {root: ['root', 'cx']}});
      widget.init({helper});
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
        cssClasses: {
          root: 'ais-range-slider root cx',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer'
        },
        collapsible: false,
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
      widget = rangeSlider({container, attributeName: 'aNumAttr', cssClasses: {root: ['root', 'cx']}});
      widget.init({helper});
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
        cssClasses: {
          root: 'ais-range-slider root cx',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer'
        },
        collapsible: false,
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
