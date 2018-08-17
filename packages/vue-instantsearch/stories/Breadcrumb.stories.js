import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

const attributes = [
  'hierarchicalCategories.lvl0',
  'hierarchicalCategories.lvl1',
];

const hierarchicalFacets = [
  {
    name: 'hierarchicalCategories.lvl0',
    attributes,
    separator: ' > ',
  },
];

const hierarchicalFacetsRefinements = {
  'hierarchicalCategories.lvl0': [
    'TV & Home Theater > Streaming Media Players',
  ],
};

storiesOf('Breadcrumb', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <div>
        <ais-configure
          :hierarchicalFacets="hierarchicalFacets"
          :hierarchicalFacetsRefinements="hierarchicalFacetsRefinements"
        />

        <ais-breadcrumb :attributes="attributes" />
      </div>
    `,
    data: () => ({
      attributes,
      hierarchicalFacets,
      hierarchicalFacetsRefinements,
    }),
  }))
  .add('with a custom root label', () => ({
    template: `
      <div>
        <ais-configure
          :hierarchicalFacets="hierarchicalFacets"
          :hierarchicalFacetsRefinements="hierarchicalFacetsRefinements"
        />

        <ais-breadcrumb :attributes="attributes">
          <template slot="rootLabel">Home Page</template>
        </ais-breadcrumb>
      </div>
    `,
    data: () => ({
      attributes,
      hierarchicalFacets,
      hierarchicalFacetsRefinements,
    }),
  }))
  .add('with a custom separator', () => ({
    template: `
      <div>
        <ais-configure
          :hierarchicalFacets="hierarchicalFacets"
          :hierarchicalFacetsRefinements="hierarchicalFacetsRefinements"
        />

        <ais-breadcrumb :attributes="attributes">
          <template slot="separator" slot-scope="_">~</template>
        </ais-breadcrumb>
      </div>
    `,
    data: () => ({
      attributes,
      hierarchicalFacets,
      hierarchicalFacetsRefinements,
    }),
  }))
  .add('with a custom render', () => ({
    template: `
      <div>
        <ais-configure
          :hierarchicalFacets="hierarchicalFacets"
          :hierarchicalFacetsRefinements="hierarchicalFacetsRefinements"
        />

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
      </div>
    `,
    data: () => ({
      attributes,
      hierarchicalFacets,
      hierarchicalFacetsRefinements,
    }),
  }));
