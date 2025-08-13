import { noop } from '../../lib/utils';

import type { Connector, WidgetRenderState } from '../../types';

export type ChatConnectorParams = Record<string, unknown>;

export type ChatRenderState = Record<string, unknown>;

export type ChatWidgetDescription = {
  $$type: 'ais.Chat';
  renderState: ChatRenderState;
  indexRenderState: {
    Chat: WidgetRenderState<ChatRenderState, ChatConnectorParams>;
  };
};

export type ChatConnector = Connector<
  ChatWidgetDescription,
  ChatConnectorParams
>;

const connectChat: ChatConnector = function connectChat(
  renderFn = noop,
  unmountFn = noop
) {
  return () => {
    return {
      $$type: 'ais.Chat',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render() {},

      dispose() {
        unmountFn();
      },

      getRenderState() {},

      getWidgetRenderState() {},

      getWidgetSearchParameters() {},

      getWidgetUiState() {},
    };
  };
};

export default connectChat;
