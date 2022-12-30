<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="state.items"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :createURL="state.createURL"
      :send-event="state.sendEvent"
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
            />
            <span :class="suit('labelText')">{{ item.label }}</span>
          </label>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import { connectNumericMenu } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisNumericMenu',
  mixins: [
    createWidgetMixin(
      {
        connector: connectNumericMenu,
      },
      {
        $$widgetType: 'ais.numericMenu',
      }
    ),
    createSuitMixin({ name: 'NumericMenu' }),
    createPanelConsumerMixin(),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        transformItems: this.transformItems,
        items: this.items,
      };
    },
  },
};
</script>
