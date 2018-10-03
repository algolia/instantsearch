import expect from 'expect';
import pagination from '../pagination';

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
    ReactDOM = { render: jest.fn() };
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
      setPage: jest.fn(),
      search: jest.fn(),
      getPage: () => 0,
    };
    widget.init({ helper });
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('sets the page', () => {
    widget.refine(helper, 42);
    expect(helper.setPage).toHaveBeenCalledTimes(1);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('calls twice ReactDOM.render(<Pagination props />, container)', () => {
    widget.render({ results, helper, state: { page: 0 } });
    widget.render({ results, helper, state: { page: 0 } });

    expect(ReactDOM.render).toHaveBeenCalledTimes(2);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
    expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
  });

  describe('mocking getContainerNode', () => {
    let scrollIntoView;

    beforeEach(() => {
      scrollIntoView = jest.fn();
      const getContainerNode = jest.fn().mockReturnValue({
        scrollIntoView,
      });
      pagination.__Rewire__('getContainerNode', getContainerNode);
    });

    it('should not scroll', () => {
      widget = pagination({ container, scrollTo: false });
      widget.init({ helper });
      widget.refine(helper, 2);
      expect(scrollIntoView).toHaveBeenCalledTimes(0);
    });

    it('should scroll to body', () => {
      widget = pagination({ container });
      widget.init({ helper });
      widget.render({ results, helper, state: { page: 0 } });
      const { props: { setCurrentPage } } = ReactDOM.render.mock.calls[0][0];
      setCurrentPage(2);
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      pagination.__ResetDependency__('utils');
    });
  });

  afterEach(() => {
    pagination.__ResetDependency__('render');
  });
});

describe('pagination MaxPage', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;
  let cssClasses;
  let paginationOptions;

  beforeEach(() => {
    ReactDOM = { render: jest.fn() };
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
