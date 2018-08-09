import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('TreeMenu', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `<ais-tree-menu :attributes="['category', 'sub_category']"></ais-tree-menu>'`,
  }));
