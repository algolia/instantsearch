<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="items"
      :insights="state.insights"
    >
      <ol :class="suit('list')">
        <li
          v-for="(item, itemIndex) in items"
          :key="item.objectID"
          :class="suit('item')"
        >
          <slot
            name="item"
            :item="item"
            :index="itemIndex"
            :insights="state.insights"
          >objectID: {{ item.objectID }}, index: {{ itemIndex }}</slot>
        </li>
      </ol>
    </slot>
  </div>
</template>

<script>
import { connectHitsWithInsights } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisHits',
  mixins: [
    createWidgetMixin({ connector: connectHitsWithInsights }),
    createSuitMixin({ name: 'Hits' }),
  ],
  props: {
    escapeHTML: {
      type: Boolean,
      default: true,
    },
    transformItems: {
      type: Function,
      default(items) {
        return items;
      },
    },
  },
  computed: {
    items() {
      return this.state.hits;
    },
    widgetParams() {
      return {
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
};
</script>
