/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import wrapWithHits from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Hits');

export default () => {
  stories.add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(instantsearch.widgets.hits({ container }));
    })
  );
};
