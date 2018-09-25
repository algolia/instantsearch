<template>
  <div
    :class="[suit(), !canRefine && suit('', 'noRefinement')]"
    v-if="state"
  >
    <slot
      :items="items"
      :can-refine="canRefine"
      :refine="refine"
    >
      <select
        :class="suit('select')"
        @change="refine($event.currentTarget.value)"
      >
        <option
          :class="suit('option')"
          value=""
        >
          {{ label }}
        </option>
        <option
          v-for="item in items"
          :key="item.value"
          :class="suit('option')"
          :value="item.value"
          :selected="item.isRefined"
        >
          {{ item.label }} ({{ item.count }})
        </option>
      </select>
    </slot>
  </div>
</template>

<script>
import { connectMenu } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisMenuSelect',
  mixins: [
    createSuitMixin({ name: 'MenuSelect' }),
    createWidgetMixin({ connector: connectMenu }),
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.canRefine,
    }),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      default: 10,
    },
    sortBy: {
      type: [Array, Function],
      default() {
        return ['name:asc'];
      },
    },
    label: {
      type: String,
      default: 'See all',
    },
    transformItems: {
      type: Function,
      default(items) {
        return items;
      },
    },
  },
  computed: {
    widgetParams() {
      return {
        attributeName: this.attribute,
        limit: this.limit,
        sortBy: this.sortBy,
        transformItems: this.transformItems,
      };
    },
    items() {
      return this.state.items;
    },
    canRefine() {
      return this.state.canRefine;
    },
  },
  methods: {
    refine(value) {
      this.state.refine(value);
    },
  },
};
</script>
