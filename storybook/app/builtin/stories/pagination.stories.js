/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Pagination');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.pagination({
            container,
            totalPages: 20,
          })
        );
      })
    )
    .add(
      'with padding',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.pagination({
            container,
            padding: 6,
          })
        );
      })
    )
    .add(
      'without showFirst',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.pagination({
            container,
            showFirst: false,
          })
        );
      })
    )
    .add(
      'without showLast',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.pagination({
            container,
            showLast: false,
          })
        );
      })
    )
    .add(
      'without showPrevious',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.pagination({
            container,
            showPrevious: false,
          })
        );
      })
    )
    .add(
      'without showNext',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.pagination({
            container,
            showNext: false,
          })
        );
      })
    )
    .add(
      'with templates',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.pagination({
            container,
            templates: {
              previous: 'Previous',
              next: 'Next',
              first: 'First',
              last: 'Last',
            },
          })
        );
      })
    );
};
