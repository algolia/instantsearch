/**
 * @jest-environment jsdom
 */

import { createInstantSearch } from '../../../../test/createInstantSearch';
import { deserializePayload } from '../../utils';
import {
  createBindEventForHits,
  createSendEventForHits,
} from '../createSendEventForHits';

import type { EscapedHits } from '../../../types';

const createTestEnvironment = ({
  nbHits = 2,
  index = 'testIndex',
}: { nbHits?: number; index?: string } = {}) => {
  const instantSearchInstance = createInstantSearch({ indexName: index });
  const helper = instantSearchInstance.helper!;
  const widgetType = 'ais.testWidget';
  const hits = Array.from({ length: nbHits }, (_, i) => ({
    __position: i,
    __queryID: 'test-query-id',
    objectID: `obj${i}`,
  }));
  const additionalData = {
    eventSubtype: 'addToCart',
    objectData: [
      {
        queryID: hits[0].__queryID,
        price: 100,
        discount: 0,
        quantity: 1,
      },
    ],
    value: 100,
    currency: 'USD',
  };
  const sendEvent = createSendEventForHits({
    instantSearchInstance,
    getIndex: () => helper.getIndex(),
    widgetType,
  });
  const bindEvent = createBindEventForHits({
    getIndex: () => helper.getIndex(),
    widgetType,
    instantSearchInstance,
  });
  return {
    instantSearchInstance,
    helper,
    index,
    widgetType,
    hits,
    additionalData,
    sendEvent,
    bindEvent,
  };
};

