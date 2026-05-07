import type { AlgoliaSearchHelper } from 'algoliasearch-helper';
import type { CompositionClient, SearchClient } from './algoliasearch';
import type { InsightsClient as AlgoliaInsightsClient } from './insights';
import type {
  InsightsEvent,
  InsightsProps,
} from '../middlewares/createInsightsMiddleware';
import type { Middleware, MiddlewareDefinition } from './middleware';
import type { RenderState } from './render-state';
import type { InitialResults } from './results';
import type { RouterProps } from '../middlewares/createRouterMiddleware';
import type { UiState } from './ui-state';
import type { CreateURL, IndexWidget, Widget } from './widget';

// This purposely breaks TypeScript's type inference to ensure it's not used
// as it's used for a default parameter for example.
type NoInfer<T> = T extends infer S ? S : never;

export type InstantSearchOptions<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = {
  indexName?: string;
  compositionID?: string;
  searchClient: SearchClient | CompositionClient;
  numberLocale?: string;
  /** @deprecated use onStateChange instead */
  searchFunction?: (helper: AlgoliaSearchHelper) => void;
  onStateChange?: (params: {
    uiState: TUiState;
    setUiState: (
      uiState: TUiState | ((previousUiState: TUiState) => TUiState)
    ) => void;
  }) => void;
  initialUiState?: NoInfer<TUiState>;
  stalledSearchDelay?: number;
  routing?: RouterProps<TUiState, TRouteState> | boolean;
  insights?: InsightsProps | boolean;
  /** @deprecated use the `insights` option instead */
  insightsClient?: AlgoliaInsightsClient;
  future?: {
    preserveSharedStateOnUnmount?: boolean;
    persistHierarchicalRootCount?: boolean;
  };
};

export type InstantSearchStatus = 'idle' | 'loading' | 'stalled' | 'error';

export const INSTANTSEARCH_FUTURE_DEFAULTS: Required<
  InstantSearchOptions['future']
> = {
  preserveSharedStateOnUnmount: false,
  persistHierarchicalRootCount: false,
};

export interface InstantSearch<
  TUiState extends UiState = UiState,
  _TRouteState = TUiState
> {
  client: InstantSearchOptions['searchClient'];
  indexName: string;
  compositionID?: string;
  insightsClient: AlgoliaInsightsClient | null;
  onStateChange: InstantSearchOptions<TUiState>['onStateChange'] | null;
  future: NonNullable<InstantSearchOptions<TUiState>['future']>;
  helper: AlgoliaSearchHelper | null;
  mainHelper: AlgoliaSearchHelper | null;
  mainIndex: IndexWidget;
  started: boolean;
  _hasSearchWidget: boolean;
  _hasRecommendWidget: boolean;
  templatesConfig: Record<string, unknown>;
  renderState: RenderState;
  status: InstantSearchStatus;
  error: Error | null | undefined;
  _initialUiState: TUiState;
  _initialResults: InitialResults | null;
  _searchStalledTimer: ReturnType<typeof setTimeout> | null;
  _manuallyResetScheduleSearch?: boolean;
  _resetScheduleSearch?: () => void;
  _isSearchStalled: boolean;
  _stalledSearchDelay: number;
  _searchFunction?: InstantSearchOptions['searchFunction'];
  _insights: InstantSearchOptions['insights'];
  middleware: Array<{
    creator: Middleware<TUiState>;
    instance: MiddlewareDefinition<TUiState>;
  }>;
  sendEventToInsights: (event: InsightsEvent) => void;
  addWidgets(widgets: Array<Widget | IndexWidget>): this;
  removeWidgets(widgets: Array<Widget | IndexWidget>): this;
  addWidget(widget: Widget | IndexWidget): this;
  removeWidget(widget: Widget | IndexWidget): this;
  start(): void;
  dispose(): void;
  scheduleSearch(): void;
  scheduleRender(): void;
  scheduleStalledRender(): void;
  setUiState(
    uiState: TUiState | ((previousUiState: TUiState) => TUiState),
    callOnStateChange?: boolean
  ): void;
  getUiState(): TUiState;
  createURL(nextState?: TUiState): string;
  refresh(): void;
  use(...middleware: Array<Middleware<TUiState>>): this;
  EXPERIMENTAL_use(...middleware: Array<Middleware<TUiState>>): this;
  unuse(...middlewareToUnuse: Array<Middleware<TUiState>>): this;
  onInternalStateChange(): void;
  _createURL: CreateURL<TUiState>;
  on(event: string, handler: (...args: any[]) => void): this;
  once(event: string, handler: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
  addListener(event: string, handler: (...args: any[]) => void): this;
  removeListener(event: string, handler: (...args: any[]) => void): this;
  removeAllListeners(event?: string): this;
  setMaxListeners(n: number): this;
  listeners(event: string): Function[];
  listenerCount(event: string): number;
}
