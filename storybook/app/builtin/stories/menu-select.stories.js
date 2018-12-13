/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Menu-select');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menuSelect({
            container,
            attribute: 'categories',
          })
        );
      })
    )
    .add(
      'with show more and header',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menuSelect({
            container,
            attribute: 'categories',
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
      'with custom item template',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menuSelect({
            container,
            attribute: 'categories',
            limit: 10,
            templates: {
              header: 'Categories (menu widget)',
              item: '{{label}}',
            },
          })
        );
      })
    );
};
