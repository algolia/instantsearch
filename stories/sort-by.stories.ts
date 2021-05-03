import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';

storiesOf('Sorting/SortBy', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.sortBy({
          container,
          items: [
            { value: 'instant_search', label: 'Most relevant' },
            { value: 'instant_search_price_asc', label: 'Lowest price' },
            { value: 'instant_search_price_desc', label: 'Highest price' },
          ],
        }),
      ]);
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.sortBy({
          container,
          items: [
            { value: 'instant_search', label: 'Most relevant' },
            { value: 'instant_search_price_asc', label: 'Lowest price' },
            { value: 'instant_search_price_desc', label: 'Highest price' },
          ],
          transformItems: items =>
            items.map(item => ({
              ...item,
              label: item.label.toUpperCase(),
            })),
        }),
      ]);
    })
  )
  .add(
    'with add/remove',
    withHits(({ search, container, instantsearch }) => {
      withLifecycle(search, container, node =>
        instantsearch.widgets.sortBy({
          container: node,
          items: [
            { value: 'instant_search', label: 'Most relevant' },
            { value: 'instant_search_price_asc', label: 'Lowest price' },
            { value: 'instant_search_price_desc', label: 'Highest price' },
          ],
        })
      );
    })
  );
