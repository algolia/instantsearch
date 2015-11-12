/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import indexSelector from '../index-selector';
import Selector from '../../../components/Selector';

describe('indexSelector call', () => {
  jsdom({useEach: true});

  it('throws an exception when no options', () => {
    const container = document.createElement('div');
    expect(indexSelector.bind(null, {container})).toThrow(/^Usage/);
  });

  it('throws an exception when no indices', () => {
    const indices = [];
    expect(indexSelector.bind(null, {indices})).toThrow(/^Usage/);
  });
});

describe('indexSelector()', () => {
  jsdom({useEach: true});

  let ReactDOM;
  let container;
  let indices;
  let cssClasses;
  let widget;
  let props;
  let helper;
  let results;
  let autoHideContainer;

  beforeEach(() => {
    autoHideContainer = sinon.stub().returns(Selector);
    ReactDOM = {render: sinon.spy()};

    indexSelector.__Rewire__('ReactDOM', ReactDOM);
    indexSelector.__Rewire__('autoHideContainerHOC', autoHideContainer);

    container = document.createElement('div');
    indices = [
      {name: 'index-a', label: 'Index A'},
      {name: 'index-b', label: 'Index B'}
    ];
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
      hits: [],
      nbHits: 0
    };
  });

  it('doesn\'t configure anything', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', () => {
    widget.render({helper, results});
    widget.render({helper, results});
    props = {
      cssClasses: {
        root: 'ais-index-selector custom-root',
        item: 'ais-index-selector--item custom-item'
      },
      currentValue: 'index-a',
      shouldAutoHideContainer: true,
      options: [
        {value: 'index-a', label: 'Index A'},
        {value: 'index-b', label: 'Index B'}
      ],
      setValue: () => {}
    };
    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Selector {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Selector {...props} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('sets the underlying index', () => {
    widget.setIndex(helper, 'index-b');
    expect(helper.setIndex.calledOnce).toBe(true, 'setIndex called once');
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('should throw if there is no name attribute in a passed object', () => {
    indices.length = 0;
    indices.push({label: 'Label without a name'});
    expect(() => {
      widget.init(null, helper);
    }).toThrow(/Index index-a not present/);
  });

  it('must include the current index at initialization time', () => {
    helper.getIndex = sinon.stub().returns('non-existing-index');
    expect(() => {
      widget.init(null, helper);
    }).toThrow(/Index non-existing-index not present/);
  });

  afterEach(() => {
    indexSelector.__ResetDependency__('ReactDOM');
    indexSelector.__ResetDependency__('autoHideContainerHOC');
  });
});
