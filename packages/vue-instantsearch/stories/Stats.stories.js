import { defaultSearchStore } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Stats', module).add('default', () => ({
  template: '<ais-stats :search-store="searchStore"></ais-stats>',
  data() {
    return {
      searchStore: defaultSearchStore(),
    };
  },
}));
