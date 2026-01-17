import { Chat, loadAI } from '../../lib/chat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
  warning,
} from '../../lib/utils';

import type { ChatInit as ChatInitWithoutAI, UIMessage } from '../../lib/chat';
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
   * Methods from the chat instance
   */
  addToolResult: Chat<TUiMessage>['addToolResult'];
  clearError: Chat<TUiMessage>['clearError'];
  error: Chat<TUiMessage>['error'];
  id: Chat<TUiMessage>['id'];
  messages: Chat<TUiMessage>['messages'];
  regenerate: Chat<TUiMessage>['regenerate'];
  resumeStream: Chat<TUiMessage>['resumeStream'];
  sendMessage: Chat<TUiMessage>['sendMessage'];
  status: Chat<TUiMessage>['status'];
  stop: Chat<TUiMessage>['stop'];
};

export type ChatInitWithoutTransport<TUiMessage extends UIMessage> = Omit<
  ChatInitWithoutAI<TUiMessage>,
  'transport'
>;

export type ChatTransport = {
  agentId?: string;
  transport?: any; // Will be typed properly after AI module is loaded
};

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
      ...options
    } = widgetParams || {};

    let _chatInstance: Chat<TUiMessage> | null = null;
    let input = '';
    let open = false;
    let isClearing = false;
    let sendEvent: SendEventForHits;
    let setInput: ChatRenderState<TUiMessage>['setInput'];
    let setOpen: ChatRenderState<TUiMessage>['setOpen'];
    let setIsClearing: (value: boolean) => void;

    const agentId = 'agentId' in options ? options.agentId : undefined;

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
      if (!_chatInstance) return;
      if (typeof messagesParam === 'function') {
        messagesParam = messagesParam(_chatInstance.messages);
      }
      _chatInstance.messages = messagesParam;
    };

    const clearMessages = () => {
      if (
        !_chatInstance ||
        !_chatInstance.messages ||
        _chatInstance.messages.length === 0
      ) {
        return;
      }
      setIsClearing(true);
    };

    const onClearTransitionEnd = () => {
      setMessages([]);
      if (_chatInstance) {
        _chatInstance.clearError();
      }
      setIsClearing(false);
    };

    const makeChatInstance = (instantSearchInstance: InstantSearch) => {
      if ('chat' in options) {
        return options.chat;
      }

      const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);

      // Filter out custom data parts (like data-suggestions) that the backend doesn't accept
      const filterDataParts = (messages: UIMessage[]): UIMessage[] =>
        messages.map((message) => ({
          ...message,
          parts: message.parts?.filter(
            (part) => !('type' in part && part.type.startsWith('data-'))
          ),
        }));

      // Load AI module
      const ai = loadAI();
      let transport;

      if ('transport' in options && options.transport) {
        const originalPrepare = options.transport.prepareSendMessagesRequest;
        transport = new ai.DefaultChatTransport({
          ...options.transport,
          prepareSendMessagesRequest: (params: any) => {
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
        transport = new ai.DefaultChatTransport({
          api: baseApi,
          headers: {
            'x-algolia-application-id': appId,
            'x-algolia-api-Key': apiKey,
            'x-algolia-agent': getAlgoliaAgent(instantSearchInstance.client),
          },
          prepareSendMessagesRequest: ({ messages, trigger, ...rest }: any) => {
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

      const chat = new Chat({
        ...options,
        transport,
        sendAutomaticallyWhen: ai.lastAssistantMessageIsCompleteWithToolCalls,
        onToolCall({ toolCall }: any) {
          const tool = tools[toolCall.toolName];

          if (!tool) {
            if (__DEV__) {
              throw new Error(
                `No tool implementation found for "${toolCall.toolName}". Please provide a tool implementation in the \`tools\` prop.`
              );
            }

            return _chatInstance!.addToolResult({
              output: `No tool implemented for "${toolCall.toolName}".`,
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
            });
          }

          if (tool.onToolCall) {
            const addToolResult: AddToolResultWithOutput = ({ output }) =>
              _chatInstance!.addToolResult({
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
      });

      return chat;
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

        setInput = (i) => {
          input = i;
          render();
        };

        setIsClearing = (value) => {
          isClearing = value;
          render();
        };

        _chatInstance['~registerErrorCallback'](render);
        _chatInstance['~registerMessagesCallback'](render);
        _chatInstance['~registerStatusCallback'](render);

        if (resume) {
          _chatInstance.resumeStream();
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
        const { instantSearchInstance, parent } = renderOptions;
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

        const toolsWithAddToolResult: ClientSideTools = {};
        Object.entries(tools).forEach(([key, tool]) => {
          const toolWithAddToolResult: ClientSideTool = {
            ...tool,
            addToolResult: _chatInstance!.addToolResult,
          };
          toolsWithAddToolResult[key] = toolWithAddToolResult;
        });

        return {
          indexUiState: instantSearchInstance.getUiState()[parent.getIndexId()],
          input,
          open,
          sendEvent,
          setIndexUiState: parent.setIndexUiState.bind(parent),
          setInput,
          setOpen,
          setMessages,
          suggestions: getSuggestionsFromMessages(_chatInstance!.messages),
          isClearing,
          clearMessages,
          onClearTransitionEnd,
          tools: toolsWithAddToolResult,
          widgetParams,

          // Chat instance render state
          addToolResult: _chatInstance!.addToolResult,
          clearError: _chatInstance!.clearError,
          error: _chatInstance!.error,
          id: _chatInstance!.id || '',
          messages: _chatInstance!.messages,
          regenerate: _chatInstance!.regenerate,
          resumeStream: _chatInstance!.resumeStream,
          sendMessage: _chatInstance!.sendMessage,
          status: _chatInstance!.status,
          stop: _chatInstance!.stop,
        };
      },

      dispose() {
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
