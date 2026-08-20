import {
  collectChatRecords,
  createChatRecordsStore,
} from 'instantsearch-ui-components';

import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from '../../lib/ai-lite';
import { Chat, SearchIndexToolType } from '../../lib/chat';
import {
  checkRendering,
  clearRefinements,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  getRefinements,
  noop,
  safelyRunOnBrowser,
  sendChatMessageFeedback,
  uniq,
  walkIndex,
  warning,
} from '../../lib/utils';
import { defer } from '../../lib/utils/defer';
import { flat } from '../../lib/utils/flat';

import type { ChatOnToolCallCallback } from '../../lib/ai-lite';
import type {
  AbstractChat,
  ChatInit as ChatInitAi,
  UIMessage,
} from '../../lib/chat';
import type { SendEventForHits } from '../../lib/utils';
import type {
  Connector,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  InstantSearch,
  IndexUiState,
  IndexWidget,
  InitOptions,
  RenderOptions,
  WidgetRenderState,
  IndexRenderState,
} from '../../types';
import type { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';
import type {
  AddToolResultWithOutput,
  UserClientSideTool,
  ClientSideTools,
  ClientSideTool,
  ChatInsightsEventContext,
  ChatRecordsStore,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat',
  connector: true,
});

export type ChatRenderState<TUiMessage extends UIMessage = UIMessage> = {
  indexUiState: IndexUiState;
  input: string;
  open: boolean;
  /**
   * Sends an event to the Insights middleware.
   */
  sendEvent: SendEventForHits;
  setIndexUiState: IndexWidget['setIndexUiState'];
  setInput: (input: string) => void;
  setOpen: (open: boolean) => void;
  /**
   * Opens the chat (if needed) and focuses the prompt input.
   */
  focusInput: () => void;
  /** @internal */
  '~consumeInputFocus'?: () => boolean;
  /** @internal */
  '~isOpenStatePersistenceEnabled'?: boolean;
  /** @internal */
  '~hasStateToLoseOnWidgetReplacement'?: boolean;
  /**
   * Updates the `messages` state locally. This is useful when you want to
   * edit the messages on the client, and then trigger the `reload` method
   * manually to regenerate the AI response.
   */
  setMessages: (
    messages: TUiMessage[] | ((m: TUiMessage[]) => TUiMessage[])
  ) => void;
  /**
   * Clear all messages. This is a synchronous, immediate commit; any fade-out
   * animation before clearing is handled by the view layer.
   */
  clearMessages: () => void;
  /**
   * Tools configuration with addToolResult bound, ready to be used by the UI.
   */
  tools: ClientSideTools;
  /**
   * The records the chat's tools have fetched, keyed by `objectID`: every tool
   * call that returned `hits` contributes them, last write winning. Attached to
   * every tool too, which is how a `layoutComponent` reads it.
   */
  records: ChatRecordsStore;
  /**
   * Suggestions received from the AI model.
   */
  suggestions?: string[];
  /**
   * Sends feedback (thumbs up/down) for an assistant message.
   * Only available when using `agentId` and `feedback` is true.
   * Returns `undefined` otherwise.
   */
  sendChatMessageFeedback?: (messageId: string, vote: 0 | 1) => void;
  /**
   * Map of message IDs to their feedback state.
   * 'sending' means the request is in flight, 0/1 means the vote was recorded.
   */
  feedbackState: Record<string, 'sending' | 0 | 1>;
} & Pick<
  AbstractChat<TUiMessage>,
  | 'addToolResult'
  | 'clearError'
  | 'error'
  | 'id'
  | 'messages'
  | 'regenerate'
  | 'resumeStream'
  | 'sendMessage'
  | 'status'
  | 'stop'
>;

export type ChatPersistence =
  | boolean
  | {
      messages?: boolean;
      open?: boolean;
    };

export type ChatInitWithoutTransport<TUiMessage extends UIMessage> = Omit<
  ChatInitAi<TUiMessage>,
  'persistence' | 'transport'
