import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

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
 * This connector has no meaningful render state — it exists as a presence
 * marker in the widget tree (`$$type: 'ais.chatTrigger'`). The `connectChat`
 * connector's `validateEntryPoints` check looks for this type to confirm that
 * a trigger widget is mounted before allowing the chat to be rendered.
 */
export type ChatTriggerConnectorParams = Record<string, never>;

export type ChatTriggerRenderState = {
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
    return {
      $$type: 'ais.chatTrigger',
      opensChat: true as const,

      init(initOptions: any) {
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions: any) {
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

      getWidgetRenderState(_renderOptions: any): ChatTriggerRenderState {
        return { widgetParams };
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
