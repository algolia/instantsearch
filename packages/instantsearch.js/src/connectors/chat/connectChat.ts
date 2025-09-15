import { DefaultChatTransport } from 'ai';

import { Chat } from '../../lib/chat';
import { getAppIdAndApiKey, noop } from '../../lib/utils';

import type {
  AbstractChat,
  ChatInit as ChatInitAi,
  UIMessage,
} from '../../lib/chat';
import type {
  Connector,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
} from '../../types';
import type { ChatStatus } from 'instantsearch-ui-components';

export type ChatRenderState<TUiMessage extends UIMessage = UIMessage> = {
  /**
   * The id of the chat.
   */
  readonly id: string;

  /**
   * Update the `messages` state locally. This is useful when you want to
   * edit the messages on the client, and then trigger the `reload` method
   * manually to regenerate the AI response.
   */
  setMessages: (
    messages: TUiMessage[] | ((m: TUiMessage[]) => TUiMessage[])
  ) => void;

  open: boolean;
  setOpen: (open: boolean) => void;
  input: string;
  setInput: (input: string) => void;

  error: Error | undefined;
} & Pick<
  AbstractChat<TUiMessage>,
  | 'sendMessage'
  | 'regenerate'
  | 'stop'
  | 'resumeStream'
  | 'addToolResult'
  | 'status'
  | 'messages'
  | 'clearError'
>;

export type ChatInitWithoutTransport<TUiMessage extends UIMessage> = Omit<
  ChatInitAi<TUiMessage>,
  'transport'
>;

export type ChatTransport = {
  agentId?: string;
  transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
};

export type ChatInit<TUiMessage extends UIMessage> =
  ChatInitWithoutTransport<TUiMessage> & ChatTransport;

export type UseChatOptions<TUiMessage extends UIMessage> = (
  | { chat: Chat<TUiMessage> }
  | ChatInit<TUiMessage>
) & {
  /**
   * Whether to resume an ongoing chat generation stream.
   */
  resume?: boolean;
};

export type ChatConnectorParams<TUiMessage extends UIMessage = UIMessage> = (
  | { chat: Chat<TUiMessage> }
  | ChatInit<TUiMessage>
) & {
  /**
   * Whether to resume an ongoing chat generation stream.
   */
  resume?: boolean;
};

export type ChatWidgetDescription<TUiMessage extends UIMessage> = {
  $$type: 'ais.chat';
  renderState: ChatRenderState<TUiMessage>;
};

export type ChatConnector<TUiMessage extends UIMessage = UIMessage> = Connector<
  ChatWidgetDescription<TUiMessage>,
  ChatConnectorParams<TUiMessage>
>;

export default (function connectChat<TWidgetParams extends UnknownWidgetParams>(
  renderFn: Renderer<ChatRenderState, TWidgetParams & ChatConnectorParams>,
  unmountFn: Unmounter = noop
) {
  return <TUiMessage extends UIMessage = UIMessage>(
    widgetParams: TWidgetParams & ChatConnectorParams<TUiMessage>
  ) => {
    const { resume = false, ...options } = widgetParams || {};
    let _chatInstance: Chat<TUiMessage>;
    let messages = [] as TUiMessage[];
    let setMessages: (
      messagesParam: TUiMessage[] | ((m: TUiMessage[]) => TUiMessage[])
    ) => void;
    let error: Error | undefined;
    let status: ChatStatus;
    let chatOpen = false;
    let chatInput = '';
    let chatSetOpen: (open: boolean) => void;
    let chatSetInput: (input: string) => void;

    return {
      $$type: 'ais.chat',

      init(initOptions) {
        const [appId, apiKey] = getAppIdAndApiKey(
          initOptions.instantSearchInstance.client
        );

        const transport = (() => {
          if ('transport' in options && options.transport) {
            return new DefaultChatTransport(options.transport);
          }
          if ('agentId' in options && options.agentId) {
            const { agentId } = options;
            if (!appId || !apiKey) {
              throw new Error(
                'The `connectChat` requires an `appId` and `apiKey` to be set on the `InstantSearch` component when using the `agentId` option.'
              );
            }
            return new DefaultChatTransport({
              api: `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`,
              headers: {
                'x-algolia-application-id': appId,
                'x-algolia-api-Key': apiKey,
              },
            });
          }

          throw new Error(
            'You need to provide either an `agentId` or a `transport`.'
          );
        })();

        const optionsWithTransport = (() => {
          if ('chat' in options) {
            return options;
          }
          return {
            ...options,
            transport,
          };
        })();

        _chatInstance =
          'chat' in optionsWithTransport
            ? (optionsWithTransport.chat as Chat<TUiMessage>) // TODO: fix assertion
            : new Chat(optionsWithTransport);

        const rerender = () => {
          renderFn(
            // @ts-expect-error
            {
              // @ts-expect-error
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance: initOptions.instantSearchInstance,
            },
            false
          );
        };

        _chatInstance['~registerMessagesCallback'](() => {
          messages = _chatInstance.messages;
          rerender();
        });

        _chatInstance['~registerErrorCallback'](() => {
          error = _chatInstance.error;
          rerender();
        });

        _chatInstance['~registerStatusCallback'](() => {
          status = _chatInstance.status;
          rerender();
        });

        setMessages = (
          messagesParam: TUiMessage[] | ((m: TUiMessage[]) => TUiMessage[])
        ) => {
          if (typeof messagesParam === 'function') {
            messagesParam = messagesParam(_chatInstance.messages);
          }
          _chatInstance.messages = messagesParam;
        };

        chatSetOpen = (open: boolean) => {
          chatOpen = open;
          rerender();
        };

        chatSetInput = (input: string) => {
          chatInput = input;
          rerender();
        };

        renderFn(
          // @ts-expect-error
          {
            // @ts-expect-error
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        // @ts-expect-error
        const renderState = this.getWidgetRenderState(renderOptions);

        renderFn(
          // @ts-expect-error
          {
            ...renderState,
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState) {
        return renderState;
      },

      getWidgetRenderState() {
        if (!_chatInstance) {
          throw new Error(
            'The `chat` instance is not available yet. Did you forget to call `init`?'
          );
        }

        // TODO: make sure resume works as expected / same as useChat
        if (resume) {
          _chatInstance.resumeStream();
        }

        return {
          widgetParams,
          id: _chatInstance.id,
          messages,
          setMessages,
          sendMessage: _chatInstance.sendMessage,
          regenerate: _chatInstance.regenerate,
          clearError: _chatInstance.clearError,
          stop: _chatInstance.stop,
          error,
          resumeStream: _chatInstance.resumeStream,
          status,
          addToolResult: _chatInstance.addToolResult,
          open: chatOpen,
          setOpen: chatSetOpen,
          input: chatInput,
          setInput: chatSetInput,
        };
      },

      dispose() {
        unmountFn();
      },

      getWidgetParameters(state) {
        return state;
      },
    };
  };
} satisfies ChatConnector);
