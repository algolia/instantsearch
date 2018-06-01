/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Breadcrumb');
export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        container.innerHTML = `
        <div id="hierarchicalMenu"></div>
        <div id="breadcrumb"></div>
      `;

        window.search.addWidget(
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
        window.search.addWidget({
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
      'With custom templates: header, footer, home, separator',
      wrapWithHits(container => {
        container.innerHTML = `
        <div id="hierarchicalMenu"></div>
        <div id="breadcrumb"></div>
      `;

        window.search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            templates: {
              panelHeader: '🥖 crumb',
              panelFooter: 'Brought to you by Algolia',
              home: 'home page',
              separator: '➖',
            },
          })
        );

        // Custom Widget to toggle refinement
        window.search.addWidget({
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
      'with custom css classes',
      wrapWithHits(container => {
        container.innerHTML = `
        <div id="hierarchicalMenu"></div>
        <div id="breadcrumb"></div>
      `;

        window.search.addWidget(
          instantsearch.widgets.breadcrumb({
            container: '#breadcrumb',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            templates: {
              panelHeader: '🥖 crumb',
              panelFooter: 'Brought to you by Algolia',
            },
            cssClasses: {
              panelRoot: 'breadcrumb-root',
              panelHeader: 'breadcrumb-header',
              panelFooter: 'breadcrumb-footer',
              panelBody: 'breadcrumb-body',
            },
          })
        );

        // Custom Widget to toggle refinement
        window.search.addWidget({
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
      wrapWithHits(container => {
        container.innerHTML = `
        <div id="breadcrumb"></div>
        <div id="hierarchicalMenu"></div>
      `;

        window.search.addWidget(
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

        window.search.addWidget(
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
      wrapWithHits(container => {
        container.innerHTML = `
        <div id="breadcrumb"></div>
        <div id="hierarchicalMenu"></div>
      `;

        window.search.addWidget(
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

        window.search.addWidget(
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
    );
};
