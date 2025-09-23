import { AbstractChat } from 'ai';

import type {
  UIMessage,
  ChatState as BaseChatState,
  ChatStatus,
  ChatInit,
} from 'ai';

export type { UIMessage };
export { AbstractChat };
export { ChatInit };

export const CACHE_KEY = 'instantsearch-chat-initial-messages';

function getDefaultInitialMessages<
  TUIMessage extends UIMessage
>(): TUIMessage[] {
  const initialMessages = sessionStorage.getItem(CACHE_KEY);
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
    initialMessages: TUiMessage[] = getDefaultInitialMessages<TUiMessage>()
  ) {
    this._messages = initialMessages;
    const saveMessagesInLocalStorage = () => {
      if (this.status === 'ready') {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(this.messages));
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
