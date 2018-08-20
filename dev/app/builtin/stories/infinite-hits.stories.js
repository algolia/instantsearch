/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

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
              showmore: 'button',
            },
            templates: {
              item: '{{name}}',
            },
          })
        );
      })
    )
    .add(
      'with transformed items',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.infiniteHits({
            container,
            showMoreLabel: 'Show more',
            templates: {
              item: '{{name}}',
            },
            transformItems: items =>
              items.map(item => ({
                ...item,
                name: `${item.name} (transformed)`,
              })),
          })
        );
      })
    );
};
