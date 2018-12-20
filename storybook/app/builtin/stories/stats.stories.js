/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Stats');

export default () => {
  stories.add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(instantsearch.widgets.stats({ container }));
    })
  );
};
