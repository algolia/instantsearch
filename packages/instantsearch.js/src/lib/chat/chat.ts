import { AbstractChat } from '../ai-lite';

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

const ChatMessagesSnapshotState = Symbol.for(
  'InstantSearchChatMessagesSnapshotState'
);
type ChatMessagesRevisionRegistration = {
  deref: () => ChatMessagesRevision | undefined;
};
type ChatMessagesRevision = {
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
type TypedArrayConstructor = new (
  buffer: ArrayBufferLike,
  byteOffset: number,
  length: number
) => ArrayBufferView;
const typedArrayConstructors = new Map<object, TypedArrayConstructor>([
  [Int8Array.prototype, Int8Array],
  [Uint8Array.prototype, Uint8Array],
  [Uint8ClampedArray.prototype, Uint8ClampedArray],
  [Int16Array.prototype, Int16Array],
  [Uint16Array.prototype, Uint16Array],
  [Int32Array.prototype, Int32Array],
  [Uint32Array.prototype, Uint32Array],
  [Float32Array.prototype, Float32Array],
  [Float64Array.prototype, Float64Array],
]);
if (typeof BigInt64Array !== 'undefined') {
  typedArrayConstructors.set(
    BigInt64Array.prototype,
    BigInt64Array as TypedArrayConstructor
  );
}
if (typeof BigUint64Array !== 'undefined') {
  typedArrayConstructors.set(
    BigUint64Array.prototype,
    BigUint64Array as TypedArrayConstructor
  );
}
const typedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);

function getIntrinsicAccessorValue<T>(
  prototype: object,
  key: PropertyKey,
  value: object
): T {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
  if (!descriptor?.get) {
    throw new TypeError(`Missing intrinsic accessor ${String(key)}`);
  }
  return descriptor.get.call(value) as T;
}

function isTypeError(error: unknown): boolean {
  try {
    return (
      error instanceof TypeError ||
      (Object.prototype.toString.call(error) === '[object Error]' &&
        (error as { name?: unknown }).name === 'TypeError')
    );
  } catch {
    return false;
  }
}

function tryClone<T>(createClone: () => T): T | undefined {
  try {
    return createClone();
  } catch (error) {
    if (isTypeError(error)) {
      return undefined;
    }
    throw error;
  }
}

function tryInspect<T>(inspect: () => T): T | undefined {
  try {
    return inspect();
  } catch {
    // Inspecting a value is not the same as cloning it: a hostile proxy trap
    // can throw anything at all. A value we cannot inspect is one we cannot
    // copy faithfully, so the caller keeps it opaque instead of failing.
    return undefined;
  }
}

function hasNativeBrand(check: () => unknown): boolean {
  try {
    check();
    return true;
  } catch (error) {
    if (isTypeError(error)) {
      return false;
    }
    throw error;
  }
}

function getRegExpFlags(value: RegExp): string {
  const hasFlag = (key: PropertyKey): boolean => {
    const descriptor = Object.getOwnPropertyDescriptor(RegExp.prototype, key);
    return descriptor?.get?.call(value) === true;
  };

  return [
    hasFlag('hasIndices') ? 'd' : '',
    hasFlag('global') ? 'g' : '',
    hasFlag('ignoreCase') ? 'i' : '',
    hasFlag('multiline') ? 'm' : '',
    hasFlag('dotAll') ? 's' : '',
    hasFlag('unicode') ? 'u' : '',
    hasFlag('unicodeSets') ? 'v' : '',
    hasFlag('sticky') ? 'y' : '',
  ].join('');
}

function cloneArrayBufferContents(value: ArrayBufferLike): ArrayBufferLike {
  const prototype = tryInspect(() => Object.getPrototypeOf(value));

  if (prototype === ArrayBuffer.prototype) {
    const clone = new ArrayBuffer(
      getIntrinsicAccessorValue<number>(
        ArrayBuffer.prototype,
        'byteLength',
        value
      )
    );
    Uint8Array.prototype.set.call(new Uint8Array(clone), new Uint8Array(value));
    return clone;
  }

  if (
    typeof SharedArrayBuffer !== 'undefined' &&
    prototype === SharedArrayBuffer.prototype
  ) {
    const clone = new SharedArrayBuffer(
      getIntrinsicAccessorValue<number>(
        SharedArrayBuffer.prototype,
        'byteLength',
        value
      )
    );
    Uint8Array.prototype.set.call(new Uint8Array(clone), new Uint8Array(value));
    return clone;
  }

  return value;
}

