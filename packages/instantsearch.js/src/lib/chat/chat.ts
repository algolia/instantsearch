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

export const CACHE_KEY = 'instantsearch-chat-initial-messages-';

function getDefaultInitialMessages<TUIMessage extends UIMessage>(
  id?: string
): TUIMessage[] {
  const initialMessages = sessionStorage.getItem(CACHE_KEY + id);
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
    initialMessages: TUiMessage[] = [],
    enableCaching: boolean = true
  ) {
    this._messages =
      enableCaching && initialMessages.length === 0
        ? getDefaultInitialMessages<TUiMessage>(id)
        : [];
    const saveMessagesInLocalStorage = () => {
      if (this.status === 'ready' && enableCaching) {
        // We remove data-* parts before saving as it causes validation errors on the API side
        this.messages.forEach((message) => {
          if (message.role === 'assistant') {
            const newParts = message.parts.filter(
              (part) => !part.type.includes('data-')
            );

            message.parts = newParts;
          }
        });

        try {
          sessionStorage.setItem(CACHE_KEY + id, JSON.stringify(this.messages));
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

  get data(): unknown {
    return this.data;
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

  constructor({
    messages,
    agentId,
    enableCaching = true,
    ...init
  }: ChatInit<TUiMessage> & { agentId?: string; enableCaching?: boolean }) {
    const state = new ChatState(agentId, messages, enableCaching);
    super({ ...init, state });
    this._state = state;
  }

  get data() {
    return this._state.data;
  }

  '~registerMessagesCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerMessagesCallback'](onChange);

  '~registerStatusCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerStatusCallback'](onChange);

  '~registerErrorCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerErrorCallback'](onChange);
}
