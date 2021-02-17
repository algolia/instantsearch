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
  // addWidgets(widget: Widget[]): DynamicWidgets;
  // removeWidgets(widget: Widget[]): DynamicWidgets;

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
    // @ts-expect-error
    $$type: 'ais.dynamicWidgets',
    // @ts-expect-error
    $$widgetType: 'ais.dynamicWidgets',
    init() {},
    render({ results, parent }) {
      // results.facetOrder.map(facet => facet.attribute)
      const attributesToRender = transformItems([], results);

      localWidgets.forEach(
        ({ widget, isMounted, container }, attribute, localWidgets) => {
          const shouldMount = attributesToRender.indexOf(attribute) > -1;

          if (!isMounted && shouldMount) {
            parent!.addWidgets([widget]);
            localWidgets.set(attribute, {
              widget,
              container,
              isMounted: true,
            });
          } else if (isMounted && !shouldMount) {
            // make sure this only happens after the regular render, otherwise it happens too quick
            // render is "deferred" for the next microtask
            // so this needs to be a whole task later
            setTimeout(() => parent!.removeWidgets([widget]), 0);
            localWidgets.set(attribute, {
              widget,
              container,
              isMounted: false,
            });
          }
        }
      );
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

storiesOf('Basics/DynamicWidgets', module).add(
  'default',
  withHits(({ search, container }) => {
    const stack = dynamicWidgets({
      transformItems(_attributes, results) {
        if (results._state.query === 'dog') {
          return ['categories'];
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
