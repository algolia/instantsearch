export { useChatPageSuggestionsStandalone } from './useChatPageSuggestionsStandalone';
export { ChatPageSuggestionsStandalone } from './ChatPageSuggestionsStandalone';

export type {
  UseChatPageSuggestionsStandaloneProps,
  UseChatPageSuggestionsStandaloneReturn,
} from './useChatPageSuggestionsStandalone';
export type { ChatPageSuggestionsStandaloneProps } from './ChatPageSuggestionsStandalone';

// Re-export the core primitives so callers can build custom UIs without
// importing from the deep `instantsearch.js/es/...` subpath.
export {
  prefetchChatPageSuggestions,
  createChatPageSuggestionsStore,
  dispatchSuggestionClick,
  CHAT_PAGE_SUGGESTION_CLICK_EVENT,
} from 'instantsearch.js/es/lib/standalone/chat-page-suggestions';
export type {
  PrefetchChatPageSuggestionsParams,
  ChatPageSuggestionsStore,
  ChatPageSuggestionsStoreParams,
  ChatPageSuggestionsStoreState,
  ChatPageSuggestionsFetchInput,
  ChatPageSuggestionsTransport,
  ChatPageSuggestionClickDetail,
} from 'instantsearch.js/es/lib/standalone/chat-page-suggestions';
