/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Pagination');

export default () => {
  stories
    .add(
      'default',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.pagination({
            container,
            totalPages: 20,
          })
        );
      })
    )
    .add(
      'with padding',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.pagination({
            container,
            padding: 6,
          })
        );
      })
    )
    .add(
      'without showFirst',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.pagination({
            container,
            showFirst: false,
          })
        );
      })
    )
    .add(
      'without showLast',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.pagination({
            container,
            showLast: false,
          })
        );
      })
    )
    .add(
      'without showPrevious',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.pagination({
            container,
            showPrevious: false,
          })
        );
      })
    )
    .add(
      'without showNext',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.pagination({
            container,
            showNext: false,
          })
        );
      })
    )
    .add(
      'with templates',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
