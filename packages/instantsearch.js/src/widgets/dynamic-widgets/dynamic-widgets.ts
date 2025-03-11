import { connectDynamicWidgets } from '../../connectors';
import { component } from '../../lib/suit';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
  getWidgetAttribute,
} from '../../lib/utils';

import type {
  DynamicWidgetsConnectorParams,
  DynamicWidgetsWidgetDescription,
} from '../../connectors';
import type { Widget, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'dynamic-widgets',
});
const suit = component('DynamicWidgets');

export type DynamicWidgetsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * An array of widget creator functions, displayed in the order defined by
   * `facetOrdering`.
   */
  widgets: Array<(container: HTMLElement) => Widget>;

  /**
   * Function to return a fallback widget when an attribute isn't found in
   * `widgets`.
   */
  fallbackWidget?: (args: {
    /** The attribute name to create a widget for. */
    attribute: string;
    /** CSS Selector or HTMLElement to insert the widget */
    container: HTMLElement;
  }) => Widget;
};

export type DynamicWidgetsWidget = WidgetFactory<
  DynamicWidgetsWidgetDescription & { $$widgetType: 'ais.dynamicWidgets' },
  Omit<DynamicWidgetsConnectorParams, 'widgets' | 'fallbackWidget'>,
  DynamicWidgetsWidgetParams
>;

function createContainer(rootContainer: HTMLElement) {
  const container = document.createElement('div');
  container.className = suit({ descendantName: 'widget' });

  rootContainer.appendChild(container);

  return container;
}

const dynamicWidgets: DynamicWidgetsWidget = function dynamicWidgets(
  widgetParams
) {
  const {
    container: containerSelector,
    widgets,
    fallbackWidget,
    ...otherWidgetParams
  } = widgetParams || {};

  if (!containerSelector) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (
    !widgets ||
    !Array.isArray(widgets) ||
    !widgets.every((widget) => typeof widget === 'function')
  ) {
    throw new Error(
      withUsage('The `widgets` option expects an array of callbacks.')
    );
  }

  const userContainer = getContainerNode(containerSelector);
  const rootContainer = document.createElement('div');
  rootContainer.className = suit();

  const containers = new Map<string, HTMLElement>();
  const connectorWidgets: Widget[] = [];

  const makeWidget = connectDynamicWidgets(
    ({ attributesToRender }, isFirstRender) => {
      if (isFirstRender) {
        userContainer.appendChild(rootContainer);
      }

      attributesToRender.forEach((attribute) => {
        if (!containers.has(attribute)) {
          return;
        }
        const container = containers.get(attribute)!;
        rootContainer.appendChild(container);
      });
    },
    () => {
      userContainer.removeChild(rootContainer);
    }
  );

  const widget = makeWidget({
    ...otherWidgetParams,
    widgets: connectorWidgets,
    fallbackWidget:
      typeof fallbackWidget === 'function'
        ? ({ attribute }) => {
            const container = createContainer(rootContainer);
            containers.set(attribute, container);
            return fallbackWidget({ attribute, container });
          }
        : undefined,
  });

  return {
    ...widget,
    init(initOptions) {
      widgets.forEach((cb) => {
        const container = createContainer(rootContainer);

        const childWidget = cb(container);
        const attribute = getWidgetAttribute(childWidget, initOptions);

        containers.set(attribute, container);
        connectorWidgets.push(childWidget);
      });

      widget.init!(initOptions);
    },
    $$widgetType: 'ais.dynamicWidgets',
  };
};
export default dynamicWidgets;