function getChatMessagesSnapshotStore(): ChatMessagesSnapshotStore {
  const globalSnapshots = globalThis as unknown as Record<
    symbol,
    ChatMessagesSnapshotStore | undefined
  >;
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

function readOwnEntries(
  source: object
): Array<{ key: string | symbol; descriptor: PropertyDescriptor }> {
  return Reflect.ownKeys(source).reduce<
    Array<{ key: string | symbol; descriptor: PropertyDescriptor }>
  >((entries, key) => {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor) {
      entries.push({ key, descriptor });
    }
    return entries;
  }, []);
}

function cloneAdditionalProperties(
  source: object,
  target: object,
  seen: WeakMap<object, unknown>
): void {
  const intrinsicKeys = new Set(Reflect.ownKeys(target));
  const entries = tryInspect(() => readOwnEntries(source));
  if (!entries) {
    return;
  }

  entries.forEach(({ key, descriptor }) => {
    if (intrinsicKeys.has(key)) {
      return;
    }
    if ('value' in descriptor) {
      descriptor.value = cloneMessageValue(descriptor.value, seen);
    }
    tryInspect(() => Object.defineProperty(target, key, descriptor));
  });
}

function cloneMessageValue<T>(
  value: T,
  seen = new WeakMap<object, unknown>()
): T {
  if (
    value === null ||
    (typeof value !== 'object' && typeof value !== 'function')
  ) {
    return value;
  }

  const source = value as object;
  const existing = seen.get(source);
  if (existing !== undefined) {
    return existing as T;
  }
  const prototype = tryInspect(() => Object.getPrototypeOf(value));
  if (prototype === undefined) {
    return value;
  }

  if (prototype === Date.prototype) {
    const clone = tryClone(() => new Date(Date.prototype.getTime.call(value)));
    if (!clone) {
      return value;
    }
    Object.setPrototypeOf(clone, prototype);
    seen.set(source, clone);
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (prototype === RegExp.prototype) {
    const clone = tryClone(() => {
      return Reflect.construct(RegExp, [
        getIntrinsicAccessorValue<string>(RegExp.prototype, 'source', value),
        getRegExpFlags(value as unknown as RegExp),
      ]);
    });
    if (!clone) {
      return value;
    }
    Object.setPrototypeOf(clone, prototype);
    seen.set(source, clone);
    const lastIndexDescriptor = Object.getOwnPropertyDescriptor(
      value,
      'lastIndex'
    );
    if (lastIndexDescriptor && 'value' in lastIndexDescriptor) {
      lastIndexDescriptor.value = cloneMessageValue(
        lastIndexDescriptor.value,
        seen
      );
      Object.defineProperty(clone, 'lastIndex', lastIndexDescriptor);
    }
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (prototype === Map.prototype) {
    if (!hasNativeBrand(() => Map.prototype.has.call(value, undefined))) {
      return value;
    }
    const clone = new Map();
    Object.setPrototypeOf(clone, prototype);
    seen.set(source, clone);
    Map.prototype.forEach.call(value, (mapValue: unknown, mapKey: unknown) => {
      Map.prototype.set.call(
        clone,
        cloneMessageValue(mapKey, seen),
        cloneMessageValue(mapValue, seen)
      );
    });
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (prototype === Set.prototype) {
    if (!hasNativeBrand(() => Set.prototype.has.call(value, undefined))) {
      return value;
    }
    const clone = new Set();
    Object.setPrototypeOf(clone, prototype);
    seen.set(source, clone);
    Set.prototype.forEach.call(value, (setValue: unknown) => {
      Set.prototype.add.call(clone, cloneMessageValue(setValue, seen));
    });
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (prototype === ArrayBuffer.prototype) {
    const clone = tryClone(() =>
      cloneArrayBufferContents(value as unknown as ArrayBufferLike)
    );
    if (!clone) {
      return value;
    }
    seen.set(source, clone);
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (
    typeof SharedArrayBuffer !== 'undefined' &&
    prototype === SharedArrayBuffer.prototype
  ) {
    const clone = tryClone(() =>
      cloneArrayBufferContents(value as unknown as ArrayBufferLike)
    );
    if (!clone) {
      return value;
    }
    seen.set(source, clone);
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (
    ArrayBuffer.isView(value) &&
    (prototype === DataView.prototype || typedArrayConstructors.has(prototype))
  ) {
    const isDataView = prototype === DataView.prototype;
    const accessorPrototype = isDataView
      ? DataView.prototype
      : typedArrayPrototype;
    const clonedView = tryClone(() => {
      const sourceBuffer = getIntrinsicAccessorValue<ArrayBufferLike>(
        accessorPrototype,
        'buffer',
        value
      );
      const existingBuffer = seen.get(sourceBuffer) as
        | ArrayBufferLike
        | undefined;
      const clonedBuffer =
        existingBuffer ?? cloneArrayBufferContents(sourceBuffer);
      if (clonedBuffer === sourceBuffer) {
        // `cloneArrayBufferContents` returns its input for a buffer it cannot
        // copy, such as one belonging to another realm. Building a view over
        // it would still alias the source bytes, so keep the value opaque.
        return undefined;
      }
      const byteOffset = getIntrinsicAccessorValue<number>(
        accessorPrototype,
        'byteOffset',
        value
      );
      const clone = isDataView
        ? new DataView(
            clonedBuffer,
            byteOffset,
            getIntrinsicAccessorValue<number>(
              DataView.prototype,
              'byteLength',
              value
            )
          )
        : new (typedArrayConstructors.get(prototype)!)(
            clonedBuffer,
            byteOffset,
            getIntrinsicAccessorValue<number>(
              typedArrayPrototype,
              'length',
              value
            )
          );

      return {
        clone,
        clonedBuffer,
        shouldCloneBufferProperties: existingBuffer === undefined,
        sourceBuffer,
      };
    });
    if (!clonedView) {
      return value;
    }

    const { clone, clonedBuffer, shouldCloneBufferProperties, sourceBuffer } =
      clonedView;
    if (shouldCloneBufferProperties) {
      seen.set(sourceBuffer, clonedBuffer);
    }
    seen.set(source, clone);
    if (shouldCloneBufferProperties) {
      cloneAdditionalProperties(sourceBuffer, clonedBuffer, seen);
    }
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (typeof URL !== 'undefined' && prototype === URL.prototype) {
    const clone = tryClone(
      () =>
        new URL(getIntrinsicAccessorValue<string>(URL.prototype, 'href', value))
    );
    if (!clone) {
      return value;
    }
    seen.set(source, clone);
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (
    typeof URLSearchParams !== 'undefined' &&
    prototype === URLSearchParams.prototype
  ) {
    if (
      !hasNativeBrand(() =>
        URLSearchParams.prototype.has.call(value, '__instantsearch__')
      )
    ) {
      return value;
    }
    const clone = new URLSearchParams();
    seen.set(source, clone);
    URLSearchParams.prototype.forEach.call(
      value,
      (parameterValue: string, parameterKey: string) => {
        URLSearchParams.prototype.append.call(
          clone,
          parameterKey,
          parameterValue
        );
      }
    );
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (typeof File !== 'undefined' && prototype === File.prototype) {
    const clone = tryClone(
      () =>
        new File(
          [value as unknown as BlobPart],
          getIntrinsicAccessorValue<string>(File.prototype, 'name', value),
          {
            lastModified: getIntrinsicAccessorValue<number>(
              File.prototype,
              'lastModified',
              value
            ),
            type: getIntrinsicAccessorValue<string>(
              Blob.prototype,
              'type',
              value
            ),
          }
        )
    );
    if (!clone) {
      return value;
    }
    seen.set(source, clone);
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (typeof Blob !== 'undefined' && prototype === Blob.prototype) {
    const clone = tryClone(
      () =>
        new Blob([value as unknown as BlobPart], {
          type: getIntrinsicAccessorValue<string>(
            Blob.prototype,
            'type',
            value
          ),
        })
    );
    if (!clone) {
      return value;
    }
    seen.set(source, clone);
    cloneAdditionalProperties(source, clone, seen);
    return clone as T;
  }

  if (
    prototype === WeakMap.prototype ||
    prototype === WeakSet.prototype ||
    prototype === Promise.prototype
  ) {
    return value;
  }

  if (
    typeof value === 'function' ||
    (Array.isArray(value)
      ? prototype !== Array.prototype
      : prototype !== Object.prototype && prototype !== null)
  ) {
    // Custom instances can carry private fields or internal slots that
    // property descriptors cannot recreate.
    //
    // Values from another realm land here too, because every branch above
    // brand checks against this realm's intrinsics. That is deliberate: the
    // snapshot preserves them by reference rather than guessing at a copy, so
    // a caller that hands Chat a cross-realm value must keep it stable across
    // server rendering and hydration, exactly as for the opaque values above.
    return value;
  }

  // Read the shape before allocating anything, so a proxy trap that throws
  // leaves the value opaque instead of registering a half-built clone.
  const entries = tryInspect(() => readOwnEntries(value));
  if (!entries) {
    return value;
  }

  const clone: object = Array.isArray(value) ? [] : Object.create(prototype);
  seen.set(source, clone);

  entries.forEach(({ key, descriptor }) => {
    if ('value' in descriptor) {
      descriptor.value = cloneMessageValue(descriptor.value, seen);
      if (
        descriptor.writable === true &&
        descriptor.enumerable === true &&
        descriptor.configurable === true &&
        !(key in clone)
      ) {
        // A plain assignment produces exactly this descriptor for a fraction
        // of `defineProperty`'s cost, and streaming re-clones every message on
        // every chunk. The `in` probe keeps `__proto__`, array `length` and
        // anything the prototype chain claims on the descriptor path, where an
        // inherited accessor cannot intercept the write.
        try {
          (clone as Record<PropertyKey, unknown>)[key] = descriptor.value;
          return;
        } catch {
          // A forged shape can still refuse the write. Fall through and let
          // the descriptor path decide, which drops the property as before.
        }
      }
    }
    // Accessors are copied as accessors. A getter that derives from `this`
    // therefore reads the clone's own data and stays detached, but one that
    // closes over the caller's state keeps returning the live value. Invoking
    // getters here instead would freeze `this`-derived values on the streamed
    // message and run caller code during what is only an inspection.
    //
    // A forged descriptor can make a single write fail. Dropping that property
    // keeps the rest of the clone detached, where bailing out would hand back
    // the live object and let later mutations reach the server baseline.
    tryInspect(() => Object.defineProperty(clone, key, descriptor));
  });

  return clone as T;
}

function getCurrentChatMessagesRevision(): number {
  return getChatMessagesSnapshotStore().revision;
}

function nextChatMessagesRevision(): number {
  const snapshotStore = getChatMessagesSnapshotStore();
  snapshotStore.revision += 1;
  return snapshotStore.revision;
}

/** @internal */
export function getChatMessagesRevision(): ChatMessagesRevision {
  return {
    revision: getCurrentChatMessagesRevision(),
    lifecycle: 'new',
    messages: new WeakMap(),
  };
}

/** @internal */
export function trackChatMessagesRevision(
  capturedRevision: ChatMessagesRevision
): void {
  const snapshotStore = getChatMessagesSnapshotStore();
  snapshotStore.active.forEach((registration) => {
    if (registration.deref() === undefined) {
      snapshotStore.active.delete(registration);
    }
  });

  if (
    capturedRevision.lifecycle === 'released' ||
    capturedRevision.registration
  ) {
    return;
  }

  const WeakRefRuntime = (
    globalThis as unknown as {
      WeakRef?: WeakRefConstructor;
    }
  ).WeakRef;
  if (!WeakRefRuntime) {
    return;
  }

  // Server and abandoned concurrent renders have no effect cleanup. A weak
  // registration lets updates retain their snapshot without retaining the
  // render itself after React releases it.
  const registration = new WeakRefRuntime(capturedRevision);
  capturedRevision.registration = registration;
  snapshotStore.active.add(registration);
}

/** @internal */
export function retainChatMessagesRevision(
  capturedRevision: ChatMessagesRevision
): void {
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
  capturedRevision: ChatMessagesRevision
): void {
  if (capturedRevision.registration) {
    getChatMessagesSnapshotStore().active.delete(capturedRevision.registration);
    capturedRevision.registration = undefined;
  }
  capturedRevision.lifecycle = 'released';
}

function getDefaultInitialMessages<TUIMessage extends UIMessage>(
  id?: string
): TUIMessage[] {
  try {
    const initialMessages = sessionStorage.getItem(
      CACHE_KEY + (id ? `-${id}` : '')
    );
    return initialMessages ? JSON.parse(initialMessages) : [];
  } catch {
    return [];
  }
}

export class ChatState<TUiMessage extends UIMessage>
  implements BaseChatState<TUiMessage>
{
  _messages: TUiMessage[];
  /** @internal */
  _serverMessages: TUiMessage[];
  /** @internal */
  _messageSnapshot: TUiMessage[];
  /** @internal */
  _messagesRevision: number;
  /** @internal */
  _messagesCanSeedServer: boolean;
  _status: ChatStatus = 'ready';
  _error: Error | undefined = undefined;

  _messagesCallbacks = new Set<() => void>();
  _statusCallbacks = new Set<() => void>();
  _errorCallbacks = new Set<() => void>();

  constructor(
    id: string | undefined = undefined,
    initialMessages: TUiMessage[] | undefined = undefined,
    persistence = true
  ) {
    if (initialMessages !== undefined) {
      this._messages = initialMessages;
      this._messageSnapshot = cloneMessageValue(initialMessages);
      this._serverMessages = this._messageSnapshot;
      this._messagesCanSeedServer = true;
    } else if (persistence) {
      this._messages = getDefaultInitialMessages<TUiMessage>(id);
      this._messageSnapshot = cloneMessageValue(this._messages);
      this._serverMessages = [];
      this._messagesCanSeedServer = false;
    } else {
      this._messages = [];
      this._messageSnapshot = [];
      this._serverMessages = this._messageSnapshot;
      this._messagesCanSeedServer = true;
    }
    this._messagesRevision = nextChatMessagesRevision();

    if (!persistence) {
      return;
    }

    const saveMessagesInLocalStorage = () => {
      if (this.status === 'ready') {
        try {
          sessionStorage.setItem(
            CACHE_KEY + (id ? `-${id}` : ''),
            JSON.stringify(this.messages)
          );
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
    const messages = [...newMessages];
    this._setMessages(messages, cloneMessageValue(messages));
  }

  pushMessage = (message: TUiMessage) => {
    this._setMessages(
      this._messages.concat(message),
      this._messageSnapshot.concat(cloneMessageValue(message))
    );
  };

  popMessage = () => {
    this._setMessages(
      this._messages.slice(0, -1),
      this._messageSnapshot.slice(0, -1)
    );
  };

  replaceMessage = (index: number, message: TUiMessage) => {
    const liveMessage = this.snapshot(message);
    this._setMessages(
      [
        ...this._messages.slice(0, index),
        // We deep clone the message here to ensure the new React Compiler
        // (currently in RC) detects deeply nested parts/metadata changes.
        // Values the clone has to keep by reference, such as class instances,
        // keep their identity, so mutating one in place stays invisible.
        liveMessage,
        ...this._messages.slice(index + 1),
      ],
      [
        ...this._messageSnapshot.slice(0, index),
        cloneMessageValue(liveMessage),
        ...this._messageSnapshot.slice(index + 1),
      ]
    );
  };

  snapshot = <T>(thing: T): T => {
    return cloneMessageValue(thing);
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

  /** @internal */
  '~getServerMessages' = (
    capturedRevision?: ChatMessagesRevision
  ): TUiMessage[] => {
    if (
      capturedRevision !== undefined &&
      capturedRevision.lifecycle !== 'released' &&
      this._messagesCanSeedServer &&
      this._messagesRevision <= capturedRevision.revision
    ) {
      return this._messageSnapshot;
    }

    if (
      capturedRevision !== undefined &&
      capturedRevision.lifecycle !== 'released' &&
      this._messagesCanSeedServer
    ) {
      const matchingMessages = capturedRevision.messages.get(this);
      if (matchingMessages) {
        return matchingMessages as TUiMessage[];
      }
    }

    return this._serverMessages;
  };

  /** @internal */
  _setMessages = (messages: TUiMessage[], messageSnapshot: TUiMessage[]) => {
    if (this._messagesCanSeedServer) {
      const snapshotStore = getChatMessagesSnapshotStore();
      snapshotStore.active.forEach((registration) => {
        const capturedRevision = registration.deref();
        if (!capturedRevision) {
          snapshotStore.active.delete(registration);
          return;
        }
        if (
          this._messagesRevision <= capturedRevision.revision &&
          !capturedRevision.messages.has(this)
        ) {
          capturedRevision.messages.set(this, this._messageSnapshot);
        }
      });
    }
    this._messages = messages;
    this._messageSnapshot = messageSnapshot;
    this._messagesRevision = nextChatMessagesRevision();
    this._messagesCanSeedServer = true;
    this._callMessagesCallbacks();
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
    persistence = true,
    ...init
  }: ChatInit<TUiMessage>) {
    const state = new ChatState(agentId, messages, persistence);
    super({ ...init, state });
    this._state = state;
  }

  '~registerMessagesCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerMessagesCallback'](onChange);

  '~registerStatusCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerStatusCallback'](onChange);

  '~registerErrorCallback' = (onChange: () => void): (() => void) =>
    this._state['~registerErrorCallback'](onChange);

  /** @internal */
  '~getServerMessages' = (
    capturedRevision?: ChatMessagesRevision
  ): TUiMessage[] => this._state['~getServerMessages'](capturedRevision);
}
