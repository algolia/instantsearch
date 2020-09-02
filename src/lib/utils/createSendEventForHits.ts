import { InstantSearch, Hit } from '../../types';
import { InsightsEvent } from '../../middlewares/createInsightsMiddleware';

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

type BuildPayload = (options: {
  widgetType: string;
  index: string;
  methodName: 'sendEvent' | 'bindEvent';
  args: any[];
}) => InsightsEvent | null;

const buildPayload: BuildPayload = ({
  index,
  widgetType,
  methodName,
  args,
}) => {
  if (args.length === 1 && typeof args[0] === 'object') {
    return args[0];
  }
  const eventType: string = args[0];
  const hits: Hit | Hit[] = args[1];
  const eventName: string | undefined = args[2];
  if (!hits) {
    if (__DEV__) {
      throw new Error(
        `You need to pass hit or hits as the second argument like:
  ${methodName}(eventType, hit);
  `
      );
    } else {
      return null;
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
      return null;
    }
  }
  const hitsArray = Array.isArray(hits) ? hits : [hits];
  if (hitsArray.length === 0) {
    return null;
  }
  const queryID = hitsArray[0].__queryID;
  const objectIDs = hitsArray.map(hit => hit.objectID);
  const positions = hitsArray.map(hit => hit.__position);

  if (eventType === 'view') {
    return {
      insightsMethod: 'viewedObjectIDs',
      widgetType,
      eventType,
      payload: {
        eventName: eventName || 'Hits Viewed',
        index,
        objectIDs,
      },
    };
  } else if (eventType === 'click') {
    return {
      insightsMethod: 'clickedObjectIDsAfterSearch',
      widgetType,
      eventType,
      payload: {
        eventName,
        index,
        queryID,
        objectIDs,
        positions,
      },
    };
  } else if (eventType === 'conversion') {
    return {
      insightsMethod: 'convertedObjectIDsAfterSearch',
      widgetType,
      eventType,
      payload: {
        eventName,
        index,
        queryID,
        objectIDs,
      },
    };
  } else if (__DEV__) {
    throw new Error(`eventType("${eventType}") is not supported.
    If you want to send a custom payload, you can pass one object: ${methodName}(customPayload);
    `);
  } else {
    return null;
  }
};

export function createSendEventForHits({
  instantSearchInstance,
  index,
  widgetType,
}: {
  instantSearchInstance: InstantSearch;
  index: string;
  widgetType: string;
}): SendEventForHits {
  const sendEventForHits: SendEventForHits = (...args) => {
    const payload = buildPayload({
      widgetType,
      index,
      methodName: 'sendEvent',
      args,
    });
    if (payload) {
      instantSearchInstance.sendEventToInsights(payload);
    }
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
  const bindEventForHits: BindEventForHits = (...args) => {
    const payload = buildPayload({
      widgetType,
      index,
      methodName: 'bindEvent',
      args,
    });
    return payload
      ? `data-insights-event=${btoa(JSON.stringify(payload))}`
      : '';
  };
  return bindEventForHits;
}
