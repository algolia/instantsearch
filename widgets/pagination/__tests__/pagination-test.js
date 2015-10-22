/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import pagination from '../pagination';
import Pagination from '../../../components/Pagination/Pagination';

describe('pagination()', () => {
  jsdom({useEach: true});

  var ReactDOM;
  var container;
  var widget;
  var results;
  var helper;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    pagination.__Rewire__('ReactDOM', ReactDOM);
    pagination.__Rewire__('autoHideContainer', sinon.stub().returns(Pagination));

    container = document.createElement('div');
    widget = pagination({container, scrollTo: false});
    results = {hits: [{first: 'hit', second: 'hit'}], nbHits: 200, hitsPerPage: 10, nbPages: 20};
    helper = {
      setCurrentPage: sinon.spy(),
      search: sinon.spy()
    };
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('sets the page', () => {
    widget.setCurrentPage(helper, 42);
    expect(helper.setCurrentPage.calledOnce).toBe(true);
    expect(helper.search.calledOnce).toBe(true);
  });

  it('calls ReactDOM.render(<Pagination props />, container)', () => {
    widget.render({results, helper});

    expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Pagination {...getProps()} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
  });

  context('mocking getContainerNode', function() {
    var scrollIntoView;

    beforeEach(() => {
      scrollIntoView = sinon.spy();
      var utils = {
        getContainerNode: sinon.stub().returns({
          scrollIntoView: scrollIntoView
        })
      };
      pagination.__Rewire__('utils', utils);
    });

    it('should not scroll', () => {
      widget = pagination({container, scrollTo: false});
      widget.setCurrentPage(helper, 2);
      expect(scrollIntoView.calledOnce).toBe(false, 'scrollIntoView never called');
    });

    it('should scroll to body', () => {
      widget = pagination({container});
      widget.setCurrentPage(helper, 2);
      expect(scrollIntoView.calledOnce).toBe(true, 'scrollIntoView called once');
    });

    afterEach(() => {
      pagination.__ResetDependency__('utils');
    });
  });

  afterEach(() => {
    pagination.__ResetDependency__('ReactDOM');
    pagination.__ResetDependency__('autoHideContainer');
  });

  function getProps(extraProps = {}) {
    return {
      cssClasses: {},
      currentPage: 0,
      hasResults: true,
      hideContainerWhenNoResults: true,
      labels: {first: '«', last: '»', next: '›', previous: '‹'},
      nbHits: results.nbHits,
      nbPages: results.nbPages,
      padding: 3,
      setCurrentPage: () => {},
      showFirstLast: true,
      createURL: () => '#',
      ...extraProps
    };
  }
});
