<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="state.items"
      :refine="state.refine"
      :hasNoResults="state.hasNoResults"
    >
      <select
        :class="suit('select')"
        v-model="selected"
        @change="handleChange"
      >
        <option
          v-for="item in state.items"
          :key="item.value"
          :class="suit('option')"
          :value="item.value"
        >{{ item.label }}</option>
      </select>
    </slot>
  </div>
</template>

<script>
import { connectHitsPerPage } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisHitsPerPage',
  mixins: [
    createSuitMixin({ name: 'HitsPerPage' }),
    createWidgetMixin({ connector: connectHitsPerPage }),
    createPanelConsumerMixin({
      mapStateToCanRefine: state => !state.hasNoResults,
    }),
  ],
  props: {
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
    transformItems: {
      type: Function,
      default(items) {
        return items;
      },
    },
  },
  data() {
    return {
      selected: this.items.find(item => item.default === true).value,
    };
  },
  computed: {
    widgetParams() {
      return {
        items: this.items,
        transformItems: this.transformItems,
      };
    },
  },
  methods: {
    handleChange() {
      this.state.refine(this.selected);
    },
  },
};
</script>