describe('createSendEventForHits', () => {
  describe('Usage', () => {
    it('throws when hit is missing', () => {
      const { sendEvent } = createTestEnvironment();
      expect(() => {
        sendEvent('click');
      }).toThrowErrorMatchingInlineSnapshot(`
"You need to pass hit or hits as the second argument like:
  sendEvent(eventType, hit);
  "
`);
    });

    it('throws with unknown eventType', () => {
      const { sendEvent } = createTestEnvironment();
      expect(() => {
        sendEvent('my custom event type');
      }).toThrowErrorMatchingInlineSnapshot(`
"You need to pass hit or hits as the second argument like:
  sendEvent(eventType, hit);
  "
`);
    });

    it('throw when eventName is missing for click or conversion event', () => {
      const { sendEvent } = createTestEnvironment();
      expect(() => {
        // @ts-expect-error wrong input
        sendEvent('click', {});
      }).toThrowErrorMatchingInlineSnapshot(`
"You need to pass eventName as the third argument for 'click' or 'conversion' events like:
  sendEvent('click', hit, 'Product Purchased');

  To learn more about event naming: https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/in-depth/clicks-conversions-best-practices/
  "
`);

      expect(() => {
        // @ts-expect-error wrong input
        sendEvent('conversion', {});
      }).toThrowErrorMatchingInlineSnapshot(`
"You need to pass eventName as the third argument for 'click' or 'conversion' events like:
  sendEvent('click', hit, 'Product Purchased');

  To learn more about event naming: https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/in-depth/clicks-conversions-best-practices/
  "
`);
    });
  });

  it('sends view event with default eventName', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();
    sendEvent('view', hits[0]);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'view',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
      ],
      insightsMethod: 'viewedObjectIDs',
      payload: {
        eventName: 'Hits Viewed',
        index: 'testIndex',
        objectIDs: ['obj0'],
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends internal view event with default eventName', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();
    sendEvent('view:internal', hits[0]);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'view',
      eventModifier: 'internal',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
      ],
      insightsMethod: 'viewedObjectIDs',
      payload: {
        eventName: 'Hits Viewed',
        index: 'testIndex',
        objectIDs: ['obj0'],
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends view event with custom eventName', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();
    sendEvent('view', hits[0], 'Products Displayed');
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'view',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
      ],
      insightsMethod: 'viewedObjectIDs',
      payload: {
        eventName: 'Products Displayed',
        index: 'testIndex',
        objectIDs: ['obj0'],
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends view event with multiple hits', () => {
    const { sendEvent, instantSearchInstance, hits, additionalData } =
      createTestEnvironment();
    sendEvent('view', hits);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'view',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
        {
          __position: 1,
          __queryID: 'test-query-id',
          objectID: 'obj1',
        },
      ],
      insightsMethod: 'viewedObjectIDs',
      payload: {
        eventName: 'Hits Viewed',
        index: 'testIndex',
        objectIDs: ['obj0', 'obj1'],
      },
      widgetType: 'ais.testWidget',
    });

    sendEvent('view', hits, 'Products Viewed', additionalData);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(2);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'view',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
        {
          __position: 1,
          __queryID: 'test-query-id',
          objectID: 'obj1',
        },
      ],
      insightsMethod: 'viewedObjectIDs',
      payload: {
        eventName: 'Products Viewed',
        index: 'testIndex',
        objectIDs: ['obj0', 'obj1'],
        ...additionalData,
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends view event with more than 20 hits', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment({
      nbHits: 21,
    });
    sendEvent('view', hits);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(2);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'view',
      hits: Array.from({ length: 20 }, (_, i) => ({
        __position: i,
        __queryID: 'test-query-id',
        objectID: `obj${i}`,
      })),
      insightsMethod: 'viewedObjectIDs',
      payload: {
        eventName: 'Hits Viewed',
        index: 'testIndex',
        objectIDs: Array.from({ length: 20 }, (_, i) => `obj${i}`),
      },
      widgetType: 'ais.testWidget',
    });
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'view',
      hits: Array.from({ length: 1 }, (_, i) => ({
        __position: 20 + i,
        __queryID: 'test-query-id',
        objectID: `obj${20 + i}`,
      })),
      insightsMethod: 'viewedObjectIDs',
      payload: {
        eventName: 'Hits Viewed',
        index: 'testIndex',
        objectIDs: Array.from({ length: 1 }, (_, i) => `obj${20 + i}`),
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('skips view event when search is not idle', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();

    instantSearchInstance.status = 'loading';
    sendEvent('view', hits);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(0);

    instantSearchInstance.status = 'error';
    sendEvent('view', hits);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(0);

    instantSearchInstance.status = 'stalled';
    sendEvent('view', hits);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(0);

    instantSearchInstance.status = 'idle';
    sendEvent('view', hits);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
  });

  it('sends click event', () => {
    const { sendEvent, instantSearchInstance, hits, additionalData } =
      createTestEnvironment();
    sendEvent('click', hits[0], 'Product Clicked');
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'click',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
      ],
      insightsMethod: 'clickedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Clicked',
        index: 'testIndex',
        objectIDs: ['obj0'],
        positions: [0],
        queryID: 'test-query-id',
      },
      widgetType: 'ais.testWidget',
    });

    sendEvent('click', hits[0], 'Product Clicked', additionalData);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(2);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'click',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
      ],
      insightsMethod: 'clickedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Clicked',
        index: 'testIndex',
        objectIDs: ['obj0'],
        positions: [0],
        queryID: 'test-query-id',
        ...additionalData,
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends internal click event', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();
    sendEvent('click:internal', hits[0], 'Product Clicked');
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'click',
      eventModifier: 'internal',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
      ],
      insightsMethod: 'clickedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Clicked',
        index: 'testIndex',
        objectIDs: ['obj0'],
        positions: [0],
        queryID: 'test-query-id',
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends click event with more than 20 hits', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment({
      nbHits: 21,
    });
    sendEvent('click', hits, 'Product Clicked');
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(2);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'click',
      hits: Array.from({ length: 20 }, (_, i) => {
        return {
          __position: i,
          __queryID: 'test-query-id',
          objectID: `obj${i}`,
        };
      }),
      insightsMethod: 'clickedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Clicked',
        index: 'testIndex',
        objectIDs: Array.from({ length: 20 }, (_, i) => `obj${i}`),
        positions: Array.from({ length: 20 }, (_, i) => i),
        queryID: 'test-query-id',
      },
      widgetType: 'ais.testWidget',
    });
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'click',
      hits: [
        {
          __position: 20,
          __queryID: 'test-query-id',
          objectID: 'obj20',
        },
      ],
      insightsMethod: 'clickedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Clicked',
        index: 'testIndex',
        objectIDs: ['obj20'],
        positions: [20],
        queryID: 'test-query-id',
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends conversion event', () => {
    const { sendEvent, instantSearchInstance, hits, additionalData } =
      createTestEnvironment();
    sendEvent('conversion', hits[0], 'Product Ordered');
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'conversion',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
      ],
      insightsMethod: 'convertedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Ordered',
        index: 'testIndex',
        objectIDs: ['obj0'],
        queryID: 'test-query-id',
      },
      widgetType: 'ais.testWidget',
    });

    sendEvent('conversion', hits[0], 'Product Added To Cart', additionalData);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(2);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenLastCalledWith({
      eventType: 'conversion',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
      ],
      insightsMethod: 'convertedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Added To Cart',
        index: 'testIndex',
        objectIDs: ['obj0'],
        queryID: 'test-query-id',
        ...additionalData,
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends internal conversion event', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();
    sendEvent('conversion:internal', hits[0], 'Product Ordered');
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'conversion',
      eventModifier: 'internal',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
      ],
      insightsMethod: 'convertedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Ordered',
        index: 'testIndex',
        objectIDs: ['obj0'],
        queryID: 'test-query-id',
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends conversion event with more than 20 hits', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment({
      nbHits: 21,
    });
    sendEvent('conversion', hits, 'Product Ordered');
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(2);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'conversion',
      hits: Array.from({ length: 20 }, (_, i) => {
        return {
          __position: i,
          __queryID: 'test-query-id',
          objectID: `obj${i}`,
        };
      }),
      insightsMethod: 'convertedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Ordered',
        index: 'testIndex',
        objectIDs: Array.from({ length: 20 }, (_, i) => `obj${i}`),
        queryID: 'test-query-id',
      },
      widgetType: 'ais.testWidget',
    });
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'conversion',
      hits: [
        {
          __position: 20,
          __queryID: 'test-query-id',
          objectID: 'obj20',
        },
      ],
      insightsMethod: 'convertedObjectIDsAfterSearch',
      payload: {
        eventName: 'Product Ordered',
        index: 'testIndex',
        objectIDs: ['obj20'],
        queryID: 'test-query-id',
      },
      widgetType: 'ais.testWidget',
    });
  });

  it('sends event with an up-to-date index name', () => {
    const { sendEvent, instantSearchInstance, helper, hits } =
      createTestEnvironment({
        index: 'index1',
      });

    sendEvent('view', hits, 'Products Viewed');
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenLastCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ index: 'index1' }),
      })
    );

    helper.setIndex('index2');

    sendEvent('view', hits, 'Products Viewed');
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenLastCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ index: 'index2' }),
      })
    );
  });

  it('sends custom event', () => {
    const { sendEvent, instantSearchInstance } = createTestEnvironment();
    sendEvent({
      hello: 'world',
      custom: 'event',
    });
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      hello: 'world',
      custom: 'event',
    });
  });

  it('removes __escaped marker', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();

    (hits as EscapedHits).__escaped = true;

    sendEvent('view', hits);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(1);
    expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
      eventType: 'view',
      hits: [
        {
          __position: 0,
          __queryID: 'test-query-id',
          objectID: 'obj0',
        },
        {
          __position: 1,
          __queryID: 'test-query-id',
          objectID: 'obj1',
        },
      ],
      insightsMethod: 'viewedObjectIDs',
      payload: {
        eventName: 'Hits Viewed',
        index: 'testIndex',
        objectIDs: ['obj0', 'obj1'],
      },
      widgetType: 'ais.testWidget',
    });
  });
});

