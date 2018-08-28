<template>
  <div
    v-if="state"
    :class="suit('')"
  >
    <slot
      :refine="refine"
      :createURL="state.createURL"
      :currentRefinement="state.currentRefinement"
      :nbHits="state.nbHits"
      :nbPages="state.nbPages"
      :pages="state.pages"
      :isFirstPage="state.isFirstPage"
      :isLastPage="state.isLastPage"
    >
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
              @click.prevent="refine(0)"
            >‹‹</a>
          </template>
          <template v-else>
            <span
              :class="suit('link')"
              aria-label="Previous"
            >
              ‹‹
            </span>
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
              @click.prevent="refine(state.currentRefinement - 1)"
            >
              ‹
            </a>
          </template>
          <template v-else>
            <span
              :class="suit('link')"
              aria-label="Previous"
            >
              ‹
            </span>
          </template>
        </li>

        <li
          :class="{
            [suit('item')]:true,
            [suit('item', 'selected')]: state.currentRefinement === page
          }"
          v-for="page in state.pages"
          :key="page"
        >
          <a
            :class="suit('link')"
            :href="state.createURL(page)"
            @click.prevent="refine(page)"
          >
            {{ page + 1 }}
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
              @click.prevent="refine(state.currentRefinement + 1)"
            >›</a>
          </template>
          <template v-else>
            <span
              :class="suit('link')"
              aria-label="Next"
            >
              ›
            </span>
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
              @click.prevent="refine(state.nbPages - 1)"
            >››</a>
          </template>
          <template v-else>
            <span
              :class="suit('link')"
              aria-label="Last"
            >
              ››
            </span>
          </template>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import { connectPagination } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../panel';
import algoliaComponent from '../component';

export default {
  mixins: [
    algoliaComponent,
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.nbPages > 1,
    }),
  ],
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
      default: undefined,
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
        maxPages: this.totalPages,
      };
    },
  },
  methods: {
    refine(page) {
      const p = Math.min(Math.max(page, 0), this.state.nbPages - 1);
      this.state.refine(p);
      // @TODO: do this in a general way
      this.$emit('page-change', p);
    },
  },
};
</script>
