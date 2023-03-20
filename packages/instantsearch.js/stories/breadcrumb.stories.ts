import { withHits, withLifecycle } from '../.storybook/decorators';
import { connectHierarchicalMenu } from '../src/connectors';
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

import type { BreadcrumbWidget } from '../src/widgets/breadcrumb/breadcrumb';
import type { Meta, StoryObj } from '@storybook/html';

type Args = {
  widgetParams: Partial<Parameters<BreadcrumbWidget>[0]>;
};

const meta: Meta<Args> = {
  title: 'Metadata/Breadcrumb',
  render: (args) =>
    withHits(
      ({ search, container, instantsearch }) => {
        const breadcrumbDiv = document.createElement('div');
        container.appendChild(breadcrumbDiv);

        search.addWidgets([
          virtualHierarchicalMenu(),

          instantsearch.widgets.breadcrumb({
            container: breadcrumbDiv,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            ...args.widgetParams,
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
    )(),
};

export default meta;

export const Default: StoryObj<Args> = {};

export const WithCustomSeparators: StoryObj<Args> = {
  args: {
    widgetParams: {
      templates: {
        separator: ' + ',
      },
    },
  },
};

export const WithCustomHomeLabel: StoryObj<Args> = {
  args: {
    widgetParams: {
      templates: {
        home: 'Home Page',
      },
    },
  },
};

export const WithRootPath: StoryObj<Args> = {
  args: {
    widgetParams: {
      rootPath: 'Cameras & Camcorders',
    },
  },
};

export const WithHierarchicalMenu: StoryObj<Args> = {
  render: withHits(
    ({ search, container, instantsearch }) => {
      const breadcrumbDiv = document.createElement('div');
      container.appendChild(breadcrumbDiv);
      const hierarchicalMenu = document.createElement('div');
      container.appendChild(hierarchicalMenu);

      search.addWidgets([
        instantsearch.widgets.breadcrumb({
          container: breadcrumbDiv,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        }),

        instantsearch.widgets.hierarchicalMenu({
          container: hierarchicalMenu,
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
  ),
};

export const WithTransformedItems: StoryObj<Args> = {
  args: {
    widgetParams: {
      transformItems: (items) =>
        items.map((item) => ({
          ...item,
          label: `${item.label} (transformed)`,
        })),
    },
  },
};

export const WithAddRemove: StoryObj<Args> = {
  render: withHits(
    ({ search, container, instantsearch }) => {
      search.addWidgets([virtualHierarchicalMenu()]);

      withLifecycle(search, container, (node) =>
        instantsearch.widgets.breadcrumb({
          container: node,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      );
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
  ),
};
