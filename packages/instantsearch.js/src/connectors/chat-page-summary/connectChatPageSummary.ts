import { Chat, isChatBusy, openChat } from '../../lib/chat';
import { createAgentTransport } from '../../lib/chat/createAgentTransport';
import { createSendMessageWithContext } from '../../lib/chat/sendMessageWithContext';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
  safelyRunOnBrowser,
  warning,
} from '../../lib/utils';

import type { DefaultChatTransport } from '../../lib/ai-lite';
import type { ChatStatus } from '../../lib/ai-lite';
import type {
  AbstractChat,
  ChatInit as ChatInitAi,
  UIMessage,
} from '../../lib/chat';
import type { ChatContext } from '../../lib/chat/sendMessageWithContext';
import type {
  Connector,
  IndexRenderState,
  InstantSearch,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  WidgetRenderState,
} from '../../types';
import type {
  ChatRenderState,
  ChatTransport as ChatTransportOption,
} from '../chat/connectChat';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat-page-summary',
  connector: true,
});

type ChatInitWithoutTransport<TUiMessage extends UIMessage> = Omit<
  ChatInitAi<TUiMessage>,
  'transport'
>;

export type ChatPageSummaryRenderState<
  TUiMessage extends UIMessage = UIMessage
> = {
  /** The latest assistant message being streamed, or `undefined` until one arrives. */
  message?: TUiMessage;
  /** The streaming status of the underlying chat instance. */
  status: ChatStatus;
  /** The last error from the agent, if any. */
  error: Error | undefined;
  /** The prompt that drives this summary (echo of `initialUserMessage`). */
  prompt: string;
  /** Re-runs the agent request with the same prompt + context. */
  regenerate: () => void;
  /**
   * Stops the in-flight request.
   */
  stop: () => void;
  /**
   * Opens the page's main chat widget with the summary's prompt as the
   * initial message. Requires a `connectChat` widget to be mounted with
   * matching `type` (default `'chat'`). No-ops with a `__DEV__` warning when
   * the chat render-state slot is missing.
   */
  openChat: () => void;
  /**
   * Whether the handoff CTA can fire. `false` when the index chat widget is
   * mid-stream, isn't mounted, or has no `sendMessage` exposed.
   */
  canHandoff: boolean;
} & Pick<AbstractChat<TUiMessage>, 'id' | 'messages' | 'addToolResult'>;

export type ChatPageSummaryConnectorParams<
  TUiMessage extends UIMessage = UIMessage
> = (
  | { chat: Chat<TUiMessage> }
  | (ChatInitWithoutTransport<TUiMessage> & ChatTransportOption)
) & {
  /**
   * Prompt that drives the summary (e.g. "Summarize this product page").
   * Sent once when the widget mounts.
   */
  initialUserMessage: string;
  /**
   * Additional context to send alongside the prompt (e.g. current product,
   * filters, query). Serialized to JSON and prepended in a
   * `<context>…</context>` tag, mirroring `connectChat`'s `context` option.
   */
  context?: ChatContext;
  /**
   * Optional pre-seeded messages (e.g. a system-style instruction). Applied
   * only when the widget has no existing messages.
   */
  initialMessages?: TUiMessage[];
  /**
   * Render-state key of the main chat widget to hand off to with
   * `openChat()`. Mirrors `connectChat`'s `type` param.
   * @default 'chat'
   */
  chatType?: string;
  /**
   * Identifier of this connector type. Used as the render-state key.
   * @default 'chatPageSummary'
   */
  type?: string;
  /**
   * Maximum time (in ms) the SSR pipeline waits for the agent response
   * before aborting and rendering a placeholder. The client then hydrates
   * and continues the request normally.
   * @default 150
   */
  ssrTimeoutMs?: number;
};

export type ChatPageSummaryWidgetDescription<
  TUiMessage extends UIMessage = UIMessage
> = {
  $$type: 'ais.chatPageSummary';
  renderState: ChatPageSummaryRenderState<TUiMessage>;
  indexRenderState: {
    chatPageSummary: WidgetRenderState<
      ChatPageSummaryRenderState<TUiMessage>,
      ChatPageSummaryConnectorParams<TUiMessage>
    >;
  };
};

