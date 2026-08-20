import type { ChatRecordsStore } from '../../lib/utils/chatRecords';
import type { ComponentProps, SendEventForHits } from '../../types';
import type { SearchParameters } from 'algoliasearch-helper';

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

/**
 * What the current turn is doing, as reported by the chat itself.
 *
 * Where `ChatStatus` describes the request, this describes the response being
 * assembled. It is derived from the messages by the chat instance, not here —
 * mirrored from `instantsearch.js`'s `ai-lite` the same way `ChatStatus` is.
 */
export type ChatPhase =
  | 'idle'
  | 'awaiting-response'
  | 'answering'
  | 'calling-tool'
  | 'ran-tool';
export type ChatRole = 'data' | 'user' | 'assistant' | 'system';

/**
 * Provider metadata type for UI message parts.
 */
export type ProviderMetadata = Record<string, Record<string, unknown>>;

/**
 * A record of data types for data parts in UI messages.
 */
export type UIDataTypes = Record<string, unknown>;

/**
 * Tool input/output type definition.
 */
export type UITool = {
  input: unknown;
  output: unknown | undefined;
};

/**
 * A record of UI tools.
 */
export type UITools = Record<string, UITool>;

/**
 * Helper type to get values of an object.
 */
type ValueOf<T> = T[keyof T];

/**
 * Deep partial type.
 */
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * A text part of a message.
 */
export type TextUIPart = {
  type: 'text';
  text: string;
  state?: 'streaming' | 'done';
  providerMetadata?: ProviderMetadata;
};

/**
 * A reasoning part of a message.
 */
export type ReasoningUIPart = {
  type: 'reasoning';
  text: string;
  state?: 'streaming' | 'done';
  providerMetadata?: ProviderMetadata;
};

/**
 * A source URL part of a message.
 */
export type SourceUrlUIPart = {
  type: 'source-url';
  sourceId: string;
  url: string;
  title?: string;
  providerMetadata?: ProviderMetadata;
};

/**
 * A document source part of a message.
 */
export type SourceDocumentUIPart = {
  type: 'source-document';
  sourceId: string;
  mediaType: string;
  title: string;
  filename?: string;
  providerMetadata?: ProviderMetadata;
};

/**
 * A file part of a message.
 */
export type FileUIPart = {
  type: 'file';
  mediaType: string;
  filename?: string;
  url: string;
  providerMetadata?: ProviderMetadata;
};

/**
 * A step boundary part of a message.
 */
export type StepStartUIPart = {
  type: 'step-start';
};

/**
 * A data part of a message.
 */
export type DataUIPart<TDataTypes extends UIDataTypes> = ValueOf<{
  [NAME in keyof TDataTypes & string]: {
    type: `data-${NAME}`;
    id?: string;
    data: TDataTypes[NAME];
  };
}>;

/**
 * A tool invocation part of a message.
 */
export type ToolUIPart<TTools extends UITools = UITools> = ValueOf<{
  [NAME in keyof TTools & string]: {
    type: `tool-${NAME}`;
    toolCallId: string;
  } & (
    | {
        state: 'input-streaming';
        input: DeepPartial<TTools[NAME]['input']> | undefined;
        /**
         * The raw accumulated input text. `input` is parsed from it with
         * partial-JSON repair, so a value still mid-delta can be exposed as a
         * complete one. Consult this when completeness matters.
         */
        rawInput?: string;
        providerExecuted?: boolean;
        output?: never;
        errorText?: never;
      }
    | {
        state: 'input-available';
        input: TTools[NAME]['input'];
        providerExecuted?: boolean;
        output?: never;
        errorText?: never;
        callProviderMetadata?: ProviderMetadata;
      }
    | {
        state: 'output-available';
        input: TTools[NAME]['input'];
        output: TTools[NAME]['output'];
        errorText?: never;
        providerExecuted?: boolean;
        callProviderMetadata?: ProviderMetadata;
        preliminary?: boolean;
      }
    | {
        state: 'output-error';
        input: TTools[NAME]['input'] | undefined;
        rawInput?: unknown;
        output?: never;
        errorText: string;
        providerExecuted?: boolean;
        callProviderMetadata?: ProviderMetadata;
      }
  );
}>;

