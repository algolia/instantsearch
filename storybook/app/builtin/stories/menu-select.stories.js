/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('MenuSelect');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menuSelect({
            container,
            attribute: 'categories',
          })
        );
      })
    )
    .add(
      'with custom item template',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menuSelect({
            container,
            attribute: 'categories',
            limit: 10,
            templates: {
              item: '{{label}}',
            },
          })
        );
      })
    )
    .add(
      'with custom default template',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menuSelect({
            container,
            attribute: 'categories',
            limit: 10,
            templates: {
              defaultOption: 'Default choice',
            },
          })
        );
      })
    );
};
