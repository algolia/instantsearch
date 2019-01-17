import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('SortBy', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.sortBy({
          container,
          items: [
            { value: 'instant_search', label: 'Most relevant' },
            { value: 'instant_search_price_asc', label: 'Lowest price' },
            { value: 'instant_search_price_desc', label: 'Highest price' },
          ],
        })
      );
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
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
        })
      );
    })
  );