/**
 * A dynamic tool invocation part of a message.
 */
export type DynamicToolUIPart = {
  type: 'dynamic-tool';
  toolName: string;
  toolCallId: string;
} & (
  | {
      state: 'input-streaming';
      input: unknown | undefined;
      output?: never;
      errorText?: never;
    }
  | {
      state: 'input-available';
      input: unknown;
      output?: never;
      errorText?: never;
      callProviderMetadata?: ProviderMetadata;
    }
  | {
      state: 'output-available';
      input: unknown;
      output: unknown;
      errorText?: never;
      callProviderMetadata?: ProviderMetadata;
      preliminary?: boolean;
    }
  | {
      state: 'output-error';
      input: unknown;
      output?: never;
      errorText: string;
      callProviderMetadata?: ProviderMetadata;
    }
);

/**
 * All possible message part types.
 */
export type UIMessagePart<
  TDataTypes extends UIDataTypes = UIDataTypes,
  TTools extends UITools = UITools,
> =
  | TextUIPart
  | ReasoningUIPart
  | ToolUIPart<TTools>
  | DynamicToolUIPart
  | SourceUrlUIPart
  | SourceDocumentUIPart
  | FileUIPart
  | DataUIPart<TDataTypes>
  | StepStartUIPart;

/**
 * AI SDK UI Messages. They are used in the client and to communicate between the frontend and the API routes.
 */
export interface UIMessage<
  TMetadata = unknown,
  TDataParts extends UIDataTypes = UIDataTypes,
  TTools extends UITools = UITools,
> {
  /** A unique identifier for the message. */
  id: string;
  /** The role of the message. */
  role: 'system' | 'user' | 'assistant';
  /** The metadata of the message. */
  metadata?: TMetadata;
  /** The parts of the message. Use this for rendering the message in the UI. */
  parts: Array<UIMessagePart<TDataParts, TTools>>;
}

export type ChatMessageBase = UIMessage;

export type ChatToolMessage = Extract<
  ChatMessageBase['parts'][number],
  { type: `tool-${string}` }
>;
export type ChatToolType = ChatToolMessage['type'];

/**
 * Infer metadata type from UIMessage.
 */
export type InferUIMessageMetadata<T extends UIMessage> =
  T extends UIMessage<infer TMetadata> ? TMetadata : unknown;

/**
 * Infer data types from UIMessage.
 */
export type InferUIMessageData<T extends UIMessage> =
  T extends UIMessage<unknown, infer TDataTypes> ? TDataTypes : UIDataTypes;

/**
 * Infer tools from UIMessage.
 */
export type InferUIMessageTools<T extends UIMessage> =
  T extends UIMessage<unknown, UIDataTypes, infer TTools> ? TTools : UITools;

/**
 * Chat state interface.
 */
export interface ChatState<TUIMessage extends UIMessage> {
  status: ChatStatus;
  error: Error | undefined;
  messages: TUIMessage[];
  pushMessage: (message: TUIMessage) => void;
  popMessage: () => void;
  replaceMessage: (index: number, message: TUIMessage) => void;
  snapshot: <T>(thing: T) => T;
}

/**
 * ID generator function type.
 */
export type IdGenerator = () => string;

/**
 * Callback function to be called when an error is encountered.
 */
export type ChatOnErrorCallback = (error: Error) => void;

/**
 * Infer tool call type from UIMessage.
 */
