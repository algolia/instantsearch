import type {
  PlainSearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { SearchParameters } from 'algoliasearch-helper';
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
  widgets: Widget[];
  fallbackWidget?(args: { attribute: string }): Widget;
  transformItems?(
    items: string[],
    metadata: { results: SearchResults }
  ): string[];
  /**
   * Request all facet values instead of only those of the mounted widgets. This
   * option will lower the number of network requests needed for dynamic widgets,
   * but will have slightly larger payloads.
   * @default true
   */
  requestAllFacets?: boolean;
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
        requestAllFacets = true,
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
            const attribute = getWidgetAttribute(widget);
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
        getWidgetSearchParameters(searchParameters, options) {
          if (!requestAllFacets) {
            return searchParameters;
          }

          const startParameters = new SearchParameters();

          const fallbackParameters =
            fallbackWidget?.({
              attribute: '__fallback__',
            })?.getWidgetSearchParameters?.(startParameters, options) ??
            startParameters;

          // get all parameters that will be set by the mounted widgets
          const newParams = widgets.reduce(
            (params, widget) =>
              widget.getWidgetSearchParameters
                ? widget.getWidgetSearchParameters(params, options)
                : params,
            fallbackParameters
          );

          const newKeys = Object.keys(newParams) as unknown as Array<
            keyof PlainSearchParameters
          >;

          const newParameters = newKeys.reduce((params, param) => {
            // do not apply managed parameters (they can't be applied twice)
            if ((newParams.managedParameters as string[]).includes(param)) {
              return params;
            }
            return params.setQueryParameter(
              param,
              (newParams as unknown as PlainSearchParameters)[param]
            );
          }, searchParameters);

          return newParameters.setQueryParameters({
            // force *, as this is larger than the other parameters
            facets: ['*'],
          });
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
