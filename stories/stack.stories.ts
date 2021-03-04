import { storiesOf } from '@storybook/html';
import { SearchResults } from 'algoliasearch-helper';
import { withHits } from '../.storybook/decorators';
import { noop } from '../src/lib/utils';
import { Widget, Connector, WidgetFactory } from '../src/types';
import { refinementList, menu } from '../src/widgets';

type DynamicWidgetsParams = {
  container: HTMLElement;
  transformItems(items: string[], results: SearchResults): string[];
};

type DynamicWidgets = Widget & {
  // addWidgets(widget: Widget[]): DynamicWidgets;
  // removeWidgets(widget: Widget[]): DynamicWidgets;

  createContainer(
    attribute: string
  ): { container: HTMLElement; apply(widget: Widget): void };
};

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

function dynamicWidgets({
  container: rootContainer,
  transformItems,
}: DynamicWidgetsParams): DynamicWidgets {
  const localWidgets: Map<
    string,
    { widget: Widget; container: HTMLElement; isMounted: boolean }
  > = new Map();

  return {
    $$type: 'ais.dynamicWidgets',
    $$widgetType: 'ais.dynamicWidgets',
    init() {},
    render({ results, parent }) {
      // retrieve the facet order out of the results:
      // results.facetOrder.map(facet => facet.attribute)
      const attributesToRender = transformItems([], results);

      const widgetsToUnmount: Widget[] = [];
      const widgetsToMount: Widget[] = [];

      localWidgets.forEach(({ widget, isMounted, container }, attribute) => {
        const shouldMount = attributesToRender.indexOf(attribute) > -1;

        if (!isMounted && shouldMount) {
          widgetsToMount.push(widget);
          localWidgets.set(attribute, {
            widget,
            container,
            isMounted: true,
          });
        } else if (isMounted && !shouldMount) {
          widgetsToUnmount.push(widget);

          localWidgets.set(attribute, {
            widget,
            container,
            isMounted: false,
          });
        }
      });

      parent!.addWidgets(widgetsToMount);
      // make sure this only happens after the regular render, otherwise it happens too quick
      // render is "deferred" for the next microtask
      // so this needs to be a whole task later
      setTimeout(() => parent!.removeWidgets(widgetsToUnmount), 0);

      attributesToRender.forEach(attribute => {
        if (!localWidgets.has(attribute)) {
          return;
        }
        const { container } = localWidgets.get(attribute)!;
        rootContainer.appendChild(container);
      });
    },
    createContainer(attribute) {
      const container = document.createElement('div');
      container.className = 'ais-DynamicWidget';

      rootContainer.appendChild(container);

      return {
        container,
        apply: widget => {
          localWidgets.set(attribute, { widget, container, isMounted: false });
        },
      };
    },
  };
}

function transformItems(_attributes, results) {
  if (results._state.query === 'dog') {
    return ['categories'];
  }
  if (results._state.query === 'lego') {
    return ['categories', 'brand'];
  }
  return ['brand', 'categories'];
}

type DynamicWidgetsWidgetParams = {
  container: HTMLElement;
};

type DynamicWidgets2 = WidgetFactory<
  DynamicWidgetsRendererOptions,
  DynamicWidgetsConnectorParams,
  DynamicWidgetsWidgetParams
>;

const dynamicWidgets2: DynamicWidgets2 = function dynamicWidgets2(
  widgetParams
) {
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

storiesOf('Basics/DynamicWidgets', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      const stack = dynamicWidgets({
        transformItems,
        container,
      });

      const categoryContainer = stack.createContainer('categories');

      categoryContainer.apply(
        menu({
          container: categoryContainer.container,
          attribute: 'categories',
        })
      );

      const brandContainer = stack.createContainer('brand');

      brandContainer.apply(
        refinementList({
          container: brandContainer.container,
          attribute: 'brand',
        })
      );

      search.addWidgets([stack]);
    })
  )
  .add(
    'connector',
    withHits(({ search, container }) => {
      const brandContainer = document.createElement('div');
      const categoriesContainer = document.createElement('div');

      container.appendChild(brandContainer);
      container.appendChild(categoriesContainer);

      search.addWidgets([
        connectDynamicWidgets<{
          container: HTMLElement;
          containers: Map<string, HTMLElement>;
        }>(
          ({
            attributesToRender,
            widgetParams: { container: rootContainer, containers },
          }) => {
            attributesToRender.forEach(attribute => {
              if (!containers.has(attribute)) {
                return;
              }
              const container = containers.get(attribute)!;
              rootContainer.appendChild(container);
            });
          }
        )({
          transformItems,
          container,
          containers: new Map([
            ['brand', brandContainer],
            ['categories', categoriesContainer],
          ]),
        })
          // @ts-expect-error haven't yet found a way to add functions to connector/widget type
          .addWidget(
            'brand',
            refinementList({
              container: brandContainer,
              attribute: 'brand',
            })
          )
          .addWidget(
            'categories',
            menu({
              container: categoriesContainer,
              attribute: 'categories',
            })
          ),
      ]);
    })
  )
  .add(
    'connector-widget',
    withHits(({ search, container }) => {
      search.addWidgets([
        dynamicWidgets2({
          transformItems,
          container,
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
