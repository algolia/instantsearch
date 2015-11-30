/* eslint-env mocha */

import React from 'react';

import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import clearAll from '../clear-all';
import ClearAll from '../../../components/ClearAll/ClearAll';

describe('clearAll()', () => {
  jsdom({useEach: true});

  let ReactDOM;
  let container;
  let widget;
  let props;
  let results;
  let helper;
  let autoHideContainerHOC;
  let headerFooterHOC;
  let createURL;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    autoHideContainerHOC = sinon.stub().returns(ClearAll);
    headerFooterHOC = sinon.stub().returns(ClearAll);
    createURL = sinon.stub().returns('#all-cleared');

    clearAll.__Rewire__('ReactDOM', ReactDOM);
    clearAll.__Rewire__('autoHideContainerHOC', autoHideContainerHOC);
    clearAll.__Rewire__('headerFooterHOC', headerFooterHOC);

    container = document.createElement('div');
    widget = clearAll({container, autoHideContainer: true});

    results = {};
    helper = {
      state: {
        clearRefinements: sinon.stub().returnsThis(),
        clearTags: sinon.stub().returnsThis()
      },
      search: sinon.spy()
    };

    props = {
      clearAll: sinon.spy(),
      cssClasses: {
        root: 'ais-clear-all',
        header: 'ais-clear-all--header',
        body: 'ais-clear-all--body',
        footer: 'ais-clear-all--footer',
        link: 'ais-clear-all--link'
      },
      hasRefinements: false,
      shouldAutoHideContainer: true,
      templateProps: {
        templates: require('../defaultTemplates'),
        templatesConfig: undefined,
        transformData: undefined,
        useCustomCompileOptions: {header: false, footer: false, link: false}
      },
      url: '#all-cleared'
    };
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls the decorators', () => {
    widget.render({results, helper, state: helper.state, createURL});
    expect(headerFooterHOC.calledOnce).toBe(true);
    expect(autoHideContainerHOC.calledOnce).toBe(true);
  });

  context('without refinements', () => {
    beforeEach(() => {
      helper.state.facetsRefinements = {};
      props.hasRefinements = false;
      props.shouldAutoHideContainer = true;
    });

    it('calls twice ReactDOM.render(<ClearAll props />, container)', () => {
      widget.render({results, helper, state: helper.state, createURL});
      widget.render({results, helper, state: helper.state, createURL});

      expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<ClearAll {...getProps()} />);
      expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
      expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<ClearAll {...getProps()} />);
      expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });
  });

  context('with refinements', () => {
    beforeEach(() => {
      helper.state.facetsRefinements = ['something'];
      props.hasRefinements = true;
      props.shouldAutoHideContainer = false;
    });

    it('calls twice ReactDOM.render(<ClearAll props />, container)', () => {
      widget.render({results, helper, state: helper.state, createURL});
      widget.render({results, helper, state: helper.state, createURL});

      expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<ClearAll {...getProps()} />);
      expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
      expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<ClearAll {...getProps()} />);
      expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });
  });

  afterEach(() => {
    clearAll.__ResetDependency__('ReactDOM');
    clearAll.__ResetDependency__('defaultTemplates');
  });

  function getProps(extraProps = {}) {
    return {
      ...props,
      ...extraProps
    };
  }
});
