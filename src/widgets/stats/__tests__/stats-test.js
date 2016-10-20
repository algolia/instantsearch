/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import stats from '../stats';
import Stats from '../../../components/Stats/Stats';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('stats call', () => {
  it('should throw when called without container', () => {
    expect(() => stats()).toThrow(/^Usage:/);
  });
});

describe('stats()', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;

  let autoHideContainer;
  let headerFooter;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    stats.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = sinon.stub().returns(Stats);
    stats.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = sinon.stub().returns(Stats);
    stats.__Rewire__('headerFooterHOC', headerFooter);

    container = document.createElement('div');
    widget = stats({container, cssClasses: {body: ['body', 'cx']}});
    results = {
      hits: [{}, {}],
      nbHits: 20,
      page: 0,
      nbPages: 10,
      hitsPerPage: 2,
      processingTimeMS: 42,
      query: 'a query',
    };
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Stats props />, container)', () => {
    widget.render({results});
    widget.render({results});
    const props = {
      cssClasses: {
        body: 'ais-stats--body body cx',
        header: 'ais-stats--header',
        footer: 'ais-stats--footer',
        root: 'ais-stats',
        time: 'ais-stats--time',
      },
      collapsible: false,
      hitsPerPage: 2,
      nbHits: 20,
      nbPages: 10,
      page: 0,
      processingTimeMS: 42,
      query: 'a query',
      shouldAutoHideContainer: false,
      templateProps: ReactDOM.render.firstCall.args[0].props.templateProps,
    };
    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
    expect(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Stats {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Stats {...props} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  afterEach(() => {
    stats.__ResetDependency__('ReactDOM');
    stats.__ResetDependency__('autoHideContainerHOC');
    stats.__ResetDependency__('headerFooterHOC');
  });
});
