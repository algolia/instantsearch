import { DefaultChatTransport } from 'ai';

import { Chat } from '../../lib/chat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  getAppIdAndApiKey,
  noop,
} from '../../lib/utils';

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
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat',
  connector: true,
});

export type ChatRenderState<TUiMessage extends UIMessage = UIMessage> = {
  input: string;
  open: boolean;
  /**
   * Sends an event to the Insights middleware.
   */
  sendEvent: SendEventForHits;
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
  agentId?: string;
  transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
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
};

export type ChatWidgetDescription<TUiMessage extends UIMessage = UIMessage> = {
  $$type: 'ais.chat';
  renderState: ChatRenderState<TUiMessage>;
  indexRenderState: {
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
    const { resume = false, ...options } = widgetParams || {};

    let _chatInstance: Chat<TUiMessage>;
    let input = '';
    let open = false;
    let sendEvent: SendEventForHits;
    let setInput: ChatRenderState<TUiMessage>['setInput'];
    let setOpen: ChatRenderState<TUiMessage>['setOpen'];

    const setMessages = (
      messagesParam: TUiMessage[] | ((m: TUiMessage[]) => TUiMessage[])
    ) => {
      if (typeof messagesParam === 'function') {
        messagesParam = messagesParam(_chatInstance.messages);
      }
      _chatInstance.messages = messagesParam;
    };

    const makeChatInstance = (instantSearchInstance: InstantSearch) => {
      let transport;
      const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);
      if ('transport' in options && options.transport) {
        transport = new DefaultChatTransport(options.transport);
      }
      if ('agentId' in options && options.agentId) {
        const { agentId } = options;
        if (!appId || !apiKey) {
          throw new Error(
            withUsage(
              'Could not extract Algolia credentials from the search client.'
            )
          );
        }
        transport = new DefaultChatTransport({
          api: `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`,
          headers: {
            'x-algolia-application-id': appId,
            'x-algolia-api-Key': apiKey,
          },
        });
      }
      if (!transport) {
        throw new Error(
          withUsage('You need to provide either an `agentId` or a `transport`.')
        );
      }

      const optionsWithTransport =
        'chat' in options
          ? options
          : {
              ...options,
              transport,
            };

      return 'chat' in optionsWithTransport
        ? optionsWithTransport.chat
        : new Chat(optionsWithTransport);
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

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          chat: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState(renderState) {
        if (!_chatInstance) {
          this.init!({ ...renderState, uiState: {}, results: undefined });
        }

        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance: renderState.instantSearchInstance,
            helper: renderState.helper,
            widgetType: this.$$type,
          });
        }

        return {
          input,
          open,
          sendEvent,
          setInput,
          setOpen,
          setMessages,
          widgetParams,

          // Chat instance render state
          addToolResult: _chatInstance.addToolResult,
          clearError: _chatInstance.clearError,
          error: _chatInstance.error,
          id: _chatInstance.id,
          messages: _chatInstance.messages,
          regenerate: _chatInstance.regenerate,
          resumeStream: _chatInstance.resumeStream,
          sendMessage: _chatInstance.sendMessage,
          status: _chatInstance.status,
          stop: _chatInstance.stop,
        };
      },

      dispose() {
        unmountFn();
      },
    };
  };
} satisfies ChatConnector);
