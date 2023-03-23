import { serializePayload } from './serializer';

import type { InsightsEvent } from '../../middlewares/createInsightsMiddleware';
import type { InstantSearch, Hit, EscapedHits } from '../../types';

type BuiltInSendEventForHits = (
  eventType: string,
  hits: Hit | Hit[],
  eventName?: string
) => void;
type CustomSendEventForHits = (customPayload: any) => void;
export type SendEventForHits = BuiltInSendEventForHits & CustomSendEventForHits;

export type BuiltInBindEventForHits = (
  eventType: string,
  hits: Hit | Hit[],
  eventName?: string
) => string;

export type CustomBindEventForHits = (customPayload: any) => string;

export type BindEventForHits = BuiltInBindEventForHits & CustomBindEventForHits;

function chunk<TItem>(arr: TItem[], chunkSize: number = 20): TItem[][] {
  const chunks: TItem[][] = [];
  for (let i = 0; i < Math.ceil(arr.length / chunkSize); i++) {
    chunks.push(arr.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  return chunks;
}

export function _buildEventPayloadsForHits({
  index,
  widgetType,
  methodName,
  args,
  instantSearchInstance,
}: {
  widgetType: string;
  index: string;
  methodName: 'sendEvent' | 'bindEvent';
  args: any[];
  instantSearchInstance: InstantSearch;
}): {
  payloads: InsightsEvent[];
  eventModifier?: string;
} {
  // when there's only one argument, that means it's custom
  if (args.length === 1 && typeof args[0] === 'object') {
    return { payloads: [args[0]] };
  }
  const [eventType, eventModifier]: [string, string] = args[0].split(':');

  const hits: Hit | Hit[] | EscapedHits = args[1];
  const eventName: string | undefined = args[2];
  if (!hits) {
    if (__DEV__) {
      throw new Error(
        `You need to pass hit or hits as the second argument like:
  ${methodName}(eventType, hit);
  `
      );
    } else {
      return { payloads: [] };
    }
  }
  if ((eventType === 'click' || eventType === 'conversion') && !eventName) {
    if (__DEV__) {
      throw new Error(
        `You need to pass eventName as the third argument for 'click' or 'conversion' events like:
  ${methodName}('click', hit, 'Product Purchased');

  To learn more about event naming: https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/in-depth/clicks-conversions-best-practices/
  `
      );
    } else {
      return { payloads: [] };
    }
  }
  const hitsArray: Hit[] = Array.isArray(hits) ? hits : [hits];

  if (hitsArray.length === 0) {
    return { payloads: [] };
  }
  const queryID = hitsArray[0].__queryID;
  const hitsChunks = chunk(hitsArray);
  const objectIDsByChunk = hitsChunks.map((batch) =>
    batch.map((hit) => hit.objectID)
  );
  const positionsByChunk = hitsChunks.map((batch) =>
    batch.map((hit) => hit.__position)
  );

  if (eventType === 'view') {
    if (instantSearchInstance.status !== 'idle') {
      return { payloads: [] };
    }
    return {
      payloads: hitsChunks.map((batch, i) => {
        return {
          insightsMethod: 'viewedObjectIDs',
          widgetType,
          eventType,
          payload: {
            eventName: eventName || 'Hits Viewed',
            index,
            objectIDs: objectIDsByChunk[i],
          },
          hits: batch,
        };
      }),
      eventModifier,
    };
  } else if (eventType === 'click') {
    return {
      payloads: hitsChunks.map((batch, i) => {
        return {
          insightsMethod: 'clickedObjectIDsAfterSearch',
          widgetType,
          eventType,
          payload: {
            eventName: eventName || 'Hit Clicked',
            index,
            queryID,
            objectIDs: objectIDsByChunk[i],
            positions: positionsByChunk[i],
          },
          hits: batch,
        };
      }),
      eventModifier,
    };
  } else if (eventType === 'conversion') {
    return {
      payloads: hitsChunks.map((batch, i) => {
        return {
          insightsMethod: 'convertedObjectIDsAfterSearch',
          widgetType,
          eventType,
          payload: {
            eventName: eventName || 'Hit Converted',
            index,
            queryID,
            objectIDs: objectIDsByChunk[i],
          },
          hits: batch,
        };
      }),
      eventModifier,
    };
  } else if (__DEV__) {
    throw new Error(`eventType("${eventType}") is not supported.
    If you want to send a custom payload, you can pass one object: ${methodName}(customPayload);
    `);
  } else {
    return { payloads: [] };
  }
}

export function createSendEventForHits({
  instantSearchInstance,
  index,
  widgetType,
}: {
  instantSearchInstance: InstantSearch;
  index: string;
  widgetType: string;
}): SendEventForHits {
  let sentEvents: Record<InsightsEvent['eventType'], boolean> = {};
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;

  const sendEventForHits: SendEventForHits = (...args: any[]) => {
    const { payloads, eventModifier } = _buildEventPayloadsForHits({
      widgetType,
      index,
      methodName: 'sendEvent',
      args,
      instantSearchInstance,
    });

    payloads.forEach((payload) => {
      if (eventModifier === 'internal' && sentEvents[payload.eventType]) {
        return;
      }

      sentEvents[payload.eventType] = true;
      instantSearchInstance.sendEventToInsights(payload);
    });

    clearTimeout(timer);
    timer = setTimeout(() => {
      sentEvents = {};
    }, 0);
  };
  return sendEventForHits;
}

export function createBindEventForHits({
  index,
  widgetType,
  instantSearchInstance,
}: {
  index: string;
  widgetType: string;
  instantSearchInstance: InstantSearch;
}): BindEventForHits {
  const bindEventForHits: BindEventForHits = (...args: any[]) => {
    const { payloads } = _buildEventPayloadsForHits({
      widgetType,
      index,
      methodName: 'bindEvent',
      args,
      instantSearchInstance,
    });

    return payloads.length
      ? `data-insights-event=${serializePayload(payloads)}`
      : '';
  };
  return bindEventForHits;
}
