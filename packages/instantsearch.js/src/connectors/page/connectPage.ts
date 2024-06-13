import {
  checkRendering,
  createDocumentationMessageGenerator,
  getWidgetName,
  noop,
} from '../../lib/utils';

import type { Connector, Widget, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'page',
  connector: true,
});

export type PageNode = {
  type: string;
  params: Record<string, any>;
  children: PageNode[];
};

export type PageRenderState = {
  blocks: PageNode[];
};

export type PageWidgetDescription = {
  $$type: 'ais.page';
  renderState: PageRenderState;
  indexRenderState: {
    Page: WidgetRenderState<PageRenderState, PageConnectorParams>;
  };
};

export type PageConnectorParams = {
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

export type PageConnector = Connector<
  PageWidgetDescription,
  PageConnectorParams
>;

const connectPage: PageConnector = function connectPage(
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
      $$type: 'ais.page',
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
          page: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results }) {
        console.log('gwrs', results);
        return {
          blocks: [
            // {
            //   type: 'heading-1',
            //   children: [
            //     {
            //       type: 'text',
            //       params: {
            //         value: 'Apple products',
            //       },
            //     },
            //   ],
            // },
            {
              type: 'ais.configure',
              params: {
                facetFilters: [['brand_label:Apple']],
              },
            },
            {
              type: 'ais.hits',
              children: [
                {
                  type: 'image',
                  params: {
                    src: 'hit.image1',
                    alt: 'hit.title_model',
                  },
                },
                {
                  type: 'heading-3',
                  children: [
                    {
                      type: 'text',
                      params: {
                        value: 'hit.title_model',
                      },
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      params: {
                        value: 'Condition: ',
                      },
                    },
                    {
                      type: 'text',
                      params: {
                        value: 'hit.backbox_grade_label',
                      },
                    },
                  ],
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
          path: location.pathname.slice(1),
        };
      },
    };
  };
};

export default connectPage;
