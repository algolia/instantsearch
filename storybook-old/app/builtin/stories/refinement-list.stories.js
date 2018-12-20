/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('RefinementList');

export default () => {
  stories
    .add(
      'default',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'brand',
          })
        );
      })
    )
    .add(
      'with show more',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'brand',
            limit: 3,
            showMore: true,
            showMoreLimit: 10,
          })
        );
      })
    )
    .add(
      'with show more and templates',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'brand',
            limit: 3,
            showMore: true,
            showMoreLimit: 10,
            templates: {
              showMoreText: `
                {{#isShowingMore}}
                  ⬆️
                {{/isShowingMore}}
                {{^isShowingMore}}
                  ⬇️
                {{/isShowingMore}}`,
            },
          })
        );
      })
    )
    .add(
      'with search inside items',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.refinementList({
            container,
            attribute: 'price_range',
            operator: 'and',
            cssClasses: {
              item: 'facet-value checkbox',
              count: 'facet-count pull-right',
              selectedItem: 'facet-active',
            },
          })
        );
      })
    )
    .add(
      'with transformed items',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
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
