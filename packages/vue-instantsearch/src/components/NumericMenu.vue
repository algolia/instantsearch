<template>
  <div
    v-if="state"
    :class="[suit(''), !canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="state.items"
      :can-refine="canRefine"
      :refine="state.refine"
      :createURL="state.createURL"
    >
      <ul :class="[suit('list')]">
        <li
          v-for="item in state.items"
          :key="item.label"
          :class="[suit('item'), item.isRefined && suit('item', 'selected')]"
        >
          <label :class="suit('label')">
            <input
              type="radio"
              :class="suit('radio')"
              :name="attribute"
              :value="item.value"
              :checked="item.isRefined"
              @change="state.refine($event.target.value)"
            >
            <span :class="suit('labelText')">
              {{ item.label }}
            </span>
          </label>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import { connectNumericRefinementList } from 'instantsearch.js/es/connectors';
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    // @TODO: use an external prop for common props
    transformItems: {
      type: Function,
      required: false,
      default: items => items,
    },
  },
  beforeCreate() {
    this.connector = connectNumericRefinementList;
  },
  data() {
    return {
      widgetName: 'NumericMenu',
    };
  },
  computed: {
    widgetParams() {
      return {
        attributeName: this.attribute,
        transformItems: this.transformItems,
        // @TODO: replace with spread operator
        options: this.items.map(({ label, start, end }) => {
          const next = {};

          if (label) {
            next.name = label;
          }

          if (start) {
            next.start = start;
          }

          if (end) {
            next.end = end;
          }

          return next;
        }),
      };
    },
    canRefine() {
      return !this.state.hasNoResults;
    },
  },
};
</script>
