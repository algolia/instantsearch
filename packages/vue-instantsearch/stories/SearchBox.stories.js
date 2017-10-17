import { searchBoxWrapper, hitsWrapper, indexWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('SearchBox', module)
  .addDecorator(searchBoxWrapper)
  .addDecorator(hitsWrapper)
  .addDecorator(indexWrapper)
  .add('default', () => ({
    template: '<ais-search-box></ais-search-box>',
  }))
  .add('with default query', () => ({
    template: '<ais-search-box ref="child"></ais-search-box>',
    mounted() {
      this.$refs.child.searchStore.query = 'battery';
    },
  }));
