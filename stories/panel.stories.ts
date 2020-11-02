import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import { connectHierarchicalMenu } from '../src/connectors';
import panel from '../src/widgets/panel/panel';
import refinementList from '../src/widgets/refinement-list/refinement-list';
import rangeInput from '../src/widgets/range-input/range-input';
import rangeSlider from '../src/widgets/range-slider/range-slider';
import breadcrumb from '../src/widgets/breadcrumb/breadcrumb';
import { noop } from '../src/lib/utils';

const virtualHierarchicalMenu = (args = {}) =>
  connectHierarchicalMenu(
    noop,
    noop
  )({
    attributes: [
      'hierarchicalCategories.lvl0',
      'hierarchicalCategories.lvl1',
      'hierarchicalCategories.lvl2',
    ],
    ...args,
  });

storiesOf('Basics/Panel', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      const brandList = panel({
        templates: {
          header: 'Brand',
          footer: ({ results }) => {
            return results ? `${results.nbHits} results` : '';
          },
        },
      })(refinementList);

      search.addWidgets([
        brandList({
          container,
          attribute: 'brand',
        }),
      ]);
    })
  )
  .add(
    'with range input',
    withHits(({ search, container }) => {
      const priceList = panel({
        templates: {
          header: 'Price',
          footer: 'Footer',
        },
      })(rangeInput);

      search.addWidgets([
        priceList({
          container,
          attribute: 'price',
        }),
      ]);
    })
  )
  .add(
    'with range slider',
    withHits(({ search, container }) => {
      const priceSlider = panel({
        templates: {
          header: 'Price',
          footer: 'Footer',
        },
      })(rangeSlider);

      search.addWidgets([
        priceSlider({
          container,
          attribute: 'price',
          tooltips: {
            format(rawValue) {
              return `$${Math.round(rawValue).toLocaleString()}`;
            },
          },
        }),
      ]);
    })
  )

  .add(
    'with hidden',
    withHits(({ search, container }) => {
      const priceList = panel({
        templates: {
          header: 'Price',
          footer: 'The panel is hidden when there are no results.',
        },
        hidden: ({ results }) => results.nbHits === 0,
      })(rangeInput);

      search.addWidgets([
        priceList({
          container,
          attribute: 'price',
        }),
      ]);
    })
  )
  .add(
    'with collapsed',
    withHits(({ search, container }) => {
      const brandList = panel({
        collapsed: options => {
          return options && options.state && !options.state.query;
        },
        templates: {
          header: 'Brand (collapsible)',
          footer: 'The panel collapses on empty query until controlled',
        },
      })(refinementList);

      search.addWidgets([
        brandList({
          container,
          attribute: 'brand',
        }),
      ]);
    })
  )
  .add(
    'with collapsed and custom templates',
    withHits(({ search, container }) => {
      const brandList = panel({
        collapsed: options => {
          return options && options.state && !options.state.query;
        },
        templates: {
          header: 'Collapsible panel',
          footer: 'The panel collapses on empty query until controlled',
          collapseButtonText: ({ collapsed }) => (collapsed ? 'More' : 'Less'),
        },
      })(refinementList);

      search.addWidgets([
        brandList({
          container,
          attribute: 'brand',
        }),
      ]);
    })
  )
  .add(
    'collapsed unless canRefine',
    withHits(
      ({ search, container }) => {
        const breadcrumbInPanel = panel<typeof breadcrumb>({
          collapsed({ canRefine }) {
            return canRefine === false;
          },
          templates: {
            header({ canRefine }) {
              return `Breadcrumb that can${canRefine ? '' : "'t "} refine`;
            },
            footer:
              'The panel collapses if it cannot refine. Click "Home". This panel will collapse and you will not see this footer anymore.',
          },
        })(breadcrumb);

        search.addWidgets([
          virtualHierarchicalMenu(),
          breadcrumbInPanel({
            container,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        },
      }
    )
  );
