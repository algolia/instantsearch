import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-numeric-menu', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-numeric-menu
        attribute="price"
        :items="[
          { label: 'All' },
          { label: '<= 10$', end: 10 },
          { label: '10$ - 100$', start: 10, end: 100 },
          { label: '100$ - 500$', start: 100, end: 500 },
          { label: '>= 500$', start: 500 },
        ]"
      />
    `,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-numeric-menu
        attribute="price"
        :items="[
          { label: 'All' },
          { label: '<= 10$', end: 10 },
          { label: '10$ - 100$', start: 10, end: 100 },
          { label: '100$ - 500$', start: 100, end: 500 },
          { label: '>= 500$', start: 500 },
        ]"
        :transformItems="transformItems"
      />
    `,
    methods: {
      transformItems(items) {
        return items.map((item) =>
          Object.assign({}, item, { label: `👉 ${item.label}` })
        );
      },
    },
  }))
  .add('with a custom render', () => ({
    template: `
      <ais-numeric-menu
        attribute="price"
        :items="[
          { label: 'All' },
          { label: '<= 10$', end: 10 },
          { label: '10$ - 100$', start: 10, end: 100 },
          { label: '100$ - 500$', start: 100, end: 500 },
          { label: '>= 500$', start: 500 },
        ]"
      >
        <template v-slot="{ items, canRefine, refine, createURL }">
          <ul>
            <li
              v-for="item in items"
              :key="item.label"
              :style="{ fontWeight: item.isRefined ? 600 : 400 }"
            >
              <a
                :href="createURL(item.value)"
                @click.prevent="refine(item.value)"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </template>
      </ais-numeric-menu>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Numeric Menu</template>
        <ais-numeric-menu
          attribute="price"
          :items="[
            { label: 'All' },
            { label: '<= 10$', end: 10 },
            { label: '10$ - 100$', start: 10, end: 100 },
            { label: '100$ - 500$', start: 100, end: 500 },
            { label: '>= 500$', start: 500 },
          ]"
        />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
