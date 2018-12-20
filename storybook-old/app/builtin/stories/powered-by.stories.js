/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('PoweredBy');

export default () => {
  stories
    .add(
      'default',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(instantsearch.widgets.poweredBy({ container }));
      })
    )
    .add(
      'with dark theme',
      withHits(({ search, container, instantsearch }) => {
        container.style.backgroundColor = '#282c34';

        search.addWidget(
          instantsearch.widgets.poweredBy({
            container,
            theme: 'dark',
          })
        );
      })
    );
};
