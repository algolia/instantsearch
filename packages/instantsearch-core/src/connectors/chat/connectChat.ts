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
  warning,
} from '../../lib/utils';
import { flat } from '../../lib/utils/flat';

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
  WidgetRenderState,
  IndexRenderState,
} from '../../types';
import type {
  AddToolResultWithOutput,
  ApplyFiltersParams,
  ClientSideTool,
  ClientSideTools,
  UserClientSideTool,
} from './types';
import type { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';


export type * from './types';

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
   * Whether the chat is in the process of clearing messages.
   */
  isClearing: boolean;
  /**
   * Clear all messages.
   */
  clearMessages: () => void;
  /**
   * Callback to be called when the clear transition ends.
   */
  onClearTransitionEnd: () => void;
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

export type ChatTransport = {
  transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
} & (
  | {
      agentId: string;
      /**
       * Whether to enable feedback (thumbs up/down) on assistant messages.
       */
      feedback?: boolean;
    }
  | { agentId?: undefined; feedback?: never }
);

export type ChatInit<TUiMessage extends UIMessage> =
  ChatInitWithoutTransport<TUiMessage> & ChatTransport;

export type ChatConnectorParams<TUiMessage extends UIMessage = UIMessage> = (
  | { chat: Chat<TUiMessage> }
  | ChatInit<TUiMessage>
) & {
  /**
   * Whether to resume an ongoing chat generation stream.
   */
  resume?: boolean;
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
   * Additional context to send with each user message (e.g. current page info).
   * This context is included in the message parts sent to the API but is not
   * displayed in the chat UI.
   * Can be a static object or a function that returns the context at send time.
   */
  context?: Record<string, unknown> | (() => Record<string, unknown>);
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
      ...options
    } = widgetParams || {};

    let _chatInstance: Chat<TUiMessage>;
    let input = '';
    let open = false;
    let isClearing = false;
    let sendEvent: SendEventForHits;
    let setInput: ChatRenderState<TUiMessage>['setInput'];
    let setOpen: ChatRenderState<TUiMessage>['setOpen'];
    let focusInput: ChatRenderState<TUiMessage>['focusInput'];
    let setIsClearing: (value: boolean) => void;
    let setFeedbackState: (messageId: string, state: 'sending' | 0 | 1) => void;

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
      if (!_chatInstance.messages || _chatInstance.messages.length === 0) {
        return;
      }
      const status = _chatInstance.status;
      if (status === 'submitted' || status === 'streaming') {
        _chatInstance.stop();
      }
      setIsClearing(true);
    };

    const onClearTransitionEnd = () => {
      setMessages([]);
      _chatInstance.clearError();
      _chatInstance.regenerateId();
      feedbackState = {};
      setIsClearing(false);
    };

    const makeChatInstance = (instantSearchInstance: InstantSearch) => {
      let transport;
      const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);

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
            // otherwise construct the default body
            const preparedOrPromise = originalPrepare
              ? originalPrepare(params)
              : { body: { ...params } };
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

        const baseApi = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`;
        transport = new DefaultChatTransport({
          api: baseApi,
          headers: {
            'x-algolia-application-id': appId,
            'x-algolia-api-Key': apiKey,
            'x-algolia-agent': getAlgoliaAgent(instantSearchInstance.client),
          },
          prepareSendMessagesRequest: ({ messages, trigger, ...rest }) => {
            return {
              // Bypass cache when regenerating to ensure fresh responses
              api:
                trigger === 'regenerate-message'
                  ? `${baseApi}&cache=false`
                  : baseApi,
              body: {
                ...rest,
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
        transport,
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
        shouldRepairToolInput(toolName) {
          let tool = tools[toolName];
          if (!tool && toolName.startsWith(`${SearchIndexToolType}_`)) {
            tool = tools[SearchIndexToolType];
          }
          if (!tool) return true;
          return Boolean(tool.streamInput);
        },
        onToolCall({ toolCall }) {
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

            return _chatInstance.addToolResult({
              output: `No tool implemented for "${toolCall.toolName}".`,
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
            });
          }

          if (tool.onToolCall) {
            const addToolResult: AddToolResultWithOutput = ({ output }) =>
              _chatInstance.addToolResult({
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
        },
      } as ChatInitAi<TUiMessage> & { agentId?: string });
    };

    return {
      $$type: 'ais.chat',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

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
        };

        focusInput = () => {
          setOpen(true);
        };

        setInput = (i) => {
          input = i;
          render();
        };

        setIsClearing = (value) => {
          isClearing = value;
          render();
        };

        setFeedbackState = (messageId, state) => {
          feedbackState = { ...feedbackState, [messageId]: state };
          render();
        };

        const feedback =
          'feedback' in options ? options.feedback : undefined;
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
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(
        renderState,
        renderOptions
        // Type is explicitly redefined, to avoid having the TWidgetParams type in the definition
      ): IndexRenderState & ChatWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          // Type is casted to 'chat' here, because in the IndexRenderState the key is always 'chat'
          [type as 'chat']: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState(renderOptions) {
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

          const resolvedContext =
            typeof context === 'function' ? context() : context;

          let serializedContext: string;
          try {
            serializedContext = JSON.stringify(resolvedContext);
          } catch {
            warning(
              false,
              'Could not serialize chat context. The message will be sent without context.'
            );
            return _chatInstance.sendMessage(message, ...rest);
          }

          const contextTextPart = {
            type: 'text' as const,
            text: '<context>'.concat(serializedContext).concat('</context>'),
          };

          if ('parts' in message && message.parts) {
            return _chatInstance.sendMessage({
              ...message,
              parts: [contextTextPart, ...message.parts],
              text: undefined,
              files: undefined,
            }, ...rest);
          }

          const textContent =
            'text' in message && message.text ? message.text : '';

          return _chatInstance.sendMessage({
            parts: [
              contextTextPart,
              { type: 'text' as const, text: textContent },
            ],
            metadata: message.metadata,
            messageId: message.messageId,
            files: undefined,
            text: undefined,
          }, ...rest);
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
          isClearing,
          clearMessages,
          onClearTransitionEnd,
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
