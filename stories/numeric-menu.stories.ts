import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import { numericMenu } from '../src/widgets';

storiesOf('Refinements/NumericMenu', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      search.addWidgets([
        numericMenu({
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
    withHits(({ search, container }) => {
      search.addWidgets([
        numericMenu({
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
          transformItems: items =>
            items.map(item => ({
              ...item,
              label: `${item.label} (transformed)`,
            })),
        }),
      ]);
    })
  );
