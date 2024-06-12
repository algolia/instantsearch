import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import type { Connector, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'layout',
  connector: true,
});

export type LayoutRenderState = {};

export type LayoutWidgetDescription = {
  $$type: 'ais.layout';
  renderState: LayoutRenderState;
  indexRenderState: {
    Layout: WidgetRenderState<LayoutRenderState, LayoutConnectorParams>;
  };
};

export type LayoutConnectorParams =
  | {
      id: string;
    }
  | {
      path: string;
    };

export type LayoutConnector = Connector<
  LayoutWidgetDescription,
  LayoutConnectorParams
>;

const connectLayout: LayoutConnector = function connectLayout(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    return {
      $$type: 'ais.layout',
      dependsOn: 'configuration',

      init(initOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const renderState = this.getWidgetRenderState(renderOptions);

        renderFn(
          {
            ...renderState,
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          layout: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results }) {
        return {
          widgetParams,
        };
      },

      getWidgetParameters() {
        if ('path' in widgetParams) {
          return {
            path: widgetParams.path,
          };
        }

        return {
          id: widgetParams.id,
        };
      },
    };
  };
};

export default connectLayout;
