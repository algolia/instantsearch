/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import stats from '../stats';
import Stats from '../../../components/Stats/Stats';

describe('stats()', () => {
  jsdom();

  var ReactDOM;
  var container;
  var widget;
  var results;

  var autoHide;
  var headerFooter;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    stats.__Rewire__('ReactDOM', ReactDOM);
    autoHide = sinon.stub().returns(Stats);
    stats.__Rewire__('autoHide', autoHide);
    headerFooter = sinon.stub().returns(Stats);
    stats.__Rewire__('headerFooter', headerFooter);

    container = document.createElement('div');
    widget = stats({container});
    results = {
      hits: [{}, {}],
      nbHits: 20,
      page: 0,
      nbPages: 10,
      hitsPerPage: 2,
      processingTimeMS: 42,
      query: 'a query'
    };
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls ReactDOM.render(<Stats props />, container)', () => {
    widget.render({results});
    expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
    expect(autoHide.calledOnce).toBe(true, 'autoHide called once');
    expect(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
    <Stats
      cssClasses={{
        body: 'ais-stats--body',
        header: 'ais-stats--header',
        footer: 'ais-stats--footer',
        root: 'ais-stats',
        time: 'ais-stats--time'
      }}
      hasResults={true}
      hideWhenNoResults={true}
      hitsPerPage={2}
      nbHits={20}
      nbPages={10}
      page={0}
      processingTimeMS={42}
      query="a query"
      templateProps={ReactDOM.render.firstCall.args[0].props.templateProps}
    />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
  });

  afterEach(() => {
    stats.__ResetDependency__('ReactDOM');
    stats.__ResetDependency__('autoHide');
    stats.__ResetDependency__('headerFooter');
  });
});
