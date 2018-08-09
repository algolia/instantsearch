import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('SortBy', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-sort-by
        :items="[
          { name: 'instant_search', label: 'Featured' },
          { name: 'instant_search_price_asc', label: 'Price asc.' },
          { name: 'instant_search_price_desc', label: 'Price desc.' },
        ]"
      />
    `,
  }))
  .add('custom display', () => ({
    template: `
      <ais-sort-by
        :items="[
          { name: 'instant_search', label: 'Featured' },
          { name: 'instant_search_price_asc', label: 'Price asc.' },
          { name: 'instant_search_price_desc', label: 'Price desc.' },
        ]"
      >
        <ul slot-scope="{ items, refine, currentRefinement}">
          <li v-for="item in items" :key="item.value">
            <button @click="refine(item.value)">
              {{item.label}} {{currentRefinement === item.value ? '✔️' : ''}}
            </button>
          </li>
        </ul>
      </ais-sort-by>
    `,
  }));
