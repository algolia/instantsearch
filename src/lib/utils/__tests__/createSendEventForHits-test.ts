import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import {
  createBindEventForHits,
  createSendEventForHits,
} from '../createSendEventForHits';
import { deserializePayload } from '../../utils';

const createTestEnvironment = () => {
  const instantSearchInstance = createInstantSearch();
  const index = 'testIndex';
  const widgetType = 'ais.testWidget';
  const hits = [
    {
      objectID: 'obj0',
      __position: 0,
      __queryID: 'test-query-id',
    },
    {
      objectID: 'obj1',
      __position: 1,
      __queryID: 'test-query-id',
    },
  ];
  const sendEvent = createSendEventForHits({
    instantSearchInstance,
    index,
    widgetType,
  });
  const bindEvent = createBindEventForHits({
    index,
    widgetType,
  });
  return {
    instantSearchInstance,
    index,
    widgetType,
    hits,
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
        sendEvent('click', {} as any);
      }).toThrowErrorMatchingInlineSnapshot(`
"You need to pass eventName as the third argument for 'click' or 'conversion' events like:
  sendEvent('click', hit, 'Product Purchased');

  To learn more about event naming: https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/in-depth/clicks-conversions-best-practices/
  "
`);

      expect(() => {
        sendEvent('conversion', {} as any);
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
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();
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

  it('sends click event', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();
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
  });

  it('sends conversion event', () => {
    const { sendEvent, instantSearchInstance, hits } = createTestEnvironment();
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
});

describe('createBindEventForHits', () => {
  function parsePayload(payload) {
    expect(payload.startsWith('data-insights-event=')).toBe(true);
    return deserializePayload(payload.substr('data-insights-event='.length));
  }

  it('returns a payload for click event', () => {
    const { bindEvent, hits } = createTestEnvironment();
    const parsedPayload = parsePayload(
      bindEvent('click', hits[0], 'Product Clicked')
    );
    expect(parsedPayload).toEqual({
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
  });

  it('returns a payload for conversion event', () => {
    const { bindEvent, hits } = createTestEnvironment();
    const parsedPayload = parsePayload(
      bindEvent('conversion', hits[0], 'Product Ordered')
    );
    expect(parsedPayload).toEqual({
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
  });
});
