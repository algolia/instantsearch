/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import pagination from '../pagination';
import Pagination from '../../../components/Pagination/Pagination';
import connectPagination from '../../../connectors/pagination/connectPagination.js';

describe('pagination call', () => {
  it('throws an exception when no container', () => {
    expect(pagination.bind(null)).toThrow(/^Usage/);
  });
});
describe('pagination()', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;
  let cssClasses;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    pagination.__Rewire__('ReactDOM', ReactDOM);

    container = document.createElement('div');
    cssClasses = {
      root: ['root', 'cx'],
      item: 'item',
      link: 'link',
      page: 'page',
      previous: 'previous',
      next: 'next',
      first: 'first',
      last: 'last',
      active: 'active',
      disabled: 'disabled',
    };
    widget = pagination({container, scrollTo: false, cssClasses});
    results = {hits: [{first: 'hit', second: 'hit'}], nbHits: 200, hitsPerPage: 10, nbPages: 20};
    helper = {
      setCurrentPage: sinon.spy(),
      search: sinon.spy(),
      getPage: () => 0,
    };
    widget.init({helper});
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

  context('mocking getContainerNode', () => {
    let scrollIntoView;

    beforeEach(() => {
      scrollIntoView = sinon.spy();
      const getContainerNode = sinon.stub().returns({
        scrollIntoView,
      });
      connectPagination.__Rewire__('getContainerNode', getContainerNode);
    });

    it('should not scroll', () => {
      widget = pagination({container, scrollTo: false});
      widget.init({helper});
      widget.setCurrentPage(helper, 2);
      expect(scrollIntoView.calledOnce).toBe(false, 'scrollIntoView never called');
    });

    it('should scroll to body', () => {
      widget = pagination({container});
      widget.init({helper});
      widget.setCurrentPage(helper, 2);
      expect(scrollIntoView.calledOnce).toBe(true, 'scrollIntoView called once');
    });

    afterEach(() => {
      pagination.__ResetDependency__('utils');
    });
  });

  afterEach(() => {
    pagination.__ResetDependency__('ReactDOM');
    pagination.__ResetDependency__('autoHideContainerHOC');
  });

  function getProps() {
    return {
      cssClasses: {
        root: 'ais-pagination root cx',
        item: 'ais-pagination--item item',
        link: 'ais-pagination--link link',
        page: 'ais-pagination--item__page page',
        previous: 'ais-pagination--item__previous previous',
        next: 'ais-pagination--item__next next',
        first: 'ais-pagination--item__first first',
        last: 'ais-pagination--item__last last',
        active: 'ais-pagination--item__active active',
        disabled: 'ais-pagination--item__disabled disabled',
      },
      currentPage: 0,
      shouldAutoHideContainer: false,
      labels: {first: '«', last: '»', next: '›', previous: '‹'},
      nbHits: results.nbHits,
      nbPages: results.nbPages,
      padding: 3,
      setCurrentPage: () => {},
      showFirstLast: true,
      createURL: () => '#',
    };
  }
});

describe('pagination MaxPage', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;
  let cssClasses;
  let paginationOptions;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    pagination.__Rewire__('ReactDOM', ReactDOM);

    container = document.createElement('div');
    cssClasses = {
      root: 'root',
      item: 'item',
      link: 'link',
      page: 'page',
      previous: 'previous',
      next: 'next',
      first: 'first',
      last: 'last',
      active: 'active',
      disabled: 'disabled',
    };
    results = {hits: [{first: 'hit', second: 'hit'}], nbHits: 300, hitsPerPage: 10, nbPages: 30};
    paginationOptions = {container, scrollTo: false, cssClasses};
  });

  it('does to have any default', () => {
    widget = pagination(paginationOptions);
    expect(widget.getMaxPage(results)).toEqual(30);
  });

  it('does reduce the number of page if lower than nbPages', () => {
    paginationOptions.maxPages = 20;
    widget = pagination(paginationOptions);
    expect(widget.getMaxPage(results)).toEqual(20);
  });

  it('does not reduce the number of page if greater than nbPages', () => {
    paginationOptions.maxPages = 40;
    widget = pagination(paginationOptions);
    expect(widget.getMaxPage(results)).toEqual(30);
  });
});
