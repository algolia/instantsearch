import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Breadcrumb', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      const breadcrumb = document.createElement('div');
      container.appendChild(breadcrumb);

      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container: breadcrumb,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      );

      // Custom Widget to toggle refinement
      search.addWidget({
        init({ helper }) {
          helper.toggleRefinement(
            'hierarchicalCategories.lvl0',
            'Cameras & Camcorders > Digital Cameras'
          );
        },
      });
    })
  )
  .add(
    'with custom separators',
    withHits(({ search, container, instantsearch }) => {
      const breadcrumb = document.createElement('div');
      container.appendChild(breadcrumb);

      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container: breadcrumb,
          templates: {
            separator: ' + ',
          },
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      );

      // Custom Widget to toggle refinement
      search.addWidget({
        init({ helper }) {
          helper.toggleRefinement(
            'hierarchicalCategories.lvl0',
            'Cameras & Camcorders > Digital Cameras'
          );
        },
      });
    })
  )
  .add(
    'with custom home label',
    withHits(({ search, container, instantsearch }) => {
      const breadcrumb = document.createElement('div');
      container.appendChild(breadcrumb);

      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container: breadcrumb,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          templates: { home: 'Home Page' },
        })
      );

      // Custom Widget to toggle refinement
      search.addWidget({
        init({ helper }) {
          helper.toggleRefinement(
            'hierarchicalCategories.lvl0',
            'Cameras & Camcorders > Digital Cameras'
          );
        },
      });
    })
  )
  .add(
    'with default selected item',
    withHits(({ search, container, instantsearch }) => {
      const breadcrumb = document.createElement('div');
      container.appendChild(breadcrumb);
      const hierarchicalMenu = document.createElement('div');
      container.appendChild(hierarchicalMenu);

      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container: breadcrumb,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          rootPath: 'Cameras & Camcorders > Digital Cameras',
        })
      );

      search.addWidget(
        instantsearch.widgets.hierarchicalMenu({
          showParentLevel: false,
          container: hierarchicalMenu,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          rootPath: 'Cameras & Camcorders',
        })
      );
    })
  )
  .add(
    'with hierarchical menu',
    withHits(({ search, container, instantsearch }) => {
      const breadcrumb = document.createElement('div');
      container.appendChild(breadcrumb);
      const hierarchicalMenu = document.createElement('div');
      container.appendChild(hierarchicalMenu);

      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container: breadcrumb,
          separator: ' / ',
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      );

      search.addWidget(
        instantsearch.widgets.hierarchicalMenu({
          showParentLevel: false,
          container: hierarchicalMenu,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          rootPath: 'Cameras & Camcorders',
        })
      );
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      const breadcrumb = document.createElement('div');
      container.appendChild(breadcrumb);

      search.addWidget(
        instantsearch.widgets.breadcrumb({
          container: breadcrumb,
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
        })
      );

      // Custom Widget to toggle refinement
      search.addWidget({
        init({ helper }) {
          helper.toggleRefinement(
            'hierarchicalCategories.lvl0',
            'Cameras & Camcorders > Digital Cameras'
          );
        },
      });
    })
  );
