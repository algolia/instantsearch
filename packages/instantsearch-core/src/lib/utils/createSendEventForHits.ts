import { serializePayload } from './serializer';

import type InstantSearch from '../../instantsearch';
import type { InsightsEvent } from '../../middlewares/createInsightsMiddleware';
import type { Hit } from '../../types';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

type BuiltInSendEventForHits = (
  eventType: string,
  hits: Hit | Hit[],
  eventName?: string,
  additionalData?: Record<string, any>
) => void;
type CustomSendEventForHits = (customPayload: any) => void;
export type SendEventForHits = BuiltInSendEventForHits & CustomSendEventForHits;

export type BuiltInBindEventForHits = (
  eventType: string,
  hits: Hit | Hit[],
  eventName?: string,
  additionalData?: Record<string, any>
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

type IndexedHit = { hit: Hit; index: number };
type ObjectData = Record<string, any>;

// search-insights stores a click's queryID per objectID to infer later
// conversions, so one click event can't mix queryIDs.
function chunkByQueryID(hits: IndexedHit[]): IndexedHit[][] {
  const groups: IndexedHit[][] = [];
  const groupIndexByQueryID: Record<string, number> = Object.create(null);
  hits.forEach((indexedHit) => {
    const key = indexedHit.hit.__queryID || '';
    if (groupIndexByQueryID[key] === undefined) {
      groupIndexByQueryID[key] = groups.length;
      groups.push([]);
    }
    groups[groupIndexByQueryID[key]].push(indexedHit);
  });
  return groups.reduce<IndexedHit[][]>(
    (acc, group) => acc.concat(chunk(group)),
    []
  );
}

// Splitting a conversion would duplicate its value, so mixed queryIDs go in
// `objectData` instead.
function addObjectQueryIDs(
  hits: Hit[],
  objectData: ObjectData[] | undefined
): ObjectData[] | undefined {
  const queryID = hits[0].__queryID;
  if (hits.every((hit) => hit.__queryID === queryID)) {
    return objectData;
  }
  return hits.map((hit, i) => {
    const data = objectData ? objectData[i] : undefined;
    if ((data && data.queryID) || !hit.__queryID) {
      return data || {};
    }
    return { ...data, queryID: hit.__queryID };
  });
}

export function _buildEventPayloadsForHits({
  helper,
  widgetType,
  methodName,
  args,
  instantSearchInstance,
}: {
  widgetType: string;
  helper: AlgoliaSearchHelper;
  methodName: 'sendEvent' | 'bindEvent';
  args: any[];
  instantSearchInstance: InstantSearch;
}): InsightsEvent[] {
  // when there's only one argument, that means it's custom
  if (args.length === 1 && typeof args[0] === 'object') {
    return [args[0]];
  }
  const [eventType, eventModifier]: [string, string] = args[0].split(':');

  const hits: Hit | Hit[] = args[1];
  const eventName: string | undefined = args[2];
  const additionalData: Record<string, any> = args[3] || {};

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
  const hitsArray: Hit[] = Array.isArray(hits) ? hits : [hits];

  if (hitsArray.length === 0) {
    return [];
  }
  const indexedHits = hitsArray.map((hit, index) => ({ hit, index }));
  // The Insights API rejects objectData that doesn't match objectIDs.
  const objectData: ObjectData[] | undefined =
    Array.isArray(additionalData.objectData) &&
    additionalData.objectData.length === hitsArray.length
      ? additionalData.objectData
      : undefined;
  // These overwrite the built payload, so it can't be split or annotated.
  const callerShapesPayload =
    Boolean(additionalData.queryID) ||
    additionalData.objectIDs !== undefined ||
    additionalData.positions !== undefined ||
    (additionalData.objectData !== undefined && !objectData);
  const indexedChunks =
    eventType === 'click' && !callerShapesPayload
      ? chunkByQueryID(indexedHits)
      : chunk(indexedHits);
  const hitsChunks = indexedChunks.map((batch) => batch.map(({ hit }) => hit));
  const objectIDsByChunk = hitsChunks.map((batch) =>
    batch.map((hit) => hit.objectID)
  );
  const positionsByChunk = hitsChunks.map((batch) =>
    batch.map((hit) => hit.__position)
  );
  const objectDataByChunk = indexedChunks.map((batch) =>
    objectData && !callerShapesPayload
      ? batch.map(({ index }) => objectData[index])
      : undefined
  );

  if (eventType === 'view') {
    if (instantSearchInstance.status !== 'idle') {
      return [];
    }
    return hitsChunks.map((batch, i) => {
      return {
        insightsMethod: 'viewedObjectIDs',
        widgetType,
        eventType,
        payload: {
          eventName: eventName || 'Hits Viewed',
          index: helper.lastResults?.index || helper.state.index,
          objectIDs: objectIDsByChunk[i],
          ...additionalData,
        },
        hits: batch,
        eventModifier,
      };
    });
  } else if (eventType === 'click') {
    return hitsChunks.map((batch, i) => {
      return {
        insightsMethod: 'clickedObjectIDsAfterSearch',
        widgetType,
        eventType,
        payload: {
          eventName: eventName || 'Hit Clicked',
          index: helper.lastResults?.index || helper.state.index,
          queryID: batch[0].__queryID,
          objectIDs: objectIDsByChunk[i],
          positions: positionsByChunk[i],
          ...additionalData,
          ...(objectDataByChunk[i] && { objectData: objectDataByChunk[i] }),
        },
        hits: batch,
        eventModifier,
      };
    });
  } else if (eventType === 'conversion') {
    return hitsChunks.map((batch, i) => {
      let conversionObjectData = objectDataByChunk[i];
      if (!callerShapesPayload) {
        conversionObjectData = addObjectQueryIDs(batch, conversionObjectData);
      }
      return {
        insightsMethod: 'convertedObjectIDsAfterSearch',
        widgetType,
        eventType,
        payload: {
          eventName: eventName || 'Hit Converted',
          index: helper.lastResults?.index || helper.state.index,
          queryID: batch[0].__queryID,
          objectIDs: objectIDsByChunk[i],
          ...additionalData,
          ...(conversionObjectData && { objectData: conversionObjectData }),
        },
        hits: batch,
        eventModifier,
      };
    });
  } else if (__DEV__) {
    throw new Error(`eventType("${eventType}") is not supported.
    If you want to send a custom payload, you can pass one object: ${methodName}(customPayload);
    `);
  } else {
    return [];
  }
}

export function createSendEventForHits({
  instantSearchInstance,
  helper,
  widgetType,
}: {
  instantSearchInstance: InstantSearch;
  helper: AlgoliaSearchHelper;
  widgetType: string;
}): SendEventForHits {
  let sentEvents: Record<InsightsEvent['eventType'], boolean> = {};
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;

  const sendEventForHits: SendEventForHits = (...args: any[]) => {
    const payloads = _buildEventPayloadsForHits({
      widgetType,
      helper,
      methodName: 'sendEvent',
      args,
      instantSearchInstance,
    });

    // Checked once per call: a click split by queryID isn't its own duplicate.
    const clickAlreadySent = sentEvents.click;
    payloads.forEach((payload) => {
      if (
        payload.eventType === 'click' &&
        payload.eventModifier === 'internal' &&
        clickAlreadySent
      ) {
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
  helper,
  widgetType,
  instantSearchInstance,
}: {
  helper: AlgoliaSearchHelper;
  widgetType: string;
  instantSearchInstance: InstantSearch;
}): BindEventForHits {
  const bindEventForHits: BindEventForHits = (...args: any[]) => {
    const payloads = _buildEventPayloadsForHits({
      widgetType,
      helper,
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
