/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import hitsPerPageSelector from '../hits-per-page-selector';
import Selector from '../../../components/Selector';

describe('hitsPerPageSelector()', () => {
  jsdom({useEach: true});

  var ReactDOM;
  var container;
  var options;
  var cssClasses;
  var widget;
  var props;
  var helper;
  var results;
  var autoHideContainer;

  beforeEach(() => {
    autoHideContainer = sinon.stub().returns(Selector);
    ReactDOM = {render: sinon.spy()};

    hitsPerPageSelector.__Rewire__('ReactDOM', ReactDOM);
    hitsPerPageSelector.__Rewire__('autoHideContainer', autoHideContainer);

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

  it('calls ReactDOM.render(<Selector props />, container)', () => {
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
    expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Selector {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
  });

  it('sets the underlying hitsPerPage', () => {
    widget.setHitsPerPage(helper, helper.state, 10);
    expect(helper.setQueryParameter.calledOnce).toBe(true, 'setQueryParameter called once');
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('should throw if there is no name attribute in a passed object', () => {
    options.length = 0;
    options.push({label: 'Label without a value'});
    expect(() => {
      widget.init(helper.state, helper);
    }).toThrow(/No option in `options` with `value: 20`/);
  });

  it('must include the current hitsPerPage at initialization time', () => {
    helper.state.hitsPerPage = -1;
    expect(() => {
      widget.init(helper.state, helper);
    }).toThrow(/No option in `options` with `value: -1`/);
  });

  afterEach(() => {
    hitsPerPageSelector.__ResetDependency__('ReactDOM');
    hitsPerPageSelector.__ResetDependency__('autoHideContainer');
  });
});
