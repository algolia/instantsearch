import { openChat } from '../../lib/chat/openChat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import type {
  Connector,
  IndexRenderState,
  InitOptions,
  RenderOptions,
  WidgetRenderState,
} from '../../types';
import type { ChatRenderState } from './connectChat';

const withUsage = createDocumentationMessageGenerator({
  name: 'chatTrigger',
  connector: true,
});

/**
 * ChatTrigger connector.
 *
 * This connector reads the sibling `chat` widget's render state to expose
 * `open` (whether the chat is open) and `toggleOpen` (to toggle it).
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
