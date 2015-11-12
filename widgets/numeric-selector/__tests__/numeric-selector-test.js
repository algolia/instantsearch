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
  let props;
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
    props = {
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
    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Selector {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Selector {...props} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('sets the underlying numeric refinement', () => {
    widget._refine(helper, 2);
    expect(helper.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('cancles the underying numeric refinement', () => {
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
