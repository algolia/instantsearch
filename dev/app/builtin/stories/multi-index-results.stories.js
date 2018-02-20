/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('MultiIndexResults');

export default () => {
  stories.add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.multiIndexResults({
          container,
          indices: [
            {
              label: 'Lowest price',
              value: 'instant_search_price_asc',
            },
          ],
        })
      );
    })
  );
};
