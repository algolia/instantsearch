import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-hits-per-page', module)
  .addDecorator(
    previewWrapper({
      filters: '',
    })
  )
  .add('default', () => ({
    template: `
      <ais-hits-per-page
        :items="[
          { label: '3 results', value: 3, default: true },
          { label: '6 results', value: 6 }
        ]"
      />
    `,
  }))
  .add('with different default', () => ({
    template: `
      <ais-hits-per-page
        :items="[
          { label: '3 results', value: 3 },
          { label: '6 results', value: 6, default: true }
        ]"
      />
    `,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-hits-per-page
        :items="[
          { label: '3 results', value: 3, default: true },
          { label: '6 results', value: 6 }
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
  .add('with a custom render', () => ({
    template: `
      <ais-hits-per-page
        :items="[
          { label: '3 results', value: 3, default: true },
          { label: '6 results', value: 6 }
        ]"
      >
        <template v-slot="{ items, refine }">
          <div>
            <label
              v-for="(item, itemIndex) in items"
              @change="refine(item.value)"
            >
              <input
                type="radio"
                :checked="item.isRefined"
              >
              {{item.label}}
            </label>
          </div>
        </template>
      </ais-hits-per-page>`,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Hits per page</template>
        <ais-hits-per-page
          :items="[
            { label: '3 results', value: 3, default: true },
            { label: '6 results', value: 6 }
          ]"
        />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
