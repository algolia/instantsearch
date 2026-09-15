export type { UIMessage } from './chat';
export type { ChatInit } from './chat';
export { AbstractChat } from './chat';
export { ChatState } from './chat';
export { Chat } from './chat';

export { openChat, isChatBusy } from './openChat';
export type { OpenChatOptions, ChatReferer } from './openChat';
export { buildFilters, stripInternalHitMetadata } from './pageContext';

export const SearchIndexToolType = 'algolia_search_index';
export const RecommendToolType = 'algolia_recommend';
export const MemorizeToolType = 'algolia_memorize';
export const MemorySearchToolType = 'algolia_memory_search';
export const PonderToolType = 'algolia_ponder';
export const CompareProductsToolType = 'algolia_compare_products';
export const GroupedResultsToolType = 'algolia_grouped_results';
/**
 * @deprecated The tool is now `algolia_grouped_results`
 * ({@link GroupedResultsToolType}). This name is still emitted by agents
 * configured before the rename, and renders the same UI.
 */
export const DisplayResultsToolType = 'algolia_display_results';

/**
 * Whether `toolName` is the search tool as the Algolia MCP Server exposes it:
 * one tool per index, named after the index it searches
 * (`algolia_search_index_products`).
 */
export const matchesSearchIndexToolName = (toolName: string) =>
  toolName.startsWith(`${SearchIndexToolType}_`);
