<template>
  <ul :class="bem()" v-show="state.nbHits > 0">
    <li :class="[bem('item', 'first'), page === 1 ? bem('item', 'disabled', false) : '']">
      <a href="#" @click.prevent="goToFirstPage" :class="bem('link')">
        <slot name="first">‹‹</slot>
      </a>
    </li>
    <li :class="[bem('item', 'previous'), page === 1 ? bem('item', 'disabled', false) : '']">
      <a href="#" @click.prevent="goToPreviousPage" :class="bem('link')">
        <slot name="previous">‹</slot>
      </a>
    </li>
    <li v-for="item in pages" :key="item" :class="[bem('item'), page === item ? bem('item', 'active', false) : '']" >
      <a href="#" @click.prevent="goToPage(item)" :class="bem('link')">
        <slot :value="item + 1" :active="item === page">
          {{ item + 1 }}
        </slot>
      </a>
    </li>
    <li :class="[bem('item', 'next'), page >= totalPages ? bem('item', 'disabled', false) : '']">
      <a href="#" @click.prevent="goToNextPage" :class="bem('link')">
        <slot name="next">›</slot>
      </a>
    </li>
    <li :class="[bem('item', 'last'), page >= totalPages ? bem('item', 'disabled', false) : '']">
      <a href="#" @click.prevent="goToLastPage" :class="bem('link')">
        <slot name="last">››</slot>
      </a>
    </li>
  </ul>
</template>

<script>
import algoliaComponent from '../component';
import range from 'lodash/range';
import { connectPagination } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  props: {
    padding: {
      type: Number,
      default: 3,
      validator(value) {
        return value > 0;
      },
    },
  },
  data() {
    return {
      blockClassName: 'ais-pagination',
    };
  },
  beforeCreate() {
    this.connector = connectPagination;
  },
  computed: {
    page() {
      return this.state.currentRefinement;
    },
    totalPages() {
      return this.state.nbPages;
    },
    pages() {
      const { nbPages, currentRefinement } = this.state;

      const minDelta = currentRefinement - this.padding - 1;
      const maxDelta = currentRefinement + this.padding + 1;

      if (minDelta < 0) {
        return range(0, currentRefinement + this.padding + Math.abs(minDelta));
      }

      if (maxDelta > nbPages) {
        return range(
          currentRefinement - this.padding - (maxDelta - nbPages),
          nbPages
        );
      }

      return range(
        currentRefinement - this.padding,
        currentRefinement + this.padding + 1
      );
    },
  },
  methods: {
    goToPage(page) {
      const p = Math.min(Math.max(page, 0), this.totalPages - 1);
      this.state.refine(p);
      this.$emit('page-change', p);
    },
    goToFirstPage() {
      this.goToPage(0);
    },
    goToPreviousPage() {
      this.goToPage(this.page - 1);
    },
    goToNextPage() {
      this.goToPage(this.page + 1);
    },
    goToLastPage() {
      this.goToPage(this.totalPages - 1);
    },
  },
};</script>
