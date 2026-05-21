import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import type {
  Connector,
  IndexRenderState,
  IndexWidget,
  InitOptions,
  RenderOptions,
  RenderState,
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

function getChatStateFromOptions(
  options: InitOptions | RenderOptions | null
): Partial<ChatRenderState> | undefined {
  if (!options) return undefined;

  const parent: IndexWidget | undefined = options.parent;
  const indexId = parent?.getIndexId();
  if (!indexId) return undefined;

  // Despite the `SharedRenderOptions.renderState: IndexRenderState` type,
  // `widget.render`/`widget.init` actually receive
  // `instantSearchInstance.renderState`, which is the cross-index `RenderState`
  // (`{ [indexId]: IndexRenderState }`). We cast to access the right shape.
  const globalRenderState = options.renderState as unknown as
    | RenderState
    | undefined;

  return globalRenderState?.[indexId]?.chat as
    | Partial<ChatRenderState>
    | undefined;
}

const connectChatTrigger: ChatTriggerConnector = function connectChatTrigger(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const params = widgetParams ?? ({} as ChatTriggerConnectorParams);
    // Keep a reference to the latest render options so that `toggleOpen`
    // always reads the most current chat state when invoked (e.g. on click).
    // We rely on `instantSearchInstance` (whose `.renderState` is a live
    // mutable reference) to always resolve the *current* chat state at
    // click time, rather than the (frozen) `renderState` captured at the
    // moment of `init`/`render`.
    let lastInstantSearchInstance: InitOptions['instantSearchInstance'] | null =
      null;
    let lastParent: IndexWidget | null = null;

    function getCurrentChatState():
      | Partial<ChatRenderState>
      | undefined {
      const indexId = lastParent?.getIndexId();
      if (!indexId || !lastInstantSearchInstance) return undefined;

      const globalRenderState = lastInstantSearchInstance.renderState as
        | RenderState
        | undefined;

      return globalRenderState?.[indexId]?.chat as
        | Partial<ChatRenderState>
        | undefined;
    }

    function toggleOpen() {
      const chatState = getCurrentChatState();
      chatState?.setOpen?.(!chatState?.open);
    }

    return {
      $$type: 'ais.chatTrigger',
      opensChat: true as const,

      init(initOptions) {
        lastInstantSearchInstance = initOptions.instantSearchInstance;
        lastParent = initOptions.parent ?? null;
        renderFn(
          {
            ...this.getWidgetRenderState!(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        lastInstantSearchInstance = renderOptions.instantSearchInstance;
        lastParent = renderOptions.parent ?? null;
        renderFn(
          {
            ...this.getWidgetRenderState!(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },

      getWidgetRenderState(renderOptions) {
        const chatState = getChatStateFromOptions(renderOptions);

        return {
          open: chatState?.open ?? false,
          toggleOpen,
          widgetParams: params,
        };
      },

      getRenderState(
        renderState: IndexRenderState &
          Partial<ChatTriggerWidgetDescription['indexRenderState']>,
        renderOptions
      ): IndexRenderState & ChatTriggerWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          chatTrigger: this.getWidgetRenderState!(renderOptions),
        };
      },
    };
  };
};

export default connectChatTrigger;
