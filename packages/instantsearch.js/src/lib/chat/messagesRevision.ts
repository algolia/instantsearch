import type { UIMessage } from '../ai-lite';

// `Symbol.for` keeps the store shared between two copies of this module in one
// realm; where `Symbol` is absent, a string property on the same object is
// looked up the same way. The module has to load either way, because every
// `<InstantSearch>` render reaches it whether or not the tree holds a Chat.
const ChatMessagesSnapshotState = (
  typeof Symbol === 'function' && typeof Symbol.for === 'function'
    ? Symbol.for('InstantSearchChatMessagesSnapshotState')
    : 'InstantSearchChatMessagesSnapshotState'
) as symbol;

type ChatMessagesRevisionRegistration = {
  deref: () => ChatMessagesRevision | undefined;
};

/** @internal */
export type ChatMessagesRevision = {
  revision: number;
  lifecycle: 'new' | 'active' | 'released';
  messages: WeakMap<object, UIMessage[]>;
  registration?: ChatMessagesRevisionRegistration;
};

type ChatMessagesSnapshotStore = {
  revision: number;
  active: Set<ChatMessagesRevisionRegistration>;
};

type WeakRefConstructor = new <T extends object>(target: T) => {
  deref: () => T | undefined;
};

type ChatMessagesGlobalScope = Record<
  symbol,
  ChatMessagesSnapshotStore | undefined
> & { WeakRef?: WeakRefConstructor };

// A realm exposing no global object of its own gets a store nothing else can
// reach, which is correct: there is nothing to share it with.
const detachedGlobalScope = {} as ChatMessagesGlobalScope;

// The build targets `ie >= 11` and injects no polyfills, so an ES2020 global
// has to be probed with `typeof` rather than read: a bare reference to a
// missing binding throws. Where one of the three names below is bound the
// store lands on the realm global, shared with anything reading the same key.
function getGlobalScope(): ChatMessagesGlobalScope {
  if (typeof globalThis !== 'undefined') {
    return globalThis as unknown as ChatMessagesGlobalScope;
  }
  if (typeof self !== 'undefined') {
    return self as unknown as ChatMessagesGlobalScope;
  }
  if (typeof global !== 'undefined') {
    return global as unknown as ChatMessagesGlobalScope;
  }
  return detachedGlobalScope;
}

/** @internal */
export function getChatMessagesSnapshotStore(): ChatMessagesSnapshotStore {
  const globalSnapshots = getGlobalScope();
  const existingStore = globalSnapshots[ChatMessagesSnapshotState];
  if (existingStore) {
    return existingStore;
  }
  const snapshotStore = {
    revision: 0,
    active: new Set<ChatMessagesRevisionRegistration>(),
  };
  globalSnapshots[ChatMessagesSnapshotState] = snapshotStore;
  return snapshotStore;
}

/** @internal */
export function nextChatMessagesRevision(): number {
  const snapshotStore = getChatMessagesSnapshotStore();
  snapshotStore.revision += 1;
  return snapshotStore.revision;
}

/**
 * Captures the revision a hydrating consumer renders against, or `undefined`
 * where the runtime cannot support one.
 *
 * The polyfills the React InstantSearch installation guide asks IE11 users to
 * load do not include either collection below, and capturing runs on every
 * `<InstantSearch>` root, Chat or not. So it degrades on those runtimes rather
 * than taking the root down: consumers get the message baseline they had
 * before revisions existed.
 *
 * @internal
 */
export function getChatMessagesRevision(): ChatMessagesRevision | undefined {
  if (typeof Set !== 'function' || typeof WeakMap !== 'function') {
    return undefined;
  }

  return {
    revision: getChatMessagesSnapshotStore().revision,
    lifecycle: 'new',
    messages: new WeakMap(),
  };
}

/** @internal */
export function trackChatMessagesRevision(
  capturedRevision?: ChatMessagesRevision
): void {
  if (
    !capturedRevision ||
    capturedRevision.lifecycle === 'released' ||
    capturedRevision.registration
  ) {
    return;
  }

  const WeakRefRuntime = getGlobalScope().WeakRef;
  if (!WeakRefRuntime) {
    return;
  }

  // Only this path adds weak registrations, so pruning here bounds the set at
  // the same high-water mark as pruning on every call, without walking it on
  // renders that register nothing.
  const snapshotStore = getChatMessagesSnapshotStore();
  snapshotStore.active.forEach((registration) => {
    if (registration.deref() === undefined) {
      snapshotStore.active.delete(registration);
    }
  });

  // Server and abandoned concurrent renders have no effect cleanup. A weak
  // registration lets updates retain their snapshot without retaining the
  // render itself after React releases it.
  const registration = new WeakRefRuntime(capturedRevision);
  capturedRevision.registration = registration;
  snapshotStore.active.add(registration);
}

/** @internal */
export function retainChatMessagesRevision(
  capturedRevision?: ChatMessagesRevision
): void {
  if (!capturedRevision) {
    return;
  }

  capturedRevision.lifecycle = 'active';
  if (!capturedRevision.registration) {
    const registration = {
      deref: () => capturedRevision,
    };
    capturedRevision.registration = registration;
    getChatMessagesSnapshotStore().active.add(registration);
  }
}

/** @internal */
export function releaseChatMessagesRevision(
  capturedRevision?: ChatMessagesRevision
): void {
  if (!capturedRevision) {
    return;
  }

  if (capturedRevision.registration) {
    getChatMessagesSnapshotStore().active.delete(capturedRevision.registration);
    capturedRevision.registration = undefined;
  }
  capturedRevision.lifecycle = 'released';
}
