import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';
import { connectHierarchicalMenu } from '../src/connectors';
import { noop } from '../src/lib/utils';
import { breadcrumb } from '../src/widgets';

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

storiesOf('Metadata/Breadcrumb', module)
  .add(
    'default',
    withHits(
      ({ search, container }) => {
        const breadcrumbDiv = document.createElement('div');
        container.appendChild(breadcrumbDiv);

        search.addWidgets([
          virtualHierarchicalMenu(),

          breadcrumb({
            container: breadcrumbDiv,
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
  )
  .add(
    'with custom separators',
    withHits(
      ({ search, container }) => {
        const breadcrumbDiv = document.createElement('div');
        container.appendChild(breadcrumbDiv);

        search.addWidgets([
          virtualHierarchicalMenu(),

          breadcrumb({
            container: breadcrumbDiv,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            templates: {
              separator: ' + ',
            },
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
  )
  .add(
    'with custom home label',
    withHits(
      ({ search, container }) => {
        const breadcrumbDiv = document.createElement('div');
        container.appendChild(breadcrumbDiv);

        search.addWidgets([
          virtualHierarchicalMenu(),

          breadcrumb({
            container: breadcrumbDiv,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            templates: {
              home: 'Home Page',
            },
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
  )
  .add(
    'with root path',
    withHits(
      ({ search, container, instantsearch }) => {
        const breadcrumbDiv = document.createElement('div');
        const hierarchicalMenu = document.createElement('div');

        container.appendChild(breadcrumbDiv);
        container.appendChild(hierarchicalMenu);

        search.addWidgets([
          breadcrumb({
            container: breadcrumbDiv,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            rootPath: 'Cameras & Camcorders',
          }),

          instantsearch.widgets.hierarchicalMenu({
            container: hierarchicalMenu,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            rootPath: 'Cameras & Camcorders',
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
  )
  .add(
    'with hierarchical menu',
    withHits(
      ({ search, container, instantsearch }) => {
        const breadcrumbDiv = document.createElement('div');
        container.appendChild(breadcrumbDiv);
        const hierarchicalMenu = document.createElement('div');
        container.appendChild(hierarchicalMenu);

        search.addWidgets([
          breadcrumb({
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
    )
  )
  .add(
    'with transformed items',
    withHits(
      ({ search, container }) => {
        const breadcrumbDiv = document.createElement('div');
        container.appendChild(breadcrumbDiv);

        search.addWidgets([
          virtualHierarchicalMenu(),

          breadcrumb({
            container: breadcrumbDiv,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            transformItems: items =>
              items.map(item => ({
                ...item,
                label: `${item.label} (transformed)`,
              })),
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
  )
  .add(
    'with add/remove',
    withHits(
      ({ search, container }) => {
        search.addWidgets([virtualHierarchicalMenu()]);

        withLifecycle(search, container, node =>
          breadcrumb({
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
    )
  );
