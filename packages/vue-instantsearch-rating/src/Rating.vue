<template>
  <div :class="bem()" v-if="show">
    <slot name="header"></slot>

    <a href="#" @click.default="clear" :class="bem('clear')" v-if="currentValue">
      <slot name="clear">Clear</slot>
    </a>

    <div v-for="facet in facetValues" :class="[bem('item'), facet.isRefined ? bem('item', 'active') : '']" >
      <a href="#" @click.prevent="toggleRefinement(facet)">
        <slot :value="facet.value"
              :min="min"
              :max="max"
              :count="facet.count"
        >
          <template v-for="n in max">
            <span v-if="n <= facet.value" :class="bem('star')">&#9733;</span>
            <span v-else :class="bem('star', 'empty')">&#9734;</span>
          </template>
          &nbsp;&amp; up
          <span :class="bem('count')">{{facet.count}}</span>
        </slot>
      </a>
    </div>

    <slot name="footer"></slot>
  </div>
</template>

<script>
import { FACET_OR } from 'instantsearch-store';
import algoliaComponent from 'vue-instantsearch-component';

export default {
  mixins: [algoliaComponent],
  props: {
    attributeName: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      default: 1,
    },
    max: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      blockClassName: 'ais-rating',
    };
  },
  mounted() {
    this.searchStore.addFacet(this.attributeName, FACET_OR);
  },
  destroyed() {
    this.searchStore.removeFacet(this.attributeName);
  },
  computed: {
    show() {
      for (let value in this.facetValues) {
        if (this.facetValues[value].count > 0) {
          return true;
        }
      }
      return false;
    },
    facetValues() {
      const values = this.searchStore.getFacetValues(
        this.attributeName,
        ['name:asc'],
        this.max + 1
      );

      let stars = [];
      let isRefined = false;

      for (let i = 0; i <= this.max; i++) {
        let name = i.toString();
        let star = {
          count: 0,
          isRefined: false,
          name: name,
          value: i,
        };

        for (let value in values) {
          if (values[value].name === name) {
            if (!isRefined && values[value].isRefined) {
              isRefined = true;
              star.isRefined = true;
            }
          }
        }

        stars.push(star);
      }

      stars = stars.reverse();

      let count = 0;
      for (let index in stars) {
        stars[index].count = count;
        for (let value in values) {
          if (values[value].name === stars[index].name) {
            count += values[value].count;
            stars[index].count = count;
          }
        }
      }

      return stars.slice(this.min, this.max);
    },
    currentValue() {
      for (let value in this.facetValues) {
        if (this.facetValues[value].isRefined) {
          return this.facetValues[value].value;
        }
      }

      return;
    },
  },
  methods: {
    toggleRefinement(facet) {
      if (facet.isRefined) {
        return this.searchStore.clearRefinements(this.attributeName);
      }

      if (facet.count === 0) {
        return;
      }

      this.searchStore.stop();
      this.searchStore.clearRefinements(this.attributeName);
      for (let val = Number(facet.name); val <= this.max; ++val) {
        this.searchStore.addFacetRefinement(this.attributeName, val);
      }
      this.searchStore.start();
    },
    clear() {
      this.searchStore.clearRefinements(this.attributeName);
    },
  },
};
</script>
