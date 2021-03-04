import { storiesOf } from '@storybook/html';
import { SearchResults } from 'algoliasearch-helper';
import { withHits } from '../.storybook/decorators';
import { noop } from '../src/lib/utils';
import { Widget, Connector, WidgetFactory } from '../src/types';
import { refinementList, menu } from '../src/widgets';

type DynamicWidgetsRendererOptions = {
  attributesToRender: string[];
};
type DynamicWidgetsConnectorParams = {
  transformItems(items: string[], results: SearchResults): string[];
};

type DynamicWidgetsConnector = Connector<
  DynamicWidgetsRendererOptions,
  DynamicWidgetsConnectorParams
>;

const connectDynamicWidgets: DynamicWidgetsConnector = function connectDynamicWidgets(
  renderFn,
  unmountFn = noop
) {
  return widgetParams => {
    const {
      transformItems = (items =>
        items) as DynamicWidgetsConnectorParams['transformItems'],
    } = widgetParams || {};

    const localWidgets: Map<
      string,
      { widget: Widget; isMounted: boolean }
    > = new Map();

    return {
      $$type: 'ais.dynamicWidgets',
      init() {},
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
      addWidget(attribute: string, widget: Widget) {
        localWidgets.set(attribute, { widget, isMounted: false });
        return this;
      },
      // removeWidget(attribute, widget) {},
    };
  };
};

type DynamicWidgetsWidgetParams = {
  container: HTMLElement;
};

type DynamicWidgets = WidgetFactory<
  DynamicWidgetsRendererOptions,
  DynamicWidgetsConnectorParams,
  DynamicWidgetsWidgetParams
>;

const dynamicWidgets: DynamicWidgets = function dynamicWidgets(widgetParams) {
  const { container: rootContainer, transformItems } = widgetParams || {};

  const containers = new Map<string, HTMLElement>();

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

  // @ts-expect-error other methods
  const { addWidget, ...widget } = makeWidget({ transformItems });

  return {
    ...widget,
    addWidget(attribute: string, cb: (container: HTMLElement) => Widget) {
      const container = document.createElement('div');
      rootContainer.appendChild(container);
      containers.set(attribute, container);
      addWidget(attribute, cb(container));
      return this;
    },
    $$widgetType: 'ais.dynamicWidgets',
  };
};

storiesOf('Basics/DynamicWidgets', module).add(
  'addWidget(attribute, cb)',
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
      })
        // @ts-expect-error haven't yet found a way to add functions to connector/widget type
        .addWidget('brand', container =>
          refinementList({
            container,
            attribute: 'brand',
          })
        )
        .addWidget('categories', container =>
          menu({
            container,
            attribute: 'categories',
          })
        ),
    ]);
  })
);
