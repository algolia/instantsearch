/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('HierarchicalMenu');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            showParentLevel: false,
          })
        );
      })
    )
    .add(
      'hide parent levels',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            showParentLevel: true,
          })
        );
      })
    )
    .add(
      'with default selected item',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.hierarchicalMenu({
              container,
              attributes: [
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ],
              rootPath: 'Cameras & Camcorders',
            })
          );
        },
        {
          searchParameters: {
            hierarchicalFacetsRefinements: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        }
      )
    )
    .add(
      'with header',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            rootPath: 'Cameras & Camcorders',
            templates: {
              header: 'Hierarchical categories',
            },
          })
        );
      })
    );
};
