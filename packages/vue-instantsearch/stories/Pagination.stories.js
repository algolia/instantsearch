import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('Pagination', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: '<ais-pagination></ais-pagination>',
  }))
  .add('complete custom rendering', () => ({
    template: `
      <ais-pagination :padding="5" style="font-family: Fira Code, sans-serif">
        <span slot="first"><<-</span>
        <span slot="previous"><-</span>
        <span slot="next">-></span>
        <span slot="last">->></span>
        <span slot="default" slot-scope="{value, active}" :style="{color: active ? 'red' : 'green'}">{{value.toLocaleString()}} </span>
      </ais-pagination>`,
  }));
