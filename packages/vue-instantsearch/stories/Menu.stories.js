import {
  withKnobs,
  object,
  text,
  number,
  boolean,
} from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-menu', module)
  .addDecorator(previewWrapper())
  .addDecorator(withKnobs)
  .add('default', () => ({
    template: `
      <ais-menu attribute="categories" />
    `,
  }))
  .add('with show more', () => ({
    template: `
      <ais-menu
        attribute="categories"
        :limit="2"
        :showMoreLimit="5"
        :show-more="true"
      />
    `,
  }))
  .add('with custom label', () => ({
    template: `
      <ais-menu attribute="categories" :limit="2" :showMoreLimit="5" :show-more="true">
        <template v-slot:showMoreLabel="{ isShowingMore }">
          {{isShowingMore ? 'View less' : 'View more'}}
        </template>
      </ais-menu>
    `,
  }))
  .add('with a different sort', () => ({
    template: `
      <ais-menu attribute="categories" :sort-by="['isRefined:desc', 'name:asc']" />
    `,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-menu attribute="categories" :transform-items="transformItems" />
    `,
    methods: {
      transformItems(items) {
        return items.map((item) =>
          Object.assign(item, {
            label: item.label.toLocaleUpperCase(),
          })
        );
      },
    },
  }))
  .add('with a custom render', () => ({
    template: `
    <ais-menu attribute="categories">
      <template v-slot="{ items, createURL, refine }">
        <ol>
          <li
            v-for="item in items"
            :key="item.value"
          >
            <component :is="item.isRefined ? 'strong' : 'span'">
              <a
                :href="createURL(item.value)"
                @click.prevent="refine(item.value)"
              >
                {{item.label}} - {{item.count}}
              </a>
            </component>
          </li>
        </ol>
      </template>
    </ais-menu>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Menu</template>
        <ais-menu attribute="categories" />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }))
  .add('playground', () => ({
    template: `
      <ais-menu
        :attribute="attribute"
        :class-names="classNames"
        :limit="limit"
        :show-more="showMore"
        :show-more-limit="showMoreLimit"
      />
    `,
    data() {
      return {
        attribute: text('attribute', 'categories'),
        classNames: object('class-names', {}),
        limit: number('limit', 10),
        showMore: boolean('show-More', false),
        showMoreLimit: number('show-More-Limit', 20),
      };
    },
  }));
