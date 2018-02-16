import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import pagination from '../pagination';
import Pagination from '../../../components/Pagination/Pagination';
import Paginator from '../../../connectors/pagination/Paginator';

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
    ReactDOM = { render: sinon.spy() };
    pagination.__Rewire__('render', ReactDOM.render);

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
    widget = pagination({ container, scrollTo: false, cssClasses });
    results = {
      hits: [{ first: 'hit', second: 'hit' }],
      nbHits: 200,
      hitsPerPage: 10,
      nbPages: 20,
    };
    helper = {
      setPage: sinon.spy(),
      search: sinon.spy(),
      getPage: () => 0,
    };
    widget.init({ helper });
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('sets the page', () => {
    widget.refine(helper, 42);
    expect(helper.setPage.calledOnce).toBe(true);
    expect(helper.search.calledOnce).toBe(true);
  });

  it('calls twice ReactDOM.render(<Pagination props />, container)', () => {
    widget.render({ results, helper, state: { page: 0 } });
    widget.render({ results, helper, state: { page: 0 } });

    expect(ReactDOM.render.calledTwice).toBe(
      true,
      'ReactDOM.render called twice'
    );
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
      <Pagination {...getProps()} />
    );
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(
      <Pagination {...getProps()} />
    );
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  describe('mocking getContainerNode', () => {
    let scrollIntoView;

    beforeEach(() => {
      scrollIntoView = sinon.spy();
      const getContainerNode = sinon.stub().returns({
        scrollIntoView,
      });
      pagination.__Rewire__('getContainerNode', getContainerNode);
    });

    it('should not scroll', () => {
      widget = pagination({ container, scrollTo: false });
      widget.init({ helper });
      widget.refine(helper, 2);
      expect(scrollIntoView.calledOnce).toBe(
        false,
        'scrollIntoView never called'
      );
    });

    it('should scroll to body', () => {
      widget = pagination({ container });
      widget.init({ helper });
      widget.render({ results, helper, state: { page: 0 } });
      const { props: { setCurrentPage } } = ReactDOM.render.firstCall.args[0];
      setCurrentPage(2);
      expect(scrollIntoView.calledOnce).toBe(
        true,
        'scrollIntoView called once'
      );
    });

    afterEach(() => {
      pagination.__ResetDependency__('utils');
    });
  });

  afterEach(() => {
    pagination.__ResetDependency__('render');
    pagination.__ResetDependency__('autoHideContainerHOC');
  });

  function getProps() {
    const pager = new Paginator({
      currentPage: 0,
      total: 20,
      padding: 3,
    });
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
      labels: { first: '«', last: '»', next: '›', previous: '‹' },
      nbHits: results.nbHits,
      nbPages: results.nbPages,
      pages: pager.pages(),
      isFirstPage: pager.isFirstPage(),
      isLastPage: pager.isLastPage(),
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
    ReactDOM = { render: sinon.spy() };
    pagination.__Rewire__('render', ReactDOM.render);

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
    results = {
      hits: [{ first: 'hit', second: 'hit' }],
      nbHits: 300,
      hitsPerPage: 10,
      nbPages: 30,
    };
    paginationOptions = { container, scrollTo: false, cssClasses };
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
