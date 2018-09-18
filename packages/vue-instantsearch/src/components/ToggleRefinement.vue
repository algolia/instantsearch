<template>
  <div
    v-if="state"
    :class="[suit(), !canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :value="state.value"
      :can-refine="canRefine"
      :refine="state.refine"
      :createURL="state.createURL"
    >
      <label :class="suit('label')">
        <input
          :class="suit('checkbox')"
          type="checkbox"
          :name="state.value.name"
          :value="on"
          :checked="state.value.isRefined"
          @change="state.refine(state.value)"
        >
        <span :class="suit('labelText')">
          {{ state.value.name }}
        </span>
        <span
          v-if="state.value.count !== null"
          :class="suit('count')"
        >
          {{ state.value.count.toLocaleString() }}
        </span>
      </label>
    </slot>
  </div>
</template>

<script>
import { connectToggle } from 'instantsearch.js/es/connectors';
import algoliaComponent from '../mixins/component';
import { createPanelConsumerMixin } from '../mixins/panel';

const mapStateToCanRefine = state => Boolean(state.value.count);

export default {
  mixins: [
    algoliaComponent,
    createPanelConsumerMixin({
      mapStateToCanRefine,
    }),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    on: {
      type: [String, Number, Boolean],
      required: false,
      default: true,
    },
    off: {
      type: [String, Number, Boolean],
      required: false,
      // explicit otherwise Vue coerces the default value
      // to false because of the `Boolean` prop type
      default: undefined,
    },
  },
  data() {
    return {
      widgetName: 'ToggleRefinement',
    };
  },
  beforeCreate() {
    this.connector = connectToggle;
  },
  computed: {
    widgetParams() {
      return {
        attributeName: this.attribute,
        label: this.label,
        values: {
          on: this.on,
          off: this.off,
        },
      };
    },
    canRefine() {
      return mapStateToCanRefine(this.state);
    },
  },
};
</script>
