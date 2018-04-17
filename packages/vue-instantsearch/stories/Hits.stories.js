import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Hits', module)
  .addDecorator(previewWrapper)
  .add('simple usage', () => ({
    template: `<ais-hits />`,
  }))
  .add('custom rendering', () => ({
    template: `
    <ais-hits>
      <div slot-scope="items">
        <div
          v-for="(item, itemIndex) in items"
          :key="itemIndex"
        >
          custom objectID: {{item.objectID}}
        </div>
      </div>
    </ais-hits>`,
  }));
