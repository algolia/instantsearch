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
      'with sortBy',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.panel({
            templates: {
              header: 'Header',
              footer: 'Footer',
            },
          })(instantsearch.widgets.sortBy)({
            container,
            items: [
              { value: 'instant_search', label: 'Most relevant' },
              { value: 'instant_search_price_asc', label: 'Lowest price' },
              { value: 'instant_search_price_desc', label: 'Highest price' },
            ],
          })
        );
      })
    );
};
