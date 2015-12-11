/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import numericSelector from '../numeric-selector';
import Selector from '../../../components/Selector';

describe('numericSelector()', () => {
  jsdom({useEach: true});

  let ReactDOM;
  let container;
  let options;
  let cssClasses;
  let widget;
  let expectedProps;
  let helper;
  let results;
  let autoHideContainer;

  beforeEach(() => {
    autoHideContainer = sinon.stub().returns(Selector);
    ReactDOM = {render: sinon.spy()};

    numericSelector.__Rewire__('ReactDOM', ReactDOM);
    numericSelector.__Rewire__('autoHideContainerHOC', autoHideContainer);

    container = document.createElement('div');
    options = [
      {value: 1, label: 'first'},
      {value: 2, label: 'second'}
    ];
    cssClasses = {
      root: 'custom-root',
      item: 'custom-item'
    };
    widget = numericSelector({container, options, attributeName: 'aNumAttr', cssClasses});
    expectedProps = {
      cssClasses: {
        root: 'ais-numeric-selector custom-root',
        item: 'ais-numeric-selector--item custom-item'
      },
      currentValue: undefined,
      shouldAutoHideContainer: true,
      options: [
        {value: 1, label: 'first'},
        {value: 2, label: 'second'}
      ],
      setValue: () => {}
    };
    helper = {
      addNumericRefinement: sinon.spy(),
      clearRefinements: sinon.spy(),
      getRefinements: sinon.stub().returns([]),
      search: sinon.spy()
    };
    results = {
      hits: [],
      nbHits: 0
    };
  });

  it('doesn\'t configure anything', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', () => {
    widget.render({helper, results, state: helper.state});
    widget.render({helper, results, state: helper.state});

    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Selector {...expectedProps} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Selector {...expectedProps} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('computes refined values and pass them to <Selector props />', () => {
    helper.getRefinements = sinon.stub().returns([{
      operator: '=',
      value: [20]
    }]);
    expectedProps.currentValue = 20;
    widget.render({helper, results, state: helper.state});
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Selector {...expectedProps} />);
  });

  it('sets the underlying numeric refinement', () => {
    widget._refine(helper, 2);
    expect(helper.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('cancels the underlying numeric refinement', () => {
    widget._refine(helper, undefined);
    expect(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.addNumericRefinement.called).toBe(false, 'addNumericRefinement never called');
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  afterEach(() => {
    numericSelector.__ResetDependency__('ReactDOM');
    numericSelector.__ResetDependency__('autoHideContainerHOC');
  });
});
