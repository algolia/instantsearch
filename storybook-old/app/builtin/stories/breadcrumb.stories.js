/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Breadcrumb');
export default () => {
  stories
    .add(
      'default',
      withHits(({ search, container, instantsearch }) => {
        container.innerHTML = `
        <div id="hierarchicalMenu"></div>
        <div id="breadcrumb"></div>
      `;

        search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
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
      'With custom separators',
      withHits(({ search, container, instantsearch }) => {
        container.innerHTML = `
        <div id="hierarchicalMenu"></div>
        <div id="breadcrumb"></div>
      `;

        search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
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
        container.innerHTML = `
        <div id="hierarchicalMenu"></div>
        <div id="breadcrumb"></div>
      `;

        search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
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
        container.innerHTML = `
        <div id="breadcrumb"></div>
        <div id="hierarchicalMenu"></div>
      `;

        search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
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
            container: '#hierarchicalMenu',
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
        container.innerHTML = `
        <div id="breadcrumb"></div>
        <div id="hierarchicalMenu"></div>
      `;

        search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
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
            container: '#hierarchicalMenu',
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
        container.innerHTML = `
          <div id="hierarchicalMenu"></div>
          <div id="breadcrumb"></div>
        `;

        search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
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
};
