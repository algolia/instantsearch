/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('RefinementList');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'brand',
          })
        );
      })
    )
    .add(
      'with show more',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'brand',
            limit: 3,
            showMore: true,
            showMoreLimit: 10,
            templates: {
              showMoreActive: 'Show way less',
              showMoreInactive: 'Show way less',
            },
          })
        );
      })
    )
    .add(
      'with search inside items',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'brand',
            searchable: true,
          })
        );
      })
    )
    .add(
      'with search inside items (using a custom searchableNoResults template)',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'brand',
            searchable: true,
            searchablePlaceholder: 'Find other brands...',
            templates: {
              searchableNoResults: 'No results found',
            },
          })
        );
      })
    )
    .add(
      'with operator `and`',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'price_range',
            operator: 'and',
            cssClasses: {
              item: 'facet-value checkbox',
              count: 'facet-count pull-right',
              selectedItem: 'facet-active',
            },
            transformData(data) {
              data.label = data.label
                .replace(/(\d+) - (\d+)/, '$$$1 - $$$2')
                .replace(/> (\d+)/, '> $$$1');
              return data;
            },
          })
        );
      })
    )
    .add(
      'with transformed items',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'brand',
            transformItems: items =>
              items.map(item => ({
                ...item,
                label: `${item.label} (transformed)`,
                highlighted: `${item.highlighted} (transformed)`,
              })),
          })
        );
      })
    )
    .add(
      'with searchable transformed items',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'brand',
            searchable: true,
            transformItems: items =>
              items.map(item => ({
                ...item,
                label: `${item.label} (transformed)`,
                highlighted: `${item.highlighted} (transformed)`,
              })),
          })
        );
      })
    );
};
