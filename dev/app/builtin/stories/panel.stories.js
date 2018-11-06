/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Panel');

export default () => {
  stories
    .add(
      'with default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.panel({
            templates: {
              header: 'Header',
              footer: 'Footer',
            },
            hidden: ({ canRefine }) => !canRefine,
          })(instantsearch.widgets.refinementList)({
            container,
            attribute: 'brand',
          })
        );
      })
    )
    .add(
      'with breadcrumb',
      wrapWithHits(container => {
        container.innerHTML = `
          <div id="breadcrumb"></div>
          <div id="hierarchicalMenu"></div>
        `;

        window.search.addWidget(
          instantsearch.widgets.panel({
            templates: {
              header: 'Header',
              footer: ({ items }) =>
                items ? `${items.length} items selected<hr>` : '<hr>',
            },
          })(instantsearch.widgets.breadcrumb)({
            container: '#breadcrumb',
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
