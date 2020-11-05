import { render as preactRender } from 'preact';
import algoliasearchHelper from 'algoliasearch-helper';
import { SearchClient } from '../../../types';
import infiniteHits from '../infinite-hits';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';

const render = castToJestMock(preactRender);

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-ignore: test infiniteHits with invalid parameters
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

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[0].props).toMatchSnapshot();
    expect(secondRender[1]).toEqual(container);
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

    const [firstRender] = render.mock.calls;

    expect(firstRender[0].props).toMatchSnapshot();
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

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender[0].props.isLastPage).toEqual(false);
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[0].props.isLastPage).toEqual(true);
    expect(secondRender[1]).toEqual(container);
  });

  it('updates the search state properly when showMore is called', () => {
    expect(helper.state.page).toBeUndefined();

    const state = { page: 0 };
    const instantSearchInstance = createInstantSearch();
    widget.init({ helper, instantSearchInstance });

    widget.render({ results, state });

    const [firstRender] = render.mock.calls;

    const { showMore } = firstRender[0].props;

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

    const [firstRender, secondRender] = render.mock.calls;

    expect(firstRender[0].props.isFirstPage).toEqual(true);
    expect(firstRender[1]).toEqual(container);

    expect(secondRender[0].props.isFirstPage).toEqual(true);
    expect(secondRender[1]).toEqual(container);
  });

  it('if it is not the first page, then the props should contain isFirstPage false', () => {
    helper.setPage(1);
    widget.init({ helper, instantSearchInstance: createInstantSearch() });

    const state = { page: 1 };
    widget.render({
      results: { ...results, page: 1, nbPages: 2 },
      state,
    });

    const [firstRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender[0].props.isFirstPage).toEqual(false);
    expect(firstRender[1]).toEqual(container);
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
      const firstCall = render.mock.calls[0];
      expect(firstCall[0].props.hits).toMatchInlineSnapshot(`
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
      const firstCall = render.mock.calls[0];
      expect(firstCall[0].props.hits).toMatchInlineSnapshot(`
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
