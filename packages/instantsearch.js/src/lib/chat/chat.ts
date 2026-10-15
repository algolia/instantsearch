import { AbstractChat } from '../ai-lite';
import { safelyRunOnBrowser } from '../utils/safelyRunOnBrowser';

import type {
  UIMessage,
  ChatState as BaseChatState,
  ChatStatus,
  ChatInit as BaseChatInit,
} from '../ai-lite';

export type { UIMessage };
export { AbstractChat };

export type ChatInit<TUiMessage extends UIMessage> =
  BaseChatInit<TUiMessage> & {
    agentId?: string;
    /**
     * Whether to persist and restore messages from sessionStorage.
     *
     * @default true
     */
    persistence?: boolean;
  };

export const CACHE_KEY = 'instantsearch-chat-initial-messages';
export const CONVERSATION_ID_CACHE_KEY = 'instantsearch-chat-conversation-id';

// Kept apart from the messages, which are stored as a bare array: a wrapper
// would make the messages unreadable to a build that predates it.
function getConversationIdCacheKey(agentId?: string) {
  return CONVERSATION_ID_CACHE_KEY + (agentId ? `-${agentId}` : '');
}

function getStoredConversationId(agentId?: string): string | undefined {
  return safelyRunOnBrowser<string | undefined>(
    () => {
      try {
        return (
          sessionStorage.getItem(getConversationIdCacheKey(agentId)) ||
          undefined
        );
      } catch (e) {
        return undefined;
      }
    },
    { fallback: () => undefined }
  );
}

// Message history is a browser concern, and a server render constructs a Chat
// too. Reading storage there throws during rendering; the write below only
// throws into its own `catch`, so gating it just stops a pointless attempt.
function getDefaultInitialMessages<TUIMessage extends UIMessage>(
  id?: string
): TUIMessage[] {
  return safelyRunOnBrowser<TUIMessage[]>(
    () => {
      try {
        // `sessionStorage` is not available in every environment with a
        // `window` (e.g. React Native), and some browsers throw on access
        // when storage is disabled.
        const initialMessages = sessionStorage.getItem(
          CACHE_KEY + (id ? `-${id}` : '')
        );
        return initialMessages ? JSON.parse(initialMessages) : [];
      } catch (e) {
        return [];
      }
    },
    { fallback: () => [] }
  );
}

export class ChatState<
  TUiMessage extends UIMessage,
> implements BaseChatState<TUiMessage> {
  _messages: TUiMessage[];
  _status: ChatStatus = 'ready';
  _error: Error | undefined = undefined;

  _messagesCallbacks = new Set<() => void>();
  _statusCallbacks = new Set<() => void>();
  _errorCallbacks = new Set<() => void>();
  private persistenceKey: string | undefined;

  constructor(
    id: string | undefined = undefined,
    initialMessages: TUiMessage[] | undefined = undefined,
    persistence = true
  ) {
    if (initialMessages !== undefined) {
      this._messages = initialMessages;
    } else if (persistence) {
      this._messages = getDefaultInitialMessages<TUiMessage>(id);
    } else {
      this._messages = [];
    }

    if (!persistence) {
      return;
    }

    this.persistenceKey = CACHE_KEY + (id ? `-${id}` : '');
    const saveMessagesInSessionStorage = () => {
      if (this.status === 'ready') {
        this['~persistMessages']();
      }
    };
    this['~registerMessagesCallback'](saveMessagesInSessionStorage);
    this['~registerStatusCallback'](saveMessagesInSessionStorage);
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

  '~persistMessages' = (): void => {
    const persistenceKey = this.persistenceKey;
    if (!persistenceKey) return;

    safelyRunOnBrowser(() => {
      try {
        sessionStorage.setItem(persistenceKey, JSON.stringify(this.messages));
      } catch (e) {
        // Do nothing if sessionStorage is not available or full
      }
    });
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
  TUiMessage extends UIMessage,
> extends AbstractChat<TUiMessage> {
  _state: ChatState<TUiMessage>;
  private hasRestoredMessages = false;
  private conversationIdCacheKey: string | undefined;

  constructor({
    messages,
    agentId,
    persistence = true,
    ...init
  }: ChatInit<TUiMessage>) {
    const state = new ChatState(agentId, messages, persistence);
    // Messages restored from storage continue the conversation they belong to.
    // An explicit `id` or explicit `messages` means the caller owns that.
    const restoredId =
      persistence && messages === undefined && init.id === undefined
        ? getStoredConversationId(agentId)
        : undefined;
    super({ ...init, id: init.id ?? restoredId, state });
    this._state = state;
    if (persistence) {
      this.conversationIdCacheKey = getConversationIdCacheKey(agentId);
      if (init.id === undefined && messages === undefined) {
        this.persistConversationId();
      }
    }
    if (messages === undefined && persistence) {
      this.hasRestoredMessages = true;
      this.captureRestoredToolCalls();
      this.repairRestoredPendingToolParts();
    }
  }

  private persistConversationId(): void {
    const key = this.conversationIdCacheKey;
    if (!key) return;

    safelyRunOnBrowser(() => {
      try {
        sessionStorage.setItem(key, this.id);
      } catch (e) {
        // Do nothing if sessionStorage is not available or full
      }
    });
  }

  resetConversationId(): void {
    super.resetConversationId();
    this.persistConversationId();
  }

  setConversationId(id: string): void {
    super.setConversationId(id);
    this.persistConversationId();
  }

  '~repairRestoredPendingToolParts' = (): void => {
    if (!this.hasRestoredMessages) return;

    this.hasRestoredMessages = false;
    this.repairRestoredPendingToolParts();
    this.clearRestoredToolCalls();
    this._state['~persistMessages']();
  };

  '~registerMessagesCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerMessagesCallback'](onChange);

  '~registerStatusCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerStatusCallback'](onChange);

  '~registerErrorCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerErrorCallback'](onChange);
}
