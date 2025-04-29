import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-refinement-list', module)
  .addDecorator(previewWrapper({ filters: '' }))
  .add('default', () => ({
    template: `
      <ais-refinement-list attribute="brand" />
    `,
  }))
  .add('with searchbox', () => ({
    template: `
      <ais-refinement-list
        attribute="brand"
        searchable
      />
    `,
  }))
  .add('with show more', () => ({
    template: `
      <ais-refinement-list
        attribute="brand"
        show-more
      />
    `,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-refinement-list
        attribute="brand"
        :transform-items="transformItems"
      />
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
  .add('item custom rendering', () => ({
    template: `
    <ais-refinement-list attribute="brand">
      <template v-slot:item="{item, refine}">
        <button
          @click="refine(item.value)"
        >
          {{item.isRefined ? '☑️ ' : ''}}{{item.value}}
        </button>
      </template>
    </ais-refinement-list>`,
  }))
  .add('full custom rendering', () => ({
    template: `
    <ais-refinement-list attribute="brand" searchable show-more>
      <template v-slot="{
        items,
        refine,
        searchForItems,
        toggleShowMore,
        isShowingMore
      }">
        <input @input="searchForItems($event.target.value)"/>
        <button
          v-for="item in items"
          :key="item.value"
          @click="refine(item.value)"
          style="font: inherit"
        >
          {{item.isRefined ? '☑️ ' : ''}}
          <span v-html="item.highlighted"></span>
        </button>
        <!-- this gets undefined when searching? -->
        <button @click="toggleShowMore">
          Show {{isShowingMore ? 'less' : 'more'}}
        </button>
      </template>
    </ais-refinement-list>`,
  }));
