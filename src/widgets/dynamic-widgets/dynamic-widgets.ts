import connectDynamicWidgets, {
  DynamicWidgetsConnectorParams,
  DynamicWidgetsWidgetDescription,
} from '../../connectors/dynamic-widgets/connectDynamicWidgets';
import { component } from '../../lib/suit';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
  getWidgetAttribute,
} from '../../lib/utils';
import { Widget, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'dynamic-widgets',
});
const suit = component('DynamicWidgets');

export type DynamicWidgetsWidgetParams = {
  container: HTMLElement | string;
  widgets: Array<(container: HTMLElement) => Widget>;
};

export type DynamicWidgets = WidgetFactory<
  DynamicWidgetsWidgetDescription & { $$widgetType: 'ais.dynamicWidgets' },
  Omit<DynamicWidgetsConnectorParams, 'widgets'>,
  DynamicWidgetsWidgetParams
>;

const dynamicWidgets: DynamicWidgets = function dynamicWidgets(widgetParams) {
  const { container: containerSelector, transformItems, widgets } =
    widgetParams || {};

  if (!containerSelector) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (
    !widgets ||
    !Array.isArray(widgets) ||
    widgets.some(widget => typeof widget !== 'function')
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

      attributesToRender.forEach(attribute => {
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
  });

  return {
    ...widget,
    init(initOptions) {
      widgets.forEach(cb => {
        const container = document.createElement('div');
        container.className = suit({ descendantName: 'widget' });
        rootContainer.appendChild(container);

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
