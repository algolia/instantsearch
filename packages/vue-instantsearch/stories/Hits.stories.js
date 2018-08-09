import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('Hits', module)
  .addDecorator(previewWrapper())
  .add('simple usage', () => ({
    template: `<ais-hits></ais-hits>`,
  }))
  .add('custom rendering', () => ({
    template: `
    <ais-hits>
      <div slot="item" slot-scope="{ item }">
        <marquee>before one</marquee>
        <h2>{{item.name}}</h2>
        <small>{{item.description}}</small>
      </div>
    </ais-hits>
  `,
  }))
  .add('custom rendering (all)', () => ({
    template: `
    <ais-hits>
      <div slot-scope="{ items }">
        <marquee>before everything</marquee>
        <div
          v-for="(item, itemIndex) in items"
          :key="itemIndex"
        >
          custom objectID: {{item.objectID}}
        </div>
      </div>
    </ais-hits>`,
  }));
