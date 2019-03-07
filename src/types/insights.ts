export type InsightsClientMethod =
  | 'clickedObjectIDsAfterSearch'
  | 'convertedObjectIDsAfterSearch';

export type InsightsClientPayload = {
  eventName: string;
  queryID: string;
  index: string;
  objectIDs: string[];
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
