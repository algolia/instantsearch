import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import numericSelector from '../numeric-selector';
import Selector from '../../../components/Selector';

describe('numericSelector()', () => {
  let ReactDOM;
  let container;
  let options;
  let cssClasses;
  let widget;
  let expectedProps;
  let helper;
  let results;

  beforeEach(() => {
    ReactDOM = { render: sinon.spy() };

    numericSelector.__Rewire__('ReactDOM', ReactDOM);

    container = document.createElement('div');
    options = [{ value: 1, label: 'first' }, { value: 2, label: 'second' }];
    cssClasses = {
      root: ['custom-root', 'cx'],
      item: 'custom-item',
    };
    widget = numericSelector({
      container,
      options,
      attributeName: 'aNumAttr',
      cssClasses,
    });
    expectedProps = {
      shouldAutoHideContainer: false,
      cssClasses: {
        root: 'ais-numeric-selector custom-root cx',
        item: 'ais-numeric-selector--item custom-item',
      },
      currentValue: 1,
      options: [{ value: 1, label: 'first' }, { value: 2, label: 'second' }],
      setValue: () => {},
    };
    helper = {
      addNumericRefinement: sinon.spy(),
      clearRefinements: sinon.spy(),
      search: sinon.spy(),
    };
    results = {
      hits: [],
      nbHits: 0,
    };
    widget.init({ helper });
    helper.addNumericRefinement.reset();
  });

  it('configures the right numericRefinement', () => {
    expect(widget.getConfiguration({}, {})).toEqual({
      numericRefinements: {
        aNumAttr: {
          '=': [1],
        },
      },
    });
  });

  it('configures the right numericRefinement when present in the url', () => {
    const urlState = {
      numericRefinements: {
        aNumAttr: {
          '=': [2],
        },
      },
    };
    expect(widget.getConfiguration({}, urlState)).toEqual({
      numericRefinements: {
        aNumAttr: {
          '=': [2],
        },
      },
    });
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', () => {
    widget.render({ helper, results, state: helper.state });
    widget.render({ helper, results, state: helper.state });

    expect(ReactDOM.render.calledTwice).toBe(
      true,
      'ReactDOM.render called twice'
    );
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
      <Selector {...expectedProps} />
    );
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(
      <Selector {...expectedProps} />
    );
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('computes refined values and pass them to <Selector props />', () => {
    helper.state = {
      numericRefinements: {
        aNumAttr: {
          '=': [20],
        },
      },
    };
    expectedProps.currentValue = 20;
    widget.render({ helper, results, state: helper.state });
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
      <Selector {...expectedProps} />
    );
  });

  it('sets the underlying numeric refinement', () => {
    widget._refine(2);
    expect(helper.addNumericRefinement.calledOnce).toBe(
      true,
      'addNumericRefinement called once'
    );
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('cancels the underlying numeric refinement', () => {
    widget._refine(undefined);
    expect(helper.clearRefinements.calledOnce).toBe(
      true,
      'clearRefinements called once'
    );
    expect(helper.addNumericRefinement.called).toBe(
      false,
      'addNumericRefinement never called'
    );
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  afterEach(() => {
    numericSelector.__ResetDependency__('ReactDOM');
  });
});
