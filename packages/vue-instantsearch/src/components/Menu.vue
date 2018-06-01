<template>
  <div :class="suit()" v-if="state">
    <slot
      :items="items"
      :createURL="createURL"
      :refine="refine"
      :canRefine="canRefine"
      :widgetParams="widgetParams"
      :isShowingMore="isShowingMore"
      :toggleShowMore="toggleShowMore"
      :canToggleShowMore="canToggleShowMore"
    >
      <ul :class="suit('list')">
        <li
          v-for="item in state.items"
          :class="item.isRefined ? suit('item', 'active') : suit('item')"
          :key="item.value"
        >
          <a
            :href="state.createURL(item.value)"
            :class="suit('link')"
            @click.prevent="state.refine(item.value)"
          >
            <span :class="suit('label')">{{item.label}}</span>
            <span :class="suit('count')">{{item.count}}</span>
          </a>
        </li>
      </ul>

      <button
        v-if="showMore && state.canToggleShowMore"
        @click.prevent="state.toggleShowMore()"
        :class="state.canToggleShowMore ? suit('showMore') : suit('showMore', 'disabled')"
      >
        {{state.isShowingMore ? showLessLabel : showMoreLabel}}
      </button>
    </slot>
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
    showMore: {
      type: Boolean,
      default: false,
    },
    showMoreLimit: {
      type: Number,
    },
    sortBy: {
      default() {
        return ['isRefined:desc', 'count:desc', 'name:asc'];
      },
    },
    showMoreLabel: {
      type: String,
      default() {
        return 'Show more';
      },
    },
    showLessLabel: {
      type: String,
      default() {
        return 'Show less';
      },
    },
  },
  computed: {
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
      widgetName: 'Menu',
    };
  },
  beforeCreate() {
    this.connector = connectMenu;
  },
};</script>
