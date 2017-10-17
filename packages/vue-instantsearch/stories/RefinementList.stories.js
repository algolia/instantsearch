import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('RefinementList', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: `<ais-refinement-list attribute-name="materials"></ais-refinement-list>`,
  }));
