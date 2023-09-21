import {
  checkRendering,
  createDocumentationMessageGenerator,
  getWidgetAttribute,
  noop,
  warning,
} from '../../lib/utils';

import type {
  Connector,
  TransformItems,
  TransformItemsMetadata,
  Widget,
} from '../../types';

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
  fallbackWidget?: (args: {
    /** The attribute name to create a widget for. */
    attribute: string;
  }) => Widget;

  /**
   * Function to transform the items to render.
   * The function also exposes the full search response.
   */
  transformItems?: TransformItems<
    string,
    Omit<TransformItemsMetadata, 'results'> & {
      results: NonNullable<TransformItemsMetadata['results']>;
    }
  >;

  /**
   * To prevent unneeded extra network requests when widgets mount or unmount,
   * we request all facet values.
   *
   * @default ['*']
   */
  facets?: ['*'] | never[];

  /**
   * If you have more than 20 facet values pinned, you need to increase the
   * maxValuesPerFacet to at least that value.
   *
   * @default 20
   */
  maxValuesPerFacet?: number;
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

const MAX_WILDCARD_FACETS = 20;

const connectDynamicWidgets: DynamicWidgetsConnector =
  function connectDynamicWidgets(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const {
        widgets,
        maxValuesPerFacet = 20,
        facets = ['*'],
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

      if (
        !(
          Array.isArray(facets) &&
          facets.length <= 1 &&
          (facets[0] === '*' || facets[0] === undefined)
        )
      ) {
        throw new Error(
          withUsage(
            `The \`facets\` option only accepts [] or ["*"], you passed ${JSON.stringify(
              facets
            )}`
          )
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

          parent.addWidgets(widgetsToMount);
          // make sure this only happens after the regular render, otherwise it
          // happens too quick, since render is "deferred" for the next microtask,
          // so this needs to be a whole task later
          setTimeout(() => parent.removeWidgets(widgetsToUnmount), 0);

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
        getWidgetSearchParameters(state) {
          // broadening the scope of facets to avoid conflict between never and *
          return (facets as string[]).reduce(
            (acc, curr) => acc.addFacet(curr),
            state.setQueryParameters({
              maxValuesPerFacet: Math.max(
                maxValuesPerFacet || 0,
                state.maxValuesPerFacet || 0
              ),
            })
          );
        },
        rendersOnPrevented: true,
        getRenderState(renderState, renderOptions) {
          const { PREVENT_RENDER = true } = renderState;
          const dynamicWidgets = this.getWidgetRenderState(renderOptions);

          // if we are in a "has results, but only just mounted widgets" state, add a flag
          // in other cases the flag isn't set and we *do* render the other widgets
          // TODO: improve this condition, reordering is allowed, we just want to make sure it's the same items
          const willChangeWidgets =
            renderState.dynamicWidgets?.attributesToRender.join('__') !==
            dynamicWidgets?.attributesToRender.join('__');

          return {
            ...renderState,
            PREVENT_RENDER: PREVENT_RENDER !== false && willChangeWidgets,
            dynamicWidgets,
          };
        },
        getWidgetRenderState({ results, state }) {
          if (!results) {
            return { attributesToRender: [], widgetParams };
          }

          const attributesToRender = transformItems(
            results.renderingContent?.facetOrdering?.facets?.order ?? [],
            { results }
          );

          if (!Array.isArray(attributesToRender)) {
            throw new Error(
              withUsage(
                'The `transformItems` option expects a function that returns an Array.'
              )
            );
          }

          warning(
            maxValuesPerFacet >= (state.maxValuesPerFacet || 0),
            `The maxValuesPerFacet set by dynamic widgets (${maxValuesPerFacet}) is smaller than one of the limits set by a widget (${state.maxValuesPerFacet}). This causes a mismatch in query parameters and thus an extra network request when that widget is mounted.`
          );

          warning(
            attributesToRender.length <= MAX_WILDCARD_FACETS ||
              widgetParams.facets !== undefined,
            `More than ${MAX_WILDCARD_FACETS} facets are requested to be displayed without explicitly setting which facets to retrieve. This could have a performance impact. Set "facets" to [] to do two smaller network requests, or explicitly to ['*'] to avoid this warning.`
          );

          return {
            attributesToRender,
            widgetParams,
          };
        },
      };
    };
  };

export default connectDynamicWidgets;
