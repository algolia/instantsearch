// Runtime API of `instantsearch-core` that React users get from this package.
// Connectors that already have a hook (`connectSearchBox` → `useSearchBox`, …)
// are deliberately NOT re-exported: use the hook. Every other runtime name of
// core's public root is listed here; `core-reexports.test.ts` fails when core
// exports a name that is neither listed here nor covered by a hook.
export {
  // Connectors without a hook
  connectRatingMenu,
  connectRelevantSort,
  connectTasks,
  connectVoiceSearch,
  // Routers and state mappings
  historyRouter,
  simpleStateMapping,
  singleIndexStateMapping,
  // Middlewares
  createInsightsMiddleware,
  createMetadataMiddleware,
  createRouterMiddleware,
  // Helpers
  Paginator,
  createFeedContainer,
  createInfiniteHitsSessionStorageCache,
  getHighlightedParts,
  getInitialResults,
  getInsightsAnonymousUserToken,
  getPropertyByPath,
  getResultCardRuleContext,
  indexWidgetTypes,
  isMetadataEnabled,
  waitForResults,
  // Chat, tasks and streaming
  AbstractChat,
  DefaultChatTransport,
  DefaultTaskTransport,
  HttpChatTransport,
  SerialJobExecutor,
  buildTaskPayload,
  createTaskRunner,
  createTaskTransport,
  fetchTask,
  generateId,
  getComparisonPlaceholderMessage,
  lastAssistantMessageIsCompleteWithToolCalls,
  parseJsonEventStream,
  parsePartialJson,
  processStream,
  repairPartialJson,
  resolveEndpoint,
  resolveValue,
  tryParseErrorMessage,
  tryParseJson,
} from 'instantsearch-core';
// Every type of core's public root (hooks' params and render states, `Hit`,
// `UiState`, …). The connector functions themselves are type-only here.
export type * from 'instantsearch-core';
// Names that exist both in `instantsearch-core` and in this package: the React
// export wins (an explicit export shadows a star export).
export { InstantSearch } from './components/InstantSearch';
export { default as version } from './version';
export * from './components/Configure';
export * from './components/DynamicWidgets';
export * from './components/Feeds';
export * from './components/Index';
export * from './components/InstantSearch';
export * from './components/InstantSearchServerContext';
export * from './components/InstantSearchSSRProvider';
export * from './connectors/useAutocomplete';
export * from './connectors/useBreadcrumb';
export * from './connectors/useChat';
export * from './connectors/usePromptSuggestions';
export * from './connectors/useResultCard';
export * from './connectors/useChatTrigger';
export * from './connectors/useCompare';
export * from './connectors/useClearRefinements';
export * from './connectors/useConfigure';
export * from './connectors/useCurrentRefinements';
export * from './connectors/useDynamicWidgets';
export * from './connectors/useFeeds';
export * from './connectors/useFrequentlyBoughtTogether';
export * from './connectors/useGeoSearch';
export * from './connectors/useHierarchicalMenu';
export * from './connectors/useHits';
export * from './connectors/useHitsPerPage';
export * from './connectors/useInfiniteHits';
export * from './connectors/useMenu';
export * from './connectors/useNumericMenu';
export * from './connectors/usePagination';
export * from './connectors/usePoweredBy';
export * from './connectors/useQueryRules';
export * from './connectors/useRange';
export * from './connectors/useRefinementList';
export * from './connectors/useRelatedProducts';
export * from './connectors/useSearchBox';
export * from './connectors/useSortBy';
export * from './connectors/useStats';
export * from './connectors/useToggleRefinement';
export * from './connectors/useTrendingItems';
export * from './connectors/useTrendingFacets';
export * from './connectors/useLookingSimilar';
export * from './hooks/useConnector';
export * from './hooks/useInstantSearch';
export * from './lib/wrapPromiseWithState';
export * from './lib/useInstantSearchContext';
export * from './lib/useRSCContext';
export * from './lib/InstantSearchRSCContext';
export * from './lib/InstantSearchSSRContext';
export * from './server';
