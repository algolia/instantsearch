/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('RatingMenu');

export default () => {
  stories
    .add(
      'default',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.ratingMenu({
            container,
            attribute: 'rating',
            max: 5,
          })
        );
      })
    )
    .add(
      'with disabled item',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.ratingMenu({
            container,
            attribute: 'rating',
            max: 7,
          })
        );
      })
    );
};
