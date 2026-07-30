/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { Chat, ChatState, CACHE_KEY } from '../chat';
import {
  getChatMessagesRevision,
  releaseChatMessagesRevision,
  retainChatMessagesRevision,
  trackChatMessagesRevision,
} from '../messagesRevision';

function createMessage(id: string, text: string) {
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'text', text }],
  } as any;
}

/**
 * Runs `body` with the global `name` unbound.
 *
 * The capture helper probes for it with `typeof` on every call rather than at
 * module load, so deleting the binding is enough to reproduce a runtime that
 * never had it.
 */
function withoutGlobal<T>(name: string, body: () => T): T {
  const scope = globalThis as unknown as Record<string, unknown>;
  const runtime = scope[name];
  delete scope[name];
  try {
    return body();
  } finally {
    scope[name] = runtime;
  }
}

describe('ChatState snapshot maintenance', () => {
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

  it('appends a detached clone to the snapshot when pushing a message', () => {
    const state = new ChatState<any>(undefined, [], false);
    const message = createMessage('first', 'Hello');

    state.pushMessage(message);

    const snapshot = state['_messageSnapshot'];

    expect(state.messages[0]).toBe(message);
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]).not.toBe(message);
    expect(snapshot[0]).toEqual(message);
    expect(snapshot[0].parts[0]).not.toBe(message.parts[0]);

    message.parts[0].text = 'Live';

    expect(snapshot[0].parts[0].text).toBe('Hello');
  });

  it('replaces the snapshot array rather than mutating it when pushing', () => {
    const state = new ChatState<any>(undefined, [], false);
    state.pushMessage(createMessage('first', 'Hello'));
    const firstSnapshot = state['_messageSnapshot'];

    state.pushMessage(createMessage('second', 'World'));
    const secondSnapshot = state['_messageSnapshot'];

    // A captured revision holds the previous array, so it must not be mutated.
    expect(secondSnapshot).not.toBe(firstSnapshot);
    expect(firstSnapshot.map((message: any) => message.id)).toEqual(['first']);
    expect(secondSnapshot.map((message: any) => message.id)).toEqual([
      'first',
      'second',
    ]);
  });

  it('drops the last snapshot entry when popping a message', () => {
    const state = new ChatState<any>(undefined, [], false);
    state.pushMessage(createMessage('first', 'Hello'));
    state.pushMessage(createMessage('second', 'World'));

    state.popMessage();

    expect(state.messages.map((message: any) => message.id)).toEqual(['first']);
    expect(state['_messageSnapshot'].map((message: any) => message.id)).toEqual(
      ['first']
    );
  });

  it('swaps a single entry in both arrays when replacing a message', () => {
    const state = new ChatState<any>(undefined, [], false);
    state.pushMessage(createMessage('first', 'Hello'));
    state.pushMessage(createMessage('second', 'World'));
    state.pushMessage(createMessage('third', 'Again'));
    const neighbourSnapshot = state['_messageSnapshot'][0];
    const replacement = createMessage('second', 'Updated');

    state.replaceMessage(1, replacement);

    const live = state.messages;
    const snapshot = state['_messageSnapshot'];

    expect(live.map((message: any) => message.id)).toEqual([
      'first',
      'second',
      'third',
    ]);
    expect(snapshot.map((message: any) => message.id)).toEqual([
      'first',
      'second',
      'third',
    ]);
    // The canonical message is itself a clone, so the caller keeps no handle on
    // the value the renderer reads.
    expect(live[1]).not.toBe(replacement);
    expect(live[1].parts[0].text).toBe('Updated');
    expect(snapshot[1]).not.toBe(live[1]);
    expect(snapshot[1].parts[0].text).toBe('Updated');
    expect(snapshot[0]).toBe(neighbourSnapshot);

    live[1].parts[0].text = 'Live';

    expect(snapshot[1].parts[0].text).toBe('Updated');
  });

  it('advances the message revision on every snapshot update', () => {
    const state = new ChatState<any>(undefined, [], false);
    const initialRevision = state['_messagesRevision'];

    state.pushMessage(createMessage('first', 'Hello'));
    const pushedRevision = state['_messagesRevision'];
    state.popMessage();
    const poppedRevision = state['_messagesRevision'];

    expect(pushedRevision).toBeGreaterThan(initialRevision);
    expect(poppedRevision).toBeGreaterThan(pushedRevision);
  });

  it('keeps the seeding flag pinned to where the initial messages came from', () => {
    const agentId = 'agentID-seeding-flag';
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify([{ role: 'user', content: 'Restored message' }])
    );

    const restoredState = new ChatState<any>(agentId);
    const explicitState = new ChatState<any>(agentId, [], false);

    expect(restoredState['_messagesCanSeedServer']).toBe(false);
    expect(explicitState['_messagesCanSeedServer']).toBe(true);

    restoredState.pushMessage(createMessage('first', 'Hello'));
    explicitState.pushMessage(createMessage('first', 'Hello'));

    // An update does not change where the initial messages came from, so it
    // cannot turn seeding on for a chat restored from browser storage, nor off
    // for one the caller seeded.
    expect(restoredState['_messagesCanSeedServer']).toBe(false);
    expect(explicitState['_messagesCanSeedServer']).toBe(true);
  });

  it('registers a captured revision on retain and clears it on release', () => {
    const capturedRevision = getChatMessagesRevision()!;

    expect(capturedRevision.lifecycle).toBe('new');
    expect(capturedRevision.registration).toBeUndefined();

    retainChatMessagesRevision(capturedRevision);

    expect(capturedRevision.lifecycle).toBe('active');
    expect(capturedRevision.registration?.deref()).toBe(capturedRevision);

    releaseChatMessagesRevision(capturedRevision);

    expect(capturedRevision.lifecycle).toBe('released');
    expect(capturedRevision.registration).toBeUndefined();
  });

  it('keeps a single retain registration across repeated retains', () => {
    const capturedRevision = getChatMessagesRevision()!;
    retainChatMessagesRevision(capturedRevision);
    const registration = capturedRevision.registration;

    retainChatMessagesRevision(capturedRevision);

    expect(capturedRevision.registration).toBe(registration);

    releaseChatMessagesRevision(capturedRevision);
  });

  it('stops seeding a released revision from later updates', () => {
    const chat = new Chat<any>({ persistence: false });
    chat.messages = [{ role: 'assistant', content: 'Captured message' }];
    const releasedRevision = getChatMessagesRevision();
    const retainedRevision = getChatMessagesRevision();
    retainChatMessagesRevision(releasedRevision);
    retainChatMessagesRevision(retainedRevision);

    releaseChatMessagesRevision(releasedRevision);
    chat.messages = [{ role: 'assistant', content: 'Live message' }];
    // Retaining again rules out the released lifecycle alone explaining the
    // result: the update above must have skipped the deleted registration.
    retainChatMessagesRevision(releasedRevision);

    expect(chat['~getServerMessages'](releasedRevision)).toEqual([]);
    expect(chat['~getServerMessages'](retainedRevision)).toEqual([
      { role: 'assistant', content: 'Captured message' },
    ]);

    releaseChatMessagesRevision(releasedRevision);
    releaseChatMessagesRevision(retainedRevision);
  });
});

