import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('InfiniteHits', module)
  .addDecorator(previewWrapper())
  .add('simple usage', () => ({
    template: `<ais-infinite-hits />`,
  }))
  .add('custom rendering', () => ({
    template: `
      <ais-infinite-hits>
        <div slot-scope="{ items, isLastPage, refine }">
          <div
            v-for="(item, index) in items"
            :key="item.objectID"
          >
            {{item.name}}
          </div>

          <button
            :disabled="isLastPage"
            @click="refine"
          >
            Load more
          </button>
        </div>
      </ais-infinite-hits>
    `,
  }))
  .add('custom item rendering', () => ({
    template: `
      <ais-infinite-hits>
        <div slot="item" slot-scope="{ item, index }">
          {{item.name}} - {{index}}
        </div>
      </ais-infinite-hits>
    `,
  }))
  .add('disabled button', () => ({
    template: `
      <div>
        <ais-configure query="dsdsds" />
        <ais-infinite-hits />
      </div>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template slot="header">Infinite Hits</template>
        <ais-infinite-hits />
        <template slot="footer">Footer</template>
      </ais-panel>
    `,
  }));
