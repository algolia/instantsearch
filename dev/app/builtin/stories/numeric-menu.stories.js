/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('NumericMenu');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.numericMenu({
            container,
            attribute: 'price',
            operator: 'or',
            items: [
              { name: 'All' },
              { end: 4, name: 'less than 4' },
              { start: 4, end: 4, name: '4' },
              { start: 5, end: 10, name: 'between 5 and 10' },
              { start: 10, name: 'more than 10' },
            ],
            cssClasses: {
              item: 'facet-value',
              count: 'facet-count pull-right',
              selectedItem: 'facet-active',
            },
          })
        );
      })
    )
    .add(
      'with transformed hits',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.numericMenu({
            container,
            attribute: 'price',
            operator: 'or',
            items: [
              { name: 'All' },
              { end: 4, name: 'less than 4' },
              { start: 4, end: 4, name: '4' },
              { start: 5, end: 10, name: 'between 5 and 10' },
              { start: 10, name: 'more than 10' },
            ],
            cssClasses: {
              item: 'facet-value',
              count: 'facet-count pull-right',
              selectedItem: 'facet-active',
            },
            transformItems: items =>
              items.map(item => ({
                ...item,
                label: `${item.label} (transformed)`,
              })),
          })
        );
      })
    );
};
