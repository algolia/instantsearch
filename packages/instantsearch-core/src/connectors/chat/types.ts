import type { ChatStatus } from '../../lib/ai-lite';
import type { AbstractChat, ChatInit, UIMessage } from '../../lib/chat';
import type { ChatToolMessage } from '../../lib/utils/chatMessage';
import type { ChatRecordsStore } from '../../lib/utils/chatRecords';
import type { SendEventForHits } from '../../lib/utils/createSendEventForHits';
import type { SearchParameters } from 'algoliasearch-helper';

export type ChatRole = 'data' | 'user' | 'assistant' | 'system';

export type AddToolResult = AbstractChat<UIMessage>['addToolResult'];

export type AddToolResultWithOutput = (params: {
  output: unknown;
}) => ReturnType<AddToolResult>;

export type AddToolResultForToolCall = (
  params:
    | {
        state?: 'output-available';
        output: unknown;
        errorText?: never;
      }
    | {
        state: 'output-error';
        output?: never;
        errorText: string;
      }
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
  [facetKey: `facet_${string}`]: string[] | boolean | undefined;
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
  /**
   * Numeric refinements, in the Algolia `numericFilters` format
   * (e.g. `['price <= 1500']`). Only the search tool's resolved search params
   * can express these; the raw `facet_<attribute>` keys cannot.
   */
  numericFilters?: string[];
};

/**
 * The search parameters a search tool call was actually answered with, as the
 * Algolia MCP Server resolved them: after defaults, clamping and the
 * allow-list, and including parameters the model never sent.
 *
 * Read with `getResolvedSearchParams`. Absent whenever the server emits no
 * `_meta` for the tool result.
 */
export type ResolvedSearchParams = {
  query?: string;
  facetFilters?: string[][];
  numericFilters?: string[];
};

/**
 * Where the chat loader renders: as its own row after the last message
 * (`messages-end`, the default), or inside the streaming assistant message
 * (`message-inline`, falling back to a row when there is none to host it).
 */
export type ChatLoaderPosition = 'messages-end' | 'message-inline';

/**
 * What the turn is doing while the loader shows: the request is `submitted` with
 * nothing back yet, a `tool` call is in flight, `reasoning` settled before the
 * answer started, or `thinking` for anything else.
 */
export type ChatLoaderPhase = 'submitted' | 'tool' | 'reasoning' | 'thinking';

/**
 * Shared chat state and callbacks injected into every overridable chat
 * component by the widget. This is the component-layer analog of the templates
 * system's `params` argument: a single, consistent object every component can
 * read, regardless of which override point it plugs into.
 */
