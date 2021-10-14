import type {
  DynamicWidgetsConnectorParams,
  DynamicWidgetsWidgetDescription,
} from '../../connectors/dynamic-widgets/connectDynamicWidgets';
import connectDynamicWidgets from '../../connectors/dynamic-widgets/connectDynamicWidgets';
import { component } from '../../lib/suit';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
  getWidgetAttribute,
} from '../../lib/utils';
import type { Widget, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'dynamic-widgets',
});
const suit = component('DynamicWidgets');

export type DynamicWidgetsWidgetParams = {
  container: HTMLElement | string;
  widgets: Array<(container: HTMLElement) => Widget>;
  fallbackWidget?(args: { attribute: string; container: HTMLElement }): Widget;
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
    transformItems,
    widgets,
    fallbackWidget,
  } = widgetParams || {};

  if (!containerSelector) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (
    !(
      widgets &&
      Array.isArray(widgets) &&
      widgets.every((widget) => typeof widget === 'function')
    )
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
    transformItems,
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
    preInit(initOptions) {
      widgets.forEach((cb) => {
        const container = createContainer(rootContainer);

        const childWidget = cb(container);
        const attribute = getWidgetAttribute(childWidget, initOptions);

        containers.set(attribute, container);
        connectorWidgets.push(childWidget);
      });
    },
    $$widgetType: 'ais.dynamicWidgets',
  };
};
export default dynamicWidgets;
