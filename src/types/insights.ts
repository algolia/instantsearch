import type { InsightsMethodMap } from 'search-insights';

export type {
  InsightsClient,
  Init as InsightsInit,
  AddAlgoliaAgent as InsightsAddAlgoliaAgent,
  SetUserToken as InsightsSetUserToken,
  GetUserToken as InsightsGetUserToken,
  OnUserTokenChange as InsightsOnUserTokenChange,
} from 'search-insights';

export type InsightsClientMethod = keyof InsightsMethodMap;

export type InsightsClientPayload = {
  eventName: string;
  queryID: string;
  index: string;
  objectIDs: string[];
  positions?: number[];
};

/**
 * @deprecated
 * this is not used anywhere
 */
export type InsightsSendEvent = (
  method:
    | 'viewedObjectIDs'
    | 'clickedFilters'
    | 'clickedObjectIDsAfterSearch'
    | 'convertedObjectIDsAfterSearch',
  payload: InsightsClientPayload
) => void;
