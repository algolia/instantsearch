import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';

storiesOf('Refinements/Menu', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.menu({
          container,
          attribute: 'categories',
        }),
      ]);
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.menu({
          container,
          attribute: 'categories',
          transformItems: items =>
            items.map(item => ({
              ...item,
              label: `${item.label} (transformed)`,
            })),
        }),
      ]);
    })
  )
  .add(
    'with show more',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.menu({
          container,
          attribute: 'categories',
          limit: 3,
          showMore: true,
        }),
      ]);
    })
  )
  .add(
    'with show more and showMoreLimit',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.menu({
          container,
          attribute: 'categories',
          limit: 3,
          showMore: true,
          showMoreLimit: 6,
        }),
      ]);
    })
  )
  .add(
    'with show more and templates',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.menu({
          container,
          attribute: 'categories',
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
    'with add/remove',
    withHits(({ search, container, instantsearch }) => {
      withLifecycle(search, container, node =>
        instantsearch.widgets.menu({
          container: node,
          attribute: 'categories',
        })
      );
    })
  );
