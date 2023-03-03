/**
 * @jest-environment jsdom
 */

import { createSingleSearchResponse } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { getByText, fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { hits, configure } from '../..';
import instantsearch from '../../../index.es';
import { createInsightsMiddleware } from '../../../middlewares';

const createSearchClient = ({
  hitsPerPage,
  includeQueryID,
}: {
  hitsPerPage: number;
  includeQueryID?: boolean;
}) => {
  const page = 0;

  return {
    search: jest.fn((requests) =>
      Promise.resolve({
        results: requests.map(() =>
          createSingleSearchResponse({
            hits: Array(hitsPerPage)
              .fill(undefined)
              .map((_, index) => ({
                title: `title ${page * hitsPerPage + index + 1}`,
                objectID: `object-id${index}`,
                ...(includeQueryID && { __queryID: 'test-query-id' }),
              })),
          })
        ),
      })
    ),
    applicationID: 'latency',
    apiKey: '123',
  };
};

const createInstantSearch = ({
  hitsPerPage = 2,
}: {
  hitsPerPage?: number;
} = {}) => {
  const search = instantsearch({
    indexName: 'instant_search',
    searchClient: createSearchClient({ hitsPerPage }),
  });

  search.addWidgets([
    configure({
      hitsPerPage,
    }),
  ]);

  return {
    search,
  };
};

describe('hits', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
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
        hits({
          container,
        }),
      ]);
      search.start();
      await wait(0);

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
          widgetType: 'ais.hits',
        },
        null
      );
    });

    test('sends a default `click` event when clicking on a hit', async () => {
      const { search } = createInstantSearch();
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();

      search.use(insights);
      search.addWidgets([hits({ container })]);
      search.start();

      await wait(0);

      onEvent.mockClear();

      userEvent.click(container.querySelectorAll('.ais-Hits-item')[0]);

      expect(onEvent).toHaveBeenCalledTimes(1);
      expect(onEvent).toHaveBeenCalledWith(
        {
          eventType: 'click',
          hits: [
            {
              __position: 1,
              objectID: 'object-id0',
              title: 'title 1',
            },
          ],
          insightsMethod: 'clickedObjectIDsAfterSearch',
          payload: {
            eventName: 'Hit Clicked',
            index: 'instant_search',
            objectIDs: ['object-id0'],
            positions: [1],
          },
          widgetType: 'ais.hits',
        },
        null
      );
    });

    it('sends `click` event with `sendEvent`', async () => {
      const { search } = createInstantSearch();
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();
      search.use(insights);

      search.addWidgets([
        hits({
          container,
          templates: {
            item: (item, { html, sendEvent }) => html`
              <button
                type="button"
                onClick=${() => sendEvent('click', item, 'Item Clicked')}
              >
                ${item.title}
              </button>
            `,
          },
        }),
      ]);
      search.start();
      await wait(0);

      // view event by render
      expect(onEvent).toHaveBeenCalledTimes(1);
      onEvent.mockClear();

      fireEvent.click(getByText(container, 'title 1'));

      // The default `click` one + the custom one
      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent.mock.calls[0][0]).toEqual({
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
        widgetType: 'ais.hits',
      });
    });

    it('sends `conversion` event with `sendEvent`', async () => {
      const { search } = createInstantSearch();
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();
      search.use(insights);

      search.addWidgets([
        hits({
          container,
          templates: {
            item: (item, { html, sendEvent }) => html`
              <button
                type="button"
                onClick=${() =>
                  sendEvent('conversion', item, 'Product Ordered')}
              >
                ${item.title}
              </button>
            `,
          },
        }),
      ]);
      search.start();
      await wait(0);

      // view event by render
      expect(onEvent).toHaveBeenCalledTimes(1);
      onEvent.mockClear();

      fireEvent.click(getByText(container, 'title 2'));
      // The default `click` one + the custom one
      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent.mock.calls[0][0]).toEqual({
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
        widgetType: 'ais.hits',
      });
    });

    it('sends `click` event with `bindEvent`', async () => {
      const { search } = createInstantSearch();
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();
      search.use(insights);

      search.addWidgets([
        hits({
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
      await wait(0);

      // view event by render
      expect(onEvent).toHaveBeenCalledTimes(1);
      onEvent.mockClear();

      fireEvent.click(getByText(container, 'title 1'));
      // The default `click` one + the custom one
      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent.mock.calls[1][0]).toEqual({
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
        widgetType: 'ais.hits',
      });
    });

    it('sends `conversion` event with `bindEvent`', async () => {
      const { search } = createInstantSearch();
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();
      search.use(insights);

      search.addWidgets([
        hits({
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
      await wait(0);

      // view event by render
      expect(onEvent).toHaveBeenCalledTimes(1);
      onEvent.mockClear();

      fireEvent.click(getByText(container, 'title 2'));

      // The default `click` one + the custom one
      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent.mock.calls[1][0]).toEqual({
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
        widgetType: 'ais.hits',
      });
    });
  });

  describe('old insights methods', () => {
    it('sends event', async () => {
      const aa = jest.fn();
      const hitsPerPage = 2;
      const search = instantsearch({
        indexName: 'instant_search',
        searchClient: createSearchClient({
          hitsPerPage,
          includeQueryID: true,
        }),
        insightsClient: aa,
      });

      search.addWidgets([
        configure({
          hitsPerPage,
        }),
      ]);

      search.addWidgets([
        hits({
          container,
          templates: {
            item: (item) => `
              <button type='button' ${instantsearch.insights(
                'clickedObjectIDsAfterSearch',
                {
                  objectIDs: [item.objectID],
                  eventName: 'Add to cart',
                }
              )}>
                ${item.title}
              </button>
            `,
          },
        }),
      ]);
      search.start();
      await wait(0);

      fireEvent.click(getByText(container, 'title 1'));
      expect(aa).toHaveBeenCalledTimes(1);
      expect(aa).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
        eventName: 'Add to cart',
        index: undefined,
        objectIDs: ['object-id0'],
        positions: [1],
        queryID: 'test-query-id',
      });
    });
  });
});
