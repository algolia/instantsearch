import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

const attributes = [
  'hierarchicalCategories.lvl0',
  'hierarchicalCategories.lvl1',
  'hierarchicalCategories.lvl2',
];

storiesOf('Breadcrumb', module)
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
        <template slot="rootLabel">Home Page</template>
      </ais-breadcrumb>
    `,
    data: () => ({
      attributes,
    }),
  }))
  .add('with a custom separator', () => ({
    template: `
      <ais-breadcrumb :attributes="attributes">
        <template slot="separator" slot-scope="_">~</template>
      </ais-breadcrumb>
    `,
    data: () => ({
      attributes,
    }),
  }))
  .add('with a custom render', () => ({
    template: `
      <ais-breadcrumb :attributes="attributes">
        <ul slot-scope="{ items, refine, createURL }">
          <li
            v-for="(item, index) in items"
            :key="item.name"
            :style="{ fontWeight: index === items.length -1 ? 600 : 400 }"
          >
            <a
              :href="createURL(item.value)"
              @click.prevent="refine(item.value)"
            >
              {{ item.name }}
            </a>
          </li>
        </ul>
      </ais-breadcrumb>
    `,
    data: () => ({
      attributes,
    }),
  }));
