<template>
  <div
    :class="[suit(''), noRefinement && suit('','noRefinement')]"
    v-if="state"
  >
    <slot
      :refine="state.refine"
      :clear-all="state.clearAllClick"
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
              <span :class="suit('label')">{{ item.attributeName | capitalize }}: {{ item.computedLabel }}</span>
              <button
                :class="suit('delete')"
                @click="state.refine(item)"
              >✕</button>
            </span>
          </slot>
        </li>
      </ul>
      <button
        :class="suit('reset')"
        @click="state.clearAllClick()"
        v-if="refinements.length > 0"
      >
        <slot
          name="clearAllLabel"
          :items="refinements"
        >Clear all</slot>
      </button>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../mixins/component';
import { connectCurrentRefinedValues } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';

export default {
  mixins: [
    algoliaComponent,
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.refinements.length > 0,
    }),
  ],
  props: {
    clearsQuery: {
      type: Boolean,
      default: false,
    },
    excludedAttributes: {
      type: Array,
      default: () => [],
    },
    transformItems: {
      type: Function,
      default(items) {
        return items;
      },
    },
  },
  data() {
    return {
      widgetName: 'CurrentRefinements',
    };
  },
  beforeCreate() {
    this.connector = connectCurrentRefinedValues;
  },
  computed: {
    noRefinement() {
      return this.refinements.length === 0;
    },
    refinements() {
      // excludedAttributes isn't implemented in IS.js
      return this.state.refinements
        .filter(
          ({ attributeName }) =>
            this.excludedAttributes.indexOf(attributeName) === -1
        )
        .map(item => {
          if (item.type === 'query') {
            // eslint-disable-next-line no-param-reassign
            item.attributeName = 'query';
          }
          return item;
        });
    },
    widgetParams() {
      return {
        transformItems: this.transformItems,
        clearsQuery: this.clearsQuery,
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
