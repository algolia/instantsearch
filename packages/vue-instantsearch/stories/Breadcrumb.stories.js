import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

const attributes = [
  'hierarchicalCategories.lvl0',
  'hierarchicalCategories.lvl1',
  'hierarchicalCategories.lvl2',
];

storiesOf('ais-breadcrumb', module)
  .addDecorator(
    previewWrapper({
      filters: `
        <ais-hierarchical-menu
          :attributes="[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]"
        />
      `,
    })
  )
  .add('default', () => ({
    template: `
      <ais-breadcrumb :attributes="attributes" />
    `,
    data: () => ({
      attributes,
    }),
  }))
  .add('with a custom root label', () => ({
    template: `
      <ais-breadcrumb :attributes="attributes">
        <template v-slot:rootLabel>Home Page</template>
      </ais-breadcrumb>
    `,
    data: () => ({
      attributes,
    }),
  }))
  .add('with a custom separator', () => ({
    template: `
      <ais-breadcrumb :attributes="attributes">
        <template v-slot:separator>~</template>
      </ais-breadcrumb>
    `,
    data: () => ({
      attributes,
    }),
  }))
  .add('with a transform items', () => ({
    template: `
      <ais-breadcrumb
        :attributes="attributes"
        :transformItems="transformItems"
      >
        <template v-slot:rootLabel>HOME</template>
      </ais-breadcrumb>
    `,
    data: () => ({
      attributes,
    }),
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
      <ais-breadcrumb :attributes="attributes">
        <template v-slot="{ items, refine, createURL }">
          <ul>
            <li>
              <a
                v-if="Boolean(items.length)"
                :href="createURL()"
                @click.prevent="refine()"
              >
                Home
              </a>
              <span v-else>
                Home
              </span>
            </li>
            <li
              v-for="(item, index) in items"
              :key="item.label"
            >
              <a
                :href="createURL(item.value)"
                @click.prevent="refine(item.value)"
              >
                <component :is="index === items.length -1 ? 'strong' : 'span'">
                  {{ item.label }}
                </component>
              </a>
            </li>
          </ul>
        </template>
      </ais-breadcrumb>
    `,
    data: () => ({
      attributes,
    }),
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Breadcrumb</template>
        <ais-breadcrumb :attributes="attributes" />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
    data: () => ({
      attributes,
    }),
  }));
