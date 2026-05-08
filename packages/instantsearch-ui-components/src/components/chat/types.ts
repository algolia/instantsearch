import type { ComponentProps } from '../../types';
import type {
  AbstractChat,
  ChatState,
  ChatStatus,
  ClientSideTool as CoreClientSideTool,
  ClientSideToolComponentProps,
  UIMessage,
} from 'instantsearch-core';

export type {
  // Status
  ChatStatus,

  // Tool primitives
  UIDataTypes,
  UITool,
  UITools,
  ProviderMetadata,

  // Message part types
  TextUIPart,
  ReasoningUIPart,
  SourceUrlUIPart,
  SourceDocumentUIPart,
  FileUIPart,
  StepStartUIPart,
  DataUIPart,
  ToolUIPart,
  DynamicToolUIPart,
  UIMessagePart,
  UIMessage,

  // Inference helpers
  InferUIMessageMetadata,
  InferUIMessageData,
  InferUIMessageTools,
  InferUIMessageToolCall,

  // Chat lifecycle
  ChatState,
  IdGenerator,
  ChatOnErrorCallback,
  ChatOnToolCallCallback,
  ChatOnFinishCallback,
  ChatOnDataCallback,
  ChatTransport,
  ChatInit,
  AbstractChat,

  // Tool plumbing
  AddToolResult,
  AddToolResultWithOutput,
  SearchToolInput,
  ApplyFiltersParams,
  ClientSideToolComponentProps,
  UserClientSideTool,
  UserClientSideTools,
} from 'instantsearch-core';

export type ChatMessageBase = UIMessage;

export type ChatToolMessage = Extract<
  ChatMessageBase['parts'][number],
  { type: `tool-${string}` }
>;

export type ClientSideToolComponent = (
  props: ClientSideToolComponentProps
) => JSX.Element;

export type ClientSideTool = Omit<CoreClientSideTool, 'layoutComponent'> & {
  layoutComponent?: ClientSideToolComponent;
};

export type ClientSideTools = Record<string, ClientSideTool>;

export type ChatLayoutOwnProps<
  TMessage extends ChatMessageBase = ChatMessageBase
> = {
  open: boolean;
  maximized: boolean;
  headerComponent: JSX.Element;
  messagesComponent: JSX.Element;
  promptComponent: JSX.Element;
  toggleButtonComponent: JSX.Element;
  classNames?: { root?: string | string[]; container?: string | string[] };
  isClearing?: boolean;
  clearMessages?: () => void;
  onClearTransitionEnd?: () => void;
  suggestions?: string[];
  tools: ClientSideTools;
} & Pick<ChatState<TMessage>, 'messages'> &
  Partial<Pick<ChatState<TMessage>, 'status'>> &
  Pick<AbstractChat<TMessage>, 'sendMessage' | 'regenerate' | 'stop' | 'error'> &
  ComponentProps<'div'>;

export type ChatEmptyProps = {
  /**
   * Function to send a message to the chat
   */
  sendMessage?: ChatLayoutOwnProps['sendMessage'];
  /**
   * Current chat status
   */
  status?: ChatStatus;
  /**
   * Callback to close the chat
   */
  onClose?: () => void;
  /**
   * Function to set the prompt input value
   */
  setInput?: (input: string) => void;
};
