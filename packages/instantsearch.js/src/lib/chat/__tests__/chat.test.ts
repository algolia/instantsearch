/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { Chat, ChatState, CACHE_KEY } from '../chat';

describe('ChatState', () => {
  beforeAll(() => {
    // Mock sessionStorage for the tests
    const sessionStorageMock = (() => {
      const store: Record<string, string> = {};
      return {
        getItem(key: string) {
          return store[key] || null;
        },
        setItem(key: string, value: string) {
          store[key] = value.toString();
        },
        removeItem(key: string) {
          delete store[key];
        },
        clear() {
          Object.keys(store).forEach((key) => {
            delete store[key];
          });
        },
      };
    })();

    Object.defineProperty(globalThis, 'sessionStorage', {
      value: sessionStorageMock,
    });
  });

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterAll(() => {
    // Clean up the mock
    delete (globalThis as any).sessionStorage;
  });

  it('should save messages to sessionStorage when status changes to ready', () => {
    const agentId = 'agentID1';
    const chatState = new ChatState<any>(agentId);
    const message = { role: 'user', content: 'Hello' };
    chatState.status = 'submitted';
    chatState.messages = [message];
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(null);

    chatState.status = 'streaming';
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(null);

    chatState.status = 'ready';
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(
      JSON.stringify([message])
    );
  });

  it('should load initial messages from sessionStorage', () => {
    const agentId = 'agentID2';
    const initialMessages = [
      { role: 'user', content: 'Hello' },
      { role: 'bot', content: 'Hi there!' },
    ];
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify(initialMessages)
    );

    const chatState = new ChatState(agentId);
    expect(chatState.messages).toEqual(initialMessages);
  });

  it('should not load initial messages from sessionStorage when persistence is disabled', () => {
    const agentId = 'agentID5';
    const initialMessages = [
      { role: 'user', content: 'Hello' },
      { role: 'bot', content: 'Hi there!' },
    ];
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify(initialMessages)
    );

    // eslint-disable-next-line jest/unbound-method
    const originalGetItem = sessionStorage.getItem;
    sessionStorage.getItem = () => {
      throw new Error('unexpected sessionStorage read');
    };

    try {
      const chatState = new ChatState(agentId, undefined, false);
      expect(chatState.messages).toEqual([]);
    } finally {
      sessionStorage.getItem = originalGetItem;
    }
  });

  it('should use explicit messages when persistence is disabled', () => {
    const agentId = 'agentID6';
    const storedMessages = [{ role: 'user', content: 'Stored message' }];
    const initialMessages = [{ role: 'user', content: 'Explicit message' }];
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify(storedMessages)
    );

    const chatState = new ChatState<any>(agentId, initialMessages, false);

    expect(chatState.messages).toEqual(initialMessages);
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(
      JSON.stringify(storedMessages)
    );
  });

  it('should not save messages to sessionStorage when status is not ready', () => {
    const agentId = 'agentID3';
    const chatState = new ChatState<any>(agentId);
    const message = { role: 'user', content: 'Hello' };
    chatState.status = 'submitted';
    chatState.messages = [message];
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(null);

    chatState.status = 'streaming';
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(null);
    chatState.status = 'error';
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(null);
  });

  it('should not save messages to sessionStorage when persistence is disabled', () => {
    const agentId = 'agentID7';
    const chatState = new ChatState<any>(agentId, undefined, false);
    const message = { role: 'user', content: 'Hello' };

    chatState.status = 'submitted';
    chatState.messages = [message];
    chatState.status = 'ready';

    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(null);
  });

  it('should not persist messages for Chat when persistence is disabled', () => {
    const agentId = 'agentID8';
    const storedMessages = [{ role: 'user', content: 'Stored message' }];
    const message = { role: 'user', content: 'Hello' };
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify(storedMessages)
    );

    const chat = new Chat<any>({ agentId, persistence: false });
    expect(chat.messages).toEqual([]);

    chat.messages = [message];
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(
      JSON.stringify(storedMessages)
    );
  });

  it('should handle sessionStorage being unavailable', () => {
    const agentId = 'agentID4';
    // eslint-disable-next-line jest/unbound-method
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = () => {
      throw new Error('sessionStorage is full');
    };

    const chatState = new ChatState<any>(agentId);
    const message = { role: 'user', content: 'Hello' };
    chatState.status = 'submitted';
    chatState.messages = [message];
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(null);
    chatState.status = 'ready';
    expect(sessionStorage.getItem(`${CACHE_KEY}-${agentId}`)).toBe(null);

    sessionStorage.setItem = originalSetItem;
  });
});
