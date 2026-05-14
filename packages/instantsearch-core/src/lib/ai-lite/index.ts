/**
 * ai-lite module - a minimal reimplementation of the 'ai' package.
 *
 * This module provides the core chat functionality needed for InstantSearch
 * without the full weight of the Vercel AI SDK.
 */

// Classes
export { AbstractChat } from './abstract-chat';
export { DefaultChatTransport, HttpChatTransport } from './transport';

// Utilities
export {
  generateId,
  lastAssistantMessageIsCompleteWithToolCalls,
  SerialJobExecutor,
} from './utils';

// Stream parsing
export { parseJsonEventStream, processStream } from './stream-parser';

// Types
export type {
  // Status
  ChatStatus,

  // Message types
  UIMessage,
  UIMessagePart,
  UIMessageChunk,
  UIDataTypes,
  UITools,
  UITool,
  ProviderMetadata,

  // Message part types
  TextUIPart,
  ReasoningUIPart,
  ToolUIPart,
  DynamicToolUIPart,
  SourceUrlUIPart,
  SourceDocumentUIPart,
  FileUIPart,
  StepStartUIPart,
  DataUIPart,

  // Inference types
  InferUIMessageMetadata,
  InferUIMessageData,
  InferUIMessageTools,
  InferUIMessageToolCall,
  InferUIMessageChunk,

  // State types
  ChatState,

  // Transport types
  ChatTransport,
  ChatRequestOptions,
  HttpChatTransportInitOptions,
  PrepareSendMessagesRequest,
  PrepareReconnectToStreamRequest,
  Resolvable,
  FetchFunction,

  // Init types
  ChatInit,
  IdGenerator,
  ChatOnErrorCallback,
  ChatOnToolCallCallback,
  ChatOnFinishCallback,
  ChatOnDataCallback,
  CreateUIMessage,
} from './types';