> & {
  chat?: never;
  /**
   * Whether to persist messages and open state in sessionStorage.
   * An object configures each policy independently.
   *
   * @default true
   */
  persistence?: ChatPersistence;
};

export type ChatAgentRequestOptions = {
  /**
   * Query parameters to send with built-in Agent Studio completion requests.
   */
  queryParameters?: Record<string, string | number | boolean>;
  /**
   * Headers to send with built-in Agent Studio completion requests.
   */
  headers?: Record<string, string> | Headers;
};

export type ChatTransport =
  | {
      agentId: string;
      transport?: never;
      /**
       * Request options to send with built-in Agent Studio completion requests.
       */
      requestOptions?: ChatAgentRequestOptions;
      /**
       * Whether to enable feedback (thumbs up/down) on assistant messages.
       */
      feedback?: boolean;
    }
  | {
      agentId: string;
      transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
      feedback?: boolean;
      requestOptions?: never;
    }
  | {
      agentId?: undefined;
      transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
      feedback?: never;
      requestOptions?: never;
    };

export type ChatCustomInstance<TUiMessage extends UIMessage> = {
  chat: Chat<TUiMessage>;
  agentId?: undefined;
  transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
  feedback?: never;
  requestOptions?: never;
  /**
   * Whether to persist open state in sessionStorage. Message persistence is
   * configured when constructing the Chat instance.
   *
   * @default { open: true }
   */
  persistence?: {
    open?: boolean;
    messages?: never;
  };
  sendAutomaticallyWhen?: never;
};

export type ApplyFiltersParams = {
  query?: string;
  facetFilters?: string[][];
};

export type ChatInit<TUiMessage extends UIMessage> =
  ChatInitWithoutTransport<TUiMessage> & ChatTransport;

export type ChatConnectorParams<TUiMessage extends UIMessage = UIMessage> = (
  | ChatCustomInstance<TUiMessage>
  | ChatInit<TUiMessage>
) & {
  /**
   * Disable validation that requires either a dedicated trigger or AI mode.
   */
  disableTriggerValidation?: boolean;
  /**
   * Whether to resume an ongoing chat generation stream.
   * This option has no effect during server rendering.
   */
  resume?: boolean;
  /**
   * Whether this widget should make InstantSearch require a main search request.
   * If this is the only widget, and you mark `requiresSearch: false`, no search request will happen.
   *
   * @default true
   */
  requiresSearch?: boolean;
  /**
   * Configuration for client-side tools.
   */
  tools?: Record<string, Omit<UserClientSideTool, 'layoutComponent'>>;
  /**
   * Identifier of this type of chat widget. This is used for the key in renderState.
   * @default 'chat'
   */
  type?: string;
  /**
   * Ambient session facts to attach to the latest user turn (e.g. current page
   * URL, locale, product id). Sent over the wire as
   * `messages[last].metadata.turnContext` per the Agent Studio contract — never
   * rendered as a chat bubble and never persisted on assistant turns.
   *
   * The server validates the payload (flat `Record<string, string>`, key/value
   * length and shape) and rejects malformed contexts. Pass a function when the
   * values change per-turn — it is invoked once per send. If the source is
   * async, resolve it upstream and close over the value.
   */
  context?: Record<string, string> | (() => Record<string, string>);
  /**
   * A message to send automatically when the chat is initialized.
   * This message is sent only in the browser.
   *
   * This message is only sent when the chat has no existing messages yet. If
   * messages were restored or otherwise already exist when the widget starts,
   * this message is not sent.
   *
   * When `resume` is enabled, this message is not sent.
   */
  initialUserMessage?: string;
  /**
   * Messages to pre-populate the chat with when it is initialized.
   * These messages are applied only in the browser.
   *
   * These messages are set without triggering an AI response. They are only
   * applied when the chat has no existing messages yet. If messages were
   * restored or otherwise already exist when the widget starts, these messages
   * are not applied.
   *
   * When `resume` is enabled, these messages are not applied.
   *
   * `initialUserMessage` is sent after `initialMessages` are applied, so an
   * assistant welcome followed by a user prompt works.
   */
  initialMessages?: TUiMessage[];
};

