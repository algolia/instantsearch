import { defaultSearchStore } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('SearchBox', module)
  .add('default', () => ({
    template: '<ais-search-box :search-store="searchStore"></ais-search-box>',
    data() {
      return {
        searchStore: defaultSearchStore(),
      };
    },
  }))
  .add('with default query', () => ({
    template: '<ais-search-box :search-store="searchStore"></ais-search-box>',
    data() {
      const searchStore = defaultSearchStore();
      searchStore.query = 'battery';

      return {
        searchStore,
      };
    },
  }));
