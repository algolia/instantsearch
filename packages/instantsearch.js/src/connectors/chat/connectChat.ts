import { noop } from '../../lib/utils';

import type { Connector } from '../../types';

export type ChatConnectorParams = Record<string, unknown>;

export type ChatRenderState = Record<string, unknown>;

export type ChatWidgetDescription = {
  $$type: 'ais.chat';
  renderState: any;
  indexRenderState: any;
  indexUiState: any;
};

export type ChatConnector = Connector<
  ChatWidgetDescription,
  ChatConnectorParams
>;

const connectChat: ChatConnector = function connectChat(
  renderFn,
  unmountFn = noop
) {
  return (widgetParams) => {
    return {
      $$type: 'ais.chat',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render() {},

      dispose() {
        unmountFn();
      },

      getRenderState() {},

      getWidgetRenderState() {
        return {};
      },

      getWidgetSearchParameters(searchParameters) {
        return searchParameters;
      },

      getWidgetUiState() {
        return {};
      },
    };
  };
};

export default connectChat;
