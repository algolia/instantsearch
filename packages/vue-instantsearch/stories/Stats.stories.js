import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('Stats', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-stats />
    `,
  }))
  .add('custom rendering', () => ({
    template: `
      <ais-stats>
        <template slot-scope="{nbHits, processingTimeMS}">
          {{nbHits}} hits computed, in {{processingTimeMS}}ms 😲 Woh!
        </template>
      </ais-stats>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template slot="header">Stats</template>
        <ais-stats />
        <template slot="footer">Footer</template>
      </ais-panel>
    `,
  }));
