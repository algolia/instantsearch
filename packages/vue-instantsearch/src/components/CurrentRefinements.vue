<template>
  <div
    :class="[suit(), noRefinement && suit('','noRefinement')]"
    v-if="state"
  >
    <slot
      :refine="state.refine"
      :items="refinements"
    >
      <ul :class="suit('list')">
        <li
          v-for="item in refinements"
          :key="item.attributeName"
        >
          <slot
            name="item"
            :refine="state.refine"
            :item="item"
          >
            <span :class="suit('item')">
              <span :class="suit('label')">{{ item.attribute | capitalize }}: {{ item.label }}</span>
              <button
                :class="suit('delete')"
                @click="state.refine(item.value)"
              >✕</button>
            </span>
          </slot>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import { createWidgetMixin } from '../mixins/widget';
import { connectCurrentRefinedValues } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisCurrentRefinements',
  mixins: [
    createSuitMixin({ name: 'CurrentRefinements' }),
    createWidgetMixin({ connector: connectCurrentRefinedValues }),
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.refinements.length > 0,
    }),
  ],
  props: {
    includedAttributes: {
      type: Array,
      default: null,
    },
    excludedAttributes: {
      type: Array,
      default: () => ['query'],
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
      return this.refinements.length === 0;
    },
    refinements() {
      let refinements = this.state.refinements.map(item => ({
        type: item.type,
        attribute: item.type === 'query' ? 'query' : item.attributeName,
        label: item.computedLabel,
        value: item,
      }));

      if (this.includedAttributes) {
        refinements = refinements.filter(
          ({ attribute }) => this.includedAttributes.indexOf(attribute) !== -1
        );
      } else {
        refinements = refinements.filter(
          ({ attribute }) => this.excludedAttributes.indexOf(attribute) === -1
        );
      }
      return this.transformItems(refinements);
    },
    widgetParams() {
      return {
        clearsQuery:
          this.excludedAttributes.indexOf('query') === -1 &&
          (this.includedAttributes
            ? this.includedAttributes.indexOf('query') !== -1
            : true),
      };
    },
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      return (
        value
          .toString()
          .charAt(0)
          .toUpperCase() + value.toString().slice(1)
      );
    },
  },
};
</script>
