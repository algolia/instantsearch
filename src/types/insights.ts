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

export type InsightsGet = (
  method: '_get',
  key: string,
  callback: (value: any) => void
) => void;

export type InsightsInit = (
  method: 'init',
  options: {
    appId: string;
    apiKey: string;
  }
) => void;

export type InsightsClient = InsightsSendEvent &
  InsightsOnUserTokenChange &
  InsightsGet &
  InsightsInit &
  InsightsSetUserToken & {
    queue?: Array<[string, any]>;
  };

export type InsightsClientWrapper = (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
) => void;
