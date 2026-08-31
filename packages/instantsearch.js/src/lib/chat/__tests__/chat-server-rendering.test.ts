/**
 * @jest-environment @instantsearch/testutils/jest-environment-node.ts
 */
import { Chat, CACHE_KEY } from '../chat';

function installStorageObserver(storedValue?: string) {
  const reads: string[] = [];
  const writes: string[] = [];
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    'sessionStorage'
  );

  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem(key: string) {
        reads.push(key);
        return storedValue ?? null;
      },
      setItem(key: string) {
        writes.push(key);
      },
    },
  });

  return {
    reads,
    writes,
    restore() {
      if (descriptor) {
        Object.defineProperty(globalThis, 'sessionStorage', descriptor);
      } else {
        delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
      }
    },
  };
}

describe('Chat server rendering', () => {
  const agentId = 'server-rendering-agent';
  const storedMessages = JSON.stringify([
    { id: 'restored', role: 'assistant', parts: [{ type: 'text', text: 'R' }] },
  ]);

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('performs no storage read without a window', () => {
    const storage = installStorageObserver(storedMessages);

    try {
      const chat = new Chat<any>({ agentId, transport: {} as any });

      expect(chat.messages).toEqual([]);
      expect(storage.reads).toEqual([]);
    } finally {
      storage.restore();
    }
  });

  it('constructs without a window on a runtime that has no storage at all', () => {
    // The cases around this one install an observer, so they catch an unguarded
    // access but not that it would throw: they leave a working `sessionStorage`
    // behind. A real server has neither global.
    expect('sessionStorage' in globalThis).toBe(false);

    expect(
      () => new Chat<any>({ agentId, transport: {} as any })
    ).not.toThrow();
  });

  it('performs no storage write without a window when messages change', () => {
    const storage = installStorageObserver();

    try {
      const chat = new Chat<any>({ agentId, transport: {} as any });

      chat.messages = [
        { id: 'live', role: 'user', parts: [{ type: 'text', text: 'L' }] },
      ] as any;

      expect(storage.writes).toEqual([]);
    } finally {
      storage.restore();
    }
  });

  it('reads and writes storage once a window exists', () => {
    // Positive control: the same observer has to see the browser behavior, or
    // the empty assertions above would prove nothing.
    const storage = installStorageObserver(storedMessages);
    (globalThis as { window?: unknown }).window = globalThis;

    try {
      const chat = new Chat<any>({ agentId, transport: {} as any });

      expect(chat.messages).toHaveLength(1);
      expect(storage.reads).toEqual([`${CACHE_KEY}-${agentId}`]);

      chat.messages = [
        { id: 'live', role: 'user', parts: [{ type: 'text', text: 'L' }] },
      ] as any;

      expect(storage.writes).toEqual([`${CACHE_KEY}-${agentId}`]);
    } finally {
      storage.restore();
    }
  });
});
