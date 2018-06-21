/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Panel');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.wrappers.panel(instantsearch.widgets.stats)({
            container,
            templates: {
              header: 'Header!',
              footer: 'Footer',
            },
          })
        );
      })
    )
    .add(
      'collapsible',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.wrappers.panel(instantsearch.widgets.refinementList)({
            container,
            attributeName: 'brand',
            templates: {
              header: 'Header!',
              footer: 'Footer',
            },
            collapsible: true,
          })
        );
      })
    );
};
