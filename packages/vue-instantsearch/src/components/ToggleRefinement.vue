<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :value="state.value"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :createURL="state.createURL"
      :send-event="state.sendEvent"
    >
      <label :class="suit('label')">
        <input
          :class="suit('checkbox')"
          type="checkbox"
          :name="state.value.name"
          :value="on"
          :checked="state.value.isRefined"
          @change="state.refine(state.value)"
        />
        <span :class="suit('labelText')">{{ label }}</span>
        <span v-if="state.value.count !== null" :class="suit('count')">{{
          state.value.count.toLocaleString()
        }}</span>
      </label>
    </slot>
  </div>
</template>

<script>
import { connectToggleRefinement } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from '../mixins/widget';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisToggleRefinement',
  mixins: [
    createSuitMixin({ name: 'ToggleRefinement' }),
    createWidgetMixin(
      {
        connector: connectToggleRefinement,
      },
      {
        $$widgetType: 'ais.toggleRefinement',
      }
    ),
    createPanelConsumerMixin(),
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
      type: [String, Number, Boolean, Array],
      required: false,
      default: true,
    },
    off: {
      type: [String, Number, Boolean, Array],
      required: false,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        label: this.label,
        on: this.on,
        off: this.off,
      };
    },
  },
};
</script>
