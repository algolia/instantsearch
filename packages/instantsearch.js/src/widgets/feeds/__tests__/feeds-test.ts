/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createResultsWithFeeds,
  createParentWithHelper,
} from '../../../../test/createFeedsTestHelpers';
import { createCompositionClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import {
  createInitOptions,
  createRenderOptions,
  createDisposeOptions,
  createWidget,
} from '../../../../test/createWidget';
import feeds from '../feeds';
import instantsearch from '../../..';
import searchBox from '../../search-box/search-box';

describe('feeds()', () => {
  describe('usage', () => {
    it('requires container', () => {
      expect(() =>
        // @ts-expect-error testing invalid input
        feeds({})
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/"
      `);
    });

    it('requires widgets to be a function', () => {
      expect(() =>
        feeds({
          container: document.createElement('div'),
          // @ts-expect-error testing invalid input
          widgets: [],
          searchScope: 'global',
        })
      ).toThrowErrorMatchingInlineSnapshot(`
        "The \`widgets\` option expects a function.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/feeds/js/"
      `);
    });

    it('accepts valid options', () => {
      expect(() =>
        feeds({
          container: document.createElement('div'),
          widgets: () => [],
          searchScope: 'global',
        })
      ).not.toThrow();
    });
  });

  describe('rendering', () => {
    it('appends root container on first render', () => {
      const userContainer = document.createElement('div');
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const widget = feeds({
        container: userContainer,
        widgets: () => [],
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);

      widget.init!(createInitOptions({ instantSearchInstance, parent }));

      expect(userContainer.querySelector('.ais-Feeds')).not.toBeNull();
    });

    it('creates DOM elements for each feed', () => {
      const userContainer = document.createElement('div');
      const widgetFactory = jest.fn(() => [createWidget()]);
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const widget = feeds({
        container: userContainer,
        widgets: widgetFactory,
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([widget]);

      const results = createResultsWithFeeds(
        ['products', 'articles'],
        instantSearchInstance.helper!.state
      );

      widget.init!(createInitOptions({ instantSearchInstance, parent }));
      widget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      const feedElements = userContainer.querySelectorAll('.ais-Feeds-feed');
      expect(feedElements).toHaveLength(2);
      expect(widgetFactory).toHaveBeenCalledTimes(2);
      expect(widgetFactory).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        'products'
      );
      expect(widgetFactory).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        'articles'
      );
    });

    it('keeps feed containers when widgets() returns empty or falsy', () => {
      const userContainer = document.createElement('div');
      const widgetFactory = jest.fn((_: HTMLElement, feedID: string) => {
        if (feedID === 'products') {
          return [createWidget()];
        }
        if (feedID === 'articles') {
          return [];
        }
        return undefined as any;
      });
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const widget = feeds({
        container: userContainer,
        widgets: widgetFactory,
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([widget]);

      const results = createResultsWithFeeds(
        ['products', 'articles', 'guides'],
        instantSearchInstance.helper!.state
      );

      widget.init!(createInitOptions({ instantSearchInstance, parent }));
      widget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      const feedElements = userContainer.querySelectorAll('.ais-Feeds-feed');
      expect(feedElements).toHaveLength(3);
      expect(widgetFactory).toHaveBeenCalledTimes(3);
    });

    it('reuses existing feed entries on subsequent renders', () => {
      const userContainer = document.createElement('div');
      const widgetFactory = jest.fn(() => [createWidget()]);
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const widget = feeds({
        container: userContainer,
        widgets: widgetFactory,
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([widget]);

      const results = createResultsWithFeeds(
        ['products'],
        instantSearchInstance.helper!.state
      );

      widget.init!(createInitOptions({ instantSearchInstance, parent }));
      widget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      const firstFeedEl = userContainer.querySelector('.ais-Feeds-feed');

      // Second render with same feeds
      widget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      const secondFeedEl = userContainer.querySelector('.ais-Feeds-feed');
      expect(secondFeedEl).toBe(firstFeedEl);
      expect(widgetFactory).toHaveBeenCalledTimes(1);
    });

    it('removes DOM elements for disappeared feeds (deferred)', () => {
      jest.useFakeTimers();
      const userContainer = document.createElement('div');
      const widgetFactory = jest.fn(() => [createWidget()]);
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const widget = feeds({
        container: userContainer,
        widgets: widgetFactory,
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([widget]);

      const state = instantSearchInstance.helper!.state;

      widget.init!(createInitOptions({ instantSearchInstance, parent }));
      widget.render!(
        createRenderOptions({
          instantSearchInstance,
          parent,
          results: createResultsWithFeeds(['products', 'articles'], state),
        })
      );

      expect(userContainer.querySelectorAll('.ais-Feeds-feed')).toHaveLength(2);
      const removeWidgetsSpy = jest.spyOn(parent, 'removeWidgets');

      // Second render with only one feed
      widget.render!(
        createRenderOptions({
          instantSearchInstance,
          parent,
          results: createResultsWithFeeds(['products'], state),
        })
      );

      expect(userContainer.querySelectorAll('.ais-Feeds-feed')).toHaveLength(1);
      // Removal from parent is deferred
      expect(removeWidgetsSpy).not.toHaveBeenCalled();

      jest.runAllTimers();
      expect(removeWidgetsSpy).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });

    it('reorders DOM elements to match feedIDs order', () => {
      const userContainer = document.createElement('div');
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const feedLabels: string[] = [];
      const widget = feeds({
        container: userContainer,
        widgets: (container, feedID) => {
          container.setAttribute('data-feed', feedID);
          feedLabels.push(feedID);
          return [createWidget()];
        },
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([widget]);

      const state = instantSearchInstance.helper!.state;

      widget.init!(createInitOptions({ instantSearchInstance, parent }));

      // First render: products, articles
      widget.render!(
        createRenderOptions({
          instantSearchInstance,
          parent,
          results: createResultsWithFeeds(['products', 'articles'], state),
        })
      );

      let feedEls = userContainer.querySelectorAll('.ais-Feeds-feed');
      expect(feedEls[0].getAttribute('data-feed')).toBe('products');
      expect(feedEls[1].getAttribute('data-feed')).toBe('articles');

      // Second render with reversed order (via transformFeeds or different API response)
      widget.render!(
        createRenderOptions({
          instantSearchInstance,
          parent,
          results: createResultsWithFeeds(['articles', 'products'], state),
        })
      );

      feedEls = userContainer.querySelectorAll('.ais-Feeds-feed');
      expect(feedEls[0].getAttribute('data-feed')).toBe('articles');
      expect(feedEls[1].getAttribute('data-feed')).toBe('products');
    });
  });

  describe('dispose', () => {
    it('removes all feed containers and cleans up DOM', () => {
      const userContainer = document.createElement('div');
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const widget = feeds({
        container: userContainer,
        widgets: () => [createWidget()],
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([widget]);

      const results = createResultsWithFeeds(
        ['products'],
        instantSearchInstance.helper!.state
      );

      widget.init!(createInitOptions({ instantSearchInstance, parent }));
      widget.render!(
        createRenderOptions({ instantSearchInstance, parent, results })
      );

      const removeWidgetsSpy = jest.spyOn(parent, 'removeWidgets');

      widget.dispose!(createDisposeOptions({ parent }));

      // FeedContainers removed from parent
      expect(removeWidgetsSpy).toHaveBeenCalledTimes(1);
      // Root container removed from DOM
      expect(userContainer.querySelector('.ais-Feeds')).toBeNull();
    });

    it('removes pending deferred containers on dispose', () => {
      const userContainer = document.createElement('div');
      const instantSearchInstance = createInstantSearch({
        compositionID: 'my-comp',
      } as any);

      const widget = feeds({
        container: userContainer,
        widgets: () => [createWidget()],
        searchScope: 'global',
      });

      const parent = createParentWithHelper(instantSearchInstance);
      parent.addWidgets([widget]);

      const state = instantSearchInstance.helper!.state;

      widget.init!(createInitOptions({ instantSearchInstance, parent }));
      widget.render!(
        createRenderOptions({
          instantSearchInstance,
          parent,
          results: createResultsWithFeeds(['products', 'articles'], state),
        })
      );

      // Trigger deferred removal for "articles" but don't flush timers.
      widget.render!(
        createRenderOptions({
          instantSearchInstance,
          parent,
          results: createResultsWithFeeds(['products'], state),
        })
      );

      const removeWidgetsSpy = jest.spyOn(parent, 'removeWidgets');
      widget.dispose!(createDisposeOptions({ parent }));

      // "products" (active) + "articles" (pending deferred removal) are both removed.
      const removedWidgets = removeWidgetsSpy.mock.calls.flatMap(
        ([widgets]) => widgets
      );
      expect(new Set(removedWidgets).size).toBe(2);
    });
  });

  describe('integration', () => {
    it('registers feed containers and renders feed widgets with a real search lifecycle', async () => {
      const container = document.createElement('div');
      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createCompositionClient({}),
        compositionID: 'my-comp',
      });

      search.addWidgets([
        feeds({
          container,
          widgets: (feedContainer) => [
            searchBox({
              container: feedContainer,
            }),
          ],
          searchScope: 'global',
        }),
      ]);

      search.start();
      await wait(0);

      expect(container.querySelectorAll('.ais-Feeds-feed')).toHaveLength(1);
      expect(container.querySelector('.ais-SearchBox')).not.toBeNull();
      expect(
        search.mainIndex
          .getWidgets()
          .some((widget) => widget.$$type === 'ais.feedContainer')
      ).toBe(true);

      search.dispose();
    });
  });
});
