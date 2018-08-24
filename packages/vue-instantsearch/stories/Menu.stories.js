import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('Menu', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-menu attribute="brand" />
    `,
  }))
  .add('with show more', () => ({
    template: `
      <ais-menu attribute="brand" :limit="2" :showMoreLimit="5" :show-more="true" />
    `,
  }))
  .add('with custom label', () => ({
    template: `
      <ais-menu attribute="brand" :limit="2" :showMoreLimit="5" :show-more="true">
        <template slot="showMoreLabel" slot-scope="{ isShowingMore }">
          {{isShowingMore ? 'View less' : 'View more'}}
        </template>
      </ais-menu>
    `,
  }))
  .add('with a different sort', () => ({
    template: `
      <ais-menu attribute="brand" :sort-by="['isRefined:desc', 'name:asc']" />
    `,
  }))
  .add('with a custom render', () => ({
    template: `
      <ais-menu attribute="brand">
        <ol slot-scope="{ items, createURL, refine }">
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
          </li>
        </ol>
      </ais-menu>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template slot="header">Menu</template>
        <ais-menu attribute="brand" />
        <template slot="footer">Footer</template>
      </ais-panel>
    `,
  }));
