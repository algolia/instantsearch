import type { SearchResults } from 'algoliasearch-helper';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getWidgetAttribute,
  noop,
} from '../../lib/utils';
import type { Connector, Widget } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'dynamic-widgets',
  connector: true,
});

export type DynamicWidgetsRenderState = {
  attributesToRender: string[];
};

export type DynamicWidgetsConnectorParams = {
  /**
   * An array of widgets, displayed in the order defined by `facetOrdering`.
   */
  widgets: Widget[];

  /**
   * Function to return a fallback widget when an attribute isn't found in
   * `widgets`.
   */
  fallbackWidget?(args: {
    /** The attribute name to create a widget for. */
    attribute: string;
  }): Widget;

  /**
   * Function to transform the items to render.
   * The function also exposes the full search response.
   */
  transformItems?(
    items: string[],
    metadata: { results: SearchResults }
  ): string[];
};

export type DynamicWidgetsWidgetDescription = {
  $$type: 'ais.dynamicWidgets';
  renderState: DynamicWidgetsRenderState;
  indexRenderState: {
    dynamicWidgets: DynamicWidgetsRenderState;
  };
};

export type DynamicWidgetsConnector = Connector<
  DynamicWidgetsWidgetDescription,
  DynamicWidgetsConnectorParams
>;

const connectDynamicWidgets: DynamicWidgetsConnector =
  function connectDynamicWidgets(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const {
        widgets,
        transformItems = (items) => items,
        fallbackWidget,
      } = widgetParams;

      if (
        !(
          widgets &&
          Array.isArray(widgets) &&
          widgets.every((widget) => typeof widget === 'object')
        )
      ) {
        throw new Error(
          withUsage('The `widgets` option expects an array of widgets.')
        );
      }

      const localWidgets: Map<string, { widget: Widget; isMounted: boolean }> =
        new Map();

      return {
        $$type: 'ais.dynamicWidgets',
        init(initOptions) {
          widgets.forEach((widget) => {
            const attribute = getWidgetAttribute(widget, initOptions);
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
          const { parent } = renderOptions;
          const renderState = this.getWidgetRenderState(renderOptions);

          const widgetsToUnmount: Widget[] = [];
          const widgetsToMount: Widget[] = [];

          if (fallbackWidget) {
            renderState.attributesToRender.forEach((attribute) => {
              if (!localWidgets.has(attribute)) {
                const widget = fallbackWidget({ attribute });
                localWidgets.set(attribute, { widget, isMounted: false });
              }
            });
          }

          localWidgets.forEach(({ widget, isMounted }, attribute) => {
            const shouldMount =
              renderState.attributesToRender.indexOf(attribute) > -1;

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

          parent!.addWidgets(widgetsToMount);
          // make sure this only happens after the regular render, otherwise it
          // happens too quick, since render is "deferred" for the next microtask,
          // so this needs to be a whole task later
          setTimeout(() => parent!.removeWidgets(widgetsToUnmount), 0);

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
            dynamicWidgets: this.getWidgetRenderState(renderOptions),
          };
        },
        getWidgetRenderState({ results }) {
          if (!results) {
            return { attributesToRender: [], widgetParams };
          }

          const attributesToRender =
            results.renderingContent?.facetOrdering?.facets?.order ?? [];

          return {
            attributesToRender: transformItems(attributesToRender, { results }),
            widgetParams,
          };
        },
      };
    };
  };

export default connectDynamicWidgets;
