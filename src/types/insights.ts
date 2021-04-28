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

export type InsightsSetUserToken = (
  method: 'setUserToken',
  userToken: string
) => void;

export type InsightsSendEvent = (
  method: InsightsClientMethod,
  payload: InsightsClientPayload
) => void;

export type InsightsOnUserTokenChange = (
  method: 'onUserTokenChange',
  callback?: (userToken: string) => void,
  options?: { immediate?: boolean }
) => void;

export type InsightsGetUserToken = (
  method: 'getUserToken',
  options?: any,
  callback?: (error: any, userToken: string) => void
) => void;

export type InsightsInit = (
  method: 'init',
  options: {
    appId: string;
    apiKey: string;
  }
) => void;

export type InsightsAddAlgoliaAgent = (
  method: 'addAlgoliaAgent',
  algoliaAgent: string
) => void;

export type InsightsClient = InsightsAddAlgoliaAgent &
  InsightsSendEvent &
  InsightsOnUserTokenChange &
  InsightsInit &
  InsightsSetUserToken &
  InsightsGetUserToken & {
    queue?: Array<[string, any]>;
  };

export type InsightsClientWrapper = (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
) => void;
