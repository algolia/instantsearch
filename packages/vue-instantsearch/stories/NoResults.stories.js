import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('NoResults', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: `<ais-no-results ref="child"></ais-no-results>`,
    mounted() {
      this.$refs.child.searchStore.query = 'no results for this';
    },
  }));
