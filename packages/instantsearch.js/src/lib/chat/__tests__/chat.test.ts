/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { ChatState, CACHE_KEY } from '../chat';

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
      };
    })();

    Object.defineProperty(globalThis, 'sessionStorage', {
      value: sessionStorageMock,
    });
  });

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_KEY + '-agentID1');
    sessionStorage.removeItem(CACHE_KEY + '-agentID2');
    sessionStorage.removeItem(CACHE_KEY + '-agentID3');
    sessionStorage.removeItem(CACHE_KEY + '-agentID4');
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
    expect(sessionStorage.getItem(CACHE_KEY + '-' + agentId)).toBe(null);

    chatState.status = 'streaming';
    expect(sessionStorage.getItem(CACHE_KEY + '-' + agentId)).toBe(null);

    chatState.status = 'ready';
    expect(sessionStorage.getItem(CACHE_KEY + '-' + agentId)).toBe(
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
      CACHE_KEY + '-' + agentId,
      JSON.stringify(initialMessages)
    );

    const chatState = new ChatState(agentId);
    expect(chatState.messages).toEqual(initialMessages);
  });

  it('should not save messages to sessionStorage when status is not ready', () => {
    const agentId = 'agentID3';
    const chatState = new ChatState<any>(agentId);
    const message = { role: 'user', content: 'Hello' };
    chatState.status = 'submitted';
    chatState.messages = [message];
    expect(sessionStorage.getItem(CACHE_KEY + '-' + agentId)).toBe(null);

    chatState.status = 'streaming';
    expect(sessionStorage.getItem(CACHE_KEY + '-' + agentId)).toBe(null);
    chatState.status = 'error';
    expect(sessionStorage.getItem(CACHE_KEY + '-' + agentId)).toBe(null);
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
    expect(sessionStorage.getItem(CACHE_KEY + '-' + agentId)).toBe(null);
    chatState.status = 'ready';
    expect(sessionStorage.getItem(CACHE_KEY + '-' + agentId)).toBe(null);

    sessionStorage.setItem = originalSetItem;
  });
});
