<template>
  <div v-if="state" :class="suit()">
    <slot
      :items="items"
      :insights="state.insights"
      :send-event="state.sendEvent"
    >
      <ol :class="suit('list')">
        <li
          v-for="(item, itemIndex) in items"
          :key="item.objectID"
          :class="suit('item')"
          @click="state.sendEvent('click:internal', item, 'Hit Clicked')"
        >
          <slot
            name="item"
            :item="item"
            :index="itemIndex"
            :insights="state.insights"
            :send-event="state.sendEvent"
          >
            objectID: {{ item.objectID }}, index: {{ itemIndex }}
          </slot>
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
    createWidgetMixin(
      {
        connector: connectHitsWithInsights,
      },
      {
        $$widgetType: 'ais.hits',
      }
    ),
    createSuitMixin({ name: 'Hits' }),
  ],
  props: {
    escapeHTML: {
      type: Boolean,
      default: true,
    },
    transformItems: {
      type: Function,
      default: undefined,
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
