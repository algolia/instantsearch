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

export type InsightsSendEvent = (
  method: InsightsClientMethod,
  payload: InsightsClientPayload
) => void;

export type InsightsOnUserTokenChangeMethod = 'onUserTokenChange';

export type InsightsOnUserTokenChange = (
  method: InsightsOnUserTokenChangeMethod,
  callback: (userToken: string) => void,
  options?: { immediate?: boolean }
) => void;

export type InsightsClient = InsightsSendEvent & InsightsOnUserTokenChange;

export type InsightsClientWrapper = (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
) => void;
