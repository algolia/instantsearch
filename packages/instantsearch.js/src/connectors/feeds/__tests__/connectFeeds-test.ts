/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { SearchParameters, SearchResults } from 'algoliasearch-helper';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
  createDisposeOptions,
  createWidget,
} from '../../../../test/createWidget';
import { index } from '../../../widgets';
import connectFeeds from '../connectFeeds';

import type { IndexWidget } from '../../../types';
import type { SearchResponse } from 'algoliasearch-helper/types/algoliasearch';

function createResultsWithFeeds(
  feedIDs: string[],
  state?: SearchParameters
): SearchResults {
  const searchState = state || new SearchParameters({ index: 'test' });
  const response: SearchResponse<any> = {
    hits: [],
    nbHits: 0,
    page: 0,
    nbPages: 0,
    hitsPerPage: 10,
    processingTimeMS: 1,
    query: '',
    params: '',
    exhaustiveNbHits: true,
  };

  const results = new SearchResults(searchState, [response]);
  (results as any).feeds = feedIDs.map((feedID) => {
    const feedResponse: SearchResponse<any> = {
      ...response,
      hits: [{ objectID: `hit-${feedID}` }],
      nbHits: 1,
    };
    const feedResults = new SearchResults(searchState, [feedResponse]);
    (feedResults as any).feedID = feedID;
    return feedResults;
  });

  return results;
}

