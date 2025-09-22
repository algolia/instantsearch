import { ChatState, CACHE_KEY } from '../chat';

// mock AbstractChat to avoid "TypeError: Class extends value undefined is not a constructor or null"
jest.mock('ai', () => {
  return {
    AbstractChat: class {},
  };
});

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
  });

  afterAll(() => {
    // Clean up the mock
    delete (globalThis as any).sessionStorage;
  });

  it('should save messages to sessionStorage when status changes to ready', () => {
    const chatState = new ChatState<any>();
    const message = { role: 'user', content: 'Hello' };
    chatState.status = 'submitted';
    chatState.messages = [message];
    expect(sessionStorage.getItem(CACHE_KEY)).toBe(null);

    chatState.status = 'streaming';
    expect(sessionStorage.getItem(CACHE_KEY)).toBe(null);

    chatState.status = 'ready';
    expect(sessionStorage.getItem(CACHE_KEY)).toBe(JSON.stringify([message]));
  });

  it('should load initial messages from sessionStorage', () => {
    const initialMessages = [
      { role: 'user', content: 'Hello' },
      { role: 'bot', content: 'Hi there!' },
    ];
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(initialMessages));

    const chatState = new ChatState();
    expect(chatState.messages).toEqual(initialMessages);
  });

  it('should not save messages to sessionStorage when status is not ready', () => {
    const chatState = new ChatState<any>();
    const message = { role: 'user', content: 'Hello' };
    chatState.status = 'submitted';
    chatState.messages = [message];
    expect(sessionStorage.getItem(CACHE_KEY)).toBe(null);

    chatState.status = 'streaming';
    expect(sessionStorage.getItem(CACHE_KEY)).toBe(null);
    chatState.status = 'error';
    expect(sessionStorage.getItem(CACHE_KEY)).toBe(null);
  });

  it('should handle sessionStorage being unavailable', () => {
    // eslint-disable-next-line jest/unbound-method
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = () => {
      throw new Error('sessionStorage is full');
    };

    const chatState = new ChatState<any>();
    const message = { role: 'user', content: 'Hello' };
    chatState.status = 'submitted';
    chatState.messages = [message];
    expect(sessionStorage.getItem(CACHE_KEY)).toBe(null);
    chatState.status = 'ready';
    expect(sessionStorage.getItem(CACHE_KEY)).toBe(null);

    sessionStorage.setItem = originalSetItem;
  });
});
