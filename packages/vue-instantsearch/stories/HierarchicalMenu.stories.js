import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-hierarchical-menu', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-hierarchical-menu
        :attributes="[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]"
      />
    `,
  }))
  .add('with show more', () => ({
    template: `
      <ais-hierarchical-menu
        :attributes="[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]"
        :limit="2"
        :show-more-limit="5"
        :show-more="true"
      />
    `,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-hierarchical-menu
        :attributes="[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]"
        :transform-items="transformItems"
      />
    `,
    methods: {
      transformItems(items) {
        return items.map((item) =>
          Object.assign({}, item, {
            label: item.label.toUpperCase(),
            data: item.data ? this.transformItems(item.data) : item.data,
          })
        );
      },
    },
  }))
  .add('with a custom label', () => ({
    template: `
      <ais-hierarchical-menu
        :attributes="[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]"
        :limit="2"
        :show-more-limit="5"
        :showMore="true"
      >
        <template v-slot:showMoreLabel="{ isShowingMore }">
          {{ isShowingMore ? 'View less' : 'View more' }}
        </template>
      </ais-hierarchical-menu>
    `,
  }))
  .add('with a different sort', () => ({
    template: `
      <ais-hierarchical-menu
        :attributes="[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]"
        :sort-by="['isRefined:desc', 'name:asc']"
      />
    `,
  }))
  .add('with a custom render', () => ({
    template: `
      <ais-hierarchical-menu
        :attributes="[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]"
      >
        <template v-slot="{ items, refine, createURL }">
          <ol>
            <li
              v-for="item in items"
              :key="item.value"
              :style="{ fontWeight: item.isRefined ? 600 : 400 }"
            >
              <a
                :href="createURL(item.value)"
                @click.prevent="refine(item.value)"
              >
                {{item.label}} - {{item.count}}
              </a>
              <ol v-if="item.data">
                <li
                  v-for="child in item.data"
                  :key="child.value"
                  :style="{ fontWeight: child.isRefined ? 600 : 400 }"
                >
                  <a
                    :href="createURL(child.value)"
                    @click.prevent="refine(child.value)"
                  >
                    {{child.label}} - {{child.count}}
                  </a>
                  <ol v-if="child.data">
                    <li
                      v-for="subchild in child.data"
                      :key="subchild.value"
                      :style="{ fontWeight: subchild.isRefined ? 600 : 400 }"
                    >
                      <a
                        :href="createURL(subchild.value)"
                        @click.prevent="refine(subchild.value)"
                      >
                        {{subchild.label}} - {{subchild.count}}
                      </a>
                    </li>
                  </ol>
                </li>
              </ol>
            </li>
          </ol>
        </template>
      </ais-hierarchical-menu>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Hierarchical Menu</template>
        <ais-hierarchical-menu
          :attributes="[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]"
        />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
