import { getByText, waitFor, fireEvent } from '@testing-library/dom';

import instantsearch from '../../../index.es';
import { infiniteHits, configure } from '../../';
import { createInsightsMiddleware } from '../../../middlewares';
import { runAllMicroTasks } from '../../../../test/utils/runAllMicroTasks';

function createSingleSearchResponse({ params: { hitsPerPage, page } }) {
  return {
    hits: Array(hitsPerPage)
      .fill(undefined)
      .map((_, index) => ({
        title: `title ${page * hitsPerPage + index + 1}`,
        objectID: `object-id${index}`,
      })),
    page,
    hitsPerPage,
  };
}

describe('infiniteHits', () => {
  const createInstantSearch = ({ hitsPerPage = 2 } = {}) => {
    const searchClient: any = {
      search: jest.fn(requests =>
        Promise.resolve({
          results: requests.map(request => createSingleSearchResponse(request)),
        })
      ),
    };
    const search = instantsearch({
      indexName: 'instant_search',
      searchClient,
    });
    search.addWidgets([
      configure({
        hitsPerPage,
      }),
    ]);

    return { search, searchClient };
  };

  let container;

  beforeEach(() => {
    container = document.createElement('div');
  });

  describe('cache', () => {
    let cachedState: any;
    let cachedHits: any;
    let customCache;

    beforeEach(() => {
      const getStateWithoutPage = state => {
        const { page, ...rest } = state || {};
        return rest;
      };
      const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      cachedState = undefined;
      cachedHits = undefined;
      customCache = {
        read: jest.fn(({ state }) => {
          return isEqual(cachedState, getStateWithoutPage(state))
            ? cachedHits
            : null;
        }),
        write: jest.fn(({ state, hits }) => {
          cachedState = getStateWithoutPage(state);
          cachedHits = hits;
        }),
      };
    });

    it('calls read & write methods of custom cache', async () => {
      const { search } = createInstantSearch();

      search.addWidgets([
        infiniteHits({
          container,
          cache: customCache,
        }),
      ]);
      search.start();

      await waitFor(() => {
        const numberOfHits = container.querySelectorAll(
          '.ais-InfiniteHits-item'
        ).length;
        expect(numberOfHits).toEqual(2);
      });

      fireEvent.click(getByText(container, 'Show more results'));
      await waitFor(() => {
        const numberOfHits = container.querySelectorAll(
          '.ais-InfiniteHits-item'
        ).length;
        expect(numberOfHits).toEqual(4);
      });

      expect(customCache.read).toHaveBeenCalledTimes(2); // init & render
      expect(customCache.write).toHaveBeenCalledTimes(2); // page #0, page #1
    });

    it('displays all the hits from cache', async () => {
      const { search, searchClient } = createInstantSearch();

      // flow #1 - load page #0 & #1 to fill the cache
      search.addWidgets([
        infiniteHits({
          container,
          cache: customCache,
        }),
      ]);
      search.start();

      await waitFor(() => {
        const numberOfHits = container.querySelectorAll(
          '.ais-InfiniteHits-item'
        ).length;
        expect(numberOfHits).toEqual(2);
      });

      fireEvent.click(getByText(container, 'Show more results'));
      await waitFor(() => {
        const numberOfHits = container.querySelectorAll(
          '.ais-InfiniteHits-item'
        ).length;
        expect(numberOfHits).toEqual(4);
      });

      // flow #2 - new InstantSearch instance to leverage the cache
      const search2 = instantsearch({
        indexName: 'instant_search',
        searchClient,
      });
      const container2 = document.createElement('div');
      search2.addWidgets([
        configure({
          hitsPerPage: 2,
        }),
        infiniteHits({
          container: container2,
          cache: customCache, // same cache object
        }),
      ]);
      search2.start();
      await waitFor(() => {
        const numberOfHits = container.querySelectorAll(
          '.ais-InfiniteHits-item'
        ).length;
        expect(numberOfHits).toEqual(4); // it loads two pages initially
      });
    });
  });

  describe('sendEvent', () => {
    const createInsightsMiddlewareWithOnEvent = () => {
      const onEvent = jest.fn();
      const insights = createInsightsMiddleware({
        insightsClient: null,
        onEvent,
      });
      return {
        onEvent,
        insights,
      };
    };

    it('sends view event when hits are rendered', async () => {
      const { search } = createInstantSearch();
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();
      search.EXPERIMENTAL_use(insights);

      search.addWidgets([
        infiniteHits({
          container,
        }),
      ]);
      search.start();
      await runAllMicroTasks();

      expect(onEvent).toHaveBeenCalledTimes(1);
      expect(onEvent).toHaveBeenCalledWith(
        {
          eventType: 'view',
          insightsMethod: 'viewedObjectIDs',
          payload: {
            eventName: 'Hits Viewed',
            index: 'instant_search',
            objectIDs: ['object-id0', 'object-id1'],
          },
          widgetType: 'ais.infiniteHits',
        },
        null
      );
    });

    it('sends click event', async () => {
      const { search } = createInstantSearch();
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();
      search.EXPERIMENTAL_use(insights);

      search.addWidgets([
        infiniteHits({
          container,
          templates: {
            item: (item, bindEvent) => `
              <button type='button' ${bindEvent('click', item, 'Item Clicked')}>
                ${item.title}
              </button>
            `,
          },
        }),
      ]);
      search.start();
      await runAllMicroTasks();

      expect(onEvent).toHaveBeenCalledTimes(1); // view event by render
      fireEvent.click(getByText(container, 'title 1'));
      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent.mock.calls[onEvent.mock.calls.length - 1][0]).toEqual({
        eventType: 'click',
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Item Clicked',
          index: 'instant_search',
          objectIDs: ['object-id0'],
          positions: [1],
        },
        widgetType: 'ais.infiniteHits',
      });
    });

    it('sends conversion event', async () => {
      const { search } = createInstantSearch();
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();
      search.EXPERIMENTAL_use(insights);

      search.addWidgets([
        infiniteHits({
          container,
          templates: {
            item: (item, bindEvent) => `
              <button type='button' ${bindEvent(
                'conversion',
                item,
                'Product Ordered'
              )}>
                ${item.title}
              </button>
            `,
          },
        }),
      ]);
      search.start();
      await runAllMicroTasks();

      expect(onEvent).toHaveBeenCalledTimes(1); // view event by render
      fireEvent.click(getByText(container, 'title 2'));
      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent.mock.calls[onEvent.mock.calls.length - 1][0]).toEqual({
        eventType: 'conversion',
        insightsMethod: 'convertedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Ordered',
          index: 'instant_search',
          objectIDs: ['object-id1'],
        },
        widgetType: 'ais.infiniteHits',
      });
    });
  });
});
