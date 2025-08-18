import { AbstractChat, DefaultChatTransport } from 'ai';

import { noop } from '../../lib/utils';

import type { Connector } from '../../types';
import type {
  ChatInit,
  ChatState as BaseChatState,
  ChatStatus,
  UIMessage,
} from 'ai';

export type ChatConnectorParams = {
  agentId: string;
};

export type ChatRenderState = Record<string, unknown>;

export type ChatWidgetDescription = {
  $$type: 'ais.chat';
  renderState: any;
  indexRenderState: any;
  indexUiState: any;
};

export type ChatConnector = Connector<
  ChatWidgetDescription,
  ChatConnectorParams
>;

class ChatState<TUiMessage extends UIMessage>
  implements BaseChatState<TUiMessage>
{
  _messages: TUiMessage[];
  _status: ChatStatus = 'ready';
  _error: Error | undefined = undefined;

  _messagesCallbacks = new Set<() => void>();
  _statusCallbacks = new Set<() => void>();
  _errorCallbacks = new Set<() => void>();

  constructor(initialMessages: TUiMessage[] = []) {
    this._messages = initialMessages;
  }

  get status(): ChatStatus {
    return this._status;
  }

  set status(newStatus: ChatStatus) {
    this._status = newStatus;
    this._callStatusCallbacks();
  }

  get error(): Error | undefined {
    return this._error;
  }

  set error(newError: Error | undefined) {
    this._error = newError;
    this._callErrorCallbacks();
  }

  get messages(): TUiMessage[] {
    return this._messages;
  }

  set messages(newMessages: TUiMessage[]) {
    this._messages = [...newMessages];
    this._callMessagesCallbacks();
  }

  pushMessage = (message: TUiMessage) => {
    this._messages = this._messages.concat(message);
    this._callMessagesCallbacks();
  };

  popMessage = () => {
    this._messages = this._messages.slice(0, -1);
    this._callMessagesCallbacks();
  };

  replaceMessage = (index: number, message: TUiMessage) => {
    this._messages = [
      ...this._messages.slice(0, index),
      // We deep clone the message here to ensure the new React Compiler (currently in RC) detects deeply nested parts/metadata changes:
      this.snapshot(message),
      ...this._messages.slice(index + 1),
    ];
    this._callMessagesCallbacks();
  };

  snapshot = <T>(value: T): T => structuredClone(value);

  '~registerMessagesCallback' = (onChange: () => void): (() => void) => {
    const callback = onChange;
    this._messagesCallbacks.add(callback);
    return () => {
      this._messagesCallbacks.delete(callback);
    };
  };

  '~registerStatusCallback' = (onChange: () => void): (() => void) => {
    this._statusCallbacks.add(onChange);
    return () => {
      this._statusCallbacks.delete(onChange);
    };
  };

  '~registerErrorCallback' = (onChange: () => void): (() => void) => {
    this._errorCallbacks.add(onChange);
    return () => {
      this._errorCallbacks.delete(onChange);
    };
  };

  _callMessagesCallbacks = () => {
    this._messagesCallbacks.forEach((callback) => callback());
  };

  _callStatusCallbacks = () => {
    this._statusCallbacks.forEach((callback) => callback());
  };

  _callErrorCallbacks = () => {
    this._errorCallbacks.forEach((callback) => callback());
  };
}

export class Chat<
  TUiMessage extends UIMessage
> extends AbstractChat<TUiMessage> {
  _state: ChatState<TUiMessage>;

  constructor({ messages, ...init }: ChatInit<TUiMessage>) {
    const state = new ChatState(messages);
    super({ ...init, state });
    this._state = state;
  }

  '~registerMessagesCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerMessagesCallback'](onChange);

  '~registerStatusCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerStatusCallback'](onChange);

  '~registerErrorCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerErrorCallback'](onChange);
}

const connectChat: ChatConnector = function connectChat(
  renderFn,
  unmountFn = noop
) {
  return (widgetParams) => {
    if (!widgetParams || !widgetParams.agentId) {
      throw new Error(
        'The `agentId` parameter is required for the Chat connector.'
      );
    }
    const chat = new Chat<UIMessage>({
      messages: [],
      transport: new DefaultChatTransport({
        api: `https://generative-eu.algolia.com/1/agents/${widgetParams.agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`,
        headers: {
          'x-algolia-application-id': 'F4T6CUV2AH',
          'X-Algolia-API-Key': '93aba0bf5908533b213d93b2410ded0c',
        },
      }),
    });
    let input = '';

    const lastRenderOptions = {
      current: {} as any,
    };
    chat['~registerMessagesCallback'](() => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      widget.render!(lastRenderOptions.current);
    });

    const widget: ReturnType<ReturnType<ChatConnector>> = {
      $$type: 'ais.chat',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render(renderOptions) {
        const { instantSearchInstance } = renderOptions;
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },

      getRenderState(renderState) {
        return renderState;
      },

      getWidgetRenderState(renderOptions) {
        lastRenderOptions.current = renderOptions;
        return {
          status: chat.status,
          messages: chat.messages,
          setMessages: (messages: UIMessage[]) => {
            chat.messages = messages;
          },
          sendMessage: (message: {
            text: string;
            parts?: never;
            messageId?: string;
          }) => chat.sendMessage(message),
          input,
          setInput: (newInput: string) => {
            input = newInput;
            this.render!(renderOptions as any);
          },
          // stop,
          // reload,
        };
      },

      getWidgetSearchParameters(searchParameters) {
        return searchParameters;
      },

      getWidgetUiState() {
        return {};
      },
    };

    return widget;
  };
};

export default connectChat;
