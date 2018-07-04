/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('PriceRanges');

export default () => {
  stories.add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.priceRanges({
          container,
          attributeName: 'price',
          templates: {
            header: 'Price ranges',
          },
        })
      );
    })
  );
};
