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
            attributeName: 'brand',
            operator: 'or',
            limit: 10,
            templates: {
              header: 'Brands',
            },
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
            attributeName: 'brand',
            operator: 'or',
            limit: 3,
            templates: {
              header: 'Brands with show more',
            },
            showMore: {
              templates: {
                active: '<button>Show less</button>',
                inactive: '<button>Show more</button>',
              },
              limit: 10,
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
            attributeName: 'brand',
            operator: 'or',
            limit: 10,
            templates: {
              header: 'Searchable brands',
            },
            searchForFacetValues: {
              placeholder: 'Find other brands...',
              templates: {
                noResults: 'No results',
              },
            },
          })
        );
      })
    )
    .add(
      'with search inside items (using the default noResults template)',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attributeName: 'brand',
            operator: 'or',
            limit: 10,
            templates: {
              header: 'Searchable brands',
            },
            searchForFacetValues: {
              placeholder: 'Find other brands...',
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
            attributeName: 'price_range',
            operator: 'and',
            limit: 10,
            cssClasses: {
              header: 'facet-title',
              item: 'facet-value checkbox',
              count: 'facet-count pull-right',
              active: 'facet-active',
            },
            templates: {
              header: 'Price ranges',
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
            attributeName: 'brand',
            operator: 'or',
            limit: 10,
            templates: {
              header: 'Transformed brands',
            },
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
            attributeName: 'brand',
            operator: 'or',
            limit: 10,
            templates: {
              header: 'Transformed searchable brands',
            },
            searchForFacetValues: {
              placeholder: 'Find other brands...',
              templates: {
                noResults: 'No results',
              },
            },
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
