<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="state.items"
      :can-refine="state.canRefine"
      :can-toggle-show-more="state.canToggleShowMore"
      :is-showing-more="state.isShowingMore"
      :refine="state.refine"
      :createURL="state.createURL"
      :toggle-show-more="state.toggleShowMore"
    >
      <ul :class="suit('list')">
        <li
          v-for="item in state.items"
          :key="item.value"
          :class="[suit('item'), item.isRefined && suit('item', 'selected')]"
        >
          <a
            :href="state.createURL(item.value)"
            :class="suit('link')"
            @click.prevent="state.refine(item.value)"
          >
            <span :class="suit('label')">{{ item.label }}</span>
            <span :class="suit('count')">{{ item.count }}</span>
          </a>
        </li>
      </ul>

      <button
        v-if="showShowMoreButton"
        :class="[suit('showMore'), !state.canToggleShowMore && suit('showMore', 'disabled')]"
        :disabled="!state.canToggleShowMore"
        @click.prevent="state.toggleShowMore()"
      >
        <slot
          name="showMoreLabel"
          :is-showing-more="state.isShowingMore"
        >{{ state.isShowingMore ? 'Show less' : 'Show more' }}</slot>
      </button>
    </slot>
  </div>
</template>

<script>
import { connectMenu } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisMenu',
  mixins: [
    createSuitMixin({ name: 'Menu' }),
    createWidgetMixin({ connector: connectMenu }),
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.canRefine,
    }),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    // TODO: implement searchable in connector
    // searchable: {
    //   type: Boolean,
    //   default: false,
    // },
    limit: {
      type: Number,
      default: 10,
    },
    showMoreLimit: {
      type: Number,
      default: 20,
    },
    showMore: {
      type: Boolean,
      default: false,
    },
    sortBy: {
      type: [Array, Function],
      default() {
        return ['count:desc', 'name:asc'];
      },
    },
    transformItems: {
      type: Function,
      default(items) {
        return items;
      },
    },
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        limit: this.limit,
        showMore: this.showMore,
        showMoreLimit: this.showMoreLimit,
        sortBy: this.sortBy,
        transformItems: this.transformItems,
      };
    },
    showShowMoreButton() {
      return this.state.canRefine && this.showMore;
    },
  },
};
</script>
