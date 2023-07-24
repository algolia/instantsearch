import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-menu-select', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-menu-select attribute="categories" />
    `,
  }))
  .add('with a limit', () => ({
    template: `
      <ais-menu-select
        attribute="categories"
        :limit="5"
      />
    `,
  }))
  .add('with a custom sort', () => ({
    template: `
      <ais-menu-select
        attribute="categories"
        :sort-by="['name:desc']"
      />
    `,
  }))
  .add('with a custom label', () => ({
    template: `
      <ais-menu-select
        attribute="categories"
        label="None"
      />
    `,
  }))
  .add('with a custom item slot', () => ({
    template: `
      <ais-menu-select attribute="categories">
        <template v-slot:item="{ item }">
          {{ item.label }}
        </template>
      </ais-menu-select>
    `,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-menu-select
        attribute="categories"
        label="SEE ALL"
        :transformItems="transformItems"
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
  .add('with a custom rendering', () => ({
    template: `
      <ais-menu-select attribute="categories">
        <template v-slot="{ items, canRefine, refine }">
          <select
            @change="refine($event.currentTarget.value)"
            :disabled="!canRefine"
          >
            <option value="">
              All
            </option>
            <option
              v-for="item in items"
              :key="item.value"
              :value="item.value"
              :selected="item.isRefined"
            >
              {{item.label}}
            </option>
          </select>
        </template>
      </ais-menu-select>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Menu Select</template>
        <ais-menu-select attribute="categories" />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
