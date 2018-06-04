/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('HitsPerPageSelector');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hitsPerPageSelector({
            container,
            items: [
              { value: 3, label: '3 per page' },
              { value: 5, label: '5 per page' },
              { value: 10, label: '10 per page' },
            ],
          })
        );
      })
    )
    .add(
      'with header and footer',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hitsPerPageSelector({
            container,
            items: [
              { value: 3, label: '3 per page' },
              { value: 5, label: '5 per page' },
              { value: 10, label: '10 per page' },
            ],
            templates: {
              panelHeader: 'Hits per page?',
              panelFooter: 'Brought to you by Algolia',
            },
          })
        );
      })
    )
    .add(
      'with custom css classes',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hitsPerPageSelector({
            container,
            items: [
              { value: 3, label: '3 per page' },
              { value: 5, label: '5 per page' },
              { value: 10, label: '10 per page' },
            ],
            templates: {
              panelHeader: 'Hits per page?',
              panelFooter: 'Brought to you by Algolia',
            },
            cssClasses: {
              panelRoot: 'root',
              panelHeader: 'header',
              panelBody: 'body',
              panelFooter: 'footer',
              select: 'select',
              item: 'item',
            }
          })
        );
      })
    )
    .add(
      'with default hitPerPage to 5',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hitsPerPageSelector({
            container,
            items: [
              { value: 3, label: '3 per page' },
              { value: 5, label: '5 per page', default: true },
              { value: 10, label: '10 per page' },
            ],
          })
        );
      })
    );
};
