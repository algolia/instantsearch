/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSingleSearchResponse } from '@instantsearch/mocks';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';

import { createResultsWithFeeds } from '../../../../test/createFeedsTestHelpers';
import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectFeeds from '../connectFeeds';

import type { SearchResponse } from 'algoliasearch-helper/types/algoliasearch';

describe('connectFeeds', () => {
  describe('Usage', () => {
    it('fails when no renderer is given', () => {
      expect(() =>
        // @ts-expect-error
        connectFeeds({})
      ).toThrowErrorMatchingInlineSnapshot(`
        "The render function is not valid (received type Object).

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/#connector"
      `);
    });

    it('fails when isolated is not false', () => {
      expect(() =>
        connectFeeds(() => {})({
          // @ts-expect-error
          isolated: true,
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`isolated\` option currently only supports \`false\`.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/#connector"
      `);
    });

    it('fails when isolated is missing', () => {
      expect(() =>
        connectFeeds(() => {})({
          // @ts-expect-error
          isolated: undefined,
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`isolated\` option currently only supports \`false\`.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/#connector"
      `);
    });
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customFeeds = connectFeeds(render, unmount);
    const widget = customFeeds({ isolated: false });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.feeds',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
        getRenderState: expect.any(Function),
        getWidgetSearchParameters: expect.any(Function),
      })
    );
  });

  describe('init', () => {
    it('throws when compositionID is not set', () => {
      const feedsWidget = connectFeeds(() => {})({
        isolated: false,
      });

      expect(() => {
        feedsWidget.init!(createInitOptions());
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`feeds\` widget requires a composition-based InstantSearch instance (compositionID must be set).

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/#connector"
      `);
    });

    it('calls renderFn with empty feedIDs on init', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        isolated: false,
      });

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));

      expect(renderFn).toHaveBeenCalledTimes(1);
      expect(renderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          feedIDs: [],
          widgetParams: {
            isolated: false,
          },
        }),
        true
      );
    });
  });

  describe('render', () => {
    it('computes feedIDs from results.feeds', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        isolated: false,
      });

      const results = createResultsWithFeeds(
        ['products', 'articles'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, results })
      );

      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({
          feedIDs: ['products', 'articles'],
        }),
        false
      );
    });

    it('applies transformFeeds to reorder feeds', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        isolated: false,
        transformFeeds: (feeds) => feeds.reverse(),
      });

      const results = createResultsWithFeeds(
        ['products', 'articles'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, results })
      );

      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({
          feedIDs: ['articles', 'products'],
        }),
        false
      );
    });

    it('applies transformFeeds to filter feeds', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        isolated: false,
        transformFeeds: (feeds) =>
          feeds.filter((feedID) => feedID === 'products'),
      });

      const results = createResultsWithFeeds(
        ['products', 'articles'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, results })
      );

      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({
          feedIDs: ['products'],
        }),
        false
      );
    });

    it('handles render with no results', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        isolated: false,
      });

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));
      feedsWidget.render!(
        createRenderOptions({
          instantSearchInstance,
          results: undefined as any,
        })
      );

      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({ feedIDs: [] }),
        false
      );
    });

    it('handles single-feed backward compat (no feeds property)', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        isolated: false,
      });

      const state = instantSearchInstance.helper!.state;
      const response: SearchResponse<any> = {
        hits: [{ objectID: '1' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 10,
        processingTimeMS: 1,
        query: '',
        params: '',
        exhaustiveNbHits: true,
      };
      const results = new SearchResults(state, [response]);

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, results })
      );

      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({
          feedIDs: [''],
        }),
        false
      );
    });

    it('throws when transformFeeds does not return an array', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        isolated: false,
        transformFeeds: () => 'products' as any,
      });

      const results = createResultsWithFeeds(
        ['products'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));

      expect(() => {
        feedsWidget.render!(
          createRenderOptions({ instantSearchInstance, results })
        );
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`transformFeeds\` option expects a function that returns an Array.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/#connector"
      `);
    });
  });

  describe('hydration from _initialResults', () => {
    it('hydrates lastResults.feeds when initial payload has feeds', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);
      const state = instantSearchInstance.helper!.state;
      const rawA = createSingleSearchResponse({
        feedID: 'a',
        hits: [{ objectID: '1' }],
      } as any);
      const rawB = createSingleSearchResponse({
        feedID: 'b',
        hits: [{ objectID: '2' }],
      } as any);

      instantSearchInstance.helper!.lastResults = new SearchResults(state, [
        rawA,
      ]);
      instantSearchInstance._initialResults = {
        indexName: {
          state,
          results: [rawA],
          compositionFeedsResults: [rawA, rawB],
        },
      } as any;

      jest
        .spyOn(instantSearchInstance.mainIndex, 'getHelper')
        .mockReturnValue(instantSearchInstance.helper);

      const feedsWidget = connectFeeds(renderFn)({
        isolated: false,
      });

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));

      const feeds = instantSearchInstance.helper?.lastResults?.feeds;
      expect(feeds).toHaveLength(2);
      expect(feeds![0]).toBeInstanceOf(SearchResults);
      expect(feeds![1]).toBeInstanceOf(SearchResults);
    });

    it('does not replace lastResults.feeds when already set', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);
      const state = instantSearchInstance.helper!.state;
      const existing = createResultsWithFeeds(['x', 'y'], state);
      instantSearchInstance.helper!.lastResults = existing;

      instantSearchInstance._initialResults = {
        indexName: {
          state,
          results: existing._rawResults,
          compositionFeedsResults: [
            createSingleSearchResponse({ feedID: 'other1' } as any),
            createSingleSearchResponse({ feedID: 'other2' } as any),
          ],
        },
      } as any;

      jest
        .spyOn(instantSearchInstance.mainIndex, 'getHelper')
        .mockReturnValue(instantSearchInstance.helper);

      const feedsWidget = connectFeeds(renderFn)({
        isolated: false,
      });

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));

      expect(instantSearchInstance.helper?.lastResults?.feeds).toEqual(
        existing.feeds
      );
    });
  });

  describe('dispose', () => {
    it('calls unmountFn', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();

      const feedsWidget = connectFeeds(
        renderFn,
        unmountFn
      )({
        isolated: false,
      });

      feedsWidget.dispose!({} as any);

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('passes through search parameters unchanged', () => {
      const feedsWidget = connectFeeds(() => {})({
        isolated: false,
      });

      const state = new SearchParameters({ index: 'test' });
      expect(
        feedsWidget.getWidgetSearchParameters!(state, { uiState: {} })
      ).toBe(state);
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns empty feedIDs when no results', () => {
      const feedsWidget = connectFeeds(() => {})({
        isolated: false,
      });

      const renderState = feedsWidget.getWidgetRenderState(
        createRenderOptions({ results: undefined as any })
      );

      expect(renderState.feedIDs).toEqual([]);
    });

    it('computes feedIDs from results (stateless)', () => {
      const feedsWidget = connectFeeds(() => {})({
        isolated: false,
      });

      const results = createResultsWithFeeds(['a', 'b']);

      const renderState = feedsWidget.getWidgetRenderState(
        createRenderOptions({ results })
      );

      expect(renderState.feedIDs).toEqual(['a', 'b']);
    });

    it('reconstructs SearchResults from plain feed objects (hydration)', () => {
      const feedsWidget = connectFeeds(() => {})({
        isolated: false,
      });

      const state = new SearchParameters({ index: 'test' });
      const parent = new SearchResults(state, [createSingleSearchResponse()]);
      const rawA = createSingleSearchResponse({
        feedID: 'products',
        hits: [{ objectID: 'p1' }],
      } as any);
      const rawB = createSingleSearchResponse({
        feedID: 'articles',
        hits: [{ objectID: 'a1' }],
      } as any);
      (parent as any).feeds = [rawA, rawB];

      feedsWidget.getWidgetRenderState(
        createRenderOptions({ results: parent })
      );

      expect(parent.feeds![0]).toBeInstanceOf(SearchResults);
      expect(parent.feeds![1]).toBeInstanceOf(SearchResults);
      expect(parent.feeds![0].hits).toEqual([{ objectID: 'p1' }]);
      expect(parent.feeds![1].hits).toEqual([{ objectID: 'a1' }]);
      expect(
        feedsWidget.getWidgetRenderState(
          createRenderOptions({ results: parent })
        ).feedIDs
      ).toEqual(['products', 'articles']);
    });

    it('reconstructs feeds after JSON.stringify/parse round-trip', () => {
      const feedsWidget = connectFeeds(() => {})({
        isolated: false,
      });

      const state = new SearchParameters({ index: 'test' });
      const parent = new SearchResults(state, [createSingleSearchResponse()]);
      const rawA = createSingleSearchResponse({
        feedID: 'products',
        hits: [{ objectID: 'p1' }],
      } as any);
      const rawB = createSingleSearchResponse({
        feedID: 'articles',
        hits: [{ objectID: 'a1' }],
      } as any);
      (parent as any).feeds = JSON.parse(JSON.stringify([rawA, rawB]));

      feedsWidget.getWidgetRenderState(
        createRenderOptions({ results: parent })
      );

      expect(parent.feeds![0]).toBeInstanceOf(SearchResults);
      expect(parent.feeds![1]).toBeInstanceOf(SearchResults);
    });

    it('leaves SearchResults feed entries unchanged', () => {
      const feedsWidget = connectFeeds(() => {})({
        isolated: false,
      });

      const results = createResultsWithFeeds(['a', 'b']);
      const before0 = results.feeds![0];
      const before1 = results.feeds![1];

      feedsWidget.getWidgetRenderState(createRenderOptions({ results }));
      feedsWidget.getWidgetRenderState(createRenderOptions({ results }));

      expect(results.feeds![0]).toBe(before0);
      expect(results.feeds![1]).toBe(before1);
    });
  });

  describe('getRenderState', () => {
    it('merges feeds into renderState', () => {
      const feedsWidget = connectFeeds(() => {})({
        isolated: false,
      });

      const renderState = feedsWidget.getRenderState({}, createRenderOptions());

      expect(renderState.feeds).toBeDefined();
      expect(renderState.feeds.feedIDs).toEqual(['']);
    });
  });
});
