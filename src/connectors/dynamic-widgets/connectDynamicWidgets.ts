import { SearchResults } from 'algoliasearch-helper';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getWidgetAttribute,
  noop,
} from '../../lib/utils';
import { Connector, Widget } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'dynamic-widgets',
  connector: true,
});

export type DynamicWidgetsRenderState = {
  attributesToRender: string[];
};

export type DynamicWidgetsConnectorParams = {
  widgets: Widget[];
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

const connectDynamicWidgets: DynamicWidgetsConnector = function connectDynamicWidgets(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { widgets, transformItems = items => items } = widgetParams;

    if (
      !widgets ||
      !Array.isArray(widgets) ||
      widgets.some(widget => typeof widget !== 'object')
    ) {
      throw new Error(
        withUsage('The `widgets` option expects an array of widgets.')
      );
    }

    if (
      !widgets ||
      !Array.isArray(widgets) ||
      widgets.some(widget => typeof widget !== 'object')
    ) {
      throw new Error(
        withUsage('The `widgets` option expects an array of widgets.')
      );
    }

    const localWidgets: Map<
      string,
      { widget: Widget; isMounted: boolean }
    > = new Map();

    return {
      $$type: 'ais.dynamicWidgets',
      init(initOptions) {
        widgets.forEach(widget => {
          const attribute = getWidgetAttribute(widget, initOptions);
          localWidgets.set(attribute, { widget, isMounted: true });
        });
        initOptions.parent!.addWidgets(widgets);

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
        parent!.removeWidgets(toRemove);

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
          results.renderingContent?.facetOrdering?.facet?.order ?? [];

        return {
          attributesToRender: transformItems(attributesToRender, { results }),
          widgetParams,
        };
      },
    };
  };
};

export default connectDynamicWidgets;