export type ChatComponentContext<TMessage extends UIMessage = UIMessage> = {
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
   * The message part currently being processed by the assistant, if any.
   */
  activePart?: TMessage['parts'][number];
  /**
   * Tools registered for the assistant.
   */
  tools: ClientSideTools;
  /**
   * Send a message to the chat.
   */
  sendMessage?: AbstractChat<UIMessage>['sendMessage'];
  /**
   * Regenerate the last assistant response.
   */
  regenerate: AbstractChat<UIMessage>['regenerate'];
  /**
   * Stop the current streaming response.
   */
  stop: AbstractChat<UIMessage>['stop'];
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
 * The `context` the loader receives: the shared `ChatComponentContext` plus what
 * the current turn is doing.
 */
export type ChatLoaderContext<TMessage extends UIMessage = UIMessage> =
  ChatComponentContext<TMessage> & {
    /**
     * What the turn is doing right now.
     */
    phase: ChatLoaderPhase;
    /**
     * The message the loader belongs to, when there is one.
     */
    message?: TMessage;
  };

/**
 * Augments a chat component's own props with the shared `context` the widget
 * always injects. `TOwnProps` is the per-component presentational config that
 * stays at the root; `context` is the shared chat state and callbacks.
 */
export type ChatComponentPropsWithContext<
  TOwnProps = {},
  TMessage extends UIMessage = UIMessage,
> = TOwnProps & {
  context: ChatComponentContext<TMessage>;
};

/**
 * The `context` a tool layout component receives: the shared
 * `ChatComponentContext` merged with the tool's own injected data (the tool
 * `message`, event/filter callbacks, and index UI state).
 */
export type ClientSideToolContext<TMessage extends UIMessage = UIMessage> =
  ChatComponentContext<TMessage> & {
    message: ChatToolMessage;
    /**
     * The records the conversation holds (fetched by tools or selected for a
     * comparison). A tool handed plain object IDs hydrates them with
     * `records.get(objectID)`.
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
 * The root-level props tool layout components received before everything moved
 * under `context`. Still passed alongside `context` so components written
 * against the previous API keep working; they are removed in the next major.
 *
 * These are spelled out rather than derived with `Pick` so that `@deprecated`
 * reaches each property at the point of use in editors.
 */
type DeprecatedClientSideToolRootProps<TMessage extends UIMessage = UIMessage> =
  {
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
  TMessage extends UIMessage = UIMessage,
> = {
  context: ClientSideToolContext<TMessage>;
} & DeprecatedClientSideToolRootProps<TMessage>;

/**
 * The renderer-agnostic shape of a tool layout component. Each flavor narrows
 * the return type to what its renderer produces (for example `JSX.Element`).
 */
export type ClientSideToolComponent = (
  props: ClientSideToolComponentProps
) => any;

export type ChatInsightsEventContext = {
  agentId?: string;
  instantSearchStatus?: 'idle' | 'loading' | 'stalled' | 'error';
};

/**
 * The `context` a tool's `shouldRender` predicate receives: the shared
 * `ChatComponentContext`, the tool part under consideration, and the chat
 * message that part belongs to.
 *
 * Narrower than `ClientSideToolContext` on purpose. The predicate decides
 * whether anything renders at all, and it also runs from the loader, which has
 * none of the render-time callbacks a layout component is handed.
 */
export type ClientSideToolShouldRenderContext<
  TMessage extends UIMessage = UIMessage,
> = ChatComponentContext<TMessage> & {
  /**
   * The tool part being considered for rendering.
   */
  message: ChatToolMessage;
  /**
   * The chat message the tool part belongs to.
   */
  parentMessage: TMessage;
};

export type ClientSideTool = {
  layoutComponent?: ClientSideToolComponent;
  streamInput?: boolean;
  /**
   * Whether this tool also handles a call sent under `toolName`.
   *
   * Consulted only when no tool is registered under that exact name, so it
   * can't shadow another registration. Needed when the server names a call
   * after the registered tool: the Algolia MCP Server appends the index name,
   * so `algolia_search_index` has to answer to `algolia_search_index_products`.
   *
   * Omitted means the tool only handles its own name.
   */
  matchesToolName?: (toolName: string) => boolean;
  /**
   * Whether this tool call should render.
   *
   * Returning `false` skips the part entirely and keeps the loader visible, so
   * a tool can defer to another one that renders the same turn — for example a
   * search tool stepping aside for a richer display tool. Omitted means always
   * render.
   */
  shouldRender?: (context: ClientSideToolShouldRenderContext) => boolean;
  addToolResult: AddToolResult;
  /** Attached by the connector, one per chat; reaches `layoutComponent`. */
  records?: ChatRecordsStore;
  sendEvent?: SendEventForHits;
  insightsEventContext?: ChatInsightsEventContext;
  onToolCall?: (
    params: Parameters<
      NonNullable<ChatInit<UIMessage>['onToolCall']>
    >[0]['toolCall'] & {
      addToolResult: AddToolResultForToolCall;
      signal: AbortSignal;
    }
  ) => void | PromiseLike<void>;
  /**
   * Maximum time in milliseconds for `onToolCall` to submit a result.
   * Set to `false` to disable the timeout.
   *
   * @default 20000
   */
  timeout?: number | false;
  /**
   * Whether the default failed state shows a retry action.
   *
   * Retrying regenerates the assistant response and may execute the tool
   * again. Enable this only when repeating the operation is safe. Custom
   * layouts can implement recovery with `context.onReload`.
   *
   * @default false
   */
  retryOnError?: boolean;
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
