import { AlgoliaSearchHelper } from 'algoliasearch-helper';
import { InstantSearch, Hit } from '../../types';
import { InsightsEvent } from '../../middleware/insights';

type BuiltInSendEventForHits = (eventType: string, hits: Hit[]) => void;
type CustomSendEventForHits = (customPayload: any) => void;

export type SendEventForHits = BuiltInSendEventForHits & CustomSendEventForHits;

type BuildPayload = (options: {
  eventType: string;
  widgetType: string;
  helper: AlgoliaSearchHelper;
  hits: Hit[];
}) => InsightsEvent;

const buildPayload: BuildPayload = ({
  eventType,
  widgetType,
  helper,
  hits,
}) => {
  const queryID = hits[0].__queryID;
  const objectIDs = hits.map(hit => hit.objectID);
  const positions = hits.map(hit => hit.__position);
  const index = helper.getIndex();

  if (eventType === 'view') {
    return {
      insightsMethod: 'viewedObjectIDs',
      widgetType,
      eventType,
      payload: {
        eventName: 'Item List Viewed',
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
        eventName: 'Item Clicked',
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
        eventName: 'Item Converted',
        index,
        queryID,
        objectIDs,
      },
    };
  } else {
    throw new Error(`eventType("${eventType}") is not supported.
If you want to send a custom payload, you can pass one object: sendEvent(customPayload);
`);
  }
};

export function createSendEventForHits({
  instantSearchInstance,
  helper,
  widgetType,
}: {
  instantSearchInstance: InstantSearch;
  helper: AlgoliaSearchHelper;
  widgetType: string;
}): SendEventForHits {
  // TODO: fix types -> something's wrong and args is any now.
  // Same for createSendEventForFacet
  const sendEventForHits: SendEventForHits = (...args) => {
    if (args.length === 2) {
      const [eventType, hits] = args;
      if (!Array.isArray(hits)) {
        throw new Error(
          `You need to pass an array of Hits as the second parameter to \`sendEvent()\`.`
        );
      }

      instantSearchInstance.sendEventToInsights(
        buildPayload({ eventType, widgetType, helper, hits })
      );
    } else if (args.length === 1) {
      instantSearchInstance.sendEventToInsights(args[0]);
    } else {
      throw new Error(`You need to pass two arguments: eventType, hits.
(eventType = 'view' | 'click' | 'conversion')

If you want to send a custom payload, you can pass one object: sendEvent(customPayload);
`);
    }
  };
  return sendEventForHits;
}

// export function createBindEventForHits();
