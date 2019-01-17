<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot :items="items">
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
          >objectID: {{ item.objectID }}, index: {{ itemIndex }}</slot>
        </li>
      </ol>
    </slot>
  </div>
</template>

<script>
import { connectHits } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisHits',
  mixins: [
    createWidgetMixin({ connector: connectHits }),
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
        escapeHits: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
};
</script>
