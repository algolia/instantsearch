/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import indexSelector from '../index-selector';
import IndexSelector from '../../../components/IndexSelector';

describe('indexSelector()', () => {
  jsdom({useEach: true});

  var ReactDOM;
  var container;
  var indices;
  var cssClasses;
  var widget;
  var props;
  var helper;
  var results;
  var autoHideContainer;

  beforeEach(() => {
    autoHideContainer = sinon.stub().returns(IndexSelector);

    ReactDOM = {render: sinon.spy()};
    indexSelector.__Rewire__('ReactDOM', ReactDOM);
    indexSelector.__Rewire__('autoHideContainer', autoHideContainer);

    container = document.createElement('div');
    indices = ['index-a', 'index-b'];
    cssClasses = {
      root: 'custom-root',
      item: 'custom-item'
    };
    widget = indexSelector({container, indices, cssClasses});
    helper = {
      getIndex: sinon.stub().returns('index-a'),
      setIndex: sinon.spy(),
      search: sinon.spy()
    };
    results = {
      hits: []
    };
  });

  it('doesn\'t configure anything', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls ReactDOM.render(<IndexSelector props />, container)', () => {
    widget.render({helper, results});
    props = {
      cssClasses: {
        root: 'ais-index-selector custom-root',
        item: 'ais-index-selector--item custom-item'
      },
      currentIndex: 'index-a',
      hasResults: false,
      hideContainerWhenNoResults: false,
      indices: ['index-a', 'index-b'],
      setIndex: () => {}
    };
    expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<IndexSelector {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
  });

  it('sets the underlying index', () => {
    widget.setIndex(helper, 'index-b');
    expect(helper.setIndex.calledOnce).toBe(true, 'setIndex called once');
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('must include the current index at initialization time', () => {
    helper.getIndex = sinon.stub().returns('non-existing-index');
    expect(() => {
      widget.init(null, helper);
    }).toThrow(/Index non-existing-index not present/);
  });

  afterEach(() => {
    indexSelector.__ResetDependency__('ReactDOM');
    indexSelector.__ResetDependency__('autoHideContainer');
  });
});
