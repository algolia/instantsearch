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
        <span :class="suit('labelText')">{{ label || state.value.name }}</span>
        <span v-if="state.value.count !== null" :class="suit('count')">{{
          state.value.count.toLocaleString()
        }}</span>
      </label>
    </slot>
  </div>
</template>

<script>
import { connectToggleRefinement } from 'instantsearch.js/es/connectors';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';

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
    label: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        on: this.on,
        off: this.off,
      };
    },
  },
};
</script>
