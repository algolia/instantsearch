export type InsightsClientMethod =
  | 'clickedObjectIDsAfterSearch'
  | 'clickedObjectIDs'
  | 'clickedFilters'
  | 'convertedObjectIDsAfterSearch'
  | 'convertedObjectIDs'
  | 'convertedFilters'
  | 'viewedObjectIDs'
  | 'viewedFilters';

export type InsightsClientPayload = {
  eventName: string;
  queryID?: string;
  index: string;
  objectIDs?: string[];
  filters?: string[];
  positions?: number[];
};

export type InsightsClient = (
  method: InsightsClientMethod,
  payload: InsightsClientPayload
) => void;

export type InsightsClientWrapper = (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
) => void;
