import { InsightsClient as OriginalInsightsClient } from "search-insights/lib/types";

export type InsightsClientMethod =
  | 'viewedObjectIDs'
  | 'clickedFilters'
  | 'clickedObjectIDsAfterSearch'
  | 'convertedObjectIDsAfterSearch';

export type InsightsClientPayload = {
  eventName: string;
  queryID: string;
  index: string;
  objectIDs: string[];
  positions?: number[];
};

export type InsightsClient = OriginalInsightsClient & { queue?: any[][] }

export type InsightsClientWrapper = (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
) => void;
