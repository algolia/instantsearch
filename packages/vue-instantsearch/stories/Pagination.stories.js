import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Pagination', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-pagination></ais-pagination>',
  }))
  .add('custom rendering', () => ({
    template: `<ais-pagination>
      <span slot="first">first</span>
      <span slot="previous">previous</span>
      <span slot="next">next</span>
      <span slot="last">last</span>
    </ais-pagination>`,
  }));
