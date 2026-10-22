import type { ComponentProps } from '../../types';
import type {
  AbstractChat,
  ChatComponentContext,
  ChatState,
  ClientSideToolComponentProps,
  ClientSideTool as CoreClientSideTool,
  UIMessage,
} from 'instantsearch-core';

// The chat message and tool types live in `instantsearch-core`. They are
// re-exported so this package's public API keeps exposing them.
export type {
  AbstractChat,
  AddToolResult,
  AddToolResultForToolCall,
  AddToolResultWithOutput,
  ApplyFiltersParams,
  ChatComponentContext,
  ChatComponentPropsWithContext,
  ChatInit,
  ChatInsightsEventContext,
  ChatLoaderContext,
  ChatLoaderPhase,
  ChatLoaderPosition,
  ChatMessageBase,
  ChatOnDataCallback,
  ChatOnErrorCallback,
  ChatOnFinishCallback,
  ChatOnToolCallCallback,
  ChatRole,
  ChatState,
  ChatStatus,
  ChatToolMessage,
  ChatToolType,
  ChatTransport,
  ClientSideToolComponentProps,
  ClientSideToolContext,
  ClientSideToolShouldRenderContext,
  DataUIPart,
  DynamicToolUIPart,
  FileUIPart,
  IdGenerator,
  InferUIMessageData,
  InferUIMessageMetadata,
  InferUIMessageToolCall,
  InferUIMessageTools,
  ProviderMetadata,
  ReasoningUIPart,
  ResolvedSearchParams,
  SearchToolInput,
  SearchToolQuery,
  SourceDocumentUIPart,
  SourceUrlUIPart,
  StepStartUIPart,
  TextUIPart,
  ToolUIPart,
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITool,
  UITools,
  UserClientSideTool,
  UserClientSideTools,
} from 'instantsearch-core';

export type ClientSideToolComponent = (
  props: ClientSideToolComponentProps
) => JSX.Element;

export type ClientSideTool = Omit<CoreClientSideTool, 'layoutComponent'> & {
  layoutComponent?: ClientSideToolComponent;
};

export type ClientSideTools = Record<string, ClientSideTool>;

export type ChatLayoutOwnProps<TMessage extends UIMessage = UIMessage> = {
  open: boolean;
  maximized: boolean;
  headerComponent: JSX.Element;
  messagesComponent: JSX.Element;
  promptComponent: JSX.Element;
  classNames?: { root?: string | string[]; container?: string | string[] };
  isClearing?: boolean;
  clearMessages?: () => void;
  onClearTransitionEnd?: () => void;
  suggestions?: string[];
  tools: ClientSideTools;
} & Pick<ChatState<TMessage>, 'messages'> &
  Partial<Pick<ChatState<TMessage>, 'status'>> &
  Pick<
    AbstractChat<TMessage>,
    'sendMessage' | 'regenerate' | 'stop' | 'error'
  > &
  ComponentProps<'div'>;

/**
 * @deprecated Use `ChatComponentPropsWithContext` instead — an empty/greeting
 * component now reads shared chat state from its `context` prop.
 */
export type ChatEmptyProps = Partial<
  Pick<ChatComponentContext, 'sendMessage' | 'status' | 'onClose' | 'setInput'>
>;
