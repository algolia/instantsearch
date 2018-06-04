/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('InfiniteHits');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.infiniteHits({
            container,
            showMoreLabel: 'Show more',
            templates: {
              item: '{{name}}',
            },
          })
        );
      })
    )
    .add(
      'with header and footer',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.infiniteHits({
            container,
            showMoreLabel: 'Show more',
            templates: {
              item: '{{name}}',
              panelHeader: 'Infinite hits',
              panelFooter: 'Brought to you by Algolia',
            },
          })
        );
      })
    )
    .add(
      'with custom css classes',
      wrapWithHits(container => {
        const style = window.document.createElement('style');
        window.document.head.appendChild(style);
        style.sheet.insertRule(
          '.button button{border: 1px solid black; background: #fff;}'
        );

        window.search.addWidget(
          instantsearch.widgets.infiniteHits({
            container,
            showMoreLabel: 'Show more',
            cssClasses: {
              item: 'item',
              showmore: 'button',
              panelRoot: 'root',
              panelHeader: 'header',
              panelBody: 'body',
              panelFooter: 'footer',
            },
            templates: {
              item: '{{name}}',
              panelHeader: 'Infinite hits',
              panelFooter: 'Brought to you by Algolia',
            },
          })
        );
      })
    );
};
