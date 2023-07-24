import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-powered-by', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
    <div style="padding: 1em;">
      <ais-powered-by></ais-powered-by>
    </div>`,
  }))
  .add('dark', () => ({
    template: `
    <div style="background-color: black; padding: 1em;">
      <ais-powered-by theme="dark"></ais-powered-by>
    </div>`,
  }));
