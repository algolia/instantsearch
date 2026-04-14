import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import type { ChatRenderState } from './connectChat';
import type {
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  IndexRenderState,
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
 * `open` (whether the chat is open) and `toggleOpen` (to toggle it).
 * It also acts as a presence marker in the widget tree
 * (`$$type: 'ais.chatTrigger'`, `opensChat: true`). The `connectChat`
 * connector's `validateEntryPoints` check looks for widgets with `opensChat`
 * to confirm that a trigger is mounted before allowing the chat to render.
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

export default function connectChatTrigger<
  TWidgetParams extends UnknownWidgetParams
>(
  renderFn: Renderer<
    ChatTriggerRenderState,
    TWidgetParams & ChatTriggerConnectorParams
  >,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return (
    widgetParams: TWidgetParams &
      ChatTriggerConnectorParams = {} as TWidgetParams &
      ChatTriggerConnectorParams
  ) => {
    // Keep a reference to the latest render options so that `toggleOpen`
    // always reads the most current chat state when invoked (e.g. on click).
    let lastRenderOptions: { renderState?: IndexRenderState } | null = null;

    function getChatState(): Partial<ChatRenderState> | undefined {
      return lastRenderOptions?.renderState?.chat as
        | Partial<ChatRenderState>
        | undefined;
    }

    function toggleOpen() {
      const chatState = getChatState();
      chatState?.setOpen?.(!chatState?.open);
    }

    return {
      $$type: 'ais.chatTrigger',
      opensChat: true as const,

      init(initOptions: any) {
        lastRenderOptions = initOptions;
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions: any) {
        lastRenderOptions = renderOptions;
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

      getWidgetRenderState(renderOptions: {
        renderState?: IndexRenderState;
      }): ChatTriggerRenderState {
        const chatState = renderOptions.renderState?.chat as
          | Partial<ChatRenderState>
          | undefined;

        return {
          open: chatState?.open ?? false,
          toggleOpen,
          widgetParams,
        };
      },

      getRenderState(
        renderState: IndexRenderState &
          Partial<ChatTriggerWidgetDescription['indexRenderState']>,
        renderOptions: any
      ): IndexRenderState & ChatTriggerWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          chatTrigger: this.getWidgetRenderState(renderOptions),
        };
      },
    };
  };
}
