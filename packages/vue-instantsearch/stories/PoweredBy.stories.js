import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('PoweredBy', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: '<ais-powered-by></ais-powered-by>',
  }))
  .add('dark', () => ({
    template: `
    <div style="background-color: black; padding: 1em;">
      <ais-powered-by theme="dark"></ais-powered-by>
    </div>`,
  }));