describe('createBindEventForHits', () => {
  function parsePayload(payload: string): Record<string, unknown> {
    expect(payload.startsWith('data-insights-event=')).toBe(true);
    return deserializePayload(payload.substr('data-insights-event='.length));
  }

  it('returns a payload for view event', () => {
    const { bindEvent, hits, additionalData } = createTestEnvironment();
    const parsedPayload = parsePayload(bindEvent('view', hits));
    expect(parsedPayload).toEqual([
      {
        eventType: 'view',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            objectID: 'obj0',
          },
          {
            __position: 1,
            __queryID: 'test-query-id',
            objectID: 'obj1',
          },
        ],
        insightsMethod: 'viewedObjectIDs',
        payload: {
          eventName: 'Hits Viewed',
          index: 'testIndex',
          objectIDs: ['obj0', 'obj1'],
        },
        widgetType: 'ais.testWidget',
      },
    ]);

    const parsedPayloadWithAdditionalData = parsePayload(
      bindEvent('view', hits, 'Products Viewed', additionalData)
    );
    expect(parsedPayloadWithAdditionalData).toEqual([
      {
        eventType: 'view',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            objectID: 'obj0',
          },
          {
            __position: 1,
            __queryID: 'test-query-id',
            objectID: 'obj1',
          },
        ],
        insightsMethod: 'viewedObjectIDs',
        payload: {
          eventName: 'Products Viewed',
          index: 'testIndex',
          objectIDs: ['obj0', 'obj1'],
          ...additionalData,
        },
        widgetType: 'ais.testWidget',
      },
    ]);
  });

  it('skips payload for view event when search is not idle', () => {
    const { bindEvent, hits, instantSearchInstance } = createTestEnvironment();

    instantSearchInstance.status = 'loading';
    expect(bindEvent('view', hits)).toHaveLength(0);

    instantSearchInstance.status = 'error';
    expect(bindEvent('view', hits)).toHaveLength(0);

    instantSearchInstance.status = 'stalled';
    expect(bindEvent('view', hits)).toHaveLength(0);

    instantSearchInstance.status = 'idle';
    expect(bindEvent('view', hits)).not.toHaveLength(0);
  });

  it('returns a payload for click event', () => {
    const { bindEvent, hits, additionalData } = createTestEnvironment();
    const parsedPayload = parsePayload(
      bindEvent('click', hits[0], 'Product Clicked')
    );
    expect(parsedPayload).toEqual([
      {
        eventType: 'click',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            objectID: 'obj0',
          },
        ],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Clicked',
          index: 'testIndex',
          objectIDs: ['obj0'],
          positions: [0],
          queryID: 'test-query-id',
        },
        widgetType: 'ais.testWidget',
      },
    ]);

    const parsedPayloadWithAdditionalData = parsePayload(
      bindEvent('click', hits[0], 'Product Clicked', additionalData)
    );
    expect(parsedPayloadWithAdditionalData).toEqual([
      {
        eventType: 'click',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            objectID: 'obj0',
          },
        ],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Clicked',
          index: 'testIndex',
          objectIDs: ['obj0'],
          positions: [0],
          queryID: 'test-query-id',
          ...additionalData,
        },
        widgetType: 'ais.testWidget',
      },
    ]);
  });

  it('returns a payload for conversion event', () => {
    const { bindEvent, hits, additionalData } = createTestEnvironment();
    const parsedPayload = parsePayload(
      bindEvent('conversion', hits[0], 'Product Ordered')
    );
    expect(parsedPayload).toEqual([
      {
        eventType: 'conversion',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            objectID: 'obj0',
          },
        ],
        insightsMethod: 'convertedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Ordered',
          index: 'testIndex',
          objectIDs: ['obj0'],
          queryID: 'test-query-id',
        },
        widgetType: 'ais.testWidget',
      },
    ]);

    const parsedPayloadWithAdditionalData = parsePayload(
      bindEvent('conversion', hits[0], 'Product Added To Cart', additionalData)
    );
    expect(parsedPayloadWithAdditionalData).toEqual([
      {
        eventType: 'conversion',
        hits: [
          {
            __position: 0,
            __queryID: 'test-query-id',
            objectID: 'obj0',
          },
        ],
        insightsMethod: 'convertedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Added To Cart',
          index: 'testIndex',
          objectIDs: ['obj0'],
          queryID: 'test-query-id',
          ...additionalData,
        },
        widgetType: 'ais.testWidget',
      },
    ]);
  });

  it('splits a payload for > 20 hits', () => {
    const { bindEvent, hits } = createTestEnvironment({ nbHits: 21 });
    const parsedPayload = parsePayload(
      bindEvent('click', hits, 'Product Clicked')
    );
    expect(parsedPayload).toEqual([
      {
        eventType: 'click',
        hits: Array.from({ length: 20 }, (_, i) => ({
          __position: i,
          __queryID: 'test-query-id',
          objectID: `obj${i}`,
        })),
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Clicked',
          index: 'testIndex',
          objectIDs: Array.from({ length: 20 }, (_, i) => `obj${i}`),
          positions: Array.from({ length: 20 }, (_, i) => i),
          queryID: 'test-query-id',
        },
        widgetType: 'ais.testWidget',
      },
      {
        eventType: 'click',
        hits: [
          {
            __position: 20,
            __queryID: 'test-query-id',
            objectID: 'obj20',
          },
        ],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Clicked',
          index: 'testIndex',
          objectIDs: ['obj20'],
          positions: [20],
          queryID: 'test-query-id',
        },
        widgetType: 'ais.testWidget',
      },
    ]);
  });
});
