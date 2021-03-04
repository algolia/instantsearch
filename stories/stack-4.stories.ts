import { storiesOf } from '@storybook/html';
import { SearchResults } from 'algoliasearch-helper';
import { withHits } from '../.storybook/decorators';
import { noop } from '../src/lib/utils';
import {
  Widget,
  Connector,
  WidgetFactory,
  WidgetRenderState,
  InitOptions,
} from '../src/types';
import { refinementList, menu } from '../src/widgets';

type DynamicWidgetsRendererOptions = {
  attributesToRender: string[];
};

type DynamicWidgetsConnectorParams = {
  widgets: Widget[];
  transformItems?(items: string[], results: SearchResults): string[];
};

type DynamicWidgetsConnector = Connector<
  DynamicWidgetsRendererOptions,
  DynamicWidgetsConnectorParams
>;

function getAttribute(widget: Widget, initOptions: InitOptions): string {
  try {
    // assume the type to be the correct one, but throw a nice error if it isn't the case
    // TODO: guide on how to make widgets compatible?
    type WidgetWithAttribute = Widget<{
      renderState: WidgetRenderState<
        {},
        { attribute: string } | { attributes: string[] }
      >;
    }>;

    const {
      widgetParams,
    } = (widget as WidgetWithAttribute).getWidgetRenderState(initOptions);

    const attribute =
      'attribute' in widgetParams
        ? widgetParams.attribute
        : widgetParams.attributes[0];

    if (typeof attribute !== 'string') throw new Error();

    return attribute;
  } catch (e) {
    throw new Error(
      `Could not find the attribute of the widget:

${JSON.stringify(widget)}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`
    );
  }
}

const connectDynamicWidgets: DynamicWidgetsConnector = function connectDynamicWidgets(
  renderFn,
  unmountFn = noop
) {
  return widgetParams => {
    const { widgets, transformItems = items => items } = widgetParams;

    const localWidgets: Map<
      string,
      { widget: Widget; isMounted: boolean }
    > = new Map();

    return {
      $$type: 'ais.dynamicWidgets',
      init(initOptions) {
        widgets.forEach(widget => {
          const attribute = getAttribute(widget, initOptions);
          localWidgets.set(attribute, { widget, isMounted: false });
        });
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
      dispose() {
        unmountFn();
      },
      getRenderState(renderState) {
        // @TODO: decide whether it makes sense to return anything,
        // knowing that you could have multiple instances of dynamic
        // and they are hard/impossible to distinguish at this point
        return renderState;
      },
      getWidgetRenderState({ results }) {
        if (!results) {
          return { attributesToRender: [], widgetParams };
        }

        // retrieve the facet order out of the results:
        // results.facetOrder.map(facet => facet.attribute)
        const attributesToRender = transformItems([], results);

        return { attributesToRender, widgetParams };
      },
    };
  };
};

type DynamicWidgetsWidgetParams = {
  container: HTMLElement;
  widgets: Array<(container: HTMLElement) => Widget>;
};

type DynamicWidgets = WidgetFactory<
  DynamicWidgetsRendererOptions,
  Omit<DynamicWidgetsConnectorParams, 'widgets'>,
  DynamicWidgetsWidgetParams
>;

const dynamicWidgets: DynamicWidgets = function dynamicWidgets(widgetParams) {
  const { container: rootContainer, transformItems, widgets } =
    widgetParams || {};

  const containers = new Map<string, HTMLElement>();
  const connectorWidgets: Widget[] = [];

  const makeWidget = connectDynamicWidgets(
    ({ attributesToRender }) => {
      attributesToRender.forEach(attribute => {
        if (!containers.has(attribute)) {
          return;
        }
        const container = containers.get(attribute)!;
        rootContainer.appendChild(container);
      });
    },
    () => {
      rootContainer.innerText = '';
    }
  );

  const dynamicWidgets = makeWidget({
    transformItems,
    widgets: connectorWidgets,
  });

  return {
    ...dynamicWidgets,
    init(initOptions) {
      widgets.forEach(cb => {
        const container = document.createElement('div');
        rootContainer.appendChild(container);

        const widget = cb(container);
        const attribute = getAttribute(widget, initOptions);

        containers.set(attribute, container);
        connectorWidgets.push(widget);
      });

      dynamicWidgets.init!(initOptions);
    },
    $$widgetType: 'ais.dynamicWidgets',
  };
};

storiesOf('Basics/DynamicWidgets', module).add(
  'widgets: cb[]',
  withHits(({ search, container: rootContainer }) => {
    search.addWidgets([
      dynamicWidgets({
        transformItems(_attributes, results) {
          if (results._state.query === 'dog') {
            return ['categories'];
          }
          if (results._state.query === 'lego') {
            return ['categories', 'brand'];
          }
          return ['brand', 'categories'];
        },
        container: rootContainer,
        widgets: [
          container => menu({ container, attribute: 'categories' }),
          container => refinementList({ container, attribute: 'brand' }),
        ],
      }),
    ]);
  })
);