export type ChatPageSummaryConnector<
  TUiMessage extends UIMessage = UIMessage
> = Connector<
  ChatPageSummaryWidgetDescription<TUiMessage>,
  ChatPageSummaryConnectorParams<TUiMessage>
>;

type ChatInstanceWithServerWait<TUiMessage extends UIMessage> =
  Chat<TUiMessage> & {
    __chatPageSummaryServerWait?: Promise<void>;
    __chatPageSummaryRequested?: boolean;
  };

type InstantSearchWithChatStates = InstantSearch & {
  _initialChatStates: Record<string, unknown> | null;
};

function isServerRendering(): boolean {
  return safelyRunOnBrowser(() => false, { fallback: () => true });
}

// Stash chat instances per (InstantSearch, id) so that connector closures
// recreated by React (e.g. when `useStableValue` invalidates `useMemo` due to
// an inline function prop) share the same underlying `Chat`. Without this,
// each new closure constructs a fresh `Chat` whose idempotency flag is
// unset, and the initial agent request fires once per closure recreation.
// WeakMap on the InstantSearch instance means entries are reclaimed when the
// search instance itself is GC'd; no explicit cleanup is required.
const chatInstanceRegistry = new WeakMap<
  InstantSearch,
  Map<string, Chat<UIMessage>>
>();

// Client-only secondary registry keyed by chat id alone. Next.js App Router
// can produce multiple `<InstantSearch>` instances during hydration (one
// during the initial render, another after some upstream context settles).
// Each instance gets its own `WeakMap` entry above, so without this fallback
// each one would construct a fresh `Chat` and fire its own initial request.
//
// Scoped to the client bundle by the `typeof window` check so that concurrent
// SSR requests in a Node process never share Chat state across users.
const clientGlobalChatRegistry: Map<string, Chat<UIMessage>> | null =
  safelyRunOnBrowser(() => new Map<string, Chat<UIMessage>>(), {
    fallback: () => null,
  });

function getOrCreateChatInstance<TUiMessage extends UIMessage>(
  instantSearchInstance: InstantSearch,
  id: string,
  factory: () => Chat<TUiMessage>
): Chat<TUiMessage> {
  let perSearch = chatInstanceRegistry.get(instantSearchInstance);
  if (!perSearch) {
    perSearch = new Map();
    chatInstanceRegistry.set(instantSearchInstance, perSearch);
  }
  const existing = perSearch.get(id) as Chat<TUiMessage> | undefined;
  if (existing) {
    return existing;
  }
  if (clientGlobalChatRegistry) {
    const fromGlobal = clientGlobalChatRegistry.get(id) as
      | Chat<TUiMessage>
      | undefined;
    if (fromGlobal) {
      perSearch.set(id, fromGlobal as unknown as Chat<UIMessage>);
      return fromGlobal;
    }
  }
  const created = factory();
  perSearch.set(id, created as unknown as Chat<UIMessage>);
  if (clientGlobalChatRegistry) {
    clientGlobalChatRegistry.set(id, created as unknown as Chat<UIMessage>);
  }
  return created;
}

function getLastAssistantMessage<TUiMessage extends UIMessage>(
  messages: TUiMessage[]
): TUiMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      return messages[i];
    }
  }
  return undefined;
}

