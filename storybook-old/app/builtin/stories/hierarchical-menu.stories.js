/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('HierarchicalMenu');

export default () => {
  stories
    .add(
      'default',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          })
        );
      })
    )
    .add(
      'only show current level options',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container,
            showParentLevel: false,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
          })
        );
      })
    )
    .add(
      'with default selected item',
      wrapWithHits(
        container => {
          search.addWidget(
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
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
      })
    )
    .add(
      'with show more',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
          })
        );
      })
    )
    .add(
      'with show more and showMoreLimit',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
          })
        );
      })
    )
    .add(
      'with show more (exhaustive display)',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
          })
        );
      })
    )
    .add(
      'with transformed items',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
          })
        );
      })
    );
};
