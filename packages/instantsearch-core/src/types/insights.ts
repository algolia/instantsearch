import type { Hit } from './results';
import type {
  InsightsMethodMap as _InsightsMethodMap,
  InsightsClient as _InsightsClient,
} from 'search-insights';

export type {
  Init as InsightsInit,
  AddAlgoliaAgent as InsightsAddAlgoliaAgent,
  SetUserToken as InsightsSetUserToken,
  GetUserToken as InsightsGetUserToken,
  OnUserTokenChange as InsightsOnUserTokenChange,
} from 'search-insights';

export type InsightsMethodMap = _InsightsMethodMap;
export type InsightsClientMethod = keyof InsightsMethodMap;

/**
 * Method allowed by the insights middleware.
 */
export type InsightsMethod =
  | 'clickedObjectIDsAfterSearch'
  | 'clickedObjectIDs'
  | 'clickedFilters'
  | 'convertedObjectIDsAfterSearch'
  | 'convertedObjectIDs'
  | 'convertedFilters'
  | 'viewedObjectIDs'
  | 'viewedFilters';

/**
 * The event sent to the insights middleware.
 */
export type InsightsEvent<TMethod extends InsightsMethod = InsightsMethod> = {
  insightsMethod?: TMethod;
  payload: InsightsMethodMap[TMethod][0][0];
  widgetType: string;
  eventType: string; // 'view' | 'click' | 'conversion', but we're not restricting.
  eventModifier?: string; // 'internal', but we're not restricting.
  hits?: Hit[];
  attribute?: string;
};

export type InsightsClientPayload = {
  eventName: string;
  queryID: string;
  index: string;
  objectIDs: string[];
  positions?: number[];
};

type QueueItemMap = {
  [MethodName in keyof InsightsMethodMap]: [
    methodName: MethodName,
    ...args: InsightsMethodMap[MethodName][0][0]
  ];
};

export type QueueItem = QueueItemMap[keyof QueueItemMap];

export type InsightsClient = _InsightsClient & {
  queue?: QueueItem[];
};

export type ProvidedInsightsClient = InsightsClient | null | undefined;

export type InsightsProps<
  TInsightsClient extends ProvidedInsightsClient = ProvidedInsightsClient
> = {
  insightsClient?: TInsightsClient;
  insightsInitParams?: Partial<InsightsMethodMap['init'][0][0]>;
  onEvent?: (event: InsightsEvent, insightsClient: TInsightsClient) => void;
  /**
   * @internal indicator for the default insights middleware
   */
  $$internal?: boolean;
  /**
   * @internal indicator for sending the `clickAnalytics` search parameter
   */
  $$automatic?: boolean;
};

type BuiltInSendEventForHits = (
  eventType: string,
  hits: Hit | Hit[],
  eventName?: string,
  additionalData?: Record<string, any>
) => void;
type CustomSendEventForHits = (customPayload: any) => void;
export type SendEventForHits = BuiltInSendEventForHits & CustomSendEventForHits;

type BuiltInSendEventForFacet = (
  eventType: string,
  facetValue: string,
  eventName?: string,
  additionalData?: Record<string, any>
) => void;
type CustomSendEventForFacet = (customPayload: any) => void;
export type SendEventForFacet = BuiltInSendEventForFacet &
  CustomSendEventForFacet;
