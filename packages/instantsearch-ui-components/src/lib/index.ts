export * from './chat';
export * from './cx';
export * from './stickToBottom';

// These helpers live in `instantsearch-core`. They are re-exported so this
// package's public API keeps exposing them.
export {
  addAbsolutePosition,
  addQueryID,
  collectChatRecords,
  createChatRecordsStore,
  endsInsideRootProperty,
  find,
  findTool,
  getJsonCursor,
  getPromptSuggestionHits,
  isPromptSuggestion,
  PROMPT_SUGGESTION_FLAG,
  startsWith,
} from 'instantsearch-core';
export type {
  ChatRecord,
  ChatRecords,
  ChatRecordsStore,
  JsonCursor,
  JsonCursorFrame,
} from 'instantsearch-core';
