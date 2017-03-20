import React from 'react';
import sinon from 'sinon';
import expect from 'expect';
import expectJSX from 'expect-jsx';
import rangeSlider from '../range-slider.js';
import Slider from '../../../components/Slider/Slider.js';
import AlgoliasearchHelper from 'algoliasearch-helper';
expect.extend(expectJSX);

describe('rangeSlider call', () => {
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
  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    rangeSlider.__Rewire__('ReactDOM', ReactDOM);

    container = document.createElement('div');

    helper = new AlgoliasearchHelper(
      {search() {}, addAlgoliaAgent: () => {}},
      'indexName',
      {disjunctiveFacets: ['aNumAttr']}
    );
    sinon.spy(helper, 'addNumericRefinement');
    sinon.spy(helper, 'clearRefinements');
    sinon.spy(helper, 'search');
  });

  describe('min option', () => {
    it('refines when no previous configuration', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', min: 100});
      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['aNumAttr'],
        numericRefinements: {aNumAttr: {'>=': [100]}},
      });
    });

    it('does not refine when previous configuration', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', min: 100});
      expect(widget.getConfiguration({numericRefinements: {aNumAttr: {}}})).toEqual({
        disjunctiveFacets: ['aNumAttr'],
      });
    });

    it('works along with max option', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', min: 100, max: 200});
      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['aNumAttr'],
        numericRefinements: {aNumAttr: {'>=': [100], '<=': [200]}},
      });
    });

    describe('render', () => {
      const defaultProps = {
        cssClasses: {
          root: 'ais-range-slider',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer',
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
          useCustomCompileOptions: {footer: false, header: false},
        },
        format: {to: () => {}, from: () => {}},
        tooltips: true,
      };

      it('sets the right ranges', () => {
        results = {};
        widget = rangeSlider({container, attributeName: 'aNumAttr', min: 100, max: 200});
        helper.setState(widget.getConfiguration());
        widget.init({helper});
        widget.render({results, helper});
        const props = defaultProps;

        expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Slider {...props} />);
      });

      it('will use the results max when only min passed', () => {
        results = {
          disjunctiveFacets: [{
            name: 'aNumAttr',
            stats: {
              min: 1.99,
              max: 4999.98,
            },
          }],
        };
        widget = rangeSlider({container, attributeName: 'aNumAttr', min: 100});
        helper.setState(widget.getConfiguration());
        widget.init({helper});
        widget.render({results, helper});
        const props = {
          ...defaultProps,
          range: {min: 100, max: 5000},
          start: [100, Infinity],
        };

        expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Slider {...props} />);
      });
    });
  });

  describe('max option', () => {
    it('refines when no previous configuration', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', max: 100});
      expect(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['aNumAttr'],
        numericRefinements: {aNumAttr: {'<=': [100]}},
      });
    });

    it('does not refine when previous configuration', () => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', max: 100});
      expect(widget.getConfiguration({numericRefinements: {aNumAttr: {}}})).toEqual({
        disjunctiveFacets: ['aNumAttr'],
      });
    });

    describe('render', () => {
      const defaultProps = {
        cssClasses: {
          root: 'ais-range-slider',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer',
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
          useCustomCompileOptions: {footer: false, header: false},
        },
        format: {to: () => {}, from: () => {}},
        tooltips: true,
      };

      it('will use the results min when only max passed', () => {
        results = {
          disjunctiveFacets: [{
            name: 'aNumAttr',
            stats: {
              min: 1.99,
              max: 4999.98,
            },
          }],
        };
        widget = rangeSlider({container, attributeName: 'aNumAttr', max: 100});
        helper.setState(widget.getConfiguration());
        widget.init({helper});
        widget.render({results, helper});
        const props = {
          ...defaultProps,
          range: {min: 1, max: 100},
          start: [-Infinity, 100],
        };

        expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
        expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Slider {...props} />);
      });
    });
  });

  describe('without result', () => {
    beforeEach(() => {
      results = {};
      widget = rangeSlider({container, attributeName: 'aNumAttr', cssClasses: {root: ['root', 'cx']}});
      widget.init({helper});
    });

    it('calls ReactDOM.render(<Slider props />, container)', () => {
      widget.render({results, helper});

      const props = {
        cssClasses: {
          root: 'ais-range-slider root cx',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer',
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
          useCustomCompileOptions: {footer: false, header: false},
        },
        format: {to: () => {}, from: () => {}},
        tooltips: true,
      };

      expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Slider {...props} />);
    });
  });

  describe('when rangestats min === stats max', () => {
    beforeEach(() => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', cssClasses: {root: ['root', 'cx']}});
      widget.init({helper});
      results = {
        disjunctiveFacets: [{
          name: 'aNumAttr',
          stats: {
            min: 65,
            max: 65,
          },
        }],
      };
    });

    it('should shouldAutoHideContainer', () => {
      widget.render({results, helper});

      const props = {
        cssClasses: {
          root: 'ais-range-slider root cx',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer',
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
          useCustomCompileOptions: {footer: false, header: false},
        },
        format: {to: () => {}, from: () => {}},
        tooltips: true,
      };

      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Slider {...props} />);
    });
  });

  describe('with results', () => {
    beforeEach(() => {
      widget = rangeSlider({container, attributeName: 'aNumAttr', cssClasses: {root: ['root', 'cx']}});
      widget.init({helper});
      results = {
        disjunctiveFacets: [{
          name: 'aNumAttr',
          stats: {
            min: 1.99,
            max: 4999.98,
          },
        }],
      };
    });

    it('configures the disjunctiveFacets', () => {
      expect(widget.getConfiguration()).toEqual({disjunctiveFacets: ['aNumAttr']});
    });

    it('calls twice ReactDOM.render(<Slider props />, container)', () => {
      widget.render({results, helper});
      widget.render({results, helper});

      const props = {
        cssClasses: {
          root: 'ais-range-slider root cx',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer',
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
          useCustomCompileOptions: {footer: false, header: false},
        },
        format: {to: () => {}, from: () => {}},
        tooltips: true,
      };

      expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Slider {...props} />);
      expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
      expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Slider {...props} />);
      expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });

    it('doesn\'t call the refinement functions if not refined', () => {
      const state0 = helper.state;
      widget.render({results, helper});
      const state1 = helper.state;
      expect(state1).toEqual(state0);
      expect(helper.search.called).toBe(false, 'search never called');
    });

    it('calls the refinement functions if refined with min+1', () => {
      const stats = results.disjunctiveFacets[0].stats;
      const targetValue = stats.min + 1;

      const state0 = helper.state;
      widget._refine(stats)([targetValue, stats.max]);
      const state1 = helper.state;

      expect(helper.search.callCount).toBe(1);
      expect(state1).toEqual(state0.addNumericRefinement('aNumAttr', '>=', targetValue));
    });

    it('calls the refinement functions if refined with max-1', () => {
      const stats = results.disjunctiveFacets[0].stats;
      const targetValue = stats.max - 1;

      const state0 = helper.state;
      widget._refine(stats)([stats.min, targetValue]);
      const state1 = helper.state;

      expect(helper.search.callCount).toBe(1);
      expect(state1).toEqual(state0.addNumericRefinement('aNumAttr', '<=', targetValue));
    });

    it('calls the refinement functions if refined with min+1 and max-1', () => {
      const stats = results.disjunctiveFacets[0].stats;
      const targetValue = [stats.min + 1, stats.max - 1];

      const state0 = helper.state;
      widget._refine(stats)(targetValue);
      const state1 = helper.state;

      const expectedState = state0.
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
