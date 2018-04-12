import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Stats', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: `<ais-stats></ais-stats>`,
  }))
  .add('custom rendering', () => ({
    template: `<ais-stats>
      <template slot-scope="{nbHits, processingTimeMS}">
        {{nbHits}} hits computed, in {{processingTimeMS}}ms 😲 Woh!
      </template>
    </ais-stats>`,
  }));
