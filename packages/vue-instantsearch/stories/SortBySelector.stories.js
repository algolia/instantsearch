import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('SortBySelector', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: `<ais-sort-by-selector :indices="[
      { name: 'ikea', label: 'Featured' },
      { name: 'ikea_price_asc', label: 'Price asc.' },
      { name: 'ikea_price_desc', label: 'Price desc.' },
    ]">
    </ais-sort-by-selector>
    `,
  }));
