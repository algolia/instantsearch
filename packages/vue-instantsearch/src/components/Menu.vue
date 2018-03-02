<template>
  <div :class="bem()" v-if="show">
    <slot name="header"></slot>

    <div
      v-for="facet in facetValues"
      :key="facet.name"
      :class="facet.isRefined ? bem('item', 'active') : bem('item')"
    >
      <a
        href="#"
        :class="bem('link')"
        @click.prevent="handleClick(facet.path)"
      >
        {{facet.name}}
        <span :class="bem('count')">{{facet.count}}</span>
      </a>
    </div>

    <slot name="footer"></slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';
import { FACET_TREE } from '../store';

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
    sortBy: {
      default() {
        return ['isRefined:desc', 'count:desc', 'name:asc'];
      },
    },
  },

  computed: {
    facetValues() {
      const { data = [] } = this.searchStore.getFacetValues(
        this.attribute,
        this.sortBy
      );

      if (Array.isArray(data)) {
        return data;
      }

      return [];
    },
    show() {
      return this.facetValues.length > 0;
    },
  },

  methods: {
    handleClick(path) {
      this.searchStore.toggleFacetRefinement(this.attribute, path);
    },
  },

  data() {
    return {
      blockClassName: 'ais-menu',
    };
  },

  created() {
    this.searchStore.stop();
    this.searchStore.maxValuesPerFacet = this.limit;
    this.searchStore.addFacet(
      {
        name: this.attribute,
        attributes: [this.attribute],
      },
      FACET_TREE
    );
    this.searchStore.start();
    this.searchStore.refresh();
  },

  destroyed() {
    this.searchStore.stop();
    this.searchStore.removeFacet(this.attribute);
    this.searchStore.start();
  },
};
</script>
