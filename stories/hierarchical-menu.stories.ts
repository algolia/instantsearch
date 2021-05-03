import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';

storiesOf('Refinements/HierarchicalMenu', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hierarchicalMenu({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        }),
      ]);
    })
  )
  .add(
    'only show current level options',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hierarchicalMenu({
          container,
          showParentLevel: false,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        }),
      ]);
    })
  )
  .add(
    'with default selected item',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidgets([
          instantsearch.widgets.hierarchicalMenu({
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
  )
  .add(
    'with root path',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hierarchicalMenu({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          rootPath: 'Cameras & Camcorders',
        }),
      ]);
    })
  )
  .add(
    'with show more',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hierarchicalMenu({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
            'hierarchicalCategories.lvl3',
          ],
          limit: 3,
          showMore: true,
        }),
      ]);
    })
  )
  .add(
    'with show more and showMoreLimit',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hierarchicalMenu({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
            'hierarchicalCategories.lvl3',
          ],
          limit: 3,
          showMore: true,
          showMoreLimit: 6,
        }),
      ]);
    })
  )
  .add(
    'with show more (exhaustive display)',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hierarchicalMenu({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
            'hierarchicalCategories.lvl3',
          ],
          limit: 200,
          showMore: true,
          showMoreLimit: 1000,
        }),
      ]);
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hierarchicalMenu({
          container,
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
    })
  )
  .add(
    'with add/remove',
    withHits(({ search, container, instantsearch }) => {
      withLifecycle(search, container, node =>
        instantsearch.widgets.hierarchicalMenu({
          container: node,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      );
    })
  );
