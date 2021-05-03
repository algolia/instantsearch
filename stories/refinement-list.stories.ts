import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Refinements/RefinementList', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.refinementList({
          container,
          attribute: 'brand',
        }),
      ]);
    })
  )
  .add(
    'with show more',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.refinementList({
          container,
          attribute: 'brand',
          limit: 3,
          showMore: true,
          showMoreLimit: 10,
        }),
      ]);
    })
  )
  .add(
    'with show more and templates',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
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
        }),
      ]);
    })
  )
  .add(
    'with search inside items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.refinementList({
          container,
          attribute: 'brand',
          searchable: true,
        }),
      ]);
    })
  )
  .add(
    'with search inside items (using custom templates)',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.refinementList({
          container,
          attribute: 'brand',
          searchable: true,
          searchablePlaceholder: 'Find other brands...',
          templates: {
            searchableNoResults: 'No results found',
            searchableSubmit: 'Go',
            searchableReset: 'x',
            searchableLoadingIndicator: '•',
          },
        }),
      ]);
    })
  )
  .add(
    'with search and show more',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.refinementList({
          container,
          attribute: 'brand',
          limit: 3,
          showMore: true,
          showMoreLimit: 10,
          searchable: true,
        }),
      ]);
    })
  )
  .add(
    'with operator `and`',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.refinementList({
          container,
          attribute: 'price_range',
          operator: 'and',
          cssClasses: {
            item: 'facet-value checkbox',
            count: 'facet-count pull-right',
            selectedItem: 'facet-active',
          },
        }),
      ]);
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.refinementList({
          container,
          attribute: 'brand',
          transformItems: items =>
            items.map(item => ({
              ...item,
              label: `${item.label} (transformed)`,
              highlighted: `${item.highlighted} (transformed)`,
            })),
        }),
      ]);
    })
  )
  .add(
    'with searchable transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
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
        }),
      ]);
    })
  );
