/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('PoweredBy');

export default () => {
  stories.add(
    'default',
    wrapWithHits(container => {
      window.search.addWidget(instantsearch.widgets.poweredBy({ container }));
    })
  );
  stories.add(
    'with dark theme default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.poweredBy({ container, theme: 'dark' })
      );
    })
  );
};
