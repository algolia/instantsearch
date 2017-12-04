import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Clear', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-clear></ais-clear>',
  }))
  .add('custom rendering', () => ({
    template: `<ais-clear>
      <template>
        Clear search query
      </template>
    </ais-clear>`,
  }));