export type InferUIMessageToolCall<TUIMessage extends UIMessage> =
  | ValueOf<{
      [NAME in keyof InferUIMessageTools<TUIMessage>]: {
        toolName: NAME & string;
        toolCallId: string;
        input: InferUIMessageTools<TUIMessage>[NAME] extends {
          input: infer INPUT;
        }
          ? INPUT
          : never;
        dynamic?: false;
      };
    }>
  | {
      toolName: string;
      toolCallId: string;
      input: unknown;
      dynamic: true;
    };

/**
 * Optional callback function that is invoked when a tool call is received.
 */
export type ChatOnToolCallCallback<TUIMessage extends UIMessage = UIMessage> =
  (options: {
    toolCall: InferUIMessageToolCall<TUIMessage>;
  }) => void | PromiseLike<void>;

/**
 * Function that is called when the assistant response has finished streaming.
 */
export type ChatOnFinishCallback<TUIMessage extends UIMessage> = (options: {
  message: TUIMessage;
  messages: TUIMessage[];
  isAbort: boolean;
  isDisconnect: boolean;
  isError: boolean;
}) => void;

/**
 * Optional callback function that is called when a data part is received.
 */
export type ChatOnDataCallback<TUIMessage extends UIMessage> = (
  dataPart: DataUIPart<InferUIMessageData<TUIMessage>>
) => void;

/**
 * Transport interface for sending and receiving chat messages.
 */
export interface ChatTransport<TUIMessage extends UIMessage> {
  sendMessages: (options: {
    chatId: string;
    messages: TUIMessage[];
    abortSignal: AbortSignal;
    requestMetadata?: unknown;
    trigger: 'submit-message' | 'regenerate-message';
    messageId?: string;
  }) => Promise<ReadableStream<unknown>>;

  reconnectToStream: (options: {
    chatId: string;
  }) => Promise<ReadableStream<unknown> | null>;
}

/**
 * Chat initialization options.
 */
export interface ChatInit<TUIMessage extends UIMessage> {
  /** A unique identifier for the chat. If not provided, a random one will be generated. */
  id?: string;
  messages?: TUIMessage[];
  /** A way to provide a function for generating message and chat IDs. */
  generateId?: IdGenerator;
  transport?: ChatTransport<TUIMessage>;
  /** Callback function to be called when an error is encountered. */
  onError?: ChatOnErrorCallback;
  /** Optional callback function that is invoked when a tool call is received. */
  onToolCall?: ChatOnToolCallCallback<TUIMessage>;
  /** Function that is called when the assistant response has finished streaming. */
  onFinish?: ChatOnFinishCallback<TUIMessage>;
  /** Optional callback function that is called when a data part is received. */
  onData?: ChatOnDataCallback<TUIMessage>;
  /**
   * When provided, this function will be called when the stream is finished or a tool call is added
   * to determine if the current messages should be resubmitted.
   */
  sendAutomaticallyWhen?: (options: {
    messages: TUIMessage[];
  }) => boolean | PromiseLike<boolean>;
}

/**
 * Abstract base class for chat implementations.
 */
export interface AbstractChat<TUIMessage extends UIMessage> {
  readonly id: string;
  readonly generateId: IdGenerator;

  status: ChatStatus;
  error: Error | undefined;
  messages: TUIMessage[];
  lastMessage: TUIMessage | undefined;

  sendMessage: (
    message?:
      | (Omit<TUIMessage, 'id' | 'role'> & {
          id?: TUIMessage['id'];
          role?: TUIMessage['role'];
          text?: never;
          files?: never;
          messageId?: string;
        })
      | {
          text: string;
          files?: FileList | FileUIPart[];
          metadata?: InferUIMessageMetadata<TUIMessage>;
          parts?: never;
          messageId?: string;
        }
      | {
          files: FileList | FileUIPart[];
          metadata?: InferUIMessageMetadata<TUIMessage>;
          parts?: never;
          messageId?: string;
        },
    options?: { headers?: Record<string, string> | Headers; body?: object }
  ) => Promise<void>;

