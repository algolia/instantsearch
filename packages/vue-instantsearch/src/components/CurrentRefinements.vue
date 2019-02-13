<template>
  <div
    :class="[suit(), noRefinement && suit('','noRefinement')]"
    v-if="state"
  >
    <slot
      :refine="state.refine"
      :items="state.items"
      :createURL="state.createURL"
    >
      <ul :class="suit('list')">
        <li
          v-for="item in state.items"
          :key="item.attribute"
          :class="suit('item')"
        >
          <slot
            name="item"
            :refine="item.refine"
            :item="item"
            :createURL="state.createURL"
          >
            <span :class="suit('label')">{{ item.label | capitalize }}: </span>
            <span
              v-for="refinement in item.refinements"
              :key="createItemKey(refinement)"
              :class="suit('category')"
            >
              <slot
                name="refinement"
                :refine="item.refine"
                :refinement="refinement"
                :createURL="state.createURL"
              >
                <span :class="suit('categoryLabel')">
                  <q v-if="refinement.attribute === 'query'">{{ refinement.label }}</q>
                  <template v-else>
                    {{ refinement.label }}
                  </template>
                </span>
                <button
                  :class="suit('delete')"
                  @click="item.refine(refinement)"
                >
                  ✕
                </button>
              </slot>
            </span>
          </slot>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import { createWidgetMixin } from '../mixins/widget';
import { connectCurrentRefinements } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisCurrentRefinements',
  mixins: [
    createSuitMixin({ name: 'CurrentRefinements' }),
    createWidgetMixin({ connector: connectCurrentRefinements }),
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.items.length > 0,
    }),
  ],
  props: {
    // no default because included and excluded are incompatible
    // eslint-disable-next-line vue/require-default-prop
    includedAttributes: {
      type: Array,
    },
    // no default because included and excluded are incompatible
    // eslint-disable-next-line vue/require-default-prop
    excludedAttributes: {
      type: Array,
    },
    transformItems: {
      type: Function,
      default(items) {
        return items;
      },
    },
  },
  computed: {
    noRefinement() {
      return this.state && this.state.items.length === 0;
    },
    widgetParams() {
      return {
        includedAttributes: this.includedAttributes,
        excludedAttributes: this.excludedAttributes,
        transformItems: this.transformItems,
      };
    },
  },
  methods: {
    createItemKey({ attribute, value, type, operator }) {
      return [attribute, type, value, operator].join(':');
    },
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      return (
        value
          .toString()
          .charAt(0)
          .toLocaleUpperCase() + value.toString().slice(1)
      );
    },
  },
};
</script>
