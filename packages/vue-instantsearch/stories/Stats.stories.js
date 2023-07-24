import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-stats', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-stats />
    `,
  }))
  .add('custom rendering', () => ({
    template: `
      <ais-stats>
        <template v-slot="{nbHits, processingTimeMS}">
          {{nbHits}} hits computed, in {{processingTimeMS}}ms 😲 Woh!
        </template>
      </ais-stats>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Stats</template>
        <ais-stats />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
