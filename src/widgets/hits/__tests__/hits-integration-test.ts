import { getByText, fireEvent } from '@testing-library/dom';

import instantsearch from '../../../index.es';
import { hits, configure } from '../../';
import { createInsightsMiddleware } from '../../../middlewares';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

describe('hits', () => {
  let search;
  let searchClient;
  let container;
  const hitsPerPage = 2;
  const page = 0;

  beforeEach(() => {
    searchClient = {
      search: jest.fn(requests =>
        Promise.resolve({
          results: requests.map(() =>
            createSingleSearchResponse({
              hits: Array(hitsPerPage)
                .fill(undefined)
                .map((_, index) => ({
                  title: `title ${page * hitsPerPage + index + 1}`,
                  objectID: `object-id${index}`,
                })),
            })
          ),
        })
      ),
    };
    search = instantsearch({
      indexName: 'instant_search',
      searchClient,
    });

    container = document.createElement('div');
  });

  describe('sendEvent', () => {
    let onEvent;
    beforeEach(() => {
      onEvent = jest.fn();
      const insights = createInsightsMiddleware({
        insightsClient: null,
        onEvent,
      });
      search.EXPERIMENTAL_use(insights);

      search.addWidgets([
        configure({
          hitsPerPage,
        }),
      ]);
    });

    it('sends view event when hits are rendered', done => {
      search.addWidgets([
        hits({
          container,
        }),
      ]);
      search.start();
      process.nextTick(() => {
        expect(onEvent).toHaveBeenCalledTimes(1);
        expect(onEvent).toHaveBeenCalledWith({
          eventType: 'view',
          insightsMethod: 'viewedObjectIDs',
          payload: {
            eventName: 'Hits Viewed',
            index: 'instant_search',
            objectIDs: ['object-id0', 'object-id1'],
          },
          widgetType: 'ais.hits',
        });
        done();
      });
    });

    it('sends click event', done => {
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
      process.nextTick(() => {
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
          widgetType: 'ais.hits',
        });
        done();
      });
    });

    it('sends conversion event', done => {
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
      process.nextTick(() => {
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
          widgetType: 'ais.hits',
        });
        done();
      });
    });
  });
});
