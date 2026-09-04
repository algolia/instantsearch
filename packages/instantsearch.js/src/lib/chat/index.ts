export type { UIMessage } from './chat';
export type { ChatInit } from './chat';
export { AbstractChat } from './chat';
export { ChatState } from './chat';
export { Chat } from './chat';

export { openChat, isChatBusy } from './openChat';
export type { OpenChatOptions } from './openChat';

export const SearchIndexToolType = 'algolia_search_index';
export const RecommendToolType = 'algolia_recommend';
export const MemorizeToolType = 'algolia_memorize';
export const MemorySearchToolType = 'algolia_memory_search';
export const PonderToolType = 'algolia_ponder';
export const DisplayResultsToolType = 'algolia_display_results';
export const CompareProductsToolType = 'algolia_compare_products';

/**
 * Whether `toolName` is the search tool as the Algolia MCP Server exposes it:
 * one tool per index, named after the index it searches
 * (`algolia_search_index_products`).
 */
export const matchesSearchIndexToolName = (toolName: string) =>
  toolName.startsWith(`${SearchIndexToolType}_`);
