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
  sendChatMessageFeedback,
  uniq,
  walkIndex,
  warning,
} from '../../lib/utils';
import { flat } from '../../lib/utils/flat';

import type { ResponseScopedOnToolCallCallback } from '../../lib/ai-lite/abstract-chat';
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

export type ChatInitWithoutTransport<TUiMessage extends UIMessage> = Omit<
  ChatInitAi<TUiMessage>,
  'transport'
>;

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
  persistence?: never;
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
    const attributes = flat(params.facetFilters).map((filter) => {
      const [attribute, value] = filter.split(':');

      return { attribute, value };
    });

    attributes.forEach(({ attribute, value }) => {
      if (
        !helper.state.isConjunctiveFacet(attribute) &&
        !helper.state.isHierarchicalFacet(attribute) &&
        !helper.state.isDisjunctiveFacet(attribute)
      ) {
        const s = helper.state.addDisjunctiveFacet(attribute);
        helper.setState(s);
        helper.toggleFacetRefinement(attribute, value);
      } else {
        const attr =
          helper.state.hierarchicalFacets.find(
            (facet) => facet.name === attribute
          )?.name || attribute;

        helper.toggleFacetRefinement(attr, value);
      }
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
      context,
      initialUserMessage,
      initialMessages,
      disableTriggerValidation = false,
      sendAutomaticallyWhen = lastAssistantMessageIsCompleteWithToolCalls,
      requiresSearch = true,
      ...options
    } = widgetParams || {};

    let _chatInstance: Chat<TUiMessage>;
    let input = '';
    let open = false;
    let sendEvent: SendEventForHits;
    let setInput: ChatRenderState<TUiMessage>['setInput'];
    let setOpen: ChatRenderState<TUiMessage>['setOpen'];
    let focusInput: ChatRenderState<TUiMessage>['focusInput'];
    let setFeedbackState: (messageId: string, state: 'sending' | 0 | 1) => void;
    let hasValidatedEntryPoints = false;

    const agentId = 'agentId' in options ? options.agentId : undefined;
    let feedbackState: ChatRenderState<TUiMessage>['feedbackState'] = {};
    let _sendChatMessageFeedback: ChatRenderState<TUiMessage>['sendChatMessageFeedback'];
    let feedbackAbortController: AbortController | undefined;

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

    const makeChatInstance = (instantSearchInstance: InstantSearch) => {
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
            ...(options.requestOptions?.headers instanceof Headers
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

      if ('chat' in options) {
        return options.chat;
      }

      return new Chat({
        ...options,
        sendAutomaticallyWhen,
        transport,
        shouldRepairToolInput(toolName) {
          let tool = tools[toolName];
          if (!tool && toolName.startsWith(`${SearchIndexToolType}_`)) {
            tool = tools[SearchIndexToolType];
          }
          if (!tool) return true;
          return Boolean(tool.streamInput);
        },
        onToolCall: ((
          { toolCall },
          submitToolResult = _chatInstance.addToolResult
        ) => {
          let tool = tools[toolCall.toolName];

          // Compatibility shim with Algolia MCP Server search tool
          if (
            !tool &&
            toolCall.toolName.startsWith(`${SearchIndexToolType}_`)
          ) {
            tool = tools[SearchIndexToolType];
          }

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
        }) satisfies ResponseScopedOnToolCallCallback<TUiMessage>,
      } as ChatInitAi<TUiMessage> & { agentId?: string });
    };

    return {
      $$type: 'ais.chat',
      dependsOn: requiresSearch ? ('search' as const) : ('none' as const),

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        validateEntryPoints(instantSearchInstance);

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

        setOpen = (o) => {
          open = o;
          render();
          // `open` is read by sibling widgets (e.g. `chatTrigger`) via the
          // shared `renderState`. Schedule a full re-render so they pick up
          // the new value instead of staying frozen on their initial state.
          initOptions.instantSearchInstance.scheduleRender();
        };

        focusInput = () => {
          setOpen(true);
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

        // Set initialMessages before registering callbacks to avoid
        // triggering re-renders during init
        if (initialMessages?.length && !resume && !hasExistingMessages) {
          _chatInstance.messages = initialMessages;
        }

        _chatInstance['~registerErrorCallback'](render);
        _chatInstance['~registerMessagesCallback'](render);
        _chatInstance['~registerStatusCallback'](render);

        if (resume) {
          _chatInstance.resumeStream();
        }

        if (initialUserMessage && !resume && !hasExistingMessages) {
          _chatInstance.sendMessage({ text: initialUserMessage });
        }

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
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

      getWidgetRenderState(renderOptions: InitOptions | RenderOptions) {
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

        const toolsWithAddToolResult: ClientSideTools = {};
        Object.entries(tools).forEach(([key, tool]) => {
          const toolWithAddToolResult: ClientSideTool = {
            ...tool,
            addToolResult: _chatInstance.addToolResult,
            applyFilters,
            sendEvent,
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

        return {
          indexUiState: instantSearchInstance.getUiState()[parent.getIndexId()],
          input,
          open,
          sendEvent,
          setIndexUiState: parent.setIndexUiState.bind(parent),
          setInput,
          setOpen,
          focusInput,
          setMessages,
          suggestions: getSuggestionsFromMessages(_chatInstance.messages),
          clearMessages,
          tools: toolsWithAddToolResult,
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
      },

      dispose() {
        feedbackAbortController?.abort();
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
