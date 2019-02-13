<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :refine="refine"
      :createURL="state.createURL"
      :current-refinement="state.currentRefinement"
      :nb-hits="state.nbHits"
      :nb-pages="state.nbPages"
      :pages="state.pages"
      :is-first-page="state.isFirstPage"
      :is-last-page="state.isLastPage"
    >
      <ul :class="suit('list')">
        <li
          :class="{
            [suit('item')]: true,
            [suit('item', 'firstPage')]: true,
            [suit('item', 'disabled')]: state.isFirstPage,
          }"
          v-if="showFirst"
        >
          <slot
            name="first"
            :createURL="() => state.createURL(0)"
            :is-first-page="state.isFirstPage"
            :refine="() => refine(0)"
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
                aria-label="First"
              >‹‹</span>
            </template>
          </slot>
        </li>
        <li
          :class="{
            [suit('item')]: true,
            [suit('item', 'previousPage')]: true,
            [suit('item', 'disabled')]: state.isFirstPage,
          }"
          v-if="showPrevious"
        >
          <slot
            name="previous"
            :createURL="() => state.createURL(state.currentRefinement - 1)"
            :is-first-page="state.isFirstPage"
            :refine="() => refine(state.currentRefinement - 1)"
          >
            <template v-if="!state.isFirstPage">
              <a
                :class="suit('link')"
                aria-label="Previous"
                :href="state.createURL(state.currentRefinement - 1)"
                @click.prevent="refine(state.currentRefinement - 1)"
              >‹</a>
            </template>
            <template v-else>
              <span
                :class="suit('link')"
                aria-label="Previous"
              >‹</span>
            </template>
          </slot>
        </li>

        <li
          :class="{
            [suit('item')]: true,
            [suit('item', 'selected')]: state.currentRefinement === page
          }"
          v-for="page in state.pages"
          :key="page"
        >
          <slot
            name="item"
            :page="page"
            :createURL="() => state.createURL(page)"
            :is-first-page="state.isFirstPage"
            :is-last-page="state.isLastPage"
            :refine="() => refine(page)"
          >
            <a
              :class="suit('link')"
              :href="state.createURL(page)"
              @click.prevent="refine(page)"
            >{{ page + 1 }}</a>
          </slot>
        </li>

        <li
          :class="{
            [suit('item')]: true,
            [suit('item','nextPage')]: true,
            [suit('item','disabled')]: state.isLastPage
          }"
          v-if="showNext"
        >
          <slot
            name="next"
            :createURL="() => state.createURL(state.currentRefinement + 1)"
            :is-last-page="state.isLastPage"
            :refine="() => refine(state.currentRefinement + 1)"
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
              >›</span>
            </template>
          </slot>
        </li>
        <li
          :class="{
            [suit('item')]: true,
            [suit('item','lastPage')]: true,
            [suit('item','disabled')]: state.isLastPage,
          }"
          v-if="showLast"
        >
          <slot
            name="last"
            :createURL="() => state.createURL(state.nbPages - 1)"
            :is-last-page="state.isLastPage"
            :refine="() => refine(state.nbPages - 1)"
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
              >››</span>
            </template>
          </slot>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import { connectPagination } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisPagination',
  mixins: [
    createSuitMixin({ name: 'Pagination' }),
    createWidgetMixin({ connector: connectPagination }),
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
  computed: {
    widgetParams() {
      return {
        padding: this.padding,
        totalPages: this.totalPages,
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
