<template>
  <div :class="suit()" v-if="state">
    <slot v-bind="state">
      <ul :class="suit('list')">
        <li
          :class="{
            [suit('item')]:true,
            [suit('item', 'firstPage')]: true,
            [suit('item', 'disabled')]: state.isFirstPage
          }"
        >
          <template v-if="!state.isFirstPage">
            <a
              :class="suit('link')"
              aria-label="First"
              :href="state.createURL(0)"
              @click.prevent="goToPage(0)"
            >‹‹</a>
          </template>
          <template v-else>
            <span :class="suit('link')" aria-label="Previous">‹‹</span>
          </template>
        </li>
        <li
          :class="{
            [suit('item')]: true,
            [suit('item', 'previousPage')]: true,
            [suit('item', 'disabled')]: state.isFirstPage
          }"
        >
          <template v-if="!state.isFirstPage">
            <a
              :class="suit('link')"
              aria-label="Previous"
              :href="state.createURL(state.currentRefinement - 1)"
              @click.prevent="goToPage(state.currentRefinement - 1)"
            >‹</a>
          </template>
          <template v-else>
            <span :class="suit('link')" aria-label="Previous">‹</span>
          </template>
        </li>

        <li
          :class="{
            [suit('item')]:true,
            [suit('item', 'selected')]: state.currentRefinement === page
          }"
          v-for="page in state.pages" :key="page"
        >
          <a
            :class="suit('link')"
            :href="state.createURL(page)"
            @click.prevent="goToPage(page)"
          >
            {{page + 1}}
          </a>
        </li>

        <li
          :class="{
            [suit('item')]:true,
            [suit('item','nextPage')]: true,
            [suit('item','disabled')]: state.isLastPage
          }"
        >
          <template v-if="!state.isLastPage">
            <a
              :class="suit('link')"
              aria-label="Next"
              :href="state.createURL(state.currentRefinement + 1)"
              @click.prevent="goToPage(state.currentRefinement + 1)"
            >›</a>
          </template>
          <template v-else>
            <span :class="suit('link')" aria-label="Next">›</span>
          </template>
        </li>
        <li 
          :class="{
            [suit('item')]:true,
            [suit('item','lastPage')]: true,
            [suit('item','disabled')]: state.isLastPage
          }"
        >
          <template v-if="!state.isLastPage">
            <a
              :class="suit('link')"
              aria-label="Last"
              :href="state.createURL(state.nbPages - 1)"
              @click.prevent="goToPage(state.nbPages - 1)"
            >››</a>
          </template>
          <template v-else>
            <span :class="suit('link')" aria-label="Last">››</span>
          </template>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';
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
    totalPages: {
      type: Number,
      validator(value) {
        return value > 0;
      },
    },
    showFirst: {
      type: Boolean,
      default: true,
    },
    showLast: {
      type: Boolean,
      default: true,
    },
    showNext: {
      type: Boolean,
      default: true,
    },
    showPrevious: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      widgetName: 'Pagination',
    };
  },
  beforeCreate() {
    this.connector = connectPagination;
  },
  computed: {
    widgetParams() {
      return {
        padding: this.padding,
        totalPages: this.totalPages,
      };
    },
  },
  methods: {
    goToPage(page) {
      const p = Math.min(Math.max(page, 0), this.state.nbPages - 1);
      this.state.refine(p);
      this.$emit('page-change', p);
    },
  },
};
</script>
