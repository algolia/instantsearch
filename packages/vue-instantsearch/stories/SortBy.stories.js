import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-sort-by', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-sort-by
        :items="[
          { value: 'instant_search', label: 'Featured' },
          { value: 'instant_search_price_asc', label: 'Price asc.' },
          { value: 'instant_search_price_desc', label: 'Price desc.' },
        ]"
      />
    `,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-sort-by
        :items="[
          { value: 'instant_search', label: 'Featured' },
          { value: 'instant_search_price_asc', label: 'Price asc.' },
          { value: 'instant_search_price_desc', label: 'Price desc.' },
        ]"
        :transform-items="transformItems"
      />
    `,
    methods: {
      transformItems(items) {
        return items.map((item) =>
          Object.assign({}, item, {
            label: item.label.toUpperCase(),
          })
        );
      },
    },
  }))
  .add('with custom render', () => ({
    template: `
      <ais-sort-by
        :items="[
          { value: 'instant_search', label: 'Featured' },
          { value: 'instant_search_price_asc', label: 'Price asc.' },
          { value: 'instant_search_price_desc', label: 'Price desc.' },
        ]"
      >
        <template v-slot="{ items, refine, currentRefinement}">
          <ul>
            <li v-for="item in items" :key="item.value">
              <button @click="refine(item.value)">
                {{item.label}} {{currentRefinement === item.value ? '✔️' : ''}}
              </button>
            </li>
          </ul>
        </template>
      </ais-sort-by>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Sort By</template>
        <ais-sort-by
          :items="[
            { value: 'instant_search', label: 'Featured' },
            { value: 'instant_search_price_asc', label: 'Price asc.' },
            { value: 'instant_search_price_desc', label: 'Price desc.' },
          ]"
        />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
