import {
  checkRendering,
  createDocumentationMessageGenerator,
  getWidgetAttribute,
  getWidgetName,
  noop,
} from '../../lib/utils';

import type { Connector, Widget, WidgetRenderState } from '../../types';

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

  /**
   * An array of widgets, displayed in the order defined by `facetOrdering`.
   */
  widgets: Widget[];
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

    const localWidgets: Map<string, { widget: Widget; isMounted: boolean }> =
      new Map();

    return {
      $$type: 'ais.layout',
      dependsOn: 'configuration',

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
          layout: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results }) {
        return {
          // blocks: results.blocks,
          blocks: [
            // {
            //   type: 'heading-1',
            //   children: [
            //     {
            //       type: 'text',
            //       params: { value: 'Top Thriller Books' },
            //     },
            //   ],
            // },
            {
              type: 'ais.configure',
              params: { facetFilters: [['type:book']] },
            },
            {
              type: 'ais.hits',
              children: [
                {
                  type: 'image',
                  params: {
                    src: 'hit.largeImage',
                    alt: 'hit.name',
                  },
                },
                // {
                //   type: 'heading-3',
                //   children: [
                //     {
                //       type: 'text',
                //       params: { value: 'hit.title' },
                //     },
                //   ],
                // },
                // {
                //   type: 'paragraph',
                //   children: [
                //     { type: 'text', params: { value: 'By ' } },
                //     { type: 'text', params: { value: 'hit.author' } },
                //   ],
                // },
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
