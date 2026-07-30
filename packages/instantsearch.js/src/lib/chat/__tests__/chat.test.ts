/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { runInNewContext } from 'vm';
import { MessageChannel } from 'worker_threads';

import { Chat, ChatState, CACHE_KEY } from '../chat';
import {
  getChatMessagesRevision,
  releaseChatMessagesRevision,
  retainChatMessagesRevision,
} from '../messagesRevision';

function detachArrayBuffer(buffer: ArrayBuffer): void {
  const { port1, port2 } = new MessageChannel();
  port1.postMessage(buffer, [buffer]);
  port1.close();
  port2.close();
}

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

  it('should use empty messages when reading sessionStorage throws', () => {
    // eslint-disable-next-line jest/unbound-method
    const originalGetItem = sessionStorage.getItem;
    sessionStorage.getItem = () => {
      throw new Error('blocked');
    };

    try {
      let chatState!: ChatState<any>;
      expect(() => {
        chatState = new ChatState('agentID-blocked');
      }).not.toThrow();
      expect(chatState.messages).toEqual([]);
    } finally {
      sessionStorage.getItem = originalGetItem;
    }
  });

  it('should use empty messages when persisted data is malformed', () => {
    const agentId = 'agentID-malformed';
    sessionStorage.setItem(`${CACHE_KEY}-${agentId}`, '{');

    let chatState!: ChatState<any>;
    expect(() => {
      chatState = new ChatState(agentId);
    }).not.toThrow();
    expect(chatState.messages).toEqual([]);
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

  it('should distinguish explicit messages from restored messages', () => {
    const agentId = 'agentID-provenance';
    const storedMessages = [{ role: 'user', content: 'Stored message' }];
    const explicitMessages = [{ role: 'user', content: 'Explicit message' }];
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify(storedMessages)
    );

    const restoredState = new ChatState<any>(agentId);
    const explicitState = new ChatState<any>(agentId, explicitMessages);

    expect(restoredState.messages).toEqual(storedMessages);
    expect(restoredState['~getServerMessages']()).toEqual([]);
    expect(explicitState.messages).toEqual(explicitMessages);
    expect(explicitState['~getServerMessages']()).toEqual(explicitMessages);

    explicitState.messages = [
      { role: 'user', content: 'Changed after construction' },
    ];

    expect(restoredState['~getServerMessages']()).toEqual([]);
    expect(explicitState['~getServerMessages']()).toEqual([
      { role: 'user', content: 'Explicit message' },
    ]);
  });

  it('does not move a late custom message into the server snapshot', () => {
    const chat = new Chat<any>({ persistence: false });

    chat.messages = [{ role: 'user', content: 'Live message' }];

    expect(chat['~getServerMessages']()).toEqual([]);
  });

  it('shares captured message revisions across separate module copies', () => {
    let getRevision!: typeof getChatMessagesRevision;
    let CopiedChat!: typeof Chat;

    jest.isolateModules(() => {
      ({ getChatMessagesRevision: getRevision } = jest.requireActual(
        '../messagesRevision'
      ));
    });
    jest.isolateModules(() => {
      ({ Chat: CopiedChat } = jest.requireActual('../chat'));
    });

    const chat = new CopiedChat<any>({ persistence: false });
    chat.messages = [{ role: 'user', content: 'Assigned message' }];
    const capturedRevision = getRevision();
    retainChatMessagesRevision(capturedRevision);
    chat.messages = [{ role: 'user', content: 'Live message' }];

    expect(chat['~getServerMessages'](capturedRevision)).toEqual([
      { role: 'user', content: 'Assigned message' },
    ]);
    releaseChatMessagesRevision(capturedRevision);
  });

  it('retains the message values for a captured revision', () => {
    const chat = new Chat<any>({ persistence: false });
    const capturedMessages = [
      {
        role: 'assistant',
        parts: [{ type: 'text', text: 'Captured message' }],
      },
    ];
    chat.messages = capturedMessages;
    const capturedRevision = getChatMessagesRevision();
    retainChatMessagesRevision(capturedRevision);

    capturedMessages[0].parts[0].text = 'Mutated message';
    chat.messages = [{ role: 'assistant', content: 'First live message' }];
    chat.messages = [{ role: 'assistant', content: 'Latest live message' }];

    expect(chat['~getServerMessages'](capturedRevision)).toEqual([
      {
        role: 'assistant',
        parts: [{ type: 'text', text: 'Captured message' }],
      },
    ]);
    releaseChatMessagesRevision(capturedRevision);
  });

  it('releases messages retained for a captured revision', () => {
    const chat = new Chat<any>({ persistence: false });
    chat.messages = [{ role: 'assistant', content: 'Captured message' }];
    const capturedRevision = getChatMessagesRevision();
    retainChatMessagesRevision(capturedRevision);

    chat.messages = [{ role: 'assistant', content: 'Live message' }];

    expect(chat['~getServerMessages'](capturedRevision)).toEqual([
      { role: 'assistant', content: 'Captured message' },
    ]);

    releaseChatMessagesRevision(capturedRevision);

    expect(chat['~getServerMessages'](capturedRevision)).toEqual([]);
  });

  it('keeps overlapping captured revisions isolated until each releases', () => {
    const chat = new Chat<any>({ persistence: false });
    chat.messages = [{ role: 'assistant', content: 'First capture' }];
    const firstRevision = getChatMessagesRevision();
    retainChatMessagesRevision(firstRevision);

    chat.messages = [{ role: 'assistant', content: 'Second capture' }];
    const secondRevision = getChatMessagesRevision();
    retainChatMessagesRevision(secondRevision);

    chat.messages = [{ role: 'assistant', content: 'Live message' }];

    expect(chat['~getServerMessages'](firstRevision)).toEqual([
      { role: 'assistant', content: 'First capture' },
    ]);
    expect(chat['~getServerMessages'](secondRevision)).toEqual([
      { role: 'assistant', content: 'Second capture' },
    ]);

    releaseChatMessagesRevision(firstRevision);

    expect(chat['~getServerMessages'](firstRevision)).toEqual([]);
    expect(chat['~getServerMessages'](secondRevision)).toEqual([
      { role: 'assistant', content: 'Second capture' },
    ]);

    releaseChatMessagesRevision(secondRevision);
  });

  it('releases repeated capture lifecycles', () => {
    const chat = new Chat<any>({ persistence: false });

    Array.from({ length: 100 }).forEach((_, index) => {
      chat.messages = [
        { role: 'assistant', content: `Captured message ${index}` },
      ];
      const capturedRevision = getChatMessagesRevision();
      retainChatMessagesRevision(capturedRevision);

      chat.messages = [{ role: 'assistant', content: `Live message ${index}` }];

      expect(chat['~getServerMessages'](capturedRevision)).toEqual([
        { role: 'assistant', content: `Captured message ${index}` },
      ]);
      releaseChatMessagesRevision(capturedRevision);
      expect(chat['~getServerMessages'](capturedRevision)).toEqual([]);
    });
  });

  it('keeps a captured revision through a release and retain replay', () => {
    const chat = new Chat<any>({ persistence: false });
    chat.messages = [{ role: 'assistant', content: 'Captured message' }];
    const capturedRevision = getChatMessagesRevision();
    retainChatMessagesRevision(capturedRevision);

    chat.messages = [{ role: 'assistant', content: 'Live message' }];
    releaseChatMessagesRevision(capturedRevision);
    retainChatMessagesRevision(capturedRevision);

    expect(chat['~getServerMessages'](capturedRevision)).toEqual([
      { role: 'assistant', content: 'Captured message' },
    ]);

    releaseChatMessagesRevision(capturedRevision);
  });

  it('does not use restored messages for a captured server revision', () => {
    const agentId = 'agentID-captured-provenance';
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify([{ role: 'assistant', content: 'Restored message' }])
    );
    const chat = new Chat<any>({ agentId });
    const capturedRevision = getChatMessagesRevision();
    retainChatMessagesRevision(capturedRevision);

    chat.messages = [{ role: 'assistant', content: 'Live message' }];

    expect(chat['~getServerMessages'](capturedRevision)).toEqual([]);
    releaseChatMessagesRevision(capturedRevision);
  });

  it('isolates constructor message values in the server baseline', () => {
    const cyclicData: Record<string, unknown> = {};
    cyclicData.self = cyclicData;
    const createdAt = new Date('2026-07-24T00:00:00.000Z');
    const matcher = /initial/dgimsuy;
    matcher.lastIndex = 2;
    Object.defineProperties(matcher, {
      source: {
        configurable: true,
        enumerable: true,
        value: 'custom matcher metadata',
      },
      flags: {
        configurable: true,
        enumerable: true,
        value: 'custom matcher metadata',
      },
    });
    const metadata = {
      count: BigInt(1),
      createdAt,
      cyclicData,
      matcher,
    };
    const messages = [
      {
        id: 'custom',
        role: 'assistant',
        metadata,
        parts: [{ type: 'text', text: 'Custom message' }],
      },
    ];

    const chat = new Chat<any>({ messages, persistence: false });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot).not.toBe(messages);
    expect(snapshot[0]).not.toBe(messages[0]);
    expect(snapshot[0].metadata).not.toBe(metadata);
    expect(snapshot[0].metadata.createdAt).not.toBe(createdAt);
    expect(snapshot[0].metadata.createdAt).toEqual(createdAt);
    expect(snapshot[0].metadata.cyclicData).not.toBe(cyclicData);
    expect(snapshot[0].metadata.cyclicData.self).toBe(
      snapshot[0].metadata.cyclicData
    );
    expect(snapshot[0].metadata.matcher).not.toBe(matcher);
    expect(snapshot[0].metadata.matcher).toEqual(matcher);
    expect(
      Object.getOwnPropertyDescriptor(RegExp.prototype, 'source')?.get?.call(
        snapshot[0].metadata.matcher
      )
    ).toBe('initial');
    expect(
      Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags')?.get?.call(
        snapshot[0].metadata.matcher
      )
    ).toBe('dgimsuy');
    expect(snapshot[0].metadata.matcher.source).toBe('custom matcher metadata');
    expect(snapshot[0].metadata.matcher.flags).toBe('custom matcher metadata');

    messages.push({ ...messages[0], id: 'late' });
    messages[0].parts[0].text = 'Changed custom message';
    createdAt.setUTCFullYear(2027);
    cyclicData.changed = true;
    matcher.lastIndex = 3;
    chat.messages = [
      {
        id: 'live',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Live message' }],
      },
    ];

    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].parts[0].text).toBe('Custom message');
    expect(snapshot[0].metadata.createdAt).toEqual(
      new Date('2026-07-24T00:00:00.000Z')
    );
    expect(snapshot[0].metadata.cyclicData.changed).toBeUndefined();
    expect(snapshot[0].metadata.matcher.lastIndex).toBe(2);
    expect(chat['~getServerMessages']()).toBe(snapshot);
  });

  it('preserves opaque metadata behavior in the server baseline', () => {
    class Metadata {
      #value: string;

      constructor(value: string) {
        this.#value = value;
      }

      get value() {
        return this.#value;
      }
    }

    const metadata = new Metadata('Custom metadata');
    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata).toBe(metadata);
    expect(snapshot[0].metadata.value).toBe('Custom metadata');
  });

  it('preserves opaque built-in subclasses in the server baseline', () => {
    class MetadataMap extends Map<string, string> {
      #label = 'Custom map';

      get label() {
        return this.#label;
      }
    }

    const metadata = new MetadataMap([['key', 'value']]);
    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata).toBe(metadata);
    expect(snapshot[0].metadata.get('key')).toBe('value');
    expect(snapshot[0].metadata.label).toBe('Custom map');
  });

  it('preserves proxy-wrapped RegExp metadata as opaque', () => {
    const metadata = new Proxy(/custom/gi, {});
    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata).toBe(metadata);
  });

  it('preserves metadata when a proxy throws a cross-realm TypeError', () => {
    const ForeignTypeError = runInNewContext('TypeError') as typeof TypeError;
    const metadata = new Proxy(/custom/gi, {
      getPrototypeOf() {
        throw new ForeignTypeError('cross-realm metadata');
      },
    });
    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata).toBe(metadata);
  });

  it('preserves metadata when a proxy throws a non-TypeError', () => {
    const metadata = new Proxy(/custom/gi, {
      getPrototypeOf() {
        throw new Error('opaque prototype');
      },
    });

    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata).toBe(metadata);
  });

  it('preserves metadata when a proxy key trap throws', () => {
    const metadata = new Proxy(
      { label: 'Custom label' },
      {
        ownKeys() {
          throw new Error('opaque keys');
        },
      }
    );

    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata).toBe(metadata);
  });

  it('clones metadata when a proxy prototype trap starts throwing', () => {
    let looks = 0;
    const metadata = new Proxy(
      { label: 'Custom label' },
      {
        getPrototypeOf(target) {
          looks += 1;
          if (looks > 1) {
            throw new Error('second look');
          }
          return Object.getPrototypeOf(target);
        },
      }
    );

    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata).toEqual({ label: 'Custom label' });
  });

  it('detaches metadata when defining a cloned property throws', () => {
    const target: any = [];
    Object.defineProperty(target, 'length', { writable: false });
    const metadata = new Proxy(target, {
      getPrototypeOf: () => Array.prototype,
      ownKeys: () => ['length', '5'],
      getOwnPropertyDescriptor: (source, key) =>
        key === 'length'
          ? Object.getOwnPropertyDescriptor(source, 'length')
          : {
              value: 'x',
              writable: true,
              enumerable: true,
              configurable: true,
            },
    });

    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    // The unwritable property is dropped, but the snapshot must not fall back
    // to the live value: that would let later mutations reach the baseline.
    expect(snapshot[0].metadata).not.toBe(metadata);
    expect(Array.isArray(snapshot[0].metadata)).toBe(true);
  });

  it('keeps the rest of a message detached when a getter throws', () => {
    const message: any = {
      id: 'custom',
      role: 'assistant',
      parts: [{ type: 'text', text: 'original' }],
    };
    Object.defineProperty(message, 'metadata', {
      enumerable: true,
      configurable: true,
      get() {
        throw new Error('unreadable');
      },
    });

    const chat = new Chat<any>({ messages: [message], persistence: false });
    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0]).not.toBe(message);

    message.parts[0].text = 'mutated';

    expect(snapshot[0].parts[0].text).toBe('original');
  });

  it('keeps sibling properties when an extra getter throws', () => {
    const metadata: any = new Date(0);
    metadata.other = 'keep-me';
    Object.defineProperty(metadata, 'note', {
      enumerable: true,
      configurable: true,
      get() {
        throw new Error('unreadable');
      },
    });

    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata.other).toBe('keep-me');
  });

  it('keeps siblings when a getter mutates the source while capturing', () => {
    const metadata: any = {};
    Object.defineProperty(metadata, 'first', {
      enumerable: true,
      configurable: true,
      get() {
        delete metadata.second;
        return 1;
      },
    });
    metadata.second = 2;

    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata.first).toBe(1);
    expect(snapshot[0].metadata.second).toBe(2);
  });

  it('detaches a this-derived accessor from the live message', () => {
    const message: any = {
      id: 'custom',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hello' }],
      get text(): string {
        return this.parts.map((part: any) => part.text).join('');
      },
    };

    const chat = new Chat<any>({ messages: [message], persistence: false });
    const snapshot = chat['~getServerMessages']();

    message.parts.push({ type: 'text', text: ', world' });

    // The copied accessor reads the clone's own parts, so the baseline holds.
    expect(snapshot[0].text).toBe('Hello');
    expect(message.text).toBe('Hello, world');
  });

  it('keeps a this-derived accessor live on the streamed message', () => {
    const state = new ChatState<any>(undefined, [], false);
    state.pushMessage({
      id: 'custom',
      role: 'assistant',
      parts: [],
      get text(): string {
        return this.parts.map((part: any) => part.text).join('');
      },
    } as any);

    // The transport feeds the previous canonical message forward each chunk.
    ['Hello', ', ', 'world'].forEach((chunk) => {
      const canonical: any = state.messages[0];
      canonical.parts.push({ type: 'text', text: chunk });
      state.replaceMessage(0, canonical);
    });

    expect(state.messages[0].text).toBe('Hello, world');
  });

  it('shares no object between the live message and its baseline', () => {
    const state = new ChatState<any>(undefined, [], false);
    state.pushMessage({
      id: 'custom',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hello' }],
      metadata: { nested: { depth: 1 } },
    } as any);

    const canonical: any = state.messages[0];
    state.replaceMessage(0, {
      ...canonical,
      parts: [...canonical.parts, { type: 'text', text: ' world' }],
    });

    const live: any = state.messages[0];
    const baseline: any = state['_messageSnapshot'][0];

    // Any optimisation that reuses one clone for both arrays breaks this, and
    // the rest of the suite would not notice.
    expect(baseline).not.toBe(live);
    expect(baseline.parts).not.toBe(live.parts);
    expect(baseline.parts[0]).not.toBe(live.parts[0]);
    expect(baseline.metadata).not.toBe(live.metadata);
    expect(baseline.metadata.nested).not.toBe(live.metadata.nested);
    expect(baseline.parts[0].text).toBe(live.parts[0].text);
  });

  it('clones RegExp metadata without reading Symbol.match', () => {
    const metadata = /custom/gi;
    Object.defineProperty(metadata, Symbol.match, {
      configurable: true,
      get() {
        throw new Error('metadata must not be read while cloning');
      },
    });
    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();
    const snapshotMatcher = snapshot[0].metadata as RegExp;

    expect(snapshotMatcher).not.toBe(metadata);
    expect(
      Object.getOwnPropertyDescriptor(RegExp.prototype, 'source')?.get?.call(
        snapshotMatcher
      )
    ).toBe('custom');
    expect(
      Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags')?.get?.call(
        snapshotMatcher
      )
    ).toBe('gi');
  });

  it.each([
    ['a spoofed Date', Object.create(Date.prototype)],
    ['a proxy-wrapped Map', new Proxy(new Map(), {})],
  ])('preserves %s metadata as opaque', (_name, metadata) => {
    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata).toBe(metadata);
  });

  it('retains Date data when an own property shadows its method', () => {
    const createdAt = new Date('2026-07-24T00:00:00.000Z');
    Object.defineProperty(createdAt, 'getTime', {
      enumerable: true,
      value: 'custom date metadata',
    });

    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata: createdAt,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();
    const snapshotDate = snapshot[0].metadata as Date;

    expect(Date.prototype.getTime.call(snapshotDate)).toBe(
      Date.parse('2026-07-24T00:00:00.000Z')
    );
    expect(snapshotDate.getTime).toBe('custom date metadata');
  });

  it('retains Map data when an own property shadows its method', () => {
    const labels = new Map([['label', 'Captured label']]);
    Object.defineProperty(labels, 'forEach', {
      enumerable: true,
      value: 'custom map metadata',
    });

    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata: labels,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();
    const snapshotMap = snapshot[0].metadata as Map<string, string>;

    expect(Map.prototype.get.call(snapshotMap, 'label')).toBe('Captured label');
    expect(snapshotMap.forEach).toBe('custom map metadata');
  });

  it('retains a typed view back-reference from its buffer', () => {
    const metadata = new Uint8Array([1, 2]);
    Object.defineProperty(metadata.buffer, 'view', {
      enumerable: true,
      value: metadata,
    });

    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();
    const snapshotView = snapshot[0].metadata as Uint8Array;
    const snapshotBuffer = snapshotView.buffer as ArrayBuffer & {
      view: Uint8Array;
    };

    expect(snapshotBuffer.view).toBe(snapshotView);
    expect(Array.from(snapshotView)).toEqual([1, 2]);
  });

  it.each([
    [
      'a Uint8Array',
      () => {
        const buffer = new ArrayBuffer(1);
        const view = new Uint8Array(buffer);
        detachArrayBuffer(buffer);
        return view;
      },
    ],
    [
      'a DataView',
      () => {
        const buffer = new ArrayBuffer(1);
        const view = new DataView(buffer);
        detachArrayBuffer(buffer);
        return view;
      },
    ],
  ])('preserves %s with a detached buffer as opaque', (_name, createView) => {
    const metadata = createView();
    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Custom message' }],
        },
      ],
      persistence: false,
    });

    const snapshot = chat['~getServerMessages']();

    expect(snapshot[0].metadata).toBe(metadata);
  });

  it.each([
    ['a Uint8Array', (buffer: ArrayBuffer) => new Uint8Array(buffer)],
    ['a DataView', (buffer: ArrayBuffer) => new DataView(buffer)],
  ])(
    'preserves %s over a cross-realm buffer as opaque',
    (_name, createView) => {
      const foreignBuffer = runInNewContext(
        'new ArrayBuffer(2)'
      ) as ArrayBuffer;
      const metadata = createView(foreignBuffer);

      const chat = new Chat<any>({
        messages: [
          {
            id: 'custom',
            role: 'assistant',
            metadata,
            parts: [{ type: 'text', text: 'Custom message' }],
          },
        ],
        persistence: false,
      });

      const snapshot = chat['~getServerMessages']();

      // The backing buffer cannot be recreated in this realm, so the view has
      // to stay opaque rather than become a copy that still aliases it.
      expect(snapshot[0].metadata).toBe(metadata);
    }
  );

  it('does not make a captured revision the owner of Chat states', () => {
    const capturedRevision = getChatMessagesRevision()!;

    expect(capturedRevision.messages).toBeInstanceOf(WeakMap);
  });

  it('retains additional properties on supported metadata values', () => {
    const label = { text: 'Captured label' };
    const labelSymbol = Symbol('label');
    const metadata = new Map([['label', label]]);
    Object.defineProperty(metadata, labelSymbol, {
      configurable: false,
      enumerable: false,
      value: label,
      writable: false,
    });
    const chat = new Chat<any>({ persistence: false });
    chat.messages = [
      {
        id: 'captured',
        role: 'assistant',
        metadata,
        parts: [{ type: 'text', text: 'Captured message' }],
      },
    ];
    const capturedRevision = getChatMessagesRevision();
    retainChatMessagesRevision(capturedRevision);

    label.text = 'Live label';
    chat.messages = [
      {
        id: 'live',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Live message' }],
      },
    ];

    const snapshot = chat['~getServerMessages'](capturedRevision);
    const snapshotMetadata = snapshot[0].metadata as typeof metadata & {
      [labelSymbol]: typeof label;
    };
    const descriptor = Object.getOwnPropertyDescriptor(
      snapshotMetadata,
      labelSymbol
    );

    expect(snapshotMetadata.get('label')).toEqual({ text: 'Captured label' });
    expect(snapshotMetadata[labelSymbol]).toBe(snapshotMetadata.get('label'));
    expect(descriptor).toMatchObject({
      configurable: false,
      enumerable: false,
      writable: false,
    });

    releaseChatMessagesRevision(capturedRevision);
  });

  it('preserves opaque metadata when replacing a message', () => {
    class Metadata {
      #value: string;

      constructor(value: string) {
        this.#value = value;
      }

      get value() {
        return this.#value;
      }
    }

    const metadata = new Metadata('Custom metadata');
    const chat = new Chat<any>({
      messages: [
        {
          id: 'custom',
          role: 'assistant',
          metadata,
          parts: [{ type: 'text', text: 'Initial message' }],
        },
      ],
      persistence: false,
    });

    chat._state.replaceMessage(0, {
      ...chat.messages[0],
      parts: [{ type: 'text', text: 'Updated message' }],
    });

    expect(chat.messages[0].metadata).toBe(metadata);
    expect(chat.messages[0].metadata.value).toBe('Custom metadata');
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
