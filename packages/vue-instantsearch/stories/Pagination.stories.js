import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Pagination', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-pagination></ais-pagination>',
  }));
