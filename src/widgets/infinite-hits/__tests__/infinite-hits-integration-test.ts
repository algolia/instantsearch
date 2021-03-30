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
    function createCustomCache() {
      const getStateWithoutPage = state => {
        const { page, ...rest } = state || {};
        return rest;
      };
      const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      let cachedState = undefined;
      let cachedHits = undefined;
      const customCache: any = {
        read: jest.fn(({ state }) => {
          return isEqual(cachedState, getStateWithoutPage(state))
            ? cachedHits
            : null;
        }),
        write: jest.fn(({ state, hits }) => {
          cachedState = getStateWithoutPage(state);
          cachedHits = hits;
        }),
        clear: jest.fn(() => {
          cachedState = undefined;
          cachedHits = undefined;
        }),
      };

      return {
        cachedState,
        cachedHits,
        customCache,
      };
    }

    it('writes to a custom cache', async () => {
      const { search } = createInstantSearch();
      const { customCache } = createCustomCache();

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
      expect(customCache.write).toHaveBeenCalledTimes(1);
      expect(customCache.write.mock.calls[0][0].hits).toMatchInlineSnapshot(`
        Object {
          "0": Array [
            Object {
              "__position": 1,
              "objectID": "object-id0",
              "title": "title 1",
            },
            Object {
              "__position": 2,
              "objectID": "object-id1",
              "title": "title 2",
            },
          ],
        }
      `);

      fireEvent.click(getByText(container, 'Show more results'));
      await waitFor(() => {
        const numberOfHits = container.querySelectorAll(
          '.ais-InfiniteHits-item'
        ).length;
        expect(numberOfHits).toEqual(4);
      });
      expect(customCache.write).toHaveBeenCalledTimes(2);
      expect(customCache.write.mock.calls[1][0].hits).toMatchInlineSnapshot(`
Object {
  "0": Array [
    Object {
      "__position": 1,
      "objectID": "object-id0",
      "title": "title 1",
    },
    Object {
      "__position": 2,
      "objectID": "object-id1",
      "title": "title 2",
    },
  ],
  "1": Array [
    Object {
      "__position": 3,
      "objectID": "object-id0",
      "title": "title 3",
    },
    Object {
      "__position": 4,
      "objectID": "object-id1",
      "title": "title 4",
    },
  ],
}
`);
    });

    it('displays all the hits from cache', async () => {
      const { search, searchClient } = createInstantSearch();
      const { customCache } = createCustomCache();

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

    it('works after the cache gets invalidated', async () => {
      const { search } = createInstantSearch();
      const { customCache } = createCustomCache();

      customCache.write({
        state: {
          facets: [],
          disjunctiveFacets: [],
          hierarchicalFacets: [],
          facetsRefinements: {},
          facetsExcludes: {},
          disjunctiveFacetsRefinements: {},
          numericRefinements: {},
          tagRefinements: [],
          hierarchicalFacetsRefinements: {},
          index: 'instant_search',
          hitsPerPage: 2,
          highlightPreTag: '__ais-highlight__',
          highlightPostTag: '__/ais-highlight__',
          page: 0,
        },
        hits: {
          0: [
            {
              title: 'fake1',
              objectID: 'test-object-id1',
            },
            {
              title: 'fake2',
              objectID: 'test-object-id2',
            },
            {
              title: 'fake3',
              objectID: 'test-object-id3',
            },
          ],
        },
      });

      search.addWidgets([
        infiniteHits({
          container,
          cache: customCache, // render with fake hits
          templates: {
            item: `<div>{{title}}</div>`,
          },
        }),
      ]);
      search.start();

      // waits until it renders
      await waitFor(() => {
        const numberOfHits = container.querySelectorAll(
          '.ais-InfiniteHits-item'
        ).length;
        expect(numberOfHits).toEqual(3);
      });

      // checks if the fake hits are rendered
      getByText(container, 'fake1');
      getByText(container, 'fake2');
      getByText(container, 'fake3');

      // clears the cache
      customCache.clear();
      search.refresh();

      // waits until it renders the real hits
      await waitFor(() => {
        const numberOfHits = container.querySelectorAll(
          '.ais-InfiniteHits-item'
        ).length;
        expect(numberOfHits).toEqual(2);
      });

      // checks if the correct hits are rendered
      getByText(container, 'title 1');
      getByText(container, 'title 2');

      expect(() => {
        getByText(container, 'fake1');
      }).toThrowError(
        expect.objectContaining({
          message: expect.stringContaining(
            `Unable to find an element with the text: fake1.`
          ),
        })
      );
    });
  });

  describe('insights', () => {
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
      search.use(insights);

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
          hits: [
            {
              __position: 1,
              objectID: 'object-id0',
              title: 'title 1',
            },
            {
              __position: 2,
              objectID: 'object-id1',
              title: 'title 2',
            },
          ],
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
      search.use(insights);

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
        hits: [
          {
            __hitIndex: 0,
            __position: 1,
            objectID: 'object-id0',
            title: 'title 1',
          },
        ],
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
      search.use(insights);

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
        hits: [
          {
            __hitIndex: 1,
            __position: 2,
            objectID: 'object-id1',
            title: 'title 2',
          },
        ],
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
