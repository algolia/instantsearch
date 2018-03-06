/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Menu');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attributeName: 'categories',
          })
        );
      })
    )
    .add(
      'with show more and header',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attributeName: 'categories',
            limit: 3,
            showMore: {
              templates: {
                active: '<button>Show less</button>',
                inactive: '<button>Show more</button>',
              },
              limit: 10,
            },
            templates: {
              header: 'Categories (menu widget)',
            },
          })
        );
      })
    )
    .add(
      'as a Select DOM element',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menuSelect({
            container,
            attributeName: 'categories',
            limit: 10,
          })
        );
      })
    );
};
