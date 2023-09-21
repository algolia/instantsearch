import { storiesOf } from '@storybook/html';

import { withHits } from '../.storybook/decorators';

storiesOf('Refinements/NumericMenu', module)
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
            selectedItem: 'facet-active',
          },
          transformItems: (items) =>
            items.map((item) => ({
              ...item,
              label: `${item.label} (transformed)`,
            })),
        }),
      ]);
    })
  )
  .add(
    'same start or end value',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.numericMenu({
          container,
          attribute: 'price',
          items: [
            { label: 'All' },
            { start: 1, end: 8, label: '1-8' },
            { start: 1, end: 10, label: '1-10' },
            { start: 5, end: 10, label: '5-10' },
            { start: 5, end: 8, label: '5-8' },
          ],
        }),
      ]);
    })
  );