export default (function connectChatPageSummary<
  TWidgetParams extends UnknownWidgetParams
>(
  renderFn: Renderer<
    ChatPageSummaryRenderState,
    TWidgetParams & ChatPageSummaryConnectorParams
  >,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return <TUiMessage extends UIMessage = UIMessage>(
    widgetParams: TWidgetParams & ChatPageSummaryConnectorParams<TUiMessage>
  ) => {
    warning(
      false,
      'ChatPageSummary is not yet stable and will change in the future.'
    );

    const {
      initialUserMessage,
      initialMessages,
      context,
      chatType = 'chat',
      type = 'chatPageSummary',
      ssrTimeoutMs = 150,
      ...options
    } = widgetParams || {};

    if (!initialUserMessage) {
      throw new Error(
        withUsage('The `initialUserMessage` option is required.')
      );
    }

    let _chatInstance: ChatInstanceWithServerWait<TUiMessage>;
    let _sendMessageWithContext: typeof _chatInstance.sendMessage;
    let unsubscribeError: (() => void) | undefined;
    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeStatus: (() => void) | undefined;

    const makeChatInstance = (instantSearchInstance: InstantSearch) => {
      if ('chat' in options && options.chat) {
        return options.chat;
      }

      const transport = createAgentTransport<TUiMessage>({
        client: instantSearchInstance.client,
        agentId: 'agentId' in options ? options.agentId : undefined,
        transport: 'transport' in options ? options.transport : undefined,
        algoliaAgentSuffix: 'chat-page-summary',
      });

      if (!transport) {
        throw new Error(
          withUsage('You need to provide either an `agentId` or a `transport`.')
        );
      }

      const {
        agentId: _agentId,
        transport: _transport,
        ...chatInit
      } = options as unknown as {
        agentId?: string;
        transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
      } & ChatInitWithoutTransport<TUiMessage>;

      // Page summary is ephemeral by design: never persist messages to
      // sessionStorage. Otherwise a cached response from a previous prompt
      // would be restored on hydration and prevent the fresh request from
      // firing (the existing user message makes `shouldSendInitialRequest`
      // false).
      const resolvedId = chatInit.id ?? `instantsearch-${type}`;
      return getOrCreateChatInstance<TUiMessage>(
        instantSearchInstance,
        resolvedId,
        () =>
          new Chat<TUiMessage>({
            ...chatInit,
            id: resolvedId,
            transport,
            persist: false,
          })
      );
    };

    const runRequest = () => {
      // Defensive idempotency at the call site. The `init()` guard alone is
      // not enough: when React recreates the connector closure (e.g. unstable
      // function props invalidating `useStableValue`), each new closure's
      // `init()` runs with `isFirstInit = true` and *can* race the
      // flag-on-instance check before the shared `Chat`'s flag has settled.
      // Anchoring the guard here — directly around the only `sendMessage`
      // call site — ensures one logical agent request per chat session
      // regardless of how many init() calls fire.
      if (_chatInstance.__chatPageSummaryRequested) {
        return;
      }
      _chatInstance.__chatPageSummaryRequested = true;
      _sendMessageWithContext({ text: initialUserMessage } as Parameters<
        AbstractChat<TUiMessage>['sendMessage']
      >[0]);
    };

    const regenerate = () => {
      const status = _chatInstance.status;
      if (status === 'submitted' || status === 'streaming') {
        _chatInstance.stop();
      }
      _chatInstance.messages = [];
      _chatInstance.clearError();
      // Re-arm the runRequest gate so the user-triggered regeneration fires.
      _chatInstance.__chatPageSummaryRequested = false;
      runRequest();
    };

    const stop = () => {
      _chatInstance.stop();
    };

    return {
      $$type: 'ais.chatPageSummary',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        // `init` can be invoked more than once per widget instance during
        // React SSR: `useWidget` calls `addWidgets([widget])` during render
        // (line 95-100 in `useWidget.ts`), and a Suspense replay or a
        // second SSR pass will call it again on the same widget object.
        // `index.addWidgets` does not dedupe, so it re-runs `init`. Without
        // this guard we'd spin up a new `Chat` and fire a fresh agent
        // request on every replay.
        const isFirstInit = !_chatInstance;

        if (isFirstInit) {
          _chatInstance = makeChatInstance(
            instantSearchInstance
          ) as ChatInstanceWithServerWait<TUiMessage>;
          _sendMessageWithContext = createSendMessageWithContext(
            _chatInstance,
            context
          );
        }

        const render = () => {
          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance,
            },
            false
          );
        };

        if (isFirstInit) {
          const hasExistingMessages = _chatInstance.messages.length > 0;

          // Hydrate from the SSR snapshot if one was produced during server
          // rendering. We mark the request as already-fired so the initial
          // send below is skipped — the server already did the work and the
          // client doesn't need to refire it.
          const ssrSnapshots = (
            instantSearchInstance as InstantSearchWithChatStates
          )._initialChatStates;
          const ssrSnapshot =
            ssrSnapshots && ssrSnapshots[_chatInstance.id]
              ? (ssrSnapshots[_chatInstance.id] as TUiMessage[])
              : undefined;
          if (ssrSnapshot && ssrSnapshot.length && !hasExistingMessages) {
            _chatInstance.messages = ssrSnapshot;
            _chatInstance.__chatPageSummaryRequested = true;
          } else if (initialMessages?.length && !hasExistingMessages) {
            _chatInstance.messages = initialMessages;
          }

          unsubscribeError = _chatInstance['~registerErrorCallback'](render);
          unsubscribeMessages =
            _chatInstance['~registerMessagesCallback'](render);
          unsubscribeStatus = _chatInstance['~registerStatusCallback'](render);
        }

        // Only the first init per closure attempts a send. `runRequest`
        // itself enforces idempotency across the shared chat instance, so
        // any extra init() calls (two-pass SSR, closure recreations) are
        // safe — they no-op inside runRequest if the flag is already set.
        if (isFirstInit) {
          runRequest();
        }

        // On the server, race the in-flight request against `ssrTimeoutMs`.
        // If the timeout wins, stop the chat (which aborts the underlying
        // fetch) and resolve so the SSR pipeline can finish.
        // The promise is stored on the chat instance so two-pass SSR renders
        // reuse the same in-flight request rather than refiring.
        if (isServerRendering()) {
          if (!_chatInstance.__chatPageSummaryServerWait) {
            const startedAt = Date.now();
            // eslint-disable-next-line no-console
            console.log(
              `[chat-page-summary][SSR] wait started (timeout=${ssrTimeoutMs}ms)`
            );
            _chatInstance.__chatPageSummaryServerWait = new Promise<void>(
              (resolve) => {
                // Don't treat the synchronous status === 'ready' as settled:
                // sendMessage's status transition is async (a microtask), so
                // immediately after `runRequest()` the status is still
                // 'ready' even though the request will start. We rely on the
                // timeout firing (which calls `stop()`) or the status
                // transitioning to a terminal state.
                const timer = setTimeout(() => {
                  const elapsed = Date.now() - startedAt;
                  // Unsubscribe BEFORE calling stop(): `stop()` synchronously
                  // sets `status = 'ready'` and synchronously invokes the
                  // status callbacks, which would otherwise log TERMINAL and
                  // call resolve() a second time inside this handler.
                  unsubscribe();
                  if (
                    _chatInstance.status === 'submitted' ||
                    _chatInstance.status === 'streaming'
                  ) {
                    _chatInstance.stop();
                  }
                  // eslint-disable-next-line no-console
                  console.log(
                    `[chat-page-summary][SSR] wait resolved via TIMEOUT in ${elapsed}ms (status=${_chatInstance.status})`
                  );
                  resolve();
                }, ssrTimeoutMs);
                const unsubscribe = _chatInstance['~registerStatusCallback'](
                  () => {
                    if (
                      _chatInstance.status === 'error' ||
                      _chatInstance.status === 'ready'
                    ) {
                      // Only count 'ready' as terminal once a request has
                      // actually run — i.e., we've seen a non-ready status.
                      if (!hasLeftReadyState) return;
                      clearTimeout(timer);
                      unsubscribe();
                      // Snapshot messages into the InstantSearch instance so
                      // they ride through the SSR boundary alongside
                      // `_initialResults`. Only snapshot on success — on error
                      // we want the client to retry rather than hydrate into
                      // a broken state.
                      if (_chatInstance.status === 'ready') {
                        const target =
                          instantSearchInstance as InstantSearchWithChatStates;
                        if (!target._initialChatStates) {
                          target._initialChatStates = {};
                        }
                        target._initialChatStates[_chatInstance.id] =
                          _chatInstance.messages;
                      }
                      const elapsed = Date.now() - startedAt;
                      // eslint-disable-next-line no-console
                      console.log(
                        `[chat-page-summary][SSR] wait resolved via TERMINAL status=${_chatInstance.status} in ${elapsed}ms`
                      );
                      resolve();
                    } else {
                      hasLeftReadyState = true;
                    }
                  }
                );
                let hasLeftReadyState = false;
              }
            );
          }
          instantSearchInstance.registerServerWait(
            _chatInstance.__chatPageSummaryServerWait
          );
        }

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(
        renderState,
        renderOptions
      ): IndexRenderState &
        ChatPageSummaryWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          [type as 'chatPageSummary']:
            this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState(renderOptions) {
        const { instantSearchInstance, parent } = renderOptions;
        if (!_chatInstance) {
          this.init!({ ...renderOptions, uiState: {}, results: undefined });
        }

        const indexId = parent.getIndexId();
        const readIndexChatRenderState = ():
          | Partial<ChatRenderState>
          | undefined =>
          instantSearchInstance.renderState[indexId]
            ? (instantSearchInstance.renderState[indexId][
                chatType as 'chat'
              ] as Partial<ChatRenderState> | undefined)
            : undefined;
        const indexChatRenderState = readIndexChatRenderState();

        // Read lazily at click time. The chat-page-summary widget's
        // `getWidgetRenderState` may run before the main chat widget has
        // populated `renderState[indexId][chatType]` (e.g. on SSR-hydrated
        // first render, when no chat streaming event later triggers a
        // re-render). Looking up `setOpen`/`sendMessage` at click time
        // guarantees we see them once both widgets have mounted.
        const handoff = () => {
          const currentChatRenderState = readIndexChatRenderState();
          if (!currentChatRenderState) {
            if (__DEV__) {
              warning(
                false,
                `No chat widget found in render state for type "${chatType}". Make sure a \`connectChat\` widget with matching \`type\` is mounted on the same index.`
              );
            }
            return;
          }
          openChat(currentChatRenderState, {
            message: initialUserMessage,
            referer: 'page-summary',
          });
        };

        // Optimistic when the main chat widget hasn't been observed yet —
        // by click time it should be mounted, and `handoff()` reads fresh
        // state then. We only flip to `false` when we can see the chat and
        // know it's busy.
        const canHandoff = indexChatRenderState
          ? Boolean(indexChatRenderState.sendMessage) &&
            !isChatBusy(indexChatRenderState)
          : true;

        return {
          message: getLastAssistantMessage(_chatInstance.messages),
          messages: _chatInstance.messages,
          id: _chatInstance.id,
          status: _chatInstance.status,
          error: _chatInstance.error,
          prompt: initialUserMessage,
          regenerate,
          stop,
          openChat: handoff,
          canHandoff,
          addToolResult: _chatInstance.addToolResult,
          widgetParams,
        };
      },

      dispose() {
        // Unsubscribe THIS closure's render callbacks from the (potentially
        // shared) chat instance. We deliberately do NOT call
        // `_chatInstance.stop()` here: when React recreates the connector
        // closure (e.g. unstable function props invalidating `useStableValue`),
        // the prior closure is disposed but the new closure is mounted on the
        // same chat instance. Stopping would abort the request the new closure
        // is observing. Real teardown happens when `<InstantSearch>` itself
        // unmounts and the registry's WeakMap entry is reclaimed.
        unsubscribeError?.();
        unsubscribeMessages?.();
        unsubscribeStatus?.();
        unsubscribeError = undefined;
        unsubscribeMessages = undefined;
        unsubscribeStatus = undefined;
        unmountFn();
      },

      shouldRender() {
        return true;
      },

      get chatInstance() {
        return _chatInstance;
      },
    };
  };
} satisfies ChatPageSummaryConnector);

// Re-export so consumers can build typed wrappers without reaching into
// `lib/chat`.
export type { ChatContext } from '../../lib/chat/sendMessageWithContext';
