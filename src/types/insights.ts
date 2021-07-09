import {
  InsightsClient as OriginalInsightsClient,
  InsightsMethodMap,
} from 'search-insights/lib/types';

export type InsightsClientMethod = keyof InsightsMethodMap;

// manually typed, as the search-insights InsightsMethodMap[InsightsClientMethod][0]
// has some items as any, which is an absorbing element, and makes everything `any`
export type InsightsClientPayload = {
  eventName: string;
  queryID: string;
  index: string;
  objectIDs: string[];
  positions?: number[];
};


export type InsightsClient = OriginalInsightsClient & { queue?: any[][] };

export type InsightsClientWrapper = (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>,
  callback?: InsightsMethodMap[InsightsClientMethod][1]
) => void;
