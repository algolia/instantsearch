import { loadAI } from './loadAI';

import type {
  UIMessage,
  BaseChatState,
  ChatStatus,
  ChatInitAi,
  AIModule,
} from './loadAI';

export type { UIMessage };
export type ChatInit<TUiMessage extends UIMessage> = ChatInitAi<TUiMessage> & {
  agentId?: string;
};

export const CACHE_KEY = 'instantsearch-chat-initial-messages';

function getDefaultInitialMessages<TUIMessage extends UIMessage>(
  id?: string
): TUIMessage[] {
  const initialMessages = sessionStorage.getItem(
    CACHE_KEY + (id ? `-${id}` : '')
  );
  return initialMessages ? JSON.parse(initialMessages) : [];
}

export class ChatState<TUiMessage extends UIMessage>
  implements BaseChatState<TUiMessage>
{
  _messages: TUiMessage[];
  _status: ChatStatus = 'ready';
  _error: Error | undefined = undefined;

  _messagesCallbacks = new Set<() => void>();
  _statusCallbacks = new Set<() => void>();
  _errorCallbacks = new Set<() => void>();

  constructor(
    id: string | undefined = undefined,
    initialMessages: TUiMessage[] = getDefaultInitialMessages<TUiMessage>(id)
  ) {
    this._messages = initialMessages;
    const saveMessagesInLocalStorage = () => {
      if (this.status === 'ready') {
        try {
          sessionStorage.setItem(
            CACHE_KEY + (id ? `-${id}` : ''),
            JSON.stringify(this.messages)
          );
        } catch (e) {
          // Do nothing if sessionStorage is not available or full
        }
      }
    };
    this['~registerMessagesCallback'](saveMessagesInLocalStorage);
    this['~registerStatusCallback'](saveMessagesInLocalStorage);
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

  snapshot = <T>(thing: T): T => {
    return JSON.parse(JSON.stringify(thing)) as T;
  };

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

export class Chat<TUiMessage extends UIMessage> {
  _state: ChatState<TUiMessage>;
  _abstractChat: InstanceType<AIModule['AbstractChat']>;

  constructor({ messages, agentId, ...init }: ChatInit<TUiMessage>) {
    const state = new ChatState(agentId, messages);
    this._state = state;

    try {
      // Load AI library and create AbstractChat instance
      const ai = loadAI();
      // @ts-expect-error AbstractChat is marked abstract in TypeScript but is instantiable at runtime in JavaScript
      this._abstractChat = new ai.AbstractChat({ ...init, state });
    } catch (error) {
      // Propagate error to state so UI can show it
      state.error = error as Error;
      state.status = 'error';
      throw error;
    }
  }

  get addToolResult() {
    return this._abstractChat.addToolResult.bind(this._abstractChat);
  }

  get clearError() {
    return () => {
      this._state.error = undefined;
      this._abstractChat.clearError();
    };
  }

  get error(): Error | undefined {
    return this._abstractChat.error;
  }

  get id(): string | undefined {
    return this._abstractChat.id;
  }

  get messages(): TUiMessage[] {
    return this._state.messages;
  }

  set messages(value: TUiMessage[]) {
    this._state.messages = value;
  }

  get regenerate() {
    return this._abstractChat.regenerate.bind(this._abstractChat);
  }

  get resumeStream() {
    return this._abstractChat.resumeStream.bind(this._abstractChat);
  }

  get sendMessage() {
    return this._abstractChat.sendMessage.bind(this._abstractChat);
  }

  get status(): ChatStatus {
    return this._state.status;
  }

  get stop() {
    return this._abstractChat.stop.bind(this._abstractChat);
  }

  '~registerMessagesCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerMessagesCallback'](onChange);

  '~registerStatusCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerStatusCallback'](onChange);

  '~registerErrorCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerErrorCallback'](onChange);
}