export type ChatWidgetDescription<TUiMessage extends UIMessage = UIMessage> = {
  $$type: 'ais.chat';
  renderState: ChatRenderState<TUiMessage>;
  indexRenderState: {
    // In IndexRenderState, the key is always 'chat', but in the widgetParams you can customize it with the `type` parameter
    chat: WidgetRenderState<
      ChatRenderState<TUiMessage>,
      ChatConnectorParams<TUiMessage>
    >;
  };
};

export type ChatConnector<TUiMessage extends UIMessage = UIMessage> = Connector<
  ChatWidgetDescription<TUiMessage>,
  ChatConnectorParams<TUiMessage>
>;

const OPEN_STATE_CACHE_KEY = 'instantsearch-chat-open-state';

function normalizePersistence(
  persistence: ChatPersistence | undefined,
  hasCustomChat: boolean
) {
  if (hasCustomChat) {
    return {
      messages: false,
      open:
        persistence === undefined ||
        (typeof persistence === 'object' && persistence.open === true),
    };
  }

  if (persistence === undefined || persistence === true) {
    return { messages: true, open: true };
  }

  if (persistence === false) {
    return { messages: false, open: false };
  }

  return {
    messages: persistence.messages === true,
    open: persistence.open === true,
  };
}

function getOpenStateCacheKey(type: string) {
  return `${OPEN_STATE_CACHE_KEY}-${type}`;
}

function readPersistedOpen(type: string) {
  try {
    return safelyRunOnBrowser(
      ({ window: browserWindow }) =>
        browserWindow.sessionStorage.getItem(getOpenStateCacheKey(type)) ===
        'true',
      { fallback: () => false }
    );
  } catch {
    return false;
  }
}

function writePersistedOpen(type: string, open: boolean) {
  try {
    safelyRunOnBrowser(({ window: browserWindow }) => {
      browserWindow.sessionStorage.setItem(
        getOpenStateCacheKey(type),
        String(open)
      );
    });
  } catch {
    // Storage availability must not block the visible state change.
  }
}

function getAttributesToClear({
  results,
  helper,
}: {
  results: SearchResults;
  helper: AlgoliaSearchHelper;
}) {
  return uniq(
    getRefinements(results, helper.state, true).map(
      (refinement) => refinement.attribute
    )
  );
}

function updateStateFromSearchToolInput(
  params: ApplyFiltersParams,
  helper: AlgoliaSearchHelper
) {
  // clear all filters first
  const attributesToClear = getAttributesToClear({
    results: helper.lastResults!,
    helper,
  });

  helper.setState(
    clearRefinements({
      helper,
      attributesToClear,
    })
  );

  if (params.facetFilters) {
    const refinements = flat(params.facetFilters).reduce<
      Array<{ attribute: string; value: string }>
    >((acc, filter) => {
      const separatorIndex = filter.indexOf(':');

      if (separatorIndex > 0) {
        acc.push({
          attribute: filter.slice(0, separatorIndex),
          value: filter.slice(separatorIndex + 1),
        });
      }

      return acc;
    }, []);

    const hierarchicalRefinements = new Map<string, string>();

    refinements.forEach(({ attribute, value }) => {
      const hierarchicalFacet = helper.state.hierarchicalFacets.find(
        (facet) =>
          facet.name === attribute || facet.attributes.includes(attribute)
      );

      if (hierarchicalFacet) {
        const currentValue = hierarchicalRefinements.get(
          hierarchicalFacet.name
        );

        if (currentValue === undefined || value.length > currentValue.length) {
          hierarchicalRefinements.set(hierarchicalFacet.name, value);
        }

        return;
      }

      if (
        !helper.state.isConjunctiveFacet(attribute) &&
        !helper.state.isDisjunctiveFacet(attribute)
      ) {
        helper.setState(helper.state.addDisjunctiveFacet(attribute));
      }

      helper.toggleFacetRefinement(attribute, value);
    });

    hierarchicalRefinements.forEach((value, name) => {
      helper.toggleFacetRefinement(name, value);
    });
  }

  if (params.query) {
    helper.setQuery(params.query);
  }

  helper.search();

  return helper.state;
}

