/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'jsdom-global';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import hitsPerPageSelector from '../hits-per-page-selector';
import Selector from '../../../components/Selector';

describe('hitsPerPageSelector call', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  it('throws an exception when no options', () => {
    const container = document.createElement('div');
    expect(hitsPerPageSelector.bind(null, {container})).toThrow(/^Usage:/);
  });

  it('throws an exception when no container', () => {
    const options = {a: {value: 'value', label: 'My value'}};
    expect(hitsPerPageSelector.bind(null, {options})).toThrow(/^Usage:/);
  });
});

describe('hitsPerPageSelector()', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  let ReactDOM;
  let container;
  let options;
  let cssClasses;
  let widget;
  let props;
  let helper;
  let results;
  let autoHideContainer;
  let consoleLog;

  beforeEach(() => {
    autoHideContainer = sinon.stub().returns(Selector);
    ReactDOM = {render: sinon.spy()};

    hitsPerPageSelector.__Rewire__('ReactDOM', ReactDOM);
    hitsPerPageSelector.__Rewire__('autoHideContainerHOC', autoHideContainer);
    consoleLog = sinon.spy(window.console, 'log');

    container = document.createElement('div');
    options = [
      {value: 10, label: '10 results'},
      {value: 20, label: '20 results'}
    ];
    cssClasses = {
      root: 'custom-root',
      item: 'custom-item'
    };
    widget = hitsPerPageSelector({container, options, cssClasses});
    helper = {
      state: {
        hitsPerPage: 20
      },
      setQueryParameter: sinon.spy(),
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
        root: 'ais-hits-per-page-selector custom-root',
        item: 'ais-hits-per-page-selector--item custom-item'
      },
      currentValue: 20,
      shouldAutoHideContainer: true,
      options: [
        {value: 10, label: '10 results'},
        {value: 20, label: '20 results'}
      ],
      setValue: () => {}
    };
    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Selector {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Selector {...props} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('sets the underlying hitsPerPage', () => {
    widget.setHitsPerPage(helper, helper.state, 10);
    expect(helper.setQueryParameter.calledOnce).toBe(true, 'setQueryParameter called once');
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('should throw if there is no name attribute in a passed object', () => {
    options.length = 0;
    options.push({label: 'Label without a value'});
    widget.init({state: helper.state, helper});
    expect(consoleLog.calledOnce).toBe(true, 'console.log called once');
    expect(consoleLog.firstCall.args[0]).
      toMatch(/No option in `options` with `value: hitsPerPage` \(hitsPerPage: 20\)/);
  });

  it('must include the current hitsPerPage at initialization time', () => {
    helper.state.hitsPerPage = -1;
    widget.init({state: helper.state, helper});
    expect(consoleLog.calledOnce).toBe(true, 'console.log called once');
    expect(consoleLog.firstCall.args[0]).
      toMatch(/No option in `options` with `value: hitsPerPage` \(hitsPerPage: -1\)/);
  });

  it('should not throw an error if state does not have a `hitsPerPage`', () => {
    delete helper.state.hitsPerPage;
    expect(() => {
      widget.init({state: helper.state, helper});
    }).toNotThrow(/No option in `options`/);
  });

  afterEach(() => {
    hitsPerPageSelector.__ResetDependency__('ReactDOM');
    hitsPerPageSelector.__ResetDependency__('autoHideContainerHOC');
    consoleLog.restore();
  });
});
