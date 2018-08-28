<template>
  <div
    :class="[suit(''), !canRefine && suit('', 'noRefinement')]"
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
import algoliaComponent from '../component';
import { connectMenu } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      required: false,
      default: 10,
    },
    sortBy: {
      type: [Array, Function],
      required: false,
      default() {
        return ['name:asc'];
      },
    },
    label: {
      type: String,
      required: false,
      default: 'See all',
    },
  },
  data() {
    return {
      widgetName: 'MenuSelect',
    };
  },
  beforeCreate() {
    this.connector = connectMenu;
  },
  computed: {
    widgetParams() {
      return {
        attributeName: this.attribute,
        limit: this.limit,
        sortBy: this.sortBy,
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
