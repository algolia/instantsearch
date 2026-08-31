import { isChatBusy, openChat } from '../../lib/chat/openChat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import type { ChatRenderState } from './connectChat';
import type { OpenChatOptions } from '../../lib/chat/openChat';
import type {
  Connector,
  IndexRenderState,
  InitOptions,
  RenderOptions,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'chatTrigger',
  connector: true,
});

/**
 * ChatTrigger connector.
 *
 * This connector reads the sibling `chat` widget's render state to expose
 * `open` (whether the chat is open), `toggleOpen` (to toggle it), `openChat`
 * (to open it and optionally submit a message) and `isChatBusy`. Custom entry
 * points — a hero CTA, a keyboard shortcut, an "ask about this product" link —
 * go through the same connector as the built-in trigger button.
 *
 * It also acts as a presence marker in the widget tree
 * (`$$type: 'ais.chatTrigger'`, `opensChat: true`). The `connectChat`
 * connector's entry-point validation looks for widgets with `opensChat`
 * to confirm that a trigger is mounted, and warns otherwise.
 */
export type ChatTriggerConnectorParams = Record<string, never>;

export type ChatTriggerRenderState = {
  /**
   * Whether the sibling chat widget is currently open.
   */
  open: boolean;
  /**
   * Toggle the sibling chat widget open/closed.
   */
  toggleOpen: () => void;
  /**
   * Opens the sibling chat widget, optionally submitting a message to it.
   * Without a message, the chat is opened and its input focused. Returns
   * `true` when a message was submitted.
   */
  openChat: (options?: OpenChatOptions) => boolean;
  /**
   * Whether the chat is submitting or streaming a message, and so can't accept
   * a new one. `false` until the chat has initialized.
   */
  isChatBusy: boolean;
  widgetParams: ChatTriggerConnectorParams;
};

export type ChatTriggerWidgetDescription = {
  $$type: 'ais.chatTrigger';
  renderState: ChatTriggerRenderState;
  indexRenderState: {
    chatTrigger: WidgetRenderState<
      ChatTriggerRenderState,
      ChatTriggerConnectorParams
    >;
  };
};

export type ChatTriggerConnector = Connector<
  ChatTriggerWidgetDescription,
  ChatTriggerConnectorParams
>;

// Reads the sibling chat widget's render state from the live cross-index
// `instantSearchInstance.renderState` map. We resolve at call time so that
// `toggleOpen` always sees the latest `open`/`setOpen` values.
function getChatRenderState(
  options: InitOptions | RenderOptions
): ChatRenderState | undefined {
  const indexId = options.parent?.getIndexId();
  if (!indexId) return undefined;
  return options.instantSearchInstance.renderState[indexId]?.chat;
}

const connectChatTrigger: ChatTriggerConnector = function connectChatTrigger(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const params = widgetParams ?? ({} as ChatTriggerConnectorParams);
    let lastOptions: InitOptions | RenderOptions | null = null;

    function openChatFromTrigger(options?: OpenChatOptions) {
      if (!lastOptions) return false;
      return openChat(getChatRenderState(lastOptions), options);
    }

    function toggleOpen() {
      if (!lastOptions) return;
      const chatState = getChatRenderState(lastOptions);
      if (!chatState) return;
      if (chatState.open) {
        chatState.setOpen?.(false);
      } else {
        openChat(chatState);
      }
    }

    return {
      $$type: 'ais.chatTrigger',
      opensChat: true as const,
      dependsOn: 'none' as const,

      init(initOptions) {
        lastOptions = initOptions;
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        lastOptions = renderOptions;
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },

      getWidgetRenderState(renderOptions: InitOptions | RenderOptions) {
        const chatState = getChatRenderState(renderOptions);
        return {
          open: chatState?.open ?? false,
          toggleOpen,
          openChat: openChatFromTrigger,
          isChatBusy: chatState
            ? !chatState.sendMessage || isChatBusy(chatState)
            : false,
          widgetParams: params,
        };
      },

      getRenderState(
        renderState: IndexRenderState,
        renderOptions: InitOptions | RenderOptions
      ) {
        return {
          ...renderState,
          chatTrigger: this.getWidgetRenderState(renderOptions),
        };
      },

      shouldRender() {
        return true;
      },
    };
  };
};

export default connectChatTrigger;
