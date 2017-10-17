import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('TreeMenu', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: `<ais-tree-menu :attributes="['category', 'sub_category']"></ais-tree-menu>'`,
  }));
