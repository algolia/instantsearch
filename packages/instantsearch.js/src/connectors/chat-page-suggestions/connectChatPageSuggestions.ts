import { DefaultChatTransport } from '../../lib/ai-lite';
import { Chat, isChatBusy, openChat } from '../../lib/chat';
import { createAgentTransport } from '../../lib/chat/createAgentTransport';
import { createSendMessageWithContext } from '../../lib/chat/sendMessageWithContext';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
  warning,
} from '../../lib/utils';

import type {
  ChatRenderState,
  ChatTransport as ChatTransportOption,
} from '../chat/connectChat';
import type { ChatContext } from '../../lib/chat/sendMessageWithContext';
import type { ChatStatus } from '../../lib/ai-lite';
import type {
  AbstractChat,
  ChatInit as ChatInitAi,
  UIMessage,
} from '../../lib/chat';
import type {
  Connector,
  IndexRenderState,
  InstantSearch,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat-page-suggestions',
  connector: true,
});

type ChatInitWithoutTransport<TUiMessage extends UIMessage> = Omit<
  ChatInitAi<TUiMessage>,
  'transport'
>;

export type ChatPageSuggestionsRenderState<
  TUiMessage extends UIMessage = UIMessage
> = {
  /** The latest assistant message being streamed, or `undefined` until one arrives. */
  message?: TUiMessage;
  /** The streaming status of the underlying chat instance. */
  status: ChatStatus;
  /** The last error from the agent, if any. */
  error: Error | undefined;
  /** The prompt that drives this suggestion (echo of `initialUserMessage`). */
  prompt: string;
  /** Re-runs the agent request with the same prompt + context. */
  regenerate: () => void;
  /**
   * Stops the in-flight request.
   */
  stop: () => void;
  /**
   * Opens the page's main chat widget with the suggestion's prompt as the
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

export type ChatPageSuggestionsConnectorParams<
  TUiMessage extends UIMessage = UIMessage
> = (
  | { chat: Chat<TUiMessage> }
  | (ChatInitWithoutTransport<TUiMessage> & ChatTransportOption)
) & {
  /**
   * Prompt that drives the suggestion (e.g. "Summarize this product page").
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
   * @default 'chatPageSuggestions'
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

export type ChatPageSuggestionsWidgetDescription<
  TUiMessage extends UIMessage = UIMessage
> = {
  $$type: 'ais.chatPageSuggestions';
  renderState: ChatPageSuggestionsRenderState<TUiMessage>;
  indexRenderState: {
    chatPageSuggestions: WidgetRenderState<
      ChatPageSuggestionsRenderState<TUiMessage>,
      ChatPageSuggestionsConnectorParams<TUiMessage>
    >;
  };
};

export type ChatPageSuggestionsConnector<
  TUiMessage extends UIMessage = UIMessage
> = Connector<
  ChatPageSuggestionsWidgetDescription<TUiMessage>,
  ChatPageSuggestionsConnectorParams<TUiMessage>
>;

type ChatInstanceWithServerWait<TUiMessage extends UIMessage> =
  Chat<TUiMessage> & {
    __chatPageSuggestionsServerWait?: Promise<void>;
  };

function isServerRendering(): boolean {
  return typeof window === 'undefined';
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

export default (function connectChatPageSuggestions<
  TWidgetParams extends UnknownWidgetParams
>(
  renderFn: Renderer<
    ChatPageSuggestionsRenderState,
    TWidgetParams & ChatPageSuggestionsConnectorParams
  >,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return <TUiMessage extends UIMessage = UIMessage>(
    widgetParams: TWidgetParams & ChatPageSuggestionsConnectorParams<TUiMessage>
  ) => {
    warning(
      false,
      'ChatPageSuggestions is not yet stable and will change in the future.'
    );

    const {
      initialUserMessage,
      initialMessages,
      context,
      chatType = 'chat',
      type = 'chatPageSuggestions',
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

    const makeChatInstance = (instantSearchInstance: InstantSearch) => {
      if ('chat' in options && options.chat) {
        return options.chat;
      }

      const transport = createAgentTransport<TUiMessage>({
        client: instantSearchInstance.client,
        agentId: 'agentId' in options ? options.agentId : undefined,
        transport: 'transport' in options ? options.transport : undefined,
        algoliaAgentSuffix: 'chat-page-suggestions',
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

      // Page suggestions are ephemeral by design: never persist messages to
      // sessionStorage. Otherwise a cached response from a previous prompt
      // would be restored on hydration and prevent the fresh request from
      // firing (the existing user message makes `shouldSendInitialRequest`
      // false).
      return new Chat<TUiMessage>({
        ...chatInit,
        id: chatInit.id ?? `instantsearch-${type}`,
        transport,
        persist: false,
      });
    };

    const runRequest = () => {
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
      runRequest();
    };

    const stop = () => {
      _chatInstance.stop();
    };

    return {
      $$type: 'ais.chatPageSuggestions',

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
          if (initialMessages?.length && !hasExistingMessages) {
            _chatInstance.messages = initialMessages;
          }

          _chatInstance['~registerErrorCallback'](render);
          _chatInstance['~registerMessagesCallback'](render);
          _chatInstance['~registerStatusCallback'](render);
        }

        const shouldSendInitialRequest =
          isFirstInit &&
          _chatInstance.messages.filter((m) => m.role === 'user').length ===
            0 &&
          // Idempotency across init() re-invocations. `sendMessage` is async
          // (the user message lands in `messages` after a microtask), so a
          // second init that runs synchronously after the first would
          // re-fire the request before the message is observable. The flag
          // is stored on the chat instance so it survives two-pass SSR.
          !(
            _chatInstance as ChatInstanceWithServerWait<TUiMessage> & {
              __chatPageSuggestionsRequested?: boolean;
            }
          ).__chatPageSuggestionsRequested;

        if (shouldSendInitialRequest) {
          (
            _chatInstance as ChatInstanceWithServerWait<TUiMessage> & {
              __chatPageSuggestionsRequested?: boolean;
            }
          ).__chatPageSuggestionsRequested = true;
          runRequest();
        }

        // On the server, race the in-flight request against `ssrTimeoutMs`.
        // If the timeout wins, stop the chat (which aborts the underlying
        // fetch) and resolve so the SSR pipeline can finish.
        // The promise is stored on the chat instance so two-pass SSR renders
        // reuse the same in-flight request rather than refiring.
        if (isServerRendering()) {
          if (!_chatInstance.__chatPageSuggestionsServerWait) {
            const startedAt = Date.now();
            // eslint-disable-next-line no-console
            console.log(
              `[chat-page-suggestions][SSR] wait started (timeout=${ssrTimeoutMs}ms)`
            );
            _chatInstance.__chatPageSuggestionsServerWait = new Promise<void>(
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
                    `[chat-page-suggestions][SSR] wait resolved via TIMEOUT in ${elapsed}ms (status=${_chatInstance.status})`
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
                      const elapsed = Date.now() - startedAt;
                      // eslint-disable-next-line no-console
                      console.log(
                        `[chat-page-suggestions][SSR] wait resolved via TERMINAL status=${_chatInstance.status} in ${elapsed}ms`
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
            _chatInstance.__chatPageSuggestionsServerWait
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
        ChatPageSuggestionsWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          [type as 'chatPageSuggestions']:
            this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState(renderOptions) {
        const { instantSearchInstance, parent } = renderOptions;
        if (!_chatInstance) {
          this.init!({ ...renderOptions, uiState: {}, results: undefined });
        }

        const indexId = parent.getIndexId();
        const indexChatRenderState = instantSearchInstance.renderState[indexId]
          ? (instantSearchInstance.renderState[indexId][chatType as 'chat'] as
              | Partial<ChatRenderState>
              | undefined)
          : undefined;

        const handoff = () => {
          if (!indexChatRenderState) {
            if (__DEV__) {
              warning(
                false,
                `No chat widget found in render state for type "${chatType}". Make sure a \`connectChat\` widget with matching \`type\` is mounted on the same index.`
              );
            }
            return;
          }
          openChat(indexChatRenderState, {
            message: initialUserMessage,
            referer: 'page-suggestions',
          });
        };

        const canHandoff = Boolean(
          indexChatRenderState &&
            indexChatRenderState.sendMessage &&
            !isChatBusy(indexChatRenderState)
        );

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
        if (_chatInstance) {
          const status = _chatInstance.status;
          if (status === 'submitted' || status === 'streaming') {
            _chatInstance.stop();
          }
        }
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
} satisfies ChatPageSuggestionsConnector);

// Re-export so consumers can build typed wrappers without reaching into
// `lib/chat`.
export type { ChatContext } from '../../lib/chat/sendMessageWithContext';
