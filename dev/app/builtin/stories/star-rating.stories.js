/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('StarRating');

export default () => {
  stories.add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.starRating({
          container,
          attribute: 'rating',
          max: 5,
          labels: {
            andUp: '& Up',
          },
          templates: {
            header: 'Rating',
          },
        })
      );
    })
  );
};
