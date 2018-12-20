/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Stats');

export default () => {
  stories.add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(instantsearch.widgets.stats({ container }));
    })
  );
};
