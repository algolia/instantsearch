import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('Breadcrumb', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `<div>hello</div>`,
  }));
