<template>
  <div :class="bem()" v-if="show">
    <slot name="header"></slot>

    <div
      v-for="facet in facetValues"
      :key="facet.label"
      :class="facet.isRefined ? bem('item', 'active') : bem('item')"
    >
      <a
        href="#"
        :class="bem('link')"
        @click.prevent="state.refine(facet.value)"
      >
        {{facet.label}}
        <span :class="bem('count')">{{facet.count}}</span>
      </a>
    </div>

    <slot name="footer"></slot>
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
      default: 10,
    },
    showMoreLimit: {
      type: Number,
    },
    sortBy: {
      default() {
        return ['isRefined:desc', 'count:desc', 'name:asc'];
      },
    },
  },
  computed: {
    facetValues() {
      return this.state.items;
    },
    show() {
      return this.facetValues.length > 0;
    },
    widgetParams() {
      return {
        attributeName: this.attribute,
        limit: this.limit,
        showMoreLimit: this.showMoreLimit,
        sortBy: this.sortBy,
      };
    },
  },
  data() {
    return {
      blockClassName: 'ais-menu',
    };
  },
  beforeCreate() {
    this.connector = connectMenu;
  },
};
</script>
