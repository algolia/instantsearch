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

export type LayoutNode = {
  type: string;
  params: Record<string, any>;
  children: LayoutNode[];
};

export type LayoutRenderState = {
  blocks: LayoutNode[];
};

export type LayoutWidgetDescription = {
  $$type: 'ais.layout';
  renderState: LayoutRenderState;
  indexRenderState: {
    Layout: WidgetRenderState<LayoutRenderState, LayoutConnectorParams>;
  };
};

export type LayoutConnectorParams = {
  /**
   * The id to fetch the page for.
   * When undefined, InstantSearch uses the current path of the page.
   */
  id?: string;

  /**
   * The path to fetch the page for.
   * When undefined, InstantSearch uses the current path of the page.
   */
  path?: string;
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
    if (widgetParams.path && widgetParams.id) {
      throw new Error(
        withUsage('The `path` and `id` options are mutually exclusive.')
      );
    }

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
          // blocks: results.blocks,
          blocks: [
            {
              type: 'heading-2',
              children: [
                {
                  type: 'text',
                  params: {
                    value: 'Summer BBQ',
                  },
                },
              ],
            },
          ],
          widgetParams,
        };
      },

      getWidgetParameters() {
        if (widgetParams.id) {
          return {
            id: widgetParams.id,
          };
        } else if (widgetParams.path) {
          return {
            path: widgetParams.path,
          };
        }

        return {
          // @TODO: use routing?
          path: location.pathname,
        };
      },
    };
  };
};

export default connectLayout;
