/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('NumericSelector');

export default () => {
  stories.add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.numericSelector({
          container,
          operator: '>=',
          attributeName: 'popularity',
          options: [
            { label: 'Default', value: 0 },
            { label: 'Top 10', value: 21459 },
            { label: 'Top 100', value: 21369 },
            { label: 'Top 500', value: 20969 },
          ],
        })
      );
    })
  );
  stories.add(
    'with default value',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.numericSelector({
          container,
          operator: '=',
          attributeName: 'rating',
          options: [
            { label: 'No rating selected', value: undefined },
            { label: 'Rating: 5', value: 5 },
            { label: 'Rating: 4', value: 4 },
            { label: 'Rating: 3', value: 3 },
            { label: 'Rating: 2', value: 2 },
            { label: 'Rating: 1', value: 1 },
          ],
        })
      );
    })
  );
};
