// Helpers for the first-party flavors (instantsearch.js, react-instantsearch,
// vue-instantsearch). Not public API: no semver guarantees.
export { index } from './widgets';
export { default as version } from './version';
export { default as InstantSearch } from './instantsearch';
export { instantsearch } from './instantsearch';
export { INSTANTSEARCH_FUTURE_DEFAULTS } from './instantsearch';
export {
  highlight,
  snippet,
  reverseHighlight,
  reverseSnippet,
  insights,
  getInsightsAnonymousUserTokenInternal,
  ANONYMOUS_TOKEN_COOKIE_KEY,
  getUsageSessionId,
  readDataAttributes,
  writeDataAttributes,
} from './helpers';
export { withInsights, inferInsightsPayload } from './lib/insights';
export {
  Chat,
  ChatState,
  CACHE_KEY,
  SearchIndexToolType,
  RecommendToolType,
  MemorizeToolType,
  MemorySearchToolType,
  PonderToolType,
  CompareProductsToolType,
  GroupedResultsToolType,
  focusAfterReveal,
  getActiveContainerAnimations,
  holdContainerInertUntilReveal,
  restoreContainerInertUntilReveal,
  openChat,
  isChatBusy,
  isSilentUserMessage,
  isReasoningPartActive,
  isPartTextEmpty,
  isPartProgressSignal,
  findLastProgressPart,
  getResolvedSearchParams,
  getApplyFiltersParamsFromToolInput,
  isGroupedResultsEnabled,
  shouldSearchToolRenderResults,
} from './lib/chat';
export type {
  OpenChatOptions,
  ChatReferer,
  ContainerAnimationSnapshot,
} from './lib/chat';
export { default as createVoiceSearchHelper } from './lib/voiceSearchHelper';
export type {
  CreateVoiceSearchHelper,
  VoiceSearchHelper,
  VoiceSearchHelperParams,
  Status as VoiceSearchStatus,
  VoiceListeningState,
} from './lib/voiceSearchHelper/types';
export {
  _buildEventPayloadsForHits,
  addAbsolutePosition,
  addQueryID,
  buildWidgetTree,
  capitalize,
  collectChatRecords,
  createDocumentationMessageGenerator,
  deprecate,
  deserializePayload,
  endsInsideRootProperty,
  extractWidgetPayload,
  find,
  findTool,
  getAppIdAndApiKey,
  getJsonCursor,
  getObjectType,
  getPromptSuggestionHits,
  getTextContent,
  getWidgetAttribute,
  hasTextContent,
  hydrateSearchClient,
  isEqual,
  isIndexWidget,
  isPartText,
  isPartTool,
  isPromptSuggestion,
  isSpecialClick,
  isTwoPassWidget,
  noop,
  omit,
  range,
  resetWidgetId,
  resolveSearchParameters,
  safelyRunOnBrowser,
  serializePayload,
  serializeWidgetParams,
  startsWith,
  TAG_PLACEHOLDER,
  toArray,
  uniq,
  walkIndex,
  warn,
  warning,
} from './lib/utils';
export type {
  ChatMessageBase,
  ChatRecord,
  ChatRecordsStore,
  ChatToolMessage,
  WidgetMetadata,
} from './lib/utils';
export type {
  HighlightOptions,
  SnippetOptions,
  ReverseHighlightOptions,
  ReverseSnippetOptions,
} from './helpers';
export { component as suitComponent } from './lib/suit';
