import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Breadcrumb', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: `<div>hello</div>`,
  }));
