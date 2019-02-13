<template>
  <div
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
    v-if="state"
  >
    <slot
      :items="state.items"
      :can-refine="state.canRefine"
      :refine="refine"
      :createURL="state.createURL"
    >
      <select
        :class="suit('select')"
        @change="refine($event.currentTarget.value)"
      >
        <option
          :class="suit('option')"
          value=""
        >
          <slot name="defaultOption">See all</slot>
        </option>
        <option
          v-for="item in state.items"
          :key="item.value"
          :class="suit('option')"
          :value="item.value"
          :selected="item.isRefined"
        >
          <slot
            name="item"
            :item="item"
          >{{ item.label }} ({{ item.count }})</slot>
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
        attribute: this.attribute,
        limit: this.limit,
        sortBy: this.sortBy,
        transformItems: this.transformItems,
      };
    },
  },
  methods: {
    refine(value) {
      this.state.refine(value);
    },
  },
};
</script>
