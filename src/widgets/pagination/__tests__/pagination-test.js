import { render } from 'preact-compat';
import { getContainerNode } from '../../../lib/utils';
import pagination from '../pagination';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

jest.mock('../../../lib/utils', () => {
  const module = require.requireActual('../../../lib/utils');

  const _getContainerNode = module.getContainerNode;
  module.getContainerNode = jest.fn((...args) => _getContainerNode(...args));

  return module;
});

describe('pagination call', () => {
  it('throws an exception when no container', () => {
    expect(pagination.bind(null)).toThrow(/^Usage/);
  });
});

describe('pagination()', () => {
  let container;
  let widget;
  let results;
  let helper;
  let cssClasses;

  beforeEach(() => {
    render.mockClear();
    getContainerNode.mockClear();

    container = document.createElement('div');
    cssClasses = {
      root: ['root', 'customRoot'],
      noRefinementRoot: 'noRefinementRoot',
      list: 'list',
      item: 'item',
      firstPageItem: 'firstPageItem',
      lastPageItem: 'lastPageItem',
      previousPageItem: 'previousPageItem',
      nextPageItem: 'nextPageItem',
      pageItem: 'pageItem',
      selectedItem: 'selectedItem',
      disabledItem: 'disabledItem',
      link: 'link',
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

  it('calls twice render(<Pagination props />, container)', () => {
    widget.render({ results, helper, state: { page: 0 } });
    widget.render({ results, helper, state: { page: 0 } });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render.mock.calls[0][0]).toMatchSnapshot();
    expect(render.mock.calls[0][1]).toEqual(container);
    expect(render.mock.calls[1][0]).toMatchSnapshot();
    expect(render.mock.calls[1][1]).toEqual(container);
  });

  describe('mocking getContainerNode', () => {
    let scrollIntoView;

    beforeEach(() => {
      scrollIntoView = jest.fn();
    });

    it('should not scroll', () => {
      widget = pagination({ container, scrollTo: false });
      widget.init({ helper });
      widget.refine(helper, 2);
      expect(scrollIntoView).toHaveBeenCalledTimes(0);
    });

    it('should scroll to body', () => {
      getContainerNode.mockImplementation(input =>
        input === 'body' ? { scrollIntoView } : input
      );

      widget = pagination({ container });
      widget.init({ helper });
      widget.render({ results, helper, state: { page: 0 } });
      const { props } = render.mock.calls[0][0];
      props.setCurrentPage(2);
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });
});

describe('pagination MaxPage', () => {
  let container;
  let widget;
  let results;
  let cssClasses;
  let paginationOptions;

  beforeEach(() => {
    container = document.createElement('div');
    cssClasses = {
      root: 'root',
      noRefinementRoot: 'noRefinementRoot',
      list: 'list',
      item: 'item',
      firstPageItem: 'firstPageItem',
      lastPageItem: 'lastPageItem',
      previousPageItem: 'previousPageItem',
      nextPageItem: 'nextPageItem',
      pageItem: 'pageItem',
      selectedItem: 'selectedItem',
      disabledItem: 'disabledItem',
      link: 'link',
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

  it('does reduce the number of pages if lower than nbPages', () => {
    paginationOptions.totalPages = 20;
    widget = pagination(paginationOptions);
    expect(widget.getMaxPage(results)).toEqual(20);
  });

  it('does not reduce the number of pages if greater than nbPages', () => {
    paginationOptions.totalPages = 40;
    widget = pagination(paginationOptions);
    expect(widget.getMaxPage(results)).toEqual(30);
  });
});