export default (function connectChat<TWidgetParams extends UnknownWidgetParams>(
  renderFn: Renderer<ChatRenderState, TWidgetParams & ChatConnectorParams>,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return <TUiMessage extends UIMessage = UIMessage>(
    widgetParams: TWidgetParams & ChatConnectorParams<TUiMessage>
  ) => {
    warning(false, 'Chat is not yet stable and will change in the future.');

    const {
      resume = false,
      tools = {},
      type = 'chat',
      persistence,
      context,
      initialUserMessage,
      initialMessages,
      disableTriggerValidation = false,
      sendAutomaticallyWhen = lastAssistantMessageIsCompleteWithToolCalls,
      requiresSearch = true,
      ...options
    } = widgetParams || {};
    const normalizedPersistence = normalizePersistence(
      persistence,
      'chat' in options
    );

    // Compatibility shim with Algolia MCP Server search tool, which suffixes
    // the tool name with the index name (`searchIndex_products`).
    const resolveTool = (toolName: string) =>
      tools[toolName] ||
      (toolName.startsWith(`${SearchIndexToolType}_`)
        ? tools[SearchIndexToolType]
        : undefined);

    let _chatInstance: Chat<TUiMessage>;
    let input = '';
    let open = false;
    let sendEvent: SendEventForHits;
    let setInput: ChatRenderState<TUiMessage>['setInput'];
    let setOpen: ChatRenderState<TUiMessage>['setOpen'];
    let focusInput: ChatRenderState<TUiMessage>['focusInput'];
    let inputFocusRequested = false;
    let setFeedbackState: (messageId: string, state: 'sending' | 0 | 1) => void;
    let hasValidatedEntryPoints = false;

    const agentId = 'agentId' in options ? options.agentId : undefined;
    // Collected here rather than by the tool that searched: that tool renders
    // nothing while display-results presents its records, and a record has to
    // outlive the render that produced it.
    const records = createChatRecordsStore();
    const collectRecords = () =>
      collectChatRecords(_chatInstance.messages, records);
    let feedbackState: ChatRenderState<TUiMessage>['feedbackState'] = {};
    let _sendChatMessageFeedback: ChatRenderState<TUiMessage>['sendChatMessageFeedback'];
    let feedbackAbortController: AbortController | undefined;
    let chatSubscriptionUnsubscribers: Array<() => void> = [];

    const unsubscribeChatCallbacks = () => {
      chatSubscriptionUnsubscribers
        .splice(0)
        .forEach((unsubscribe) => unsubscribe());
    };

    // Extract suggestions from the last assistant message's data-suggestions part
    const getSuggestionsFromMessages = (messages: TUiMessage[]) => {
      // Find the last assistant message (iterate from end)
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((message) => message.role === 'assistant' && message.parts);

      if (!lastAssistantMessage?.parts) {
        return undefined;
      }

      // Find the data-suggestions part
      const suggestionsPart = lastAssistantMessage.parts.find(
        (
          part
        ): part is {
          type: `data-${string}`;
          data: { suggestions: string[] };
        } =>
          'type' in part &&
          part.type === 'data-suggestions' &&
          'data' in part &&
          Array.isArray(
            (part as { data?: { suggestions?: unknown } }).data?.suggestions
          )
      );

      return suggestionsPart?.data.suggestions;
    };

    const setMessages = (
      messagesParam: TUiMessage[] | ((m: TUiMessage[]) => TUiMessage[])
    ) => {
      if (typeof messagesParam === 'function') {
        messagesParam = messagesParam(_chatInstance.messages);
      }
      _chatInstance.messages = messagesParam;
    };

    const clearMessages = () => {
      const status = _chatInstance.status;
      if (status === 'submitted' || status === 'streaming') {
        _chatInstance.stop();
      }
      // Reset the non-reactive state first: `setMessages` and `clearError` emit
      // ChatState callbacks that synchronously re-render, so they must run last
      // for that render to see the cleared feedback and rotated conversation id.
      feedbackState = {};
      records.clear();
      _chatInstance.resetConversationId();
      setMessages([]);
      _chatInstance.clearError();
    };

    const validateEntryPoints = (instantSearchInstance: InstantSearch) => {
      if (disableTriggerValidation || hasValidatedEntryPoints) {
        return;
      }

      // warning only relevant once mounted
      if (!instantSearchInstance.mainIndex) {
        return;
      }

      let hasEntryPoint = false;
      walkIndex(instantSearchInstance.mainIndex, (indexWidget) => {
        const widgets = indexWidget.getWidgets() as Array<{
          opensChat?: boolean;
        }>;
        if (widgets.some((w) => w.opensChat === true)) {
          hasEntryPoint = true;
        }
      });

      warning(
        hasEntryPoint,
        'The `chat` widget has no way to be opened. Add a `chatTrigger` widget, enable `aiMode` on a `searchBox`/`autocomplete`, or use the inline layout. Set `disableTriggerValidation: true` to silence this warning.'
      );

      hasValidatedEntryPoints = true;
    };

    // Deferred because entry points can be registered after the chat itself:
    // React adds widgets in mount order, so a trigger further down the tree
    // only lands after this widget's `init` has run.
    const deferredValidateEntryPoints = defer(validateEntryPoints);

    const makeChatInstance = (instantSearchInstance: InstantSearch) => {
      // A caller supplied `chat` already owns its transport, so it bypasses the
      // connector's transport construction and validation below.
      if ('chat' in options) {
        return options.chat!;
      }

      let transport;
      const { client } = instantSearchInstance;
      const [appId, apiKey] = getAppIdAndApiKey(client);

      // Filter out custom data parts (like data-suggestions) that the backend doesn't accept
      const filterDataParts = (messages: UIMessage[]): UIMessage[] =>
        messages.map((message) => ({
          ...message,
          parts: message.parts?.filter(
            (part) => !('type' in part && part.type.startsWith('data-'))
          ),
        }));

      if ('transport' in options && options.transport) {
        const originalPrepare = options.transport.prepareSendMessagesRequest;
        transport = new DefaultChatTransport({
          ...options.transport,
          prepareSendMessagesRequest: (params) => {
            // Call the original prepareSendMessagesRequest if it exists,
            // otherwise construct a minimal default body containing only the
            // request payload — without leaking transport metadata such as
            // resolved headers, api URL, credentials, or `requestMetadata`.
            const preparedOrPromise = originalPrepare
              ? originalPrepare(params)
              : {
                  body: {
                    id: params.id,
                    messageId: params.messageId,
                    trigger: params.trigger,
                    messages: params.messages,
                    ...params.body,
                  },
                };
            // Then filter out data-* parts
            const applyFilter = (prepared: { body: object }) => ({
              ...prepared,
              body: {
                ...prepared.body,
                messages: filterDataParts(
                  (prepared.body as { messages: UIMessage[] }).messages
                ),
              },
            });

            // Handle both sync and async cases
            if (preparedOrPromise && 'then' in preparedOrPromise) {
              return preparedOrPromise.then(applyFilter);
            }
            return applyFilter(preparedOrPromise);
          },
        });
      }
      if ('agentId' in options && options.agentId) {
        if (!appId || !apiKey) {
          throw new Error(
            withUsage(
              'Could not extract Algolia credentials from the search client.'
            )
          );
        }

        const createApi = (bypassCache = false) => {
          const api = new URL(
            `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions`
          );
          const queryParameters: Record<string, string | number | boolean> = {
            ...options.requestOptions?.queryParameters,
            compatibilityMode: 'ai-sdk-5',
            ...(bypassCache ? { cache: false } : {}),
          };

          api.search = new URLSearchParams(
            queryParameters as Record<string, string>
          ).toString();
          return api.toString();
        };
        const baseApi = createApi();
        transport = new DefaultChatTransport({
          api: baseApi,
          headers: {
            // `Headers` is absent on runtimes without fetch globals, and a
            // server render reaches this while building the transport.
            ...(typeof Headers !== 'undefined' &&
            options.requestOptions?.headers instanceof Headers
              ? Object.fromEntries(options.requestOptions.headers.entries())
              : options.requestOptions?.headers),
            // Preserve the required Algolia identity headers and chat agent
            // marker, even when requestOptions.headers contains the same keys.
            'x-algolia-application-id': appId,
            'x-algolia-api-key': apiKey,
            'x-algolia-agent': `${getAlgoliaAgent(client)}; chat`,
          },
          prepareSendMessagesRequest: ({
            id,
            messages,
            trigger,
            messageId,
          }) => {
            return {
              // Bypass cache when regenerating to ensure fresh responses
              api: trigger === 'regenerate-message' ? createApi(true) : baseApi,
              body: {
                id,
                messageId,
                messages: filterDataParts(messages),
              },
            };
          },
        });
      }
      if (!transport) {
        throw new Error(
          withUsage('You need to provide either an `agentId` or a `transport`.')
        );
      }

      return new Chat({
        ...options,
        persistence: normalizedPersistence.messages,
        sendAutomaticallyWhen,
        transport,
        shouldRepairToolInput(toolName) {
          const tool = resolveTool(toolName);
          if (!tool) return true;
          return Boolean(tool.streamInput);
        },
        resolveCancelledToolOutput({ toolName, toolCallId, input }) {
          const cancelOutput = resolveTool(toolName)?.cancelOutput;
          if (!cancelOutput) return undefined;

          try {
            const output = cancelOutput({ toolCallId, input });
            // `undefined` means the tool declined to provide an output.
            return output === undefined ? undefined : { output };
          } catch {
            warning(
              false,
              `The \`cancelOutput\` of the "${toolName}" tool threw an error. The tool call is reported as failed instead.`
            );
            return undefined;
          }
        },
        onToolCall: (({ toolCall }, submitToolResult) => {
          const tool = resolveTool(toolCall.toolName);

          if (!tool) {
            if (__DEV__) {
              throw new Error(
                `No tool implementation found for "${toolCall.toolName}". Please provide a tool implementation in the \`tools\` prop.`
              );
            }

            return submitToolResult({
              output: `No tool implemented for "${toolCall.toolName}".`,
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
            });
          }

          if (tool.onToolCall) {
            const addToolResult: AddToolResultWithOutput = ({ output }) =>
              submitToolResult({
                output,
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
              });

            return tool.onToolCall({
              ...toolCall,
              addToolResult,
            });
          }

          return Promise.resolve();
        }) satisfies ChatOnToolCallCallback<TUiMessage>,
      } as ChatInitAi<TUiMessage> & { agentId?: string });
    };

    return {
      $$type: 'ais.chat',
      dependsOn: requiresSearch ? ('search' as const) : ('none' as const),

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        deferredValidateEntryPoints(instantSearchInstance);

        open = normalizedPersistence.open ? readPersistedOpen(type) : false;
        records.clear();
        _chatInstance = makeChatInstance(instantSearchInstance);

        const render = () => {
          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance: initOptions.instantSearchInstance,
            },
            false
          );
        };

        const updateOpen = (nextOpen: boolean, requestFocus: boolean) => {
          open = nextOpen;
          inputFocusRequested =
            nextOpen && (inputFocusRequested || requestFocus);
          if (normalizedPersistence.open) {
            writePersistedOpen(type, open);
          }
          render();
          // `open` is read by sibling widgets (e.g. `chatTrigger`) via the
          // shared `renderState`. Schedule a full re-render so they pick up
          // the new value instead of staying frozen on their initial state.
          initOptions.instantSearchInstance.scheduleRender();
        };

        setOpen = (nextOpen) => {
          updateOpen(nextOpen, nextOpen && !open);
        };

        focusInput = () => {
          updateOpen(true, true);
        };

        setInput = (i) => {
          input = i;
          render();
        };

        setFeedbackState = (messageId, state) => {
          feedbackState = { ...feedbackState, [messageId]: state };
          render();
        };

        const feedback = 'feedback' in options ? options.feedback : undefined;
        if (agentId && feedback) {
          const [appId, apiKey] = getAppIdAndApiKey(
            initOptions.instantSearchInstance.client
          );

          if (!appId || !apiKey) {
            throw new Error(
              withUsage(
                'Could not extract Algolia credentials from the search client.'
              )
            );
          }

          feedbackAbortController = new AbortController();
          _sendChatMessageFeedback = (messageId: string, vote: 0 | 1) => {
            if (feedbackState[messageId] !== undefined) {
              return;
            }
            setFeedbackState(messageId, 'sending');
            sendChatMessageFeedback({
              agentId,
              vote,
              messageId,
              appId,
              apiKey,
            }).finally(() => {
              setFeedbackState(messageId, vote);
            });
          };
        }

        const hasExistingMessages = _chatInstance.messages.length > 0;

        // Unsubscribe previous callbacks before setting initialMessages, then
        // register the current callbacks after to avoid re-renders during init.
        // A server render owns no conversation, so it leaves the instance empty.
        safelyRunOnBrowser(() => {
          unsubscribeChatCallbacks();
          if (initialMessages?.length && !resume && !hasExistingMessages) {
            _chatInstance.messages = initialMessages;
          }
        });

        // Sibling entry points read `status` through the shared `renderState` to
        // disable themselves, so a transition has to escape this widget's own
        // render. Message deltas deliberately don't: they stay local to keep
        // streaming cheap. The `status` setter notifies on every write, hence
        // the comparison.
        let lastStatus = _chatInstance.status;
        const renderOnStatusChange = () => {
          const statusChanged = _chatInstance.status !== lastStatus;
          lastStatus = _chatInstance.status;
          render();
          if (statusChanged) {
            initOptions.instantSearchInstance.scheduleRender();
          }
        };

        safelyRunOnBrowser(() => {
          chatSubscriptionUnsubscribers = [
            _chatInstance['~registerErrorCallback'](render),
            // Before `render`, so a delta's records are collected by the time
            // the tools of that delta render.
            _chatInstance['~registerMessagesCallback'](collectRecords),
            _chatInstance['~registerMessagesCallback'](render),
            _chatInstance['~registerStatusCallback'](renderOnStatusChange),
          ];
        });

        // Resuming and sending reach the network, which a server render must
        // not: the HTML pass repeats what `getServerState` already rendered, so
        // each send happens at least twice, and each failure resolves into chat
        // state well after the render that started it has finished.
        safelyRunOnBrowser(() => {
          if (resume) {
            _chatInstance.resumeStream();
          }

          if (initialUserMessage && !resume && !hasExistingMessages) {
            _chatInstance.sendMessage({ text: initialUserMessage });
          }
        });

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );

        if (open) {
          instantSearchInstance.scheduleRender();
        }
      },

      render(renderOptions) {
        validateEntryPoints(renderOptions.instantSearchInstance);

        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(
        renderState: IndexRenderState,
        renderOptions: InitOptions | RenderOptions
        // Type is explicitly redefined, to avoid having the TWidgetParams type in the definition
      ): IndexRenderState & ChatWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          // Type is casted to 'chat' here, because in the IndexRenderState the key is always 'chat'
          [type as 'chat']: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState(
        renderOptions: InitOptions | RenderOptions
      ): WidgetRenderState<
        ChatRenderState<TUiMessage>,
        TWidgetParams & ChatConnectorParams<TUiMessage>
      > {
        const { instantSearchInstance, parent, helper } = renderOptions;
        if (!_chatInstance) {
          this.init!({ ...renderOptions, uiState: {}, results: undefined });
        }

        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance: renderOptions.instantSearchInstance,
            helper: renderOptions.helper,
            widgetType: this.$$type,
          });
        }

        function applyFilters(params: ApplyFiltersParams) {
          return updateStateFromSearchToolInput(params, helper);
        }

        // A restored or server-rendered conversation never emitted the messages
        // callback above; collecting is idempotent, so covering it here is free.
        collectRecords();

        const insightsEventContext: ChatInsightsEventContext = {
          agentId,
          instantSearchStatus: instantSearchInstance.status,
        };
        const toolsWithAddToolResult: ClientSideTools = {};
        Object.entries(tools).forEach(([key, tool]) => {
          const toolWithAddToolResult = {
            ...tool,
            addToolResult: _chatInstance.addToolResult,
            '~addToolResultForMessage':
              _chatInstance['~addToolResultForMessage'],
            applyFilters,
            sendEvent,
            insightsEventContext,
            records,
          } satisfies ClientSideTool & {
            '~addToolResultForMessage': (typeof _chatInstance)['~addToolResultForMessage'];
          };
          toolsWithAddToolResult[key] = toolWithAddToolResult;
        });

        const sendMessageWithContext: typeof _chatInstance.sendMessage = (
          message,
          ...rest
        ) => {
          if (!context || !message) {
            return _chatInstance.sendMessage(message, ...rest);
          }

          // Resolve once per send; let the server validate the payload and
          // surface any contract violations.
          const turnContext =
            typeof context === 'function' ? context() : context;

          return _chatInstance.sendMessage(
            {
              ...message,
              metadata: {
                ...(message.metadata as Record<string, unknown> | undefined),
                turnContext,
              },
            } as Parameters<typeof _chatInstance.sendMessage>[0],
            ...rest
          );
        };

        const renderState = {
          indexUiState: instantSearchInstance.getUiState()[parent.getIndexId()],
          input,
          open,
          sendEvent,
          setIndexUiState: parent.setIndexUiState.bind(parent),
          setInput,
          setOpen,
          focusInput,
          '~consumeInputFocus'() {
            const shouldFocus = inputFocusRequested;
            inputFocusRequested = false;
            return shouldFocus;
          },
          '~isOpenStatePersistenceEnabled': normalizedPersistence.open,
          '~hasStateToLoseOnWidgetReplacement':
            !('chat' in options) &&
            (open ||
              (!normalizedPersistence.messages &&
                _chatInstance.messages.length > 0)),
          setMessages,
          suggestions: getSuggestionsFromMessages(_chatInstance.messages),
          clearMessages,
          tools: toolsWithAddToolResult,
          records,
          sendChatMessageFeedback: _sendChatMessageFeedback,
          feedbackState,
          widgetParams,

          // Chat instance render state
          addToolResult: _chatInstance.addToolResult,
          clearError: _chatInstance.clearError,
          error: _chatInstance.error,
          id: _chatInstance.id,
          messages: _chatInstance.messages,
          regenerate: _chatInstance.regenerate,
          resumeStream: _chatInstance.resumeStream,
          sendMessage: sendMessageWithContext,
          status: _chatInstance.status,
          stop: _chatInstance.stop,
        };

        return renderState;
      },

      dispose() {
        deferredValidateEntryPoints.cancel();
        feedbackAbortController?.abort();
        unsubscribeChatCallbacks();
        unmountFn();
      },

      shouldRender() {
        return true;
      },

      get chatInstance() {
        return _chatInstance;
      },
    };
  };
} satisfies ChatConnector);
