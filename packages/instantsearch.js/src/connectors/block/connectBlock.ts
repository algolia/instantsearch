import {
  checkRendering,
  createDocumentationMessageGenerator,
  getWidgetName,
  noop,
} from '../../lib/utils';

import type { Connector, Widget, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'block',
  connector: true,
});

export type BlockNode = {
  type: string;
  params: Record<string, any>;
  children: BlockNode[];
};

export type BlockRenderState = {
  blocks: BlockNode[];
};

export type BlockWidgetDescription = {
  $$type: 'ais.block';
  renderState: BlockRenderState;
  indexRenderState: {
    block: WidgetRenderState<BlockRenderState, BlockConnectorParams>;
  };
};

export type BlockConnectorParams = {
  /**
   * The id to fetch the block for.
   * When undefined, InstantSearch uses the current path of the block.
   */
  id?: string;

  /**
   * The path to fetch the block for.
   * When undefined, InstantSearch uses the current path of the block.
   */
  path?: string;

  /**
   * An array of widgets, displayed in the order defined by `facetOrdering`.
   */
  widgets: Widget[];
};

export type BlockConnector = Connector<
  BlockWidgetDescription,
  BlockConnectorParams
>;

const connectBlock: BlockConnector = function connectBlock(
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

    const path = location.pathname.slice(1);

    const localWidgets: Map<string, { widget: Widget; isMounted: boolean }> =
      new Map();

    return {
      $$type: 'ais.block',
      dependsOn: 'configuration',
      $$id: widgetParams.id || widgetParams.path || path,

      init(initOptions) {
        widgetParams.widgets.forEach((widget) => {
          const attribute = getWidgetName(widget);
          localWidgets.set(attribute, { widget, isMounted: false });
        });

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

        const widgetsToUnmount: Widget[] = [];
        const widgetsToMount: Widget[] = [];

        localWidgets.forEach(({ widget, isMounted }, attribute) => {
          const shouldMount = true;

          if (!isMounted && shouldMount) {
            widgetsToMount.push(widget);
            localWidgets.set(attribute, {
              widget,
              isMounted: true,
            });
          } else if (isMounted && !shouldMount) {
            widgetsToUnmount.push(widget);
            localWidgets.set(attribute, {
              widget,
              isMounted: false,
            });
          }
        });

        renderOptions.parent.addWidgets(widgetsToMount);

        setTimeout(
          () => renderOptions.parent.removeWidgets(widgetsToUnmount),
          0
        );

        renderFn(
          {
            ...renderState,
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      dispose({ parent }) {
        const toRemove: Widget[] = [];
        localWidgets.forEach(({ widget, isMounted }) => {
          if (isMounted) {
            toRemove.push(widget);
          }
        });
        parent.removeWidgets(toRemove);

        unmountFn();
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          block: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results }) {
        if (!results || 'query' in results) {
          return {
            blocks: [],
            widgetParams,
          };
        }

        return {
          blocks: results.blocks,
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
          path,
        };
      },
    };
  };
};

export default connectBlock;