  regenerate: (
    options?: {
      messageId?: string;
    } & { headers?: Record<string, string> | Headers; body?: object }
  ) => Promise<void>;

  resumeStream: (options?: {
    headers?: Record<string, string> | Headers;
    body?: object;
  }) => Promise<void>;

  resetConversationId: () => void;

  clearError: () => void;

  addToolResult: <TTool extends keyof InferUIMessageTools<TUIMessage>>(params: {
    tool: TTool;
    toolCallId: string;
    output: InferUIMessageTools<TUIMessage>[TTool]['output'];
  }) => Promise<void>;

  stop: () => Promise<void>;
}
export type AddToolResult = AbstractChat<UIMessage>['addToolResult'];

export type AddToolResultWithOutput = (
  params: Pick<Parameters<AddToolResult>[0], 'output'>
) => ReturnType<AddToolResult>;

type SearchToolExtraFields = {
  [key: string]: unknown;
};

type SearchToolQueryBase = SearchToolExtraFields & {
  query: string;
  number_of_results?: number;
};

type FacetFiltersSearchToolQuery = SearchToolQueryBase & {
  facet_filters?: string[][];
};

type FacetKeysSearchToolQuery = SearchToolQueryBase & {
  facet_filters?: undefined;
  [facetKey: `facet_${string}`]: string[] | undefined;
};

/**
 * A single query of a search tool input: the query string along with its
 * refinements, either as a ready-to-use `facet_filters` array or as individual
 * `facet_<attribute>` keys.
 */
export type SearchToolQuery =
  | FacetFiltersSearchToolQuery
  | FacetKeysSearchToolQuery;

/** Search tool input holding the query and its refinements at the root. */
type SingleQuerySearchToolInput = SearchToolQuery & { queries?: undefined };

/** Search tool input nesting one or more queries in a `queries` array. */
type MultiQuerySearchToolInput = SearchToolExtraFields & {
  query?: undefined;
  facet_filters?: undefined;
  queries: SearchToolQuery[];
};

export type SearchToolInput =
  | SingleQuerySearchToolInput
  | MultiQuerySearchToolInput;

export type ApplyFiltersParams = {
  query?: string;
  facetFilters?: string[][];
};

