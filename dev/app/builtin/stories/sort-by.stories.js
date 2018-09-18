/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('SortBy');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.sortBy({
            container,
            items: [
              { name: 'instant_search', label: 'Most relevant' },
              { name: 'instant_search_price_asc', label: 'Lowest price' },
              { name: 'instant_search_price_desc', label: 'Highest price' },
            ],
          })
        );
      })
    )
    .add(
      'with transformed items',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.sortBy({
            container,
            items: [
              { name: 'instant_search', label: 'Most relevant' },
              { name: 'instant_search_price_asc', label: 'Lowest price' },
              { name: 'instant_search_price_desc', label: 'Highest price' },
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
