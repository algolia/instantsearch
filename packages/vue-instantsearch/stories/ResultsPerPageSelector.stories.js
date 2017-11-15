import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('ResultsPerPageSelector', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-results-per-page-selector></ais-results-per-page-selector>',
  }))
  .add('with custom rendering', () => ({
    template: `<ais-results-per-page-selector>
      <template scope="{option}">{{option}} results per page</template>
    </ais-results-per-page-selector>`,
  }));
