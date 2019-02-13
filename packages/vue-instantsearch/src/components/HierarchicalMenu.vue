<template>
  <div
    v-if="state"
    :class="[suit(), !canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="state.items"
      :can-refine="canRefine"
      :can-toggle-show-more="state.canToggleShowMore"
      :is-showing-more="state.isShowingMore"
      :refine="state.refine"
      :createURL="state.createURL"
      :toggle-show-more="state.toggleShowMore"
    >
      <hierarchical-menu-list
        :items="state.items"
        :level="0"
        :refine="state.refine"
        :createURL="state.createURL"
        :suit="suit"
      />

      <button
        v-if="showMore"
        :class="[
          suit('showMore'),
          !state.canToggleShowMore && suit('showMore', 'disabled')
        ]"
        :disabled="!state.canToggleShowMore"
        @click.prevent="state.toggleShowMore"
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
import { connectHierarchicalMenu } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from '../mixins/widget';
import { createPanelConsumerMixin } from '../mixins/panel';
import HierarchicalMenuList from './HierarchicalMenuList.vue';
import { createSuitMixin } from '../mixins/suit';

const mapStateToCanRefine = state => state.items.length > 0;

export default {
  name: 'AisHierarchicalMenu',
  mixins: [
    createSuitMixin({ name: 'HierarchicalMenu' }),
    createWidgetMixin({ connector: connectHierarchicalMenu }),
    createPanelConsumerMixin({
      mapStateToCanRefine,
    }),
  ],
  components: {
    HierarchicalMenuList,
  },
  props: {
    attributes: {
      type: Array,
      required: true,
    },
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
        return ['name:asc'];
      },
    },
    separator: {
      type: String,
      default: ' > ',
    },
    rootPath: {
      type: String,
      default: null,
    },
    showParentLevel: {
      type: Boolean,
      default: true,
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
        attributes: this.attributes,
        limit: this.limit,
        showMore: this.showMore,
        showMoreLimit: this.showMoreLimit,
        separator: this.separator,
        rootPath: this.rootPath,
        showParentLevel: this.showParentLevel,
        sortBy: this.sortBy,
        transformItems: this.transformItems,
      };
    },
    canRefine() {
      return mapStateToCanRefine(this.state);
    },
  },
};
</script>
