import { render as preactRender } from 'preact';
import utilsGetContainerNode from '../../../lib/utils/getContainerNode';
import pagination, {
  PaginationCSSClasses,
  PaginationWidgetParams,
} from '../pagination';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import { createSearchClient } from '../../../../test/mock/createSearchClient';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

const getContainerNode = castToJestMock(utilsGetContainerNode);
jest.mock('../../../lib/utils/getContainerNode', () => {
  const module = jest.requireActual('../../../lib/utils/getContainerNode');

  const _getContainerNode = module.default;
  module.default = jest.fn((...args) => _getContainerNode(...args));

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-expect-error
      pagination({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/pagination/js/"
`);
  });
});

describe('pagination()', () => {
  let widget: ReturnType<typeof pagination>;
  let container: HTMLElement;
  let helper;
  let results;
  let cssClasses: PaginationCSSClasses;

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
    widget.init!(createInitOptions({ helper }));
  });

  it('sets the page', () => {
    widget.getWidgetRenderState(createInitOptions({ helper })).refine(42);
    expect(helper.setPage).toHaveBeenCalledTimes(1);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('calls twice render(<Pagination props />, container)', () => {
    const { state } = algoliasearchHelper(createSearchClient(), '', {
      page: 0,
    });

    widget.render!(
      createRenderOptions({
        results,
        helper,
        state,
      })
    );
    widget.render!(
      createRenderOptions({
        results,
        helper,
        state,
      })
    );

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    // @ts-expect-error
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    // @ts-expect-error
    expect(secondRender[0].props).toMatchSnapshot();
    expect(secondRender[1]).toEqual(container);
  });

  describe('mocking getContainerNode', () => {
    let scrollIntoView: jest.Mock;

    beforeEach(() => {
      scrollIntoView = jest.fn();
    });

    it('should not scroll', () => {
      widget = pagination({ container, scrollTo: false });
      widget.init!(createInitOptions({ helper }));
      widget.getWidgetRenderState(createInitOptions({ helper })).refine(2);
      expect(scrollIntoView).toHaveBeenCalledTimes(0);
    });

    it('should scrollto body', () => {
      const { state } = algoliasearchHelper(createSearchClient(), '', {
        page: 0,
      });

      // @ts-expect-error
      getContainerNode.mockImplementation(input =>
        input === 'body' ? { scrollIntoView } : input
      );

      widget = pagination({ container });

      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({
          results,
          helper,
          state,
        })
      );

      const [firstRender] = render.mock.calls;

      // @ts-expect-error
      firstRender[0].props.setCurrentPage(2);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });
});

describe('pagination MaxPage', () => {
  let widget: ReturnType<typeof pagination>;
  let container: HTMLElement;
  let results;
  let cssClasses: PaginationCSSClasses;
  let paginationOptions: PaginationWidgetParams;

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
    results = new SearchResults(new SearchParameters(), [
      createSingleSearchResponse({
        hits: [{ objectID: 'lol' }],
        nbHits: 300,
        hitsPerPage: 10,
        nbPages: 30,
      }),
    ]);
    paginationOptions = { container, scrollTo: false, cssClasses };
  });

  it('does to have any default', () => {
    widget = pagination(paginationOptions);

    expect(
      widget.getWidgetRenderState(
        createRenderOptions({
          results,
        })
      ).nbPages
    ).toEqual(30);
  });

  it('does reduce the number of pages if lower than nbPages', () => {
    paginationOptions.totalPages = 20;
    widget = pagination(paginationOptions);

    expect(
      widget.getWidgetRenderState(
        createRenderOptions({
          results,
        })
      ).nbPages
    ).toEqual(20);
  });

  it('does not reduce the number of pages if greater than nbPages', () => {
    paginationOptions.totalPages = 40;
    widget = pagination(paginationOptions);

    expect(
      widget.getWidgetRenderState(
        createRenderOptions({
          results,
        })
      ).nbPages
    ).toEqual(30);
  });
});
