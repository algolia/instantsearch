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
            attribute: 'categories',
          })
        );
      })
    )
    .add(
      'with transformed items',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attribute: 'categories',
            transformItems: items =>
              items.map(item => ({
                ...item,
                label: `${item.label} (transformed)`,
              })),
          })
        );
      })
    )
    .add(
      'with show more',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attribute: 'categories',
            limit: 3,
            showMore: true,
            showMoreLimit: 10,
          })
        );
      })
    )
    .add(
      'with show more and templates',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attribute: 'categories',
            limit: 3,
            showMore: true,
            showMoreLimit: 10,
            templates: {
              showMoreActive: 'Show way less',
              showMoreInactive: 'Show way more',
            },
          })
        );
      })
    );
};
