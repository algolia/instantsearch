import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('NoResults', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `<ais-no-results ref="child"></ais-no-results>`,
    mounted() {
      this.$refs.child.searchStore.query = 'no results for this';
    },
  }))
  .add('custom rendering', () => ({
    template: `<ais-no-results ref="child">
      <span slot-scope="{query}">no results for "{{query}}"</span>
    </ais-no-results>`,
    mounted() {
      this.$refs.child.searchStore.query = 'no results for this';
    },
  }));
