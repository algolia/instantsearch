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

  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;
  let cssClasses;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    pagination.__Rewire__('ReactDOM', ReactDOM);
    pagination.__Rewire__('autoHideContainer', sinon.stub().returns(Pagination));

    container = document.createElement('div');
    cssClasses = {
      root: 'root',
      item: 'item',
      page: 'page',
      previous: 'previous',
      next: 'next',
      first: 'first',
      last: 'last',
      active: 'active',
      disabled: 'disabled'
    };
    widget = pagination({container, scrollTo: false, cssClasses});
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

  it('calls twice ReactDOM.render(<Pagination props />, container)', () => {
    widget.render({results, helper});
    widget.render({results, helper});

    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Pagination {...getProps()} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Pagination {...getProps()} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  context('mocking getContainerNode', function() {
    let scrollIntoView;

    beforeEach(() => {
      scrollIntoView = sinon.spy();
      let utils = {
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

  function getProps() {
    return {
      cssClasses: {
        root: 'ais-pagination root',
        item: 'ais-pagination--item item',
        page: 'ais-pagination--item ais-pagination--item-page page',
        previous: 'ais-pagination--item ais-pagination--item-previous previous',
        next: 'ais-pagination--item ais-pagination--item-next next',
        first: 'ais-pagination--item ais-pagination--item-first first',
        last: 'ais-pagination--item ais-pagination--item-last last',
        active: 'ais-pagination--item  ais-pagination--item-page ais-pagination--item-page__active active',
        disabled: 'ais-pagination--item ais-pagination--item__disabled disabled'
      },
      currentPage: 0,
      shouldAutoHideContainer: false,
      labels: {first: '«', last: '»', next: '›', previous: '‹'},
      nbHits: results.nbHits,
      nbPages: results.nbPages,
      padding: 3,
      setCurrentPage: () => {},
      showFirstLast: true,
      createURL: () => '#'
    };
  }
});
