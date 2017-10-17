import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('PoweredBy', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-powered-by></ais-powered-by>',
  }));
