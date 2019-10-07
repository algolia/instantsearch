import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Refinements|NumericMenu', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.numericMenu({
          container,
          attribute: 'price',
          items: [
            { label: 'All' },
            { end: 4, label: 'less than 4' },
            { start: 4, end: 4, label: '4' },
            { start: 5, end: 10, label: 'between 5 and 10' },
            { start: 10, label: 'more than 10' },
          ],
          cssClasses: {
            item: 'facet-value',
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
        instantsearch.widgets.numericMenu({
          container,
          attribute: 'price',
          items: [
            { label: 'All' },
            { end: 4, label: 'less than 4' },
            { start: 4, end: 4, label: '4' },
            { start: 5, end: 10, label: 'between 5 and 10' },
            { start: 10, label: 'more than 10' },
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
        }),
      ]);
    })
  );
