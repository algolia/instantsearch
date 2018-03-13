<template>
  <div :class="bem()" v-if="show">

    <slot name="header"></slot>

    <div v-for="facet in facetValues" :key="facet.name" :class="facet.isRefined ? bem('item', 'active') : bem('item')">
      <label :class="bem('label')">
        <input type="checkbox"
               :class="bem('checkbox')"
               v-model="facet.isRefined"
               @change="toggleRefinement(facet)"
               :value="facet.name"
        >

        <slot :count="facet.count" :active="facet.isRefined" :value="facet.name">
          <span :class="bem('value')">{{facet.name}}</span>
          <span :class="bem('count')">{{facet.count}}</span>
        </slot>
      </label>
    </div>

    <slot name="footer"></slot>

  </div>
</template>

<script>
import { FACET_OR, FACET_AND } from '../store';
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {
    attributeName: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      default: FACET_OR,
      validator(rawValue) {
        const value = rawValue.toLowerCase();

        return value === FACET_OR || value === FACET_AND;
      },
    },
    limit: {
      type: Number,
      default: 10,
    },
    sortBy: {
      default() {
        return ['isRefined:desc', 'count:desc', 'name:asc'];
      },
    },
  },
  data() {
    return {
      blockClassName: 'ais-refinement-list',
    };
  },
  created() {
    this.searchStore.addFacet(this.attributeName, this.operator);
  },
  destroyed() {
    this.searchStore.stop();
    this.searchStore.removeFacet(this.attributeName);
    this.searchStore.start();
  },
  computed: {
    facetValues() {
      return this.searchStore.getFacetValues(
        this.attributeName,
        this.sortBy,
        this.limit
      );
    },
    show() {
      return this.facetValues.length > 0;
    },
  },
  methods: {
    toggleRefinement(value) {
      return this.searchStore.toggleFacetRefinement(
        this.attributeName,
        value.name
      );
    },
  },
  watch: {
    operator() {
      this.searchStore.addFacet(this.attributeName, this.operator);
    },
  },
};</script>
