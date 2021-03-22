import { render as preactRender, VNode } from 'preact';
import algoliasearchHelper from 'algoliasearch-helper';
import { SearchClient } from '../../../types';
import infiniteHits from '../infinite-hits';
import { InfiniteHitsProps } from '../../../components/InfiniteHits/InfiniteHits';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-expect-error
      infiniteHits({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/infinite-hits/js/"
`);
  });
});

describe('infiniteHits()', () => {
  let container;
  let widget;
  let results;
  let helper;

  beforeEach(() => {
    render.mockClear();

    helper = algoliasearchHelper({} as SearchClient, '', {});
    helper.search = jest.fn();

    container = document.createElement('div');
    widget = infiniteHits({
      container,
      escapeHTML: true,
      transformItems: items => items,
      cssClasses: { root: ['root', 'cx'] },
      showPrevious: false,
    });
    widget.init({ helper, instantSearchInstance: {} });
    results = {
      hits: [{ first: 'hit', second: 'hit' }],
      hitsPerPage: 2,
      page: 1,
    };
  });

  it('calls twice render(<Hits props />, container)', () => {
    const state = { page: 0 };
    const instantSearchInstance = createInstantSearch();
    widget.init({ helper, instantSearchInstance });

    widget.render({ results, state });
    widget.render({ results, state });

    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
    const secondRender = render.mock.calls[1][0] as VNode<InfiniteHitsProps>;
    const firstContainer = render.mock.calls[0][1];
    const secondContainer = render.mock.calls[1][1];

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender.props).toMatchSnapshot();
    expect(firstContainer).toEqual(container);
    expect(secondRender.props).toMatchSnapshot();
    expect(secondContainer).toEqual(container);
  });

  it('renders transformed items', () => {
    const state = { page: 0 };

    widget = infiniteHits({
      container,
      escapeHTML: true,
      transformItems: items =>
        items.map(item => ({ ...item, transformed: true })),
      showPrevious: false,
    });

    widget.init({ helper, instantSearchInstance: createInstantSearch() });

    widget.render({
      results,
      state,
      instantSearchInstance: {},
    });

    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;

    expect(firstRender.props).toMatchSnapshot();
  });

  it('if it is the last page, then the props should contain isLastPage true', () => {
    const instantSearchInstance = createInstantSearch();
    widget.init({ helper, instantSearchInstance });
    widget.render({
      results: { ...results, page: 0, nbPages: 2 },
      state: { page: 0 },
    });
    widget.render({
      results: { ...results, page: 1, nbPages: 2 },
      state: { page: 1 },
    });

    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
    const firstProps = firstRender.props as InfiniteHitsProps;
    const secondRender = render.mock.calls[1][0] as VNode<InfiniteHitsProps>;
    const secondProps = secondRender.props as InfiniteHitsProps;
    const firstContainer = render.mock.calls[0][1];
    const secondContainer = render.mock.calls[1][1];

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstProps.isLastPage).toEqual(false);
    expect(firstContainer).toEqual(container);
    expect(secondProps.isLastPage).toEqual(true);
    expect(secondContainer).toEqual(container);
  });

  it('updates the search state properly when showMore is called', () => {
    expect(helper.state.page).toBeUndefined();

    const state = { page: 0 };
    const instantSearchInstance = createInstantSearch();
    widget.init({ helper, instantSearchInstance });

    widget.render({ results, state });

    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
    const { showMore } = firstRender.props as InfiniteHitsProps;

    showMore();

    expect(helper.state.page).toBe(1);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('should add __position key with absolute position', () => {
    results = { ...results, page: 4, hitsPerPage: 10 };
    const state = { page: results.page };
    const instantSearchInstance = createInstantSearch();
    widget.init({ helper, instantSearchInstance });
    widget.render({ results, state });

    expect(results.hits[0].__position).toEqual(41);
  });

  it('if it is the first page, then the props should contain isFirstPage true', () => {
    const state = { page: 0 };
    const instantSearchInstance = createInstantSearch();
    widget.init({ helper, instantSearchInstance });
    widget.render({
      results: { ...results, page: 0, nbPages: 2 },
      state,
    });
    widget.render({
      results: { ...results, page: 1, nbPages: 2 },
      state,
    });

    expect(render).toHaveBeenCalledTimes(2);

    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
    const firstProps = firstRender.props as InfiniteHitsProps;
    const secondRender = render.mock.calls[1][0] as VNode<InfiniteHitsProps>;
    const secondProps = secondRender.props as InfiniteHitsProps;
    const firstContainer = render.mock.calls[0][1];
    const secondContainer = render.mock.calls[1][1];

    expect(firstProps.isFirstPage).toEqual(true);
    expect(firstContainer).toEqual(container);

    expect(secondProps.isFirstPage).toEqual(true);
    expect(secondContainer).toEqual(container);
  });

  it('if it is not the first page, then the props should contain isFirstPage false', () => {
    helper.setPage(1);
    widget.init({ helper, instantSearchInstance: createInstantSearch() });

    const state = { page: 1 };
    widget.render({
      results: { ...results, page: 1, nbPages: 2 },
      state,
    });

    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
    const { isFirstPage } = firstRender.props as InfiniteHitsProps;
    const firstContainer = render.mock.calls[0][1];

    expect(render).toHaveBeenCalledTimes(1);
    expect(isFirstPage).toEqual(false);
    expect(firstContainer).toEqual(container);
  });

  describe('cache', () => {
    const getStateWithoutPage = state => {
      const { page, ...rest } = state || {};
      return rest;
    };
    const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    let cachedState: any = undefined;
    let cachedHits: any = undefined;
    const customCache = {
      read({ state }) {
        return isEqual(cachedState, getStateWithoutPage(state))
          ? cachedHits
          : null;
      },
      write({ state, hits }) {
        cachedState = getStateWithoutPage(state);
        cachedHits = hits;
      },
    };

    beforeEach(() => {
      cachedState = undefined;
      cachedHits = undefined;
    });

    it('write hits to cache', () => {
      const state = { page: 0, query: 'hello' };
      widget = infiniteHits({
        container,
        escapeHTML: true,
        transformItems: items => items,
        cssClasses: { root: ['root', 'cx'] },
        showPrevious: false,
        cache: customCache,
      });
      widget.init({ helper, instantSearchInstance: createInstantSearch() });
      expect(cachedState).toMatchInlineSnapshot(`undefined`);
      expect(cachedHits).toMatchInlineSnapshot(`undefined`);
      widget.render({
        results: {
          page: 0,
          hits: [{ title: 'first' }, { title: 'second' }],
          hitsPerPage: 2,
        },
        state,
      });
      expect(cachedState).toMatchInlineSnapshot(`
        Object {
          "query": "hello",
        }
      `);
      expect(cachedHits).toMatchInlineSnapshot(`
  Object {
    "0": Array [
      Object {
        "__position": 1,
        "title": "first",
      },
      Object {
        "__position": 2,
        "title": "second",
      },
    ],
  }
  `);
      const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
      const { hits } = firstRender.props as InfiniteHitsProps;
      expect(hits).toMatchInlineSnapshot(`
  Array [
    Object {
      "__position": 1,
      "title": "first",
    },
    Object {
      "__position": 2,
      "title": "second",
    },
  ]
  `);
    });

    it('render hits from cache', () => {
      cachedHits = [
        {
          __position: 1,
          title: 'first',
        },
        {
          __position: 2,
          title: 'second',
        },
      ];
      cachedState = {
        query: 'hello',
      };
      const state = { page: 0, query: 'hello' };
      widget = infiniteHits({
        container,
        escapeHTML: true,
        transformItems: items => items,
        cssClasses: { root: ['root', 'cx'] },
        showPrevious: false,
        cache: customCache,
      });
      widget.init({ helper, instantSearchInstance: createInstantSearch() });
      widget.render({
        results: {
          page: 0,
          hits: [],
          hitsPerPage: 2,
        },
        state,
      });
      const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
      const { hits } = firstRender.props as InfiniteHitsProps;

      expect(hits).toMatchInlineSnapshot(`
Array [
  Object {
    "__position": 1,
    "title": "first",
  },
  Object {
    "__position": 2,
    "title": "second",
  },
]
`);
    });
  });
});
