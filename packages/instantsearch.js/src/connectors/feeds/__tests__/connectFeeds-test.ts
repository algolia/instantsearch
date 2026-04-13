/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { SearchParameters, SearchResults } from 'algoliasearch-helper';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import { createResultsWithFeeds } from '../../../../test/createFeedsTestHelpers';
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

    it('fails when searchScope is not global', () => {
      expect(() =>
        connectFeeds(() => {})({
          // @ts-expect-error
          searchScope: 'local',
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`searchScope\` option currently only supports \\"global\\".

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/#connector"
      `);
    });

    it('fails when searchScope is missing', () => {
      expect(() =>
        connectFeeds(() => {})({
          // @ts-expect-error
          searchScope: undefined,
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`searchScope\` option currently only supports \\"global\\".

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/#connector"
      `);
    });
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customFeeds = connectFeeds(render, unmount);
    const widget = customFeeds({ searchScope: 'global' });

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
        searchScope: 'global',
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
        searchScope: 'global',
      });

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));

      expect(renderFn).toHaveBeenCalledTimes(1);
      expect(renderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          feedIDs: [],
          widgetParams: {
            searchScope: 'global',
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
        searchScope: 'global',
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
        searchScope: 'global',
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
        searchScope: 'global',
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
        searchScope: 'global',
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
        searchScope: 'global',
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
        searchScope: 'global',
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

  describe('dispose', () => {
    it('calls unmountFn', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();

      const feedsWidget = connectFeeds(renderFn, unmountFn)({
        searchScope: 'global',
      });

      feedsWidget.dispose!({} as any);

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('passes through search parameters unchanged', () => {
      const feedsWidget = connectFeeds(() => {})({
        searchScope: 'global',
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
        searchScope: 'global',
      });

      const renderState = feedsWidget.getWidgetRenderState(
        createRenderOptions({ results: undefined as any })
      );

      expect(renderState.feedIDs).toEqual([]);
    });

    it('computes feedIDs from results (stateless)', () => {
      const feedsWidget = connectFeeds(() => {})({
        searchScope: 'global',
      });

      const results = createResultsWithFeeds(['a', 'b']);

      const renderState = feedsWidget.getWidgetRenderState(
        createRenderOptions({ results })
      );

      expect(renderState.feedIDs).toEqual(['a', 'b']);
    });
  });

  describe('getRenderState', () => {
    it('merges feeds into renderState', () => {
      const feedsWidget = connectFeeds(() => {})({
        searchScope: 'global',
      });

      const renderState = feedsWidget.getRenderState(
        {},
        createRenderOptions()
      );

      expect(renderState.feeds).toBeDefined();
      expect(renderState.feeds.feedIDs).toEqual(['']);
    });
  });
});