function createParentWithHelper(
  instantSearchInstance: ReturnType<typeof createInstantSearch>
): IndexWidget {
  const parent = index({ indexName: 'test' });
  // Mock getHelper to return the instantSearch helper,
  // since the index widget hasn't gone through its full init lifecycle
  parent.getHelper = () => instantSearchInstance.helper!;
  return parent;
}

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

    it('fails when widgets is not a function', () => {
      expect(() =>
        connectFeeds(() => {})({
          // @ts-expect-error
          widgets: [],
          searchScope: 'global',
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`widgets\` option expects a function.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/#connector"
      `);
    });

    it('fails when searchScope is not global', () => {
      expect(() =>
        connectFeeds(() => {})({
          widgets: () => [],
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
          widgets: () => [],
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
    const widget = customFeeds({ widgets: () => [], searchScope: 'global' });

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
        widgets: () => [],
        searchScope: 'global',
      });

      expect(() => {
        feedsWidget.init!(createInitOptions());
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`feeds\` widget requires a composition-based InstantSearch instance (compositionID must be set).

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/#connector"
      `);
    });

    it('calls renderFn with empty feeds on init', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: () => [],
        searchScope: 'global',
      });

      feedsWidget.init!(createInitOptions({ instantSearchInstance }));

      expect(renderFn).toHaveBeenCalledTimes(1);
      expect(renderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          feeds: [],
          widgetParams: {
            widgets: expect.any(Function),
            searchScope: 'global',
          },
        }),
        true
      );
    });
  });

  describe('render', () => {
    it('creates FeedContainers for each feed', () => {
      const renderFn = jest.fn();
      const widgetFactory = jest.fn(() => [createWidget()]);
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: widgetFactory,
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([feedsWidget]);

      const results = createResultsWithFeeds(
        ['products', 'articles'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance, parent }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({
          feeds: [
            expect.objectContaining({ feedID: 'products' }),
            expect.objectContaining({ feedID: 'articles' }),
          ],
        }),
        false
      );

      expect(widgetFactory).toHaveBeenCalledTimes(2);
      expect(widgetFactory).toHaveBeenCalledWith('products');
      expect(widgetFactory).toHaveBeenCalledWith('articles');
    });

    it('reuses existing FeedContainers on subsequent renders', () => {
      const renderFn = jest.fn();
      const widgetFactory = jest.fn(() => [createWidget()]);
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: widgetFactory,
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([feedsWidget]);

      const results = createResultsWithFeeds(
        ['products'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance, parent }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      const firstContainer = renderFn.mock.calls[1][0].feeds[0].container;

      // Second render with same feeds
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      const secondContainer = renderFn.mock.calls[2][0].feeds[0].container;
      expect(secondContainer).toBe(firstContainer);
      expect(widgetFactory).toHaveBeenCalledTimes(1);
    });

    it('removes FeedContainers for disappeared feeds (deferred)', () => {
      jest.useFakeTimers();
      const renderFn = jest.fn();
      const widgetFactory = jest.fn(() => [createWidget()]);
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: widgetFactory,
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([feedsWidget]);

      const state = instantSearchInstance.helper!.state;

      // First render with two feeds
      feedsWidget.init!(createInitOptions({ instantSearchInstance, parent }));
      feedsWidget.render!(
        createRenderOptions({
          instantSearchInstance,
          parent,
          results: createResultsWithFeeds(['products', 'articles'], state),
        })
      );

      expect(renderFn.mock.calls[1][0].feeds).toHaveLength(2);
      const removedContainer = renderFn.mock.calls[1][0].feeds.find(
        (feed: { feedID: string }) => feed.feedID === 'articles'
      ).container;
      expect(parent.getWidgets()).toContain(removedContainer);
      const removeWidgetsSpy = jest.spyOn(parent, 'removeWidgets');

      // Second render with only one feed
      feedsWidget.render!(
        createRenderOptions({
          instantSearchInstance,
          parent,
          results: createResultsWithFeeds(['products'], state),
        })
      );

      expect(renderFn.mock.calls[2][0].feeds).toHaveLength(1);
      expect(renderFn.mock.calls[2][0].feeds[0].feedID).toBe('products');
      // Removed container is still mounted until deferred cleanup runs.
      expect(parent.getWidgets()).toContain(removedContainer);
      expect(removeWidgetsSpy).not.toHaveBeenCalled();

      // Removal is deferred
      jest.runAllTimers();
      expect(removeWidgetsSpy).toHaveBeenCalledWith([removedContainer]);
      expect(parent.getWidgets()).not.toContain(removedContainer);
      jest.useRealTimers();
    });

    it('applies transformFeeds to filter/reorder feeds', () => {
      const renderFn = jest.fn();
      const widgetFactory = jest.fn(() => [createWidget()]);
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: widgetFactory,
        searchScope: 'global',
        transformFeeds: (feeds) => feeds.reverse(),
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([feedsWidget]);

      const results = createResultsWithFeeds(
        ['products', 'articles'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance, parent }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      const feeds = renderFn.mock.calls[1][0].feeds;
      expect(feeds[0].feedID).toBe('articles');
      expect(feeds[1].feedID).toBe('products');
    });

    it('applies transformFeeds to filter out feeds', () => {
      const renderFn = jest.fn();
      const widgetFactory = jest.fn(() => [createWidget()]);
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: widgetFactory,
        searchScope: 'global',
        transformFeeds: (feeds) =>
          feeds.filter((feedID) => feedID === 'products'),
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([feedsWidget]);

      const results = createResultsWithFeeds(
        ['products', 'articles'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance, parent }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      const feeds = renderFn.mock.calls[1][0].feeds;
      expect(feeds).toHaveLength(1);
      expect(feeds[0].feedID).toBe('products');
      expect(widgetFactory).toHaveBeenCalledTimes(1);
      expect(widgetFactory).toHaveBeenCalledWith('products');
      expect(widgetFactory).not.toHaveBeenCalledWith('articles');
    });

    it('skips feeds where widgets() returns empty', () => {
      const renderFn = jest.fn();
      const widgetFactory = jest.fn((feedID: string) =>
        feedID === 'products' ? [createWidget()] : []
      );
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: widgetFactory,
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([feedsWidget]);

      const results = createResultsWithFeeds(
        ['products', 'articles'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance, parent }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      expect(renderFn.mock.calls[1][0].feeds).toHaveLength(1);
      expect(renderFn.mock.calls[1][0].feeds[0].feedID).toBe('products');
    });

    it('handles render with no results', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: () => [createWidget()],
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
        expect.objectContaining({ feeds: [] }),
        false
      );
    });

    it('handles single-feed backward compat (no feedID)', () => {
      const renderFn = jest.fn();
      const widgetFactory = jest.fn(() => [createWidget()]);
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: widgetFactory,
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([feedsWidget]);

      // Results with no feeds property (single-feed composition)
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

      feedsWidget.init!(createInitOptions({ instantSearchInstance, parent }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      expect(renderFn.mock.calls[1][0].feeds).toHaveLength(1);
      expect(renderFn.mock.calls[1][0].feeds[0].feedID).toBe('');
    });

    it('does not mutate results on single-feed backward compat', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: () => [createWidget()],
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([feedsWidget]);

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

      feedsWidget.init!(createInitOptions({ instantSearchInstance, parent }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      expect((results as any).feeds).toBeUndefined();
      expect((results as any).feedID).toBeUndefined();
    });

    it('throws when transformFeeds does not return an array', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(renderFn)({
        widgets: () => [createWidget()],
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
    it('removes all FeedContainers and calls unmountFn', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedsWidget = connectFeeds(
        renderFn,
        unmountFn
      )({
        widgets: () => [createWidget()],
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([feedsWidget]);

      const results = createResultsWithFeeds(
        ['products'],
        instantSearchInstance.helper!.state
      );

      feedsWidget.init!(createInitOptions({ instantSearchInstance, parent }));
      feedsWidget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      expect(renderFn.mock.calls[1][0].feeds).toHaveLength(1);
      const createdContainer = renderFn.mock.calls[1][0].feeds[0].container;
      expect(parent.getWidgets()).toContain(createdContainer);
      const removeWidgetsSpy = jest.spyOn(parent, 'removeWidgets');

      feedsWidget.dispose!(createDisposeOptions({ parent }));

      expect(removeWidgetsSpy).toHaveBeenCalledWith([createdContainer]);
      expect(parent.getWidgets()).not.toContain(createdContainer);
      expect(unmountFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('passes through search parameters unchanged', () => {
      const feedsWidget = connectFeeds(() => {})({
        widgets: () => [],
        searchScope: 'global',
      });

      const state = new SearchParameters({ index: 'test' });
      expect(
        feedsWidget.getWidgetSearchParameters!(state, { uiState: {} })
      ).toBe(state);
    });
  });

  describe('getRenderState', () => {
    it('merges feeds into renderState', () => {
      const feedsWidget = connectFeeds(() => {})({
        widgets: () => [],
        searchScope: 'global',
      });

      const renderState = feedsWidget.getRenderState(
        {},
        createRenderOptions()
      );

      expect(renderState.feeds).toBeDefined();
      expect(renderState.feeds.feeds).toEqual([]);
    });
  });
});