describe('tracked chat message revisions', () => {
  it('registers a revision once, however many renders track it', () => {
    const capturedRevision = getChatMessagesRevision()!;

    trackChatMessagesRevision(capturedRevision);
    const firstRegistration = capturedRevision.registration;
    trackChatMessagesRevision(capturedRevision);
    trackChatMessagesRevision(capturedRevision);

    // A non-hydrated render tracks on every pass, so re-entry has to be a
    // no-op rather than stacking registrations the store can never drop.
    expect(firstRegistration).toBeDefined();
    expect(capturedRevision.registration).toBe(firstRegistration);

    releaseChatMessagesRevision(capturedRevision);
  });

  it('does not re-register a revision that was already released', () => {
    const chat = new Chat<any>({ persistence: false });
    chat.messages = [createMessage('captured', 'Captured message')];
    const capturedRevision = getChatMessagesRevision()!;
    retainChatMessagesRevision(capturedRevision);
    releaseChatMessagesRevision(capturedRevision);

    trackChatMessagesRevision(capturedRevision);

    expect(capturedRevision.registration).toBeUndefined();
    // A released revision that quietly re-registered would start collecting
    // snapshots again and seed a tree nothing is rendering.
    chat.messages = [createMessage('live', 'Live message')];
    expect(chat['~getServerMessages'](capturedRevision)).toEqual([]);
  });

  it('drops registrations whose revision has been collected', () => {
    const collected = getChatMessagesRevision()!;
    trackChatMessagesRevision(collected);
    const collectedRegistration = collected.registration!;
    // Stand in for a revision the collector reclaimed after React discarded
    // the render that captured it.
    collected.registration = { deref: () => undefined };
    (collectedRegistration as { deref: () => undefined }).deref = () =>
      undefined;

    const store = (
      globalThis as unknown as Record<
        symbol,
        { active: Set<{ deref: () => unknown }> }
      >
    )[Symbol.for('InstantSearchChatMessagesSnapshotState')];
    expect(store.active.has(collectedRegistration)).toBe(true);

    // Pruning happens on the path that adds a registration, so tracking a
    // fresh revision is what clears the dead one.
    const live = getChatMessagesRevision()!;
    trackChatMessagesRevision(live);

    expect(store.active.has(collectedRegistration)).toBe(false);
    expect(store.active.has(live.registration!)).toBe(true);

    releaseChatMessagesRevision(live);
  });
});

describe('runtimes without the revision collections', () => {
  // The polyfills the React InstantSearch installation guide asks IE11 users
  // to load do not include these. Capturing runs on every `<InstantSearch>`
  // root, Chat or not, so a root on that runtime has to render without one.
  it.each(['WeakMap', 'Set'])('captures nothing without %s', (name) => {
    const capturedRevision = withoutGlobal(name, getChatMessagesRevision);

    expect(capturedRevision).toBeUndefined();
  });

  it('leaves the lifecycle helpers callable with nothing captured', () => {
    expect(() => {
      trackChatMessagesRevision(undefined);
      retainChatMessagesRevision(undefined);
      releaseChatMessagesRevision(undefined);
    }).not.toThrow();
  });

  it('reads the construction messages when nothing was captured', () => {
    const chat = new Chat<any>({ persistence: false });
    chat.messages = [createMessage('live', 'Live message')];

    expect(chat['~getServerMessages'](undefined)).toEqual([]);
  });
});