export type ChatLayoutOwnProps<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = {
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
 * The turn state the chat instance reports about itself, derived once from
 * `messages` and `status` outside the view and forwarded verbatim.
 *
 * Everything here is a pure function of state the chat already owns, which is
 * why it is computed by the chat instance rather than re-derived by whichever
 * component happens to need it. Components read these off `context`; none of
 * them should be inspecting `messages` or comparing `status` to work the same
 * answers out again.
 */
export type ChatTurnState<TMessage extends ChatMessageBase = ChatMessageBase> =
  {
    /**
     * What the current turn is doing.
     */
    phase: ChatPhase;
    /**
     * The message part currently being produced, if any.
     */
    activePart?: TMessage['parts'][number];
    /**
     * Whether the turn is mid-reasoning: a reasoning part is still streaming and
     * nothing settled has followed it.
     */
    hasActiveReasoning: boolean;
    /**
     * Whether a request is in flight — the `phase !== 'idle'` shorthand, so no
     * component has to re-test `status` against its two in-flight values.
     */
    isBusy: boolean;
    /**
     * The last message in the conversation, for components asking "is this row
     * the current one?".
     */
    lastMessage?: TMessage;
    /**
     * Whether to show the progress loader below the transcript.
     *
     * Decided outside the view, by the layer that owns the messages, the turn
     * phase and the tool registry the decision reads.
     */
    showLoader: boolean;
  };

/**
 * Shared chat state and callbacks injected into every overridable chat
 * component by the widget. This is the component-layer analog of the templates
 * system's `params` argument: a single, consistent object every component can
 * read, regardless of which override point it plugs into.
 */
export type ChatComponentContext<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = ChatTurnState<TMessage> & {
  /**
   * The messages currently in the chat.
   */
  messages: TMessage[];
  /**
   * Current chat status.
   */
  status: ChatStatus;
  /**
   * The current error, when the chat is in an error state.
   */
  error?: Error;
  /**
   * Whether the messages are being cleared (drives the clearing animation).
   */
  isClearing: boolean;
  /**
   * Whether the chat panel is open.
   */
  open: boolean;
  /**
   * Whether the chat panel is maximized.
   */
  maximized: boolean;
  /**
   * Tools registered for the assistant.
   */
  tools: ClientSideTools;
  /**
   * Send a message to the chat.
   */
  sendMessage?: ChatLayoutOwnProps['sendMessage'];
  /**
   * Regenerate the last assistant response.
   */
  regenerate: ChatLayoutOwnProps['regenerate'];
  /**
   * Stop the current streaming response.
   */
  stop: ChatLayoutOwnProps['stop'];
  /**
   * Set the prompt input value.
   */
  setInput?: (input: string) => void;
  /**
   * Reload (regenerate) a message, optionally targeting a specific message id.
   */
  onReload: (messageId?: string) => void;
  /**
   * Clear the conversation and start a new one, when available.
   */
  onNewConversation?: () => void;
  /**
   * Close the chat.
   */
  onClose: () => void;
};

/**
 * Augments a chat component's own props with the shared `context` the widget
 * always injects. `TOwnProps` is the per-component presentational config that
 * stays at the root; `context` is the shared chat state and callbacks.
 */
export type ChatComponentPropsWithContext<
  TOwnProps = {},
  TMessage extends ChatMessageBase = ChatMessageBase,
> = TOwnProps & {
  context: ChatComponentContext<TMessage>;
};

/**
 * The `context` a tool layout component receives: the shared
 * `ChatComponentContext` merged with the tool's own injected data (the tool
 * `message`, event/filter callbacks, and index UI state).
 */
export type ClientSideToolContext<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = ChatComponentContext<TMessage> & {
  message: ChatToolMessage;
  /**
   * The chat message the tool call belongs to. `message` is the tool part
   * itself, which carries no metadata of its own; per-turn decisions the
   * backend records on the message are read from here.
   */
  parentMessage: TMessage;
  /**
   * The records the chat's tools have fetched. A tool handed plain object IDs
   * hydrates them with `records.get(objectID)`.
   */
  records?: ChatRecordsStore;
  insightsEventContext?: ChatInsightsEventContext;
  indexUiState: object;
  setIndexUiState: (state: object) => void;
  addToolResult: AddToolResultWithOutput;
  applyFilters: (params: ApplyFiltersParams) => SearchParameters;
  sendEvent: SendEventForHits;
};

/**
 * A tool context minus the fields a `shouldRender` decision cannot see.
 *
 * `maximized` is per-flavor panel state and `isClearing` drives a fade-out
 * transition, so only a renderer knows them. `showLoader` is withheld for the
 * opposite reason: the answer partly *depends* on whether this tool renders,
 * so reading it here would be circular.
 *
 * Everything else is known outside the view, which is what lets decisions
 * typed against this be made where the messages and the tools live.
 */
export type ClientSideToolStateContext<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = Omit<
  ClientSideToolContext<TMessage>,
  'isClearing' | 'maximized' | 'showLoader'
>;

/**
 * The root-level props tool layout components received before everything moved
 * under `context`. Still passed alongside `context` so components written
 * against the previous API keep working; they are removed in the next major.
 *
 * These are spelled out rather than derived with `Pick` so that `@deprecated`
 * reaches each property at the point of use in editors.
 */
type DeprecatedClientSideToolRootProps<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = {
  /** @deprecated Read `context.message` instead. */
  message: ChatToolMessage;
  /** @deprecated Read `context.messages` instead. */
  messages: TMessage[];
  /** @deprecated Read `context.records` instead. */
  records?: ChatRecordsStore;
  /** @deprecated Read `context.insightsEventContext` instead. */
  insightsEventContext?: ChatInsightsEventContext;
  /** @deprecated Read `context.status` instead. */
  status: ChatStatus;
  /** @deprecated Read `context.indexUiState` instead. */
  indexUiState: object;
  /** @deprecated Read `context.setIndexUiState` instead. */
  setIndexUiState: (state: object) => void;
  /** @deprecated Read `context.onClose` instead. */
  onClose: () => void;
  /** @deprecated Read `context.addToolResult` instead. */
  addToolResult: AddToolResultWithOutput;
  /** @deprecated Read `context.applyFilters` instead. */
  applyFilters: (params: ApplyFiltersParams) => SearchParameters;
  /** @deprecated Read `context.sendEvent` instead. */
  sendEvent: SendEventForHits;
};

/**
 * Tool layout components receive a single `context` object holding everything
 * they render from. The deprecated root-level props are kept required (rather
 * than optional) so existing components that destructure them keep
 * type-checking under `strict`; the widget always supplies both.
 */
export type ClientSideToolComponentProps<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = {
  context: ClientSideToolContext<TMessage>;
} & DeprecatedClientSideToolRootProps<TMessage>;

export type ClientSideToolComponent = (
  props: ClientSideToolComponentProps
) => JSX.Element;

export type ChatInsightsEventContext = {
  agentId?: string;
  instantSearchStatus?: 'idle' | 'loading' | 'stalled' | 'error';
};

export type ClientSideTool = {
  layoutComponent?: ClientSideToolComponent;
  streamInput?: boolean;
  /**
   * Whether this tool call renders anything for the turn it belongs to.
   *
   * Receives the same `context` as `layoutComponent` minus `maximized` and
   * `isClearing`, so the decision and the rendering read identical data while
   * the connector — which owns neither of those — can still make the call.
   *
   * Returning `false` skips the part and keeps the loader up, since a part that
   * renders nothing leaves the turn looking unfinished — that lets a tool stand
   * aside for another one covering the same turn, as the search tool does for
   * the richer display-results tool. Omitted means always render.
   */
  shouldRender?: (context: ClientSideToolStateContext) => boolean;
  addToolResult: AddToolResult;
  /** Attached by the connector, one per chat; reaches `layoutComponent`. */
  records?: ChatRecordsStore;
  sendEvent?: SendEventForHits;
  insightsEventContext?: ChatInsightsEventContext;
  onToolCall?: (
    params: Parameters<
      NonNullable<ChatInit<UIMessage>['onToolCall']>
    >[0]['toolCall'] & {
      addToolResult: AddToolResultWithOutput;
    }
  ) => void;
  /**
   * Output reported for this tool call when a request is sent while it is still
   * waiting for a result, for example `{ confirmed: false }` for a confirmation
   * prompt. Without it, the call is reported as failed.
   *
   * This only affects what is sent: the tool keeps waiting locally, so a result
   * submitted later still lands.
   */
  cancelOutput?: (params: { toolCallId: string; input: unknown }) => unknown;
  applyFilters: (params: ApplyFiltersParams) => SearchParameters;
};
export type ClientSideTools = Record<string, ClientSideTool>;

export type UserClientSideTool = Omit<
  ClientSideTool,
  | 'addToolResult'
  | 'applyFilters'
  | 'sendEvent'
  | 'insightsEventContext'
  | 'records'
>;
export type UserClientSideTools = Record<string, UserClientSideTool>;

/**
 * @deprecated Use `ChatComponentPropsWithContext` instead — an empty/greeting
 * component now reads shared chat state from its `context` prop.
 */
export type ChatEmptyProps = Partial<
  Pick<ChatComponentContext, 'sendMessage' | 'status' | 'onClose' | 'setInput'>
>;
