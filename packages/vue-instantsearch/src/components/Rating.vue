<template>
  <div :class="bem()" v-if="show">
    <slot name="header"></slot>

    <a href="#" @click.prevent="clear" :class="bem('clear')" v-if="currentValue">
      <slot name="clear">Clear</slot>
    </a>

    <div v-for="(facet, key) in facetValues" :key="key" :class="[bem('item'), facet.isRefined ? bem('item', 'active') : '']" >
      <a href="#" @click.prevent="toggleRefinement(facet)">
        <slot :value="facet.value"
              :min="min"
              :max="max"
              :count="facet.count"
        >
          <template v-for="n in max">
            <span v-if="n <= facet.value" :class="bem('star')" :key="n">&#9733;</span>
            <span v-else :class="bem('star', 'empty')" :key="n">&#9734;</span>
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
import { FACET_OR } from '../store';
import algoliaComponent from '../component';

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
  created() {
    this.searchStore.addFacet(this.attributeName, FACET_OR);
  },
  destroyed() {
    this.searchStore.stop();
    this.searchStore.removeFacet(this.attributeName);
    this.searchStore.start();
  },
  computed: {
    show() {
      for (const value in this.facetValues) {
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
        const name = i.toString();
        const star = {
          count: 0,
          isRefined: false,
          name,
          value: i,
        };

        // eslint-disable-next-line no-loop-func
        values.forEach(facetValue => {
          if (facetValue.name === name) {
            if (!isRefined && facetValue.isRefined) {
              isRefined = true;
              star.isRefined = true;
            }
          }
        });

        stars.push(star);
      }

      stars = stars.reverse();

      let count = 0;

      stars = stars.map(star => {
        const newStar = Object.assign({}, star, { count });
        values.forEach(facetValue => {
          if (facetValue.name === star.name) {
            count += facetValue.count;
            newStar.count = count;
          }
        });
        return newStar;
      });

      return stars.slice(this.min, this.max);
    },
    currentValue() {
      for (const value in this.facetValues) {
        if (this.facetValues[value].isRefined) {
          return this.facetValues[value].value;
        }
      }

      return undefined;
    },
  },
  methods: {
    toggleRefinement(facet) {
      if (facet.isRefined) {
        return this.searchStore.clearRefinements(this.attributeName);
      }

      if (facet.count === 0) {
        return undefined;
      }

      this.searchStore.stop();
      this.searchStore.clearRefinements(this.attributeName);
      for (let val = Number(facet.name); val <= this.max; ++val) {
        this.searchStore.addFacetRefinement(this.attributeName, val);
      }
      this.searchStore.start();
      this.searchStore.refresh();
      return undefined;
    },
    clear() {
      this.searchStore.clearRefinements(this.attributeName);
    },
  },
};</script>
