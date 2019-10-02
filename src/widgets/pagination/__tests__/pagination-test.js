import { render } from 'preact';
import getContainerNode from '../../../lib/utils/getContainerNode';
import pagination from '../pagination';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

jest.mock('../../../lib/utils/getContainerNode', () => {
  const module = require.requireActual('../../../lib/utils/getContainerNode');

  const _getContainerNode = module.default;
  module.default = jest.fn((...args) => _getContainerNode(...args));

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      pagination({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/pagination/js/"
`);
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
      state: {},
    };
    widget.init({ helper });
  });

  it('sets the page', () => {
    widget.refine(helper, 42);
    expect(helper.setPage).toHaveBeenCalledTimes(1);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('calls twice render(<Pagination props />, container)', () => {
    widget.render({ results, helper, state: { page: 0 } });
    widget.render({ results, helper, state: { page: 0 } });

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[0].props).toMatchSnapshot();
    expect(secondRender[1]).toEqual(container);
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

      const [firstRender] = render.mock.calls;

      firstRender[0].props.setCurrentPage(2);

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
