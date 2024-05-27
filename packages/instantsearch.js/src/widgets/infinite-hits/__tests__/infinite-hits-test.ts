/**
 * @jest-environment jsdom
 */

import { createSingleSearchResponse } from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { render as preactRender } from 'preact';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import infiniteHits from '../infinite-hits';

import type { InfiniteHitsProps } from '../../../components/InfiniteHits/InfiniteHits';
import type { InfiniteHitsCache } from '../../../connectors/infinite-hits/connectInfiniteHits';
import type { SearchClient } from '../../../types';
import type {
  AlgoliaSearchHelper,
  PlainSearchParameters,
} from 'algoliasearch-helper';
import type { VNode } from 'preact';

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
  let container: HTMLElement;
  let widget: ReturnType<typeof infiniteHits>;
  let results: SearchResults;
  let helper: AlgoliaSearchHelper;

  beforeEach(() => {
    render.mockClear();

    helper = algoliasearchHelper({} as SearchClient, '', {});
    helper.search = jest.fn();

    container = document.createElement('div');
    widget = infiniteHits({
      container,
      escapeHTML: true,
      transformItems: (items) => items,
      cssClasses: { root: ['root', 'cx'] },
      showPrevious: false,
    });
    widget.init(createInitOptions({ helper }));
    results = new SearchResults(helper.state, [
      createSingleSearchResponse({
        hits: [{ objectID: '1' }, { objectID: '2' }],
        hitsPerPage: 2,
        page: 1,
      }),
    ]);
  });

  it('calls twice render(<Hits props />, container)', () => {
    const state = new SearchParameters({ page: 0 });
    const instantSearchInstance = createInstantSearch();
    widget.init(createInitOptions({ helper, instantSearchInstance }));

    widget.render(createRenderOptions({ results, state }));
    widget.render(createRenderOptions({ results, state }));

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
    const state = new SearchParameters({ page: 0 });

    widget = infiniteHits({
      container,
      escapeHTML: true,
      transformItems: (items) =>
        items.map((item) => ({ ...item, transformed: true })),
      showPrevious: false,
    });

    widget.init(createInitOptions({ helper }));

    widget.render(
      createRenderOptions({
        results,
        state,
      })
    );

    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;

    expect(firstRender.props).toMatchSnapshot();
  });

  it('if it is the last page, then the props should contain isLastPage true', () => {
    widget.init(createInitOptions({ helper }));
    const state1 = new SearchParameters({ page: 0 });
    widget.render(
      createRenderOptions({
        results: new SearchResults(state1, [
          createSingleSearchResponse({ page: 0, nbPages: 2 }),
        ]),
        state: state1,
      })
    );
    const state2 = new SearchParameters({ page: 1 });
    widget.render(
      createRenderOptions({
        results: new SearchResults(state2, [
          createSingleSearchResponse({ page: 1, nbPages: 2 }),
        ]),
        state: state2,
      })
    );

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

    const state = new SearchParameters({ page: 0 });
    const instantSearchInstance = createInstantSearch();
    widget.init(createInitOptions({ helper, instantSearchInstance }));

    widget.render(createRenderOptions({ results, state }));

    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
    const { showMore } = firstRender.props as InfiniteHitsProps;

    showMore();

    expect(helper.state.page).toBe(1);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('should add __position key with absolute position', () => {
    const state = new SearchParameters({ page: 4 });
    results = new SearchResults(state, [
      createSingleSearchResponse({
        hits: [{ objectID: '1' }, { objectID: '2' }],
        page: state.page,
        hitsPerPage: 10,
      }),
    ]);
    widget.init(createInitOptions({ helper }));
    widget.render(createRenderOptions({ results, state }));

    expect(render).toHaveBeenCalledTimes(1);
    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
    const { hits } = firstRender.props as InfiniteHitsProps;

    expect(hits[0].__position).toEqual(41);
  });

  it('if it is the first page, then the props should contain isFirstPage true', () => {
    widget.init(createInitOptions({ helper }));
    {
      const state = new SearchParameters({ page: 0 });

      widget.render(
        createRenderOptions({
          results: new SearchResults(state, [
            createSingleSearchResponse({ page: state.page, nbPages: 2 }),
          ]),
          state,
        })
      );
    }
    {
      const state = new SearchParameters({ page: 1 });

      widget.render(
        createRenderOptions({
          results: new SearchResults(state, [
            createSingleSearchResponse({ page: state.page, nbPages: 2 }),
          ]),
          state,
        })
      );
    }

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
    widget.init(createInitOptions({ helper }));

    const state = new SearchParameters({ page: 1 });

    widget.render(
      createRenderOptions({
        results: new SearchResults(state, [
          createSingleSearchResponse({ page: state.page, nbPages: 2 }),
        ]),
        state,
      })
    );

    const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
    const { isFirstPage } = firstRender.props as InfiniteHitsProps;
    const firstContainer = render.mock.calls[0][1];

    expect(render).toHaveBeenCalledTimes(1);
    expect(isFirstPage).toEqual(false);
    expect(firstContainer).toEqual(container);
  });

  describe('cache', () => {
    const getStateWithoutPage = (state: PlainSearchParameters) => {
      const { page, ...rest } = state || {};
      return rest;
    };
    const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
    let cachedState: any = undefined;
    let cachedHits: any = undefined;
    const customCache: InfiniteHitsCache = {
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
      widget = infiniteHits({
        container,
        escapeHTML: true,
        transformItems: (items) => items,
        cssClasses: { root: ['root', 'cx'] },
        showPrevious: false,
        cache: customCache,
      });
      widget.init(createInitOptions({ helper }));
      expect(cachedState).toMatchInlineSnapshot(`undefined`);
      expect(cachedHits).toMatchInlineSnapshot(`undefined`);

      {
        const state = new SearchParameters({ page: 0, query: 'hello' });

        widget.render(
          createRenderOptions({
            results: new SearchResults(state, [
              createSingleSearchResponse({
                hits: [
                  { objectID: '1', title: 'first' },
                  { objectID: '2', title: 'second' },
                ],
                page: state.page,
                hitsPerPage: 2,
              }),
            ]),
            state,
          })
        );
      }

      expect(cachedState).toMatchInlineSnapshot(`
        {
          "disjunctiveFacets": [],
          "disjunctiveFacetsRefinements": {},
          "facets": [],
          "facetsExcludes": {},
          "facetsRefinements": {},
          "hierarchicalFacets": [],
          "hierarchicalFacetsRefinements": {},
          "numericRefinements": {},
          "query": "hello",
          "tagRefinements": [],
        }
      `);
      expect(cachedHits).toMatchInlineSnapshot(`
        {
          "0": [
            {
              "__position": 1,
              "objectID": "1",
              "title": "first",
            },
            {
              "__position": 2,
              "objectID": "2",
              "title": "second",
            },
          ],
        }
      `);
      const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
      const { hits } = firstRender.props as InfiniteHitsProps;
      expect(hits).toMatchInlineSnapshot(`
        [
          {
            "__position": 1,
            "objectID": "1",
            "title": "first",
          },
          {
            "__position": 2,
            "objectID": "2",
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
      cachedState = JSON.parse(
        JSON.stringify(
          new SearchParameters({
            query: 'hello',
          })
        )
      );
      const state = new SearchParameters({ page: 0, query: 'hello' });
      widget = infiniteHits({
        container,
        escapeHTML: true,
        transformItems: (items) => items,
        cssClasses: { root: ['root', 'cx'] },
        showPrevious: false,
        cache: customCache,
      });
      widget.init(createInitOptions({ helper }));
      widget.render(
        createRenderOptions({
          results: new SearchResults(state, [
            createSingleSearchResponse({
              page: state.page,
              hits: [],
              hitsPerPage: 2,
            }),
          ]),
          state,
        })
      );

      const firstRender = render.mock.calls[0][0] as VNode<InfiniteHitsProps>;
      const { hits } = firstRender.props as InfiniteHitsProps;

      expect(hits).toMatchInlineSnapshot(`
        [
          {
            "__position": 1,
            "title": "first",
          },
          {
            "__position": 2,
            "title": "second",
          },
        ]
      `);
    });
  });
});
