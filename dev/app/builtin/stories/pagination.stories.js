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
            maxPages: 20,
          })
        );
      })
    )
    .add(
      'without autoHideContainer',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.pagination({
            container,
            autoHideContainer: false,
          })
        );
      })
    );
};
