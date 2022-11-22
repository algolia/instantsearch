import type { InstantSearch, Hit, EscapedHits } from '../../types';
import { serializePayload } from './serializer';
import type { InsightsEvent } from '../../middlewares/createInsightsMiddleware';

type BuiltInSendEventForHits = (
  eventType: string,
  hits: Hit | Hit[],
  eventName?: string
) => void;
type CustomSendEventForHits = (customPayload: any) => void;
export type SendEventForHits = BuiltInSendEventForHits & CustomSendEventForHits;

type BuiltInBindEventForHits = (
  eventType: string,
  hits: Hit | Hit[],
  eventName?: string
) => string;
type CustomBindEventForHits = (customPayload: any) => string;
export type BindEventForHits = BuiltInBindEventForHits & CustomBindEventForHits;

function chunk<TItem>(arr: TItem[], chunkSize: number = 20): TItem[][] {
  const chunks: TItem[][] = [];
  for (let i = 0; i < Math.ceil(arr.length / chunkSize); i++) {
    chunks.push(arr.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  return chunks;
}

const buildPayloads = ({
  index,
  widgetType,
  methodName,
  args,
  isSearchStalled,
}: {
  widgetType: string;
  index: string;
  methodName: 'sendEvent' | 'bindEvent';
  args: any[];
  isSearchStalled: boolean;
}): InsightsEvent[] => {
  // when there's only one argument, that means it's custom
  if (args.length === 1 && typeof args[0] === 'object') {
    return [args[0]];
  }
  const eventType: string = args[0];
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
      return [];
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
      return [];
    }
  }
  const hitsArray: Hit[] = Array.isArray(hits)
    ? removeEscapedFromHits(hits)
    : [hits];

  if (hitsArray.length === 0) {
    return [];
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
    if (isSearchStalled) {
      return [];
    }
    return hitsChunks.map((batch, i) => {
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
    });
  } else if (eventType === 'click') {
    return hitsChunks.map((batch, i) => {
      return {
        insightsMethod: 'clickedObjectIDsAfterSearch',
        widgetType,
        eventType,
        payload: {
          eventName,
          index,
          queryID,
          objectIDs: objectIDsByChunk[i],
          positions: positionsByChunk[i],
        },
        hits: batch,
      };
    });
  } else if (eventType === 'conversion') {
    return hitsChunks.map((batch, i) => {
      return {
        insightsMethod: 'convertedObjectIDsAfterSearch',
        widgetType,
        eventType,
        payload: {
          eventName,
          index,
          queryID,
          objectIDs: objectIDsByChunk[i],
        },
        hits: batch,
      };
    });
  } else if (__DEV__) {
    throw new Error(`eventType("${eventType}") is not supported.
    If you want to send a custom payload, you can pass one object: ${methodName}(customPayload);
    `);
  } else {
    return [];
  }
};

function removeEscapedFromHits(hits: Hit[] | EscapedHits): Hit[] {
  // remove `hits.__escaped` without mutating
  return hits.slice();
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
  const sendEventForHits: SendEventForHits = (...args: any[]) => {
    const payloads = buildPayloads({
      widgetType,
      index,
      methodName: 'sendEvent',
      args,
      isSearchStalled: instantSearchInstance.status === 'stalled',
    });

    payloads.forEach((payload) =>
      instantSearchInstance.sendEventToInsights(payload)
    );
  };
  return sendEventForHits;
}

export function createBindEventForHits({
  index,
  widgetType,
}: {
  index: string;
  widgetType: string;
}): BindEventForHits {
  const bindEventForHits: BindEventForHits = (...args: any[]) => {
    const payloads = buildPayloads({
      widgetType,
      index,
      methodName: 'bindEvent',
      args,
      isSearchStalled: false,
    });

    return payloads.length
      ? `data-insights-event=${serializePayload(payloads)}`
      : '';
  };
  return bindEventForHits;
}
