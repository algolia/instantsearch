import { storiesOf } from '@storybook/html';
import { SearchResults } from 'algoliasearch-helper';
import { withHits } from '../.storybook/decorators';
import { Widget } from '../src/types';
import { refinementList, menu } from '../src/widgets';

type DynamicWidgetsParams = {
  container: HTMLElement;
  transformItems(items: string[], results: SearchResults): string[];
};

type DynamicWidgets = Widget & {
  createContainer(
    attribute: string
  ): { container: HTMLElement; apply(widget: Widget): void };
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
      container.className = 'ais-DynamicWidgets-widget';

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

storiesOf('Basics/DynamicWidgets', module).add(
  'createContainer',
  withHits(({ search, container }) => {
    const stack = dynamicWidgets({
      transformItems(_attributes, results) {
        if (results._state.query === 'dog') {
          return ['categories'];
        }
        if (results._state.query === 'lego') {
          return ['categories', 'brand'];
        }
        return ['brand', 'categories'];
      },
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
);
